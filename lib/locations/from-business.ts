/**
 * A business's branches, as the operator's estate (blueprint §02).
 *
 * ## Why this has to exist
 *
 * Business identity sits above location on the blueprint's data-ownership
 * planes: a branch is scoped by the business, never the other way round. The
 * layout's own comment said exactly that while seeding one fixed estate, so
 * signing the demo into Sota left the switcher offering Shampooch's nine
 * branches under a Sota heading. A comment that claims a rule the code does not
 * keep is worse than no comment, because the next reader believes it.
 *
 * This is not the franchise view the PRD puts out of scope. That is one
 * operator reading *across* businesses. This is the ordinary containment every
 * tenant model has: the branches you can stand in are the ones belonging to the
 * business you are signed into.
 *
 * ## Authored wins, otherwise derive
 *
 * Shampooch's estate is written by hand because its branches carry facts no
 * public record has and no rule could invent — one suspended, one holding its
 * own timezone, one whose public name is a mall rather than its district. Those
 * are the fixtures the multi-location screens are reviewed against, so they are
 * used as they are.
 *
 * A business with no authored estate gets one derived from its public branches,
 * and the fields a branch does not carry come from the business — email, owner,
 * trading name, invoicing. That is not a workaround: those *are* business-level
 * facts, which is why a branch never had them.
 *
 * Deriving rather than authoring also keeps the second and third businesses
 * honest. They have no per-branch stock, no rota and no terminals, and a demo
 * that invented some would be showing a state nobody specified.
 */

import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import type { Location } from "@/lib/locations/types"
import type { PublicBranch, PublicBusiness } from "@/lib/public-business"

/** The hand-written estate, by branch id. */
const AUTHORED: ReadonlyMap<string, Location> = new Map(
  NINE_BRANCH_ESTATE.map((location) => [location.id, location]),
)

/**
 * One branch, as a Location.
 *
 * `isPublished: false` becomes `suspended` rather than `archived`: a branch
 * kept off the public surfaces is still trading for the operator, and archived
 * is the end of a branch's life (R12, SU1.5). Guessing the heavier one would
 * make a branch look closed that nobody closed.
 */
function derive(business: PublicBusiness, branch: PublicBranch): Location {
  const district = branch.name ?? business.displayName
  return {
    id: branch.id,
    // The operator's name for it, which is how every other estate reads:
    // the business, then the thing that tells its branches apart.
    name: `${business.displayName} ${district}`,
    slug: branch.slug,
    phone: branch.phone ?? business.phone,
    email: business.email,
    location: {
      address: branch.street ?? business.street,
      aptSuite: "",
      district,
      city: branch.city ?? business.city,
      state: branch.emirate ?? business.emirate,
      postcode: "",
      country: "United Arab Emirates",
    },
    // Not invented. A pin is a surveyed fact, and a plausible one on the wrong
    // building is worse than an empty map (the address field still reads).
    mapPin: null,
    businessType: [...business.categories],
    invoicing: {
      // Inherited, and marked as inherited — the same shape tax identity
      // resolves in, so an owner who overrides one branch can see which.
      sameAsLocation: true,
      companyName: business.businessName,
      address: branch.street ?? business.street,
      aptSuite: "",
      city: branch.city ?? business.city,
      state: branch.emirate ?? business.emirate,
      postcode: "",
      vatNumber: "",
      invoiceNote: "",
    },
    status: branch.isPublished ? "live" : "suspended",
    hours: branch.hours ?? business.hours,
    ownerName: business.businessName,
    ownerEmail: business.email,
    photoUrl: business.logoUrl ?? `https://picsum.photos/seed/${branch.slug}/80`,
    // No timezone: absent is inheritance from the business default, and a
    // branch that merely matches today's default is a different state from one
    // that deliberately differs (R19).
  }
}

/** This business's estate, in the order its record lists its branches. */
export function locationsForBusiness(business: PublicBusiness): Location[] {
  return business.branches.map((branch) => AUTHORED.get(branch.id) ?? derive(business, branch))
}

/**
 * Whether a stored scope or grant still means anything here.
 *
 * Both persist across a business switch, and an id from the business you have
 * left resolves to nothing — a scope pointing at `shampooch-jvc` while signed
 * into Sota leaves every screen empty with no way to tell that from a business
 * with no branches. Checked rather than cleared blindly, so a switch there and
 * back keeps what the session had.
 */
export function idsWithin(estate: ReadonlyArray<Location>, ids: ReadonlyArray<string>): string[] {
  return ids.filter((id) => estate.some((l) => l.id === id))
}
