import { redirect } from "next/navigation";
import { CheckoutClient } from "./client";
import { listCustomerSubscriptions } from "@/lib/repositories/subscriptions";

export default async function CheckoutPage() {
  // const subscription = await listCustomerSubscriptions();
  // const activeSubscription = subscription.find(
  //   (sub) => sub.status === "active",
  // );
  // if (activeSubscription) {
  //   redirect("/onboarding/initialize-store");
  // }

  return <CheckoutClient />;
}
