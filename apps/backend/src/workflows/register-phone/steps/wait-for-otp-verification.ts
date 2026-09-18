import { createStep } from "@medusajs/framework/workflows-sdk"

export const waitForOtpVerificationStep = createStep(
    {
        name: "wait-for-otp-verification-step",
        async: true,
        timeout: 60 * 60 * 1
    },
    async () => { },
)