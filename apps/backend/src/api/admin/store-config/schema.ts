import { looseObject, z } from '@medusajs/framework/zod'

// Helper to make strings accept empty values
const optionalString = z.string().or(z.literal('')).optional()
const nullableString = z.string().nullable().or(z.literal('')).optional()
const optionalUrl = z.string().url().or(z.literal('')).optional()
const nullableUrl = z.string().url().nullable().or(z.literal('')).optional()

// More permissive JSON record
export const jsonRecordSchema = z.record(z.string(), z.unknown())

// Non-strict SEO config - all fields optional and accept empty strings
export const storeSeoConfigSchema = z
    .looseObject({
        title_template: optionalString,
        default_title: optionalString,
        default_description: optionalString,
        default_image_url: nullableUrl,
        canonical_url: optionalUrl,
        enamad: optionalString,
        torob: looseObject({
            shop_id: optionalString,
            token: optionalString
        }).optional(),
        robots: z
            .object({
                index: z.boolean().optional(),
                follow: z.boolean().optional(),
            })
            .optional(),
        open_graph: z
            .object({
                site_name: optionalString,
                type: optionalString,
                image_url: nullableUrl,
            })
            .optional(),
        twitter: z
            .object({
                card: z.enum(['summary', 'summary_large_image']).or(z.literal('')).optional(),
                site: optionalString,
            })
            .optional(),
    })
    .strict()
    .optional()

// Non-strict marketing config
export const storeMarketingConfigSchema = z
    .looseObject({
        google_analytics_id: optionalString,
        google_tag_manager_id: optionalString,
        meta_pixel_id: optionalString,
        tiktok_pixel_id: optionalString,
        newsletter_provider: optionalString,
        newsletter_config: jsonRecordSchema.optional(),
        contact: z
            .looseObject({
                address: optionalString,
                phone: optionalString,
                email: z.email().or(z.literal('')).optional(),
            })
            .optional(),
        social_links: z
            .looseObject({
                instagram: optionalUrl,
                x: optionalUrl,
                facebook: optionalUrl,
                linkedin: optionalUrl,
                youtube: optionalUrl,
                tiktok: optionalUrl,
                telegram: optionalUrl,
                eitaa: optionalUrl,
                bale: optionalUrl,
                rubika: optionalUrl,
                aparat: optionalUrl,
            })
            .optional(), // Allow extra social links
    })
    .optional()


// Non-strict payment config
export const createPaymentConfigSchema = z
    .object({
        name: z.string().min(1).or(z.literal('')).optional(),
        provider_id: z.string().min(1).or(z.literal('')).optional(),
        provider_store_id: z.string().nullable().or(z.literal('')).optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

export const updatePaymentConfigSchema = z
    .object({
        id: z.string().min(1).or(z.literal('')).optional(),
        name: z.string().min(1).or(z.literal('')).optional(),
        provider_id: z.string().min(1).or(z.literal('')).optional(),
        provider_store_id: z.string().nullable().or(z.literal('')).optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

// Non-strict shipping method config
export const createShippingMethodConfigSchema = z
    .object({
        name: z.string().min(1).or(z.literal('')).optional(),
        provider_id: z.string().min(1).or(z.literal('')).optional(),
        medusa_shipping_option_id: z.string().nullable().or(z.literal('')).optional(),
        provider_shipping_method_id: z.string().nullable().or(z.literal('')).optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

export const updateShippingMethodConfigSchema = z
    .object({
        id: z.string().min(1).or(z.literal('')).optional(),
        name: z.string().min(1).or(z.literal('')).optional(),
        provider_id: z.string().min(1).or(z.literal('')).optional(),
        medusa_shipping_option_id: z.string().nullable().or(z.literal('')).optional(),
        provider_shipping_method_id: z.string().nullable().or(z.literal('')).optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

// CREATE INPUT - Non-strict version
export const createStoreConfigWorkflowInputSchema = z
    .looseObject({
        medusa_store_id: z.string().min(1),
        title: z.string().min(1).or(z.literal('')).optional(),
        handle: z.string().min(1),
        // domain: z.string().min(1).or(z.literal('')).optional(),
        // description: optionalString,
        // tagline: optionalString,

        // logo_url: nullableUrl,
        // logo_alt: nullableString,
        // favicon_url: nullableUrl,
        // theme: nullableString,
        // theme_overrides: jsonRecordSchema.optional(),

        // homepage_layout: jsonRecordSchema.optional(),
        // about_page_layout: jsonRecordSchema.optional(),

        // seo_config: storeSeoConfigSchema,
        // marketing_config: storeMarketingConfigSchema.optional(),
        // config: jsonRecordSchema.optional(),

        // payment_configs: z.record(z.string(), createPaymentConfigSchema).optional(),
        // shipping_method_configs: z.record(z.string(), createShippingMethodConfigSchema).optional(),
    })

export type CreateStoreConfigWorkflowInput = z.infer<
    typeof createStoreConfigWorkflowInputSchema
>

// UPDATE INPUT - Non-strict version (explicitly defined, not using partial)
export const updateStoreConfigWorkflowInputSchema = z
    .looseObject({
        id: z.string().min(1),
        medusa_store_id: z.string().min(1).or(z.literal('')).optional(),
        title: z.string().min(1).or(z.literal('')).optional(),
        handle: z.string().min(1).or(z.literal('')).optional(),
        domain: z.string().min(1).or(z.literal('')).optional(),
        description: optionalString,
        tagline: optionalString,

        logo_url: nullableString,
        logo_alt: nullableString,
        favicon_url: nullableString,
        theme: nullableString,
        theme_overrides: jsonRecordSchema.optional(),

        homepage_layout: jsonRecordSchema.optional(),
        about_page_layout: jsonRecordSchema.optional(),

        seo_config: storeSeoConfigSchema,
        marketing_config: storeMarketingConfigSchema.optional(),
        config: jsonRecordSchema.optional(),

        payment_configs: z.record(z.string(), updatePaymentConfigSchema).optional(),
        shipping_method_configs: z.record(z.string(), updateShippingMethodConfigSchema).optional(),
    })

export type UpdateStoreConfigWorkflowInput = z.infer<
    typeof updateStoreConfigWorkflowInputSchema
>