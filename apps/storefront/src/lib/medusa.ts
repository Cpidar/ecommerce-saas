import Medusa from "@medusajs/js-sdk"

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

export const STORE_COOKIE = "current_store_id";

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

// export async function getMedusaHeaders() {
//   const headerList = await headers();
  
//   const storeId = headerList.get('x-store-id');        // your incoming header
//   const publishableKey = headerList.get('x-publishable-key') || 
//                          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY; // fallback

//   return {
//     'x-publishable-api-key': publishableKey || '',
//     'x-store-id': storeId || '',           // if your backend uses this for scoping
//     // Add any other dynamic headers
//   };
// }

// Auth storage: localStorage in the browser (persistent across refreshes),
// in-memory on the server (no localStorage available there). The SDK module
// is loaded separately in each environment, so each evaluates this branch
// once at boot.
const isBrowser = typeof window !== "undefined"

export const sdk = new Medusa({
  baseUrl: backendUrl,
  publishableKey,
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: isBrowser ? "local" : "memory",
  },
  // [MY-FORK-CONFIG] add store id headers for multi-tenancy
  globalHeaders: {
    "x-store-id": "store_01KTK5R0R5MZZ6KSPB43M5SMPF",
  },
})

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "ir"
