import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { updateCollectionsWorkflow } from "@medusajs/medusa/core-flows"
import { revalidate } from "../utils/revalidate"
import { normalizePersianText } from "../utils/normalize-persian-text"

export default async function productCollectionCreatedEvent({
    event: { data: { id: productCollectionId } },
    container,
}: SubscriberArgs<{ id: string }>) {

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info("Product Collection Created Event Subscriber")

    const productModule = container.resolve(Modules.PRODUCT)

    const { handle, title } = await productModule.retrieveProductCollection(productCollectionId)
    const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()
    const normalizedTitle = normalizePersianText(title)

    const { result: [product] } = await updateCollectionsWorkflow(container).run({
        input: {
            selector: { id: productCollectionId },
            update: {
                handle: `ncp-${uniquPostfix}-${handle}`,
                title: normalizedTitle
            },
        }
    })

    revalidate(container, "collections", {
        type: "product-collection.created",
        id: product.id,
        handle: product.handle,
        affects_grid: true,
    })


}

export const config: SubscriberConfig = {
    event: "product-collection.created",
}
