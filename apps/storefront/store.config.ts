import { z } from "zod";

/**
 * ============================================================================
 * ATTAR — STORE CONFIGURATION
 * ============================================================================
 * This is the single source of truth for store branding and behavior.
 * Retailers (and AI agents) customize the store by editing THIS file.
 *
 * Rules:
 * - Every field is validated by the Zod schema below. Invalid values stop
 *   `pnpm dev` and `pnpm build` with a readable error (see next.config.ts)
 *   instead of breaking the store silently.
 * - All money values in this file are integers in the currency's minor unit.
 *   For BDT (minorUnits: 0) that means plain taka: 60 = ৳60.
 *   For USD (minorUnits: 2) that means cents: 6000 = $60.00.
 * - Do NOT put secrets here. Secrets belong in `.env` (see `.env.example`).
 * ============================================================================
 */

// A function, not a constant, so browser bundles can drop Zod entirely:
// client components read the plain object and never need the schema.
export const storeConfigSchema = () => z.object({
  store: z.object({
    /** Store display name, used in the header, titles, emails, invoices. */
    name: z.string().min(1),
    /** Short tagline shown in the footer and default meta description. */
    tagline: z.string(),
    /** Path to logo image in /public, or null to render the name as text. */
    logo: z.string().nullable(),
    /** Prefix for human-friendly order numbers, e.g. "ATR" -> ATR-1042. */
    orderNumberPrefix: z
      .string()
      .regex(/^[A-Z]{2,6}$/, "2-6 uppercase letters"),
  }),

  contact: z.object({
    /** Primary phone customers call — shown in header/footer. */
    phone: z.string().min(6),
    whatsapp: z.string().nullable(),
    email: z.string().nullable(),
    addressLines: z.array(z.string()).max(4),
    social: z.object({
      facebook: z.url().nullable(),
      instagram: z.url().nullable(),
      tiktok: z.url().nullable(),
      youtube: z.url().nullable(),
    }),
  }),

  currency: z.object({
    /** ISO 4217 code. */
    code: z.string().length(3),
    symbol: z.string().min(1),
    /** Where the symbol sits relative to the amount. */
    symbolPosition: z.enum(["before", "after"]),
    /**
     * Number of decimal places the currency uses IN THIS STORE.
     * BDT is conventionally displayed without decimals -> 0.
     * If you change this on a live store you must migrate stored prices.
     */
    minorUnits: z.union([z.literal(0), z.literal(2)]),
    /** Thousands separator for display, e.g. "12,500". */
    thousandsSeparator: z.string(),
  }),

  checkout: z.object({
    /**
     * Delivery zones with flat fees (minor units). The customer picks one at
     * checkout. Typical Bangladesh setup: inside Dhaka / outside Dhaka.
     */
    deliveryZones: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          fee: z.int().nonnegative(),
          etaDays: z.string(), // e.g. "1-2 days"
        }),
      )
      .min(1),
    /** Order subtotal (minor units) above which delivery is free. null = never. */
    freeDeliveryOver: z.int().positive().nullable(),
    paymentMethods: z.object({
      cod: z.object({
        enabled: z.boolean(),
        label: z.string(),
        instructions: z.string(),
      }),
      bkash: z.object({
        enabled: z.boolean(),
        /** The bKash number customers send money to. */
        number: z.string().nullable(),
        accountType: z.enum(["personal", "merchant"]),
        instructions: z.string(),
      }),
      nagad: z.object({
        enabled: z.boolean(),
        number: z.string().nullable(),
        accountType: z.enum(["personal", "merchant"]),
        instructions: z.string(),
      }),
    }),
    /** Shown under the checkout form. Keep expectations honest. */
    confirmationNote: z.string(),
  }),

  features: z.object({
    wishlist: z.boolean(),
    reviews: z.boolean(),
    coupons: z.boolean(),
    recentlyViewed: z.boolean(),
    /** Show strikethrough MSRP + "% off" badges (the Jomashop signature). */
    dealBadges: z.boolean(),
  }),

  catalog: z.object({
    /** Products per page on listing pages. */
    pageSize: z.int().min(6).max(60),
    /** Stock at/below which admin sees a "low stock" warning. */
    lowStockThreshold: z.int().nonnegative(),
    /** Days a product counts as "New". */
    newArrivalDays: z.int().positive(),
  }),

  theme: z.object({
    /** Hex color driving buttons/links/accents. Wired to CSS vars; see src/app/storefront.css. */
    primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    /** Hex color for sale/deal highlights (badges, % off). */
    deal: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    radius: z.enum(["none", "sm", "md", "lg"]),
  }),

  announcementBar: z.object({
    enabled: z.boolean(),
    messages: z
      .array(z.object({ text: z.string(), href: z.string().nullable() }))
      .max(3),
  }),

  seo: z.object({
    /** %s is replaced with the page title. */
    titleTemplate: z.string().includes("%s"),
    description: z.string(),
    /** Image URL or public path used as the default Open Graph image. */
    ogImage: z.string(),
  }),
});

export type StoreConfig = z.infer<ReturnType<typeof storeConfigSchema>>;

/* ========================================================================== */
/* EDIT BELOW THIS LINE                                                       */
/* ========================================================================== */

const config: StoreConfig = {
  store: {
    name: "Attar Demo Store",
    tagline: "Authentic fragrances. Never pay retail.",
    logo: null,
    orderNumberPrefix: "ATR",
  },

  contact: {
    phone: "+880 1700-000000",
    whatsapp: "+8801700000000",
    email: "hello@example.com",
    addressLines: ["House 1, Road 1, Gulshan", "Dhaka 1212, Bangladesh"],
    social: {
      facebook: "https://facebook.com/example",
      instagram: null,
      tiktok: null,
      youtube: null,
    },
  },

  currency: {
    code: "BDT",
    symbol: "৳",
    symbolPosition: "before",
    minorUnits: 0,
    thousandsSeparator: ",",
  },

  checkout: {
    deliveryZones: [
      {
        id: "inside-dhaka",
        label: "Inside Dhaka",
        fee: 70,
        etaDays: "1-2 days",
      },
      {
        id: "outside-dhaka",
        label: "Outside Dhaka",
        fee: 130,
        etaDays: "3-5 days",
      },
    ],
    freeDeliveryOver: 5000,
    paymentMethods: {
      cod: {
        enabled: true,
        label: "Cash on Delivery",
        instructions:
          "Pay in cash when your order arrives. Our team will call you to confirm before shipping.",
      },
      bkash: {
        enabled: true,
        number: "01700000000",
        accountType: "personal",
        instructions:
          "Send the total amount to the bKash number above (Send Money), then enter the Transaction ID (TrxID) below. We verify it during your confirmation call.",
      },
      nagad: {
        enabled: false,
        number: null,
        accountType: "personal",
        instructions: "",
      },
    },
    confirmationNote:
      "After you place the order, our team will call you within a few hours to confirm it. Nothing ships before you confirm on the phone.",
  },

  features: {
    wishlist: true,
    reviews: true,
    coupons: true,
    recentlyViewed: true,
    dealBadges: true,
  },

  catalog: {
    pageSize: 24,
    lowStockThreshold: 3,
    newArrivalDays: 30,
  },

  theme: {
    primary: "#343E32",
    deal: "#343E32",
    radius: "sm",
  },

  announcementBar: {
    enabled: true,
    messages: [
      {
        text: "End of season sale: up to 40% off",
        href: "/products?deal=true",
      },
      { text: "Free delivery on orders over ৳5,000", href: null },
    ],
  },

  seo: {
    titleTemplate: "%s | Attar Demo Store",
    description:
      "Shop authentic designer, niche and Arabian fragrances at the best prices in Bangladesh. Cash on delivery available nationwide.",
    ogImage: "/opengraph-image",
  },
};

/* ========================================================================== */
/* DO NOT EDIT BELOW THIS LINE                                                */
/* ========================================================================== */

export const storeConfig: StoreConfig = config;

/** Called from next.config.ts (dev, build, start) and the test suite. */
export function validateStoreConfig() {
  const parsed = storeConfigSchema().safeParse(config);
  if (!parsed.success)
    throw new Error(`Invalid store.config.ts:\n${z.prettifyError(parsed.error)}`);
}
