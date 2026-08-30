import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk";
import { createConfigStep } from "../create-store-config/steps/create-config";
import { linkStoreConfigToStoreStep } from "../create-store-config/steps/link-store-config-to-store";
import { SeedDemoDataStep } from "./steps/seed-demo-data-step";
import { InitializeStoreWorkflowInput, JsonRecord } from "./types";

/**
 * Default Puck editor JSON template.
 *
 * Used as a fallback when no `template` is provided in the workflow input,
 * ensuring `puck_data` is always seeded with a valid, renderable starting
 * layout.
 */
const DEFAULT_PUCK_TEMPLATE: JsonRecord = {
  root: {
    layoutSize: 12,
    props: {
      backgroundColor: "#ffffff",
      fontFamily: "Inter, sans-serif",
    },
  },
  pages: {
    main: {
      title: "Home",
      layout: {},
      blocks: [
        {
          type: "Section",
          props: {
            blockWidth: 12,
            padding: 24,
            background: "#ffffff",
          },
        },
      ],
    },
  },
};

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

    const storeConfig = createConfigStep({
      medusa_store_id: input.storeId,
      title: input.title,
      handle: input.handle,
      subscription_product_id: input.subscription_id,
      subscription_status: input.subscription_status,
      puck_data: puckData as any,
    });

    linkStoreConfigToStoreStep({
      storeConfigId: storeConfig.id,
      storeId: input.storeId,
    });

    SeedDemoDataStep({ storeId: input.storeId });

    return new WorkflowResponse({
      storeConfig,
      store: { id: input.storeId },
    });
  }
);
