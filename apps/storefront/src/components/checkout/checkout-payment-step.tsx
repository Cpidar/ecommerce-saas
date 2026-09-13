"use client";

import { useState, useTransition } from "react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/utils";
import { PaymentProviderInput } from "@/components/checkout/payment-provider-input";
import { useCartStore } from "@/store/cart";
import {
  completeCart,
  initiatePaymentSession,
  type ActivePaymentSession,
  type PaymentProviderInfo,
} from "@/lib/medusa/cart-client";
import type { Cart } from "@/types";
import { requestProvider } from "@/lib/checkout/payment-providers";

interface CheckoutPaymentStepProps {
  paymentProviders: PaymentProviderInfo[];
  cart: Cart | null;
  onBack: () => void;
}

export function CheckoutPaymentStep({
  paymentProviders,
  cart,
  onBack,
}: CheckoutPaymentStepProps) {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const [isPending, startTransition] = useTransition();

  if (!cart) {
    return null;
  }

  const [selectedProvider, setSelectedProvider] = useState<PaymentProviderInfo>(
    paymentProviders[0] ?? {},
  );
  const [selectedProviderid, setSelectedProviderid] = useState<string>(
    paymentProviders[0].id ?? "",
  );
  const [activeSession, setActiveSession] =
    useState<ActivePaymentSession | null>(null);
  const [initiatingProvider, setInitiatingProvider] = useState<string | null>(
    null,
  );
  // const [submitting, setSubmitting] = useState(false);

  const ensurePaymentSession = async (
    providerId: string,
    data?: Record<string, unknown>,
  ): Promise<ActivePaymentSession | null> => {
    if (activeSession && activeSession.provider_id === providerId) {
      return activeSession;
    }

    setInitiatingProvider(providerId);
    try {
      const { session } = await initiatePaymentSession(providerId, data);
      setActiveSession(session);
      return session;
    } catch (err) {
      console.error(err);
      toast.error(tCheckout("cantInitiatePayment"));
      return null;
    } finally {
      setInitiatingProvider(null);
    }
  };

  const handleProviderPick = async (provider: PaymentProviderInfo) => {
    console.log(provider);
    setSelectedProvider(provider);
    setSelectedProviderid(provider.id);
    await ensurePaymentSession(provider.id);
  };

  // const handlePayment = async () => {
  //   if (!selectedProviderid) {
  //     toast.error(tCheckout("selectPaymentMethod"));
  //     return;
  //   }

  //   console.log(selectedProviderid);

  //   // setSubmitting(true);
  //   try {
  //     if (!selectedProvider?.config) {
  //       console.error(tCheckout("paymentFailed"));
  //       return;
  //     }
  //     const res = await requestProvider({
  //       providerId: selectedProviderid,
  //       config: selectedProvider.config,
  //       amount: `${cart?.total}`,
  //       successUrl: "checkout/success",
  //       failUrl: "checkout/failed",
  //     });
  //     if (!res) return;
  //     const { referenceId, url, method } = res;
  //     console.log(referenceId);

  //     const session = await ensurePaymentSession(selectedProviderid, {
  //       referenceId,
  //     });
  //     if (!session) return;
  //     window.location.href = `http://localhost:3000/payment/${referenceId}`;
  //   } catch (err) {
  //     console.error(err);
  //     toast.error(tCheckout("paymentFailed"));
  //   }
  //   // finally {
  //   //   setSubmitting(false);
  //   // }
  // };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-lg font-semibold">
            {tCheckout("paymentMethod")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {tCheckout("paymentProviderNote")}
          </p>
        </div>

        <div className="space-y-2">
          {paymentProviders.map((p) => (
            <label
              key={p.id}
              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${selectedProviderid === p.id ? "border-foreground bg-neutral-50" : "border-border"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={selectedProviderid === p.id}
                  onChange={() => handleProviderPick(p)}
                />
                <span className="text-sm font-medium">
                  {providerLabel(p.id, tCheckout)}
                </span>
              </div>
              <code className="text-xs text-muted-foreground">{p.id}</code>
            </label>
          ))}
          {paymentProviders.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {tCheckout("noPaymentProviders")}
            </p>
          )}
        </div>

        {selectedProviderid && (
          <div className="border-t pt-6">
            {initiatingProvider === selectedProviderid ? (
              <p className="text-sm text-muted-foreground">
                {tCheckout("preparingProvider", {
                  provider: providerLabel(selectedProviderid, tCheckout),
                })}
              </p>
            ) : (
              <PaymentProviderInput
                cartId={cart.id}
                providerId={selectedProviderid}
                config={selectedProvider.config}
                session={activeSession}
                totalLabel={formatPrice(cart?.total ?? 0, cart?.currency)}
                onSubmit={async () =>
                  startTransition(async () => {
                    // await handlePayment();
                  })
                }
                submitting={isPending}
              />
            )}
          </div>
        )}

        <div className="flex justify-between gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onBack}>
            {tCommon("back")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function providerLabel(
  id: string,
  tCheckout: ReturnType<typeof useTranslations<"checkout">>,
): string {
  if (id === "pp_system_default")
    return tCheckout("providers.manualSystemDefault");
  if (id.includes("stripe")) return tCheckout("providers.stripe");
  if (id.includes("paypal")) return tCheckout("providers.paypal");
  return id;
}
