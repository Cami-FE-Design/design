import type { MockServiceCatalogItem } from "@/app/appointments/mock"
import { SERVICE_CATEGORY_ACCENT } from "@/app/appointments/mock"
import { cn } from "@/lib/utils"

/**
 * The colored rail on a service row in the appointment pickers and on the
 * appointment sheet's selected-services list.
 *
 * The six demo categories carry a Tailwind class; an item bridged in from the
 * service catalog (a combo created on the service menu) carries its merchant
 * category's hex instead, because that palette is data, not classes.
 */
export function ServiceAccentRail({
  item,
  className,
}: {
  item: Pick<MockServiceCatalogItem, "category" | "accentHex">
  className?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "w-1 shrink-0 self-stretch rounded-full",
        item.accentHex ? undefined : SERVICE_CATEGORY_ACCENT[item.category],
        className,
      )}
      style={item.accentHex ? { backgroundColor: item.accentHex } : undefined}
    />
  )
}
