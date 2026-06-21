import type { SubscriptionCapabilities } from "../../types/subscription"

const DEFAULT_SUBSCRIPTION_CAPABILITIES: SubscriptionCapabilities = {
  canListSubscriptions: true,
  canViewSubscriptionDetail: true,
  canStartCancellation: true,
  canCompleteSubscriptionCheckout: true,
  canManageFrequency: true,
  canPauseResume: true,
  canRetryPayment: true,
  canSwapProduct: true,
  canOverrideAddress: true,
  canSkipNextDelivery: true,
  canUseMixedCartCheckout: false,
}

export function getSubscriptionCapabilities(): SubscriptionCapabilities {
  return {
    canListSubscriptions: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_LIST_SUBSCRIPTIONS",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canListSubscriptions
    ),
    canViewSubscriptionDetail: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_VIEW_SUBSCRIPTION_DETAIL",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canViewSubscriptionDetail
    ),
    canStartCancellation: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_START_CANCELLATION",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canStartCancellation
    ),
    canCompleteSubscriptionCheckout: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_COMPLETE_SUBSCRIPTION_CHECKOUT",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canCompleteSubscriptionCheckout
    ),
    canManageFrequency: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_MANAGE_FREQUENCY",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canManageFrequency
    ),
    canPauseResume: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_PAUSE_RESUME",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canPauseResume
    ),
    canRetryPayment: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_RETRY_PAYMENT",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canRetryPayment
    ),
    canSwapProduct: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_SWAP_PRODUCT",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canSwapProduct
    ),
    canOverrideAddress: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_OVERRIDE_ADDRESS",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canOverrideAddress
    ),
    canSkipNextDelivery: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_SKIP_NEXT_DELIVERY",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canSkipNextDelivery
    ),
    canUseMixedCartCheckout: readCapabilityEnv(
      "NEXT_PUBLIC_REORDER_CAN_USE_MIXED_CART_CHECKOUT",
      DEFAULT_SUBSCRIPTION_CAPABILITIES.canUseMixedCartCheckout
    ),
  }
}

export const subscriptionCapabilities = getSubscriptionCapabilities()

function readCapabilityEnv(key: string, fallback: boolean) {
  const value = process.env[key]

  if (value === "true") {
    return true
  }

  if (value === "false") {
    return false
  }

  return fallback
}
