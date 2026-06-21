import {
  type MedusaNextFunction,
  type MedusaRequest,
  type MedusaResponse,
} from "@medusajs/framework/http";

export async function addStoreIdToFilterableFields(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {

  const storeId = req.cookies['current_store_id'] || req?.headers['x-store-id'] as string;
  if (!storeId) {
    res.status(403).json({
      type: "invalid_request_error",
      message: "You do not have access to any stores.",
    });
    return;
  }


  if (!req.filterableFields) {
    req.filterableFields = {};
  }

  // set 'filterableFields' so then the 'maybeApplyLinkFilter' middleware will process it
  req.filterableFields["store_id"] = storeId;

  console.log('Before ApplyLinkFilter:', req.filterableFields)

  return next();
}
