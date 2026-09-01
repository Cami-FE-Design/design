"use client"

// Funnel — stage-by-stage conversion (booking funnel, WhatsApp funnel).
//
// One row per stage, following the draft: label column, a proportional fill in
// a track with the count set inside it, and the drop-off called out on the
// right. The word "drop-off" stays — beside a stage count, a bare −44% reads as
// another figure about that stage rather than the loss since the one above.
//
// Only the WORST drop-off is red. Every stage of a funnel loses people, so
// marking all of them destructive made five ordinary numbers look like five
// errors and left nothing to mark the one worth acting on.
//
// Labels are left-aligned in a fixed column and wrap to two lines, so every bar
// starts at the same x no matter how long a stage name is.
//
// Plain markup, not recharts — a proportional fill in a track is a div, and the
// draft drew it the same way.

import { formatNumber } from "@/lib/format"
import type { FunnelStage } from "@/lib/reports/dashboard/mock"
import { catSwatch } from "@/lib/reports/dashboard/palette"
import { cn } from "@/lib/utils"

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const top = stages[0]?.value ?? 0
  const drops = stages.map((stage, i) =>
    i === 0 ? null : Math.round((1 - stage.value / stages[i - 1].value) * 100),
  )
  const worstDrop = Math.max(...drops.map((d) => d ?? 0))

  return (
    <figure className="flex flex-1 flex-col justify-center gap-2.5">
      {stages.map((stage, i) => {
        const dropPct = drops[i]
        // A floor, so the shortest stage still has room for its own count.
        const sharePct = top ? Math.max(18, Math.round((stage.value / top) * 100)) : 0

        return (
          <div key={stage.label} className="grid grid-cols-[7rem_1fr_auto] items-center gap-x-3">
            <span className="text-xs leading-snug text-muted-foreground">{stage.label}</span>
            <span className="flex h-7 w-full overflow-hidden rounded-md bg-muted">
              <span
                className={cn("flex items-center rounded-md px-2.5", catSwatch(stage.slot))}
                style={{ width: `${sharePct}%` }}
              >
                <span className="text-xs font-semibold tabular-nums text-sand-12">
                  {formatNumber(stage.value)}
                </span>
              </span>
            </span>
            <span
              className={cn(
                "w-24 text-right text-xs tabular-nums",
                dropPct === worstDrop ? "font-medium text-destructive" : "text-muted-foreground",
              )}
            >
              {dropPct !== null ? `−${dropPct}% drop-off` : ""}
            </span>
          </div>
        )
      })}
    </figure>
  )
}
