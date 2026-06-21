"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import type { HttpTypes } from "@medusajs/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { formatPrice, formatDate } from "@/lib/utils/utils";
import { completeCart } from "@/lib/cart-client";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

export default function CheckoutSuccessPage() {
  const hydrate = useCartStore((s) => s.hydrate);
  const tCheckout = useTranslations("checkout");

  const placeOrder = async () => {
    const result = await completeCart();
    if (result.type === "order") {
      useCartStore.setState({ cart: null, hasHydrated: false });
      return result.order;
    } else {
      toast.error(result.error ?? tCheckout("couldntComplete"));
      await hydrate();
      return null;
    }
  };

  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      <CheckoutSuccessContent orderPromise={placeOrder()} />
    </Suspense>
  );
}

function CheckoutSuccessContent({
  orderPromise,
}: {
  orderPromise: Promise<HttpTypes.StoreOrder | null>;
}) {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const tCart = useTranslations("cart");

  const order = use(orderPromise);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {tCheckout("orderFailed")}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {tCheckout("orderFailed.message")}
          </p>
        </div>
      </div>
    );
  }

  const currency = (order?.currency_code ?? "usd").toLowerCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center">
        <CheckCircle className="h-16 w-16 text-green-600" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {tCheckout("thankYou")}
        </h1>
        <p className="mt-4 text-muted-foreground">
          {order
            ? tCheckout("success.confirmationEmail")
            : tCheckout("success.placed")}
        </p>

        {order && (
          <Card className="mt-8 w-full text-left">
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tCheckout("orderNumber")}
                </span>
                <span className="font-medium">
                  {order.display_id ? `#${order.display_id}` : order.id}
                </span>
              </div>
              {order.created_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {tCheckout("date")}
                  </span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
              )}
              <Separator />
              {(order.items ?? []).map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product_title ?? item.title} &times; {item.quantity}
                  </span>
                  <span>{formatPrice(item.subtotal ?? 0, currency)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tCart("subtotal")}
                </span>
                <span>{formatPrice(order.subtotal ?? 0, currency)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tCart("shipping")}
                </span>
                <span>
                  {(order.shipping_total ?? 0) === 0
                    ? tCommon("free")
                    : formatPrice(order.shipping_total ?? 0, currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {tCheckout("success.tax")}
                </span>
                <span>{formatPrice(order.tax_total ?? 0, currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>{tCart("total")}</span>
                <span>{formatPrice(order.total ?? 0, currency)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex gap-4">
          <Button asChild>
            <Link href="/account/orders">{tCheckout("viewOrders")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/shop">{tCommon("continueShopping")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function CheckoutSuccessLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          در حال بازگشت به سایت ..
        </h1>
      </div>
    </div>
  );
}
