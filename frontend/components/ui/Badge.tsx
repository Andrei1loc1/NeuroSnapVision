import { cn } from "@/utils/cn";
import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
          {
            "bg-slate-100 text-slate-800": variant === "default",
            "bg-emerald-100 text-emerald-800": variant === "success",
            "bg-amber-100 text-amber-800": variant === "warning",
            "bg-red-100 text-red-800": variant === "error",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };