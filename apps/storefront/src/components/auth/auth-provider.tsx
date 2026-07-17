"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { HttpTypes } from "@medusajs/types";

type Customer = HttpTypes.StoreCustomer

export function AuthProvider({
  customer,
  children,
}: {
  customer: Customer | null;
  children: React.ReactNode;
}) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize(customer);
  }, [customer, initialize]);

  return children;
}