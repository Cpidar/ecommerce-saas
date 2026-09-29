"use client";
import { useEffect, useRef } from "react";
import { haptic, isPhone } from "./device";

/** Where a flick would come to rest (Apple's deceleration projection, px/s in, px out). */
const project = (velocity: number, rate = 0.995) => ((velocity / 1000) * rate) / (1 - rate);
/** Resistance past the top edge: the further you pull, the less the sheet follows. */
const rubberband = (distance: number, size: number) => (distance * size * 0.55) / (size + 0.55 * distance);

function scrollerIn(target: Element | null, sheet: HTMLElement) {
  for (let node = target as HTMLElement | null; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (/(auto|scroll)/.test(overflow) && node.scrollHeight > node.clientHeight + 1) return node;
    if (node === sheet) break;
  }
  return null;
}

/**
 * Grabber pill for phone bottom sheets. Put it first inside a SheetContent;
 * it makes the whole sheet draggable. The sheet follows the finger 1:1, a
 * content area scrolled away from its top keeps scrolling instead, a flick
 * dismisses based on where its momentum would carry it, and the page behind
 * scales back while the sheet is up (app-shell.css) and forward as you drag.
 * Only active where the sheet is a bottom sheet, i.e. on phones.
 */
export function SheetGrabber({ onDismiss }: { onDismiss: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  }, [onDismiss]);
  useEffect(() => {
    const sheet = ref.current?.closest<HTMLElement>('[data-slot="sheet-content"]');
    if (!sheet) return;
    const root = document.documentElement;
    // The page behind recedes around the middle of what's on screen, and clips to the viewport.
    const setRecede = () => {
      const top = window.scrollY;
      const bottom = Math.max(0, document.documentElement.scrollHeight - top - window.innerHeight);
      root.style.setProperty("--recede-origin", `${top + window.innerHeight / 2}px`);
      root.style.setProperty("--recede-top", `${top}px`);
      root.style.setProperty("--recede-bottom", `${bottom}px`);
    };
    setRecede();

    let start: { x: number; y: number; scroller: HTMLElement | null } | null = null;
    let dragging = false;
    let height = 0;
    let offset = 0;
    let samples: { y: number; t: number }[] = [];
    const active = () => sheet.dataset.side === "bottom" && isPhone();

    const onStart = (event: TouchEvent) => {
      if (!active() || event.touches.length > 1) return;
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, [data-no-drag]")) return;
      const touch = event.touches[0];
      start = { x: touch.clientX, y: touch.clientY, scroller: scrollerIn(target, sheet) };
      dragging = false;
      samples = [{ y: touch.clientY, t: event.timeStamp }];
    };
    const onMove = (event: TouchEvent) => {
      if (!start) return;
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (!dragging) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        // Sideways swipes, upward pushes on scrollable content and content that is
        // mid-scroll all belong to the scroller, not the sheet.
        const scrolled = start.scroller && start.scroller.scrollTop > 0;
        if (Math.abs(dx) > Math.abs(dy) || scrolled || (dy < 0 && start.scroller)) {
          start = null;
          return;
        }
        dragging = true;
        height = sheet.getBoundingClientRect().height;
        start.y = touch.clientY; // pick up from here, so the sheet doesn't jump by the threshold
        sheet.dataset.dragging = "";
      }
      if (event.cancelable) event.preventDefault();
      const delta = touch.clientY - start.y;
      offset = delta >= 0 ? delta : -rubberband(-delta, height);
      sheet.style.setProperty("--drag", `${offset}px`);
      root.style.setProperty("--sheet-progress", String(Math.min(1, Math.max(0, 1 - offset / height))));
      samples.push({ y: touch.clientY, t: event.timeStamp });
      if (samples.length > 6) samples.shift();
    };
    const onEnd = () => {
      if (!start || !dragging) {
        start = null;
        return;
      }
      start = null;
      dragging = false;
      delete sheet.dataset.dragging;
      const first = samples[0];
      const last = samples[samples.length - 1];
      const velocity = last.t > first.t ? ((last.y - first.y) / (last.t - first.t)) * 1000 : 0;
      root.style.removeProperty("--sheet-progress");
      if (offset > 0 && (offset + project(velocity) > height * 0.5 || velocity > 1000)) {
        // The exit transition carries on from wherever the finger let go.
        haptic(6);
        dismiss.current();
      } else {
        sheet.style.setProperty("--drag", "0px");
      }
      // A drag that ended over a button shouldn't also press it.
      const swallow = (click: Event) => {
        click.preventDefault();
        click.stopPropagation();
      };
      sheet.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => sheet.removeEventListener("click", swallow, { capture: true }), 350);
    };
    sheet.addEventListener("touchstart", onStart, { passive: true });
    sheet.addEventListener("touchmove", onMove, { passive: false });
    sheet.addEventListener("touchend", onEnd);
    sheet.addEventListener("touchcancel", onEnd);
    return () => {
      sheet.removeEventListener("touchstart", onStart);
      sheet.removeEventListener("touchmove", onMove);
      sheet.removeEventListener("touchend", onEnd);
      sheet.removeEventListener("touchcancel", onEnd);
      root.style.removeProperty("--sheet-progress");
    };
  }, []);
  return <span ref={ref} className="sheet-grabber" aria-hidden />;
}
