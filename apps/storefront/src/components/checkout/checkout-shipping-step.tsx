"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/utils";
import {
  addShippingMethod,
  listPaymentProviders,
  type ShippingOption,
  type PaymentProviderInfo,
} from "@/lib/cart-client";
import type { Cart } from "@/types";

interface CheckoutShippingStepProps {
  shippingOptions: ShippingOption[];
  shippingError: string | null;
  cart: Cart | null;
  onShippingSubmitted: (paymentProviders: PaymentProviderInfo[]) => void;
  onBack: () => void;
}

export function CheckoutShippingStep({
  shippingOptions,
  shippingError,
  cart,
  onShippingSubmitted,
  onBack,
}: CheckoutShippingStepProps) {
  const tCheckout = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const [selectedShipping, setSelectedShipping] = useState<string>(
    shippingOptions[0]?.id ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedShipping) {
      toast.error(tCheckout("selectShippingMethod"));
      return;
    }

    setSubmitting(true);
    try {
      await addShippingMethod(selectedShipping);
      const providers = await listPaymentProviders();
      onShippingSubmitted(providers);
    } catch (err) {
      console.error(err);
      toast.error(tCheckout("cantApplyShipping"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <h2 className="text-lg font-semibold">
          {tCheckout("shippingMethod")}
        </h2>
        {shippingError && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {shippingError}
          </div>
        )}
        {shippingOptions.length === 0 && !shippingError && (
          <p className="text-sm text-muted-foreground">
            {tCheckout("shipping.loadingOptions")}
          </p>
        )}
        <div className="space-y-2">
          {shippingOptions.map((o) => (
            <label
              key={o.id}
              className={`flex items-center justify-between rounded-md border p-4 cursor-pointer transition-colors ${selectedShipping === o.id ? "border-foreground bg-neutral-50" : "border-border"}`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={o.id}
                  checked={selectedShipping === o.id}
                  onChange={() => setSelectedShipping(o.id)}
                />
                <span className="text-sm font-medium">{o.name}</span>
              </div>
              <span className="text-sm tabular-nums">
                {o.priceType === "flat"
                  ? formatPrice(o.amount, cart?.currency)
                  : tCheckout("shipping.calculated")}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-between gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            {tCommon("back")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || shippingOptions.length === 0}
          >
            {submitting
              ? tCheckout("actions.saving")
              : tCheckout("actions.continueToPayment")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
