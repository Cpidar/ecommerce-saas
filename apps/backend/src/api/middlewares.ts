import { defineMiddlewares } from "@medusajs/medusa";
import { storeProductsRoutesMiddlewares } from "./store/products/middlewares";
import { storeProductCategoriesRoutesMiddlewares } from "./store/product-categories/middlewares";
import { adminProductCategoryRoutesMiddlewares } from "./admin/product-categories/middlewares";
import { addStoreScope } from "./middlewares/add-store-scope";
import { storeProductCollectionsRoutesMiddlewares } from "./store/collections/middlewares";
import { adminStoreMethodsRoutesMiddlewares } from "./admin/store-config/middlewares";
import { adminCustomUploadsRoutesMiddlewares } from "./admin/uploads/middlewares";
import { adminProductOptionRoutesMiddlewares } from "./admin/product-options/middlewares";
import { storeStoreConfigRoutesMiddlewares } from "./store/store-config/middlewares";
import { adminProductsRoutesMiddlewares } from "./admin/products/middleware";
import { storesRoutesMiddlewares } from "./stores/middlewares";
import { storeSearchMiddleware } from "./middlewares/store-search";
import { storeSearchRoutesMiddlewares } from "./store/search/middleware";

export default defineMiddlewares({
  routes: [
    {
      method: ["ALL"],
      matcher: "/store/*",
      middlewares: [addStoreScope],
    },
    // {
    //   method: 'ALL',
    //   matcher: '/store/custom/customer/*',
    //   middlewares: [authenticate('customer', ['session', 'bearer'])],
    // },
    // {
    //   matcher: "/store/search",
    //   middlewares: [storeSearchMiddleware],
    // },
    ...storeProductsRoutesMiddlewares,
    ...storeProductCategoriesRoutesMiddlewares,
    ...storeProductCollectionsRoutesMiddlewares,
    ...storeStoreConfigRoutesMiddlewares,
    ...adminProductCategoryRoutesMiddlewares,
    ...adminProductOptionRoutesMiddlewares,
    ...adminStoreMethodsRoutesMiddlewares,
    ...adminCustomUploadsRoutesMiddlewares,
    ...adminProductsRoutesMiddlewares,
    ...storesRoutesMiddlewares,
    ...storeSearchRoutesMiddlewares,
  ],
});
