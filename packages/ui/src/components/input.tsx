import { forwardRef, useId } from "react";
import { cn } from "../lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const inputClassName =
  "h-12 w-full rounded-sm border border-input bg-card/60 px-3.5 text-sm text-foreground transition-colors " +
  "placeholder:text-muted-foreground/50 hover:border-foreground/40 " +
  "focus-visible:outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-ring";

/** Accessible labelled input — editorial styling, claret focus. */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(inputClassName, error && "border-destructive focus-visible:ring-destructive", className)}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
