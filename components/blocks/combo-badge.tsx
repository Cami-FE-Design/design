import { LayersIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * The one visual identifier for a combo (PRD-143).
 *
 * Combos travel in the same lists as single services — the service menu, the
 * appointment service pickers, the services on a booking — and before this the
 * only tell was the name. Every surface uses this badge so a combo reads the
 * same wherever it turns up: tinted (cami-violet, the same soft treatment as
 * the membership chip), a layers icon, and the word.
 *
 * `size="sm"` is for dense rows (the reorder sheet, the calendar popover);
 * `md` for the roomier cards and picker rows.
 *
 * Pass `name` on a booked line, where the useful fact is *which* combo the
 * service came out of — the icon and the tint still carry "this is a combo".
 */
export function ComboBadge({
  size = "md",
  name,
  className,
}: {
  size?: "sm" | "md"
  name?: string
  className?: string
}) {
  return (
    <Badge variant="primary-soft" size={size} className={cn("gap-1", className)}>
      <LayersIcon data-icon="inline-start" aria-hidden />
      {name ?? "Combo"}
    </Badge>
  )
}

/** "3 services" / "1 service" — the count that sits under a combo's name. */
export function comboServicesLabel(count: number): string {
  return `${count} service${count === 1 ? "" : "s"}`
}
