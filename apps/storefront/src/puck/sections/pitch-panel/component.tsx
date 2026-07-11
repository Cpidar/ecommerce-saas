import { Carousel } from "@/components/layout/Carousel";
import { Link } from "@/components/ui/Link";
import { ProductCard } from "@/components/products/product-card";
import { Product } from "@/types";
import { Globe2, ShieldCheck, Sparkles } from "lucide-react";

function IncredibleOffers({
  heading,
  data,
  className,
}: {
  heading: string;
  data: Product[];
  className?: string;
}) {
  return (
    <section className="mx-auto w-full max-w-[1440px] px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <Globe2 className="h-6 w-6 text-foreground" />
          <h3 className="mt-4 text-base font-semibold">Cloud or Vercel</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Same code deploys to Medusa Cloud or Vercel. No platform-specific
            dependencies in critical paths — just an env-driven backend URL.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <ShieldCheck className="h-6 w-6 text-foreground" />
          <h3 className="mt-4 text-base font-semibold">Gateway-agnostic</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            A clean payment-provider abstraction. Stripe Elements and PayPal
            Smart Buttons ship in the box. Adding a new provider is one file.
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <Sparkles className="h-6 w-6 text-foreground" />
          <h3 className="mt-4 text-base font-semibold">
            Designed, not generated
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Built on Next.js 16, Tailwind v4, and shadcn/ui by{" "}
            <Link
              href="https://epicdesignlabs.com"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener"
            >
              Epic Design Labs
            </Link>
            . Accessible, responsive, SEO-ready out of the box.
          </p>
        </div>
      </div>
    </section>
  );
}

export default IncredibleOffers;
