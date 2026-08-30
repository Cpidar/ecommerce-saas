import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"

export default async function productUpdatedEvent({
    event: { data: { id: productId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Updated Event — id: ${productId}`)

    const productModule = container.resolve(Modules.PRODUCT)
    const product = await productModule.retrieveProduct(productId)

    revalidate(container, "products", {
        type: "product.updated",
        id: product.id,
        handle: product.handle,
        affects_grid: true,
    })
}

export const config: SubscriberConfig = {
    event: "product.updated",
}
