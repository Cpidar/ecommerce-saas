import "server-only"

import fs from "fs";
import { sdk } from "../medusa";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { getCurrentStoreId } from "../medusa/cookies";
import { cookies } from 'next/headers';
import { ADMIN_COOKIE } from "@/lib/medusa/admin-auth";
import { STORE_CONFIG_CACHE_PROFILE } from "../constants";

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
  tagline?: string
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
  coreConfig: (storeId: string) => getTenantTag(storeId, "core_config"),
  seoConfig: (storeId: string) => getTenantTag(storeId, "seo_config"),
  generalConfig: (storeId: string) => getTenantTag(storeId, "general_config"),
  payment: (storeId: string) => getTenantTag(storeId, "payment_config"),
  shipping: (storeId: string) => getTenantTag(storeId, "shipping_config"),
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

// Simpler functional approach if you don't need the full class

const ID_POOL = [
  "aB3xK9mQ", "P2nR7vL1", "kM9nX2pR", "3Wg7FqL1", "T5hJ8wN3",
  "rS6fD2gH", "yU7iE4oP", "qW9eR1tY", "zX8cV4bN", "mK3lJ9hG",
  "vC6xF2dS", "nB5gH7jK", "lP9oI3uY", "eR6tW8qA", "dF4gH2jK",
  "sD3fG6hJ", "uY7iK4lP", "wE2rT5yU", "oI9uY7tR", "pA3sD5fG",
  "hJ8kL2zX", "cV4bN6mK", "jH7gF3dS", "kL9zX8cV", "bN4mK3jH",
  "gF6dS2aP", "tR5yU7iK", "eW2qA4zX", "rT5yU8iK", "yU7iK4lP",
  "qW9eR1tY", "zX8cV4bN", "mK3lJ9hG", "vC6xF2dS", "nB5gH7jK",
  "lP9oI3uY", "eR6tW8qA", "dF4gH2jK", "sD3fG6hJ", "uY7iK4lP",
  "wE2rT5yU", "oI9uY7tR", "pA3sD5fG", "hJ8kL2zX", "cV4bN6mK",
  "jH7gF3dS", "kL9zX8cV", "bN4mK3jH", "gF6dS2aP", "tR5yU7iK",
  "eW2qA4zX", "rT5yU8iK", "yU7iK4lP", "qW9eR1tY", "zX8cV4bN",
  "mK3lJ9hG", "vC6xF2dS", "nB5gH7jK", "lP9oI3uY", "eR6tW8qA",
  "dF4gH2jK", "sD3fG6hJ", "uY7iK4lP", "wE2rT5yU", "oI9uY7tR",
  "pA3sD5fG", "hJ8kL2zX", "cV4bN6mK", "jH7gF3dS", "kL9zX8cV",
  "bN4mK3jH", "gF6dS2aP", "tR5yU7iK", "eW2qA4zX", "rT5yU8iK",
  "aB3xK9mQ", "P2nR7vL1", "kM9nX2pR", "3Wg7FqL1", "T5hJ8wN3",
  "rS6fD2gH", "yU7iE4oP", "qW9eR1tY", "zX8cV4bN", "mK3lJ9hG",
  "vC6xF2dS", "nB5gH7jK", "lP9oI3uY", "eR6tW8qA", "dF4gH2jK",
  "sD3fG6hJ", "uY7iK4lP", "wE2rT5yU", "oI9uY7tR", "pA3sD5fG"
]

// ---------------------------------------------------------------------------
// Cached lookups
// ---------------------------------------------------------------------------
// TODO: API must be implemented
const fetchAllStoreHandles = async (): Promise<string[]> => {
  "use cache"
  cacheLife("max")

  const response = await sdk.client.fetch<{ store_handles: string[] }>(
    "/store/store-config/handles",
  )
  return response.store_handles
}

const fetchAllConfig = async (
  storeId?: string
) => {
  "use cache"
  cacheTag(storeConfigTags.all(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config",
  )
  return response.store_config
}

const fetchCoreConfig = async (
  storeId?: string
) => {
  "use cache"
  cacheTag(storeConfigTags.coreConfig(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=title,handle,domain,description,logo_url,logo_alt,favicon_url,seo_config.*,marketing_config.*",
  )
  return response.store_config
}

const fetchPuckPage = async (storeId?: string) => {
  "use cache"
  cacheTag(storeConfigTags.puckData(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=puck_data",
  )

  return response.store_config

}

const fetchAdminPuckPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=puck_data,id",
    {
      method: "GET",
      headers: { 'Authorization': `Bearer ${token}` },
    }
  )


  return response.store_config

}

const fetchSeoConfig = async (storeId?: string) => {
  "use cache"
  cacheTag(storeConfigTags.seoConfig(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=seo_config",
  )
  return response.store_config?.seo_config
}

const fetchShippingAndPaymentconfig = async (storeId?: string) => {
  "use cache"
  cacheTag(storeConfigTags.payment(storeId || "store"), storeConfigTags.shipping(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=payment_configs.*,shipping_method_configs.*",
  )
  return response.store_config

}

const fetchGeneralConfig = async (storeId?: string) => {
  "use cache"
  cacheTag(storeConfigTags.generalConfig(storeId || "store"))
  cacheLife(STORE_CONFIG_CACHE_PROFILE)

  const response = await sdk.client.fetch<StoreConfigResponse>(
    "/store/store-config?fields=config",
  )
  return response.store_config?.config

}

// ---------------------------------------------------------------------------
// Revalidation Helpers
// ---------------------------------------------------------------------------
export const siteConfigRevalidation = {
  async all(storeId: string) {
    await revalidateTag(storeConfigTags.all(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async core(storeId: string) {
    await revalidateTag(storeConfigTags.coreConfig(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async seo(storeId: string) {
    await revalidateTag(storeConfigTags.seoConfig(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async general(storeId: string) {
    await revalidateTag(storeConfigTags.generalConfig(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async payment(storeId: string) {
    await revalidateTag(storeConfigTags.payment(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async shipping(storeId: string) {
    await revalidateTag(storeConfigTags.shipping(storeId), STORE_CONFIG_CACHE_PROFILE)
  },

  async puck(storeId: string) {
    await revalidateTag(storeConfigTags.puckData(storeId), STORE_CONFIG_CACHE_PROFILE)
  },
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const siteConfigRepository = {
  async getUniqueId(): Promise<string> {
    // TODO: must shift to backend (backend assign a handle in store created hook)
    const usedIds = await fetchAllStoreHandles().then(handles => new Set(handles))
    const available = ID_POOL.filter(id => !usedIds.has(id))

    if (available.length === 0) {
      throw new Error('No more unique IDs available')
    }

    const randomIndex = Math.floor(Math.random() * available.length)
    const selectedId = available[randomIndex]
    usedIds.add(selectedId)

    return selectedId
  },
  
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
    const templatePath = `puck-data/template.json` // Base template fallback
    const storeId = await getCurrentStoreId()

    let puckData: any = null;

    const storeConfig = await fetchPuckPage(storeId)

    if (storeConfig?.puck_data && Object.keys(storeConfig.puck_data).length > 0) {
      puckData = storeConfig.puck_data;

    } else {
      // Fallback to template.json when there is no store config or it's empty
      if (fs.existsSync(templatePath)) {
        puckData = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
      }
    }


    const page = path ? puckData[path] : puckData
    return page
  },

  async getPageFromAdmin(path?: string): Promise<any> {
    const storeConfig = await fetchAdminPuckPage()
    // if (storeConfig?.puck_data && Object.keys(storeConfig.puck_data).length > 0) {
    //   puckData = storeConfig.puck_data;
    // } else {
    //   // Fallback to template.json when there is no store config or it's empty
    //   if (fs.existsSync(templatePath)) {
    //     puckData = JSON.parse(fs.readFileSync(templatePath, "utf-8"));
    //   }
    // }


    // const page = path ? puckData[path] : puckData
    return storeConfig
  },

  async getSeoConfig() {
    const storeId = await getCurrentStoreId()
    const coreConfig = await fetchSeoConfig(storeId)

    return coreConfig
  },

  async getShippingAndPaymentConfig() {
    const storeId = await getCurrentStoreId()
    const shippingAndPaymentConfig = await fetchShippingAndPaymentconfig(storeId)
    return shippingAndPaymentConfig
  },

  async getGeneralConfig() {
    const storeId = await getCurrentStoreId()
    const coreConfig = await fetchGeneralConfig(storeId)

    return coreConfig

  },

}
