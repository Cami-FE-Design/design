import { SERVICE_CATEGORIES } from "@/lib/booking"
import type { PublicService } from "@/lib/public-business"
import {
  findOffering,
  type LocationOffering,
  resolveOffering,
} from "@/lib/service-catalog/offerings"

/**
 * What a branch actually offers, as a client sees it (R06, R15, DW3.3).
 *
 * ## Why this module exists
 *
 * The public page used to carry its own hand-written service list, and the
 * booking flow read a second one. The five services on the page were an exact
 * subset of the flow's ids, copied across by hand — so the page and the flow
 * agreed only for as long as somebody kept them in step, and a branch's price
 * override had to be written twice to be visible in both.
 *
 * R15 says both entry paths "yield that Location's offering", singular. One
 * catalog, resolved per branch, is what makes that true by construction rather
 * than by diligence.
 *
 * ## Grouped, and complete
 *
 * The page now lists the branch's whole offering rather than a curated five.
 * The curation was itself a shortcut: a client choosing between branches is
 * comparing what each one does, and a page showing five of nineteen services
 * answers that wrongly. Grouping by category is how the booking flow already
 * presents it, so a client sees the same shape before and after they press
 * Book now.
 *
 * ## Combos are excluded here
 *
 * A combo is a bundle the flow expands into its component services (PRD-143).
 * On a price list it would double-count — the components are already listed —
 * so the page shows the services and the flow offers the bundle.
 */

export type PublicServiceGroup = {
  id: string
  name: string
  description?: string
  services: PublicService[]
}

/**
 * Resolve one branch's menu, category by category.
 *
 * A category with nothing left in it is dropped: a branch that offers no
 * daycare should not show an empty "Daycare" heading, which reads as an
 * omission rather than a decision.
 */
export function publicMenuForLocation(
  locationId: string,
  /**
   * The offerings to resolve against. Defaults to the module seed, which is
   * what a server render has; a client passes the store's, so an operator's
   * override reaches the page it is about.
   */
  offerings?: ReadonlyArray<LocationOffering>,
): PublicServiceGroup[] {
  return SERVICE_CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    services: category.services
      // A combo books as its components, which are listed individually.
      .filter((service) => !service.isCombo)
      .map((service) => {
        const offering = findOffering(service.id, locationId, offerings)
        const resolved = resolveOffering(
          {
            priceType: "Fixed",
            price: service.priceAed,
            duration: service.durationMinutes,
          },
          offering,
        )
        return { service, resolved }
      })
      // Turned off at this branch, so absent rather than shown as unavailable.
      .filter(({ resolved }) => resolved.enabled)
      .map(
        ({ service, resolved }): PublicService => ({
          id: service.id,
          name: service.name,
          description: service.description ?? "",
          durationMinutes: resolved.duration,
          priceAed: resolved.price,
        }),
      ),
  })).filter((group) => group.services.length > 0)
}

/** The same menu flattened, for surfaces that do not group. */
export function publicServicesForLocation(
  locationId: string,
  offerings?: ReadonlyArray<LocationOffering>,
): PublicService[] {
  return publicMenuForLocation(locationId, offerings).flatMap((group) => group.services)
}
