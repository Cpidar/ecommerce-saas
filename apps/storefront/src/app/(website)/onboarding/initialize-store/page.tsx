// app/checkout/page.tsx  (Server Component)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SeedProgressTracker } from "./client";

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const subscriptionId = cookieStore.get("_medusa_subscription_id")?.value;

  if (!subscriptionId) {
    redirect("/onboarding/trial");
  }

  return <SeedProgressTracker subscriptionId={subscriptionId} />;
}
