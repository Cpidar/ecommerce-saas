import { AuthenticationInput, IAuthModuleService, ICustomerModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"

export const createAccountStep = createStep(
    "create-account-step",
    async (input: { authData: AuthenticationInput }, { container }) => {
        const authModule: IAuthModuleService = container.resolve(Modules.AUTH)
        const customerModule = container.resolve(Modules.CUSTOMER)
        const { authData } = input
        const { email, first_name, last_name, phone } = authData.body as Record<string, string>

        const { authIdentity } = await authModule.register("emailpass", authData)

        const { result } = await createCustomerAccountWorkflow(container).run({
            input: {
                authIdentityId: authIdentity!.id,
                customerData: {
                    email,
                    first_name,
                    last_name,
                    phone,
                },
            }
        })

        return new StepResponse({
            customer_id: result.id,
            emailpass_auth_identity_id: authIdentity!.id,
            email,
            phone
        },
            {
                customer_id: result.id,
                emailpass_auth_identity_id: authIdentity!.id,
            },
        )
    },

      // COMPENSATION
  async (
    compensationData,
    { container }
  ) => {
    if (!compensationData) {
      return
    }

    const customerModule = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)
    const authModule = container.resolve<IAuthModuleService>(Modules.AUTH)

    /*
     * Important:
     * These operations are safe to repeat.
     */

    if (compensationData.customer_id) {
      try {
        await customerModule.deleteCustomers([
          compensationData.customer_id,
        ])
      } catch (error) {
        // Customer may already have been deleted by a previous
        // compensation attempt.
        console.warn(
          `Customer ${compensationData.customer_id} cleanup failed`,
          error
        )
      }
    }

    if (compensationData.emailpass_auth_identity_id) {
      try {
        await authModule.deleteAuthIdentities([
          compensationData.emailpass_auth_identity_id,
        ])
      } catch (error) {
        // Auth identity may already have been deleted.
        console.warn(
          `Auth identity ${compensationData.emailpass_auth_identity_id} cleanup failed`,
          error
        )
      }
    }
  }
)