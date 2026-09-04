"use client";

import { Suspense, use, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  retrySubscriptionPayment,
} from "@/lib/repositories/subscriptions";
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
import { useCartStore } from "@/store/cart";
import { transferCart } from "@/lib/medusa/auth-server";

export default function CheckoutSuccessPage() {
  const hydrate = useCartStore((s) => s.hydrate);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const cart = useCartStore((s) => s.cart);
  const tCheckout = useTranslations("checkout");

  // Make sure the cart store is actually hydrated before we read from it
  useEffect(() => {
    if (!hasHydrated) {
      hydrate();
    }
  }, [hasHydrated, hydrate]);

  const purchaseMode = getCartPurchaseMode(cart);
  const isSubscripitionMode = purchaseMode === "subscription";

  // Cache the promise so it's only created ONCE, not on every render
  const orderPromiseRef = useRef<ReturnType<
    typeof placeSubscriptionOrder
  > | null>(null);

  if (hasHydrated && isSubscripitionMode && !orderPromiseRef.current) {
    orderPromiseRef.current = placeSubscriptionOrder(
      cart!.id,
      hydrate,
      tCheckout,
    );
  }

  if (!hasHydrated) {
    return <CheckoutSuccessLoading />;
  }

  return (
    <Suspense fallback={<CheckoutSuccessLoading />}>
      {isSubscripitionMode && orderPromiseRef.current && (
        <SubscriptionSummary
          cart={cart!}
          orderPromise={orderPromiseRef.current}
        />
      )}
    </Suspense>
  );
}

async function placeSubscriptionOrder(
  cartId: string,
  hydrate: () => Promise<void>,
  tCheckout: ReturnType<typeof useTranslations>,
) {
  await transferCart();
  // TODO: retrive Subscription id from url search params or cookie
  const result = await retrySubscriptionPayment("Subscription_id");
  if (result?.status === "active") {
    useCartStore.setState({ cart: null, hasHydrated: false });
    toast.success(tCheckout("success"));
    return result;
  } else {
    toast.error(tCheckout("couldntComplete"));
    await hydrate();
    return null;
  }
}

const SubscriptionSummary = ({
  cart,
  orderPromise,
}: {
  cart: Cart;
  orderPromise: ReturnType<typeof placeSubscriptionOrder>;
}) => {
  const response = use(orderPromise);
  const subscriptionItem = (cart.items ?? []).find(
    (item) => parseSubscriptionLineItemMetadata(item.metadata).is_subscription,
  );

  console.log("subscription item mode: ", subscriptionItem);

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

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-x-4">
    <span>{label}</span>
    <span className="text-right text-ui-fg-base">{value}</span>
  </div>
);

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
