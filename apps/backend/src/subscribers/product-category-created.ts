import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"

export default async function productCategoryCreatedEvent({
    event: { data: { id: productCategoryId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Category Created Event — id: ${productCategoryId}`)

    const productModule = container.resolve(Modules.PRODUCT)
    const category = await productModule.retrieveProductCategory(productCategoryId)

    revalidate(container, "categories", {
        type: "product-category.created",
        id: category.id,
        handle: category.handle,
        affects_grid: true,
    })
}

export const config: SubscriberConfig = {
    event: "product-category.created",
}
