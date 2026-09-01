"use client"

// Capacity heatmap — utilisation % by day × hour.
//
// Built as a CSS grid rather than with recharts: a matrix of labelled cells is
// a table of magnitudes, and recharts has no heatmap mark, so wiring one out of
// scatter points would fight the library for a worse result. The ramp is
// sequential (one hue, light → dark) and deliberately drawn from the blue scale
// that backs --chart-1..5, so a heat reading can never be mistaken for one of
// the categorical series elsewhere on the dashboard.
//
// The percentage is printed in every cell, so the encoding is never colour
// alone — a colourblind or greyscale reader gets the same answer.

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { HEAT_INK_FLIPS_AT, HEAT_RAMP, heatStep } from "@/lib/reports/dashboard/palette"
import { cn } from "@/lib/utils"

export function CapacityHeatmap({
  rowLabels,
  colLabels,
  matrix,
}: {
  rowLabels: string[]
  colLabels: string[]
  /** matrix[row][col] — utilisation as a 0–1 fraction. */
  matrix: number[][]
}) {
  return (
    <figure className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <div
          className="grid min-w-[520px] gap-1"
          style={{ gridTemplateColumns: `56px repeat(${colLabels.length}, minmax(0, 1fr))` }}
        >
          <div aria-hidden />
          {colLabels.map((col) => (
            <div key={col} className="pb-1 text-center text-xs font-medium text-muted-foreground">
              {col}
            </div>
          ))}

          {rowLabels.map((row, r) => (
            <div key={row} className="contents">
              <div className="flex items-center text-xs text-muted-foreground">{row}</div>
              {colLabels.map((col, c) => {
                const value = matrix[r][c]
                const step = heatStep(value)
                return (
                  <Tooltip key={`${row}-${col}`}>
                    <TooltipTrigger
                      className={cn(
                        // Hover darkens the cell; it used to draw a dark outline, which on a
                        // pastel cell read as a focus ring rather than a hover. The outline
                        // is still there for keyboard focus, where a hard edge is the point.
                        "flex h-7 items-center justify-center rounded text-xs tabular-nums transition-[filter,outline] outline-2 outline-offset-1 outline-transparent hover:brightness-95 focus-visible:outline-ring",
                        step >= HEAT_INK_FLIPS_AT ? "text-sand-1" : "text-sand-12",
                      )}
                      style={{ background: HEAT_RAMP[step] }}
                    >
                      {Math.round(value * 100)}
                      <span className="sr-only">
                        % booked on {col} at {row}
                      </span>
                    </TooltipTrigger>
                    {/* TooltipContent is itself `inline-flex items-center`, so
                        two children lay out side by side and a <br /> does
                        nothing — the label and the value have to arrive as one
                        flex child. */}
                    <TooltipContent className="text-xs">
                      <span className="flex flex-col items-center gap-0.5">
                        <span className="font-medium">
                          {col} · {row}
                        </span>
                        <span className="tabular-nums">{Math.round(value * 100)}% booked</span>
                      </span>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Quiet</span>
        <span className="flex gap-0.5">
          {HEAT_RAMP.map((stop, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: ramp stops are a fixed positional scale.
              key={i}
              aria-hidden
              className="size-3 rounded-xs"
              style={{ background: stop }}
            />
          ))}
        </span>
        <span>Fully booked</span>
      </figcaption>
    </figure>
  )
}
