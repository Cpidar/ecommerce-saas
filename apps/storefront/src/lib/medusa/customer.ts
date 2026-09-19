import { HttpTypes } from "@medusajs/types"
import { sdk } from "../medusa"
import { medusaError } from "../medusa-error"
import { getAuthHeaders } from "./cookies"

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
    const headers = {
        ...(await getAuthHeaders()),
    }

    const updateRes = await sdk.store.customer
        .update(body, {}, headers)
        .then(({ customer }) => customer)
        .catch(medusaError)

    //   const cacheTag = await getCacheTag("customers")
    //   revalidateTag(cacheTag)

    return updateRes
}
