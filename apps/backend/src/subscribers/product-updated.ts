import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

const REVALIDATION_ENDPOINT = process.env.STOREFRONT_REVALIDATION_URL ?? ""
const REVALIDATION_SECRET = process.env.MEDUSA_WEBHOOK_SECRET ?? ""

export default async function productUpdatedEvent({
    event: { data: { id: productId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Updated Event — id: ${productId}`)

    if (!REVALIDATION_ENDPOINT) {
        logger.warn("STOREFRONT_REVALIDATION_URL is not set; skipping webhook trigger.")
        return
    }

    const productModule = container.resolve(Modules.PRODUCT)
    const product = await productModule.retrieveProduct(productId)

    if (!REVALIDATION_SECRET) {
        logger.warn("MEDUSA_WEBHOOK_SECRET is not set; sending webhook without secret.")
    }

    try {
        // TODO: must be true only when price change
        const affectsGrid = true
            // typeof (product as Record<string, unknown>)?.variants !== "undefined" ||
            // typeof (product as Record<string, unknown>)?.updated_at !== "undefined"

        await fetch(`${REVALIDATION_ENDPOINT}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(REVALIDATION_SECRET
                    ? { Authorization: `Bearer ${REVALIDATION_SECRET}` }
                    : {}),
            },
            body: JSON.stringify({
                type: "product.updated",
                data: {
                    id: product.id,
                    handle: product.handle,
                    affects_grid: affectsGrid,
                },
            }),
        })
        logger.info(`[subscriber] Triggered revalidation webhook for product ${productId}`)
    } catch (err) {
        logger.error(
            `[subscriber] Failed to trigger revalidation for product ${productId}: ${err}`
        )
    }
}

export const config: SubscriberConfig = {
    event: "product.updated",
}
