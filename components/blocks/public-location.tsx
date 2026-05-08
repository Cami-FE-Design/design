import { MapPinIcon } from "lucide-react"
import type { PublicBusiness } from "@/lib/public-business"

export function PublicLocation({ business }: { business: PublicBusiness }) {
  const fullAddress = [business.street, business.city, business.emirate].filter(Boolean).join(", ")
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  return (
    <section
      id="location"
      aria-labelledby="location-heading"
      className="flex flex-col gap-3"
    >
      <h2 id="location-heading" className="text-base font-semibold text-foreground">
        Location
      </h2>

      <a
        href={mapsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-start gap-3"
      >
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          <MapPinIcon className="size-4" aria-hidden />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground group-hover:text-cami-violet-9">
            {business.street}
          </span>
          <span className="text-xs text-muted-foreground">
            {business.city}, {business.emirate}
          </span>
        </span>
      </a>

      <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl">
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`}
          title={`Map of ${business.displayName}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
    </section>
  )
}
