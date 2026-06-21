import { createStep, createWorkflow, StepResponse } from "@medusajs/framework/workflows-sdk";
import { STORE_CONFIG_MODULE } from "../../../modules/store-config";
import StoreConfigService from "../../../modules/store-config/service";
import { CreateStoreConfigWorkflowInput } from '../types'

export const createConfigStep = createStep(
  "create-config",
  async (input: CreateStoreConfigWorkflowInput, { container }) => {
    const {
      payment_configs,
      shipping_method_configs,
      ...storeConfigInput
    } = input

    const storeConfigService: StoreConfigService = container.resolve(
      STORE_CONFIG_MODULE,
    );

    const storeConfig = await storeConfigService.createStoreConfigs({
      ...storeConfigInput,
    });

    return new StepResponse(storeConfig, storeConfig.id);
  },
  async (id, { container }) => {
    if (!id) return null;

    const storeConfigService: StoreConfigService = container.resolve(
      STORE_CONFIG_MODULE,
    );

    await storeConfigService.deleteStoreConfigs(id);
  },
);
