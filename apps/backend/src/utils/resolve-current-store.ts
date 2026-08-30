import { MedusaContainer, StoreDTO } from '@medusajs/framework/types'
import { AsyncLocalStorage } from 'node:async_hooks'

export const storeContext = new AsyncLocalStorage<{ storeId: string }>()

export async function resolveCurrentStore(
    container: MedusaContainer,
) {
    // 1. Explicit request scope
    if (container.hasRegistration("currentStore")) {
        const currentStore = container.resolve("currentStore") as Pick<StoreDTO, 'id'>;
        return currentStore
    }

    // 2. Workflow/request ALS
    const storeId = storeContext.getStore()?.storeId

    if (storeId) {

        return { id: storeId }
    }

    return null
}