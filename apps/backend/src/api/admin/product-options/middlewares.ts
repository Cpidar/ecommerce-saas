import {
  maybeApplyLinkFilter,
  MiddlewareRoute,
} from "@medusajs/framework/http";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import StoreLinkProductOption from "../../../links/multi-tenant/product_option-store"
import { addStoreIdToFilterableFields } from "../../middlewares/admin/add-store-id-to-filterable-fields";

export const adminProductOptionRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/product-options",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkProductOption.entryPoint,
        resourceId: "product_option_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
    {
    method: ["DELETE"],
    matcher: "/admin/product-options",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkProductOption.entryPoint,
        resourceId: "product_option_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
];
