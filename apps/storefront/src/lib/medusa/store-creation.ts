"use server"
import type { ReorderStoreSubscriptionCheckoutResponse, ReorderSubscriptionRecord } from "@/types/subscription"
import { sdk } from "../medusa"
import { medusaError } from "../medusa-error"
import { getAuthHeaders } from "./cookies-client"

export async function initializeStore({
    email,
    password,
    storeName,
    handle,
    subscription
}: {
    email: string
    password: string
    storeName: string
    handle: string
    subscription: ReorderSubscriptionRecord
}) {
    const headers = {
        ...(getAuthHeaders()),
    }

    const response = await sdk.client
        .fetch(
            `/stores/regular`,
            {
                method: "POST",
                headers,
                cache: "no-store",
                body: {
                    email,
                    password,
                    storeName,
                    handle,
                    subscription
                }
            }
        )
        .catch(medusaError)

    return response
}
