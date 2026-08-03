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