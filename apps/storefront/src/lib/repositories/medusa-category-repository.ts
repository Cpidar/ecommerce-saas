import "server-only"

import type { HttpTypes } from "@medusajs/types"
import type { Category, CategoryImage, CategoryRepository } from "@/types"
import { sdk } from "@/lib/medusa"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { getCurrentStoreHeader, getCurrentStoreId } from "../medusa/cookies"

type StoreCategory = HttpTypes.StoreProductCategory & {
  product_category_image?: CategoryImage[]
}

// ---------------------------------------------------------------------------
// Tenant-aware cache tags
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

const categoryTags = {
  all: (storeId: string) => getTenantTag(storeId, "categories"),
  byId: (storeId: string, id: string) => getTenantTag(storeId, `category:${id}`),
  bySlug: (storeId: string, slug: string) => getTenantTag(storeId, `category:slug:${slug}`),
}

// ---------------------------------------------------------------------------
// Transform (unchanged)
// ---------------------------------------------------------------------------

function transformCategory(c: StoreCategory, order = 0): Category {

  const metadata = (c.metadata ?? {}) as Record<string, unknown>
  const thumbnail = c.product_category_image?.filter((img) => img.type === "thumbnail")[0]
  const images = c.product_category_image?.filter((img) => img.type === "image")
  return {
    id: c.id,
    name: c.name ?? "",
    slug: c.handle ?? c.id,
    description: c.description ?? "",
    image: images && images.map(img => ({ url: img.url, alt: c.name ?? "" })),
    thumbnail: thumbnail && { url: thumbnail.url, alt: c.name ?? "" },
    parentId: c.parent_category_id ?? undefined,
    order:
      typeof metadata.order === "number"
        ? metadata.order
        : c.rank ?? order,
  }
}

// ---------------------------------------------------------------------------
// Cached fetcher (moved dynamic context outside)
// ---------------------------------------------------------------------------
async function fetchAllCategories(
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  storeId: string
): Promise<Category[]> {
  "use cache"
  cacheTag(categoryTags.all(storeId))
  cacheLife("catalogRef")   // Adjust to "weeks" if categories change very rarely

  const { product_categories } = await sdk.store.category.list({
    limit: 200,
    fields: "id,name,handle,description,parent_category_id,rank,metadata,*product_category_image",
  }, { ...storeHeaders })

  return product_categories
    .map((c, idx) => transformCategory(c, idx))
    .sort((a, b) => a.order - b.order)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const medusaCategoryRepository: CategoryRepository & {
  getChildren(parentId: string): Promise<Category[]>
  getTopLevel(): Promise<Category[]>
  getAncestors(categoryId: string): Promise<Category[]>
} = {
  async list() {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    return fetchAllCategories(storeHeaders, storeId)
  },

  async getBySlug(slug) {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    const all = await fetchAllCategories(storeHeaders, storeId)
    return all.find((c) => c.slug === slug) ?? null
  },

  async getById(id) {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    const all = await fetchAllCategories(storeHeaders, storeId)
    return all.find((c) => c.id === id) ?? null
  },

  async getChildren(parentId) {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    const all = await fetchAllCategories(storeHeaders, storeId)
    return all
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  },

  async getTopLevel() {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    const all = await fetchAllCategories(storeHeaders, storeId)
    return all.filter((c) => !c.parentId).sort((a, b) => a.order - b.order)
  },

  async getAncestors(categoryId) {
    const storeHeaders = await getCurrentStoreHeader()
    const storeId = await getCurrentStoreId()
    const all = await fetchAllCategories(storeHeaders, storeId)
    const chain: Category[] = []
    let current = all.find((c) => c.id === categoryId)
    while (current) {
      chain.unshift(current)
      current = current.parentId
        ? all.find((c) => c.id === current!.parentId)
        : undefined
    }
    return chain
  },
}

// ---------------------------------------------------------------------------
// Revalidation Helpers (for Medusa webhooks)
// ---------------------------------------------------------------------------
export const categoryRevalidation = {
  async all(storeId: string) {
    await revalidateTag(categoryTags.all(storeId), "catalogRef")
  },

  async byId(storeId: string, id: string) {
    await Promise.all([
      revalidateTag(categoryTags.byId(storeId, id), "catalogRef"),
      revalidateTag(categoryTags.all(storeId), "catalogRef"), // optional broad fallback
    ])
  },

  async bySlug(storeId: string, slug: string) {
    await revalidateTag(categoryTags.bySlug(storeId, slug), "catalogRef")
  },
}
