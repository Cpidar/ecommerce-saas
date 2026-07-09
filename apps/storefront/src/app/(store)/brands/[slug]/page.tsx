import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  productRepository,
  brandRepository,
} from "@/lib/repositories";
import { siteConfig } from "@/lib/config";
import { BrandView } from "./brand-view";

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

// Catalog data is dynamic in Medusa — products, categories, and brands can
// change at any time in the admin. Render on demand and fall through to 404
// when the slug isn't recognized.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params;

  const brand = await brandRepository.getBySlug(slug);
  if (brand) {
    return {
      title: brand.name,
      description: brand.description,
      alternates: { canonical: `/brands/${brand.slug}` },
      openGraph: {
        title: brand.name,
        description: brand.description,
        type: "website",
        url: `${siteConfig.url}/brands/${brand.slug}`,
      },
    };
  }

  return { title: "Not Found" };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  // Check brand
  const brand = await brandRepository.getBySlug(slug);
  if (!brand) return notFound();

  if (brand) {
    const { items: products, pagination } = await productRepository.list(
      { tags: [] },
      undefined,
      { page: 1, limit: 40 },
    );
    const brandProducts = products.filter((p) => p.brandId === brand.id);
    return (
      <BrandView
        brand={brand}
        products={brandProducts}
        pagination={{
          ...pagination,
          total: brandProducts.length,
          totalPages: 1,
          hasNext: false,
        }}
      />
    );
  }
}
