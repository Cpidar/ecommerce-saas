import Medusa from "@medusajs/js-sdk"

const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

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
  // auth: {
  //   type: "jwt",
  //   jwtTokenStorageMethod: isBrowser ? "local" : "memory",
  // },
  // [MY-FORK-CONFIG] add store id headers for multi-tenancy
  globalHeaders: {
    "x-store-id": process.env.NEXT_PUBLIC_DEFAULT_STORE_ID!,
  },
})

export const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION ?? "ir"

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
