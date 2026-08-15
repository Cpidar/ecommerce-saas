"use client";

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { getStoreConfig, saveStoreConfig } from "./api";
import type { StoreConfigInput, StoreConfigResponse } from "./types";

const STORE_CONFIG_QUERY_KEY = ["store-config"] as const;

export const useStoreConfig = <TData = StoreConfigInput | null>(
  options?: Omit<UseQueryOptions<StoreConfigInput | null, Error, TData>, "queryKey" | "queryFn">
) => {
  return useQuery<StoreConfigInput | null, Error, TData>({
    queryKey: STORE_CONFIG_QUERY_KEY,
    queryFn: getStoreConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useSaveStoreConfig = <
  TError = Error,
  TContext = unknown
>(
  options?: Omit<
    UseMutationOptions<StoreConfigInput | null, TError, Partial<StoreConfigInput>, TContext>,
    "mutationFn"
  >
) => {
  const queryClient = useQueryClient();

  return useMutation<StoreConfigInput | null, TError, Partial<StoreConfigInput>, TContext>({
    mutationFn: (payload: Partial<StoreConfigInput>) => saveStoreConfig(payload as StoreConfigInput),
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData(STORE_CONFIG_QUERY_KEY, data);

      // Trigger storefront revalidation on config save
      void triggerStorefrontRevalidation({
        event: "store_config.updated",
        secret: process.env.REVALIDATION_WEBHOOK_SECRET,
      }).catch((err) => {
        console.error("[store-config-hook] Revalidation trigger failed:", err)
      })

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      options?.onSettled?.(data, error, variables, context);
    },
  });
};

export const invalidateStoreConfig = (queryClient: ReturnType<typeof useQueryClient>) => {
  return queryClient.invalidateQueries({ queryKey: STORE_CONFIG_QUERY_KEY });
};

/**
 * Triggers storefront-side revalidation of store config cache tags
 * by POSTing to the storefront webhook endpoint.
 *
 * Set `NEXT_PUBLIC_STOREFRONT_REVALIDATION_URL` to the storefront origin
 * (e.g. https://store.example.com/api/revalidation/site-configs).
 */
export const triggerStorefrontRevalidation = async ({
  event,
  secret,
}: {
  event:
    | "store_config.updated"
    | "payment_provider.updated"
    | "shipping_option.updated"
  secret?: string
}) => {
  const endpoint = process.env.STOREFRONT_REVALIDATION_URL
  if (!endpoint) {
    console.warn("[store-config-hook] STOREFRONT_REVALIDATION_URL is not set; skipping.")
    return { ok: false, reason: "endpoint_not_set" }
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
    },
    body: JSON.stringify({ type: event }),
  })

  if (!res.ok) {
    const details = await res.text().catch(() => "")
    return { ok: false, status: res.status, reason: details }
  }

  return { ok: true }
}
