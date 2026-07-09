import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  productRepository,
  categoryRepository,
  brandRepository,
  collectionRepository,
} from "@/lib/repositories";
import { formatPrice } from "@/lib/utils/utils";
import { siteConfig } from "@/lib/config";
import { ProductDetailView } from "./product-detail-view";

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

  const product = await productRepository.getBySlug(slug);
  if (product) {
    const variant = product.variants[0];
    const price = variant ? formatPrice(variant.price, variant.currency) : "";
    return {
      title: product.name,
      description: product.description,
      alternates: { canonical: `/products/${product.slug}` },
      openGraph: {
        title: product.name,
        description: product.description,
        type: "website",
        url: `${siteConfig.url}/products/${product.slug}`,
        images: product.images[0]
          ? [{ url: product.images[0].url, alt: product.images[0].alt }]
          : [],
      },
      other: {
        "product:price:amount": variant ? String(variant.price / 100) : "",
        "product:price:currency": variant?.currency ?? "USD",
      },
    };
  }

  return { title: "Not Found" };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  // Check product first
  const product = await productRepository.getBySlug(slug);

  if (!product) return notFound();
  // Pick the most specific category (prefer one with a parentId, i.e. a subcategory)
  const productCategories = await Promise.all(
    product.categoryIds.map((id) => categoryRepository.getById(id)),
  );
  const validCategories = productCategories.filter(
    (c): c is NonNullable<typeof c> => c !== null,
  );
  const primaryCategory =
    validCategories.find((c) => c.parentId) ?? validCategories[0] ?? null;

  const [relatedProducts, brand, categoryAncestors] = await Promise.all([
    primaryCategory
      ? productRepository
          .getByCategory(primaryCategory.slug, { page: 1, limit: 5 })
          .then((r) => r.items.filter((p) => p.id !== product.id).slice(0, 4))
      : Promise.resolve([]),
    brandRepository.getById(product.brandId),
    primaryCategory
      ? categoryRepository.getAncestors(primaryCategory.id)
      : Promise.resolve([]),
  ]);

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      brand={brand}
      categoryAncestors={categoryAncestors}
    />
  );
}
