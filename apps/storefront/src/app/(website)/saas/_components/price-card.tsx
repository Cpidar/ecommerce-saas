"use client";

import {
  getDefaultSubscriptionFrequencyOption,
  getProductSubscriptionOffer,
  mapStoreSubscriptionOffer,
} from "@/lib/utils/subscription-offers";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ProductSubscriptionOffer,
  ReorderSubscriptionLineItemMetadataInput,
  SubscriptionPurchaseMode,
} from "../../../../types/subscription";
import { getSubscriptionPriceSummary } from "@/lib/utils/subscriptions";
import { retrieveProductSubscriptionOffer } from "@/lib/repositories/subscription-offers";
import { Product } from "@/types";
import { useCartStore } from "@/store/cart";
import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { initiatePaymentSession } from "@/lib/medusa/cart-client";

type ProductActionsProps = {
  product: Product;
  initialSubscriptionOffer?: ProductSubscriptionOffer | null;
};

export default function PriceCard({
  product,
  initialSubscriptionOffer = null,
}: ProductActionsProps) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clear);

  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0].id,
  );

  const [purchaseMode, setPurchaseMode] =
    useState<SubscriptionPurchaseMode>("subscribe");

  const fallbackSubscriptionOffer = useMemo(
    () => getProductSubscriptionOffer(product),
    [product],
  );
  const [subscriptionOffer, setSubscriptionOffer] =
    useState<ProductSubscriptionOffer | null>(
      initialSubscriptionOffer ?? fallbackSubscriptionOffer,
    );

  const defaultFrequencyOption = useMemo(
    () => getDefaultSubscriptionFrequencyOption(subscriptionOffer),
    [subscriptionOffer],
  );
  const [selectedFrequencyId, setSelectedFrequencyId] = useState<string | null>(
    defaultFrequencyOption?.id ?? null,
  );

  useEffect(() => {
    setSelectedFrequencyId(defaultFrequencyOption?.id ?? null);
  }, [defaultFrequencyOption?.id]);

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return null;
    }

    return product.variants.find((v) => v.id === selectedVariantId);
  }, [product.variants, selectedVariantId]);

  if (!selectedVariant) return null;

  useEffect(() => {
    let isMounted = true;

    retrieveProductSubscriptionOffer(product.id, selectedVariant?.id)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setSubscriptionOffer(
          mapStoreSubscriptionOffer(response) ??
            getProductSubscriptionOffer(product, selectedVariant?.id),
        );
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setSubscriptionOffer(
          getProductSubscriptionOffer(product, selectedVariant?.id),
        );
      });

    return () => {
      isMounted = false;
    };
  }, [product, selectedVariant?.id]);

  const selectedFrequencyOption = useMemo(() => {
    return (
      subscriptionOffer?.frequency_options.find(
        (option) => option.id === selectedFrequencyId,
      ) ?? defaultFrequencyOption
    );
  }, [defaultFrequencyOption, selectedFrequencyId, subscriptionOffer]);

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null;

    const subscriptionMetadata:
      | ReorderSubscriptionLineItemMetadataInput
      | undefined =
      purchaseMode === "subscribe" &&
      selectedFrequencyOption?.is_backend_compatible &&
      selectedFrequencyOption.backend_interval &&
      selectedFrequencyOption.backend_value
        ? {
            is_subscription: true,
            frequency_interval: selectedFrequencyOption.backend_interval,
            frequency_value: selectedFrequencyOption.backend_value,
            subscription_discount: selectedFrequencyOption.discount
              ? {
                  discount_type: selectedFrequencyOption.discount.discount_type,
                  discount_value:
                    selectedFrequencyOption.discount.discount_value,
                  label: selectedFrequencyOption.discount.label,
                }
              : null,
          }
        : undefined;

    await clearCart();
    await addToCart(
      selectedVariant!.id,
      1,
      selectedVariant.price,
      Infinity,
      "",
      subscriptionMetadata,
    );

    if (subscriptionOffer?.trialDays && subscriptionOffer.trialDays > 0) {
      // Subscription checkout requires an initialized payment session
      const { session } = await initiatePaymentSession(
        "pp_behpardakht_behpardakht",
        // subscription must have a referenceId to validiate payment,
        // so if subscription has trial mode i get it a abitrary reference id
        { referenceId: "a-aribitrary-value-just-for-payment-validation" },
      );

      // TODO: it must redirect to the account/subscription page, but for now we redirect to the authentication page
      router.push("/onboarding/trial");
    } else {
      // TODO: must redirect to checkout page
    }
  };

  return (
    <>
      {subscriptionOffer &&
        purchaseMode === "subscribe" &&
        subscriptionOffer.frequency_options.map((fo) => {
          const subscriptionPrice = fo?.discount
            ? getSubscriptionPriceSummary({
                amount: selectedVariant.price,
                currencyCode: selectedVariant.currency,
                pricingSnapshot: {
                  discount_type: fo.discount.discount_type,
                  discount_value: fo.discount.discount_value,
                  label: fo.discount.label,
                },
              })
            : null;
          console.log(subscriptionPrice);
          return (
            <Card className="flex flex-col" key={fo.id}>
              <CardHeader>
                <CardTitle>{fo.label}</CardTitle>
                <CardDescription>{fo.label}</CardDescription>
                <div className="flex items-end">
                  <span className="text-4xl font-semibold">
                    {subscriptionPrice
                      ? subscriptionPrice.subscriptionAmount
                      : selectedVariant.price}
                  </span>
                  {subscriptionPrice && (
                    <>
                      <p>
                        <span className="text-ui-fg-subtle">Original: </span>
                        <span
                          className="line-through"
                          data-testid="original-product-price"
                          data-value={subscriptionPrice.originalAmount}
                        >
                          {subscriptionPrice.originalAmount}
                        </span>
                      </p>
                      {subscriptionPrice.percentageDiff && (
                        <span className="text-ui-fg-interactive">
                          -{subscriptionPrice.percentageDiff}%
                        </span>
                      )}
                    </>
                  )}
                  <span className="text-lg text-muted-foreground">/month</span>
                </div>
                <Separator className="mt-3" />
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {/* <ul className="space-y-3">
                  {props.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckIcon className="size-4 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul> */}
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" onClick={handleAddToCart}>
                  Start Free Trial
                </Button>
              </CardFooter>
            </Card>
          );
        })}
    </>
  );
}
