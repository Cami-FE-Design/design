/**
 * What a category holds at one branch (GNK §4).
 *
 * ## The rule, and the hole it leaves
 *
 * "Categories are part of the shared service catalog, so there is one category
 * list for the whole business… A branch sees, inside each category, only the
 * services it has turned on." A branch cannot re-file a service into a
 * different category for itself either — the catalog's shape is the business's,
 * and only what is offered varies.
 *
 * Follow that and a category can end up holding nothing at a branch: the
 * business has three spa services, this branch has no spa room and has turned
 * all three off. GNK asks which way that should read, and both are defensible,
 * so both are drawn rather than one being picked here:
 *
 * - **Hidden** — the category is not in the list. A menu shows what this branch
 *   sells, and a heading over nothing is an invitation to look for something.
 * - **Shown empty** — the heading stays with a line under it. The category is
 *   still the business's, and its absence at one branch is a thing an operator
 *   might need to see, rather than a service they simply cannot find.
 *
 * The functions are the same either way; the presentation is the question.
 */

import { isOfferedAt, type LocationOffering } from "@/lib/service-catalog/offerings"

type HasCategory = { id: string; categoryId?: string | null }

/**
 * The services this branch offers, out of the ones given.
 *
 * Unconfigured means offered, so a branch nobody has touched runs the business
 * menu whole — the same rule `isOfferedAt` holds, and what makes adding branch
 * N cost nothing.
 */
export function servicesAtBranch<T extends HasCategory>(
  services: ReadonlyArray<T>,
  locationId: string,
  offerings?: ReadonlyArray<LocationOffering>,
): T[] {
  return services.filter((svc) => isOfferedAt(svc.id, locationId, offerings))
}

/** The services of one category, at one branch. */
export function categoryServicesAtBranch<T extends HasCategory>(
  services: ReadonlyArray<T>,
  categoryId: string,
  locationId: string,
  offerings?: ReadonlyArray<LocationOffering>,
): T[] {
  return servicesAtBranch(
    services.filter((svc) => svc.categoryId === categoryId),
    locationId,
    offerings,
  )
}

/**
 * Categories that hold something at the business but nothing at this branch.
 *
 * Named rather than counted, because the answer an owner wants is *which* — and
 * because a category that is empty everywhere is a different thing entirely: it
 * has no services at all, and that is a catalog to tidy, not a branch that
 * turned things off.
 */
export function emptyCategoriesAtBranch<T extends HasCategory>(
  services: ReadonlyArray<T>,
  categoryIds: ReadonlyArray<string>,
  locationId: string,
  offerings?: ReadonlyArray<LocationOffering>,
): string[] {
  return categoryIds.filter((categoryId) => {
    const all = services.filter((svc) => svc.categoryId === categoryId)
    if (all.length === 0) return false
    return categoryServicesAtBranch(services, categoryId, locationId, offerings).length === 0
  })
}
