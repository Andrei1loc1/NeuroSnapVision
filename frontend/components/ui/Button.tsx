import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500":
              variant === "primary",
            "bg-slate-600 text-white hover:bg-slate-700 focus-visible:ring-slate-500":
              variant === "secondary",
            "border-2 border-slate-300 text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500":
              variant === "outline",
            "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-500":
              variant === "ghost",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-base": size === "md",
            "h-12 px-6 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };