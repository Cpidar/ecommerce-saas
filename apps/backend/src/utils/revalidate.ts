import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const REVALIDATION_ENDPOINT = process.env.STOREFRONT_REVALIDATION_URL ?? ""
export const REVALIDATION_SECRET = process.env.MEDUSA_WEBHOOK_SECRET ?? ""

export const revalidate = async (container: MedusaContainer, path: string, data: { type: string; id: string, handle: string; affects_grid: boolean }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)


    if (!REVALIDATION_ENDPOINT) {
        logger.warn("STOREFRONT_REVALIDATION_URL is not set; skipping webhook trigger.")
        return
    }

    if (!REVALIDATION_SECRET) {
        logger.warn("MEDUSA_WEBHOOK_SECRET is not set; sending webhook without secret.")
    }

    try {

        await fetch(`${REVALIDATION_ENDPOINT}/${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(REVALIDATION_SECRET
                    ? { Authorization: `Bearer ${REVALIDATION_SECRET}` }
                    : {}),
            },
            body: JSON.stringify({
                type: data.type,
                data: {
                    id: data.id,
                    handle: data.handle,
                    affects_grid: data.affects_grid,
                },
            }),
        })
        logger.info(`[subscriber] Triggered revalidation webhook for product ${data.id}`)
    } catch (err) {
        logger.error(
            `[subscriber] Failed to trigger revalidation for product ${data.id}: ${err}`
        )
    }
}
