import { StoreDTO } from "@medusajs/framework/types";
import { createProductOptionsWorkflow } from "@medusajs/medusa/core-flows";
import { linkProductOptionToStoreWorkflow } from "../link-product-option-to-store";

createProductOptionsWorkflow.hooks.productOptionsCreated(async ({ product_options }, { container }) => {
  console.log("HOOK productOptionsCreated", product_options);

  const currentStore = container.resolve("currentStore") as Pick<StoreDTO, 'id'>;
  await Promise.all(
    product_options.map(({ id }) =>
      linkProductOptionToStoreWorkflow(container).run({
        input: {
          optionId: id,
          storeId: currentStore.id,
        },
      })
    )
  );
});
