import { asValue } from "@medusajs/framework/awilix";
import { IStoreModuleService, IEventBusModuleService, Logger } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStoreWorkflow } from "@sepidar/medusa-multistore-plugin/workflows/create-store/index";
import { initializeStoreWorkflow } from "../initialize-store";
import type { InitializeStoreWorkflowInput } from "../initialize-store/types";
import { createSeedProgress } from "../../utils/initialize-store-progress";

createStoreWorkflow.hooks.storeCreated(async ({ store: { storeId, userId }, additional_data }, { container }) => {
  console.log("HOOK storeCreated", storeId);
  // const storeService: IStoreModuleService = container.resolve(Modules.STORE);
  const event = container.resolve<IEventBusModuleService>(Modules.EVENT_BUS);
  const logger = container.resolve<Logger>(ContainerRegistrationKeys.LOGGER)

  // Register the newly created store for downstream resolvers that depend on
  // a "currentStore" binding inside the DI container.
  container.register("currentStore", asValue({ id: storeId }));

  const seedProgress = createSeedProgress(container, additional_data.progressKey as string)
  await seedProgress.start()

  logger.info(`progressKey=${additional_data.progressKey}`)
  logger.info("Starting Store Config Setting...")

  const input: InitializeStoreWorkflowInput = {
    storeId,
    title: (additional_data?.name as string) ?? "",
    // TODO: handle must select from handle pool
    handle: (additional_data?.handle as string) ?? null,
    subscription_id: (additional_data?.subscription_id as string) ?? null,
    subscription_status: (additional_data?.subscription_status as string) ?? "PENDING",
    // TODO: map to json template pool
    template: (additional_data?.template as InitializeStoreWorkflowInput["template"]) ?? undefined,
    // use as redis key for caching progress state
    progressKey: additional_data.progressKey as string
  };
  logger.info("Finishing Store Config Setting...")

  logger.info("Initializing Store...")
  initializeStoreWorkflow(container)
    .run({
      input,
    })
    .then(async () => {
      await seedProgress.complete()
      logger.info("Store Initializing Completed")
    })
    .catch(async (err) => {
      logger.error("Error in Initializing store")
      console.log(err)
      await seedProgress.fail(
        err instanceof Error ? err.message : "خطای ناشناخته"
      )
    });

  // console.log("Store config initialized: ", storeConfig);

  event.emit({
    name: "store.initialized",
    data: {
      currentStoreId: storeId,
      userId,
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
