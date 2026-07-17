import type { Brand } from "@/types"
import { sdk } from "@/lib/medusa"
import { getCurrentStoreHeader, getCurrentStoreId } from "../medusa/cookies"
import { cacheTag, cacheLife } from "next/cache"

/**
 * Medusa v2 has no native "brand" concept. This repository derives brands
 * from product `type.value`. A custom Medusa module can add first-class
 * brands later; the repository interface stays the same.
 *
 * Convention: a product's `type` is treated as its brand.
 *   - type.id     → brand.id
 *   - type.value  → brand.name
 *   - slugified   → brand.slug
 */

// ---------------------------------------------------------------------------
// Tenant-aware cache tags
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

const brandTags = {
  all: (storeId: string) => getTenantTag(storeId, "brands"),
  byHandle: (storeId: string, slug: string) => getTenantTag(storeId, `brands:${slug}`),
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

let cache: Promise<Brand[]> | null = null

// ---------------------------------------------------------------------------
// Cached fetcher
// ---------------------------------------------------------------------------

async function fetchAllBrands(
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  storeId: string
): Promise<Brand[]> {
  "use cache"
  cacheTag(brandTags.all(storeId))
  cacheLife("catalogRef")   // or "days" / "weeks" depending on how often collections change


  if (!cache) {
    cache = sdk.store.product
      .list({ fields: "id,type", limit: 200 }, { ...storeHeaders })
      .then(({ products }) => {
        const seen = new Map<string, Brand>()
        for (const p of products) {
          if (!p.type || !p.type.value) continue
          if (seen.has(p.type.id)) continue
          seen.set(p.type.id, {
            id: p.type.id,
            name: p.type.value,
            slug: slugify(p.type.value),
            description: "",
          })
        }
        return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name))
      })
  }
  return cache
}

export const medusaBrandRepository = {
  async list(): Promise<Brand[]> {
    const storeId = await getCurrentStoreId()
    const storeHeaders = await getCurrentStoreHeader()

    return fetchAllBrands(storeHeaders, storeId)
  },

  async getBySlug(slug: string): Promise<Brand | null> {
    const storeId = await getCurrentStoreId()
    const storeHeaders = await getCurrentStoreHeader()

    const all = await fetchAllBrands(storeHeaders, storeId)
    return all.find((b) => b.slug === slug) ?? null
  },

  async getById(id: string): Promise<Brand | null> {
    const storeId = await getCurrentStoreId()
    const storeHeaders = await getCurrentStoreHeader()

    const all = await fetchAllBrands(storeHeaders, storeId)
    return all.find((b) => b.id === id) ?? null
  },
}
