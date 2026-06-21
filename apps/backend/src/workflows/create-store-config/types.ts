export type JsonRecord = Record<string, unknown>

export type StoreSeoConfigInput = {
  title_template?: string
  default_title?: string
  default_description?: string
  default_image_url?: string
  canonical_url?: string
  robots?: {
    index?: boolean
    follow?: boolean
  }
  open_graph?: {
    site_name?: string
    type?: string
    image_url?: string
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    site?: string
  }
}

export type StoreMarketingConfigInput = {
  google_analytics_id?: string
  google_tag_manager_id?: string
  meta_pixel_id?: string
  tiktok_pixel_id?: string
  newsletter_provider?: string
  newsletter_config?: JsonRecord
  social_links?: {
    instagram?: string
    x?: string
    facebook?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
}

export type PaymentConfigInput = {
  name: string
  provider_id: string
  provider_store_id?: string | null
  is_default?: boolean
  is_enabled?: boolean
  config?: JsonRecord
}

export type ShippingMethodConfigInput = {
  name: string
  provider_id: string
  medusa_shipping_option_id?: string | null
  provider_shipping_method_id?: string | null
  is_default?: boolean
  is_enabled?: boolean
  config?: JsonRecord
}

export type CreateStoreConfigWorkflowInput = {
  medusa_store_id: string
  title: string
  handle: string
  domain?: string
  description?: string

  logo_url?: string | null
  logo_alt?: string | null
  favicon_url?: string | null

  homepage_layout?: JsonRecord
  about_page_layout?: JsonRecord

  seo_config?: StoreSeoConfigInput
  marketing_config?: StoreMarketingConfigInput
  config?: JsonRecord

  payment_configs?: Record<string, PaymentConfigInput>
  shipping_method_configs?: Record<string, ShippingMethodConfigInput>
}
