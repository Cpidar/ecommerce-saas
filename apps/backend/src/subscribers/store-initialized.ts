import {
  SubscriberArgs,
  type SubscriberConfig,
} from "@medusajs/medusa"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { IStoreModuleService, Logger } from "@medusajs/framework/types"

export default async function sendOtpHandler({
  event: { data: { currentStoreId } },
  container,
}: SubscriberArgs<{ currentStoreId: string }>) {
  const storeService: IStoreModuleService = container.resolve(Modules.STORE);
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)

  const store = await storeService.updateStores(currentStoreId, { metadata: { onboarding: "completed" } })

  logger.info("STORE CO<PLETED~~~~")
}

export const config: SubscriberConfig = {
  event: "store.initialized",
}
