import type { Metadata } from "next";
import { tryGetCurrentCustomer } from "@/lib/medusa/auth-server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return children;
}
