import {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";

import { AdminStore, StoreDTO } from "@medusajs/framework/types";
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
  const currentStore = req.scope.resolve("currentStore") as StoreDTO;
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const validatedData = createStoreConfigWorkflowInputSchema.parse(body);

  const { result } = await createConfigWorkflow(req.scope).run({
    input: { ...validatedData, medusa_store_id: currentStore.id },
  });

  res.status(201).json({ store_config: result });
};

export const PUT = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const validatedData = updateStoreConfigWorkflowInputSchema.parse(body);

  const normalizedInput = {
    ...validatedData,
    payment_configs:
      typeof validatedData.payment_configs === "string"
        ? JSON.parse(validatedData.payment_configs)
        : validatedData.payment_configs,
    shipping_method_configs:
      typeof validatedData.shipping_method_configs === "string"
        ? JSON.parse(validatedData.shipping_method_configs)
        : validatedData.shipping_method_configs,
  };

  const { result } = await updateStoreConfigWorkflow(req.scope).run({
    input: normalizedInput,
  });

  res.status(200).json({ store_config: result });
};
