import { createWorkflow, WorkflowResponse, createHook } from "@medusajs/framework/workflows-sdk";
import { updateStoreConfigStep } from "./steps/update-config";
import { UpdateStoreConfigWorkflowInput } from "./types";
import { Module } from "@medusajs/framework/utils";

export const updateStoreConfigWorkflow = createWorkflow(
  'update-store-config',
  (input: UpdateStoreConfigWorkflowInput) => {
    const storeConfig = updateStoreConfigStep(input)

    const storeConfigUpdated = createHook("storeConfigUpdated", {
      storeConfig
    })

    return new WorkflowResponse(storeConfig, {
      hooks: [storeConfigUpdated]
    })
  }
)
