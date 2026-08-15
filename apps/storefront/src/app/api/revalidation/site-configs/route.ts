import { NextRequest, NextResponse } from "next/server"
import { getCurrentStoreId } from "@/lib/medusa/cookies"
import {
  siteConfigRevalidation,
  storeConfigTags,
} from "@/lib/repositories/site-configs"

/**
 * Webhook endpoint to revalidate cached store config data in Next.js.
 *
 * Configure this URL (POST) in Medusa admin under Settings → Webhooks.
 * Subscribe to events:
 * - `store_config.updated` → triggers full revalidation (core, seo, general, etc.)
 * - `payment_provider.updated` → triggers payment revalidation
 * - `shipping_option.updated` → triggers shipping revalidation
 *
 * Security: Set `REVALIDATION_WEBHOOK_SECRET` in env and send in `Authorization: Bearer <secret>`.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace(/^Bearer\s+/i, "")
    const expectedSecret = process.env.REVALIDATION_WEBHOOK_SECRET

    if (!expectedSecret || token !== expectedSecret) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const eventType: string | undefined = body?.type || body?.event
    const data: Record<string, unknown> = body?.data?.item ?? body?.data ?? {}

    const storeId = await getCurrentStoreId()
    if (!storeId) {
      return NextResponse.json({ message: "Invalid store context" }, { status: 400 })
    }

    switch (eventType) {
      case "store_config.updated":
      case "store.updated":
        // Broad revalidation covers everything
        await Promise.all([
          siteConfigRevalidation.core(storeId),
          siteConfigRevalidation.seo(storeId),
          siteConfigRevalidation.general(storeId),
          siteConfigRevalidation.puck(storeId),
        ])
        break

      case "payment_provider.updated":
        await siteConfigRevalidation.payment(storeId)
        break

      case "shipping_option.updated":
        await siteConfigRevalidation.shipping(storeId)
        break

      default:
        return NextResponse.json({ message: `Ignored event: ${eventType}` }, { status: 200 })
    }

    return NextResponse.json(
      { revalidated: true, event: eventType, storeId },
      { status: 200 }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: "Revalidation failed", details: message },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Site config revalidation webhook active" }, { status: 200 })
}
