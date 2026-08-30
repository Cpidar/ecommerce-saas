import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"

export default async function productCategoryDeletedEvent({
    event: { data: { id: categoryId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Category Deleted Event — id: ${categoryId}`)



    const productModule = container.resolve(Modules.PRODUCT)
    const category = await productModule.retrieveProductCategory(categoryId)

    revalidate(container, "categories", {
        type: "product-category.deleted",
        id: category.id,
        handle: category.handle,
        affects_grid: true,
    })


}

export const config: SubscriberConfig = {
    event: "product-category.deleted",
}
