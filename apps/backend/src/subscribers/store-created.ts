import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { Modules } from "@medusajs/framework/utils"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { StoreDTO } from "@medusajs/framework/types"
import { asValue } from "@medusajs/framework/awilix"

export default async function sendOtpHandler({
  event: { data: { currentStore } },
  container,
}: SubscriberArgs<{ currentStore: StoreDTO }>) {



}

export const config: SubscriberConfig = {
  event: "store.created",
}
