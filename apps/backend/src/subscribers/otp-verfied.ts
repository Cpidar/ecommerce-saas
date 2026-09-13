// src/subscribers/otp-verified.ts
import { SubscriberConfig, MedusaContainer } from "@medusajs/framework"
import { Modules, TransactionHandlerType } from "@medusajs/framework/utils"
import { StepResponse } from "@medusajs/framework/workflows-sdk"

const otpVerifiedHandler = async ({ data, container }: { data: any; container: MedusaContainer }) => {
    const { transactionId } = data
    if (!transactionId) return

    const workflowEngineService = container.resolve(Modules.WORKFLOW_ENGINE)

    try {
        await workflowEngineService.setStepSuccess({
            idempotencyKey: {
                action: TransactionHandlerType.INVOKE,
                transactionId,
                stepId: "wait-for-otp-verification-step",
                workflowId: "register-with-phone-workflow",
            },
            stepResponse: new StepResponse({ verified: true }),
        })
    } catch (error) {
        console.error("Failed to resume workflow:", error)
    }
}

export const config: SubscriberConfig = {
    event: "phone-auth.otp.verified",
}

export default otpVerifiedHandler