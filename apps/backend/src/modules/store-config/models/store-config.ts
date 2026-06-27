import { InferTypeOf } from '@medusajs/framework/types'
import { model } from '@medusajs/framework/utils'

const StoreConfig = model.define('store_config', {
  id: model.id().primaryKey(),

  medusa_store_id: model.text(),
  title: model.text(),
  handle: model.text().unique(),
  domain: model.text(),
  description: model.text().default(''),

  logo_url: model.text().nullable(),
  logo_alt: model.text().nullable(),
  favicon_url: model.text().nullable(),
  theme: model.text().default("default"),
  theme_overrides: model.json().default({}),

  homepage_layout: model.json().default({}),
  about_page_layout: model.json().default({}),
  puck_data: model.json().default({}),

  seo_config: model.json().default({}),
  marketing_config: model.json().default({}),
  config: model.json().default({}),

  payment_configs: model.json().default({}),

  shipping_method_configs: model.json().default({}),

  subscription_product_id: model.text().unique().nullable(),
  subscription_status: model.text().default('PENDING')
})

export type StoreConfigModelType = InferTypeOf<typeof StoreConfig>

export default StoreConfig