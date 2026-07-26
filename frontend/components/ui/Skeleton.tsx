import { cn } from "@/utils/cn";
import type { HTMLAttributes } from "react";

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-200/70",
        className,
      )}
      {...props}
    />
  );
}

export interface SkeletonTextProps extends HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

export function SkeletonText({ lines = 2, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
        />
      ))}
    </div>
  );
}

export type SkeletonChartProps = HTMLAttributes<HTMLDivElement>;

export function SkeletonChart({ className, ...props }: SkeletonChartProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col justify-end gap-1",
        className,
      )}
      {...props}
    >
      <div className="flex flex-1 items-end gap-1.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-md"
            style={{ height: `${30 + ((i * 17) % 60)}%` }}
          />
        ))}
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

export function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "glass-card card-animate mx-5 mt-2 p-4 space-y-3",
        className,
      )}
      {...props}
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-3/4" />
    </div>
  );
}

export default Skeleton;