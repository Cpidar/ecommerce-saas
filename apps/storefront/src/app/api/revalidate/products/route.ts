import { NextRequest, NextResponse } from "next/server"
import { productRevalidation } from "@/lib/repositories/products-repository"
import { getCurrentStoreId } from "@/lib/medusa/cookies"

/**
 * Webhook endpoint to revalidate cached product data in Next.js.
 *
 * Configure this URL (POST) in your Medusa dashboard under Settings → Webhooks.
 * Subscribe it to: `product.updated`, `product.deleted`, `product_variants.updated`,
 * `product_variants.deleted` events.
 *
 * Security: Set `REVALIDATION_WEBHOOK_SECRET` in your environment. The webhook
 * must send it in the `Authorization` header as `Bearer <secret>`.
 */

export async function POST(request: NextRequest) {
  try {
    // --- Verify the secret token ---
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "")
    const expectedSecret = process.env.REVALIDATION_WEBHOOK_SECRET

    if (!expectedSecret || token !== expectedSecret) {
      console.warn("[Webhook] Unauthorized or missing secret token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // --- Parse and inspect the payload ---
    const body = await request.json()
    const eventType: string | undefined = body?.type || body?.event
    const data: Record<string, unknown> = body?.data?.item ?? body?.data ?? {}

    const storeId = await getCurrentStoreId()
    if (!storeId) {
      console.warn("[Webhook] No store ID resolved")
      return NextResponse.json({ message: "Invalid store context" }, { status: 400 })
    }

    // --- Determine what to revalidate based on event type ---
    // Medusa payloads vary slightly by event type. We normalize the identifiers.
    const productId = (data.id ?? data.product_id) as string | undefined
    const slug = (data.handle ?? (data.metadata as Record<string, unknown>)?.handle) as string | undefined
    const collectionSlug = (data.collection_handle) as string | undefined
    const categorySlug = (data.category_slug) as string | undefined

    // Collect all relevant revalidation promises
    const tasks: Promise<unknown>[] = []

    const affectsGrid = (data.affects_grid as boolean | undefined) ?? true

    if (productId) {
      tasks.push(productRevalidation.byId(storeId, productId))
    }
    if (slug) {
      // bySlug uses the product's handle
      tasks.push(productRevalidation.bySlug(storeId, slug))
    }
    if (collectionSlug) {
      tasks.push(productRevalidation.byCollection(storeId, collectionSlug))
    }
    if (categorySlug) {
      tasks.push(productRevalidation.byCategory(storeId, categorySlug))
    }

    // If it's a broad event (delete) or we can't be granular, invalidate "all"
    if (eventType?.includes("deleted") || (!productId && !collectionSlug && !categorySlug)) {
      tasks.push(productRevalidation.all(storeId))
    }

    // Price/inventory updates always affect grids
    if (affectsGrid) {
      tasks.push(productRevalidation.all(storeId))
    }

    await Promise.all(tasks)

    console.log(`[Webhook] Revalidated product data (store: ${storeId}) for event: ${eventType}`)
    return NextResponse.json({ revalidated: true, event: eventType }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Webhook] Error during revalidation:", message)
    return NextResponse.json({ message: "Error during revalidation", error: message }, { status: 500 })
  }
}

// Optional: a simple health check (GET)
export async function GET() {
  return NextResponse.json({ message: "Product revalidation webhook is active" }, { status: 200 })
}
