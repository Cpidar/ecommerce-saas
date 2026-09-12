// src/workflows/steps/seed-link-sales-channel.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { seedProgress } from "../../../utils/initialize-store-progress"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { Query } from "@medusajs/framework/types"

type Input = {
}

export const seedShippingProfileStep = createStep(
    "seed-link-sales-channel",
    async (input: Input, { container }) => {
        await seedProgress.update(65, "اتصال کانال فروش به انبار")

        const query: Query = container.resolve(ContainerRegistrationKeys.QUERY)

        const { data: shippingProfileResult } = await query.graph({
            entity: "shipping_profile",
            fields: ["id"],
        });
        const shippingProfile = shippingProfileResult[0];

        return new StepResponse({ shippingProfile, success: true })
    }
)