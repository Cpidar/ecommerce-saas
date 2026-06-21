"use client"

import type { HttpTypes } from "@medusajs/types"
import { sdk } from "./medusa"
import { AuthRedirectResponse } from "@medusajs/js-sdk"
import { getCart } from "./cart-client"

type Customer = HttpTypes.StoreCustomer

export class AuthError extends Error { }

/**
 * Register a new customer with email/password. Returns the created customer
 * record. Throws AuthError if the email is already taken or password rejected.
 */
export async function register(args: {
  email: string
  password: string
  first_name?: string
  last_name?: string
  phone?: string
}): Promise<Customer> {
  let registrationToken: string
  try {
    registrationToken = (await sdk.auth.register("customer", "emailpass", {
      email: args.email,
      password: args.password,
    })) as string
  } catch (err) {
    const message = (err as { message?: string })?.message ?? "Registration failed"
    throw new AuthError(message)
  }

  try {
    const { customer } = await sdk.store.customer.create(
      {
        email: args.email,
        first_name: args.first_name,
        last_name: args.last_name,
        phone: args.phone,
      },
      undefined,
      { Authorization: `Bearer ${registrationToken}` }
    )
    // After creating the customer, the registration_token is no longer needed.
    // Log the user in with the same credentials so subsequent calls are authed.
    await sdk.auth.login("customer", "emailpass", {
      email: args.email,
      password: args.password,
    })
    return customer
  } catch (err) {
    const message = (err as { message?: string })?.message ?? "Could not create customer record"
    throw new AuthError(message)
  }
}

/**
 * Log in with email/password. Token is stored automatically by the SDK
 * (jwtTokenStorageMethod: "local").
 */
export async function login(args: {
  email: string
  password: string
}): Promise<Customer> {
  try {
    const result = (await sdk.auth.login("customer", "emailpass", args)) as
      | string
      | { location: string }
    if (typeof result !== "string" && "location" in result) {
      // Third-party auth flow — not supported in this v1.
      throw new AuthError("Third-party login is not configured.")
    }

    await transferCart()

    return await getCurrentCustomer()
  } catch (err) {
    if (err instanceof AuthError) throw err
    const message = (err as { message?: string })?.message ?? "Invalid email or password"
    throw new AuthError(message)
  }
}

export async function logout(): Promise<void> {
  try {
    await sdk.auth.logout()
  } catch {
    // Even if the API call fails, the local token is cleared by the SDK.
  }
}

/**
 * Fetch the currently logged-in customer. Throws AuthError if not logged in
 * (or if the stored token is expired/invalid).
 */
export async function getCurrentCustomer(): Promise<Customer> {
  try {
    const { customer } = await sdk.store.customer.retrieve()
    if (!customer) throw new AuthError("Not authenticated")
    return customer
  } catch (err) {
    if (err instanceof AuthError) throw err
    throw new AuthError("Not authenticated")
  }
}

/**
 * Same as getCurrentCustomer but returns null on auth failure instead of
 * throwing. Useful for "am I logged in?" checks in client components.
 */
export async function tryGetCurrentCustomer(): Promise<Customer | null> {
  try {
    return await getCurrentCustomer()
  } catch {
    return null
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  try {
    await sdk.auth.resetPassword("customer", "emailpass", { identifier: email })
  } catch (err) {
    // Most reset-password endpoints intentionally return 200 even on unknown
    // emails to avoid user enumeration. Treat all responses as success.
    void err
  }
}

/**
 * Complete the password reset by submitting the new password along with the
 * reset token from the email link. Throws AuthError on invalid/expired tokens.
 */
export async function completePasswordReset(args: {
  email: string
  password: string
  token: string
}): Promise<void> {
  try {
    await sdk.auth.updateProvider(
      "customer",
      "emailpass",
      { email: args.email, password: args.password },
      args.token
    )
  } catch (err) {
    const message =
      (err as { message?: string })?.message ?? "Couldn't reset password"
    throw new AuthError(message)
  }
}
// [MY-FORK-AUTH] Transfer Cart
export async function transferCart() {
  const cart = await getCart()

  if (!cart?.id) {
    return
  }

  // const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cart.id, {})

}

// [MY-FORK-AUTH] Phone auth methods
export const authenticateWithPhone = async ({ phone, email }: { phone: string; email: string }): Promise<{ location: string }> => {
  try {
    const response = await sdk.auth.login("customer", "phone-auth", {
      phone,
      email
    }) as AuthRedirectResponse


    if (
      typeof response === "string" ||
      !response.location
    ) {
      throw new Error("Failed to login")
    }

    return response
  } catch (err) {
    if (err instanceof AuthError) throw err
    const message = (err as { message?: string })?.message ?? "Failed to login"
    throw new AuthError(message)
  }
}

export const verifyOtp = async ({
  otp,
  phone,
  email,
  registerData
}: {
  otp: string
  phone: string
  email: string
  registerData?: Record<string, string>
}) => {
  try {
    await sdk.auth.callback("customer", "phone-auth", {
      phone,
      otp,
      email
    })

    await transferCart()

    return await getCurrentCustomer()
  } catch (err) {
    if (err instanceof AuthError) throw err
    const message = (err as { message?: string })?.message ?? "Invalid OTP"
    throw new AuthError(message)
  }
}

// TODO: bug must be fixed: register must be after verify OTP
// for using multi provider (emailpass and phone-auth): first register with emailpass and the create customer and link with it (by regToken).
// then register with phone-auth to generate OTP and link it with the same customer (by passing customer_id in body) and then authenticate with phone to login
export const registerWithPhone = async (args: {
  firstName?: string
  lastName?: string
  phone: string
  email: string
  password: string
}) => {
  try {
    const { firstName, lastName, phone, email, password } = args

    const { token: regToken } = await sdk.client.fetch<
      { token: string }
    >(`/auth/customer/emailpass/register`, {
      method: "POST",
      body: {
        email,
        password
      },
    })

    const customerData = {
      email,
      first_name: firstName,
      last_name: lastName,
      phone,
    }

    const { customer: { id: customer_id } } = await sdk.store.customer.create(
      customerData,
      {},
      { authorization: `Bearer ${regToken}` }
    )


    const { token } = await sdk.client.fetch<
      { token: string }
    >(`/auth/customer/phone-auth/register`, {
      method: "POST",
      body: { phone, email, customer_id },
    })



    // await setAuthToken(refreshToken as string)

    return await authenticateWithPhone({ email, phone })
    // return true
  } catch (err) {
    const message = (err as { message?: string })?.message ?? "Could not create customer record"
    throw new AuthError(message)
  }
}


