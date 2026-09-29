"use client";
import { useSyncExternalStore } from "react";

/** Phone layout breakpoint; keep in step with the media queries in src/app/app-shell.css. */
export const PHONE_QUERY = "(max-width: 760px)";

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
/** True on phone-width screens. Always false during SSR and hydration. */
export function usePhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}
export const isPhone = () => typeof window !== "undefined" && window.matchMedia(PHONE_QUERY).matches;

/** A short tap of the Vibration API (Android). Silent where unsupported or when motion is reduced. */
export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(pattern);
  } catch {}
}
