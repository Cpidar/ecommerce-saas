import { uploadFilesWorkflow } from "@medusajs/core-flows"
import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { HttpTypes, StoreDTO } from "@medusajs/framework/types"
import { randomUUID } from "crypto"
import path from "node:path"

export const POST = async (
  req: AuthenticatedMedusaRequest<HttpTypes.AdminUploadFile>,
  res: MedusaResponse<HttpTypes.AdminFileListResponse>
) => {
  const currentStore = req.scope.resolve("currentStore") as StoreDTO;
  if (!currentStore?.id) {
    throw new MedusaError(
      MedusaError.Types.FORBIDDEN,
      "your store is not defined, please contact your administrator to set up your store"
    )
  }
  const input = req.files as Express.Multer.File[]
  console.log(" 🐉🐉🐉 input: ", input)
  if (!input?.length) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "No files were uploaded"
    )
  }


  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: input.map((f) => {
        // const { name, ext } = path.parse(f.originalname)

        // const safeName = name
        //   .trim()
        //   .replace(/\s+/g, "-")
        //   .replace(/[^a-zA-Z0-9_-]/g, "")

        // console.log(" 🐉🐉🐉 new file name: ", `${currentStore.id}/${safeName}-${randomUUID()}${ext.toLowerCase()}`)
        return {
          filename: `${currentStore.id}__${f.originalname}`,
          mimeType: f.mimetype,
          content: f.buffer.toString("base64"),
          access: "public",
        }
      })
    },
  })

  res.status(200).json({ files: result })
}