import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { linkStoreConfigToStoreStep } from "../create-store-config/steps/link-store-config-to-store";

export type LinkStoreConfigToStoreInput = {
  storeConfigId: string;
  storeId: string;
};

export const linkStoreConfigToStoreWorkflow = createWorkflow(
  "link-store-config-to-store",
  (input: LinkStoreConfigToStoreInput) => {
    const storeConfigStoreLinkArray = linkStoreConfigToStoreStep({
      storeConfigId: input.storeConfigId,
      storeId: input.storeId,
    });

    return new WorkflowResponse({
      storeConfigStoreLinkArray,
      store: { id: input.storeId },
    });
  }
);
