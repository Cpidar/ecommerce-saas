import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { default_data_seed } from "../../../scripts/defaul-seed";
import { Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

type SeedDemoDataStepInput = {
  storeId: string;
};

/**
 * A workflow step that seeds default data (sales channels, regions,
 * stock locations, product categories, products and inventory) for a
 * given store.
 *
 * The heavy lifting is performed by the existing `default_data_seed`
 * function from `scripts/defaul-seed.ts`. We expose it as a step so it
 * can be invoked from the `initializeStore` workflow via `runAsStep`.
 */
export const SeedDemoDataStep = createStep(
  "seed-demo-data",
  async (input: SeedDemoDataStepInput, { container }) => {
    const { storeId } = input;
    const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER);

    logger.info(`Starting legacy demo data seeding for store ${storeId}`);

    await default_data_seed({ container, storeId });

    logger.info(`Finished legacy demo data seeding for store ${storeId}`);
    return new StepResponse({ storeId });
  }
);
