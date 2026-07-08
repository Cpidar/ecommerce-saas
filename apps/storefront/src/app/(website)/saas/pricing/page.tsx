import { Page } from "@/components/Saas/page";
import { medusaProductRepository } from "@/lib/repositories/products";
import PriceCard from "../_components/price-card";
import { notFound } from "next/navigation";

export default async function PricingPage() {
  const defaultPlanProduct = await medusaProductRepository.getSubscriptionProduct();
  

  if (!defaultPlanProduct) {
    return notFound();
  }

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
          <PriceCard product={defaultPlanProduct} />
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
