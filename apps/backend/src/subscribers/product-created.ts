import { Modules } from "@medusajs/framework/utils"
import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

export default async function productCreatedEvent({
    event: { data: { id: productId } },
    container,
}: SubscriberArgs<{ id: string }>) {

    const logger = container.resolve("logger")
    logger.info("Product Created Event Subscriber")

    const productModule = container.resolve(Modules.PRODUCT)

    const { handle } = await productModule.retrieveProduct(productId)
    const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()

    const { result: [product] } = await updateProductsWorkflow(container).run({
        input: {
            selector: { id: productId },
            update: {
                handle: `ncp-${uniquPostfix}-${handle}`,
            },
        }
    })


}

export const config: SubscriberConfig = {
    event: "product.created",
}
