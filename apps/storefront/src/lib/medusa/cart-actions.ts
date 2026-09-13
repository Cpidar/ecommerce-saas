/**
 * cart-actions.ts — Server action bridge for client components.
 *
 * This file wraps `cart-server.ts` (which is intentionally left untouched) and
 * adapts its functions to the signatures/components expect. All public
 * functions here run on the server, so browser-side code never calls the Medusa
 * SDK directly — every request flows through RSC actions.
 *
 * - Re-exports everything `cart-server.ts` already exports.
 * - Bridges missing helpers (`listPaymentProviders`, `retrieveOrder`,
 *   `getAppliedPromotionCodes`, etc.).
 * - Normalises different call conventions between old `cart-client` and the new
 *   `cart-server` so client components can keep a single import path.
 */

"use server"

import type { HttpTypes } from "@medusajs/types"
import { retrieveCart, setShippingMethod, initiatePaymentSession as initiatePaymentSessionCartServer, placeOrder, setAddresses, listCartOptions, applyPromotions } from "./cart-server"
import { productRepository } from "../repositories"
import { siteConfigRepository } from "../repositories/site-configs"

// Types
export interface ActivePaymentSession {
  id: string
  provider_id: string
  amount?: number
  data: Record<string, unknown>
}

export interface ShippingOption {
  id: string
  name: string
  amount: number
  priceType: string
}

export interface PaymentProviderInfo {
  id: string
  isEnabled: boolean
}

export interface CheckoutAddress {
  first_name: string
  last_name: string
  address_1: string
  address_2?: string
  city: string
  province?: string
  postal_code: string
  country_code: string
  phone?: string
  company?: string
}

// Wrappers for functions cart-server has but with different signatures
export async function addShippingMethod(optionId: string): Promise<void> {
  const cartId = (await retrieveCart())?.id
  if (!cartId) throw new Error("No cart found")
  await setShippingMethod({ cartId, shippingMethodId: optionId })
}

export async function initiatePaymentSession(
  providerId: string,
  data?: Record<string, unknown>
): Promise<{ cart: HttpTypes.StoreCart; session: ActivePaymentSession | null }> {
  const cart = await retrieveCart()
  if (!cart) throw new Error("No cart found")
  await initiatePaymentSessionCartServer(cart, {
    provider_id: providerId,
    data,
  } as HttpTypes.StoreInitializePaymentSession)
  const updatedCart = await retrieveCart()
  const session = findActiveSession(updatedCart, providerId)
  return { cart: updatedCart!, session }
}

function findActiveSession(cart: HttpTypes.StoreCart | null, providerId: string): ActivePaymentSession | null {
  const pc = cart?.payment_collection as HttpTypes.StorePaymentCollection | undefined
  const sessions = pc?.payment_sessions ?? []
  const match = sessions.find((s) => s.provider_id === providerId) ?? sessions[0]
  if (!match) return null
  return {
    id: match.id,
    provider_id: match.provider_id ?? providerId,
    amount: match.amount as number | undefined,
    data: (match.data ?? {}) as Record<string, unknown>,
  }
}

export async function completeCart(): Promise<
  | { type: "order"; order: HttpTypes.StoreOrder }
  | { type: "cart"; cart: HttpTypes.StoreCart; error?: string }
> {
  const cartId = (await retrieveCart())?.id
  if (!cartId) throw new Error("No cart found")
  // placeOrder calls redirect() on success, so if it returns we have a cart (failure case)
  try {
    const result = await placeOrder(cartId)
    return { type: "cart", cart: result }
  } catch (e: any) {
    if (e?.digest === "NEXT_REDIRECT") throw e // re-throw redirect
    // Handle medusaError thrown by placeOrder
    const updated = await retrieveCart()
    return { type: "cart", cart: updated!, error: e?.message }
  }
}

export async function updateCartContact(args: {
  email: string
  shipping_address: CheckoutAddress
  billing_address?: CheckoutAddress
}): Promise<HttpTypes.StoreCart> {
  const formData = new FormData()
  formData.append("email", args.email)
  formData.append("shipping_address.first_name", args.shipping_address.first_name)
  formData.append("shipping_address.last_name", args.shipping_address.last_name)
  formData.append("shipping_address.address_1", args.shipping_address.address_1)
  formData.append("shipping_address.address_2", args.shipping_address.address_2 ?? "")
  formData.append("shipping_address.company", args.shipping_address.company ?? "")
  formData.append("shipping_address.postal_code", args.shipping_address.postal_code)
  formData.append("shipping_address.city", args.shipping_address.city)
  formData.append("shipping_address.country_code", args.shipping_address.country_code)
  formData.append("shipping_address.province", args.shipping_address.province ?? "")
  formData.append("shipping_address.phone", args.shipping_address.phone ?? "")

  if (args.billing_address) {
    formData.append("same_as_billing", "off")
    formData.append("billing_address.first_name", args.billing_address.first_name)
    formData.append("billing_address.last_name", args.billing_address.last_name)
    formData.append("billing_address.address_1", args.billing_address.address_1)
    formData.append("billing_address.address_2", args.billing_address.address_2 ?? "")
    formData.append("billing_address.company", args.billing_address.company ?? "")
    formData.append("billing_address.postal_code", args.billing_address.postal_code)
    formData.append("billing_address.city", args.billing_address.city)
    formData.append("billing_address.country_code", args.billing_address.country_code)
    formData.append("billing_address.province", args.billing_address.province ?? "")
    formData.append("billing_address.phone", args.billing_address.phone ?? "")
  }

  const result = await setAddresses(null, formData)
  const cart = await retrieveCart()
  return cart!
}

export async function listShippingOptions(): Promise<ShippingOption[]> {
  const result = await listCartOptions()
  const options = result?.shipping_options ?? []
  return options.map((o: HttpTypes.StoreCartShippingOption) => ({
    id: o.id,
    name: o.name ?? "",
    amount: o.amount ?? 0,
    priceType: o.price_type ?? "flat",
  }))
}

export async function listPaymentProviders(): Promise<PaymentProviderInfo[]> {
  const cart = await retrieveCart()
  if (!cart?.region_id) return []

  // const payment_providers = await listCartPaymentMethods(cart.region_id)
  const shippingAndPaymentConfig = await siteConfigRepository.getShippingAndPaymentConfig()
  if (!shippingAndPaymentConfig) return []

  const payment_providers = Object.values(shippingAndPaymentConfig.payment_configs ?? {}).filter((p) => p.is_enabled)
  if (!payment_providers || payment_providers.length === 0) return []

  return payment_providers.map((p) => ({
    id: p.provider_id,
    isEnabled: (p as { is_enabled?: boolean }).is_enabled ?? true,
    config: p.config ?? {}
  }))
}

export async function getAppliedPromotionCodes(): Promise<string[]> {
  const cart = await retrieveCart()
  const promotions =
    (cart as { promotions?: Array<{ code?: string }> } | null)?.promotions ?? []
  return promotions.map((p) => p.code ?? "").filter(Boolean)
}


export async function applyPromotionCodes(codes: string[]): Promise<HttpTypes.StoreCart> {
  const cart = await retrieveCart()
  if (!cart?.id) throw new Error("No cart found")
  const result = await applyPromotions(codes)
  const updatedCart = await retrieveCart()
  return updatedCart!
}
