import { cn } from "../lib/cn";

/** Consistent page gutter + max width. Use the same width everywhere. */
export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-12 2xl:px-24", className)} {...props} />;
}
