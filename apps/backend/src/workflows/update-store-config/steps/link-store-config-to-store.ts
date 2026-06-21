import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { Link } from "@medusajs/framework/modules-sdk";
import { STORE_CONFIG_MODULE } from "../../../modules/store-config";

type LinkStoreConfigToStoreStepInput = {
  storeConfigId: string;
  storeId: string;
};

export const linkStoreConfigToStoreStep = createStep(
  "link-store-config-to-store",
  async (
    { storeConfigId, storeId }: LinkStoreConfigToStoreStepInput,
    { container }
  ) => {
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    const linkArray = link.create({
      [STORE_CONFIG_MODULE]: {
        store_config_id: storeConfigId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });

    return new StepResponse(linkArray, {
      storeConfigId,
      storeId
    });
  },
  async (invokeResultCompensateInput, { container }) => {
    if (!invokeResultCompensateInput) return null

    const { storeConfigId, storeId } = invokeResultCompensateInput
    const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

    link.dismiss({
      [STORE_CONFIG_MODULE]: {
        store_config_id: storeConfigId,
      },
      [Modules.STORE]: {
        store_id: storeId,
      },
    });
  }
);
