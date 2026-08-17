// app/actions/collections.ts
"use server"

import { ADMIN_COOKIE } from "@/lib/medusa/admin-auth"
import { medusaCollectionRepository } from "@/lib/repositories/medusa-collection-repository"
import { cookies } from "next/headers"

export async function getCollections() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) throw new Error("Unauthorized")

  return medusaCollectionRepository.list()
}

export async function getCollectionByHandle(handle: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value

  if (!token) throw new Error("Unauthorized")

  return medusaCollectionRepository.getByHandle(handle)
}