"use client";
import { useEffect, useState } from "react";

/**
 * Header count bubble. Pops (`data-bump`, see storefront.css) when the number
 * goes up because of something the shopper did, never while the saved count
 * loads in after hydration. `hideZero` hides it rather than unmounting it, so
 * the first save still pops.
 */
export function CountBadge({
  value,
  ready = true,
  hideZero = false,
}: {
  value: number;
  ready?: boolean;
  hideZero?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  const [seen, setSeen] = useState({ value, bump: 0 });
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => setArmed(true), 0);
    return () => clearTimeout(timer);
  }, [ready]);
  if (seen.value !== value)
    setSeen({ value, bump: armed && value > seen.value ? seen.bump + 1 : seen.bump });
  return (
    <span key={seen.bump} className="count" data-bump={seen.bump || undefined} hidden={(hideZero && value === 0) || undefined}>
      {value}
    </span>
  );
}
