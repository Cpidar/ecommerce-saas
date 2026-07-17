"use server"

import type { Product } from "@/types"
import { fetchProductsById, searchProducts } from "./medusa/search"

/**
 * Client-side product search for the Cmd+K modal and other client surfaces.
 * Returns a minimal shape that matches what `Product` consumers (ProductCard,
 * SearchModal results) need to render — `images`, `variants[0].price`, etc.
 */
export async function searchProductsClient(
  query: string,
  limit = 6
): Promise<Product[]> {
    const products = await searchProducts(query, limit)
    return products

}

/**
 * Hydrate a set of products by ID (used by wishlist + recently viewed).
 * Returns only the products that still exist.
 */
export async function fetchProductsByIdClient(
  ids: string[]
): Promise<Product[]> {
  const products = await fetchProductsById(ids)
  return products
}
