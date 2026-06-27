"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { CartSummary } from "@/components/cart/cart-summary";
import { formatPrice } from "@/lib/utils/utils";
import { type PaymentProviderInfo } from "@/lib/cart-client";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";

export default function CheckoutPage() {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const { customer, isReady } = useAuthGuard();

  const cart = useCartStore((s) => s.cart);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const hydrate = useCartStore((s) => s.hydrate);

  useEffect(() => {
    if (!hasHydrated) void hydrate();
  }, [hasHydrated, hydrate]);
  // TODO: get list of payment providers and set
  const [paymentProviders, setPaymentProviders] = useState<
    PaymentProviderInfo[]
  >([]);

  if (!isReady || !customer) return null;

  if (!hasHydrated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {tCheckout("title")}
        </h1>
      </div>
    );
  }

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {tCheckout("title")}
        </h1>
        <p className="mt-8 text-muted-foreground">{tCheckout("emptyCart")}</p>
        <Button className="mt-8" asChild>
          <Link href="/shop">{tCommon("continueShopping")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {tCheckout("title")}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <CheckoutPaymentStep
            paymentProviders={paymentProviders}
            cart={cart}
            onBack={() => null}
          />
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold">
                {tCheckout("orderSummary")}
              </h2>
              <ul className="space-y-2 text-sm">
                {items.map((i) => (
                  <li key={i.id} className="flex justify-between gap-2">
                    <span className="min-w-0 truncate">
                      {i.quantity} × {i.name}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatPrice(i.lineTotal, cart?.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <Separator />
              {cart && <CartSummary cart={cart} />}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
