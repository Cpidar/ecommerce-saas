import { AuthenticatedMedusaRequest, MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";

export async function GET(
  req: AuthenticatedMedusaRequest<HttpTypes.StoreGetCustomerParams>,
  res: MedusaResponse<HttpTypes.StoreCustomerResponse>
) {
  const id = req.auth_context
  console.log("actor_id: ", id)
  res.sendStatus(200);
}
