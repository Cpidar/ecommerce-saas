import { createStep, createWorkflow, StepResponse } from "@medusajs/framework/workflows-sdk";
import { STORE_CONFIG_MODULE } from "../../../modules/store-config";
import StoreConfigService from "../../../modules/store-config/service";
import { UpdateStoreConfigWorkflowInput } from "../types";

export const updateStoreConfigStep = createStep(
  'update-store-config',
  async (input: UpdateStoreConfigWorkflowInput, { container }) => {
    const storeConfigService: StoreConfigService = container.resolve(STORE_CONFIG_MODULE)

    await storeConfigService.replaceFields(input)

    

    return new StepResponse(input, input.id)
  }
)