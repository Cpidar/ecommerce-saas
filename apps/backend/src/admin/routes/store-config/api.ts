import { sdk } from "../../lib/sdk"
import type { StoreConfigInput, StoreConfigResponse } from "./types"

export const getStoreConfig = async () => {
  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/admin/store-config",
  )
  return response.store_config?? null
}

export const saveStoreConfig = async (payload: StoreConfigInput) => {
  const method = payload.id ? "PUT" : "POST"
console.log(payload)
  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/admin/store-config",
    {
      method,
      body: payload,
      credentials: "include",
    }
  )

  return response.store_config ?? null
}
