// src/workflows/steps/seed-link-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"
import { createSeedProgress } from "../../../utils/initialize-store-progress"

type Input = {
  progressKey: string
  stockLocationId: string
  salesChannelId: string
}

export const seedLinkSalesChannelStep = createStep(
  "seed-link-sales-channel",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    logger.info(`Starting sales channel ${input.salesChannelId} link to stock location ${input.stockLocationId}`)

    const seedProgress = createSeedProgress(container, input.progressKey)
    await seedProgress.update(65, "اتصال کانال فروش به انبار")

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: input.stockLocationId,
        add: [input.salesChannelId],
      },
    })

    logger.info(`Finished sales channel ${input.salesChannelId} link to stock location ${input.stockLocationId}`)
    return new StepResponse({ success: true })
  }
)