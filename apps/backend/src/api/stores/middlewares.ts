import { authenticate, MiddlewareRoute } from "@medusajs/framework";
import { addStoreIdToFilterableFields } from "../middlewares/add-store-id-to-filterable-fields";
import { moveIdsToQueryFromFilterableFields } from "../middlewares/move-ids-to-query-from-filterable-fields";
import { checkApiKey } from "@sepidar/medusa-multistore-plugin/api/middlewares/check-api-key";
import { applyStoreCors } from "@sepidar/medusa-multistore-plugin/api/middlewares/apply-store-cors";

export const storesRoutesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/stores*",
    middlewares: [applyStoreCors],
  },
  {
    method: ["GET"],
    matcher: "/stores*",
    middlewares: [
      addStoreIdToFilterableFields,
      moveIdsToQueryFromFilterableFields,
    ],
  },
  {
    method: ["POST", "PUT", "DELETE"],
    matcher: "/stores*",
    middlewares: [checkApiKey],
  },
];
