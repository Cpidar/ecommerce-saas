import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"
import { notFound, redirect } from "next/navigation"
import { getLocaleHeader } from "./utils/get-locale-header"

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

let storeIdCache: string | null = null
const isBrowser = typeof window !== "undefined"

export async function getCurrentStoreId() {
  if (storeIdCache) return {
    "x-store-id": storeIdCache,
  } as const

  // Server side
  if (!isBrowser) {
    try {
      const { headers } = await import('next/headers')
      const headersList = await headers()
      storeIdCache = headersList.get('x-store-id')
      console.log('sdk hit from server', storeIdCache)
      return {
        "x-store-id": storeIdCache,
      } as const
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
  return {
    "x-store-id": storeIdCache,
  } as const
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
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
    
    storeHeader = await getCurrentStoreId()
    headers["x-store-id"] ??= localeHeader["x-store-id"]
  } catch { }

  const newHeaders = {
    ...localeHeader,
    ...storeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}


export function medusaError(error: any): never {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message = error.response.data.message || error.response.data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + error.request)
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error("Error setting up the request: " + error.message)
  }
}
