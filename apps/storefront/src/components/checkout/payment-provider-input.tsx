"use client";

import { Button } from "@/components/ui/button";
import type { ActivePaymentSession } from "@/lib/medusa/cart-client";
import BehpardakhtIcon from "./BehpardakhtIcon";
import { requestProvider } from "@/lib/checkout/payment-providers";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

export interface ProviderInputProps {
  cartId: string;
  /** The provider id chosen by the customer (e.g. "pp_stripe_stripe"). */
  providerId: string;

  config?: Record<string, string>;
  /** Payment session returned by initiatePaymentSession — provider-specific data. */
  session: ActivePaymentSession | null;
  /** Pretty total to render on the submit button. */
  totalLabel: string;
  /** Submit handler — orchestrates provider confirm + cart.complete. */
  onSubmit: () => Promise<void>;
  /** Loading state for the submit button. */
  submitting: boolean;
}

/**
 * Renders the right payment input for whichever Medusa payment provider the
 * customer picked. New providers (PayPal, Throttle, etc.) plug in here without
 * touching the checkout flow.
 */
export function PaymentProviderInput(props: ProviderInputProps) {
  if (isBehpardakhtProviderId(props.providerId)) {
    return <BehpardakhtPayment {...props} />;
  }
  if (props.providerId === "pp_system_default") {
    return <SystemDefaultPayment {...props} />;
  }
  if (isZibalProviderId(props.providerId)) {
    return <SystemDefaultPayment {...props} />;
  }
  return <GenericPayment {...props} />;
}

function isBehpardakhtProviderId(id: string): boolean {
  return id.startsWith("pp_behpardakht") || id === "pp_behpardakht_behpardakht";
}

function isZibalProviderId(id: string): boolean {
  return id.startsWith("pp_zibal") || id === "pp_zibal_zibal";
}

// ---------------------------------------------------------------------------
// pp_system_default — manual payment, useful for demos and as a fallback
// ---------------------------------------------------------------------------

function SystemDefaultPayment({
  onSubmit,
  submitting,
  totalLabel,
  session,
}: ProviderInputProps) {
  const { referenceId, resCode, errorMessage } =
    (session?.data as Record<string, string> | undefined) || {};

  // if (!referenceId) {
  //   return (
  //     <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
  //       {/* Couldn&apos;t get a PayPal order id from the payment session. Check that
  //       PayPal is configured on the Medusa backend. */}
  //       {errorMessage ?? "somethng wrong!"}
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-4">
      <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        Manual payment provider (test mode) — no real card is charged. Configure
        Stripe, PayPal, or another provider on your Medusa backend for
        production checkout.
      </p>
      <form
        action={`http://localhost:3000/payment/${referenceId}`}
        method="GET"
      >
        {/* <form action="https://bpm.shaparak.ir/pgwchannel/startpay.mellat"> */}
        <input type="hidden" value={referenceId} id="RefId" name="RefId" />

        <Button
          onClick={onSubmit}
          disabled={submitting}
          size="lg"
          className="w-full"
          type="submit"
        >
          {submitting ? "Placing order…" : `Place order — ${totalLabel}`}
        </Button>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Unknown provider — let the user click Place Order; the backend's provider
// will reject if it needs client-side confirmation we haven't wired up.
// ---------------------------------------------------------------------------

function GenericPayment({
  onSubmit,
  submitting,
  totalLabel,
  providerId,
}: ProviderInputProps) {
  return (
    <div className="space-y-4">
      <p className="rounded-md border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
        Payment provider{" "}
        <code className="rounded bg-background px-1">{providerId}</code> uses a
        server-side flow. Click Place order to continue. If the provider
        requires client-side confirmation, add a renderer in
        <code className="ml-1 rounded bg-background px-1">
          payment-provider-input.tsx
        </code>
        .
      </p>
      <Button
        onClick={onSubmit}
        disabled={submitting}
        size="lg"
        className="w-full"
      >
        {submitting ? "Placing order…" : `Place order — ${totalLabel}`}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Behpradakht — Smart Buttons + onApprove
// ---------------------------------------------------------------------------

const GENERIC_ERROR = "خطا در ارتباط با درگاه پرداخت";

type GatewayMethod = "POST" | "GET";

function BehpardakhtPayment({
  cartId,
  providerId = "pp-behpardakht-behpardakht",
  session,
  onSubmit,
  submitting,
  config,
}: ProviderInputProps) {
  const [gateway, setGateway] = useState<{
    url: string;
    method: GatewayMethod;
    referenceId: string;
  }>();
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false); // guards against double form-submit

  // Auto-submit the hidden form once gateway data arrives
  useEffect(() => {
    if (gateway && formRef.current && !submittedRef.current) {
      submittedRef.current = true;
      formRef.current.submit();
    }
  }, [gateway]);

  if (!session?.amount || !config) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
        {GENERIC_ERROR}
      </div>
    );
  }

  const handlePayment = useCallback(() => {
    if (!providerId || !config || isPending || submittedRef.current) return;

    setError(undefined);
    const controller = new AbortController();

    startTransition(async () => {
      try {
        const res = await requestProvider({
          cartId,
          providerId,
          config,
          amount: `${session.amount}`,
          callbackUrl: `http://localhost:8000/api/payment/sandbox/callback`,
          // successUrl: "checkout/success",
          failUrl: "checkout/failed",
          // signal: controller.signal, // if requestProvider supports it
        });

        // if (controller.signal.aborted) return;

        if (!res?.url || !res?.referenceId) {
          setError(GENERIC_ERROR);
          return;
        }

        setGateway({
          url: res.url,
          method: (res.method as GatewayMethod) || "POST",
          referenceId: res.referenceId,
        });
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error(err);
          setError(GENERIC_ERROR);
        }
      }
    });

    return () => controller.abort();
  }, [providerId, config, session.amount, isPending]);

  const busy = isPending || submitting;

  return (
    <div className="space-y-3">
      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900"
        >
          {error}
        </div>
      )}

      {/* Hidden form submitted natively so the browser performs a real
          cross-origin POST/GET redirect to the bank gateway */}
      <form
        ref={formRef}
        action={gateway?.url}
        method={gateway?.method ?? "POST"}
        className="hidden"
        aria-hidden="true"
      >
        <input type="hidden" name="RefId" value={gateway?.referenceId ?? ""} />
      </form>

      <Button
        type="button"
        onClick={handlePayment}
        disabled={busy || submittedRef.current}
        aria-busy={busy}
        data-testid="submit-order-button"
      >
        <BehpardakhtIcon />
        {busy ? "در حال اتصال به بانک..." : "پرداخت"}
      </Button>
    </div>
  );
}
