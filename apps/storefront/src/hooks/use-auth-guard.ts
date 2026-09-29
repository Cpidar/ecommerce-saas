"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"

/**
 * Client-side gate for account pages. Triggers a hydrate on mount and
 * redirects to the login page if no customer is authenticated.
 */
export function useAuthGuard(redirectTo = '/customer-auth/authenticate' ) {
  const customer = useAuthStore((s) => s.customer)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      const current = window.location.pathname + window.location.search
      router.replace(`${redirectTo}?ref=${encodeURIComponent(current)}`)
    }
  }, [redirectTo, hasHydrated, isAuthenticated, router])

  return {
    customer,
    isAuthenticated,
    isLoading: !hasHydrated,
    isReady: hasHydrated && isAuthenticated,
  }
}
