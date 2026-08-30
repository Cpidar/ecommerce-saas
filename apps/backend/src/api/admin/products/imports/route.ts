import {
  MedusaResponse,
  AuthenticatedMedusaRequest,
} from "@medusajs/framework/http"
import type { HttpTypes } from "@medusajs/framework/types"
import { importProductsAsChunksWorkflow } from "@medusajs/core-flows"
import { AdminImportProductsType } from "@medusajs/medusa/api/admin/products/validators"

/**
 * @since 2.8.5
 */
export const POST = async (
  req: AuthenticatedMedusaRequest<AdminImportProductsType>,
  res: MedusaResponse<HttpTypes.AdminImportProductResponse>
) => {

    const { result, transaction } = await importProductsAsChunksWorkflow(
    req.scope
  ).run({
    input: {
      filename: req.validatedBody.originalname,
      fileKey: req.validatedBody.file_key,
    },
  })

  res
    .status(202)
    .json({ transaction_id: transaction.transactionId, summary: result })
}
