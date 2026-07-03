import type {
  CartPurchaseMode,
  ReorderSubscriptionFrequencyInterval,
  SubscriptionCartMetadata,
  ReorderSubscriptionPricingSnapshot,
  SubscriptionLineItemPricingMetadata,
  SubscriptionFrequencyOption,
  SubscriptionGroupedCartItems,
  SubscriptionLineItemMetadata,
  SubscriptionPriceSummary,
  SubscriptionPurchaseMode,
} from "../../types/subscription"
import { Cart, CartItem, Order } from "@/types"
import { formatPrice, getPercentageDiff } from "./utils"

const DEFAULT_LOCALE = "en-US"

export function parseSubscriptionLineItemMetadata(
  metadata?: Record<string, unknown> | null
): SubscriptionLineItemMetadata {
  const isSubscription =
    metadata?.is_subscription === true || metadata?.is_subscription === "true"

  const rawInterval = metadata?.frequency_interval
  const frequencyInterval = isFrequencyInterval(rawInterval) ? rawInterval : null

  const rawValue = metadata?.frequency_value
  const parsedValue =
    typeof rawValue === "number"
      ? rawValue
      : typeof rawValue === "string"
        ? Number.parseInt(rawValue, 10)
        : Number.NaN

  return {
    is_subscription: isSubscription,
    frequency_interval: frequencyInterval,
    frequency_value:
      Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null,
  }
}

export function parseSubscriptionLineItemPricingMetadata(
  metadata?: Record<string, unknown> | null
): SubscriptionLineItemPricingMetadata | null {
  const raw = metadata?.subscription_discount

  if (!raw || typeof raw !== "object") {
    return null
  }

  const value = raw as Record<string, unknown>
  const discountType = value.discount_type
  const discountValue = value.discount_value

  if (
    (discountType !== "percentage" && discountType !== "fixed") ||
    typeof discountValue !== "number"
  ) {
    return null
  }

  return {
    discount_type: discountType,
    discount_value: discountValue,
    label: typeof value.label === "string" ? value.label : null,
  }
}

export function getSubscriptionPurchaseMode(
  item: CartItem
): SubscriptionPurchaseMode {
  return parseSubscriptionLineItemMetadata(item.metadata).is_subscription
    ? "subscribe"
    : "one-time"
}

export function formatNextDeliveryDate(
  value?: string | Date | null,
  locale = DEFAULT_LOCALE
) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function formatSubscriptionCadence(
  interval?: ReorderSubscriptionFrequencyInterval | null,
  value?: number | null
) {
  if (!interval || !value) {
    return null
  }

  const unit = value === 1 ? interval : `${interval}s`

  return `Every ${value} ${unit}`
}

export function getEstimatedNextDeliveryDate(
  interval?: ReorderSubscriptionFrequencyInterval | null,
  value?: number | null
) {
  if (!interval || !value) {
    return null
  }

  const next = new Date()

  switch (interval) {
    case "week":
      next.setDate(next.getDate() + value * 7)
      return next
    case "month":
      next.setMonth(next.getMonth() + value)
      return next
    case "year":
      next.setFullYear(next.getFullYear() + value)
      return next
    default:
      return null
  }
}

export function getSubscriptionPriceSummary({
  amount,
  currencyCode,
  pricingSnapshot,
  locale = DEFAULT_LOCALE,
}: {
  amount: number
  currencyCode: string
  pricingSnapshot?: ReorderSubscriptionPricingSnapshot | null
  locale?: string
}): SubscriptionPriceSummary {
  const subscriptionAmount = applySubscriptionDiscount(amount, pricingSnapshot)

  return {
    originalAmount: amount,
    subscriptionAmount,
    currencyCode,
    percentageDiff:
      subscriptionAmount < amount
        ? getPercentageDiff(amount, subscriptionAmount)
        : null,
    formattedOriginalAmount: formatPrice(amount, currencyCode),
    formattedSubscriptionAmount: formatPrice(subscriptionAmount, currencyCode),
  }
}

export function getDisplayCartTotals(
  cart?: Cart
) {
  const items = cart?.items ?? []

  const adjustedItemSubtotal = items.reduce((sum, item) => {
    const pricingMetadata = parseSubscriptionLineItemPricingMetadata(item.metadata)
    const baseAmount = item.price ?? item.price ?? 0
    const displayAmount = parseSubscriptionLineItemMetadata(item.metadata)
      .is_subscription && pricingMetadata
      ? getSubscriptionPriceSummary({
          amount: baseAmount,
          currencyCode: cart?.currency ?? "",
          pricingSnapshot: pricingMetadata,
        }).subscriptionAmount
      : item.lineTotal ?? 0

    return sum + displayAmount
  }, 0)

  const rawItemSubtotal =
    // cart?.item_subtotal ??
    cart?.subtotal ??
    items.reduce((sum, item) => sum + (item.lineTotal ?? 0), 0)
  const subscriptionDiscountDelta = Math.max(
    0,
    rawItemSubtotal - adjustedItemSubtotal
  )
  const baseDiscountSubtotal =
    // cart?.discount_subtotal ??
    cart?.discount ??
    0
  const rawTotal =
    cart?.total ??
    Math.max(
      0,
      rawItemSubtotal +
        (cart?.shipping ?? 0) - baseDiscountSubtotal
    )

  return {
    ...cart,
    item_subtotal: adjustedItemSubtotal,
    discount_subtotal: baseDiscountSubtotal + subscriptionDiscountDelta,
    total: Math.max(0, rawTotal - subscriptionDiscountDelta),
  }
}

export function groupCartItemsBySubscription(
  items: CartItem[] = []
): SubscriptionGroupedCartItems {
  return items.reduce<SubscriptionGroupedCartItems>(
    (result, item) => {
      if (getSubscriptionPurchaseMode(item) === "subscribe") {
        result.subscriptionItems.push(item)
      } else {
        result.oneTimeItems.push(item)
      }

      return result
    },
    {
      subscriptionItems: [],
      oneTimeItems: [],
    }
  )
}

export function hasMixedSubscriptionCart(
  items: CartItem[] = []
) {
  const groupedItems = groupCartItemsBySubscription(items)

  return (
    groupedItems.subscriptionItems.length > 0 &&
    groupedItems.oneTimeItems.length > 0
  )
}

export function getCartPurchaseMode(
  cart?: Pick<Cart, "items"> | null
): CartPurchaseMode {
  const groupedItems = groupCartItemsBySubscription(cart?.items ?? [])

  if (
    groupedItems.subscriptionItems.length > 0 &&
    groupedItems.oneTimeItems.length > 0
  ) {
    return "mixed"
  }

  if (groupedItems.subscriptionItems.length > 0) {
    return "subscription"
  }

  if (groupedItems.oneTimeItems.length > 0) {
    return "one-time"
  }

  return "empty"
}

export function hasSubscriptionAgreement(
  cart?: Pick<Cart, "metadata"> | null
) {
  const metadata = cart?.metadata as SubscriptionCartMetadata | null | undefined

  return metadata?.subscription_checkout?.agreement_accepted === true
}

export function formatSubscriptionFrequencyOption(
  option: SubscriptionFrequencyOption
) {
  const unit = option.value === 1 ? option.interval : `${option.interval}s`

  return `Every ${option.value} ${unit}`
}

export function buildSubscriptionFrequencyOption(
  interval: ReorderSubscriptionFrequencyInterval,
  value: number,
  label?: string
): SubscriptionFrequencyOption {
  return {
    interval,
    value,
    label: label ?? formatSubscriptionFrequencyOption({ interval, value, label: "" }),
  }
}

function applySubscriptionDiscount(
  amount: number,
  pricingSnapshot?: ReorderSubscriptionPricingSnapshot | null
) {
  if (!pricingSnapshot) {
    return amount
  }

  if (pricingSnapshot.discount_type === "percentage") {
    return Math.max(0, amount - amount * (pricingSnapshot.discount_value / 100))
  }

  return Math.max(0, amount - pricingSnapshot.discount_value)
}

function isFrequencyInterval(
  value: unknown
): value is ReorderSubscriptionFrequencyInterval {
  return value === "week" || value === "month" || value === "year"
}
