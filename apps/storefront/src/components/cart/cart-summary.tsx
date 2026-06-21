"use client"

import { formatPrice } from "@/lib/utils/utils"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import type { Cart } from "@/types"

interface CartSummaryProps {
  cart: Cart
}

/**
 * Renders the cart totals as computed authoritatively by Medusa. Tax and
 * shipping are not estimates — Medusa returns the exact values for the cart's
 * region. Promotions and gift cards (Phase 3.5) will be reflected in subtotal
 * and total when applied.
 */
export function CartSummary({ cart }: CartSummaryProps) {
  const tCart = useTranslations("cart")
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{tCart("subtotal")}</span>
        <span>{formatPrice(cart.subtotal, cart.currency)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{tCart("shipping")}</span>
        <span>
          {cart.shipping > 0
            ? formatPrice(cart.shipping, cart.currency)
            : tCart("calculatedAtCheckout")}
        </span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{tCart("estimatedTax")}</span>
        <span>{formatPrice(cart.tax, cart.currency)}</span>
      </div>
      <Separator />
      <div className="flex justify-between font-medium">
        <span>{tCart("total")}</span>
        <span>{formatPrice(cart.total, cart.currency)}</span>
      </div>
    </div>
  )
}
