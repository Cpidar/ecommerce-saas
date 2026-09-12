// src/workflows/steps/seed-inventory.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createInventoryLevelsWorkflow } from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"
import { Query } from "@medusajs/framework/types"

type Input = {
  stockLocationId: string
}

export const seedInventoryStep = createStep(
  "seed-inventory",
  async (input: Input, { container }) => {
    await seedProgress.update(97, "ایجاد موجودی انبار")

    const query: Query = container.resolve(ContainerRegistrationKeys.QUERY)

    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    })

    if (inventoryItems.length) {
      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryItems.map((item) => ({
            location_id: input.stockLocationId,
            stocked_quantity: 500,
            inventory_item_id: item.id,
          })),
        },
      })
    }

    return new StepResponse({ success: true })
  }
)