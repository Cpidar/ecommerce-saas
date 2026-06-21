import {
  maybeApplyLinkFilter,
  MiddlewareRoute,
} from "@medusajs/framework/http";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import StoreLinkProductCategory from "../../../links/multi-tenant/product_category-store"
import { addStoreIdToFilterableFields } from "../../middlewares/admin/add-store-id-to-filterable-fields";

export const adminProductCategoryRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/admin/product-categories",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkProductCategory.entryPoint,
        resourceId: "product_category_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
    {
    method: ["DELETE"],
    matcher: "/admin/product-categories",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: StoreLinkProductCategory.entryPoint,
        resourceId: "product_category_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
];
