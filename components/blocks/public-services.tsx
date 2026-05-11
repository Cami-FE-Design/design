import { formatDuration, formatPriceAed, type PublicBusiness } from "@/lib/public-business"

export function PublicServices({ business }: { business: PublicBusiness }) {
  if (business.services.length === 0) return null

  return (
    <section id="services" aria-labelledby="services-heading" className="flex flex-col gap-3">
      <h2 id="services-heading" className="text-base font-semibold text-foreground">
        Services
      </h2>

      <ul className="flex flex-col divide-y divide-border">
        {business.services.map((service) => (
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
    </section>
  )
}
