import { CLOSED_DAY, type DaySchedule, openFor, type WeekSchedule } from "@/lib/locations/hours"
import { locationHours } from "@/lib/locations/mock"
import { publicServicesForLocation } from "@/lib/public-offering"
import type { LocationOffering } from "@/lib/service-catalog/offerings"

// Hours are location-configuration (blueprint §02), so they live with the
// location. Re-exported here because every client-facing surface already
// imports them from this module.
export {
  CLOSED_DAY,
  closingTime,
  type DaySchedule,
  formatDayHours,
  formatTime12h,
  getDayIdFromDate,
  getDaySchedule,
  isOpenNow,
  nextOpeningTime,
  openFor,
  openForShifts,
  type TimeRange,
  WEEK_DAYS,
  type WeekDay,
  type WeekSchedule,
} from "@/lib/locations/hours"

export type PublicService = {
  id: string
  name: string
  description: string
  durationMinutes: number
  priceAed: number
}

export type HeroFeatureAccent = "yellow" | "violet" | "sage" | "pink"

export type HeroFeature = {
  id: string
  eyebrow: string
  title: string
  accent: HeroFeatureAccent
}

export type PublicBusiness = {
  businessName: string
  displayName: string
  slug: string
  logoUrl?: string
  shortDescription?: string
  longDescription?: string
  street: string
  city: string
  emirate: string
  phone: string
  email: string
  categories: ReadonlyArray<string>
  isLive: boolean
  heroEyebrow: string
  heroHeadline: string
  heroHeadlineAccent: string
  heroSubhead: string
  trustBadges: ReadonlyArray<{ id: string; label: string; icon: TrustBadgeIcon }>
  heroFeatures: ReadonlyArray<HeroFeature>
  services: ReadonlyArray<PublicService>
  hours: WeekSchedule
  mapEmbedUrl?: string
  coverUrl?: string
  /**
   * The branches this business publishes. Always at least one: a single-site
   * business is a business with one branch, not a business with none, which is
   * what keeps every downstream surface from needing two code paths.
   */
  branches: ReadonlyArray<PublicBranch>
}

export type TrustBadgeIcon = "shield" | "sparkles" | "clock" | "star"

/**
 * One branch as the client sees it (R15, GB3.1, GB3.2).
 *
 * Only the fields that genuinely differ per branch live here. Everything a
 * client reads about the *brand* — name, logo, descriptions, hero, trust
 * badges — stays on the business, because a chain has one identity and nine
 * addresses, not nine identities.
 *
 * `services` is the branch's own offering, not the business menu: a branch
 * that does not do daycare should not list it, and one that charges more
 * should show its own price (R06, DW3.3). This is the public face of the
 * location offerings in lib/service-catalog/offerings.ts.
 */
export type PublicBranch = {
  id: string
  /** The branch's own shareable link: cami.app/{slug}. */
  slug: string
  /** How the branch is named to a client. Usually the area, not the brand again. */
  name: string
  street: string
  city: string
  emirate: string
  phone: string
  /**
   * Only for a business with no location record. A branch of the chain leaves
   * this absent and its hours resolve from `lib/locations`, so the hours an
   * operator sets are the hours a client reads — one source, like the menu.
   */
  hours?: WeekSchedule
  /**
   * Only for a business with no catalog modelled. A branch of the chain leaves
   * this absent and its menu is resolved from the one catalog, per branch
   * (lib/public-offering.ts) — which is what stops the client-facing price and
   * the operator-facing one drifting apart.
   */
  services?: ReadonlyArray<PublicService>
  /**
   * Whether the branch is currently taking bookings. A suspended or archived
   * branch is never published — SU1.5 hides its booking page, R12 stops its
   * writes — so it is absent from the picker rather than shown as unavailable.
   */
  isPublished: boolean
}

const closed: DaySchedule = CLOSED_DAY
const standardDay: DaySchedule = openFor("09:00", "19:00")
const weekendDay: DaySchedule = openFor("10:00", "18:00")

const SHAMPOOCH_BRAND: Omit<PublicBusiness, "branches"> = {
  businessName: "Shampooch",
  displayName: "Shampooch",
  // The business slug. Branch slugs sit in the same flat namespace
  // (cami.app/shampooch-jvc), so a branch's shareable link stays short and
  // matches what Settings → Locations already promises it. See
  // docs/specs/multi-location-foundations.md for why flat rather than nested.
  slug: "shampooch",
  logoUrl:
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=200&h=200&q=80",
  // Brand-level copy, so it must not name a branch: it renders on the chain
  // page and on every branch page alike. "In the heart of JVC" was true on one
  // of three.
  shortDescription: "Boutique grooming for dogs and cats, across Dubai.",
  longDescription:
    "Shampooch is a boutique pet grooming salon offering full-service baths, cuts, and pampering. Our team works with dogs and cats of every size and temperament, and we keep appointments small to give every pet our full attention.",
  street: "Al Ghozlan 4, Jumeirah Village Circle",
  city: "Dubai",
  emirate: "Dubai",
  phone: "+971 50 123 4567",
  email: "hello@shampooch.ae",
  categories: ["grooming", "daycare"],
  isLive: true,
  heroEyebrow: "Trusted pet care",
  heroHeadline: "Premium care for",
  heroHeadlineAccent: "furry friends.",
  heroSubhead:
    "Grooming, wellness, and boarding, with easy online booking and a team that treats your pet like family.",
  trustBadges: [
    { id: "certified", label: "Safe, certified care", icon: "shield" },
    { id: "clean", label: "Clean facility, clear updates", icon: "sparkles" },
    { id: "fast", label: "Booking in under a minute", icon: "clock" },
    { id: "loved", label: "Loved by pet parents", icon: "star" },
  ],
  heroFeatures: [
    { id: "daycare", eyebrow: "Playtime with structure", title: "Daycare", accent: "yellow" },
    { id: "grooming", eyebrow: "Full bath and trim", title: "Grooming", accent: "violet" },
    { id: "boarding", eyebrow: "Overnight stays", title: "Boarding", accent: "sage" },
  ],
  services: [
    {
      id: "bath-small",
      name: "Bath and brush, small dog",
      description: "Shampoo, blow dry, ear clean, nail trim. Up to 10kg.",
      durationMinutes: 60,
      priceAed: 120,
    },
    {
      id: "bath-large",
      name: "Bath and brush, large dog",
      description: "Shampoo, blow dry, ear clean, nail trim. 25kg and above.",
      durationMinutes: 90,
      priceAed: 180,
    },
    {
      id: "full-groom",
      name: "Full groom",
      description: "Bath, hand-scissor cut, paw pads, sanitary trim.",
      durationMinutes: 120,
      priceAed: 260,
    },
    {
      id: "cat-groom",
      name: "Cat grooming",
      description: "Bath, blow dry, sanitary trim. Specialty handling for nervous cats.",
      durationMinutes: 75,
      priceAed: 200,
    },
    {
      id: "daycare-day",
      name: "Daycare, full day",
      description: "Drop-off from 8am, pickup by 7pm. Includes two play sessions.",
      durationMinutes: 660,
      priceAed: 140,
    },
  ],
  hours: {
    mon: standardDay,
    tue: standardDay,
    wed: standardDay,
    thu: standardDay,
    fri: weekendDay,
    sat: weekendDay,
    sun: closed,
  },
  coverUrl:
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1600&q=80",
}

/**
 * Shampooch runs three branches; two are published.
 *
 * Al Quoz is suspended in the operator's estate, so it is **absent** rather
 * than listed as unavailable — SU1.5 hides a suspended branch's booking page,
 * and a client should not be offered a place they cannot book (R12, R15).
 *
 * JVC inherits the business menu. Jumeirah deliberately differs, which is the
 * same example the requirements use: the busy branch charges more for the same
 * service, and it does not do daycare at all (R06, DW3.1, DW3.3).
 */
const SHAMPOOCH: PublicBusiness = {
  ...SHAMPOOCH_BRAND,
  branches: [
    {
      id: "shampooch-jvc",
      slug: "shampooch-jvc",
      name: "JVC",
      street: "Al Ghozlan 4, Jumeirah Village Circle",
      city: "Dubai",
      emirate: "Dubai",
      phone: "+971 50 123 4567",
      isPublished: true,
    },
    {
      id: "shampooch-jumeirah",
      slug: "shampooch-jumeirah",
      name: "Jumeirah",
      street: "Beach Park Plaza, Jumeirah 2",
      city: "Dubai",
      emirate: "Dubai",
      phone: "+971 50 771 8820",
      // Its higher wash price and its lack of daycare are in
      // lib/service-catalog/offerings.ts, resolved per branch — not filtered
      // and mapped by hand here, where the operator-facing catalog could not
      // see them.
      isPublished: true,
    },
    {
      // Suspended in the operator's estate, so present in the record and
      // absent from every public surface. Kept here rather than deleted
      // because that is the state: a paused branch still exists, keeps its
      // bookings and staff, and comes back unchanged (SU1.5, R12).
      id: "shampooch-al-quoz",
      slug: "shampooch-al-quoz",
      name: "Al Quoz",
      street: "Warehouse 4, Al Quoz Industrial 3",
      city: "Dubai",
      emirate: "Dubai",
      phone: "+971 55 340 1192",
      isPublished: false,
    },
  ],
}

const PURRPALACE_BRAND: Omit<PublicBusiness, "branches"> = {
  businessName: "Purr Palace",
  displayName: "Purr Palace",
  slug: "purr-palace",
  logoUrl:
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=200&h=200&q=80",
  shortDescription: "Cat-only boarding and daycare in Al Quoz.",
  longDescription:
    "A calm, cat-only environment. No dogs, no shared rooms, no stress. Each guest gets a private suite with a window and quiet hours overnight.",
  street: "Warehouse 14, Al Quoz Industrial 3",
  city: "Dubai",
  emirate: "Dubai",
  phone: "+971 4 555 0199",
  email: "stay@purrpalace.ae",
  categories: ["boarding", "daycare"],
  isLive: true,
  heroEyebrow: "Cats only",
  heroHeadline: "A calm stay for",
  heroHeadlineAccent: "every cat.",
  heroSubhead:
    "Private suites, quiet hours, and one team that knows cats. Book a tour or reserve a stay.",
  trustBadges: [
    { id: "private", label: "Private suites only", icon: "shield" },
    { id: "quiet", label: "Quiet hours overnight", icon: "sparkles" },
    { id: "fast", label: "Booking in under a minute", icon: "clock" },
    { id: "loved", label: "Cat-parent approved", icon: "star" },
  ],
  heroFeatures: [
    { id: "boarding", eyebrow: "Overnight stays", title: "Boarding", accent: "violet" },
    { id: "daycare", eyebrow: "Drop in for the day", title: "Daycare", accent: "sage" },
  ],
  services: [
    {
      id: "stay-standard",
      name: "Standard suite, per night",
      description: "Single private suite with window. Includes two daily check-ins.",
      durationMinutes: 1440,
      priceAed: 180,
    },
    {
      id: "stay-deluxe",
      name: "Deluxe suite, per night",
      description: "Larger private suite with cat tree and view. Includes daily play time.",
      durationMinutes: 1440,
      priceAed: 260,
    },
    {
      id: "daycare",
      name: "Daycare, per day",
      description: "Drop-off from 8am, pickup by 7pm.",
      durationMinutes: 660,
      priceAed: 110,
    },
  ],
  hours: {
    mon: standardDay,
    tue: standardDay,
    wed: standardDay,
    thu: standardDay,
    fri: weekendDay,
    sat: weekendDay,
    sun: weekendDay,
  },
  coverUrl:
    "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1600&q=80",
}

/**
 * One site, one branch — not zero. A single-location business is the same
 * shape with one entry, so no surface needs a second code path, and the
 * branch's slug is the business's: the business page *is* the branch page,
 * and no picker is rendered (the public half of DW1.2).
 */
const PURRPALACE: PublicBusiness = {
  ...PURRPALACE_BRAND,
  branches: [
    {
      id: "purr-palace",
      slug: "purr-palace",
      name: "Al Quoz",
      street: PURRPALACE_BRAND.street,
      city: PURRPALACE_BRAND.city,
      emirate: PURRPALACE_BRAND.emirate,
      phone: PURRPALACE_BRAND.phone,
      hours: PURRPALACE_BRAND.hours,
      // A second business, and only one catalog is modelled in this repo — so
      // this one keeps its own list rather than inheriting the chain's menu.
      services: PURRPALACE_BRAND.services,
      isPublished: true,
    },
  ],
}

const NOT_LIVE_PREVIEW: PublicBusiness = {
  ...SHAMPOOCH,
  slug: "draft-business",
  displayName: "Draft Business",
  isLive: false,
  branches: SHAMPOOCH.branches.map((b) => ({ ...b, slug: `draft-${b.slug}` })),
}

const businesses: ReadonlyMap<string, PublicBusiness> = new Map([
  [SHAMPOOCH.slug, SHAMPOOCH],
  [PURRPALACE.slug, PURRPALACE],
  [NOT_LIVE_PREVIEW.slug, NOT_LIVE_PREVIEW],
])

/**
 * What a public slug resolves to (R15).
 *
 * Two entry paths, and the asymmetry is deliberate — the BRD's "front door,
 * per channel". A **branch** slug is the shareable link a branch posts, and it
 * skips the picker because the client has already stated where (GB3.2). A
 * **business** slug is the undecided client's entry, and it asks (GB3.1).
 *
 * Neither guesses. That is the same rule R11 states, satisfied two ways.
 */
export type PublicView =
  | { kind: "picker"; business: PublicBusiness; branches: ReadonlyArray<PublicBranch> }
  | { kind: "branch"; business: PublicBusiness; branch: PublicBranch }

/**
 * A branch slug wins over a business slug. For a single-site business the two
 * are the same string, and resolving to the branch is what makes its page the
 * branch page with no picker in it.
 */
export function resolvePublicView(slug: string): PublicView | undefined {
  for (const business of new Set(businesses.values())) {
    if (!business.isLive) continue
    const branch = business.branches.find((b) => b.slug === slug && b.isPublished)
    if (branch) return { kind: "branch", business, branch }
  }
  const business = businesses.get(slug)
  if (!business?.isLive) return undefined
  const published = business.branches.filter((b) => b.isPublished)
  // A business whose only published branch shares its slug was already caught
  // above; reaching here with one branch means the slugs differ, so still ask.
  return { kind: "picker", business, branches: published }
}

/**
 * The business as one branch presents it: brand fields from the business,
 * address, hours and menu from the branch.
 *
 * This exists so the page's sections did not have to learn about branches. It
 * is also what the real thing does — resolve the location, then render its
 * offering (R15: "both paths yield that Location's offering").
 */
/**
 * What a branch page reads that an operator can change while looking at it.
 *
 * Passed in rather than read here, because this function runs on both sides:
 * the server render has the seed and nothing else, and only a client can know
 * what the operator has since saved. Omitted, both fall back to the seed, which
 * is exactly the server's answer — so the static HTML is unchanged.
 */
export type BranchLiveData = {
  hours?: WeekSchedule
  offerings?: ReadonlyArray<LocationOffering>
}

export function branchAsBusiness(
  business: PublicBusiness,
  branch: PublicBranch,
  live?: BranchLiveData,
): PublicBusiness {
  // A chain's branch page has to name the branch. `displayName` is what the
  // booking card, the cover and the page title all read, so overriding only
  // `businessName` left every branch page titled "Shampooch" — identical
  // whichever branch a client had just picked, which is the one thing this
  // page exists to make unambiguous (R15).
  //
  // A single-site business is left alone: its page *is* the business, so
  // "Purr Palace Al Quoz" would be worse than "Purr Palace".
  const isChain = business.branches.filter((b) => b.isPublished).length > 1
  const name = isChain ? `${business.displayName} ${branch.name}`.trim() : business.displayName

  return {
    ...business,
    /**
     * The branch's own slug, and this one is load-bearing.
     *
     * Every self-link on a branch page is built from it: "Book now" goes to
     * `/{slug}/book`, "Manage booking" to `/{slug}/booking/{ref}`, "Book
     * again" back to `/{slug}/book`. Spreading the business and leaving its
     * slug in place pointed all of them at the chain page instead — so Book
     * now on a branch page stopped reaching the booking flow the moment the
     * business gained a slug of its own.
     *
     * Inside a branch's context every link is the branch's.
     */
    slug: branch.slug,
    businessName: name,
    displayName: name,
    street: branch.street,
    city: branch.city,
    emirate: branch.emirate,
    phone: branch.phone,
    // Resolved from the branch's own record unless it carries its own list.
    hours: branch.hours ?? live?.hours ?? locationHours(branch.id) ?? business.hours,
    // Resolved from the catalog unless the branch carries its own list. Was
    // `branch.services`, a copy that had to be kept in step by hand.
    services: branch.services ?? publicServicesForLocation(branch.id, live?.offerings),
  }
}

/**
 * Kept for the sub-routes (book, booking, pay), which always operate at one
 * branch — booking without a branch is the default-venue fallback R11 deletes.
 * So this resolves branch slugs, and returns the branch-resolved business.
 */
export function getPublicBusiness(slug: string): PublicBusiness | undefined {
  const view = resolvePublicView(slug)
  if (!view) return undefined
  if (view.kind === "branch") return branchAsBusiness(view.business, view.branch)
  return undefined
}

/**
 * The business record for a slug, ignoring branch resolution. For surfaces that
 * need the chain itself — the picker demo, and anything reasoning about the
 * estate rather than about one branch.
 */
export function getPublicBusinessBySlug(slug: string): PublicBusiness | undefined {
  const business = businesses.get(slug)
  return business?.isLive ? business : undefined
}

/** Bookable slugs — every published branch. Feeds the book / pay routes. */
export function listPublicBusinessSlugs(): ReadonlyArray<string> {
  return Array.from(new Set(businesses.values()))
    .filter((b) => b.isLive)
    .flatMap((b) => b.branches.filter((br) => br.isPublished).map((br) => br.slug))
}

/** Every slug with a public page: the branches, plus a chain's business page. */
export function listPublicPageSlugs(): ReadonlyArray<string> {
  const businessSlugs = Array.from(new Set(businesses.values()))
    .filter((b) => b.isLive)
    .map((b) => b.slug)
  return Array.from(new Set([...businessSlugs, ...listPublicBusinessSlugs()]))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`
  return `${h}h ${m}m`
}

export function formatPriceAed(value: number): string {
  return `AED ${value.toLocaleString("en-AE")}`
}
