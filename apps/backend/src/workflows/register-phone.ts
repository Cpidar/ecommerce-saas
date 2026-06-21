// other imports...
import {
    // ...
    createWorkflow,
    WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { setAuthAppMetadataStep } from "@medusajs/medusa/core-flows"

// ...

type CreateBrandWorkflowInput = {
    authIdentityId: string
    actorType: string
    value: string
}

export const createAuthMetaDataWorkflow = createWorkflow(
    "auth-app-metadata",
    ({ authIdentityId, actorType, value }: CreateBrandWorkflowInput) => {
        const brand = setAuthAppMetadataStep({
            authIdentityId,
            actorType,
            value
        })

        return new WorkflowResponse(brand)
    }
)