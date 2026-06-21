import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { updateStoreConfigStep } from "./steps/update-config";
import { UpdateStoreConfigWorkflowInput } from "./types";

export const updateStoreConfigWorkflow = createWorkflow(
  'update-store-config',
  (input: UpdateStoreConfigWorkflowInput) => {
    const storeConfig = updateStoreConfigStep(input)

    return new WorkflowResponse(storeConfig)
  }
)
