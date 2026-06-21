import { type MedusaNextFunction, type MedusaRequest, type MedusaResponse } from "@medusajs/framework/http";
import { StoreDTO } from "@medusajs/framework/types";

import { asValue } from "@medusajs/framework/awilix";

export async function addStoreScope(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {

  const storeId = req.cookies['current_store_id'] || req?.headers['x-store-id'] as string || "store_01KVAPY42Q9STAS5V1NYWYBXCA";

  if (!storeId) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }

  const query = req.scope.resolve('query')

  const sluggyfiedStoreId = storeId.toLowerCase().replace(/_/g, '-')
  console.log(sluggyfiedStoreId)
  const { data: [product] } = await query.graph({
    entity: "product",
    fields: ['id', 'handle', 'title', 'subscriptions.*'],
    filters: { handle: sluggyfiedStoreId }
  })

  console.log('🔥🔥 related product 🔥🔥: ', product)

  // TODO: check subscription status of product and allow/disallow
  // if(product)

  req.scope.register({
    currentStore: asValue({ id: storeId }),
  });
  return next();
}
