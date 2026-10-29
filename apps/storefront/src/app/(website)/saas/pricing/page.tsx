import { Page } from "@/components/Saas/page";
import { PricingInteractive } from "../_components/pricing-intractive";
import { plans } from "@/lib/config";
// import { medusaProductRepository } from "@/lib/repositories/products-repository";

export default async function PricingPage() {
  // const defaultPlanProduct = await medusaProductRepository.getSubscriptionProduct();

  // if (!defaultPlanProduct?.id) {
  //   return notFound();
  // }

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

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          {/*<PriceCard product={defaultPlanProduct} />*/}
          <PricingInteractive plans={plans} />
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
