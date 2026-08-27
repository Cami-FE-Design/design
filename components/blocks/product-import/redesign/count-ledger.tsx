"use client"

// The counts for a file, as one card that is always present and always the same
// shape — used by both the Review step and the Done step so the two never drift
// (DSG-80).
//
// Review used to own this layout privately, which is how the Done step ended up
// with a different one: centred, lookup-only, and absent entirely when a file
// created no brands or categories. Same card, same rules, both places.

import { cn } from "@/lib/utils"

export type LedgerEntry = {
  value: number
  label: string
  /** Text colour for the number, for the entries that carry a warning. */
  tone?: string
}

export function CountLedger({ entries }: { entries: LedgerEntry[] }) {
  const shown = entries.filter((e) => e.value > 0)
  if (shown.length === 0) return null

  return (
    <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 rounded-2xl border border-border/60 bg-card px-4 py-3.5">
      {shown.map((entry, i) => (
        <span key={entry.label} className="flex items-baseline gap-1.5">
          <span
            className={cn(
              "font-heading font-semibold tabular-nums",
              i === 0 ? "text-2xl" : "text-lg",
              entry.tone ?? "text-foreground",
            )}
          >
            {entry.value.toLocaleString("en-US")}
          </span>
          <span className="text-sm text-muted-foreground">{entry.label}</span>
        </span>
      ))}
    </div>
  )
}
