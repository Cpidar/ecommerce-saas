// app/checkout/page.tsx  (Server Component)
import { redirect } from "next/navigation";
import { SeedProgressTracker } from "./client";
import { listCustomerSubscriptions } from "@/lib/repositories/subscriptions";

export default async function CheckoutPage() {
  const subscription = await listCustomerSubscriptions();
  const activeSubscription = subscription.filter(
    (sub) => sub.status === "active",
  );

  if (!activeSubscription) {
    redirect("/onboarding/trial");
  }

  return <SeedProgressTracker subscriptionId={activeSubscription[0].id} />;
}
