import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { StoreDTO } from "@medusajs/framework/types";
import { syncAccountingProductsWorkflow } from "../../../../workflows/sync-accounting-products";

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const currentStore = req.scope.resolve("currentStore") as StoreDTO;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

  const { result, transaction } = await syncAccountingProductsWorkflow(
    req.scope,
  ).run({
    input: {
      provider: body.provider,
      storeId: currentStore.id,
      stockLocationId: body.stockLocationId,
    },
  });

  res.status(201).json({
    transaction_id: transaction.transactionId,
    summary: result,
  });
};
