// src/workflows/steps/seed-stock-location.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { createStockLocationsWorkflow } from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"
import { IStockLocationService } from "@medusajs/framework/types"
import { Link } from "@medusajs/framework/modules-sdk"

export const seedStockLocationStep = createStep(
  "seed-stock-location",
  async (_, { container }) => {
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
    }

    return new StepResponse({ stockLocationId: stockLocation.id })
  }
)