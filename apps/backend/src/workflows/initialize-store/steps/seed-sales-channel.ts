// src/workflows/steps/seed-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import {
  createSalesChannelsWorkflow,
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { seedProgress } from "../../../utils/initialize-store-progress"
import { IApiKeyModuleService, ISalesChannelModuleService } from "@medusajs/framework/types"

export const seedSalesChannelStep = createStep(
  "seed-sales-channel",
  async (_, { container }) => {
    await seedProgress.update(5, "ایجاد کانال فروش و کلید API")

    const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const apiKeyModule: IApiKeyModuleService = container.resolve(Modules.API_KEY)

    let salesChannels = await salesChannelModule.listSalesChannels({
      name: "Default Sales Channel",
    })
    let defaultSalesChannel = salesChannels[0]

    if (!defaultSalesChannel) {
      const { result } = await createSalesChannelsWorkflow(container).run({
        input: {
          salesChannelsData: [
            {
              name: "Default Sales Channel",
              description: "Created by Medusa",
            },
          ],
        },
      })
      defaultSalesChannel = result[0]
    }

    let publishableApiKey = (
      await apiKeyModule.listApiKeys({ type: "publishable" })
    )[0]

    if (!publishableApiKey) {
      const { result } = await createApiKeysWorkflow(container).run({
        input: {
          api_keys: [
            {
              title: "Default Publishable API Key",
              type: "publishable",
              created_by: "",
            },
          ],
        },
      })
      publishableApiKey = result[0]
    }

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    })

    return new StepResponse({
      salesChannelId: defaultSalesChannel.id,
      publishableApiKeyId: publishableApiKey.id,
    })
  }
)