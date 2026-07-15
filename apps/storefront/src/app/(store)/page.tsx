import { Client } from "./client";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Data } from "@puckeditor/core";
import { Suspense } from "react";

import {
  medusaCollectionRepository,
  getCollectionByHandle,
} from "@/lib/repositories/medusa-collection-repository";
import { getPage } from "@/lib/get-page";
import { medusaCategoryRepository } from "@/lib/repositories/medusa-category-repository";
import { listProductsByCollection } from "@/lib/repositories/products";

// ---------------------------------------------------------------------------
// Static Metadata
// ---------------------------------------------------------------------------
export async function generateMetadata(): Promise<Metadata> {
  const path = `/home`;
  const data = await getPage(path);

  return {
    title: data?.root.props?.title ?? "Home",
    description: data?.root.props?.description ?? "",
  };
}

// ---------------------------------------------------------------------------
// Dynamic Data Fetcher (Wrapped in Suspense)
// ---------------------------------------------------------------------------
async function EnrichedPageData({ path }: { path: string }) {
  const data = await getPage(path);
  if (!data) notFound();

  async function enrichData(
    item: Data["content"][number]
  ): Promise<Data["content"][number]> {
    switch (item.type) {
      case "CollectionProductsSliderSection": {
        const collection = await listProductsByCollection(
          item.props.collection.handle
        );
        return {
          ...item,
          props: {
            ...item.props,
            data: collection.items,
          },
        };
      }

      case "IncredibleOffersSection": {
        const incredibleOffers = await listProductsByCollection("incredible_offers");
        return {
          ...item,
          props: {
            ...item.props,
            data: incredibleOffers.items,
          },
        };
      }

      case "CollectionsSectionWrapper": {
        const collections = await medusaCollectionRepository.list();
        return {
          ...item,
          props: {
            ...item.props,
            data: collections.filter((c) => c.handle !== "incredible_offers"),
          },
        };
      }

      case "CategoriesSlider": {
        const categories = await medusaCategoryRepository.list();
        if (categories.length < 5) return item;

        return {
          ...item,
          props: {
            ...item.props,
            data: categories,
          },
        };
      }

      default:
        return item;
    }
  }

  const enrichedContent = await Promise.all(data.content.map(enrichData));

  const pageData: Data = {
    ...data,
    content: enrichedContent,
  };

  return <Client data={pageData} path={path} />;
}

// ---------------------------------------------------------------------------
// Main Page (Static Shell + Dynamic Content)
// ---------------------------------------------------------------------------
export default function HomePage() {
  const path = `/home`;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading homepage...</div>
        </div>
      }
    >
      <EnrichedPageData path={path} />
    </Suspense>
  );
}