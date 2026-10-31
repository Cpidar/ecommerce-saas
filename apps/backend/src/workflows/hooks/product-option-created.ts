import { StoreDTO } from "@medusajs/framework/types";
import { createProductOptionsWorkflow } from "@medusajs/medusa/core-flows";
import { linkProductOptionToStoreWorkflow } from "../link-product-option-to-store";
import { resolveCurrentStore } from "../../utils/resolve-current-store";
import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";

createProductOptionsWorkflow.hooks.productOptionsCreated(async ({ product_options }, { container }) => {
  console.log("HOOK productOptionsCreated", product_options.map(po => po.id));

  const currentStore = await resolveCurrentStore(container)
  if (!currentStore) {
      throw new MedusaError(MedusaErrorTypes.INVALID_DATA, "Current Store not Found")
  }
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
