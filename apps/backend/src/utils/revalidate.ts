import { MedusaContainer } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const REVALIDATION_ENDPOINT = process.env.STOREFRONT_REVALIDATION_URL ?? ""
export const REVALIDATION_SECRET = process.env.MEDUSA_WEBHOOK_SECRET ?? ""

export const revalidate = async (container: MedusaContainer, path: string, data: { type: string; id: string, handle: string; affects_grid: boolean }) => {
    // if(container){
    //     const console = container.resolve(ContainerRegistrationKeys.LOGGER)
    // }

    if (!REVALIDATION_ENDPOINT) {
        console.warn("STOREFRONT_REVALIDATION_URL is not set; skipping webhook trigger.")
        return
    }

    if (!REVALIDATION_SECRET) {
        console.warn("MEDUSA_WEBHOOK_SECRET is not set; sending webhook without secret.")
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    const targetUrl = `${REVALIDATION_ENDPOINT.replace(/\/+$/, "")}${normalizedPath}`

    try {
        const healthCheck = await fetch(targetUrl, {
            method: "GET",
            signal: AbortSignal.timeout(5000),
        }).catch(() => null)

        if (!healthCheck || !healthCheck.ok) {
            console.warn(
                `[subscriber] Skipping revalidation webhook for product ${data.id}; endpoint is not reachable: ${targetUrl}`
            )
            return
        }

        await fetch(targetUrl, {
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
            signal: AbortSignal.timeout(5000),
        })

        console.info(`[subscriber] Triggered revalidation webhook for product ${data.id}`)
    } catch (err) {
        console.error(
            `[subscriber] Failed to trigger revalidation for product ${data.id}: ${err}`
        )
    }
}
