"use client";

import * as RS from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  "aria-label"?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Accessible dropdown built on Radix — animated popover, keyboard nav, custom
 * styling. Replaces native <select> for a premium feel.
 */
export function Select({
  value,
  defaultValue,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  disabled,
  ...aria
}: SelectProps) {
  return (
    <RS.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <RS.Trigger
        aria-label={aria["aria-label"]}
        className={cn(
          "flex h-12 w-full items-center justify-between gap-2 rounded-sm border border-input bg-card/60 px-3.5 text-sm text-foreground",
          "transition-colors hover:border-foreground/40 focus:outline-none focus-visible:border-foreground focus-visible:ring-1 focus-visible:ring-ring",
          "data-[placeholder]:text-muted-foreground/60 disabled:opacity-50",
          className,
        )}
      >
        <RS.Value placeholder={placeholder} />
        <RS.Icon>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-sm border border-border bg-card shadow-xl",
            "data-[state=open]:animate-fade-in",
          )}
        >
          <RS.Viewport className="p-1">
            {options.map((opt) => (
              <RS.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-3 text-sm outline-none",
                  "data-[highlighted]:bg-muted data-[state=checked]:font-medium",
                )}
              >
                <RS.ItemIndicator className="absolute left-2 inline-flex">
                  <Check className="h-4 w-4 text-accent" />
                </RS.ItemIndicator>
                <RS.ItemText>{opt.label}</RS.ItemText>
              </RS.Item>
            ))}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  );
}
