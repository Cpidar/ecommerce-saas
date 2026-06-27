"use client";

import {
  getDefaultSubscriptionFrequencyOption,
  getProductSubscriptionOffer,
  mapStoreSubscriptionOffer,
} from "@/lib/utils/subscription-offers";
import { HttpTypes } from "@medusajs/types";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ProductSubscriptionOffer,
  ReorderSubscriptionLineItemMetadataInput,
  SubscriptionOfferFrequencyOption,
  SubscriptionPriceSummary,
  SubscriptionPurchaseMode,
} from "../../../../types/subscription";
import { getSubscriptionPriceSummary } from "@/lib/utils/subscriptions";
import { retrieveProductSubscriptionOffer } from "@/lib/repositories/subscription-offers";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/store/cart";
import { Page } from "@/components/Saas/page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/components/ui/Link";

type ProductActionsProps = {
  product: Product;
  initialSubscriptionOffer?: ProductSubscriptionOffer | null;
};



export default function PricePlans({
  product,
  initialSubscriptionOffer = null,
}: ProductActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addToCart = useCartStore((s) => s.addItem);

  const [selectedVariantId, setSelectedVariantId] = useState(
    // [MY-FORK-PRODUCT] Default to first available variant with inventory, not just first variant
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
      await addToCart(selectedVariant!.id, 1, "", subscriptionMetadata);

  };

  return (
    <>
      {subscriptionOffer &&
        purchaseMode === "subscribe" &&
        subscriptionOffer.frequency_options.map((fo) => (
          <>
            <PricingCard
              title={fo.label}
              description="Best for growing teams and businesses"
              selectedFrequencyOption={fo}
              selectedVariant={selectedVariant}
              features={[
                "Unlimited projects",
                "50 GB storage",
                "Priority email support",
                "Custom integrations",
                "Team collaboration tools",
              ]}
              ctaButton={
                <Button className="w-full" size="lg" asChild>
                  <Link href="/dash">Start Free Trial</Link>
                </Button>
              }
            />
          </>
        ))}
    </>
  );
}

type PricingCardProps = {
  title: string;
  description: string;
  selectedVariant: ProductVariant;
  selectedFrequencyOption: SubscriptionOfferFrequencyOption;
  features: string[];
  ctaButton?: ReactNode;
};
function PricingCard({
  selectedFrequencyOption,
  selectedVariant,
}: PricingCardProps) {
  const subscriptionPrice = selectedFrequencyOption?.discount
    ? getSubscriptionPriceSummary({
        amount: selectedVariant.price,
        currencyCode: selectedVariant.currency,
        pricingSnapshot: {
          discount_type: selectedFrequencyOption.discount.discount_type,
          discount_value: selectedFrequencyOption.discount.discount_value,
          label: selectedFrequencyOption.discount.label,
        },
      })
    : null;
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
        <div className="flex items-end">
          <span className="text-4xl font-semibold">
            {subscriptionPrice
              ? subscriptionPrice.subscriptionAmount
              : selectedVariant.price}
          </span>
          <span className="text-lg text-muted-foreground">/month</span>
        </div>
        <Separator className="mt-3" />
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <ul className="space-y-3">
          {props.features.map((feature) => (
            <li key={feature} className="flex items-center gap-3">
              <CheckIcon className="size-4 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>{props.ctaButton}</CardFooter>
    </Card>
  );
}
