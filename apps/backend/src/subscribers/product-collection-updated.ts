import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"


export default async function productCollectionUpdatedEvent({
    event: { data: { id: collectionId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Collection Updated Event — id: ${collectionId}`)

    const productModule = container.resolve(Modules.PRODUCT)
    const collection = await productModule.retrieveProductCollection(collectionId)

    revalidate(container, "collections", {
        type: "product-collection.updated",
        id: collection.id,
        handle: collection.handle,
        affects_grid: true,
    })

}

export const config: SubscriberConfig = {
    event: "product-collection.updated",
}
