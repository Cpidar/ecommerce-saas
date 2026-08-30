import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { seedProgress } from "../../../../utils/initialize-store-progress";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  res.json(seedProgress.getState());
}