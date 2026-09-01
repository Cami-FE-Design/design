// One status vocabulary for the terminal fleet (DSG-82), shared by the Partner
// detail card and the fleet table so the two never drift apart. Support reads
// both in the same afternoon.
// Spec: docs/specs/DSG-82-hq-terminal-management.md

import type { HqTerminalStatus } from "@/lib/hq-terminals/store"
import { cn } from "@/lib/utils"

// "Not paired", "Locked" and "Active" are the merchant's own words from DSG-62 —
// HQ and the merchant looking at one device should read the same status. The
// three above them are fleet states the merchant never sees.
export const TERMINAL_STATUS_LABEL: Record<HqTerminalStatus, string> = {
  faulty: "Faulty",
  returned: "Returned",
  "in-stock": "In stock",
  blocked: "Blocked",
  locked: "Locked",
  "not-paired": "Not set up",
  active: "Active",
  "no-sessions": "No sessions",
}

export const TERMINAL_STATUS_DOT: Record<HqTerminalStatus, string> = {
  faulty: "bg-tomato-9",
  returned: "bg-sand-8",
  "in-stock": "bg-cami-violet-9",
  blocked: "bg-tomato-9",
  locked: "bg-tomato-9",
  "not-paired": "bg-cami-yellow-9",
  active: "bg-cami-green-9",
  "no-sessions": "bg-sand-8",
}

/** Icon tile behind the device glyph, same colour family as the dot. */
export const TERMINAL_STATUS_TILE: Record<HqTerminalStatus, string> = {
  faulty: "border-tomato-5 bg-tomato-2 text-tomato-11",
  returned: "border-border/50 bg-background text-muted-foreground",
  "in-stock": "border-cami-violet-5 bg-cami-violet-2 text-cami-violet-11",
  blocked: "border-tomato-5 bg-tomato-2 text-tomato-11",
  locked: "border-tomato-5 bg-tomato-2 text-tomato-11",
  "not-paired": "border-cami-yellow-5 bg-cami-yellow-2 text-cami-yellow-11",
  active: "border-cami-green-5 bg-cami-green-2 text-cami-green-11",
  "no-sessions": "border-border/50 bg-background text-muted-foreground",
}

/**
 * Dot + label. Fixed width so a column of these scans as a column: the labels
 * run from "Active" to "No sessions" and left the dots ragged without it.
 */
export function TerminalStatus({
  status,
  suffix,
  className,
}: {
  status: HqTerminalStatus
  /** Extra fact the status alone doesn't carry, e.g. a lockout countdown. */
  suffix?: string | null
  className?: string
}) {
  return (
    <span
      className={cn(
        "flex w-[6.5rem] shrink-0 items-center gap-1.5 text-xs leading-5 text-muted-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("size-2 shrink-0 rounded-full", TERMINAL_STATUS_DOT[status])}
      />
      <span className="truncate">
        {TERMINAL_STATUS_LABEL[status]}
        {suffix ? ` · ${suffix}` : ""}
      </span>
    </span>
  )
}
