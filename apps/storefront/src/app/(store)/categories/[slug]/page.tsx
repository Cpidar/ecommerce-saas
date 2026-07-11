import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { productRepository, categoryRepository } from "@/lib/repositories"
import { siteConfig } from "@/lib/config"
import { CategoryView } from "./category-view"

interface SlugPageProps {
  params: Promise<{ slug: string }>
}

// Catalog data is dynamic in Medusa — products, categories, and brands can
// change at any time in the admin. Render on demand and fall through to 404
// when the slug isn't recognized.
// export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: SlugPageProps): Promise<Metadata> {
  const { slug } = await params


  const category = await categoryRepository.getBySlug(slug)
  if (category) {
    return {
      title: category.name,
      description: category.description,
      alternates: { canonical: `/categories/${category.slug}` },
      openGraph: {
        title: category.name,
        description: category.description,
        type: "website",
        url: `${siteConfig.url}/categories/${category.slug}`,
      },
    }
  }

  return { title: "Not Found" }
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params


  // Check category
  const category = await categoryRepository.getBySlug(slug)
  if(!category) return notFound()

    const [{ items: products, pagination }, subcategories, ancestors] =
      await Promise.all([
        productRepository.getByCategory(slug, { page: 1, limit: 40 }),
        categoryRepository.getChildren(category.id),
        categoryRepository.getAncestors(category.id),
      ])
    return (
      <CategoryView
        category={category}
        products={products}
        pagination={pagination}
        subcategories={subcategories}
        ancestors={ancestors}
      />
    )


}
