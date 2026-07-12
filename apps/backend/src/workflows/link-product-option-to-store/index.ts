import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { linkProductOptionToStoreStep } from "./steps/link-product-option-to-store";

export type LinkProductOptionToStoreInput = {
  optionId: string;
  storeId: string;
};

export const linkProductOptionToStoreWorkflow = createWorkflow(
  "link-product-option-to-store",
  (input: LinkProductOptionToStoreInput) => {
    const optionStoreLinkArray = linkProductOptionToStoreStep({
      optionId: input.optionId,
      storeId: input.storeId,
    });

    return new WorkflowResponse({
      optionStoreLinkArray,
      store: { id: input.storeId },
    });
  }
);
