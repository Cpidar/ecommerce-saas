import "server-only"

import { Content, Data } from "@puckeditor/core";
import fs from "fs";
import { sdk } from "../medusa";
import { cacheLife, cacheTag } from "next/cache";
import { getCurrentStoreHeader, getCurrentStoreId } from "../medusa/cookies";

export type JsonRecord = Record<string, unknown>

export type PaymentConfigInput = {
  id?: string
  name: string
  provider_id: string
  provider_store_id?: string | null
  is_default?: boolean
  is_enabled?: boolean
  config?: JsonRecord
}

export type ShippingMethodConfigInput = {
  id?: string
  name: string
  provider_id: string
  medusa_shipping_option_id?: string | null
  provider_shipping_method_id?: string | null
  is_default?: boolean
  is_enabled?: boolean
  config?: JsonRecord
}

export type StoreConfigInput = {
  id?: string
  medusa_store_id: string
  title: string
  handle: string
  domain: string
  description?: string
  logo_url?: string | null
  logo_alt?: string | null
  favicon_url?: string | null
  homepage_layout?: JsonRecord
  about_page_layout?: JsonRecord
  seo_config?: JsonRecord
  marketing_config?: JsonRecord
  config?: JsonRecord
  payment_configs?: Record<string, PaymentConfigInput>
  shipping_method_configs?: Record<string, ShippingMethodConfigInput>
  puck_data: JsonRecord
}

export type StoreConfigResponse = {
  store_config?: StoreConfigInput | null
}

// ---------------------------------------------------------------------------
// Tenant-aware cache tags
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

export const storeConfigTags = {
  all: (storeId: string) => getTenantTag(storeId, "all_store_config"),
  puckData: (storeId: string) => getTenantTag(storeId, "puckdata"),

}

// ---------------------------------------------------------------------------
// Cached lookups
// ---------------------------------------------------------------------------

const fetchAllConfig = async (
  storeId?: string
) => {
  // No need to Cache
  // "use cache"
  // cacheTag(storeConfigTags.all(storeId || "store"))
  // cacheLife("max")

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config",
  )
  return response.store_config
}

const fetchCoreConfig = async (
  storeId?: string
) => {
  // "use cache"
  // cacheTag(storeConfigTags.all(storeId || "store"))
  // cacheLife("max")

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=title,handle,domain,description,logo_url,logo_alt,favicon_url,seo_config.*,marketing_config.*",
  )
  return response.store_config
}

const fetchPuckPage = async (storeId?: string) => {
  // "use cache"
  // cacheTag(storeConfigTags.all(storeId || "store"))
  // cacheLife("max")

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=puck_data",
  )

  return response.store_config

}

const fetchShippingAndPaymentconfig = async (storeId?: string) => {
  // "use cache"
  // cacheTag(storeConfigTags.all(storeId || "store"))
  // cacheLife("max")

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=payment_configs.*,shipping_method_configs.*",
  )
  return response.store_config

}

const fetchGeneralConfig = async (storeId?: string) => {
  // "use cache"
  // cacheTag(storeConfigTags.all(storeId || "store"))
  // cacheLife("max")

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=config",
  )
  return response.store_config?.config

}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const siteConfigRepository = {
  async getAllConfig() {
    const storeId = await getCurrentStoreId()
    const allConfig = await fetchAllConfig(storeId)

    return allConfig

  },

  async getCoreConfig() {
    const storeId = await getCurrentStoreId()
    const coreConfig = await fetchCoreConfig(storeId)

    return coreConfig

  },

  async getPage(path?: string): Promise<any> {
    const dbPath = `puck-data/database.json`
    const storeId = await getCurrentStoreId()

    const defaultData: Record<string, Data> | null = fs.existsSync(dbPath)
      ? JSON.parse(fs.readFileSync(dbPath, "utf-8"))
      : null;

    const storeConfig = await fetchPuckPage(storeId)
    // if (!storeConfig || !storeConfig.puck_data) return (path && defaultData) ? defaultData[path] : defaultData

    if (!storeConfig) {
      throw new Error("store config not found")
    }
    const puckData = storeConfig.puck_data
    const page = path ? puckData[path] : puckData

    return page
  },

    async getGeneralConfig() {
    const storeId = await getCurrentStoreId()
    const coreConfig = await fetchGeneralConfig(storeId)

    return coreConfig

  },
}
