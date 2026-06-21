import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        solid: "bg-primary text-primary-foreground",
        accent: "bg-accent text-accent-foreground",
        gold: "bg-accent text-accent-foreground", // legacy alias → claret
        brass: "bg-gold/15 text-gold",
        outline: "border border-foreground/30 text-foreground",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { variant: "solid" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
