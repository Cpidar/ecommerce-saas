import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@/lib/medusa"
import { resolveRegion } from "@/lib/medusa-region"
import { getCurrentStoreHeader, getCurrentStoreId } from "@/lib/medusa/cookies"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const productId = url.searchParams.get("productId")
    const variantId = url.searchParams.get("variantId")

    if (!productId || !variantId) {
      return NextResponse.json({ error: "Missing productId or variantId" }, { status: 400 })
    }

    const { regionId, storeHeaders, storeId } = await resolveContext()

    const { product } = await sdk.store.product.retrieve(
      productId,
      {
        region_id: regionId,
        fields: "variants(id,inventory_quantity)"
      },
      { ...storeHeaders }
    )

    const variant = product?.variants?.find((v: any) => v.id === variantId)
    const inventory = variant?.inventory_quantity ?? 0

    return NextResponse.json({ inventory })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function resolveContext() {
  const [region, storeId, storeHeaders] = await Promise.all([
    resolveRegion(),
    getCurrentStoreId(),
    getCurrentStoreHeader()
  ])
  return { regionId: region.id, storeHeaders, storeId }
}
