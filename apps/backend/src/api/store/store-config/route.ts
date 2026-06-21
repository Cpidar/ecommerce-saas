import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";

import { AdminStore } from "@medusajs/framework/types";
import { createConfigWorkflow } from "../../../workflows/create-store-config";
import { createStoreConfigWorkflowInputSchema, updateStoreConfigWorkflowInputSchema } from "./schema";
import { updateStoreConfigWorkflow } from "../../../workflows/update-store-config";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve("query");

  const { data: [store_config], metadata: { count, take, skip } = {} } =
    await query.graph({
      entity: "store_config",
      fields: ["*", "payment_configs.*", "shipping_method_configs.*"],
      filters: req.filterableFields,
    });

  res.json({
    store_config,
  });
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const currentStore = req.scope.resolve("currentStore") as AdminStore;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const validatedData = createStoreConfigWorkflowInputSchema.parse(body);

  const { result } = await createConfigWorkflow(req.scope).run({
    input: { ...validatedData, medusa_store_id: currentStore.id },
  });

  res.status(201).json({ config: result });
};

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  // const validatedData = updateStoreConfigWorkflowInputSchema.parse(body);

  const { result } = await updateStoreConfigWorkflow (req.scope).run({
    input: { ...body },
  });

  res.status(201).json({ config: result });
};
