// src/workflows/steps/seed-region.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createRegionsWorkflow } from "@medusajs/medusa/core-flows"
import { createSeedProgress } from "../../../utils/initialize-store-progress"
import { IRegionModuleService, Logger } from "@medusajs/framework/types"

type Input = {
  progressKey: string
}

export const seedRegionStep = createStep(
  "seed-region",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    logger.info("Starting store region seeding")
    
    const seedProgress = createSeedProgress(container, input.progressKey)

    await seedProgress.update(30, "ایجاد منطقه")

    const regionModule: IRegionModuleService = container.resolve(Modules.REGION)
    const existing = (
      await regionModule.listRegions({ currency_code: "irr" })
    )[0]

    if (existing) {
      logger.warn(`Using existing region ${existing.id} during store initialization`)
      logger.info(`Finished store region seeding: ${existing.id}`)
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

    logger.info(`Finished store region seeding: ${result[0].id}`)
    return new StepResponse({ regionId: result[0].id })
  }
)