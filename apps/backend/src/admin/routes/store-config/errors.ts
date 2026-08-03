import { toast } from "@medusajs/ui";
import type { ZodError } from "zod";

/** Map Zod field paths to user-facing Persian labels. */
const FIELD_LABELS: Record<string, string> = {
  title: "عنوان فروشگاه",
  handle: "شناسه فروشگاه",
  domain: "دامنه",
  description: "توضیحات",
  tagline: "شعار",
  medusa_store_id: "شناسه فروشگاه",
  logo_url: "لوگو",
  logo_alt: "متن جایگزین لوگو",
  favicon_url: "فاویکون",
  default_title: "عنوان پیش‌فرض",
  title_template: "قالب عنوان",
  default_description: "توضیحات پیش‌فرض",
  default_image_url: "تصویر پیش‌فرض",
  canonical_url: "URL کنونیکال",
  site_name: "نام سایت (OG)",
  image_url: "تصویر OG",
  google_analytics_id: "Google Analytics ID",
  google_tag_manager_id: "Google Tag Manager ID",
  meta_pixel_id: "Meta Pixel ID",
  tiktok_pixel_id: "TikTok Pixel ID",
};

/** Return a human-readable path segment, e.g. `social_links.instagram` → `اینستاگرام`. */
export const humanizeFieldPath = (path: readonly PropertyKey[]): string => {
  const key = path[0];
  if (typeof key !== "string") return String(key);
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  // Social links and other known sub-keys
  const SOCIAL: Record<string, string> = {
    instagram: "اینستاگرام",
    telegram: "تلگرام",
    eitaa: "ایتا",
    bale: "بله",
    rubika: "روبیکا",
    x: "ایکس",
    facebook: "فیسبوک",
    linkedlin: "لینکدین",
    youtube: "یوتیوب",
    aparat: "آپارات",
    tiktok: "تیک‌توک",
    address: "آدرس",
    phone: "تلفن",
    email: "ایمیل",
  };
  if (SOCIAL[key]) return SOCIAL[key];
  return key;
};

/** Convert a ZodError into { field: message } keyed by first path segment. */
export const zodErrorsToMap = (error: ZodError): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0]);
    if (!map[key]) map[key] = issue.message;
  }
  return map;
};

/** Show a toast listing exactly which fields failed, e.g. «لطفا این فیلدها را بررسی کنید: لوگو، آدرس». */
export const toastValidationErrors = (error: ZodError): void => {
  const fields = Array.from(
    new Set(error.issues.map((i) => humanizeFieldPath(i.path)))
  );
  toast.error(
    `لطفا این فیلدها را بررسی کنید: ${fields.join("، ")}`
  );
};

/** Extract a readable message from an unknown error (network / server / Zod). */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Medusa SDK errors carry `response.data` sometimes
    const anyError = error as Error & { response?: { data?: { message?: string } } };
    return anyError.response?.data?.message ?? error.message;
  }
  if (typeof error === "string") return error;
  return "خطای ناشناخته رخ داد";
};
