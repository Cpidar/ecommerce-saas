/**
 * Browser-safe cookie helpers.
 *
 * `cookies.ts` relies on `next/headers` which is **server-component only**.
 * The SaaS register flow imports the store-creation helper from a client
 * component (`customer-auth/register/client.tsx`), so we read/write the
 * relevant cookies via `document.cookie` here to remain client-compatible.
 */

/** Read a cookie value by name from `document.cookie`. */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Read `_medusa_subscription_id` cookie — needed for store creation. */
export function getSubscriptionId(): string | null {
  return getCookie("_medusa_subscription_id");
}

/** Read `_medusa_jwt` (Bearer token). */
export function getAuthToken(): string | null {
  return getCookie("_medusa_jwt");
}

/** Read `_medusa_cache_id` used for multi-tenant cache tagging. */
export function getCacheId(): string | null {
  return getCookie("_medusa_cache_id");
}

/** Read `current_store_id`, fallback to env var. */
export function getCurrentStoreId(): string {
  return getCookie("current_store_id") ?? process.env.NEXT_PUBLIC_DEFAULT_STORE_ID ?? "";
}

/** Browser-only auth headers for fetch calls. */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { authorization: `Bearer ${token}` } : {};
}
