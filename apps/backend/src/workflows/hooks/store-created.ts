import { asValue } from "@medusajs/framework/awilix";
import { IStoreModuleService, IEventBusModuleService } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createStoreWorkflow } from "@sepidar/medusa-multistore-plugin/workflows/create-store/index";
import { initializeStoreWorkflow } from "../initialize-store";
import type { InitializeStoreWorkflowInput } from "../initialize-store/types";

createStoreWorkflow.hooks.storeCreated(async ({ store: { storeId }, additional_data }, { container }) => {
  console.log("HOOK storeCreated", storeId);
  const storeService: IStoreModuleService = container.resolve(Modules.STORE);
  const event = container.resolve<IEventBusModuleService>(Modules.EVENT_BUS);

  // Register the newly created store for downstream resolvers that depend on
  // a "currentStore" binding inside the DI container.
  container.register("currentStore", asValue({ id: storeId }));

  const input: InitializeStoreWorkflowInput = {
    storeId,
    title: (additional_data?.name as string) ?? "",
    handle: (additional_data?.handle as string) ?? null,
    subscription_id: (additional_data?.subscription_id as string) ?? null,
    subscription_status: (additional_data?.subscription_status as string) ?? "PENDING",
    template: (additional_data?.template as InitializeStoreWorkflowInput["template"]) ?? undefined,
  };

  const { result: { storeConfig } } = await initializeStoreWorkflow(container).run({ input });

  console.log("Store config initialized: ", storeConfig);

  event.emit({
    name: "store.created",
    data: {
      currentStoreId: storeId,
    },
  });

  // TODO: re-enable when a product-to-store linking workflow is required.
  // const { result: [product] } = await createProductsWorkflow(container).run({
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
});
