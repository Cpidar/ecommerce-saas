import "server-only"
import { cacheTag, cacheLife, revalidateTag } from "next/cache"
import type { HttpTypes } from "@medusajs/types"
import type { Product } from "@/types"
import { sdk } from "../medusa"
import { resolveRegion } from "../medusa-region"
import { getCurrentStoreHeader, getCurrentStoreId } from "./cookies"

// ---------------------------------------------------------------------------
// Tenant-aware tags
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

const searchTags = {
    all: (storeId: string) => getTenantTag(storeId, "search"),
}

// ---------------------------------------------------------------------------
// Optimized fields for search (minimal payload)
// ---------------------------------------------------------------------------
const SEARCH_FIELDS = [
    "id",
    "title",
    "handle",
    "subtitle",
    "thumbnail",
    "created_at",
    "updated_at",
    "variants(id,title,sku,calculated_price)",
].join(",")

// ---------------------------------------------------------------------------
// Shared minimal transform (matches your client version)
// ---------------------------------------------------------------------------
function transformSearchProduct(p: HttpTypes.StoreProduct, currency: string): Product {
    const v = p.variants?.[0]
    const calculated = (v as any)?.calculated_price

    return {
        id: p.id,
        name: p.title ?? "",
        slug: p.handle ?? p.id,
        description: p.subtitle ?? "",
        body: undefined,
        images: p.thumbnail ? [{ url: p.thumbnail, alt: p.title ?? "" }] : [],
        status: "active",
        brandId: "",
        categoryIds: [],
        tags: [],
        variants: v
            ? [
                {
                    id: v.id,
                    productId: p.id,
                    sku: v.sku ?? "",
                    name: v.title ?? "",
                    price: calculated?.calculated_amount ?? 0,
                    currency,
                    inventory: { quantity: 0, trackInventory: false, allowBackorder: false },
                    options: [],
                    images: [],
                },
            ]
            : [],
        rating: 0,
        reviewCount: 0,
        featured: false,
        createdAt: p.created_at ?? "",
        updatedAt: p.updated_at ?? "",
    }
}

// ---------------------------------------------------------------------------
// Cached Search (uses "search" cacheLife as requested)
// ---------------------------------------------------------------------------
async function fetchSearchProducts(
    query: string,
    limit: number = 6,
    storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
    storeId: string,
    currency: string
): Promise<Product[]> {
    // "use cache"
    // cacheTag(searchTags.all(storeId))
    // cacheLife("hours")                    // ← as requested

    const { products } = await sdk.store.product.list(
        {
            q: query,
            region_id: await resolveRegion().then(r => r.id), // reuse your region logic
            fields: SEARCH_FIELDS,
            limit,
        },
        { ...storeHeaders }
    )

    return products.map((p) => transformSearchProduct(p, currency))
}

// ---------------------------------------------------------------------------
// Cached fetch by IDs
// ---------------------------------------------------------------------------
async function fetchProductsByIds(
    ids: string[],
    storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
    storeId: string,
    currency: string
): Promise<Product[]> {

    // "use cache"
    // cacheTag(searchTags.all(storeId))
    // cacheLife("hours")

    if (ids.length === 0) return []

    const { products } = await sdk.store.product.list(
        {
            id: ids,
            region_id: await resolveRegion().then(r => r.id),
            fields: SEARCH_FIELDS,
            limit: ids.length,
        },
        { ...storeHeaders }
    )

    return products.map((p) => transformSearchProduct(p, currency))
}

// ---------------------------------------------------------------------------
// Public API (Server Functions)
// ---------------------------------------------------------------------------
export async function searchProducts(query: string, limit = 6): Promise<Product[]> {
    const { storeHeaders, storeId, currency } = await resolveContextForSearch()
    return fetchSearchProducts(query, limit, storeHeaders, storeId, currency)
}

export async function fetchProductsById(ids: string[]): Promise<Product[]> {
    const { storeHeaders, storeId, currency } = await resolveContextForSearch()
    return fetchProductsByIds(ids, storeHeaders, storeId, currency)
}

// Internal context resolver
async function resolveContextForSearch() {
    const [region, storeId, storeHeaders] = await Promise.all([resolveRegion(), getCurrentStoreId(), getCurrentStoreHeader()])
    return {
        storeHeaders,
        storeId,
        currency: region.currency,
    }
}

// ---------------------------------------------------------------------------
// Revalidation Helper (for webhooks)
// ---------------------------------------------------------------------------
export const searchRevalidation = {
    async all(storeId: string) {
        await revalidateTag(searchTags.all(storeId), "search")
    },
}