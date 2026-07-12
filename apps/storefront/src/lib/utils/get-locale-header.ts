import { getLocale } from "../medusa/locale-actions"

export async function getLocaleHeader() {
  const locale = await getLocale()
  return {
    "x-medusa-locale": locale,
  } as const
}
