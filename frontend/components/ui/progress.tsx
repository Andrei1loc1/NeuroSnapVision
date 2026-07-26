"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  color = "emerald",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
  color?: "emerald" | "sky" | "amber" | "default"
}) {
  const colorClasses = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-400",
    amber: "bg-amber-400",
    default: "bg-emerald-500",
  }

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn("size-full flex-1 transition-all", colorClasses[color])}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
