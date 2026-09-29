// apps/backend/src/api/admin/accounting/sync/[transaction_id]/confirm/route.ts

import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import {
  Modules,
  TransactionHandlerType,
} from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"
import { waitConfirmationAccountingSyncStepId } from "../../../../../../workflows/sync-accounting-products/steps/wait-for-confirmation"
import { syncAccountingProductsWorkflowId } from "../../../../../../workflows/sync-accounting-products"

export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const workflowEngineService = req.scope.resolve(
    Modules.WORKFLOW_ENGINE
  )

  await workflowEngineService.setStepSuccess({
    idempotencyKey: {
      action: TransactionHandlerType.INVOKE,
      transactionId: req.params.transaction_id,
      stepId: waitConfirmationAccountingSyncStepId,
      workflowId: syncAccountingProductsWorkflowId,
    },
    stepResponse: new StepResponse(true),
  })

  res.status(202).json({})
}
