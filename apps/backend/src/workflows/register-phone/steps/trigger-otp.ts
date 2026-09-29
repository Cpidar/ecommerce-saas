import {
  AuthenticationInput,
  IAuthModuleService,
} from "@medusajs/framework/types";
import { Modules, MedusaError } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows";
import { RegisterWithPhoneWorkflowInput } from "..";

export const triggerOtpStep = createStep(
  "trigger-otp",
  async (input: RegisterWithPhoneWorkflowInput, { container }) => {
    const authService = container.resolve<IAuthModuleService>(Modules.AUTH);
    const { authData } = input;
    const res = await authService.authenticate("phone-auth", authData);

    if (!res.success) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        res.error || "Failed to trigger OTP",
      );
    }

    return new StepResponse({ success: true, authIdentity: res.authIdentity! });
  },
);
