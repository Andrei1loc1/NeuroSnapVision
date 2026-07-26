import { cn } from "@/utils/cn";
import { HTMLAttributes, forwardRef } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-slate-200 bg-white shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = "CardHeader";

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />;
  }
);

CardContent.displayName = "CardContent";

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };