// src/workflows/onboard-merchant.ts
import { createWorkflow, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"


const INITIAL_GIFT_CREDIT = 100_000 // 100,000 Tomans / Rials equivalent
const CURRENCY = "irr" // Or your configured base currency code (e.g., "irr" / "irt")

export const grantInitialCreditStep = createStep(
  "grant-initial-credit",
  async ({ customerId }: { customerId: string }, { container }) => {
    // Resolve store credit service (or custom wallet module service)
    const storeCreditService = container.resolve<any>("store_credit")

    // Create initial wallet credit
    const credit = await storeCreditService.createStoreCredits({
      customer_id: customerId,
      amount: INITIAL_GIFT_CREDIT,
      currency_code: CURRENCY,
      description: "Welcome Gift / Initial Trial Credit",
    })

    return new StepResponse(credit, credit.id)
  },
  async (creditId, { container }) => {
    // Compensation logic if workflow fails
    if (!creditId) return
    const storeCreditService = container.resolve<any>("store-credit")
    await storeCreditService.deleteStoreCredits(creditId)
  }
)

export const createMerchantStoreStep = createStep(
  "create-merchant-store",
  async ({ customerId, storeName }: { customerId: string; storeName: string }, { container }) => {
    const storeModuleService = container.resolve(Modules.STORE)

    const store = await storeModuleService.createStores({
      name: storeName,
      metadata: {
        saas_customer_id: customerId,
        status: "active", // Active immediately!
        initial_credit_granted: true,
      },
    })

    return new StepResponse(store, store.id)
  }
)
