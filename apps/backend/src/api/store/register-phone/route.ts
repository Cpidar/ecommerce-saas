// src/api/store/register-phone/route.ts
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { registerWithPhoneWorkflow } from "../../../workflows/register-phone"
import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"
import { AuthenticationInput } from "@medusajs/framework/types"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    const { email, password, first_name, last_name, phone } = req.body as Record<string, string>

    const authData = {
        url: req.url,
        headers: req.headers,
        query: req.query,
        body: req.body,
        protocol: req.protocol,
    } as AuthenticationInput


    // 1. Run the workflow. It will execute Steps 1-3, then pause at Step 4.
    const { transaction, result } = await registerWithPhoneWorkflow(req.scope).run({
        input: { authData },
    })

    console.log(result)

    // 2. Inject the transactionId into the auth identity's metadata
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
    const authModule = req.scope.resolve(Modules.AUTH)

    const { data: identities } = await query.graph({
        entity: "auth_identity",
        fields: ["id"],
        filters: { provider_identities: { entity_id: email, provider: "phone-auth" } },
    })

    if (identities.length > 0) {
        await authModule.updateAuthIdentities({
            id: identities[0].id,
            app_metadata: { transactionId: transaction.transactionId }
        })
    }

    res.json({
        success: true,
        transactionId: transaction.transactionId,
        message: "OTP sent to your phone",
    })
}