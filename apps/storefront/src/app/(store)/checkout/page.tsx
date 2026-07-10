"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cart";
import { CartSummary } from "@/components/cart/cart-summary";
import { formatPrice } from "@/lib/utils/utils";
import {
  type CheckoutAddress,
  type ShippingOption,
  type PaymentProviderInfo,
} from "@/lib/cart-client";
import { DEFAULT_REGION } from "@/lib/medusa";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import citiesjson from "@/lib/static-data/cities.json";
import { CheckoutAddressStep } from "@/components/checkout/checkout-address-step";
import { CheckoutShippingStep } from "@/components/checkout/checkout-shipping-step";
import { CheckoutPaymentStep } from "@/components/checkout/checkout-payment-step";
import { getCartPurchaseMode } from "@/lib/utils/subscriptions";

type Step = "address" | "shipping" | "payment";

const EMPTY_ADDRESS: CheckoutAddress = {
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  country_code: "",
  phone: "",
};

export default function CheckoutPage() {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const { customer, isReady } = useAuthGuard();
  
  const cart = useCartStore((s) => s.cart);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const hydrate = useCartStore((s) => s.hydrate);
  const purchaseMode = getCartPurchaseMode(cart)
  const isSubscripitionMode = useMemo(() => purchaseMode === "subscription", [purchaseMode])

  useEffect(() => {
    if (!hasHydrated) void hydrate();
  }, [hasHydrated, hydrate]);

  const [step, setStep] = useState<Step>(isSubscripitionMode ? "payment" :"address");
  const [address, setAddress] = useState<CheckoutAddress>({
    ...EMPTY_ADDRESS,
    country_code: DEFAULT_REGION.toLowerCase(),
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [paymentProviders, setPaymentProviders] = useState<
    PaymentProviderInfo[]
  >([]);

  const cities = citiesjson.cities.map((c) => c.name);

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

  const handleAddressSubmitted = (options: ShippingOption[]) => {
    setAddress(address);
    setShippingOptions(options);
    if (options.length === 0) {
      setShippingError(tCheckout("noShippingOptions"));
    } else {
      setShippingError(null);
    }
    setStep("shipping");
  };

  const handleShippingSubmitted = (providers: PaymentProviderInfo[]) => {
    setPaymentProviders(providers);
    setStep("payment");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-16 sm:px-6 sm:py-16 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        {tCheckout("title")}
      </h1>
      { !isSubscripitionMode && <StepIndicator current={step} /> }

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {step === "address" && (
            <CheckoutAddressStep
              initialAddress={address}
              customer={customer}
              cities={cities}
              onAddressSubmitted={handleAddressSubmitted}
            />
          )}

          {step === "shipping" && (
            <CheckoutShippingStep
              shippingOptions={shippingOptions}
              shippingError={shippingError}
              cart={cart}
              onShippingSubmitted={handleShippingSubmitted}
              onBack={() => setStep("address")}
            />
          )}

          {step === "payment" && (
            <CheckoutPaymentStep
              paymentProviders={paymentProviders}
              cart={cart}
              onBack={() => setStep("shipping")}
            />
          )}
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

function StepIndicator({ current }: { current: Step }) {
  const tCheckout = useTranslations("checkout");
  const steps: { id: Step; label: string }[] = [
    { id: "address", label: tCheckout("steps.address") },
    { id: "shipping", label: tCheckout("steps.shipping") },
    { id: "payment", label: tCheckout("steps.payment") },
  ];
  const currentIndex = steps.findIndex((s) => s.id === current);
  return (
    <ol className="mt-4 flex gap-2 text-xs sm:text-sm">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <span
            className={
              i <= currentIndex
                ? "rounded-full bg-foreground px-2.5 py-1 font-medium text-background"
                : "rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
            }
          >
            {i + 1}. {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className="text-muted-foreground">›</span>
          )}
        </li>
      ))}
    </ol>
  );
}
