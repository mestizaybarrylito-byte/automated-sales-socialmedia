import * as React from "react";
import { cn } from "@/lib/utils";

/** Minimal shadcn-style Badge (hand-written). */
export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-accent font-medium",
        variant === "default" && "bg-rust-100 text-rust-800 border border-rust-700/20",
        variant === "secondary" && "bg-charcoal-900/5 text-charcoal-800 border border-charcoal-900/15",
        className
      )}
      {...props}
    />
  );
}
