// src/workflows/steps/seed-inventory.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { createSeedProgress } from "../../../utils/initialize-store-progress"
import { IInventoryService, Logger, Query } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

type Input = {
  progressKey: string
  stockLocationId: string
}

export const seedInventoryStep = createStep(
  "seed-inventory",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    logger.info(`Starting inventory seeding for stock location ${input.stockLocationId}`)

    const seedProgress = createSeedProgress(container, input.progressKey)
    await seedProgress.update(97, "ایجاد موجودی انبار")

    const query: Query = container.resolve(ContainerRegistrationKeys.QUERY)
    // TODO: bug: meust get item from current store
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })

    let inventoryLevelIds: string[] = []

    if (inventoryItems.length) {
      const { result: inventoryLevels } = await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map((item) => ({
            location_id: input.stockLocationId,
            stocked_quantity: 500,
            inventory_item_id: item.id,
          })),
        },
      })
      inventoryLevelIds = inventoryLevels.map((level) => level.id)
    } else {
      logger.warn("No inventory items were found while initializing the store")
    }

    logger.info(`Finished inventory seeding for stock location ${input.stockLocationId}`)
    return new StepResponse(
      { success: true },
      { inventoryLevelIds, progressKey: input.progressKey }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData?.inventoryLevelIds?.length) {
      return
    }

    const seedProgress = createSeedProgress(container, compensationData.progressKey)
    await seedProgress.fail("خطا در ایجاد موجودی انبار")

    const inventoryModule: IInventoryService = container.resolve(Modules.INVENTORY)
    await inventoryModule.deleteInventoryLevels(compensationData.inventoryLevelIds)
  }
)