import { NextRequest, NextResponse } from "next/server"
import { categoryRevalidation } from "@/lib/repositories/medusa-category-repository"
import { getCurrentStoreId } from "@/lib/medusa/cookies"

/**
 * Webhook endpoint to revalidate cached category data in Next.js.
 *
 * Configure this URL (POST) in Medusa admin under Settings → Webhooks.
 * Subscribe to events:
 * - `product_category.created` / `updated` / `deleted`
 *
 * Security: Set `REVALIDATION_WEBHOOK_SECRET` in env and send in `Authorization: Bearer <secret>`.
 */
export async function POST(request: NextRequest) {
  console.log("Categories Revalidation Started")

  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "")
    const expectedSecret = process.env.REVALIDATION_WEBHOOK_SECRET

    if (!expectedSecret || token !== expectedSecret) {
      console.warn("[Webhook:categories] Unauthorized or missing secret token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const eventType: string | undefined = body?.type || body?.event
    const data: Record<string, unknown> = body?.data?.item ?? body?.data ?? {}
    const affectsGrid = (data.affects_grid ?? false) as boolean

    const storeId = await getCurrentStoreId()
    if (!storeId) {
      return NextResponse.json({ message: "Invalid store context" }, { status: 400 })
    }

    const categoryId = (data.id ?? data.category_id) as string | undefined
    const slug = (data.handle ?? (data as Record<string, unknown>)?.slug) as string | undefined

    const tasks: Promise<unknown>[] = []

    if (categoryId) {
      tasks.push(categoryRevalidation.byId(storeId, categoryId))
    }
    if (slug) {
      tasks.push(categoryRevalidation.byHandle(storeId, slug))
    }

    // Deleted / created events always invalidate the full category list
    if (affectsGrid || eventType?.includes("product-category.deleted") || eventType?.includes("product-category.created")) {
      tasks.push(categoryRevalidation.all(storeId))
    }

    await Promise.all(tasks)

    return NextResponse.json(
      { revalidated: true, event: eventType, storeId, categoryId, slug },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Webhook:categories] Error during revalidation:", message)
    return NextResponse.json(
      { error: "Revalidation failed", details: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Category revalidation webhook active" }, { status: 200 })
}
