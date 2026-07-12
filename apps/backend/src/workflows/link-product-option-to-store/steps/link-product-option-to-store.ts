import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Link } from "@medusajs/framework/modules-sdk";

type LinkProductOptionToStoreStepInput = {
  optionId: string;
  storeId: string;
};

export const linkProductOptionToStoreStep = createStep(
  "link-product-option-to-store",
  async (
    { optionId, storeId }: LinkProductOptionToStoreStepInput,
    { container }
  ) => {
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    const linkArray = link.create({
      [Modules.PRODUCT]: {
        product_option_id: optionId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });

    return new StepResponse(linkArray, {
      optionId,
      storeId
    });
  },
  async (invokeResultCompensateInput, { container }) => {
    if(!invokeResultCompensateInput) return null

    const { optionId, storeId } = invokeResultCompensateInput
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    link.dismiss({
      [Modules.PRODUCT]: {
        product_option_id: optionId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });
  }
);
