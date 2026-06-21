import {
  maybeApplyLinkFilter,
  MiddlewareRoute,
} from "@medusajs/framework/http";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import StoreLinkStoreConfig from "../../../links/multi-tenant/store_config-store"
import { addStoreIdToFilterableFields } from "../../middlewares/admin/add-store-id-to-filterable-fields";

export const adminStoreMethodsRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/store-config",
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
    matcher: "/admin/store-config",
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
