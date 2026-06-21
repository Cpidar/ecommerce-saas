import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Link } from "@medusajs/framework/modules-sdk";

type LinkProductCategoryToStoreStepInput = {
  categoryId: string;
  storeId: string;
};

export const linkProductCategoryToStoreStep = createStep(
  "link-product-category-to-store",
  async (
    { categoryId, storeId }: LinkProductCategoryToStoreStepInput,
    { container }
  ) => {
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    const linkArray = link.create({
      [Modules.PRODUCT]: {
        product_category_id: categoryId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });

    return new StepResponse(linkArray, {
      categoryId,
      storeId
    });
  },
  async (invokeResultCompensateInput, { container }) => {
    if(!invokeResultCompensateInput) return null

    const { categoryId, storeId } = invokeResultCompensateInput
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    link.dismiss({
      [Modules.PRODUCT]: {
        product_category_id: categoryId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });
  }
);
