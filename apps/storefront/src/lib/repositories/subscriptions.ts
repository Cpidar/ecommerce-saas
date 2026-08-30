"use server"

import { sdk } from "../medusa"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeCartId,
  setSubscriptionId,
} from "../medusa/cookies"
import { revalidateTag } from "next/cache"
import type {
  ReorderChangeSubscriptionFrequencyRequest,
  ReorderCustomerSubscriptionDetail,
  ReorderCustomerSubscriptionListItem,
  ReorderPauseSubscriptionRequest,
  ReorderResumeSubscriptionRequest,
  ReorderStartCancellationRequest,
  ReorderStoreCustomerSubscriptionDetailResponse,
  ReorderStoreCustomerSubscriptionsResponse,
  ReorderStoreStartCancellationResponse,
  ReorderStoreSubscriptionCheckoutResponse,
  ReorderSwapSubscriptionProductRequest,
  ReorderUpdateSubscriptionAddressRequest,
} from "../../types/subscription"
import { medusaError } from "../medusa-error"
import { CARTS_CACHE_PROFILE, ORDERS_CACHE_PROFILE, SUBSCRIPTIONS_CACHE_PROFILE } from "../constants"


export async function revalidateIfPresent(tag: string) {
  const cacheTag = await getCacheTag(tag)

  if (cacheTag) {
    revalidateTag(cacheTag, "max")
  }
}

export async function listCustomerSubscriptions(): Promise<
  ReorderCustomerSubscriptionListItem[]
> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionsResponse>(
      "/store/customers/me/subscriptions",
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .then(({ subscriptions }) => subscriptions)
    .catch(medusaError)
}

export async function retrieveCustomerSubscription(
  id: string
): Promise<ReorderCustomerSubscriptionDetail> {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    )
    .then(({ subscription }) => subscription)
    .catch(medusaError)
}

export async function startSubscriptionCancellation(
  id: string,
  payload: ReorderStartCancellationRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreStartCancellationResponse>(
      `/store/customers/me/subscriptions/${id}/cancellation`,
      {
        method: "POST",
        headers,
        body: payload,
        cache: "no-store",
      }
    )
    .then(async ({ cancellation_case }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return cancellation_case
    })
    .catch(medusaError)
}

export async function pauseCustomerSubscription(
  id: string,
  payload?: ReorderPauseSubscriptionRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}/pause`,
      {
        method: "POST",
        headers,
        body: payload ?? {},
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function resumeCustomerSubscription(
  id: string,
  payload?: ReorderResumeSubscriptionRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}/resume`,
      {
        method: "POST",
        headers,
        body: payload ?? {},
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function skipNextDelivery(_id: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${_id}/skip-next-delivery`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function changeSubscriptionFrequency(
  id: string,
  payload: ReorderChangeSubscriptionFrequencyRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}/change-frequency`,
      {
        method: "POST",
        headers,
        body: payload,
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function swapSubscriptionProduct(
  id: string,
  payload: ReorderSwapSubscriptionProductRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}/swap-product`,
      {
        method: "POST",
        headers,
        body: payload,
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function retrySubscriptionPayment(_id: string) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${_id}/retry-payment`,
      {
        method: "POST",
        headers,
        body: {},
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function updateSubscriptionAddress(
  id: string,
  payload: ReorderUpdateSubscriptionAddressRequest
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<ReorderStoreCustomerSubscriptionDetailResponse>(
      `/store/customers/me/subscriptions/${id}/change-address`,
      {
        method: "POST",
        headers,
        body: payload,
        cache: "no-store",
      }
    )
    .then(async ({ subscription }) => {
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)
      return subscription
    })
    .catch(medusaError)
}

export async function completeSubscriptionCheckout(
  // cartId?: string,
  // countryCode?: string | null
) {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const cartId = await getCartId()
  if (!cartId) {
    return
  }

  const response = await sdk.client
    .fetch<ReorderStoreSubscriptionCheckoutResponse>(
      `/store/carts/${cartId}/subscribe`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      }
    )
    .then(async (response) => {
      await revalidateIfPresent(CARTS_CACHE_PROFILE)
      await revalidateIfPresent(ORDERS_CACHE_PROFILE)
      await revalidateIfPresent(SUBSCRIPTIONS_CACHE_PROFILE)

      return response
    })
    .catch(medusaError)

  if (response.type === "order") {
    removeCartId()
    setSubscriptionId(response.subscription.id)

    // if (countryCode) {
    //   redirect(
    //     `/${countryCode.toLowerCase()}/order/${response.order.id}/confirmed?subscription=created`
    //   )
    // }
  }

  return response
}
