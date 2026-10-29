"use client";

import { Check } from "lucide-react";

import type { Plan } from "@/types/subscription";
import { formatPrice } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface PricingInteractiveProps {
  plans: Plan[];
}

// const formatPrice = (value: number) => `$${value.toLocaleString("en-US")}`;

export function PricingInteractive({ plans }: PricingInteractiveProps) {
  const router = useRouter();

  return (
    <>
      {/*<div
        className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
        aria-label="Billing interval"
      >
        <span
          id="monthly-label"
          className={
            interval === "monthly" ? "font-semibold" : "text-muted-foreground"
          }
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={interval === "yearly"}
          aria-labelledby="monthly-label yearly-label"
          onClick={toggleInterval}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              toggleInterval();
            }
          }}
          className="relative inline-flex min-h-8 w-14 items-center rounded-full border border-border bg-muted p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span
            className={`h-7 w-7 rounded-full bg-primary shadow-subtle transition-transform motion-reduce:transition-none ${
              interval === "yearly" ? "-translate-x-5" : "-translate-x-0"
            }`}
            aria-hidden="true"
          />
        </button>
        <span
          id="yearly-label"
          className={
            interval === "yearly" ? "font-semibold" : "text-muted-foreground"
          }
        >
          Yearly
        </span>
        <span className="rounded-full bg-accent/25 px-3 py-1 text-sm font-semibold text-foreground">
          Save 20%
        </span>
      </div>*/}

      <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map((plan) => {
          // const price = getPrice(plan, interval);
          const price = plan.price * (1 - plan.discount / 100);

          return (
            <article
              key={plan.id}
              className={`flex flex-col rounded-lg border bg-background p-6 ${
                plan.highlighted
                  ? "border-primary shadow-glow"
                  : "border-border shadow-subtle"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {plan.description}
                  </p>
                </div>
                {plan.highlighted ? (
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    پر طرفدار
                  </span>
                ) : null}
              </div>

              <div className="mt-8 min-h-28" aria-live="polite">
                {price ? (
                  <>
                    <p className="flex items-baseline gap-1">
                      <span className="pricing-price min-w-24 text-4xl font-semibold tabular-nums tracking-tight motion-safe:transition-opacity">
                        {formatPrice(price)}
                      </span>
                      <span className="text-muted-foreground">/ در ماه</span>
                    </p>
                    {plan.discount > 0 && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="line-through text-gray-500">
                          {formatPrice(plan.price)}
                        </span>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-4xl font-semibold tracking-tight">
                      Custom
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tailored to your team
                    </p>
                  </>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className="mt-1 shrink-0 text-primary"
                      size={18}
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-4"
                onClick={() => router.replace(plan.href)}
              >
                {plan.cta}
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}
