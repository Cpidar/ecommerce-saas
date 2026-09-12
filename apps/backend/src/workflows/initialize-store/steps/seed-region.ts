// src/workflows/steps/seed-region.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"
import { IRegionModuleService } from "@medusajs/framework/types"

export const seedRegionStep = createStep(
  "seed-region",
  async (_, { container }) => {
    await seedProgress.update(30, "ایجاد منطقه")

    const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
    const existing = (
      await regionModule.listRegions({ currency_code: "irr" })
    )[0]

    if (existing) {
      return new StepResponse({ regionId: existing.id })
    }

    const { result } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "ایران",
            currency_code: "irr",
            countries: ["ir"],
            payment_providers: [
              "pp_system_default",
              "pp_behpardakht_behpardakht",
            ],
          },
        ],
      },
    })

    return new StepResponse({ regionId: result[0].id })
  }
)