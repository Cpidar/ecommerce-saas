import { Modules } from "@medusajs/framework/utils"
import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { updateCollectionsWorkflow } from "@medusajs/medusa/core-flows"

export default async function productCollectionCreatedEvent({
    event: { data: { id: productCollectionId } },
    container,
}: SubscriberArgs<{ id: string }>) {

    const logger = container.resolve("logger")
    logger.info("Product Collection Created Event Subscriber")

    const productModule = container.resolve(Modules.PRODUCT)

    const { handle } = await productModule.retrieveProductCollection(productCollectionId)
    const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()

    const { result: [product] } = await updateCollectionsWorkflow(container).run({
        input: {
            selector: { id: productCollectionId },
            update: {
                handle: `ncp-${uniquPostfix}-${handle}`,
            },
        }
    })


}

export const config: SubscriberConfig = {
    event: "product-collection.created",
}
