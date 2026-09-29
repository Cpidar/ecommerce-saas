// src/subscribers/otp-verified.ts
import { SubscriberConfig, MedusaContainer } from "@medusajs/framework"
import { Modules, TransactionHandlerType } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"

const otpVerifiedHandler = async ({ event, container }: { event: any; container: MedusaContainer } ) => {
  console.log("🦒🦒🦒🦒phone-auth.otp.verified🦒🦒🦒🦒", event)
    const { transactionId } = event.data
    if (!transactionId) return

    const workflowEngineService = container.resolve(Modules.WORKFLOW_ENGINE)

    try {
       const result = await workflowEngineService.setStepSuccess({
            idempotencyKey: {
                action: TransactionHandlerType.INVOKE,
                transactionId,
                stepId: "wait-for-otp-verification-step",
                workflowId: "register-with-phone",
            },
            stepResponse: new StepResponse({ verified: true }),
        })
        console.log("result", result)
    } catch (error) {
        console.error("Failed to resume workflow:", error)
    }
}

export const config: SubscriberConfig = {
  event: "phone-auth.otp.verified"
}

export default otpVerifiedHandler
