"use client"

import { useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { CartItem } from "./cart-item"
import { PromotionCodeForm } from "./promotion-code-form"
import { useCartStore } from "@/store/cart"
import { formatPrice } from "@/lib/utils/utils"
import { useTranslations } from "next-intl"
import { useMediaQuery } from "@/hooks/use-media-query"

export function CartDrawer() {
  const tCart = useTranslations("cart")
  const tCommon = useTranslations("common")
  const cart = useCartStore((s) => s.cart)
  const isOpen = useCartStore((s) => s.isOpen)
  const closeCart = useCartStore((s) => s.closeCart)
  const hydrate = useCartStore((s) => s.hydrate)
  const hasHydrated = useCartStore((s) => s.hasHydrated)

  const isDesktop = useMediaQuery("(min-width: 768px)")
  
  // Hydrate the cart once on mount
  useEffect(() => {
    if (!hasHydrated) void hydrate()
  }, [hasHydrated, hydrate])

  const items = cart?.items ?? []
  const subtotal = cart?.subtotal ?? 0

  return (
    <Drawer direction={ isDesktop ? "right" : "bottom" } open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <DrawerContent
      dir="rtl"
        className="flex h-full flex-col !gap-0 sm:max-w-md border-none"
      >
        <DrawerHeader className="border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <DrawerClose asChild>
              <button
                className="text-sm text-muted-foreground hover:text-foreground sm:hidden"
              >
                &larr; {tCommon("back")}
              </button>
            </DrawerClose>

            <DrawerClose asChild>
              <button
                className="hidden rounded-md p-1 text-muted-foreground hover:text-foreground sm:block sm:ml-auto"
                aria-label={tCart("closeCart")}
              >
                <X className="h-5 w-5" />
              </button>
            </DrawerClose>
          </div>

          <DrawerTitle className="mt-2 text-2xl font-bold tracking-tight">
            {tCart("shoppingCart")} ({items.length}{" "}
            {items.length === 1 ? tCommon("item") : tCommon("items")})
          </DrawerTitle>
        </DrawerHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm font-medium">{tCart("empty")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {tCart("addItems")}
            </p>
            <DrawerClose asChild>
              <Button className="mt-6" asChild>
                <Link href="/shop">{tCommon("continueShopping")}</Link>
              </Button>
            </DrawerClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="divide-y">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </div>

            <DrawerFooter className="border-t px-4 py-6">
              <div className="w-full space-y-3">
                <PromotionCodeForm />

                <div className="flex justify-between text-sm font-medium">
                  <span>{tCart("subtotal")}</span>
                  <span>{formatPrice(subtotal, cart?.currency)}</span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {tCart("shippingNote")}
                </p>

                <DrawerClose asChild>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">{tCommon("checkout")}</Link>
                  </Button>
                </DrawerClose>

                <DrawerClose asChild>
                  <button className="w-full py-2 text-center text-sm text-muted-foreground underline hover:text-foreground sm:hidden">
                    {tCommon("continueShopping")}
                  </button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  )
}