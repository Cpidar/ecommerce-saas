import { listShippingOptionsForCartWorkflow } from "@medusajs/core-flows";
import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { HttpTypes } from "@medusajs/framework/types";

export const GET = async (
  req: MedusaRequest<
    {},
    HttpTypes.StoreGetShippingOptionList & { id: string[] }
  >,
  res: MedusaResponse<HttpTypes.StoreShippingOptionListResponse>,
) => {
  const { cart_id, is_return, id } = req.filterableFields;

  const workflow = listShippingOptionsForCartWorkflow(req.scope);
  const { result: shipping_options } = await workflow.run({
    input: {
      cart_id,
      is_return: !!is_return,
      fields: req.queryConfig.fields,
      option_ids: id,
    },
  });

  res.json({ shipping_options });
};
