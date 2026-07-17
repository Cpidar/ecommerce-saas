import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return children;
}
