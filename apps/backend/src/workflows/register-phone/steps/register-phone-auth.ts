import { AuthenticationInput, IAuthModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { RegisterWithPhoneWorkflowInput } from ".."

export const registerPhoneAuthStep = createStep(
    "register-phone-auth",
    async (input: RegisterWithPhoneWorkflowInput, { container }) => {
        const authService = container.resolve<IAuthModuleService>(Modules.AUTH)
        const { authData } = input
        const { authIdentity } = await authService.register("phone-auth", authData)
        console.log("🦒🦒🦒🦒authIdentity🦒🦒🦒🦒", authIdentity)
        return new StepResponse(
            { success: true, authIdentity },
            // Compensation Input
            { authIdentityId: authIdentity!.id, }
        )
    },

  // COMPENSATION
  async (
    compensationData,
    { container }
  ) => {
    if (!compensationData?.authIdentityId) {
      return
    }

    const authModule = container.resolve<IAuthModuleService>(
      Modules.AUTH
    )

    try {
      await authModule.deleteAuthIdentities([
        compensationData.authIdentityId,
      ])
    } catch (error) {
      // Already deleted = acceptable.
      console.warn(
        `Phone auth identity ${compensationData.authIdentityId} cleanup failed`,
        error
      )
    }
  }
)
