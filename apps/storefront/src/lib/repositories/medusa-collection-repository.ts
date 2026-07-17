import type { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/medusa"
import { cacheLife, cacheTag, revalidateTag } from "next/cache"
import { getCurrentStoreHeader, getCurrentStoreId } from "../medusa/cookies"

type StoreCollection = HttpTypes.StoreCollection

export interface Collection {
  id: string
  handle: string
  title: string
  metadata?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Tenant-aware cache tags
// ---------------------------------------------------------------------------
const getTenantTag = (storeId: string, tag: string) => `${storeId}:${tag}`

export const collectionTags = {
  all: (storeId: string) => getTenantTag(storeId, "collections"),
  byHandle: (storeId: string, handle: string) => getTenantTag(storeId, `collection:${handle}`),
}

// ---------------------------------------------------------------------------
// Transforms
// ---------------------------------------------------------------------------

function transform(c: StoreCollection): Collection {
  return {
    id: c.id,
    handle: c.handle ?? c.id,
    title: c.title ?? "",
    metadata: c.metadata as Record<string, unknown> | undefined,
  }
}

let cache: Promise<Collection[]> | null = null

// ---------------------------------------------------------------------------
// Cached fetcher
// ---------------------------------------------------------------------------

async function fetchAllCollections(
  storeHeaders: Awaited<ReturnType<typeof getCurrentStoreHeader>>,
  storeId: string
): Promise<Collection[]> {
  "use cache"
  cacheTag(collectionTags.all(storeId))
  cacheLife("catalogRef")   // or "days" / "weeks" depending on how often collections change

  const { collections } = await sdk.store.collection.list(
    { limit: 200, fields: "id,handle,title,metadata" },
    { ...storeHeaders }
  )
  return collections.map(transform)
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const medusaCollectionRepository = {
  async list(): Promise<Collection[]> {
    const storeId = await getCurrentStoreId()
    const storeHeaders = await getCurrentStoreHeader()

    return fetchAllCollections(storeHeaders, storeId)
  },

  async getByHandle(handle: string): Promise<Collection | null> {
    const storeId = await getCurrentStoreId()
    const storeHeaders = await getCurrentStoreHeader()

    const all = await fetchAllCollections(storeHeaders, storeId)
    return all.find((c) => c.handle === handle) ?? null
  },
}

// ---------------------------------------------------------------------------
// Revalidation helper (call from webhooks)
// ---------------------------------------------------------------------------
export const collectionRevalidation = {
  async all(storeId: string) {
    await revalidateTag(collectionTags.all(storeId), "catalogRef")
  },
  async byHandle(storeId: string, handle: string) {
    await revalidateTag(collectionTags.byHandle(storeId, handle), "catalogRef")
  },
}
