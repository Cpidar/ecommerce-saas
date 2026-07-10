import "server-only"

import type { HttpTypes } from "@medusajs/types"
import type { Category, CategoryImage, CategoryRepository } from "@/types"
import { getCurrentStoreId, sdk } from "@/lib/medusa"
import { cacheTag } from "next/cache"

type StoreCategory = HttpTypes.StoreProductCategory & {
  product_category_image?: CategoryImage[]
}

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

async function fetchAll(): Promise<Category[]> {
  "use cache"

  const storeId = await getCurrentStoreId()
  cacheTag(`categories:${storeId}`)


  const { product_categories } = await (await sdk()).store.category.list({
    limit: 200,
    fields:
      "id,name,handle,description,parent_category_id,rank,metadata,*product_category_image",
  })
  return product_categories
    .map((c, idx) => transformCategory(c, idx))
    .sort((a, b) => a.order - b.order)
}

export const medusaCategoryRepository: CategoryRepository & {
  getChildren(parentId: string): Promise<Category[]>
  getTopLevel(): Promise<Category[]>
  getAncestors(categoryId: string): Promise<Category[]>
} = {
  async list() {
    return fetchAll()
  },

  async getBySlug(slug) {
    const all = await fetchAll()
    return all.find((c) => c.slug === slug) ?? null
  },

  async getById(id) {
    const all = await fetchAll()
    return all.find((c) => c.id === id) ?? null
  },

  async getChildren(parentId) {
    const all = await fetchAll()
    return all
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => a.order - b.order)
  },

  async getTopLevel() {
    const all = await fetchAll()
    return all.filter((c) => !c.parentId).sort((a, b) => a.order - b.order)
  },

  async getAncestors(categoryId) {
    const all = await fetchAll()
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
