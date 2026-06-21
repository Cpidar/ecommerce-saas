import { sdk } from "../../lib/sdk"
import type { StoreConfigInput, StoreConfigResponse } from "./types"

export const getStoreConfig = async () => {
  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/admin/store-config",
  )
console.log(response)
  return response.store_config?? null
}

export const saveStoreConfig = async (payload: StoreConfigInput) => {
  const method = payload.id ? "PUT" : "POST"

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/admin/store-config",
    {
      method,
      body: payload,
    }
  )

  return response.store_config ?? null
}
