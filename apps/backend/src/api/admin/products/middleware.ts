import { maybeApplyLinkFilter, MiddlewareRoute } from "@medusajs/framework";
import { addStoreIdToFilterableFields } from "../../middlewares/admin/add-store-id-to-filterable-fields";
import { registerLoggedInUser } from "@sepidar/medusa-multistore-plugin/api/middlewares/logged-in-user";
import { registerCurrentStore } from "@sepidar/medusa-multistore-plugin/api/middlewares/register-current-store";
import { addStoreScope } from "../../middlewares/add-store-scope";

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
            // moveIdsToQueryFromFilterableFields,
        ],
    },
    {
        method: ["POST"],
        matcher: "/admin/products/imports",
        middlewares: [registerLoggedInUser, registerCurrentStore, addStoreScope],
    },
    {
        method: ["POST"],
        matcher: "/admin/products/imports/:transaction_id/confirm",
        middlewares: [registerLoggedInUser, registerCurrentStore, addStoreScope],
    },
];
