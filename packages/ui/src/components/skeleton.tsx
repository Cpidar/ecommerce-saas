import { cn } from "../lib/cn";

/** Loading placeholder. Reserve the final element's space to avoid layout shift. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-md", className)} {...props} />;
}
