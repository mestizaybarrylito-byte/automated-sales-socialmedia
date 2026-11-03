import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "outline" | "secondary";
type Size = "sm" | "md";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

const variants: Record<Variant, string> = {
  default: "btn-brand-primary disabled:opacity-60",
  outline: "border border-charcoal-900/25 text-charcoal-900 hover:bg-charcoal-900/5 disabled:opacity-60",
  secondary: "bg-charcoal-800 text-on-surface btn-brand-secondary disabled:opacity-60",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-5 text-sm",
};

/** Minimal shadcn-style Button (hand-written; CLI unreachable offline). */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", asChild, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center rounded-md font-accent font-medium transition-colors",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust-600",
      "disabled:cursor-not-allowed",
      variants[variant],
      sizes[size],
      className
    );
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
      });
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
