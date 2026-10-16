import { MedusaError } from "@medusajs/framework/utils";
import { configureStoreSearch } from "@medusajs/framework";
import { StoreDTO } from "@medusajs/framework/types";

export const storeSearchMiddleware = configureStoreSearch({
  allowed_indexes: {
    product: {
      filters: async (req) => {
        // Replace with your trusted tenant resolver.
        if (req.scope.hasRegistration("currentStore")) {
          const store = req.scope.resolve("currentStore") as Pick<
            StoreDTO,
            "id"
          >;
          if (!store?.id) {
            throw new MedusaError(
              MedusaError.Types.UNEXPECTED_STATE,
              "Store context is required",
            );
          }

          return {
            store_id: store.id,
          };
        } else {
          throw new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            "Store context is required",
          );
        }
      },
    },
  },
});
