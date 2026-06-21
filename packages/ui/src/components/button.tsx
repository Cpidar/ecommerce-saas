import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-all duration-300 ease-fluid cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // ink fill that warms to claret on hover
        solid: "bg-primary text-primary-foreground hover:bg-accent",
        // signature claret
        accent: "bg-accent text-accent-foreground hover:brightness-110",
        gold: "bg-accent text-accent-foreground hover:brightness-110", // legacy alias → claret
        outline: "border border-foreground/40 text-foreground hover:bg-foreground hover:text-background",
        ghost: "text-foreground hover:bg-foreground/5",
        link: "px-0 text-foreground link-underline rounded-none",
      },
      size: {
        sm: "h-9 px-4",
        md: "h-11 px-7",
        lg: "h-[3.25rem] px-9 text-[0.8125rem]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "solid", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as the child element (e.g. a Next.js <Link>) instead of <button>. */
  asChild?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, loading, disabled, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    // asChild: forward styling to the single child element (e.g. a <Link>).
    if (asChild) {
      return (
        <Slot ref={ref} className={classes} {...props}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
