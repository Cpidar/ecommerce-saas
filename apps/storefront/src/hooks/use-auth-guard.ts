"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth"
import { DEFAULT_REGION } from "@/lib/medusa"

/**
 * Client-side gate for account pages. Triggers a hydrate on mount and
 * redirects to the login page if no customer is authenticated.
 */
export function useAuthGuard() {
  const customer = useAuthStore((s) => s.customer)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  const hydrate = useAuthStore((s) => s.hydrate)
  const router = useRouter()
  const countryCode = DEFAULT_REGION
    const pathname = usePathname()

// console.log(hasHydrated)
  // useEffect(() => {
  //   if (!hasHydrated) void hydrate()
  // }, [hasHydrated, hydrate])

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace(`/auth/authenticate?ref=${pathname}`)
    }
  }, [hasHydrated, isAuthenticated, router, countryCode])

  return {
    customer,
    isAuthenticated,
    isLoading: !hasHydrated,
    isReady: hasHydrated && isAuthenticated,
  }
}
