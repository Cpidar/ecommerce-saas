import { asValue } from "@medusajs/framework/awilix";
import { IStoreModuleService, IEventBusModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
// import { createProductsWorkflow } from "@medusajs/medusa/core-flows";
import { createStoreWorkflow } from "@techlabi/medusa-marketplace-plugin/workflows/create-store/index"
import default_data_seed from "../../scripts/defaul-seed";
import { createConfigWorkflow } from "../create-store-config";
// import { linkProductToStoreWorkflow } from "@techlabi/medusa-marketplace-plugin/workflows/link-product-to-store/index"

createStoreWorkflow.hooks.storeCreated(async ({ storeId }, { container }) => {
  console.log("HOOK storeCreated", storeId);
  const storeService: IStoreModuleService = container.resolve(Modules.STORE)
  const event = container.resolve<IEventBusModuleService>(Modules.EVENT_BUS)
  const store = await storeService.retrieveStore(storeId)

  // const SUPER_ADMIN_STORE_ID = process.env.SUPER_ADMIN_STORE_ID || "store_01KTJY1ZW9GNT71P3KE2DQ163D"

  container.register('currentStore', asValue({ id: storeId }))

  const { result: { storeConfig } } = await createConfigWorkflow(container).run({
    input: {
      title: store.name,
      handle: store.metadata?.handle,
      medusa_store_id: store.id,
      // TODO: seed puck data json
    }
  })

  console.log("Store config set: ", storeConfig)

  default_data_seed({
    container,
    storeId: storeId
  })


  //   const { result: [product] } = await createProductsWorkflow(container).run({
  //   input: {
  //     products: [{
  //       title: store.name,
  //       handle: store.id.toLowerCase().replace(/_/g, '-'),
  //       status: 'published',
  //       options: [{
  //         title: "Default option",
  //         values: ["Default option value"]
  //       }],
  //     }],
  //   }
  // })
  // console.log(product)

  event.emit({
    name: 'store.created',
    data: {
      currentStore: store
    }
  })

});
