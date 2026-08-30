import { NextRequest, NextResponse } from "next/server"
import { revalidateTag } from "next/cache"
import { collectionRevalidation } from "@/lib/repositories/medusa-collection-repository"
import { getCurrentStoreId } from "@/lib/medusa/cookies"

/**
 * Webhook endpoint to revalidate cached collection data in Next.js.
 *
 * Configure this URL (POST) in Medusa admin under Settings → Webhooks.
 * Subscribe to events:
 * - `collection.created` / `updated` / `deleted`
 *
 * Security: Set `REVALIDATION_WEBHOOK_SECRET` in env and send in `Authorization: Bearer <secret>`.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "")
    const expectedSecret = process.env.REVALIDATION_WEBHOOK_SECRET

    if (!expectedSecret || token !== expectedSecret) {
      console.warn("[Webhook:collections] Unauthorized or missing secret token")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const eventType: string | undefined = body?.type || body?.event
    const data: Record<string, unknown> = body?.data?.item ?? body?.data ?? {}

    const storeId = await getCurrentStoreId()
    if (!storeId) {
      return NextResponse.json({ message: "Invalid store context" }, { status: 400 })
    }

    const collectionId = (data.id ?? data.collection_id) as string | undefined
    const handle = (data.handle ?? data.title ?? "") as string | undefined

    const tasks: Promise<unknown>[] = []

    if (handle) {
      tasks.push(collectionRevalidation.byHandle(storeId, handle))
    }

    // Always invalidate the full collection list on any change
    tasks.push(collectionRevalidation.all(storeId))

    await Promise.all(tasks)

    return NextResponse.json(
      { revalidated: true, event: eventType, storeId, collectionId, handle },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Webhook:collections] Error during revalidation:", message)
    return NextResponse.json(
      { error: "Revalidation failed", details: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Collection revalidation webhook active" }, { status: 200 })
}
