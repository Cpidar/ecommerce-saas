import { IProductModuleService, StoreDTO } from "@medusajs/framework/types";
import { linkProductCategoryToStoreWorkflow } from "../link-product-category-to-store";
import { Modules } from "@medusajs/framework/utils";
import { createProductCategoriesWorkflow } from "@medusajs/medusa/core-flows";
import { normalizePersianText } from "../../utils/normalize-persian-text";

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
  for (const category of categories) {
    // 3. Generate your custom handle
    // Replace this logic with your own strategy
    const uniquPostfix = Math.floor(1000 + Math.random() * 9000).toString()


    // Add a timestamp or random string for uniqueness
    const customHandle = `ncc-${uniquPostfix}-${category.handle}`
    const normalizedName = normalizePersianText(category.name)

    // 4. Update the product directly with the new handle
    await productModuleService.updateProductCategories(category.id, {
      handle: customHandle,
      name: normalizedName
    })
  }
});
