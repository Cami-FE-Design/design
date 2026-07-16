"use client"

// Single-series bar chart for Performance over time — the selected metric summed
// (or weighted-averaged, for %) across all entities, one bar per time bucket.
// Uses recharts (project standard for report charts). Theme-aware via design
// tokens; the tooltip formats by the metric's kind.

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type BarPoint = { label: string; value: number }

function ChartTooltip({
  active,
  payload,
  label,
  formatValue,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
  formatValue: (n: number) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-foreground">{label}</div>
      <div className="tabular-nums text-muted-foreground">{formatValue(payload[0].value)}</div>
    </div>
  )
}

export function MetricBarChart({
  data,
  formatValue,
  ariaLabel,
}: {
  data: BarPoint[]
  formatValue: (n: number) => string
  ariaLabel: string
}) {
  return (
    <div className="h-64 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={16}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          />
          <YAxis
            width={64}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => formatValue(Number(v))}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
            content={<ChartTooltip formatValue={formatValue} />}
          />
          <Bar
            dataKey="value"
            fill="var(--color-cami-violet-9)"
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
