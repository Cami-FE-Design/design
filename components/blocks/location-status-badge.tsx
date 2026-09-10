import type { LocationStatus } from "@/lib/locations/types"
import { cn } from "@/lib/utils"

/**
 * A branch's lifecycle state, wherever a branch is named (R01, R12).
 *
 * One component rather than a badge per surface, because the states carry
 * consequences an operator has to be able to read the same way everywhere:
 * `suspended` means the booking page is hidden and the calendar is off,
 * `archived` means no new writes ever again. A branch whose state is styled
 * one way in settings and another in the switcher is exactly the ambiguity
 * R11 exists to remove.
 *
 * `live` renders nothing. Trading is the unremarkable case, and badging every
 * healthy branch would make the two that need attention harder to spot.
 */
const STYLES: Record<Exclude<LocationStatus, "live">, { label: string; className: string }> = {
  suspended: {
    label: "Paused",
    className: "bg-cami-yellow-3 text-cami-yellow-11",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
  draft: {
    label: "Draft",
    className: "bg-cami-violet-3 text-cami-violet-11",
  },
}

export function LocationStatusBadge({
  status,
  className,
}: {
  status: LocationStatus
  className?: string
}) {
  if (status === "live") return null
  const { label, className: tone } = STYLES[status]
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium leading-4",
        tone,
        className,
      )}
    >
      {label}
    </span>
  )
}
