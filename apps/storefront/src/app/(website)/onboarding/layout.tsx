export const instant = false;

import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await tryGetCurrentCustomer();

  if (!customer) {
    redirect(`/customer-auth/authenticate?ref=/onboarding/trial`);
  }

  console.log(customer)

  if (customer.metadata && customer.metadata.onboarding === "completed") {
    // TODO: must go to dashboatd
    redirect("http://localhost:9000/app");
    redirect("/app/login");
  }

  return children;
}
