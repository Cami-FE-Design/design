"use client"

// Lightweight, dependency-free time-series line chart with a current-vs-
// comparison overlay — for the Performance dashboard. Two series distinguished
// by colour (brand violet vs muted grey) AND a legend + direct labels, so
// identity is never colour-alone. Recessive gridlines, 2px lines, small
// markers with native tooltips. Theme-aware via design tokens.

import type { SeriesPoint } from "@/lib/reports/mock"

const W = 720
const H = 240
const PAD = { top: 12, right: 24, bottom: 28, left: 52 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom
const TICKS = 4

function niceMax(max: number) {
  if (max <= 0) return 100
  const step = 10 ** Math.floor(Math.log10(max))
  return Math.ceil(max / step) * step
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
  const max = niceMax(Math.max(...data.map((d) => Math.max(d.current, d.comparison)), 0))
  const n = data.length

  const x = (i: number) => PAD.left + (n <= 1 ? 0 : (i / (n - 1)) * PLOT_W)
  const y = (v: number) => PAD.top + PLOT_H - (v / max) * PLOT_H

  const toPoints = (key: "current" | "comparison") =>
    data.map((d, i) => `${x(i)},${y(d[key])}`).join(" ")

  const yTicks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * i)
  // Label roughly every other x point to avoid crowding.
  const labelEvery = Math.ceil(n / 6)

  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${currentLabel} vs ${comparisonLabel}`}
      >
        {/* gridlines + y labels */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(t)}
              y2={y(t)}
              className="stroke-border/60"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              dominantBaseline="middle"
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatValue(Math.round(t))}
            </text>
          </g>
        ))}

        {/* x labels */}
        {data.map((d, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text
              key={d.label}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {d.label}
            </text>
          ) : null,
        )}

        {/* comparison series (behind, muted, dashed) */}
        <polyline
          points={toPoints("comparison")}
          fill="none"
          className="stroke-muted-foreground/40"
          strokeWidth={2}
          strokeDasharray="4 4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* current series (front, brand accent) */}
        <polyline
          points={toPoints("current")}
          fill="none"
          className="stroke-cami-violet-9"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) => (
          <circle key={d.label} cx={x(i)} cy={y(d.current)} r={2.5} className="fill-cami-violet-9">
            <title>{`${d.label}: ${formatValue(d.current)}`}</title>
          </circle>
        ))}
      </svg>

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
