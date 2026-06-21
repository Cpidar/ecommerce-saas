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
import { BASE_SUBSCRIPTION_OFFERS, BASE_SUBSCRIPTION_PRICE } from "@/lib/config";
import { retrieveProductSubscriptionOffer } from "@/lib/repositories/subscription-offers";
import { getSubscriptionPriceSummary } from "@/lib/utils/subscriptions";
import { ProductSubscriptionOffer } from "@/types/subscription";
import { CheckIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode, useMemo, useState } from "react";

export default function PricingPage() {
  const plans = useMemo(
    () => BASE_SUBSCRIPTION_OFFERS.subscription_offer.allowed_frequencies,
    [],
  );

    const subscriptionPrice = (selectedFrequencyOption) => 
    selectedFrequencyOption?.discount
      ? getSubscriptionPriceSummary({
          amount: BASE_SUBSCRIPTION_PRICE,
          currencyCode: "تومان",
          pricingSnapshot: {
            discount_type: selectedFrequencyOption.discount.discount_type,
            discount_value: selectedFrequencyOption.discount.discount_value,
            label: selectedFrequencyOption.discount.label,
          },
        })
      : null
  return (
    <div className="grow bg-linear-to-b from-background from-80% to-primary/5">
      <Page>
        <h1 className="text-center text-4xl leading-normal md:text-5xl md:leading-normal">
          Pricing
        </h1>
        <p className="mx-auto mt-2 mb-6 max-w-md text-center text-lg text-balance text-muted-foreground">
          Choose the perfect plan for your needs. Start free and upgrade as you
          grow.
        </p>

        <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2 lg:gap-8">
          {plans.map((p, i) => (
            <PricingCard
            key={i}
              title={p.label}
              description="Perfect for individuals and small projects"
              price={BASE_SUBSCRIPTION_PRICE*p.}
              features={[
                "Up to 5 projects",
                "1 GB storage",
                "Basic analytics",
                "Community support",
                "Mobile app access",
              ]}
              ctaButton={
                <Button className="w-full" size="lg" variant="secondary">
                  <Link href="/dash">Get Started</Link>
                </Button>
              }
            />
          ))}

          <PricingCard
            title="Professional"
            description="Best for growing teams and businesses"
            price="$29"
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
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need a custom plan for your organization?{" "}
            <a
              href="mailto:sales@example.com"
              className="text-primary hover:underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </Page>
    </div>
  );
}

type PricingCardProps = {
  title: string;
  description: string;
  price: string;
  features: string[];
  ctaButton?: ReactNode;
};
function PricingCard(props: PricingCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription>{props.description}</CardDescription>
        <div className="flex items-end">
          <span className="text-4xl font-semibold">{props.price}</span>
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
