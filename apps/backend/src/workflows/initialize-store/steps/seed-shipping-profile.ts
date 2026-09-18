// src/workflows/steps/seed-link-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { createSeedProgress } from "../../../utils/initialize-store-progress"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Logger, Query } from "@medusajs/framework/types"

type Input = {
    progressKey: string
}

export const seedShippingProfileStep = createStep(
    "seed-shipping-profile-step",
    async (input: Input, { container }) => {
        const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)
        logger.info("Starting store shipping profile lookup")
        const seedProgress = createSeedProgress(container, input.progressKey)

        await seedProgress.update(65, "اتصال کانال فروش به انبار")

        const query: Query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: shippingProfileResult } = await query.graph({
            entity: "shipping_profile",
            fields: ["id"],
        });
        const shippingProfile = shippingProfileResult[0];

        if (!shippingProfile) {
            logger.warn("No shipping profile was found while initializing the store")
        } else {
            logger.info(`Finished store shipping profile lookup: ${shippingProfile.id}`)
        }

        return new StepResponse({ shippingProfile, success: true })
    }
)