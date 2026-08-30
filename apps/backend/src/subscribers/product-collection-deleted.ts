import type { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { revalidate } from "../utils/revalidate"


export default async function productCollectionDeletedEvent({
    event: { data: { id: collectionId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info(`[subscriber] Product Collection Deleted Event — id: ${collectionId}`)

    const productModule = container.resolve(Modules.PRODUCT)
    const collection = await productModule.retrieveProductCollection(collectionId)

    revalidate(container, "collections", {
        type: "product-collection.deleted",
        id: collection.id,
        handle: collection.handle,
        affects_grid: true,
    })    
}

export const config: SubscriberConfig = {
    event: "product-collection.deleted",
}
