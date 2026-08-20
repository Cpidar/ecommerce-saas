import { maybeApplyLinkFilter, MiddlewareRoute } from "@medusajs/framework";
import { addStoreIdToFilterableFields } from "../../middlewares/admin/add-store-id-to-filterable-fields";
import { moveIdsToQueryFromFilterableFields } from "../../middlewares/move-ids-to-query-from-filterable-fields";
import { registerLoggedInUser } from "@techlabi/medusa-marketplace-plugin/api/middlewares/logged-in-user";
import { registerCurrentStore } from "@techlabi/medusa-marketplace-plugin/api/middlewares/register-current-store";

export const adminProductsRoutesMiddlewares: MiddlewareRoute[] = [
    {
        method: ["POST"],
        matcher: "/admin/products/export",
        middlewares: [
            addStoreIdToFilterableFields,
            maybeApplyLinkFilter({
                entryPoint: "product_store",
                resourceId: "product_id",
                filterableField: "store_id",
            }),
            //   productStoreAccessMiddleware,
            moveIdsToQueryFromFilterableFields,
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/products/import",
        middlewares: [registerLoggedInUser, registerCurrentStore],
    },
];
