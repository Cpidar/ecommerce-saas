import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { type MedusaNextFunction, type MedusaRequest, type MedusaResponse } from "@medusajs/framework/http";
import { StoreDTO } from "@medusajs/framework/types";

import { asValue } from "@medusajs/framework/awilix";
import { storeContext } from "../../utils/resolve-current-store";

export async function addStoreScope(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {

  let storeId
  if (req.scope.hasRegistration("currentStore")) {
    const store = req.scope.resolve("currentStore") as Pick<StoreDTO, "id">
    console.log("✌️✌️✌️✌️", store)
    storeId = store.id
  } else {
    storeId = req.cookies['current_store_id'] || req?.headers['x-store-id'] as string || "store_01KVAPY42Q9STAS5V1NYWYBXCA";
  }

  if (!storeId) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }

  // const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  // const sluggyfiedStoreId = storeId.toLowerCase().replace(/_/g, '-')

  // const { data: [product] } = await query.graph({
  //   entity: "product",
  //   fields: ['id', 'handle', 'title', 'subscriptions.*'],
  //   filters: { handle: sluggyfiedStoreId }
  // })


  // TODO: check subscription status of product and allow/disallow
  // if(product)

  req.scope.register({
    currentStore: asValue({ id: storeId }),
  });

  return storeContext.run(
    { storeId },
    () => next()
  );
}
