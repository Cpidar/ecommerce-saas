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
import { completeCart } from "@/lib/medusa/cart-client";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { completeSubscriptionCheckout } from "@/lib/repositories/subscriptions";
import {
  formatNextDeliveryDate,
  formatSubscriptionCadence,
  getCartPurchaseMode,
  getEstimatedNextDeliveryDate,
  getSubscriptionPriceSummary,
  parseSubscriptionLineItemMetadata,
  parseSubscriptionLineItemPricingMetadata,
} from "@/lib/utils/subscriptions";
import { Cart } from "@/types";
import { ReorderStoreSubscriptionCheckoutResponse } from "@/types/subscription";

export default function CheckoutSuccessPage() {
  const hydrate = useCartStore((s) => s.hydrate);
  const cart = useCartStore((s) => s.cart);
  const tCheckout = useTranslations("checkout");

  const placeSubscriptionOrder = async () => {
    const result = await completeSubscriptionCheckout(cart!.id);
    if (result.type === "order") {
      useCartStore.setState({ cart: null, hasHydrated: false });
      return result;
    } else {
      toast.error(tCheckout("couldntComplete"));
      await hydrate();
      return null;
    }
  };
  const purchaseMode = getCartPurchaseMode(cart);
  const isSubscripitionMode = purchaseMode === "subscription";

  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      {isSubscripitionMode && (
        // TODO: implement subscription order summary
        <SubscriptionSummary
          cart={cart!}
          orderPromise={placeSubscriptionOrder()}
        />
      )}
    </Suspense>
  );
}

const SubscriptionSummary = ({
  cart,
  orderPromise,
}: {
  cart: Cart;
  orderPromise: Promise<ReorderStoreSubscriptionCheckoutResponse | null>;
}) => {
  const reponse = use(orderPromise);
  const subscriptionItem = (cart.items ?? []).find(
    (item) => parseSubscriptionLineItemMetadata(item.metadata).is_subscription,
  );

  if (!subscriptionItem) {
    return null;
  }

  const metadata = parseSubscriptionLineItemMetadata(subscriptionItem.metadata);
  const cadenceLabel = formatSubscriptionCadence(
    metadata.frequency_interval,
    metadata.frequency_value,
  );
  const nextDeliveryLabel = formatNextDeliveryDate(
    getEstimatedNextDeliveryDate(
      metadata.frequency_interval,
      metadata.frequency_value,
    ),
  );
  const pricingMetadata = parseSubscriptionLineItemPricingMetadata(
    subscriptionItem.metadata,
  );
  const priceSummary = getSubscriptionPriceSummary({
    amount: subscriptionItem.price ?? 0,
    currencyCode: cart.currency ?? "irr",
    pricingSnapshot: pricingMetadata,
  });

  return (
    <div className="rounded-xl border border-ui-border-base bg-ui-bg-subtle px-4 py-4">
      <p className="txt-medium-plus text-ui-fg-base">Subscription summary</p>
      <div className="mt-4 flex flex-col gap-y-3 text-sm text-ui-fg-muted">
        {cadenceLabel && <SummaryRow label="Frequency" value={cadenceLabel} />}
        {nextDeliveryLabel && (
          <SummaryRow label="Next delivery" value={nextDeliveryLabel} />
        )}
        <SummaryRow
          label="One-time price"
          value={priceSummary.formattedOriginalAmount}
        />
        <SummaryRow
          label="Recurring price"
          value={priceSummary.formattedSubscriptionAmount}
        />
        <SummaryRow
          label="Delivery terms"
          value="Recurring orders renew automatically until you cancel."
        />
      </div>
      <p className="mt-4 text-sm text-ui-fg-muted">
        By starting this subscription, you authorize recurring charges based on
        the selected cadence and agree that future deliveries follow the same
        subscription terms.
      </p>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex items-start justify-between gap-x-4">
      <span>{label}</span>
      <span className="text-right text-ui-fg-base">{value}</span>
    </div>
  );
};

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
