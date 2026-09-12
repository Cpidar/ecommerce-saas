import { createWorkflow, transform, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createConfigStep } from "../create-store-config/steps/create-config";
import { linkStoreConfigToStoreStep } from "../create-store-config/steps/link-store-config-to-store";
import { InitializeStoreWorkflowInput, JsonRecord } from "./types";
import { acquireLockStep, releaseLockStep } from "@medusajs/medusa/core-flows";

import { seedSalesChannelStep } from "./steps/seed-sales-channel"
import { seedRegionStep } from "./steps/seed-region"
import { seedStockLocationStep } from "./steps/seed-stock-location"
import { seedLinkSalesChannelStep } from "./steps/seed-link-sales-channel"
import { seedCategoriesAndProductsStep } from "./steps/seed-categories-and-products"
import { seedInventoryStep } from "./steps/seed-inventory"
import { seedShippingProfileStep } from "./steps/seed-shipping-profile";

/**
 * Workflow responsible for initializing a brand-new store.
 *
 * It is the single entry point consumed by the `storeCreated` hook
 * (see `apps/backend/src/workflows/hooks/store-created.ts`) and performs two
 * logical groups of work:
 *
 *  1. Seeds a `StoreConfig` row (handle, title, subscription id/status and
 *     the Puck JSON template) then links that config to the store — this
 *     mirrors the existing `createConfigWorkflow` so all stores get a config.
 *
 *  2. Delegates to the `SeedDemoDataStep` which runs
 *     `default_data_seed` to populate sales channels, regions, stock
 *     locations, categories, products and inventory levels.
 */
export const initializeStoreWorkflow = createWorkflow(
  "initialize-store",
  (input: InitializeStoreWorkflowInput) => {
    const puckData = input.template;

    const lockKey = transform({ input }, (data) => `store-seed:${data.input.storeId}`)

    // 1. Acquire lock (waits up to `timeout` seconds, holds for `ttl` seconds)
    acquireLockStep({
      key: lockKey,
      timeout: 10,        // how long to wait to acquire the lock
      ttl: 60 * 30,       // hold the lock for max 30 minutes
    })

    // 2. Create store config and link to store
    const storeConfig = createConfigStep({
      medusa_store_id: input.storeId,
      title: input.title,
      handle: input.handle,
      subscription_product_id: input.subscription_id,
      subscription_status: input.subscription_status,
      // TODO
      puck_data: puckData as any,
    });

    linkStoreConfigToStoreStep({
      storeConfigId: storeConfig.id,
      storeId: input.storeId,
    });

    // 3. Run the actual seed logic
    // SeedDemoDataStep({ storeId: input.storeId });
    const salesChannel = seedSalesChannelStep()
    seedRegionStep()
    const stockLocation = seedStockLocationStep()

    seedLinkSalesChannelStep({
      stockLocationId: stockLocation.stockLocationId,
      salesChannelId: salesChannel.salesChannelId,
    })

    const { shippingProfile } = seedShippingProfileStep()

    seedCategoriesAndProductsStep({
      salesChannelId: salesChannel.salesChannelId,
      shippingProfileId: shippingProfile.id
    })

    seedInventoryStep({
      stockLocationId: stockLocation.stockLocationId,
    })

    // 4. Release lock
    releaseLockStep({
      key: lockKey,
    })

    return new WorkflowResponse({
      storeConfig,
      store: { id: input.storeId },
    });
  }
);
