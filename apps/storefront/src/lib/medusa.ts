import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"
import { getLocaleHeader } from "./utils/get-locale-header"
import { notFound, redirect } from "next/navigation"

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "ir"

if (!backendUrl) {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL is not set. See .env.example."
  )
}

if (!publishableKey) {
  throw new Error(
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set. See .env.example."
  )
}

// export let storeIdCache: string | null = null
const isBrowser = typeof window !== "undefined"
let storeIdCache: string | null = null
async function resolveCurrentStoreId(): Promise<string> {
  if (storeIdCache) return storeIdCache

  // Server side
  if (!isBrowser) {
    try {
      const { headers } = await import('next/headers')
      const headersList = await headers()
      storeIdCache = headersList.get('x-store-id') || 'trestsd'
      console.log('sdk hit from server', storeIdCache)
      return storeIdCache!
    } catch {
      redirect('/404')
    }
  }

  // Client side - read from cookie
  const match = document.cookie.match(/current_store_id=([^;]+)/)
  storeIdCache = match && match[1]
  console.log('sdk hit from client', document.cookie)
  if (!storeIdCache) {
    notFound()
  }
  return storeIdCache
}


// Auth storage: localStorage in the browser (persistent across refreshes),
// in-memory on the server (no localStorage available there). The SDK module
// is loaded separately in each environment, so each evaluates this branch
// once at boot.

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
  debug: process.env.NODE_ENV === "development",
  // auth: {
  //   type: "jwt",
  //   jwtTokenStorageMethod: isBrowser ? "local" : "memory",
  // },
  // [MY-FORK-CONFIG] add store id headers for multi-tenancy
  // globalHeaders: {
  //   "x-store-id": process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!,
  // },
})

// export async function sdk() {
//   const storeId = await getCurrentStoreId();
//   return new Medusa({
//     baseUrl: backendUrl!,
//     // debug: process.env.NODE_ENV === "development",
//     debug: false,
//     publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
//     globalHeaders: {
//       "x-store-id": storeId || process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!,
//     },
//   })
// }

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  let storeHeader: Record<string, string | null> | undefined

  try {
    // localeHeader = await getLocaleHeader()
    // headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
    const storeId = await resolveCurrentStoreId()

    storeHeader = { 'x-store-id': storeId }
    // headers["x-store-id"] ??= localeHeader["x-store-id"]
  } catch { }

  const newHeaders = {
    // ...localeHeader,
    ...storeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
