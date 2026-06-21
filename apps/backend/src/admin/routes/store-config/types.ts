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
}

export type StoreConfigResponse = {
  store_config?: StoreConfigInput | null
}
