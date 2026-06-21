import * as React from "react";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { cn } from "@/lib/utils/utils";
import { LucideIcon } from "lucide-react";

interface InputIconProps extends React.ComponentPropsWithoutRef<typeof InputGroupInput> {
  startIcon?: LucideIcon;
  endIcon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

const InputIcon = React.forwardRef<
  React.ElementRef<typeof InputGroupInput>,
  InputIconProps
>(({ className, startIcon: StartIcon, endIcon: EndIcon, children, ...props }, ref) => {
  return (
    <InputGroup className={cn("relative", className)}>
      {StartIcon && (
        <InputGroupAddon align="inline-start">
          <StartIcon className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
      )}

      {/* Use children if provided, otherwise render default InputGroupInput */}
      {children ? (
        children
      ) : (
        <InputGroupInput ref={ref} {...props} />
      )}

      {EndIcon && (
        <InputGroupAddon align="inline-end">
          <EndIcon className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
      )}
    </InputGroup>
  );
});

InputIcon.displayName = "InputIcon";

export { InputIcon };