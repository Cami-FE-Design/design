"use client"

import { InfoIcon } from "lucide-react"
import type * as React from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  value: React.ReactNode
  /** Optional info text shown on hover via a small (i) icon at the top-right. */
  info?: string
  className?: string
}

export function KpiCard({ label, value, info, className }: KpiCardProps) {
  return (
    <div
      data-slot="kpi-card"
      className={cn(
        "flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium tracking-wide text-muted-foreground">{label}</span>
        {info ? (
          <Tooltip>
            <TooltipTrigger className="cursor-default text-muted-foreground hover:text-foreground">
              <InfoIcon className="size-3.5" />
              <span className="sr-only">More info</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px] text-left text-xs">{info}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <span className="font-heading text-2xl font-semibold leading-none">{value}</span>
    </div>
  )
}

type KpiGridProps = {
  children: React.ReactNode
  className?: string
}

/**
 * 2-column grid for KpiCards. Override `className` to switch to `grid-cols-4`
 * in wider contexts (e.g. a full-page dashboard). Default targets the narrow
 * detail-dialog content column.
 */
export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div data-slot="kpi-grid" className={cn("grid grid-cols-2 gap-2", className)}>
      {children}
    </div>
  )
}
