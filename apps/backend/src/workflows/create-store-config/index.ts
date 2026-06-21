import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { linkStoreConfigToStoreStep } from "./steps/link-store-config-to-store"
import { createConfigStep } from "./steps/create-config";
import { CreateStoreConfigWorkflowInput } from './types'

export const createConfigWorkflow = createWorkflow(
  "create-config",
  (input: CreateStoreConfigWorkflowInput) => {

    const storeConfig = createConfigStep(input);

    const paymentConfigStoreLinkArray = linkStoreConfigToStoreStep({
      storeConfigId: storeConfig.id,
      storeId: input.medusa_store_id
    });

    return new WorkflowResponse({
      storeConfig,
      paymentConfigStoreLinkArray,
      store: { id: input.medusa_store_id },
    });
  }
);
