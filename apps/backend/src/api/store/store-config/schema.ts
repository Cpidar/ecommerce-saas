import { z } from 'zod'

export const jsonRecordSchema = z.record(z.string(), z.unknown())

export const storeSeoConfigSchema = z
    .object({
        title_template: z.string().optional(),
        default_title: z.string().optional(),
        default_description: z.string().optional(),
        default_image_url: z.string().url().optional(),
        canonical_url: z.string().url().optional(),
        robots: z
            .object({
                index: z.boolean().optional(),
                follow: z.boolean().optional(),
            })
            .optional(),
        open_graph: z
            .object({
                site_name: z.string().optional(),
                type: z.string().optional(),
                image_url: z.string().url().optional(),
            })
            .optional(),
        twitter: z
            .object({
                card: z.enum(['summary', 'summary_large_image']).optional(),
                site: z.string().optional(),
            })
            .optional(),
    })
    .strict()

export const storeMarketingConfigSchema = z
    .object({
        google_analytics_id: z.string().optional(),
        google_tag_manager_id: z.string().optional(),
        meta_pixel_id: z.string().optional(),
        tiktok_pixel_id: z.string().optional(),
        newsletter_provider: z.string().optional(),
        newsletter_config: jsonRecordSchema.optional(),
        social_links: z
            .object({
                instagram: z.string().url().optional(),
                x: z.string().url().optional(),
                facebook: z.string().url().optional(),
                linkedin: z.string().url().optional(),
                youtube: z.string().url().optional(),
                tiktok: z.string().url().optional(),
            })
            .optional(),
    })
    .strict()

export const createPaymentConfigSchema = z
    .object({
        name: z.string().min(1),
        provider_id: z.string().min(1),
        provider_store_id: z.string().nullable().optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

export const updatePaymentConfigSchema = createPaymentConfigSchema
    .partial()
    .extend({
        id: z.string().min(1).optional(),
    })
    .strict()

export const createShippingMethodConfigSchema = z
    .object({
        name: z.string().min(1),
        provider_id: z.string().min(1),
        medusa_shipping_option_id: z.string().nullable().optional(),
        provider_shipping_method_id: z.string().nullable().optional(),
        is_default: z.boolean().optional(),
        is_enabled: z.boolean().optional(),
        config: jsonRecordSchema.optional(),
    })
    .strict()

export const updateShippingMethodConfigSchema =
    createShippingMethodConfigSchema
        .partial()
        .extend({
            id: z.string().min(1).optional(),
        })
        .strict()


// CREATE INPUT

export const createStoreConfigWorkflowInputSchema = z
    .object({
        medusa_store_id: z.string().min(1),
        title: z.string().min(1),
        handle: z.string().min(1),
        domain: z.string().min(1),
        description: z.string().optional(),

        logo_url: z.string().url().nullable().optional(),
        logo_alt: z.string().nullable().optional(),
        favicon_url: z.string().url().nullable().optional(),
        theme: z.string().nullable().optional(),
        theme_overrides: z.object().optional(),

        homepage_layout: jsonRecordSchema.optional(),
        about_page_layout: jsonRecordSchema.optional(),

        seo_config: storeSeoConfigSchema.optional(),
        marketing_config: storeMarketingConfigSchema.optional(),
        config: jsonRecordSchema.optional(),

        payment_configs: z.record(z.string(), createPaymentConfigSchema).optional(),
        shipping_method_configs: z.record(z.string(), createShippingMethodConfigSchema).optional(),
    })
    .strict()

export type CreateStoreConfigWorkflowInput = z.infer<
    typeof createStoreConfigWorkflowInputSchema
>

// UPDATE INPUT
export const updateStoreConfigWorkflowInputSchema =
    createStoreConfigWorkflowInputSchema
        .partial()
        .extend({
            id: z.string().min(1),

            payment_configs: z.record(z.string(), updatePaymentConfigSchema.partial()).or(z.string()),
            shipping_method_configs: z.record(z.string(), updateShippingMethodConfigSchema.partial()).or(z.string()),
        })
        .strip()

export type UpdateStoreConfigWorkflowInput = z.infer<
    typeof updateStoreConfigWorkflowInputSchema
>
