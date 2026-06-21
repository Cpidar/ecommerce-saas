"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { useCartStore } from "@/store/cart"
import { CartItem } from "@/components/cart/cart-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { PromotionCodeForm } from "@/components/cart/promotion-code-form"
import { useEffect } from "react"
import { useTranslations } from "next-intl"

export default function CartPage() {
  const tCart = useTranslations("cart")
  const tCommon = useTranslations("common")
  const cart = useCartStore((s) => s.cart)
  const hasHydrated = useCartStore((s) => s.hasHydrated)
  const hydrate = useCartStore((s) => s.hydrate)

  useEffect(() => {
    if (!hasHydrated) void hydrate()
  }, [hasHydrated, hydrate])

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title={tCart("shoppingCart")} />
      </div>
    )
  }

  const items = cart?.items ?? []

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader title={tCart("shoppingCart")} />
        <EmptyState
          icon={ShoppingBag}
          title={tCart("empty")}
          description={tCart("emptyDescription")}
          actionLabel={tCommon("continueShopping")}
          actionHref="/shop"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader title={tCart("shoppingCart")} />
      <div className="mt-8">
        <div className="divide-y">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>
        <Separator className="my-6" />
        <div className="mb-6">
          <PromotionCodeForm />
        </div>
        {cart && <CartSummary cart={cart} />}
        <div className="mt-8 flex flex-col gap-3">
          <Button size="lg" asChild>
            <Link href="/checkout">{tCommon("proceedToCheckout")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">{tCommon("continueShopping")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
