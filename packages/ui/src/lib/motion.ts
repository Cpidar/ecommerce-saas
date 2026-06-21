"use client";

import type { Variants } from "framer-motion";

/** Premium fluid easing (matches the Tailwind `ease-fluid` token). */
export const fluid: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Fade + rise — the default entrance for hero copy, section headings, cards. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: fluid } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: fluid } },
};

/** Stagger children of a container (e.g. a product grid revealing on scroll). */
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Crossfade for hero carousel slides. */
export const slideCrossfade: Variants = {
  enter: { opacity: 0, scale: 1.04 },
  center: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: fluid } },
  exit: { opacity: 0, scale: 1, transition: { duration: 0.6, ease: fluid } },
};

/** Sensible defaults for `whileInView` so sections animate once on scroll. */
export const inViewOnce = { once: true, amount: 0.3 } as const;
