"use client"

// Shared building blocks for the Performance dashboard's widget cards.
//
// Every widget is made of the same handful of pieces — a card frame, a hero
// number with its delta, a breakdown list, a compact table, a tile row — so
// twenty-odd cards read as one surface rather than twenty designs. Anything
// widget-specific stays in dashboard-widget.tsx.

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import Link from "next/link"
import type * as React from "react"
import type { BreakdownItem, SimpleTable } from "@/lib/reports/dashboard/mock"
import { catSwatch } from "@/lib/reports/dashboard/palette"
import { cn } from "@/lib/utils"

/**
 * Period-over-period change.
 *
 * Two tones, because "up" only sometimes means "good". `neutral` (the default)
 * is a grey chip and states the fact; `progress` tints it green up / red down
 * and is used only where more genuinely is better — sales, occupancy, retention.
 * Direction is always carried by the arrow as well as the tint, so the sign
 * survives greyscale and colour-blind readers.
 */
export function DeltaChip({
  pct,
  caption = "vs comparison",
  tone = "neutral",
  lowerIsBetter = false,
}: {
  pct: number
  caption?: string | null
  tone?: "neutral" | "progress"
  /**
   * For measures where falling is the win — response time, time to book. The
   * arrow still follows the number, only the colour flips: a 23% faster first
   * response was being painted red, which reads as a problem to fix.
   */
  lowerIsBetter?: boolean
}) {
  const Icon = pct >= 0 ? ArrowUpIcon : ArrowDownIcon
  const good = lowerIsBetter ? pct <= 0 : pct >= 0
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums",
          tone === "neutral" && "bg-muted text-muted-foreground",
          tone === "progress" &&
            (good ? "bg-cami-green-2 text-cami-green-11" : "bg-destructive/10 text-destructive"),
        )}
      >
        <Icon className="size-3" aria-hidden />
        {Math.abs(pct)}%<span className="sr-only">{pct >= 0 ? " increase" : " decrease"}</span>
      </span>
      {caption ? <span className="text-xs text-muted-foreground">{caption}</span> : null}
    </span>
  )
}

/** The one number a card exists to show, with its delta beside it. */
export function HeroValue({
  value,
  deltaPct,
  deltaTone = "progress",
  footnote,
}: {
  value: string
  deltaPct?: number
  deltaTone?: "neutral" | "progress"
  footnote?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-heading text-2xl font-semibold leading-none text-foreground">
          {value}
        </span>
        {deltaPct !== undefined ? <DeltaChip pct={deltaPct} tone={deltaTone} /> : null}
      </div>
      {footnote ? <span className="text-xs text-muted-foreground">{footnote}</span> : null}
    </div>
  )
}

export function BreakdownList({ items }: { items: BreakdownItem[] }) {
  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-3 border-t border-border/50 py-2 text-sm first:border-t-0 first:pt-0"
        >
          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
            {item.slot !== undefined ? (
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-xs", catSwatch(item.slot))}
              />
            ) : null}
            <span className="truncate">{item.label}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="font-medium tabular-nums text-foreground">{item.value}</span>
            {item.deltaPct !== undefined ? (
              <DeltaChip pct={item.deltaPct} caption={null} tone="progress" />
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Compact read-only table for the tabular widgets. Deliberately not the shared
 * <Table> primitive: these are dense, always-small, never-sortable summaries
 * inside a card, and the full report they link to is the sortable version.
 */
export function MiniTable({ table, minWidth }: { table: SimpleTable; minWidth?: number }) {
  const lastIndex = table.rows.length - 1
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {table.columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "whitespace-nowrap border-b border-border pb-2 pr-4 text-xs font-medium text-muted-foreground last:pr-0",
                  col.align === "right" ? "text-right" : "text-left",
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rowIndex) => (
            <tr
              key={row[table.columns[0].key]}
              className={cn(
                table.emphasiseLastRow && rowIndex === lastIndex && "bg-muted/40 font-medium",
              )}
            >
              {table.columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap border-b border-border/50 py-2.5 pr-4 tabular-nums text-foreground last:pr-0",
                    col.align === "right" ? "text-right" : "text-left",
                  )}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function InlineStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-heading text-lg font-semibold leading-none text-foreground">
        {value}
      </span>
      {sub ? <span className="text-xs">{sub}</span> : null}
    </p>
  )
}

export type CompositionPart = { label: string; value: number; slot: number }

/**
 * A single stacked bar showing how one number splits. Used under a funnel so
 * the split visibly belongs to the stage above it — a plain two-row list left
 * the reader to notice that the parts happened to sum to the bar's total.
 */
export function CompositionBar({ caption, parts }: { caption: string; parts: CompositionPart[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Count only. The caption states the total, so a share beside each count
          repeated the same fact — and "86  83%" with no separator read as one
          string rather than two numbers. */}
      <span className="text-xs text-muted-foreground">{caption}</span>
      <ul className="flex flex-col">
        {parts.map((part) => (
          <li
            key={part.label}
            className="flex items-center justify-between gap-3 border-t border-border/50 py-1.5 text-sm first:border-t-0 first:pt-0"
          >
            <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <span
                aria-hidden
                className={cn("size-2 shrink-0 rounded-xs", catSwatch(part.slot))}
              />
              <span className="truncate">{part.label}</span>
            </span>
            <span className="shrink-0 font-medium tabular-nums text-foreground">{part.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export type StatTile = { label: string; value: string; sub?: string }

export function TileRow({ tiles, columns = 4 }: { tiles: StatTile[]; columns?: 1 | 2 | 3 | 4 }) {
  return (
    <div
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-3",
        columns === 4 && "grid-cols-2 lg:grid-cols-4",
      )}
    >
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="flex flex-col gap-1.5 rounded-xl border border-border/60 bg-muted/30 p-3"
        >
          <span className="text-xs text-muted-foreground">{tile.label}</span>
          <span className="font-heading text-lg font-semibold leading-none text-foreground">
            {tile.value}
          </span>
          {tile.sub ? <span className="text-xs text-muted-foreground">{tile.sub}</span> : null}
        </div>
      ))}
    </div>
  )
}

/** Initials bubble used by the leaderboard, matching the app's avatar chips. */
export function Initials({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-[10px] font-semibold text-cami-violet-11"
    >
      {initials}
    </span>
  )
}

export function DashCard({
  title,
  viewReportId,
  scopeNote,
  className,
  children,
}: {
  title: string
  viewReportId?: string
  /** e.g. "Your row only" when a staff member is previewing a limited widget. */
  scopeNote?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
          {scopeNote ? <span className="text-xs text-muted-foreground">{scopeNote}</span> : null}
        </div>
        {viewReportId ? (
          <Link
            href={`/reports/${viewReportId}`}
            className="shrink-0 text-sm font-medium text-cami-violet-11 hover:underline"
          >
            View report
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  )
}
