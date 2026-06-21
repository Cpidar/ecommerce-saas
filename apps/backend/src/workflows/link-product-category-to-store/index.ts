import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { linkProductCategoryToStoreStep } from "./steps/link-product-category-to-store";

export type LinkProductCategoryToStoreInput = {
  categoryId: string;
  storeId: string;
};

export const linkProductCategoryToStoreWorkflow = createWorkflow(
  "link-product-category-to-store",
  (input: LinkProductCategoryToStoreInput) => {
    const categoryStoreLinkArray = linkProductCategoryToStoreStep({
      categoryId: input.categoryId,
      storeId: input.storeId,
    });

    return new WorkflowResponse({
      categoryStoreLinkArray,
      store: { id: input.storeId },
    });
  }
);
