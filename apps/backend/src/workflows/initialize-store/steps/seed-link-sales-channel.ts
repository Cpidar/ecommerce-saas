// src/workflows/steps/seed-link-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"

type Input = {
  stockLocationId: string
  salesChannelId: string
}

export const seedLinkSalesChannelStep = createStep(
  "seed-link-sales-channel",
  async (input: Input, { container }) => {
    await seedProgress.update(65, "اتصال کانال فروش به انبار")

    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: input.stockLocationId,
        add: [input.salesChannelId],
      },
    })

    return new StepResponse({ success: true })
  }
)