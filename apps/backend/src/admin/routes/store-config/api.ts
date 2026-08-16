import { sdk } from "../../lib/sdk"
import type { StoreConfigInput, StoreConfigResponse } from "./types"

export const getStoreConfig = async () => {
  const response = await sdk.client.fetch<StoreConfigResponse>("/admin/store-config")
  return response.store_config ?? null
}

/**
 * Save store config.
 * - POST (create): server fills `medusa_store_id` from currentStore scope.
 * - PUT (update): send only fields that the server schema accepts.
 *
 * `medusa_store_id` and `handle` are stripped — `medusa_store_id` is immutable
 * and injected server-side; `handle` is managed via the marketing_config
 * contact block in newer storefront versions.
 */
export const saveStoreConfig = async (payload: Partial<StoreConfigInput>) => {
  const method = payload.id ? "PUT" : "POST"

  // On updates, strip server-owned / immutable keys. `medusa_store_id` is injected
  // by the route from the current store scope; `handle` is not a persisted column.
  const { medusa_store_id, handle, ...rest } = payload as Record<string, unknown>;
  const cleanPayload = method === "PUT" ? rest : payload;

  const response = await sdk.client.fetch<StoreConfigResponse>("/admin/store-config", {
    method,
    body: cleanPayload,
    credentials: "include",
  })

  return response.store_config ?? null
}
