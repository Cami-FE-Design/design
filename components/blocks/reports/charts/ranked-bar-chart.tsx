"use client"

// Ranked horizontal bars — "which of these is biggest" (booking channels,
// closed-lost reasons, open-inquiry age). Horizontal because the category
// names are words, not dates: rotated x-axis labels are the single most common
// way a bar chart becomes unreadable.
//
// Bars carry a categorical slot so a channel keeps its colour wherever it
// appears on the dashboard (colour follows the entity, never its rank).
//
// Each bar sits in a track, the same as the funnel's. Without one the rows were
// short marks floating in white space with no sense of what the full width
// meant — and the funnel on the same page already had a track, so one shape was
// being drawn two ways.

import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { catVar } from "@/lib/reports/dashboard/palette"

/** Two-line axis label, so a word like "Chose competitor" doesn't get rotated
 *  or clipped under a column. */
function WrappedTick({ x, y, payload }: { x?: number; y?: number; payload?: { value: string } }) {
  const words = (payload?.value ?? "").split(" ")
  const mid = Math.ceil(words.length / 2)
  const lines =
    words.length > 1 ? [words.slice(0, mid).join(" "), words.slice(mid).join(" ")] : words
  return (
    // The offset lives on the first tspan, not on <text>: a dy on the text plus
    // a dy of 0 on the first tspan cancel each other, which left the labels
    // sitting on the baseline with no air under the bars.
    <text x={x} y={y} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 18 : 14}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

export type RankedDatum = { label: string; value: number; slot: number }

function RankedTooltip({
  active,
  payload,
  total,
  formatValue,
}: {
  active?: boolean
  payload?: Array<{ payload: RankedDatum }>
  total: number
  formatValue: (n: number) => string
}) {
  const datum = payload?.[0]?.payload
  if (!active || !datum) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <div className="font-medium text-foreground">{datum.label}</div>
      <div className="tabular-nums text-muted-foreground">
        <span className="text-foreground">{formatValue(datum.value)}</span> ·{" "}
        {Math.round((datum.value / total) * 100)}% of total
      </div>
    </div>
  )
}

export function RankedBarChart({
  data,
  formatValue,
  labelWidth = 130,
  unit,
  orientation = "bar",
}: {
  data: RankedDatum[]
  formatValue: (n: number) => string
  labelWidth?: number
  /** What the numbers count, e.g. "conversations". Without it a bare 38 on a
   *  bar says nothing about what was measured — and that gap is what makes a
   *  ranked list feel unreadable. The axis and gridlines carry the scale, the
   *  labels on the bars carry the precise figure — the same split the line
   *  charts on this page use. */
  unit?: string
  /** "column" stands the bars up. Word labels have to wrap under the axis, so
   *  it costs horizontal room per category — kept as a prop so the two can be
   *  compared rather than argued about. */
  orientation?: "bar" | "column"
}) {
  const [active, setActive] = useState<number | null>(null)
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const max = Math.max(...data.map((d) => d.value), 1)
  // Round the axis up to a clean step, or the padded maximum becomes a tick and
  // the scale ends on something like 39.9.
  const step = 10 ** Math.floor(Math.log10(max)) / 2
  const axisMax = Math.ceil((max * 1.05) / step) * step

  if (orientation === "column") {
    return (
      <figure className="flex w-full flex-1 flex-col gap-2">
        {unit ? <figcaption className="text-xs text-muted-foreground">{unit}</figcaption> : null}
        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height="100%" minHeight={260}>
            <BarChart
              data={data}
              margin={{ top: 8, right: 4, left: 0, bottom: 4 }}
              onMouseMove={(state) =>
                setActive(
                  typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null,
                )
              }
              onMouseLeave={() => setActive(null)}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
              <XAxis
                dataKey="label"
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={<WrappedTick />}
                height={54}
              />
              <YAxis
                domain={[0, axisMax]}
                allowDecimals={false}
                width={36}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => formatValue(Number(v))}
              />
              <Tooltip
                cursor={false}
                content={<RankedTooltip total={total} formatValue={formatValue} />}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44} isAnimationActive={false}>
                {data.map((d, i) => (
                  <Cell
                    key={d.label}
                    fill={catVar(d.slot)}
                    fillOpacity={active === null || active === i ? 1 : 0.3}
                  />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  offset={6}
                  fill="var(--muted-foreground)"
                  fontSize={11}
                  formatter={(v) => formatValue(Number(v))}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    )
  }

  return (
    <figure className="flex w-full flex-1 flex-col gap-2">
      {unit ? <figcaption className="text-xs text-muted-foreground">{unit}</figcaption> : null}
      <div
        className="w-full flex-1"
        role="img"
        aria-label={data.map((d) => `${d.label}: ${formatValue(d.value)}`).join(", ")}
      >
        <ResponsiveContainer width="100%" height="100%" minHeight={data.length * 38 + 28}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 44, left: 0, bottom: 4 }}
            barCategoryGap={6}
            // Both the tooltip and the dimming read the same active index.
            // Driving the dimming off the <Bar> instead meant the tooltip fired
            // anywhere in the row band while the highlight only fired on the bar
            // rect itself — two hover behaviours with two different hit areas.
            onMouseMove={(state) =>
              setActive(
                typeof state?.activeTooltipIndex === "number" ? state.activeTooltipIndex : null,
              )
            }
            onMouseLeave={() => setActive(null)}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.6} />
            <XAxis
              type="number"
              domain={[0, axisMax]}
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              tickFormatter={(v) => formatValue(Number(v))}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={labelWidth}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            {/* No cursor band. Recharts draws it across the whole plot, so it
                highlighted the empty space to the right of a bar rather than the
                bar, and a grey slab behind a pastel fill muddied its colour.
                Hovering dims the other bars instead — the same behaviour as the
                donut. */}
            <Tooltip
              cursor={false}
              content={<RankedTooltip total={total} formatValue={formatValue} />}
            />
            <Bar dataKey="value" radius={4} barSize={20} isAnimationActive={false}>
              {data.map((d, i) => (
                <Cell
                  key={d.label}
                  fill={catVar(d.slot)}
                  fillOpacity={active === null || active === i ? 1 : 0.3}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                fill="var(--muted-foreground)"
                fontSize={11}
                formatter={(v) => formatValue(Number(v))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
