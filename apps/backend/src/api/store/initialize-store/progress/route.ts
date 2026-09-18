import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createSeedProgress, DEFAULT } from "../../../../utils/initialize-store-progress";

export async function GET(req: MedusaRequest, res: MedusaResponse) {

  const key = req.query.key as string

  if(!key) {
    res.sendStatus(409)
  }

  const seedProgress = createSeedProgress(req.scope, key)

  res.json(await seedProgress.get());
}