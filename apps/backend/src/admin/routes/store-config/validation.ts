"use client";

import { z } from "zod";

const urlOrEmpty = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().or(z.url()).or(z.literal("")));

const urlOrNull = z
  .string()
  .transform((v) => v.trim())
  .pipe(z.string().or(z.url()).or(z.literal("")))
  .or(z.null());

const emptyString = z.string().optional().default("");

export const contactSchema = z
  .object({
    address: emptyString,
    phone: emptyString,
    email: z.string().email("ایمیل معتبر نیست").or(z.literal("")).optional().default(""),
  })
  .default(() => ({
    address: "",
    phone: "",
    email: "",
  }));

export const socialLinksSchema = z
  .object({
    instagram: urlOrEmpty.optional().default(""),
    telegram: urlOrEmpty.optional().default(""),
    eitaa: urlOrEmpty.optional().default(""),
    bale: urlOrEmpty.optional().default(""),
    rubika: urlOrEmpty.optional().default(""),
    x: urlOrEmpty.optional().default(""),
    facebook: urlOrEmpty.optional().default(""),
    linkedlin: urlOrEmpty.optional().default(""),
    youtube: urlOrEmpty.optional().default(""),
    aparat: urlOrEmpty.optional().default(""),
    tiktok: urlOrEmpty.optional().default(""),
  })
  .default(() => ({
    instagram: "",
    telegram: "",
    eitaa: "",
    bale: "",
    rubika: "",
    x: "",
    facebook: "",
    linkedlin: "",
    youtube: "",
    aparat: "",
    tiktok: "",
  }));

export const marketingConfigSchema = z
  .object({
    contact: contactSchema.optional(),
    social_links: socialLinksSchema.optional(),
    google_analytics_id: emptyString,
    google_tag_manager_id: emptyString,
    meta_pixel_id: emptyString,
    tiktok_pixel_id: emptyString,
    announcement: emptyString,
  })
  .default(() => ({
    contact: undefined,
    social_links: undefined,
    google_analytics_id: "",
    google_tag_manager_id: "",
    meta_pixel_id: "",
    tiktok_pixel_id: "",
    announcement: "",
  }));

export const robotsSchema = z
  .object({
    index: z.boolean().optional().default(true),
    follow: z.boolean().optional().default(true),
  })
  .default(() => ({
    index: true,
    follow: true,
  }));

export const openGraphSchema = z
  .object({
    site_name: emptyString,
    type: emptyString,
    image_url: urlOrNull.optional().default(null),
  })
  .default(() => ({
    site_name: "",
    type: "",
    image_url: null,
  }));

export const twitterSchema = z
  .object({
    card: z.enum(["summary", "summary_large_image"]).optional().default("summary_large_image"),
    site: emptyString,
  })
  .default(() => ({
    card: "summary_large_image" as const,
    site: "",
  }));

export const seoConfigSchema = z
  .object({
    default_title: z.string().max(70, "حداکثر ۷۰ کاراکتر").optional().default(""),
    title_template: z.string().max(70, "حداکثر ۷۰ کاراکتر").optional().default(""),
    default_description: z.string().max(160, "حداکثر ۱۶۰ کاراکتر").optional().default(""),
    default_image_url: urlOrNull.optional().default(null),
    canonical_url: urlOrEmpty.optional().default(""),
    robots: robotsSchema.optional(),
    open_graph: openGraphSchema.optional(),
    twitter: twitterSchema.optional(),
  })
  .default(() => ({
    default_title: "",
    title_template: "",
    default_description: "",
    default_image_url: null,
    canonical_url: "",
    robots: undefined,
    open_graph: undefined,
    twitter: undefined,
  }));

export const basicSchema = z.object({
  title: z.string().optional().default(""),
  handle: z.string().optional().default(""),
  domain: urlOrEmpty.optional().default(""),
  description: z.string().optional().default(""),
  medusa_store_id: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
});

export const brandAssetsSchema = z.object({
  logo_url: urlOrNull.optional().default(null),
  logo_alt: z.string().nullable().optional().default(""),
  favicon_url: urlOrNull.optional().default(null),
  marketing_config: marketingConfigSchema.optional(),
});

export type BasicFormValues = z.infer<typeof basicSchema>;
export type BrandAssetsFormValues = z.infer<typeof brandAssetsSchema>;
export type SeoFormValues = z.infer<typeof seoConfigSchema>;
