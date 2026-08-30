import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"

export default async function productVariantCreatedEvent({
    event: { data: { id: variantId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Variant Created Event — id: ${variantId}`)

    const productModule = container.resolve(Modules.PRODUCT)
    const variant = await productModule.retrieveProductVariant(variantId)
    const product = await productModule.retrieveProduct(variant.product_id!)

    revalidate(container, "products", {
        type: "product-variant.created",
        id: product.id,
        handle: product.handle,
        affects_grid: true,
    })

}

export const config: SubscriberConfig = {
    event: "product-variant.created",
}
