// app/actions/collections.ts
"use server"

import { medusaCollectionRepository } from "@/lib/repositories/medusa-collection-repository"


export async function getCollections() {
  return medusaCollectionRepository.list()
}

export async function getCollectionByHandle(handle: string) {
  return medusaCollectionRepository.getByHandle(handle)
}