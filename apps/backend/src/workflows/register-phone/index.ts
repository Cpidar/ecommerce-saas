import { AuthenticationInput } from "@medusajs/framework/types";
import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows";
import { createAccountStep } from "./steps/create-account";
import { registerPhoneAuthStep } from "./steps/register-phone-auth";
import { triggerOtpStep } from "./steps/trigger-otp";
import { waitForOtpVerificationStep } from "./steps/wait-for-otp-verification";

export type RegisterWithPhoneWorkflowInput = {
  authData: AuthenticationInput;
  storeId: string;
};

export const registerWithPhoneWorkflow = createWorkflow(
  "register-with-phone",
  (input: RegisterWithPhoneWorkflowInput) => {
    // Step 1: Register phone-auth identity only (no customer yet)
    const phoneAuthIdentity = registerPhoneAuthStep(input)

    // Step 2: Trigger OTP immediately
    triggerOtpStep(input)

    // Step 3: Suspend — resumes when OTP is verified via validateCallback
    waitForOtpVerificationStep()

    // Step 4: After OTP verified, create emailpass identity + customer
    const accountData = createAccountStep(input)

    // Step 5: Link phone-auth identity to the new customer
    setAuthAppMetadataStep({
        authIdentityId: phoneAuthIdentity.authIdentity!.id,
        actorType: "customer",
        value: accountData.customer_id
    })

    return new WorkflowResponse({
        message: "Registration completed",
        email: accountData.email
    })
  },
);
