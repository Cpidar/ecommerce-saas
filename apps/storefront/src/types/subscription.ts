import type { HttpTypes } from "@medusajs/types"

export type ReorderSubscriptionFrequencyInterval = "week" | "month" | "year"
export type SubscriptionPurchaseMode = "one-time" | "subscribe"
export type CartPurchaseMode =
  | "empty"
  | "one-time"
  | "subscription"
  | "mixed"

export type ReorderSubscriptionStatus =
  | "active"
  | "paused"
  | "cancelled"
  | "past_due"

export type ReorderCancellationCaseStatus =
  | "requested"
  | "evaluating_retention"
  | "retention_offered"
  | "retained"
  | "paused"
  | "canceled"

export type ReorderCancellationReasonCategory =
  | "price"
  | "product_fit"
  | "delivery"
  | "billing"
  | "temporary_pause"
  | "switched_competitor"
  | "other"

export type ReorderSubscriptionLineItemMetadataInput = {
  is_subscription: true
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  subscription_discount?: {
    discount_type: "percentage" | "fixed"
    discount_value: number
    label?: string | null
  } | null
}

export type SubscriptionLineItemMetadata = {
  is_subscription: boolean
  frequency_interval: ReorderSubscriptionFrequencyInterval | null
  frequency_value: number | null
}

export type SubscriptionLineItemPricingMetadata = {
  discount_type: "percentage" | "fixed"
  discount_value: number
  label: string | null
}

export type ReorderSubscriptionCartMetadata = {
  purchase_mode?: "subscription"
  subscription_checkout?: {
    agreement_accepted?: boolean
    agreement_accepted_at?: string | null
    agreement_version?: string | null
  }
}

export type SubscriptionCartMetadata = {
  purchase_mode?: "subscription"
  subscription_checkout?: {
    agreement_accepted?: boolean
    agreement_accepted_at?: string | null
    agreement_version?: string | null
  }
}

export type SubscriptionFrequencyOption = {
  interval: ReorderSubscriptionFrequencyInterval
  value: number
  label: string
}

export type SubscriptionOfferSource =
  | "store-api"
  | "variant-metadata"
  | "product-metadata"
  | "config"
  | "none"

export type SubscriptionOfferFrequencyOption = {
  id: string
  label: string
  display_days: number | null
  backend_interval: ReorderSubscriptionFrequencyInterval | null
  backend_value: number | null
  is_backend_compatible: boolean
  discount?: SubscriptionOfferDiscount | null
}

export type SubscriptionOfferDiscount = {
  discount_type: "percentage" | "fixed"
  discount_value: number
  label: string | null
}

export type ProductSubscriptionOffer = {
  is_enabled: boolean
  source: SubscriptionOfferSource
  one_time_label: string
  subscribe_label: string
  info_text: string | null
  frequency_options: SubscriptionOfferFrequencyOption[]
  discount: SubscriptionOfferDiscount | null
}

export type ReorderStoreSubscriptionOfferFrequency = {
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  label: string
  discount: {
    type: "percentage" | "fixed"
    value: number
  } | null
}

export type ReorderStoreProductSubscriptionOfferResponse = {
  subscription_offer: {
    is_subscription_available: boolean
    product_id: string
    variant_id: string | null
    source_offer_id: string | null
    source_scope: "product" | "variant" | null
    allowed_frequencies: ReorderStoreSubscriptionOfferFrequency[]
    discount_semantics: {
      has_frequency_specific_discounts: boolean
    }
    minimum_cycles: number | null
    trial: {
      is_enabled: boolean
      days: number | null
    } | null
  }
}

export type ReorderSubscriptionCustomerSnapshot = {
  email: string
  full_name: string | null
}

export type ReorderSubscriptionProductSnapshot = {
  product_id: string
  product_title: string
  variant_id: string
  variant_title: string
  sku: string | null
}

export type ReorderSubscriptionPricingSnapshot = {
  discount_type: "percentage" | "fixed"
  discount_value: number
  label: string | null
}

export type ReorderSubscriptionShippingAddress = {
  first_name: string
  last_name: string
  company: string | null
  address_1: string
  address_2: string | null
  city: string
  postal_code: string
  province: string | null
  country_code: string
  phone: string | null
}

export type ReorderSubscriptionPaymentContext = {
  payment_provider_id: string | null
  source_payment_collection_id: string | null
  source_payment_session_id: string | null
  payment_method_reference: string | null
  customer_payment_reference: string | null
}

export type ReorderSubscriptionPendingUpdateData = {
  variant_id: string
  variant_title: string
  sku: string | null
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  effective_at: string | null
  requested_at: string
  requested_by: string | null
}

export type ReorderSubscriptionRecord = {
  id: string
  reference: string
  status: ReorderSubscriptionStatus
  customer_id: string
  cart_id: string | null
  product_id: string
  variant_id: string
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  started_at: string
  next_renewal_at: string | null
  last_renewal_at: string | null
  paused_at: string | null
  cancelled_at: string | null
  cancel_effective_at: string | null
  skip_next_cycle: boolean
  is_trial: boolean
  trial_ends_at: string | null
  customer_snapshot: ReorderSubscriptionCustomerSnapshot | null
  product_snapshot: ReorderSubscriptionProductSnapshot | null
  pricing_snapshot: ReorderSubscriptionPricingSnapshot | null
  shipping_address: ReorderSubscriptionShippingAddress | null
  payment_context: ReorderSubscriptionPaymentContext | null
  pending_update_data: ReorderSubscriptionPendingUpdateData | null
  metadata: Record<string, unknown> | null
}

export type ReorderSubscriptionCheckoutOrderSummary = {
  id: string
  display_id?: string | number | null
  created_at: string
}

export type ReorderStoreSubscriptionCheckoutResponse = {
  type: "order"
  order: ReorderSubscriptionCheckoutOrderSummary
  subscription: ReorderSubscriptionRecord
}

export type ReorderCustomerSubscriptionListItem = {
  id: string
  reference: string
  status: ReorderSubscriptionStatus
  created_at: string | null
  product_title: string | null
  variant_title: string | null
  next_renewal_at: string | null
  effective_next_renewal_at: string | null
  active_cancellation_case: {
    id: string
    status: ReorderCancellationCaseStatus
  } | null
}

export type ReorderStoreCustomerSubscriptionsResponse = {
  subscriptions: ReorderCustomerSubscriptionListItem[]
}

export type CustomerSubscriptionSummary = ReorderCustomerSubscriptionListItem

export type ReorderSubscriptionPaymentRecovery = {
  dunning_case_id: string
  state: string
  retry_eligible: boolean
  attempt_count: number
  max_attempts: number
  next_retry_at: string | null
  last_error_code: string | null
  last_error_message: string | null
  last_attempt_status: string | null
}

export type ReorderRetrySubscriptionPaymentRequest = {
  reason?: string
}

export type ReorderStoreCustomerSubscriptionDetailResponse = {
  subscription: {
    id: string
    reference: string
    status: ReorderSubscriptionStatus
    product_id: string
    variant_id: string
    product_title: string | null
    variant_title: string | null
    frequency_interval: ReorderSubscriptionFrequencyInterval
    frequency_value: number
    skip_next_cycle: boolean
    next_renewal_at: string | null
    effective_next_renewal_at: string | null
    last_renewal_at: string | null
    shipping_address: ReorderSubscriptionShippingAddress | null
    payment_status: string
    payment_provider_id: string | null
    payment_recovery: ReorderSubscriptionPaymentRecovery | null
    scheduled_plan_change: {
      variant_id: string
      variant_title: string | null
      sku: string | null
      frequency_interval: ReorderSubscriptionFrequencyInterval
      frequency_value: number
      effective_at: string | null
      requested_at: string | null
    } | null
    scheduled_frequency_change: {
      frequency_interval: ReorderSubscriptionFrequencyInterval
      frequency_value: number
      effective_at: string | null
      requested_at: string | null
    } | null
    available_frequencies: Array<{
      frequency_interval: ReorderSubscriptionFrequencyInterval
      frequency_value: number
      label: string
    }>
    active_cancellation_case: {
      id: string
      status: ReorderCancellationCaseStatus
    } | null
  }
}

export type ReorderStartCancellationRequest = {
  reason: string
  reason_category?: ReorderCancellationReasonCategory
  notes?: string
  metadata?: Record<string, unknown>
}

export type ReorderStoreStartCancellationResponse = {
  cancellation_case: {
    id: string
    status: ReorderCancellationCaseStatus
    subscription_id: string
    reason: string | null
    reason_category: ReorderCancellationReasonCategory | null
    notes: string | null
    created_at: string
    updated_at: string
  }
}

export type ReorderCustomerSubscriptionDetail =
  ReorderStoreCustomerSubscriptionDetailResponse["subscription"]
export type CustomerSubscriptionDetail = ReorderCustomerSubscriptionDetail

export type SubscriptionGroupedCartItems = {
  subscriptionItems: HttpTypes.StoreCartLineItem[]
  oneTimeItems: HttpTypes.StoreCartLineItem[]
}

export type SubscriptionPriceSummary = {
  originalAmount: number
  subscriptionAmount: number
  currencyCode: string
  percentageDiff: string | null
  formattedOriginalAmount: string
  formattedSubscriptionAmount: string
}

export type SubscriptionCapabilities = {
  canListSubscriptions: boolean
  canViewSubscriptionDetail: boolean
  canStartCancellation: boolean
  canCompleteSubscriptionCheckout: boolean
  canManageFrequency: boolean
  canPauseResume: boolean
  canRetryPayment: boolean
  canSwapProduct: boolean
  canOverrideAddress: boolean
  canSkipNextDelivery: boolean
  canUseMixedCartCheckout: boolean
}

export type ReorderPauseSubscriptionRequest = {
  reason?: string
  effective_at?: string
}

export type ReorderResumeSubscriptionRequest = {
  resume_at?: string
  preserve_billing_anchor?: boolean
}

export type ReorderChangeSubscriptionFrequencyRequest = {
  variant_id: string
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  effective_at?: string
}

export type ReorderUpdateSubscriptionAddressRequest =
  ReorderSubscriptionShippingAddress

export type ReorderSwapSubscriptionProductRequest = {
  variant_id: string
  frequency_interval: ReorderSubscriptionFrequencyInterval
  frequency_value: number
  effective_at?: string
}
