import { authenticate, defineMiddlewares } from "@medusajs/medusa";
import { storeProductsRoutesMiddlewares } from "./store/products/middlewares";
import { storeProductCategoriesRoutesMiddlewares } from "./store/product-categories/middlewares";
import { adminProductCategoryRoutesMiddlewares } from "./admin/product-categories/middlewares";
import { addStoreScope } from "./middlewares/add-store-scope";
import { storeProductCollectionsRoutesMiddlewares } from "./store/collections/middlewares";
import { adminStoreMethodsRoutesMiddlewares } from "./admin/store-config/middlewares";


export default defineMiddlewares({

  routes: [
    {
      method: ["GET"],
      matcher: "/store/*",
      middlewares: [addStoreScope],
    },
    // {
    //   method: 'ALL',
    //   matcher: '/store/custom/customer/*',
    //   middlewares: [authenticate('customer', ['session', 'bearer'])],
    // },
    ...storeProductsRoutesMiddlewares,
    ...storeProductCategoriesRoutesMiddlewares,
    ...storeProductCollectionsRoutesMiddlewares,
    ...adminProductCategoryRoutesMiddlewares,
    ...adminStoreMethodsRoutesMiddlewares
  ],
});
