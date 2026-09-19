// src/workflows/steps/seed-store-config.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createSeedProgress } from "../../../utils/initialize-store-progress";
import { IRegionModuleService, Logger } from "@medusajs/framework/types";
import { Query } from "@medusajs/framework";
import StoreConfigLink from "../../../links/multi-tenant/store_config-store";
import { updateStoreConfigWorkflow } from "../../update-store-config";
import { createConfigWorkflow } from "../../create-store-config";
import { JsonRecord } from "../types";
import { CreateStoreConfigWorkflowInput } from "../../create-store-config/types";
import { STORE_CONFIG_MODULE } from "../../../modules/store-config";
import StoreConfigModuleService from "../../../modules/store-config/service";
type Input = CreateStoreConfigWorkflowInput & {
  progressKey: string;
};

export const seedStorConfig = createStep(
  "seed-store-config",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
    logger.info("Starting store config seeding");

    const seedProgress = createSeedProgress(container, input.progressKey);

    await seedProgress.update(10, "ایجاد تنظیمات اولیه");

    const query: Query = container.resolve(ContainerRegistrationKeys.QUERY);
    try {
      const {
        data: [{ store_config_id: storeConfigId }],
      } = await query.graph({
        entity: StoreConfigLink.entryPoint,
        fields: ["store_config_id", "store_id"],
        filters: {
          store_id: ["store_01KTK5R0R5MZZ6KSPB4M5SMPF"],
        },
      });
      logger.warn(
        `Using existing store config ${storeConfigId} during store initialization`,
      );

      updateStoreConfigWorkflow.runAsStep({
        input: {
          id: storeConfigId,
        },
      });
      logger.info(`Finished store config seeding: ${storeConfigId}`);
      return new StepResponse({ storeConfigId }, { storeConfigId: "", progressKey: input.progressKey });
    } catch {
      const { storeConfig } = createConfigWorkflow.runAsStep({
        input: {
          medusa_store_id: input.medusa_store_id,
          title: input.title,
          handle: input.handle,
          subscription_product_id: input.subscription_product_id,
          subscription_status: input.subscription_status,
          // TODO
          puck_data: input.puck_data as JsonRecord,
        },
      });

      logger.info(`Finished store config seeding: ${storeConfig.id}`);
      return new StepResponse(
        { storeConfigId: storeConfig.id },
        { storeConfigId: storeConfig.id, progressKey: input.progressKey },
      );
    }
  },

  async (compensationData, { container }) => {
    if (!compensationData || !compensationData.storeConfigId) {
      return;
    }

    const storeConfig: StoreConfigModuleService =
      container.resolve(STORE_CONFIG_MODULE);

    const seedProgress = createSeedProgress(
      container,
      compensationData.progressKey,
    );

    await seedProgress.fail("خطا در ایجاد تنظیمات اولیه");

    return await storeConfig.deleteStoreConfigs(compensationData.storeConfigId);
  },
);
