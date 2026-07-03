import type {
  ProductSubscriptionOffer,
  ReorderStoreProductSubscriptionOfferResponse,
  SubscriptionOfferDiscount,
  SubscriptionOfferFrequencyOption,
} from "../../types/subscription"
import { Product } from "@/types"

const DEFAULT_ONE_TIME_LABEL = "Buy once"
const DEFAULT_SUBSCRIBE_LABEL = "Subscribe & save"

export function mapStoreSubscriptionOffer(
  response?: ReorderStoreProductSubscriptionOfferResponse | null
): ProductSubscriptionOffer | null {
  const offer = response?.subscription_offer

  if (!offer?.is_subscription_available) {
    return null
  }

  const frequencyOptions = offer.allowed_frequencies.map((frequency) => ({
    id: `${frequency.frequency_interval}-${frequency.frequency_value}`,
    label:
      frequency.label ||
      formatFrequencyLabel(
        frequency.frequency_interval,
        frequency.frequency_value
      ),
    display_days: null,
    backend_interval: frequency.frequency_interval,
    backend_value: frequency.frequency_value,
    is_backend_compatible: true,
    discount: frequency.discount
      ? {
          discount_type: frequency.discount.type,
          discount_value: frequency.discount.value,
          label:
            frequency.discount.type === "percentage"
              ? `${frequency.discount.value}% off subscription`
              : `${frequency.discount.value} off subscription`,
        }
      : null,
  }))

  const primaryDiscount = pickPrimaryDiscount(offer.allowed_frequencies)

  return {
    is_enabled: true,
    source: "store-api",
    one_time_label: DEFAULT_ONE_TIME_LABEL,
    subscribe_label: DEFAULT_SUBSCRIBE_LABEL,
    info_text: buildOfferInfoText(offer.minimum_cycles, offer.trial?.days ?? null),
    frequency_options: frequencyOptions,
    discount: primaryDiscount,
  }
}

export function getProductSubscriptionOffer(
  product: Product,
  variantId?: string
): ProductSubscriptionOffer | null {
  const variantOffer = parseSubscriptionOfferMetadata(
    product.variants?.find((variant) => variant.id === variantId)?.metadata
  )

  if (variantOffer?.is_enabled) {
    return {
      ...variantOffer,
      source: "variant-metadata",
    }
  }

  const productOffer = parseSubscriptionOfferMetadata(product.metadata)

  if (productOffer?.is_enabled) {
    return {
      ...productOffer,
      source: "product-metadata",
    }
  }

  return null
}

export function hasProductSubscriptionOffer(
  product: Product,
  variantId?: string
) {
  return !!getProductSubscriptionOffer(product, variantId)
}

export function getBackendCompatibleFrequencyOptions(
  offer: ProductSubscriptionOffer | null
) {
  return (offer?.frequency_options ?? []).filter(
    (option) =>
      option.is_backend_compatible &&
      !!option.backend_interval &&
      !!option.backend_value
  )
}

export function getDefaultSubscriptionFrequencyOption(
  offer: ProductSubscriptionOffer | null
) {
  return getBackendCompatibleFrequencyOptions(offer)[0] ?? null
}

function pickPrimaryDiscount(
  frequencies: ReorderStoreProductSubscriptionOfferResponse["subscription_offer"]["allowed_frequencies"]
): SubscriptionOfferDiscount | null {
  const firstWithDiscount = frequencies.find((frequency) => !!frequency.discount)

  if (!firstWithDiscount?.discount) {
    return null
  }

  return {
    discount_type: firstWithDiscount.discount.type,
    discount_value: firstWithDiscount.discount.value,
    label:
      firstWithDiscount.discount.type === "percentage"
        ? `${firstWithDiscount.discount.value}% off subscription`
        : `${firstWithDiscount.discount.value} off subscription`,
  }
}

function buildOfferInfoText(minimumCycles: number | null, trialDays: number | null) {
  const parts: string[] = [
    "Recurring orders renew automatically until you update or cancel them.",
  ]

  if (minimumCycles && minimumCycles > 1) {
    parts.push(`Minimum ${minimumCycles} cycles apply.`)
  }

  if (trialDays && trialDays > 0) {
    parts.push(`${trialDays}-day trial available.`)
  }

  return parts.join(" ")
}

function formatFrequencyLabel(interval: string, value: number) {
  if (value === 1) {
    return `Every ${interval}`
  }

  return `Every ${value} ${interval}s`
}

function parseSubscriptionOfferMetadata(
  metadata?: Record<string, unknown> | null
): Omit<ProductSubscriptionOffer, "source"> | null {
  const raw = metadata?.subscription_offer

  if (!raw || typeof raw !== "object") {
    return null
  }

  const value = raw as Record<string, unknown>
  const frequencyOptions = Array.isArray(value.frequency_options)
    ? value.frequency_options
        .map(parseFrequencyOption)
        .filter(
          (option): option is SubscriptionOfferFrequencyOption => option !== null
        )
    : []

  return {
    is_enabled: value.is_enabled === true,
    one_time_label: readString(value.one_time_label) ?? DEFAULT_ONE_TIME_LABEL,
    subscribe_label:
      readString(value.subscribe_label) ?? DEFAULT_SUBSCRIBE_LABEL,
    info_text: readString(value.info_text),
    frequency_options: frequencyOptions,
    discount: parseDiscount(value.discount),
  }
}

function parseFrequencyOption(
  value: unknown
): SubscriptionOfferFrequencyOption | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const id = readString(record.id)
  const label = readString(record.label)
  const backendInterval = readBackendInterval(record.backend_interval)
  const backendValue = readPositiveInteger(record.backend_value)
  const displayDays = readPositiveInteger(record.display_days)
  const isBackendCompatible =
    record.is_backend_compatible === true &&
    !!backendInterval &&
    !!backendValue

  if (!id || !label) {
    return null
  }

  return {
    id,
    label,
    display_days: displayDays,
    backend_interval: backendInterval,
    backend_value: backendValue,
    is_backend_compatible: isBackendCompatible,
    discount: parseDiscount(record.discount),
  }
}

function parseDiscount(value: unknown): SubscriptionOfferDiscount | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const record = value as Record<string, unknown>
  const discountType = record.discount_type
  const discountValue =
    typeof record.discount_value === "number" ? record.discount_value : null

  if (
    (discountType !== "percentage" && discountType !== "fixed") ||
    discountValue === null
  ) {
    return null
  }

  return {
    discount_type: discountType,
    discount_value: discountValue,
    label: readString(record.label),
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length ? value : null
}

function readPositiveInteger(value: unknown) {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value
  }

  return null
}

function readBackendInterval(value: unknown) {
  return value === "week" || value === "month" || value === "year"
    ? value
    : null
}
