// other imports...
import { AuthenticationInput, IAuthModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import {
    createStep,
    createWorkflow,
    StepResponse,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createCustomerAccountWorkflow, setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"


// Step 1: Create Customer & Emailpass Identity (Using Official Core Workflow)
const createAccountStep = createStep(
    "create-account-step",
    async (input: { authData: AuthenticationInput }, { container }) => {
        // This safely handles emailpass registration, customer creation, and linking
        const authModule: IAuthModuleService = container.resolve(Modules.AUTH)
        const customerModule = container.resolve(Modules.CUSTOMER)
        const { authData } = input
        const { email, first_name, last_name, phone, password } = authData.body as Record<string, string>


        // 1. Register with emailpass
        const { authIdentity } = await authModule.register("emailpass", authData)

        const { result } = await createCustomerAccountWorkflow(container).run({
            input: {
                authIdentityId: authIdentity!.id,
                customerData: {
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    phone: phone,
                },
            }
        })

        return new StepResponse({
            customer_id: result.id,
            email: email,
            phone: phone
        })
    }
)

// Step 2: Register Phone-Auth Identity (Using Official IAuthModuleService signature)
const registerPhoneAuthStep = createStep(
    "register-phone-auth-step",
    async (input: { authData: AuthenticationInput }, { container }) => {
        const authService = container.resolve<IAuthModuleService>(Modules.AUTH)
        const { authData } = input

        // This invokes your custom PhoneAuthService.register
        const { authIdentity } = await authService.register("phone-auth", authData)

        return new StepResponse({ success: true, authIdentity })
    }
)

// Step 3: Trigger OTP Generation (Using Official IAuthModuleService signature)
const triggerOtpStep = createStep(
    "trigger-otp-step",
    async (input: { authData: AuthenticationInput }, { container }) => {
        const authService = container.resolve<IAuthModuleService>(Modules.AUTH)

        const { authData } = input

        // This invokes your custom PhoneAuthService.authenticate
        const res = await authService.authenticate("phone-auth", authData)

        return new StepResponse({ success: true, authIdentity: res.authIdentity! })
    },
    async (input, { container }) => {
        if (!input) {
            return
        }
        const authModule: IAuthModuleService = container.resolve(Modules.AUTH)

        await authModule.deleteAuthIdentities([input.authIdentity.id])

        setAuthAppMetadataStep({
            authIdentityId: input.authIdentity!.id,
            actorType: "customer",
            value: null
        })

    }
)

// Step 4: Async step to wait for external OTP verification
const waitForOtpVerificationStep = createStep(
    {
        name: "wait-for-otp-verification-step",
        async: true, // 🚀 Tells the engine to pause and wait in the background
        timeout: 60 * 60 * 1
    },
    async () => { },
)

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