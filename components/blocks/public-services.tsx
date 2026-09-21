import { formatDuration, formatPriceAed, type PublicBusiness } from "@/lib/public-business"
import type { PublicServiceGroup } from "@/lib/public-offering"

/**
 * A location's menu, as a client reads it.
 *
 * `groups` is what a branch of the chain passes: its offering resolved from the
 * one catalog, per category (R15). Without it the section falls back to the
 * business's flat list, which is what a single-site business with its own
 * hand-written menu still uses.
 *
 * Grouped rather than one long list because the flow groups too — a client
 * should see the same shape before and after they press Book now.
 */
export function PublicServices({
  business,
  groups,
}: {
  business: PublicBusiness
  groups?: PublicServiceGroup[]
}) {
  const resolved: PublicServiceGroup[] =
    groups ??
    (business.services.length > 0
      ? [{ id: "all", name: "Services", services: [...business.services] }]
      : [])

  if (resolved.length === 0) return null

  // One category is not a grouping — it is just the list, so its heading is
  // dropped and the section heading carries it.
  const showGroupHeadings = resolved.length > 1

  return (
    <section id="services" aria-labelledby="services-heading" className="flex flex-col gap-5">
      <h2 id="services-heading" className="text-base font-semibold text-foreground">
        Services
      </h2>

      {resolved.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          {showGroupHeadings ? (
            <h3 className="text-sm font-semibold text-foreground">{group.name}</h3>
          ) : null}

          <ul className="flex flex-col divide-y divide-border">
            {group.services.map((service) => (
              <li
                key={service.id}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDuration(service.durationMinutes)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-medium text-foreground tabular-nums">
                  {formatPriceAed(service.priceAed)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
