// src/subscribers/torob-product-sync.ts

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { STORE_CONFIG_MODULE } from "../modules/store-config"

export default async function torobProductSyncHandler({
    event: { data: { id: productId } },
    container,
}: SubscriberArgs<{ id: string }>) {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const productModuleService = container.resolve(Modules.PRODUCT)
    const storeConfigModuleService = container.resolve(STORE_CONFIG_MODULE)
    const logger = container.resolve("logger")

    try {
        // Get the full product
        const product = await productModuleService.retrieveProduct(productId)

        // 2. Find the Store linked to this product
        // Adjust the field name according to how you defined the link
        const { data: productsStore } = await query.graph({
            entity: "product_store",
            fields: ["*"],
            filters: {
                product_id: productId,
            },
        })

        console.log("productsStores", productsStore);
        const storeId = productsStore[0].store_id;

        if (!storeId) {
            logger.warn(`No store linked to product ${productId}. Skipping Torob webhook.`)
            return
        }

        const storeConfig = await storeConfigModuleService.listStoreConfigs({ medusa_store_id: storeId })

        const storeDomain = storeConfig[0].domain
        if (!storeDomain) {
            logger.warn(`No domain set in store config.`)
            return
        }


        // Build the payload that Torob expects
        const payload = {
            items: [
                {
                    page_unique: product.id,
                    page_url: `${storeDomain}/products/${product.handle}`, // ← Important: use your storefront URL
                },
            ],
        }
        const torobToken = (storeConfig[0].seo_config?.torob as any)?.token

        if (!torobToken) {
            logger.warn(`No torob token found.`)
            return
        }
        // Send to Torob Webhook
        const response = await fetch("https://api.torob.com/update/webhook/v1/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${torobToken || process.env.DEFAULT_TOROB_WEBHOOK_TOKEN}`, // Token that Torob gave you
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            logger.error(`Torob webhook failed: ${response.status} - ${errorText}`)
            return
        }

        logger.info(`Successfully notified Torob about product: ${product.id}`)
    } catch (error: any) {
        logger.error("Error in Torob product sync subscriber:", error)
    }
}

export const config: SubscriberConfig = {
    event: [
        "product.created",
        "product.updated",
        // You can also add "product.deleted" if needed
    ],
}
