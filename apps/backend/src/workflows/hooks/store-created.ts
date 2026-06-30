import { asValue } from "@medusajs/framework/awilix";
import { IStoreModuleService, IEventBusModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { createStoreWorkflow } from "@techlabi/medusa-marketplace-plugin/workflows/create-store/index"
// import { linkProductToStoreWorkflow } from "@techlabi/medusa-marketplace-plugin/workflows/link-product-to-store/index"

createStoreWorkflow.hooks.storeCreated(async ({ storeId }, { container }) => {
  console.log("HOOK storeCreated", storeId);
  const storeService: IStoreModuleService = container.resolve(Modules.STORE)
  const event = container.resolve<IEventBusModuleService>(Modules.EVENT_BUS)
  const store = await storeService.retrieveStore(storeId)

  const SUPER_ADMIN_STORE_ID = process.env.SUPER_ADMIN_STORE_ID || "store_01KTJY1ZW9GNT71P3KE2DQ163D"

  container.register('currentStore', asValue({ id: SUPER_ADMIN_STORE_ID }))

  const { result: [product] } = await createProductsWorkflow(container).run({
    input: {
      products: [{
        title: store.name,
        handle: store.id.toLowerCase().replace(/_/g, '-'),
        status: 'published',
        options: [{
          title: "Default option",
          values: ["Default option value"]
        }],
      }],
    }
  })
  console.log(product)

  // TODO: must be create customer in super admin store
  //TODO: must be create plans and offers for above product

  event.emit({
    name: 'store.created',
    data: {
      currentStore: store
    }
  })

});
