"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeUp, inViewOnce } from "../lib/motion";

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in seconds before the entrance animation. */
  delay?: number;
}

/**
 * Reveals children with a fade-up once they scroll into view. Honors
 * prefers-reduced-motion by rendering statically.
 */
export function Reveal({ children, delay = 0, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div {...props}>{children}</div>;
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={inViewOnce}
      variants={fadeUp}
      transition={{ delay }}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
