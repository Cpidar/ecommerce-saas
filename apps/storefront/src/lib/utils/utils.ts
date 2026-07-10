import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { siteConfig } from "@/lib/config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getPercentageDiff = (original: number, calculated: number) => {
  const diff = original - calculated
  const decrease = (diff / original) * 100

  return decrease.toFixed()
}

export function formatPrice(
  priceInToman: number,
  currency?: string
): string {
  const formattedNumber = new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: 0,
    // Use 'currency' style for proper number formatting
    style: 'currency',
    currency: 'IRR',
    // Hide the IRR symbol, we'll add our own
    currencyDisplay: 'code',
  }).format(priceInToman * 10)
    .replace('IRR', '') // Remove IRR code
    .trim();
  
  return `${formattedNumber} تومان`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}
