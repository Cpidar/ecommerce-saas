import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import { addStoreIdToFilterableFields } from "../../middlewares/add-store-id-to-filterable-fields";
import { maybeApplyLinkFilter, MiddlewareRoute } from "@medusajs/framework";
import { storeSearchMiddleware } from "../../middlewares/store-search";

export const storeSearchRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/store/search",
    middlewares: [storeSearchMiddleware],
  },
];
