// src/workflows/steps/seed-stock-location.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { createSeedProgress } from "../../../utils/initialize-store-progress"
import { IStockLocationService, Logger } from "@medusajs/framework/types"
import { Link } from "@medusajs/framework/modules-sdk"

type Input = {
  progressKey: string
}

export const seedStockLocationStep = createStep(
  "seed-stock-location",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    logger.info("Starting store stock location seeding")

    const seedProgress = createSeedProgress(container, input.progressKey)
    await seedProgress.update(45, "ایجاد انبار")

    const stockLocationModule: IStockLocationService = container.resolve(Modules.STOCK_LOCATION)
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK)

    const existing = await stockLocationModule.listStockLocations({
      name: "انبار مرکزی",
    })

    let stockLocation = existing[0]

    if (!stockLocation) {
      const { result } = await createStockLocationsWorkflow(container).run({
        input: {
          locations: [
            {
              name: "انبار مرکزی",
              address: {
                city: "تهران",
                country_code: "IR",
                address_1: "خیابان اصلی، نبش خیابان صنعت",
              },
            },
          ],
        },
      })
      stockLocation = result[0]

      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_provider_id: "manual_manual",
        },
      })
    } else {
      logger.warn(`Using existing stock location ${stockLocation.id} during store initialization`)
    }

    logger.info(`Finished store stock location seeding: ${stockLocation.id}`)
    return new StepResponse({ stockLocationId: stockLocation.id })
  }
)