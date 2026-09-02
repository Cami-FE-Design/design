"use client"

// Donut — part-to-whole splits on the Performance dashboard (payment type,
// acquisition channel). Uses recharts (project standard for report charts).
//
// A donut earns its place only when the split is the point and the categories
// are few; the legend beside it carries the exact figures, so nobody has to
// judge an angle. Identity is never colour-alone — every arc is repeated as a
// labelled row in the legend list.
//
// Hover does NOT use a floating tooltip. The ring is only 160px across and its
// hole carries the running total, so a tooltip either covers that total or
// floats off the card. Instead the hole itself is the readout: hovering a slice
// swaps the total for that slice's name, amount and share, dims the other arcs,
// and lights up its legend row. Hovering the legend does the same in reverse.

import { useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import type { BreakdownItem } from "@/lib/reports/dashboard/mock"
import { catSwatch, catVar } from "@/lib/reports/dashboard/palette"
import { cn } from "@/lib/utils"

type DonutDatum = { label: string; value: number; slot: number }

export function DonutChart({
  items,
  values,
  centreLabel,
  centreValue,
  formatValue,
  wide = false,
}: {
  /** Legend rows — label, pre-formatted value and palette slot. */
  items: BreakdownItem[]
  /** Numeric magnitudes, in the same order as `items`. */
  values: number[]
  centreLabel: string
  centreValue: string
  /** Formats a slice's raw magnitude for the centre readout. */
  formatValue: (n: number) => string
  /** Ring beside the legend instead of above it — for wider cards. */
  wide?: boolean
}) {
  const [active, setActive] = useState<number | null>(null)
  const total = values.reduce((sum, v) => sum + v, 0)
  const data: DonutDatum[] = items.map((item, i) => ({
    label: item.label,
    value: values[i],
    slot: item.slot ?? i,
  }))
  const hovered = active === null ? null : data[active]

  return (
    <figure className={cn("flex flex-col items-center gap-4", wide && "sm:flex-row sm:gap-10")}>
      <div
        className="relative size-40 shrink-0"
        role="img"
        aria-label={`${centreLabel}: ${items.map((i) => `${i.label} ${i.value}`).join(", ")}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="78%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              // A hairline of surface between segments so two adjacent pastels
              // never read as one arc — small, because the ring is thin.
              paddingAngle={0.8}
              stroke="var(--color-card)"
              strokeWidth={1.5}
              isAnimationActive={false}
              onMouseEnter={(_, index) => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              {data.map((d, i) => (
                <Cell
                  key={d.label}
                  fill={catVar(d.slot)}
                  fillOpacity={active === null || active === i ? 1 : 0.3}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-7 text-center">
          {hovered ? (
            <>
              <span className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">
                {hovered.label}
              </span>
              <span className="font-heading text-base font-semibold leading-none text-foreground">
                {formatValue(hovered.value)}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {Math.round((hovered.value / total) * 100)}%
              </span>
            </>
          ) : (
            <>
              <span className="font-heading text-lg font-semibold leading-none text-foreground">
                {centreValue}
              </span>
              <span className="text-xs text-muted-foreground">{centreLabel}</span>
            </>
          )}
        </div>
      </div>

      <figcaption className="w-full min-w-0">
        {/* One column, always. The wide layout used two, which truncated the
            longer labels ("CamiPay — Onli…") and gave each column its own value
            edge, so the amounts no longer lined up. Beside the ring there is
            room for a single full-width column, and four rows read down as
            fast as they read across. */}
        <ul className="flex flex-col">
          {items.map((item, i) => (
            <li
              key={item.label}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "-mx-2 flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                // Dividers are back in every layout: they were suppressed for a
                // two-column grid where `first:` matched the list's first item
                // rather than each column's, drawing a stray rule. The legend
                // is one column now, so the rule behaves.
                "border-t border-border/50 first:border-t-0",
                active === i && "bg-muted/60",
              )}
            >
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden
                  className={cn("size-2 shrink-0 rounded-xs", catSwatch(item.slot ?? i))}
                />
                <span className="truncate">{item.label}</span>
              </span>
              {/* The share gets a fixed column. Right-aligning the pair let a
                  two-digit share push the amount left of a one-digit one, so
                  "AED 300 3%" and "AED 1,340 13%" ended on different edges. */}
              <span className="flex shrink-0 items-baseline gap-3">
                <span className="font-medium tabular-nums text-foreground">{item.value}</span>
                <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                  {Math.round((values[i] / total) * 100)}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  )
}
