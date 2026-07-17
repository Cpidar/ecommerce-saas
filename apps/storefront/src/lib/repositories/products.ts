import "server-only"
import { cacheTag, cacheLife, revalidateTag } from "next/cache"
import type { HttpTypes } from "@medusajs/types"
import type {
  PaginatedResult,
  PaginationParams,
  Product,
  ProductFilters,
  ProductImage,
  ProductRepository,
  ProductVariant,
  SortOption,
} from "@/types"
import { sdk } from "@/lib/medusa"
import { resolveRegion } from "@/lib/medusa-region"
import { getCurrentStoreHeader, getCurrentStoreId } from "../medusa/cookies"

type StoreProduct = HttpTypes.StoreProduct
type StoreProductVariant = HttpTypes.StoreProductVariant

// ---------------------------------------------------------------------------
// Fields Profiles — Optimized
// ---------------------------------------------------------------------------
const LIST_FIELDS = [
  "id",
  "title",
  "handle",
  "subtitle",
  "thumbnail",
  "status",
  "created_at",
  "updated_at",
  "variants(id,title,sku,calculated_price,inventory_quantity,manage_inventory,allow_backorder)",
  "categories(id)",
  "tags(value)",
  "type(id)",
  "metadata",
].join(",")

const DETAIL_FIELDS = [
  "id",
  "title",
  "handle",
  "subtitle",
  "description",
  "status",
  "created_at",
  "updated_at",
  "*variants",
  "*variants.calculated_price",
  "+variants.inventory_quantity",
  "*categories",
  "*tags",
  "*type",
  "+thumbnail",
  "+metadata",
].join(",")

// ---------------------------------------------------------------------------
// Cache tags with tenant isolation
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

const productTags = {
  all: (storeId: string) => getTenantTag(storeId, "products"),
  byId: (storeId: string, id: string) => getTenantTag(storeId, `product:${id}`),
  bySlug: (storeId: string, slug: string) => getTenantTag(storeId, `product:slug:${slug}`),
  byCategory: (storeId: string, id: string) => getTenantTag(storeId, `category:${id}`),
  byCollection: (storeId: string, id: string) => getTenantTag(storeId, `collection:${id}`),
  categoryLookup: (storeId: string, slug: string) => getTenantTag(storeId, `category-lookup:${slug}`),
  collectionLookup: (storeId: string, slug: string) => getTenantTag(storeId, `collection-lookup:${slug}`),
  featured: (storeId: string) => getTenantTag(storeId, "products:featured"),
  subscription: (storeId: string) => getTenantTag(storeId, "products:subscription"),
}

// ---------------------------------------------------------------------------
// Pure transforms — unchanged
// ---------------------------------------------------------------------------
function transformImage(
  image: { url?: string | null; id?: string } | undefined,
  fallbackAlt: string
): ProductImage {
  return {
    url: image?.url ?? "",
    alt: fallbackAlt,
  }
}

function transformVariant(
  variant: StoreProductVariant,
  productId: string,
  productName: string,
  productImage: ProductImage | undefined,
  currency: string
): ProductVariant {
  const calculated = (
    variant as { calculated_price?: { calculated_amount?: number; original_amount?: number } }
  ).calculated_price
  const price = calculated?.calculated_amount ?? 0
  const original = calculated?.original_amount

  return {
    id: variant.id,
    productId,
    sku: variant.sku ?? "",
    name: variant.title ?? productName,
    price,
    compareAtPrice: original && original > price ? original : undefined,
    currency,
    inventory: {
      quantity: variant.inventory_quantity ?? 0,
      trackInventory: variant.manage_inventory ?? false,
      allowBackorder: variant.allow_backorder ?? false,
    },
    options: (variant.options ?? []).map((o) => ({
      name: o.option?.title ?? "",
      value: o.value ?? "",
    })),
    images: productImage ? [productImage] : [],
    weight: variant.weight ?? undefined,
    dimensions:
      variant.length && variant.width && variant.height
        ? { length: variant.length, width: variant.width, height: variant.height }
        : undefined,
  }
}

function transformProduct(p: StoreProduct, currency: string): Product {
  const images: ProductImage[] = (p.images ?? []).map((img) => transformImage(img, p.title ?? ""))
  if (p.thumbnail && !images.some((i) => i.url === p.thumbnail)) {
    images.unshift({ url: p.thumbnail, alt: p.title ?? "" })
  }

  const primaryImage = images[0]
  const variants = (p.variants ?? []).map((v) =>
    transformVariant(v, p.id, p.title ?? "", primaryImage, currency)
  )

  const metadata = (p.metadata ?? {}) as Record<string, unknown>

  return {
    id: p.id,
    name: p.title ?? "",
    slug: p.handle ?? p.id,
    description: p.subtitle ?? "",
    body: p.description ?? undefined,
    images,
    status: p.status === "published" ? "active" : "draft",
    brandId: typeof metadata.brandId === "string" ? metadata.brandId : (p.type?.id ?? ""),
    categoryIds: (p.categories ?? []).map((c) => c.id),
    tags: (p.tags ?? []).map((t) => t.value),
    variants,
    rating: typeof metadata.rating === "number" ? metadata.rating : 0,
    reviewCount: typeof metadata.reviewCount === "number" ? metadata.reviewCount : 0,
    featured: metadata.featured === true,
    createdAt: p.created_at ?? new Date().toISOString(),
    updatedAt: p.updated_at ?? new Date().toISOString(),
  }
}

function buildOrderParam(sort?: SortOption): string | undefined {
  if (!sort) return undefined
  const fieldMap: Record<string, string> = { createdAt: "created_at", name: "title" }
  const field = fieldMap[sort.field] ?? sort.field
  if (field === "price") return undefined
  return sort.order === "desc" ? `-${field}` : field
}

function applyClientFilters(items: Product[], filters?: ProductFilters): Product[] {
  if (!filters) return items
  return items.filter((p) => {
    if (filters.priceRange) {
      const price = p.variants[0]?.price ?? 0
      if (filters.priceRange.min !== undefined && price < filters.priceRange.min) return false
      if (filters.priceRange.max !== undefined && price > filters.priceRange.max) return false
    }
    if (filters.inStock) {
      const anyInStock = p.variants.some((v) => v.inventory.quantity > 0 || v.inventory.allowBackorder)
      if (!anyInStock) return false
    }
    if (filters.tags && filters.tags.length > 0) {
      if (!filters.tags.some((t) => p.tags.includes(t))) return false
    }
    return true
  })
}

function applyClientSort(items: Product[], sort?: SortOption): Product[] {
  if (!sort || sort.field !== "price") return items
  return [...items].sort((a, b) => {
    const priceA = a.variants[0]?.price ?? 0
    const priceB = b.variants[0]?.price ?? 0
    return sort.order === "desc" ? priceB - priceA : priceA - priceB
  })
}

function paginationMeta(count: number, page: number, limit: number) {
  const totalPages = Math.max(1, Math.ceil(count / limit))
  return { total: count, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
}

const emptyPage = (page: number, limit: number): PaginatedResult<Product> => ({
  items: [],
  pagination: paginationMeta(0, page, limit),
})

// ---------------------------------------------------------------------------
// Dynamic context
// ---------------------------------------------------------------------------
async function resolveContext() {
  const [region, storeId, storeHeaders] = await Promise.all([resolveRegion(), getCurrentStoreId(), getCurrentStoreHeader()])
  return { regionId: region.id, currency: region.currency, storeHeaders, storeId }
}

// ---------------------------------------------------------------------------
// Cached lookups
// ---------------------------------------------------------------------------
async function resolveCategoryIdBySlug(
  slug: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  storeId: string
): Promise<string | null> {
  "use cache"
  cacheTag(productTags.categoryLookup(storeId, slug))
  cacheLife("catalogRef")

  const { product_categories } = await sdk.store.category.list({ handle: slug, limit: 1 }, { ...storeHeaders })
  return product_categories[0]?.id ?? null
}

async function resolveCollectionIdBySlug(
  handle: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  storeId: string
): Promise<string | null> {
  "use cache"
  cacheTag(productTags.collectionLookup(storeId, handle))
  cacheLife('catalogRef')

  const { collections } = await sdk.store.collection.list({ handle, limit: 1 }, { ...storeHeaders })
  return collections[0]?.id ?? null
}

// ---------------------------------------------------------------------------
// Cached fetchers
// ---------------------------------------------------------------------------
async function fetchProductList(
  params: HttpTypes.StoreProductListParams,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  currency: string,
  storeId: string,
  extraTags: string[] = []
): Promise<{ items: Product[]; count: number }> {
  // "use cache"
  // cacheTag(productTags.all(storeId), ...extraTags)
  // cacheLife("products")

  const { products, count } = await sdk.store.product.list(params, { ...storeHeaders })
  return { items: products.map((p) => transformProduct(p, currency)), count }
}

async function fetchProductBySlug(
  slug: string,
  regionId: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  currency: string,
  storeId: string
): Promise<Product | null> {
  "use cache"
  cacheTag(productTags.bySlug(storeId, slug))
  cacheLife("products")

  try {
    const { products } = await sdk.store.product.list(
      { handle: slug, region_id: regionId, fields: DETAIL_FIELDS, limit: 1 },
      { ...storeHeaders }
    )
    return products[0] ? transformProduct(products[0], currency) : null
  } catch {
    return null
  }
}

async function fetchProductById(
  id: string,
  regionId: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  currency: string,
  storeId: string
): Promise<Product | null> {
  "use cache"
  cacheTag(productTags.byId(storeId, id))
  cacheLife("products")

  try {
    const { product } = await sdk.store.product.retrieve(
      id,
      { region_id: regionId, fields: DETAIL_FIELDS },
      { ...storeHeaders }
    )
    return product ? transformProduct(product, currency) : null
  } catch {
    return null
  }
}

async function fetchFeatured(
  regionId: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  currency: string,
  storeId: string
): Promise<Product[]> {
  "use cache"
  cacheTag(productTags.all(storeId), productTags.featured(storeId))
  cacheLife("products")

  const { products } = await sdk.store.product.list(
    { region_id: regionId, fields: LIST_FIELDS, limit: 50 },
    { ...storeHeaders }
  )
  return products.map((p) => transformProduct(p, currency))
}

async function fetchSubscriptionProduct(
  regionId: string,
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  currency: string,
  storeId: string
): Promise<Product | null> {
  "use cache"
  cacheTag(productTags.subscription(storeId))
  cacheLife("products")

  try {
    const { products } = await sdk.store.product.list(
      {
        handle: process.env.NEXT_PUBLIC_SUBSCRIPTION_PRODUCT_SLUG || "subscription-product",
        region_id: regionId,
        fields: LIST_FIELDS,
        limit: 1,
      },
      { ...storeHeaders }
    )
    return products[0] ? transformProduct(products[0], currency) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Public repository
// ---------------------------------------------------------------------------

export async function listProductsByCollection(
  collectionSlug: string,
  pagination?: PaginationParams
): Promise<PaginatedResult<Product>> {
  const { regionId, currency, storeHeaders, storeId } = await resolveContext()
  const page = pagination?.page ?? 1
  const limit = pagination?.limit ?? 40

  const collectionId = await resolveCollectionIdBySlug(collectionSlug, storeHeaders, storeId)
  if (!collectionId) return emptyPage(page, limit)

  const { items, count } = await fetchProductList(
    {
      region_id: regionId,
      collection_id: [collectionId],
      fields: LIST_FIELDS,
      limit,
      offset: (page - 1) * limit,
    },
    storeHeaders,
    currency,
    storeId,
    [productTags.byCollection(storeId, collectionId)]
  )

  return { items, pagination: paginationMeta(count, page, limit) }
}

export const medusaProductRepository: ProductRepository = {
  async list(filters, sort, pagination) {
    const { regionId, currency, storeHeaders, storeId } = await resolveContext()
    const page = pagination?.page ?? 1
    const limit = pagination?.limit ?? 12

    const params: HttpTypes.StoreProductListParams = {
      region_id: regionId,
      fields: LIST_FIELDS,
      limit,
      offset: (page - 1) * limit,
    }

    const extraTags: string[] = []

    if (filters?.search) params.q = filters.search
    if (filters?.category) {
      const categoryId = await resolveCategoryIdBySlug(filters.category, storeHeaders, storeId)
      if (!categoryId) return emptyPage(page, limit)
      params.category_id = [categoryId]
      extraTags.push(productTags.byCategory(storeId, categoryId))
    }

    const order = buildOrderParam(sort)
    if (order) params.order = order

    const { items: rawItems, count } = await fetchProductList(params, storeHeaders, currency, storeId, extraTags)
    const items = applyClientSort(applyClientFilters(rawItems, filters), sort)

    return { items, pagination: paginationMeta(count, page, limit) }
  },

  async getBySlug(slug) {
    const { regionId, currency, storeHeaders, storeId } = await resolveContext()
    return fetchProductBySlug(slug, regionId, storeHeaders, currency, storeId)
  },

  async getSubscriptionProduct() {
    const { regionId, currency, storeHeaders, storeId } = await resolveContext()
    return fetchSubscriptionProduct(regionId, storeHeaders, currency, storeId)
  },

  async getById(id) {
    const { regionId, currency, storeHeaders, storeId } = await resolveContext()
    return fetchProductById(id, regionId, storeHeaders, currency, storeId)
  },

  async getFeatured(limit = 4) {
    const { regionId, currency, storeHeaders, storeId } = await resolveContext()
    const transformed = await fetchFeatured(regionId, storeHeaders, currency, storeId)
    const featured = transformed.filter((p) => p.featured)
    return (featured.length > 0 ? featured : transformed).slice(0, limit)
  },

  async getByCategory(categorySlug, pagination) {
    return this.list({ category: categorySlug }, undefined, pagination)
  },

  async search(query, pagination) {
    return this.list({ search: query }, undefined, pagination)
  },
}


// ---------------------------------------------------------------------------
// Webhook Revalidation Helpers
// ---------------------------------------------------------------------------
export const productRevalidation = {
  async byId(storeId: string, productId: string) {
    await Promise.all([
      revalidateTag(productTags.byId(storeId, productId), "products"),
      // revalidateTag(productTags.all(storeId)) // uncomment if you want broad revalidation
    ])
  },

  async bySlug(storeId: string, slug: string) {
    await revalidateTag(productTags.bySlug(storeId, slug), "products")
  },

  async all(storeId: string) {
    await revalidateTag(productTags.all(storeId), "products")
  },

  async byCategory(storeId: string, categoryId: string) {
    await revalidateTag(productTags.byCategory(storeId, categoryId), "products")
  },

  async byCollection(storeId: string, collectionId: string) {
    await revalidateTag(productTags.byCollection(storeId, collectionId), "products")
  },

  async featured(storeId: string) {
    await revalidateTag(productTags.featured(storeId), "products")
  },

  async subscription(storeId: string) {
    await revalidateTag(productTags.subscription(storeId), "products")
  },
}