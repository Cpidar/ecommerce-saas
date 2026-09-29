"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

/**
 * Client-side gate for admin pages. Verifies the session on mount and
 * redirects to the login page if no admin is authenticated.
 */
export function useAdminAuthGuard(redirectTo = "/app/login") {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const me = useAuthStore((s) => s.adminMe);
  const isAuthenticated = useAuthStore((s) => s.isAdminAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Verify the session with the server once when the protected area mounts
  useEffect(() => {
    me();
  }, [me]);

  // Redirect once the check is done, and again if the user logs out later
  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      // In the App Router it forces a <Suspense> boundary (otherwise next build can fail with "useSearchParams() should be wrapped in a suspense boundary"),
      // and since your guard usually lives in a layout, that's annoying.
      // You only need the URL at the moment of redirect, so read it from window there:
      const current = window.location.pathname + window.location.search;
      router.replace(`${redirectTo}?ref=${encodeURIComponent(current)}`);
    }
  }, [hasHydrated, isAuthenticated, redirectTo, router]);

  return {
    user,
    isAuthenticated,
    isLoading: !hasHydrated,
    isReady: hasHydrated && isAuthenticated,
  };
}
