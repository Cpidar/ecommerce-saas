// src/workflows/steps/seed-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  createSalesChannelsWorkflow,
  createApiKeysWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
} from "@medusajs/medusa/core-flows"
import { createSeedProgress } from "../../../utils/initialize-store-progress"
import { IApiKeyModuleService, ISalesChannelModuleService } from "@medusajs/framework/types"

type Input = {
  progressKey: string
}

export const seedSalesChannelStep = createStep(
  "seed-sales-channel",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
    logger.info("Starting store sales channel and publishable API key seeding")
    const seedProgress = createSeedProgress(container, input.progressKey)

    await seedProgress.update(5, "ایجاد کانال فروش و کلید API")

    const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const apiKeyModule: IApiKeyModuleService = container.resolve(Modules.API_KEY)

    let salesChannels = await salesChannelModule.listSalesChannels({
      name: "Default Sales Channel",
    })
    let defaultSalesChannel = salesChannels[0]
      let createdSalesChannelId: string | undefined

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
      createdSalesChannelId = defaultSalesChannel.id
    } else {
      logger.warn("Using the existing default sales channel during store initialization")
    }

    let createdPublishableApiKeyId: string | undefined
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
      createdPublishableApiKeyId = publishableApiKey.id
    } else {
      logger.warn("Using the existing publishable API key during store initialization")
    }

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: publishableApiKey.id,
        add: [defaultSalesChannel.id],
      },
    })

    logger.info(`Finished store sales channel seeding: ${defaultSalesChannel.id}`)

    return new StepResponse(
      {
        salesChannelId: defaultSalesChannel.id,
        publishableApiKeyId: publishableApiKey.id,
      },
      {
        createdSalesChannelId,
        createdPublishableApiKeyId,
        salesChannelId: defaultSalesChannel.id,
        publishableApiKeyId: publishableApiKey.id,
        progressKey: input.progressKey,
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) {
      return
    }

    const seedProgress = createSeedProgress(container, compensationData.progressKey)
    await seedProgress.fail("خطا در ایجاد کانال فروش و کلید API")

    await linkSalesChannelsToApiKeyWorkflow(container).run({
      input: {
        id: compensationData.publishableApiKeyId,
        remove: [compensationData.salesChannelId],
      },
    })

    const salesChannelModule: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL)
    const apiKeyModule: IApiKeyModuleService = container.resolve(Modules.API_KEY)

    if (compensationData.createdSalesChannelId) {
      await salesChannelModule.deleteSalesChannels([compensationData.createdSalesChannelId])
    }

    if (compensationData.createdPublishableApiKeyId) {
      await apiKeyModule.deleteApiKeys([compensationData.createdPublishableApiKeyId])
    }
  }
)