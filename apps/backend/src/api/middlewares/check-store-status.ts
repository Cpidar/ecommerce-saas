import { type MedusaNextFunction, type MedusaRequest, type MedusaResponse } from "@medusajs/framework/http";

export async function addStoreScope(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {

  const storeId =
    req?.headers['x-store-id'] as string
    || req.cookies['current_store_id']
    || req.scope.resolve('currentStore')
    || "store_01KVAPY42Q9STAS5V1NYWYBXCA";

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

  // TODO: check subscription status of product and allow/disallow
  if (product.subscriptions?.[0]?.status !== 'active') {
    console.log('🔥🔥 store is not active 🔥🔥 ', product.subscriptions)
  }

  return next();
}
