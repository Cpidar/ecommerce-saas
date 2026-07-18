import {
  maybeApplyLinkFilter,
  MiddlewareRoute,
} from "@medusajs/framework/http";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import StoreLinkStoreConfig from "../../../links/multi-tenant/store_config-store"
import { addStoreIdToFilterableFields } from "../../middlewares/add-store-id-to-filterable-fields";

export const storeStoreConfigRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/store-config",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkStoreConfig.entryPoint,
        resourceId: "store_config_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
  {
    method: ["DELETE"],
    matcher: "/store/store-config",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkStoreConfig.entryPoint,
        resourceId: "store_config_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
];
