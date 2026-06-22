import { authDb } from './db'

export function getDb(medusaStoreId: string) {
    return authDb.$setAuth({ medusaStoreId })
}

export async function getDbFromRequest(storeId: string, token: string) {

    return getDb(storeId)
}
