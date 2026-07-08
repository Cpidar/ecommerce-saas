// ============================================================================
// Store Configuration — Single source of truth for all store-wide settings.
// Edit this file to customize the store name, contact info, social links, etc.
// ============================================================================

import { ReorderStoreProductSubscriptionOfferResponse, ReorderStoreSubscriptionOfferFrequency } from "@/types/subscription"

export const siteConfig = {
  // Branding
  name: "Lumen Starter for Medusa JS",
  tagline: "A modern Next.js storefront starter for Medusa.",
  description:
    "Lumen is an open-source Next.js storefront starter for Medusa, designed by Epic Design Labs. Deploy to Medusa Cloud or Vercel — native Medusa features wired end-to-end (catalog, multi-region pricing, cart, promotions, checkout, accounts, returns) with a pluggable payment layer that already speaks Stripe and PayPal.",

  // Announcement bar (set to "" to hide)
  announcement: "Free shipping on all orders over $75 — Shop now!",

  // URLs
  url: process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",

  // Contact
  contact: {
    email: "support@epicdesignlabs.com",
    phone: "",
    address: {
      street: "",
      suite: "",
      city: "",
      state: "",
      zip: "",
    },
  },

  // Social links (set to "" to hide)
  social: {
    twitter: "https://x.com/epicdesignlabs",
    instagram: "https://instagram.com/epicdesignlabs",
    facebook: "https://facebook.com/epicdesignlabs",
    youtube: "",
    tiktok: "",
  },

  // Shipping
  freeShippingThreshold: 7500, // in cents ($75.00)
  taxRate: 0.08, // 8%

  // Currency & locale
  currency: "USD",
  locale: "en-US",

  // Legal
  copyrightYear: new Date().getFullYear(),
} as const


// ============================================================================
// Store Configuration — Single source of truth for all store-wide settings.
// Edit this file to customize the store name, contact info, social links, etc.
// ============================================================================

export const COMPANY_NAME = 'Nitro'
export const BASE_URL = ''
export const SUPPORT_EMAIL_ADDRESS = 'support@xyz.com'

export const UNEXPECTED_ERROR_MESSAGE =
  'Something went wrong. Please try again later.'

export const formErrorMessage = {
  required(fieldName: string) {
    return `Please enter a ${fieldName}.`
  },
  minLength(min: number) {
    return `Use at least ${min} characters.`
  },
  maxLength(max: number) {
    return `Use ${max} characters or fewer.`
  },
}

export const BASE_SUBSCRIPTION_PRICE = process.env.BASE_SUBSCRIPTION_PRICE || "900000"

export const BASE_SUBSCRIPTION_OFFERS: ReorderStoreProductSubscriptionOfferResponse = {
  subscription_offer: {
    is_subscription_available: true,
    product_id: "",
    variant_id: "",
    source_offer_id: "",
    source_scope: "product",
    discount_semantics: {
      has_frequency_specific_discounts: false
    },
    minimum_cycles: 3,
    allowed_frequencies: [
      {
        frequency_interval: "month",
        frequency_value: 3,
        label: "سه ماهه",
        discount: {
          type: "percentage",
          value: 1
        }
      },
      {
        frequency_interval: "month",
        frequency_value: 6,
        label: "شش ماهه",
        discount: {
          type: "percentage",
          value: 10
        }
      },
      {
        frequency_interval: "year",
        frequency_value: 12,
        label: "یک ساله",
        discount: {
          type: "percentage",
          value: 12
        }
      }
    ],
    trial: {
      is_enabled: true,
      days: 14
    }
  }
}


export type SiteConfig = typeof siteConfig
