// src/workflows/steps/seed-store-config.ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createSeedProgress } from "../../../utils/initialize-store-progress";
import { IRegionModuleService, Logger, Query } from "@medusajs/framework/types";
import StoreConfigLink from "../../../links/multi-tenant/store_config-store";
import { updateStoreConfigWorkflow } from "../../update-store-config";
import { createConfigWorkflow } from "../../create-store-config";
import { JsonRecord } from "../types";
import { CreateStoreConfigWorkflowInput } from "../../create-store-config/types";
import { STORE_CONFIG_MODULE } from "../../../modules/store-config";
import StoreConfigModuleService from "../../../modules/store-config/service";
import StoreConfigService from "../../../modules/store-config/service";
import { Link } from "@medusajs/framework/modules-sdk";
type Input = CreateStoreConfigWorkflowInput & {
  progressKey: string;
};

export const seedStorConfig = createStep(
  "seed-stor-config",
  async (input: Input, { container }) => {
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);
    logger.info("Starting store config seeding");

    const seedProgress = createSeedProgress(container, input.progressKey);

    await seedProgress.update(10, "ایجاد تنظیمات اولیه");

    const query = container.resolve<Query>(ContainerRegistrationKeys.QUERY);
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

      const storeConfigService: StoreConfigService = container.resolve(STORE_CONFIG_MODULE)

      await storeConfigService.replaceFields({ id: storeConfigId, ...input })

      logger.info(`Finished store config seeding: ${storeConfigId}`);
      return new StepResponse({ storeConfigId }, { storeConfigId: "", progressKey: input.progressKey });
    } catch {
      // const { storeConfig } = await createConfigWorkflow.runAsStep({
      //   input: {
      //     medusa_store_id: input.medusa_store_id,
      //     title: input.title,
      //     handle: input.handle,
      //     subscription_product_id: input.subscription_product_id,
      //     subscription_status: input.subscription_status,
      //     // TODO
      //     puck_data: input.puck_data as JsonRecord,
      //   },
      // });
      const storeConfigService: StoreConfigService = container.resolve(
        STORE_CONFIG_MODULE,
      );

      const storeConfig = await storeConfigService.createStoreConfigs({
        ...input,
      });

      const link: Link = container.resolve(ContainerRegistrationKeys.LINK);

      const linkArray = link.create({
        [STORE_CONFIG_MODULE]: {
          store_config_id: storeConfig.id,
        },
        [Modules.STORE]: {
          store_id: storeConfig.medusa_store_id,
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
