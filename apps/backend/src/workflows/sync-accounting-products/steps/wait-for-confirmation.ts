// apps/backend/src/workflows/accounting/steps/wait-confirmation-accounting-sync.ts

import { createStep } from "@medusajs/framework/workflows-sdk"

export const waitConfirmationAccountingSyncStepId =
  "wait-confirmation-accounting-sync"

export const waitConfirmationAccountingSyncStep = createStep(
  {
    name: waitConfirmationAccountingSyncStepId,
    async: true,
    timeout: 60 * 60,
  },
  async () => {}
)
