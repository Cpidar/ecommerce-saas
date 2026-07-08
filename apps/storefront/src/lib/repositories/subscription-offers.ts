import type { ReorderStoreProductSubscriptionOfferResponse } from "../../types/subscription"
import { sdk } from "../medusa"
import { medusaProductRepository } from "./products"

// export async function retrieveProductSubscriptionOffer(
// ) {
//   const cookies = await nextCookies()
//   const currentStoreId = cookies.get("current_store_id")?.value

//   if (!currentStoreId) {
//     return null
//   }

//   const product = await medusaProductRepository.getBySlug(currentStoreId)

//   if (!product?.id) {
//     return null
//   }

//   return sdk.client.fetch<ReorderStoreProductSubscriptionOfferResponse>(
//     `/store/products/${product.id}/subscription-offer`,
//     {
//       method: "GET",
//       cache: "no-store",
//     }
//   )
// }

export async function retrieveProductSubscriptionOffer(
  productId: string,
  variantId?: string | null
) {
  return sdk.client.fetch<ReorderStoreProductSubscriptionOfferResponse>(
    `/store/products/${productId}/subscription-offer`,
    {
      method: "GET",
      query: variantId ? { variant_id: variantId } : undefined,
      cache: "no-store",
    }
  )
}
