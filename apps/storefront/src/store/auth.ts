"use client"

import { create } from "zustand"
import type { HttpTypes } from "@medusajs/types"
import {
  AuthError,
  getCurrentCustomer,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  tryGetCurrentCustomer,
} from "@/lib/auth-client"
import {
  updateProfile as updateProfileApi,
} from "@/lib/customer-client"
import { sdk } from "@/lib/medusa"
import { AuthRedirectResponse } from "@medusajs/js-sdk"
import { verifyOtp } from "../lib/auth-client"

type Customer = HttpTypes.StoreCustomer

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean
  hasHydrated: boolean
  isLoading: boolean
  // [MY-FORK-AUTH] Phone auth state
  phone: string
  email: string

  hydrate: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateProfile: (data: {
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  // [MY-FORK-AUTH] Phone auth state
  authenticate: ({ phone, email }: { phone: string; email: string }) => Promise<AuthRedirectResponse>
  loginWithOTP: (phone: string, otp: string, email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  customer: null,
  isAuthenticated: false,
  hasHydrated: false,
  isLoading: false,
  // [MY-FORK-AUTH] Phone auth state
  phone: '',
  email: '',


  hydrate: async () => {
    if (get().hasHydrated) return
    set({ isLoading: true })
    try {
      const customer = await tryGetCurrentCustomer()
      set({
        customer,
        isAuthenticated: !!customer,
        hasHydrated: true,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  // [MY-FORK-AUTH] Phone auth method
  authenticate: async ({ phone, email }) => {
    set({ isLoading: true })
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
      set({ phone, email })


      return response
    } catch (err) {
      if (err instanceof AuthError) throw err
      const message = (err as { message?: string })?.message ?? "Failed to login"
      throw new AuthError(message)
    } finally {
      set({ isLoading: false })
    }
  },

  // [MY-FORK-AUTH] Phone auth method
  loginWithOTP: async (phone, otp, email) => {
    console.log(email)
    set({ isLoading: true })
    try {
      const customer = await verifyOtp({ phone, otp, email })
      set({
        customer,
        isAuthenticated: true,
        hasHydrated: true,
      })
    } catch (err) {
      if (err instanceof AuthError) throw err
      throw new AuthError("Could not sign in")
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const customer = await authLogin({ email, password })
      set({
        customer,
        isAuthenticated: true,
        hasHydrated: true,
      })
    } catch (err) {
      if (err instanceof AuthError) throw err
      throw new AuthError("Could not sign in")
    } finally {
      set({ isLoading: false })
    }
  },

  register: async (data) => {
    console.log(data)
    set({ isLoading: true })
    try {
      await authRegister(data)
      // After registration, fetch the customer so we have the canonical record.
      const customer = await getCurrentCustomer()
      set({
        customer,
        isAuthenticated: true,
        hasHydrated: true,
      })
    } finally {
      set({ isLoading: false })
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await authLogout()
    } finally {
      set({
        customer: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  refresh: async () => {
    const customer = await tryGetCurrentCustomer()
    set({
      customer,
      isAuthenticated: !!customer,
      hasHydrated: true,
    })
  },

  updateProfile: async (data) => {
    set({ isLoading: true })
    try {
      const customer = await updateProfileApi(data)
      set({ customer })
    } finally {
      set({ isLoading: false })
    }
  },
}))
