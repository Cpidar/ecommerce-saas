import React from "react";

import { spacingOptions } from "../../options";
import { ComponentConfig } from "@puckeditor/core";
import { Footer } from "@/components/layout/footer";
import { JsonRecord } from "@/lib/repositories/site-configs";

export type SiteConfigProp = {
  name: string;
  tagline: string;
  description: string;
  announcement?: string;
  contact: JsonRecord;
  social: JsonRecord;
  currency?: string;
  copyrightYear?: string;
  freeShippingThreshold?: number;
};

export const Space: ComponentConfig<SiteConfigProp> = {
  label: "Space",
  fields: {
    name: { type: 'text' },
    tagline: { type: "text" },
    description: { type: "textarea" },
    announcement: { type: "text" },
    contact: { type: "text" },
    currency: { type: "radio", options: ["تومان", "ریال"] },
    freeShippingThreshold: { type: "number" }
  },
  defaultProps: {
    name: "Lumen Starter for Medusa JS",
    tagline: "A modern Next.js storefront starter for Medusa.",
    description:
      "Lumen is an open-source Next.js storefront starter for Medusa, designed by Epic Design Labs. Deploy to Medusa Cloud or Vercel — native Medusa features wired end-to-end (catalog, multi-region pricing, cart, promotions, checkout, accounts, returns) with a pluggable payment layer that already speaks Stripe and PayPal.",

    // Announcement bar (set to "" to hide)
    announcement: "Free shipping on all orders over $75 — Shop now!",

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

    // Currency & locale
    currency: "USD",

    // Legal
    copyrightYear: new Date().getFullYear().toString(),
  },
  render: ({ direction, size, puck }) => {
    return <Footer />;
  },
};
