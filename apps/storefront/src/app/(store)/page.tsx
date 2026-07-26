import { Client } from "./client"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Data } from "@puckeditor/core"
import { Suspense } from "react"

import { siteConfigRepository } from "@/lib/repositories/site-configs"
import { medusaCollectionRepository } from "@/lib/repositories/medusa-collection-repository"
import { medusaCategoryRepository } from "@/lib/repositories/medusa-category-repository"
import { listProductsByCollection } from "@/lib/repositories/products"

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const data = await siteConfigRepository.getPage("/home")
  return {
    title: data?.root?.props?.title ?? "Home",
    description: data?.root?.props?.description ?? "",
  }
}

// ---------------------------------------------------------------------------
// Heavy product enrichment (runs in background)
// ---------------------------------------------------------------------------
async function EnrichedContent({ data }: { data: Data }) {
  // Collect needed collection handles
  const collectionHandles = data.content
    .filter((item) => item.type === "CollectionProductsSliderSection")
    .map((item) => item.props.collection?.handle)
    .filter(Boolean) as string[]

  // Fetch everything in parallel
  const [collections, categories, incredibleOffers, ...collectionResults] =
    await Promise.all([
      medusaCollectionRepository.list(),
      medusaCategoryRepository.list(),
      listProductsByCollection("incredible_offers"),
      ...collectionHandles.map((handle) => listProductsByCollection(handle)),
    ])

  const productsByHandle: Record<string, any[]> = {
    incredible_offers: incredibleOffers.items,
  }

  collectionHandles.forEach((handle, index) => {
    productsByHandle[handle] = collectionResults[index]?.items ?? []
  })

  // Enrich only the product-related sections
  const enrichedContent = data.content.map((item) => {
    switch (item.type) {
      case "CollectionProductsSliderSection": {
        const handle = item.props.collection?.handle
        return {
          ...item,
          props: {
            ...item.props,
            data: productsByHandle[handle] ?? [],
          },
        }
      }

      case "IncredibleOffersSection":
        return {
          ...item,
          props: {
            ...item.props,
            data: productsByHandle.incredible_offers ?? [],
          },
        }

      case "CollectionsSectionWrapper":
        return {
          ...item,
          props: {
            ...item.props,
            data: collections.filter((c) => c.handle !== "incredible_offers"),
          },
        }

      case "CategoriesSlider":
        if (categories.length < 5) return item
        return {
          ...item,
          props: {
            ...item.props,
            data: categories,
          },
        }

      default:
        return item // Hero and other static sections stay as-is
    }
  })

  const pageData: Data = {
    ...data,
    content: enrichedContent,
  }

  return <Client data={pageData} path="/home" />
}

// ---------------------------------------------------------------------------
// Page – Instant shell + progressive enrichment
// ---------------------------------------------------------------------------
export default async function HomePage() {
  // 1. Load the light Puck page data first (this is fast + can be cached)
  const data = await siteConfigRepository.getPage("/home")
  if (!data) notFound()

  return (
    <Suspense
      fallback={
        // Show the page immediately with empty product data (Hero appears right away)
        <Client data={data} path="/home" />
      }
    >
      {/* 2. Then replace with fully enriched data */}
      <EnrichedContent data={data} />
    </Suspense>
  )
}