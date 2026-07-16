"use client"

// Time-series line chart with a current-vs-comparison overlay — for the
// Performance dashboard. Uses recharts (project standard for report charts).
// Two series distinguished by colour (brand violet vs muted grey/dashed) AND a
// legend, so identity is never colour-alone. Theme-aware via design tokens.

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { SeriesPoint } from "@/lib/reports/mock"

function LineTooltip({
  active,
  payload,
  label,
  currentLabel,
  comparisonLabel,
  formatValue,
}: {
  active?: boolean
  payload?: Array<{ dataKey: string; value: number }>
  label?: string
  currentLabel: string
  comparisonLabel: string
  formatValue: (n: number) => string
}) {
  if (!active || !payload?.length) return null
  const find = (key: string) => payload.find((p) => p.dataKey === key)?.value
  const current = find("current")
  const comparison = find("comparison")
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="mb-1 font-medium text-foreground">{label}</div>
      {current !== undefined ? (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full bg-cami-violet-9" />
          {currentLabel}:{" "}
          <span className="tabular-nums text-foreground">{formatValue(current)}</span>
        </div>
      ) : null}
      {comparison !== undefined ? (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          {comparisonLabel}:{" "}
          <span className="tabular-nums text-foreground">{formatValue(comparison)}</span>
        </div>
      ) : null}
    </div>
  )
}

export function ComparisonLineChart({
  data,
  currentLabel,
  comparisonLabel,
  formatValue,
}: {
  data: SeriesPoint[]
  currentLabel: string
  comparisonLabel: string
  formatValue: (n: number) => string
}) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="h-60 w-full" role="img" aria-label={`${currentLabel} vs ${comparisonLabel}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              width={52}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => formatValue(Number(v))}
            />
            <Tooltip
              content={
                <LineTooltip
                  currentLabel={currentLabel}
                  comparisonLabel={comparisonLabel}
                  formatValue={formatValue}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="comparison"
              stroke="var(--color-muted-foreground)"
              strokeOpacity={0.5}
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="var(--color-cami-violet-9)"
              strokeWidth={2}
              dot={{ r: 2.5, fill: "var(--color-cami-violet-9)", strokeWidth: 0 }}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <figcaption className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-cami-violet-9" />
          {currentLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/40" />
          {comparisonLabel} (Comparison)
        </span>
      </figcaption>
    </figure>
  )
}
