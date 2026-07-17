import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";
import { CategoryView } from "./collection-view";
import { listProductsByCollection } from "@/lib/repositories/products";
import { medusaCollectionRepository as collectionRepository } from "@/lib/repositories/medusa-collection-repository";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

// Catalog data is dynamic in Medusa — products, categories, and brands can
// change at any time in the admin. Render on demand and fall through to 404
// when the slug isn't recognized.
// export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  const collection = await collectionRepository.getByHandle(slug);
  if (collection) {
    return {
      title: collection.title,
      description: collection.title,
      alternates: { canonical: `/collections/${collection.handle}` },
      openGraph: {
        title: collection.title,
        description: collection.title,
        type: "website",
        url: `${siteConfig.url}/collections/${collection.handle}`,
      },
    };
  }

  return { title: "Not Found" };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  // Check category
  const collection = await collectionRepository.getByHandle(slug);
  if (!collection) return notFound();

  const { items: products, pagination } = await listProductsByCollection(slug, {
    page: 1,
    limit: 40,
  });
  return (
    <CategoryView
      category={{
        id: collection.id,
        name: collection.title,
        slug: collection.handle,
        description: "",
        order: 0,
      }}
      products={products}
      pagination={pagination}
      subcategories={[]}
      ancestors={[]}
    />
  );
}
