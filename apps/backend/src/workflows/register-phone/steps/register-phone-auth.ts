import {
  AuthenticationInput,
  IAuthModuleService,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { RegisterWithPhoneWorkflowInput } from "..";

export const registerPhoneAuthStep = createStep(
  "register-phone-auth",
  async (input: RegisterWithPhoneWorkflowInput, { container }) => {
    const authService = container.resolve<IAuthModuleService>(Modules.AUTH);
    const { authData } = input;
    const { email, first_name, last_name, phone } = authData.body as Record<
      string,
      string
    >;
    // const { authIdentity } = await authService.register("phone-auth", authData);
    // console.log("🦒🦒🦒🦒authIdentity🦒🦒🦒🦒", authIdentity);

    // const { authIdentity: emailpassAuth } = await authService.register(
    //   "emailpass",
    //   authData,
    // );
    //
    const authIdentity = await authService.createAuthIdentities({
      // id: authIdentity?.id,
      provider_identities: [
        // ...authIdentity?.provider_identities ?? [],
        {
          provider: "phone-auth",
          entity_id: email

        },
        {
          provider: "emailpass",
          entity_id: email
        }
      ]
    })

    console.log("🦒🦒🦒🦒authIdentity emailpass🦒🦒🦒🦒", authIdentity);

    const [res] = await authService.listAuthIdentities({ provider_identities: { entity_id: email, provider: "emailpass" } })
    console.log("🦒🦒🦒🦒authIdentity emailpass res🦒🦒🦒🦒", res);
    return new StepResponse(
      { success: true, authIdentity },
      // Compensation Input
      { authIdentityId: authIdentity!.id },
    );
  },

  // COMPENSATION
  async (compensationData, { container }) => {
    if (!compensationData?.authIdentityId) {
      return;
    }

    const authModule = container.resolve<IAuthModuleService>(Modules.AUTH);

    try {
      await authModule.deleteAuthIdentities([compensationData.authIdentityId]);
    } catch (error) {
      // Already deleted = acceptable.
      console.warn(
        `Phone auth identity ${compensationData.authIdentityId} cleanup failed`,
        error,
      );
    }
  },
);
