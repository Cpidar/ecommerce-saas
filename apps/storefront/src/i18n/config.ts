export const defaultLocale = "fa" as const
export const locales = ["en", "fa"] as const

export type Locale = (typeof locales)[number]
