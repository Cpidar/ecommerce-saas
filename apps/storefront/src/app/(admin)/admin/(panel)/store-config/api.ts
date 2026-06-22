import type { StoreConfigCreateInput, StoreConfigUpdateInput } from '@dtc/cms/db'

const BASE = '/api/model/StoreConfig'

export const getStoreConfig = async () => {
  const res = await fetch(`${BASE}/findFirst`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data ?? null
}

export const saveStoreConfig = async (
  payload: StoreConfigCreateInput | (StoreConfigUpdateInput & { id: string })
) => {
  const isUpdate = 'id' in payload && !!payload.id

  const endpoint = isUpdate ? `${BASE}/update` : `${BASE}/create`

  const body = isUpdate
    ? { where: { id: payload.id }, data: payload }
    : { data: payload }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

  if (!res.ok) throw new Error('Save failed')
  return res.json()
}