import { maybeApplyLinkFilter, MiddlewareRoute } from "@medusajs/framework";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import { addStoreIdToFilterableFields } from "../../middlewares/add-store-id-to-filterable-fields";
// import { maybeApplyLinkFilter } from "../../middlewares/maybe-apply-link-filter";

export const storeProductCategoriesRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/product-categories",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: "product_category_store",
        resourceId: "product_category_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
];
