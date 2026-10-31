import { maybeApplyLinkFilter, MiddlewareRoute } from "@medusajs/framework";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import { addStoreIdToFilterableFields } from "../../middlewares/add-store-id-to-filterable-fields";
// import { maybeApplyLinkFilter } from "../../middlewares/maybe-apply-link-filter";

export const storeShippingOptionsRoutesMiddlewares: MiddlewareRoute[] = [
  {
    method: ["GET"],
    matcher: "/store/shipping-options",
    middlewares: [
      addStoreIdToFilterableFields,
      maybeApplyLinkFilter({
        entryPoint: "shipping_option_store",
        resourceId: "shipping_option_id",
        filterableField: "store_id",
      }),
      moveIdsToQueryFromFilterableFields,
    ],
  },
];
