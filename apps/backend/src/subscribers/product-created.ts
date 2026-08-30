import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
    SubscriberArgs,
    type SubscriberConfig,
} from "@medusajs/medusa"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { revalidate } from "../utils/revalidate"

export default async function productCreatedEvent({
    event: { data: { id: productId } },
    container,
}: SubscriberArgs<{ id: string }>) {

    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    logger.info("Product Created Event Subscriber")

    const productModule = container.resolve(Modules.PRODUCT)

    const { handle } = await productModule.retrieveProduct(productId)


    revalidate(container, "products", {
        type: "product.created",
        id: productId,
        handle: handle,
        affects_grid: true,
    })

}

export const config: SubscriberConfig = {
    event: "product.created",
}
