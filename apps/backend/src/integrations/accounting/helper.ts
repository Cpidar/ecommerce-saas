import { MedusaError } from "@medusajs/framework/utils"
export function rialToToman(value: number): number {
  return Math.round(value / 10)
}

export function toNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? Math.trunc(Math.abs(value)) : 0
  }

  if (typeof value !== "string") {
    return 0
  }

  const normalized = value
    .replace(/,/g, "")
    .replace(/٬/g, "")
    .replace(/٫/g, ".")
    .replace(/\//g, ".")

  const number = Number(normalized)

  return Number.isFinite(number) && number > 0 ? Math.trunc(Math.abs(number)) : 0
}

export async function requestJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, options)

  const text = await response.text()

  let body: unknown

  try {
    body = text ? JSON.parse(text) : undefined
  } catch {
    body = text
  }

  if (!response.ok) {
    throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, `Accounting API ${response.status}: ${
        typeof body === "string"
          ? body
          : JSON.stringify(body)
      }`)
  }

  return body as T
}
