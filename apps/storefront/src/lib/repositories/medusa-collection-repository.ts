import type { HttpTypes } from "@medusajs/types"
import { getCurrentStoreId, sdk } from "@/lib/medusa"

type StoreCollection = HttpTypes.StoreCollection

export interface Collection {
  id: string
  handle: string
  title: string
  metadata?: Record<string, unknown>
}

function transform(c: StoreCollection): Collection {
  return {
    id: c.id,
    handle: c.handle ?? c.id,
    title: c.title ?? "",
    metadata: c.metadata as Record<string, unknown> | undefined,
  }
}

let cache: Promise<Collection[]> | null = null

async function fetchAll(): Promise<Collection[]> {
  const storeHeaders = await getCurrentStoreId()

  if (!cache) {
    cache = sdk.store.collection
      .list({ limit: 200, fields: "id,handle,title,metadata" }, { ...storeHeaders })
      .then(({ collections }) => collections.map(transform))
  }
  return cache
}

export const getCollectionByHandle = async function (
  handle: string,
  fields?: (keyof HttpTypes.StoreCollection)[]
): Promise<HttpTypes.StoreCollection> {
  return sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: {
        handle,
        fields: fields ? fields.join(",") : undefined,
        limit: 1,
      },
      next: { tags: ["collections"] },
      cache: "force-cache",
    })
    .then(({ collections }) => collections[0])
}

export const medusaCollectionRepository = {
  async list(): Promise<Collection[]> {
    return fetchAll()
  },
  async getByHandle(handle: string): Promise<Collection | null> {
    const all = await fetchAll()
    return all.find((c) => c.handle === handle) ?? null
  },
}
