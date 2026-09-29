// src/workflows/create-store-credit-with-metadata.ts
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createStoreCreditAccountsStep } from "@medusajs/loyalty-plugin/workflows";

export const createStoreCreditWithMetadataWorkflow = createWorkflow(
  "create-store-credit-with-metadata",
  function (input: { customer_id: string; currency_code: string; metadata: Record<string, unknown> }) {
    const accounts = createStoreCreditAccountsStep([{
      customer_id: input.customer_id,
      currency_code: input.currency_code,
      metadata: input.metadata, // ✅ metadata is accepted here
    }])

    return new WorkflowResponse(accounts)
  }
)
