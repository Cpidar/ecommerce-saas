"use client";

import { useCallback, useState } from "react";

import type { BillingInterval } from "@/types/subscription";

export function useBillingInterval() {
  const [interval, setInterval] = useState<BillingInterval>("yearly");

  const toggleInterval = useCallback(() => {
    setInterval((current) => (current === "yearly" ? "monthly" : "yearly"));
  }, []);

  return { interval, toggleInterval };
}
