import { AuthenticationInput } from "@medusajs/framework/types"
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"
import { createAccountStep } from "./steps/create-account"
import { registerPhoneAuthStep } from "./steps/register-phone-auth"
import { triggerOtpStep } from "./steps/trigger-otp"
import { waitForOtpVerificationStep } from "./steps/wait-for-otp-verification"

export const registerWithPhoneWorkflow = createWorkflow(
    "register-with-phone-workflow",
    (input: { authData: AuthenticationInput }) => {
        const accountData = createAccountStep(input)
        const phoneAuthIdentity = registerPhoneAuthStep(input)

        setAuthAppMetadataStep({
            authIdentityId: phoneAuthIdentity.authIdentity!.id,
            actorType: "customer",
            value: accountData.customer_id
        })

        triggerOtpStep(input)
        waitForOtpVerificationStep()

        return new WorkflowResponse({ message: "Registration completed", email: accountData.email })
    }
)