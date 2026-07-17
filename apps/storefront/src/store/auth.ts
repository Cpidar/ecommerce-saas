"use client"

import { create } from "zustand"
import type { HttpTypes } from "@medusajs/types"
import {
  getCurrentCustomer,
  login as authLogin,
  logout as authLogout,
  registerWithPhone as authRegister,
  tryGetCurrentCustomer,
} from "@/lib/medusa/auth-server"
import {
  updateProfile as updateProfileApi,
} from "@/lib/medusa/customer-client"
import { sdk } from "@/lib/medusa"
import { AuthRedirectResponse } from "@medusajs/js-sdk"
import { verifyOtp } from "../lib/medusa/auth-server"
import { AuthError } from "@/lib/utils/auth-error"

type Customer = HttpTypes.StoreCustomer

interface AuthState {
  customer: Customer | null
  isAuthenticated: boolean
  hasHydrated: boolean
  isLoading: boolean
  // [MY-FORK-AUTH] Phone auth state
  phone: string
  email: string
  refPath?: string | null

  hydrate?: () => Promise<void>
  initialize(customer: Customer | null): void
  reset():void
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    phone: string
  }) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateProfile: (data: {
    first_name?: string
    last_name?: string
    phone?: string
  }) => Promise<void>
  // [MY-FORK-AUTH] Phone auth state
  authenticate: ({ phone, email, refPath }: { phone: string; email: string; refPath?: string | null }) => Promise<AuthRedirectResponse>
  loginWithOTP: (phone: string, otp: string, email: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get, store) => ({
  customer: null,
  isAuthenticated: false,
  hasHydrated: false,
  isLoading: false,
  // [MY-FORK-AUTH] Phone auth state
  phone: '',
  email: '',
  refPath: '',


  // hydrate: async () => {
  //   if (get().hasHydrated) return
  //   set({ isLoading: true })
  //   try {
  //     const customer = await tryGetCurrentCustomer()
  //     set({
  //       customer,
  //       isAuthenticated: !!customer,
  //       hasHydrated: true,
  //     })
  //   } finally {
  //     set({ isLoading: false })
  //   }
  // },

  initialize(customer) {
    set({
      customer,
      isAuthenticated: !!customer,
      hasHydrated: true,
    })
  },

  reset: () => {
    set(store.getInitialState())
  },

  // [MY-FORK-AUTH] Phone auth method
  authenticate: async ({ phone, email, refPath }) => {
    set({ isLoading: true })
    set({ refPath })
    try {
      const response = await sdk.client.fetch("/auth/customer/phone-auth", {
        method: "POST",
        body: {
          phone,
          email
        }
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
    set({ isLoading: true })
    try {
      await authRegister(data)
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
        phone: '',
        email: '',
        refPath:'',
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
