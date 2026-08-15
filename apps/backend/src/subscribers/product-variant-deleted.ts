import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const REVALIDATION_ENDPOINT = process.env.STOREFRONT_REVALIDATION_URL ?? ""
export const REVALIDATION_SECRET = process.env.MEDUSA_WEBHOOK_SECRET ?? ""

export default async function productVariantDeletedEvent({
    event: { data: { id: variantId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Variant Deleted Event — id: ${variantId}`)

    if (!REVALIDATION_ENDPOINT) {
        logger.warn("STOREFRONT_REVALIDATION_URL is not set; skipping webhook trigger.")
        return
    }

    const productModule = container.resolve(Modules.PRODUCT)
    const variant = await productModule.retrieveProductVariant(variantId)
    const product = await productModule.retrieveProduct(variant.product_id!)

    if (!REVALIDATION_SECRET) {
        logger.warn("MEDUSA_WEBHOOK_SECRET is not set; sending webhook without secret.")
    }


    try {
        await fetch(REVALIDATION_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(REVALIDATION_SECRET
                    ? { Authorization: `Bearer ${REVALIDATION_SECRET}` }
                    : {}),
            },
            body: JSON.stringify({
                type: "product-variant.deleted",
                data: {
                    id: product.id,
                    handle: product.handle,
                },
            }),
        })
        logger.info(`[subscriber] Triggered revalidation webhook for deleted variant ${variantId}`)
    } catch (err) {
        logger.error(
            `[subscriber] Failed to trigger revalidation for deleted variant ${variantId}: ${err}`
        )
    }
}

export const config: SubscriberConfig = {
    event: "product-variant.deleted",
}
