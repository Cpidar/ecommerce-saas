import { IProductModuleService, StoreDTO } from "@medusajs/framework/types";
import { linkProductCategoryToStoreWorkflow } from "../link-product-category-to-store";
import { Modules } from "@medusajs/framework/utils";
import slugify from "../../utils/slugify";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";

createProductCategoriesWorkflow.hooks.categoriesCreated(async ({ categories }, { container }) => {
  console.log("HOOK categoriesCreated", categories);
    const productModuleService = container.resolve<IProductModuleService>(Modules.PRODUCT)

  const currentStore = container.resolve("currentStore") as Pick<StoreDTO, 'id'>;
  await Promise.all(
    categories.map(({ id }) =>
      linkProductCategoryToStoreWorkflow(container).run({
        input: {
          categoryId: id,
          storeId: currentStore.id,
        },
      })
    )
  );

      // 2. Loop through each newly created product
    for (const product of categories) {
      // 3. Generate your custom handle
      // Replace this logic with your own strategy
      let customHandle = slugify(product.name)
      
      // Add a timestamp or random string for uniqueness
      customHandle = `${product.handle}-${Date.now()}`

      // 4. Update the product directly with the new handle
      await productModuleService.updateProductCategories(product.id, {
        handle: customHandle
      })
    }
});
