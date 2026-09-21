import {
  type CatalogService,
  findCatalogService,
  SERVICE_CATEGORIES,
  type ServiceCategory,
} from "@/lib/booking"
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

/**
 * The same resolution, in the booking flow's own shape (R15).
 *
 * `publicMenuForLocation` above answers "what does this branch charge", which
 * is a price list. The flow needs more than a price list: combos, the small
 * qualifier next to a duration, and the component ids a bundle books as. So
 * this returns `ServiceCategory[]` rather than dropping those fields.
 *
 * Why it exists at all: R15 says both entry paths "yield that Location's
 * offering", and only one of them did. The branch page resolved per branch
 * while the flow read the business default straight off the module, so an
 * operator could set JVC's full groom to 240, see 240 on the branch page, press
 * Book now, and be quoted 260 — the page and the flow disagreeing about the
 * same branch, which is worse than either being wrong alone.
 */
export function bookingCatalogForLocation(
  locationId: string,
  offerings?: ReadonlyArray<LocationOffering>,
): ServiceCategory[] {
  const resolveService = (service: CatalogService): CatalogService | null => {
    const resolved = resolveOffering(
      {
        priceType: "Fixed",
        price: service.priceAed,
        duration: service.durationMinutes,
      },
      findOffering(service.id, locationId, offerings),
    )
    if (!resolved.enabled) return null
    return { ...service, priceAed: resolved.price, durationMinutes: resolved.duration }
  }

  /**
   * A combo goes only where every component goes. A bundle whose parts this
   * branch does not do is not a cheaper option, it is an unfulfillable one —
   * and offering it would book work the branch cannot deliver.
   */
  const canFulfil = (service: CatalogService): boolean =>
    (service.componentIds ?? []).every((componentId) => {
      const component = findCatalogService(componentId)
      // An id with no service behind it is a broken bundle, not a fulfillable
      // one — treated as absent rather than silently skipped.
      return component ? resolveService(component) !== null : false
    })

  return SERVICE_CATEGORIES.map((category) => ({
    ...category,
    services: category.services
      .map(resolveService)
      .filter((service): service is CatalogService => service !== null)
      .filter((service) => !service.isCombo || canFulfil(service)),
  })).filter((category) => category.services.length > 0)
}
