"use client"

// Loading and empty states for the Performance dashboard's widgets.
//
// Skeletons keep the shape of the widget they stand in for, so nothing jumps
// when the data lands — the same approach the money activity feed uses. A
// spinner would say "something is happening"; this says what is coming.
//
// Empty is per card, not per page, because widgets fail independently: a salon
// can have a full sales month and no WhatsApp conversations at all. The one
// exception is a business with nothing anywhere, which gets a single page-level
// message instead of twenty-one identical ones.

import { ChartNoAxesCombinedIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { WidgetShape } from "@/lib/reports/dashboard/widgets"

function Rows({ count, className }: { count: number; className?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders — nothing to reorder.
        <div key={`row-${count}-${i}`} className="flex items-center justify-between gap-4">
          <Skeleton className={className ?? "h-3 w-28"} />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </div>
  )
}

export function WidgetSkeleton({ shape }: { shape: WidgetShape }) {
  switch (shape) {
    case "stat":
      return (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-32" />
          <Rows count={4} />
        </div>
      )

    case "chart":
      return (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-3 w-56" />
        </div>
      )

    case "donut":
      return (
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="size-40 rounded-full" />
          <div className="w-full">
            <Rows count={4} />
          </div>
        </div>
      )

    case "table":
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Rows count={5} />
        </div>
      )

    case "funnel":
      return (
        <div className="flex flex-col gap-3">
          {[80, 60, 45].map((width) => (
            <div key={width} className="grid grid-cols-[7rem_1fr_auto] items-center gap-x-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-full" style={{ opacity: width / 100 }} />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
          <Skeleton className="mt-2 h-3 w-48" />
        </div>
      )

    case "heatmap":
      return (
        <div className="flex flex-col gap-1">
          {Array.from({ length: 6 }, (_, row) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders — nothing to reorder.
            <div key={`hm-${row}`} className="flex gap-1">
              <Skeleton className="h-7 w-12 shrink-0" />
              {Array.from({ length: 7 }, (_, col) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders — nothing to reorder.
                <Skeleton key={`hm-${row}-${col}`} className="h-7 flex-1" />
              ))}
            </div>
          ))}
        </div>
      )

    case "tiles":
      return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton placeholders — nothing to reorder.
              <Skeleton key={`tile-${i}`} className="h-20 rounded-xl" />
            ))}
          </div>
          <Rows count={3} />
        </div>
      )
  }
}

/**
 * Compact, because it sits inside a card that already has a title saying what
 * is missing — a full illustration and heading per widget would turn an empty
 * month into twenty-one competing announcements.
 */
export function WidgetEmpty({ label }: { label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1 py-10 text-center">
      <ChartNoAxesCombinedIcon className="size-5 text-muted-foreground/60" aria-hidden />
      <p className="text-sm text-muted-foreground">No {label} in this period</p>
      <p className="text-xs text-muted-foreground/80">Try a wider date range.</p>
    </div>
  )
}
