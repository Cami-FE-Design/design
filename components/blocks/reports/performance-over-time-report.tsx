"use client"

// Performance over time — entity (team member / location) × time-period matrix
// for a chosen metric, with a bar chart of that metric per period above it.
// LIVE: the dimension, metric, granularity and date-range pills each recompute
// the chart + table. Layout mirrors Performance summary (sticky first column,
// horizontal scroll, tinted Total row); the chart is recharts (project standard).

import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { Fragment, useMemo, useState } from "react"
import {
  type DateRange,
  DateRangePopover,
  defaultRange,
} from "@/components/blocks/date-range-popover"
import { MetricBarChart } from "@/components/blocks/reports/metric-bar-chart"
import { ReportFiltersSheet } from "@/components/blocks/reports/report-filters-sheet"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatAed, formatDuration, formatNumber, formatPercent } from "@/lib/format"
import type { PerfMetricKind } from "@/lib/reports/mock"
import {
  aggregate,
  aggregateAll,
  bucketsFor,
  DEFAULT_METRIC_INDEX,
  entitiesFor,
  granularityNoun,
  PERF_DIMENSIONS,
  PERF_GRANULARITIES,
  PERF_OT_METRICS,
  type PerfDimension,
  type PerfGranularity,
} from "@/lib/reports/perf-over-time"
import type { ReportDef } from "@/lib/reports/types"
import { cn } from "@/lib/utils"

function formatMetric(kind: PerfMetricKind, value: number) {
  switch (kind) {
    case "money":
      return formatAed(value)
    case "percent":
      return formatPercent(value)
    case "duration":
      return formatDuration(value)
    default:
      return formatNumber(Math.round(value))
  }
}

/** Simple single-select pill (dimension / granularity). */
function SelectPill<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: readonly T[]
  onChange: (next: T) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {value}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {options.map((o) => (
          <DropdownMenuItem key={o} onClick={() => onChange(o)}>
            <CheckIcon className={cn("size-4", value === o ? "opacity-100" : "opacity-0")} />
            {o}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Metric pill: the full Performance summary set, grouped by section. */
function MetricPill({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const sections = useMemo(() => {
    const map = new Map<string, number[]>()
    PERF_OT_METRICS.forEach((m, i) => {
      const arr = map.get(m.section)
      if (arr) arr.push(i)
      else map.set(m.section, [i])
    })
    return [...map.entries()]
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" radius="full" size="sm" className="gap-1.5">
          {PERF_OT_METRICS[value].label}
          <ChevronDownIcon className="size-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-80 w-64 overflow-y-auto">
        {sections.map(([section, indices], si) => (
          <Fragment key={section}>
            {si > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {section}
            </DropdownMenuLabel>
            {indices.map((i) => (
              <DropdownMenuItem key={PERF_OT_METRICS[i].label} onClick={() => onChange(i)}>
                <CheckIcon className={cn("size-4", value === i ? "opacity-100" : "opacity-0")} />
                {PERF_OT_METRICS[i].label}
              </DropdownMenuItem>
            ))}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function PerformanceOverTimeReport({ report }: { report: ReportDef }) {
  const [today] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [range, setRange] = useState<DateRange>(() => defaultRange(today))
  const [dimension, setDimension] = useState<PerfDimension>("Team member")
  const [metricIndex, setMetricIndex] = useState(DEFAULT_METRIC_INDEX)
  const [granularity, setGranularity] = useState<PerfGranularity>("Day")

  const metric = PERF_OT_METRICS[metricIndex]

  const { buckets, entities, rows, totalRow, chartData } = useMemo(() => {
    const buckets = bucketsFor(range, granularity)
    const entities = entitiesFor(dimension)
    const allDays = buckets.flatMap((b) => b.days)

    const rows = entities.map((entity) => ({
      entity,
      total: aggregate(entity, metric, allDays),
      cells: buckets.map((b) => aggregate(entity, metric, b.days)),
    }))
    const totalRow = {
      total: aggregateAll(entities, metric, allDays),
      cells: buckets.map((b) => aggregateAll(entities, metric, b.days)),
    }
    const chartData = buckets.map((b) => ({
      label: b.label,
      value: aggregateAll(entities, metric, b.days),
    }))
    return { buckets, entities, rows, totalRow, chartData }
  }, [range, granularity, dimension, metric])

  // Sticky first column needs an OPAQUE bg (a translucent tint bleeds when
  // columns scroll under it) — same recipe as Performance summary.
  const stickyBase = "sticky left-0 z-10 whitespace-nowrap shadow-[1px_0_0_0_var(--border)]"
  const totalTint = "bg-[color-mix(in_oklch,var(--muted)_30%,var(--background))]"
  const fmt = (v: number) => formatMetric(metric.kind, v)

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <TableToolbar
        tabs={
          <div className="flex flex-wrap items-center gap-2">
            <SelectPill value={dimension} options={PERF_DIMENSIONS} onChange={setDimension} />
            <MetricPill value={metricIndex} onChange={setMetricIndex} />
            <SelectPill
              value={granularity}
              options={PERF_GRANULARITIES}
              onChange={setGranularity}
            />
            <DateRangePopover value={range} onChange={setRange} today={today} />
            <ReportFiltersSheet filters={report.filters ?? []} />
          </div>
        }
      />

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="mb-4 font-heading text-base font-semibold text-foreground">
          {metric.label} by {granularityNoun(granularity)}
        </h3>
        <MetricBarChart
          data={chartData}
          formatValue={fmt}
          ariaLabel={`${metric.label} by ${granularityNoun(granularity)}`}
        />
      </div>

      {/* Natural height (few entity rows) so every row shows — a flex-1 table
          got squeezed short under the chart card. Horizontal scroll (many date
          columns) still comes from the container's default overflow-x-auto. */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-20! whitespace-nowrap bg-background">
              {dimension}
            </TableHead>
            <TableHead className="whitespace-nowrap text-right">Total</TableHead>
            {buckets.map((b) => (
              <TableHead
                key={b.key}
                className="whitespace-nowrap text-right font-medium text-foreground"
              >
                {b.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Grand total row — tinted + bold, pinned first like the reference. */}
          <TableRow className={cn(totalTint, "hover:bg-transparent")}>
            <TableCell
              className={cn(stickyBase, totalTint, "text-sm font-semibold text-foreground")}
            >
              Total
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground">
              {fmt(totalRow.total)}
            </TableCell>
            {totalRow.cells.map((v, i) => (
              <TableCell
                key={buckets[i].key}
                className="whitespace-nowrap text-right text-sm font-semibold tabular-nums text-foreground"
              >
                {fmt(v)}
              </TableCell>
            ))}
          </TableRow>
          {rows.map((row) => (
            <TableRow key={row.entity}>
              <TableCell className={cn(stickyBase, "bg-background text-sm text-foreground")}>
                {row.entity}
              </TableCell>
              <TableCell className="whitespace-nowrap text-right text-sm font-medium tabular-nums text-foreground">
                {fmt(row.total)}
              </TableCell>
              {row.cells.map((v, i) => (
                <TableCell
                  key={buckets[i].key}
                  className="whitespace-nowrap text-right text-sm tabular-nums text-foreground"
                >
                  {fmt(v)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <p className="text-sm text-muted-foreground">
        Showing {entities.length} of {entities.length} results
      </p>
    </div>
  )
}
