 import { HttpTypes, PaginatedResponse } from "@medusajs/types"
import { sdk } from "../medusa";

export const getProductTypesList = async function (
  offset: number = 0,
  limit: number = 100,
  fields?: (keyof HttpTypes.StoreProductType)[]
): Promise<{ productTypes: HttpTypes.StoreProductType[]; count: number }> {
  return (await sdk()).client
    .fetch<
      PaginatedResponse<{
        product_types: HttpTypes.StoreProductType[]
        count: number
      }>
    >("/store/custom/product-types", {
      query: { limit, offset, fields: fields ? fields.join(",") : undefined },
      next: { tags: ["product-types"] },
      cache: "force-cache",
    })
    .then(({ product_types, count }) => ({
      productTypes: product_types,
      count,
    }))
}

export const getProductTypeByHandle = async function (
  handle: string
): Promise<HttpTypes.StoreProductType> {
  return (await sdk()).client
    .fetch<
      PaginatedResponse<{
        product_types: HttpTypes.StoreProductType[]
        count: number
      }>
    >("/store/custom/product-types", {
      query: { handle, limit: 1 },
      next: { tags: ["product-types"] },
      cache: "force-cache",
    })
    .then(({ product_types }) => product_types[0])
}
