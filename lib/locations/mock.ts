import { CLOSED_DAY, openFor, openForShifts, type WeekSchedule } from "@/lib/locations/hours"
import type { Location, LocationStatus } from "@/lib/locations/types"

/**
 * The hours each branch actually keeps. Deliberately different, because
 * identical hours across three branches cannot show that they are per branch
 * (R01) — and because the states worth reviewing are the awkward ones: a branch
 * that trades seven days, and a branch that closes in the middle of the day.
 */
const JVC_HOURS: WeekSchedule = {
  mon: openFor("09:00", "19:00"),
  tue: openFor("09:00", "19:00"),
  wed: openFor("09:00", "19:00"),
  thu: openFor("09:00", "19:00"),
  fri: openFor("10:00", "18:00"),
  sat: openFor("10:00", "18:00"),
  sun: CLOSED_DAY,
}

/** Opens seven days, and later on the weekend — a busier catchment. */
const JUMEIRAH_HOURS: WeekSchedule = {
  mon: openFor("09:00", "20:00"),
  tue: openFor("09:00", "20:00"),
  wed: openFor("09:00", "20:00"),
  thu: openFor("09:00", "20:00"),
  fri: openFor("10:00", "21:00"),
  sat: openFor("10:00", "21:00"),
  sun: openFor("11:00", "18:00"),
}

/** Closes over the middle of the day — the case a single range cannot hold. */
const AL_QUOZ_HOURS: WeekSchedule = {
  mon: openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" }),
  tue: openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" }),
  wed: openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" }),
  thu: openForShifts({ open: "08:00", close: "13:00" }, { open: "16:00", close: "20:00" }),
  fri: CLOSED_DAY,
  sat: openFor("09:00", "14:00"),
  sun: CLOSED_DAY,
}

/**
 * The business's locations — the single source every surface reads.
 *
 * Before this file there were three: `LOCATIONS` in components/blocks/location-form.tsx,
 * `TERMINAL_LOCATIONS` in lib/terminals/store.tsx (whose own comment asked for
 * this collapse), and a pair of fabricated rows in the topbar's workspace
 * switcher. Three sources meant a location could be "Downtown Clinic" on the
 * terminals panel and "Shampooch JVC" in settings, which is exactly the
 * ambiguity R11 exists to delete. Add a branch here, nowhere else.
 *
 * Seeded to exercise the states that carry a rule rather than to look tidy:
 * two live branches so the switcher has something to switch between (R03), and
 * one suspended so SU1.5's "paused, not closed" state is visible without
 * anyone having to click a button first.
 */
export const LOCATIONS: Location[] = [
  {
    id: "shampooch-jvc",
    name: "Shampooch JVC",
    slug: "shampooch-jvc",
    phone: "+971 50 123 4567",
    email: "hello@shampooch.ae",
    location: {
      address: "Al Ghozlan 4, Jumeirah Village Circle",
      aptSuite: "",
      district: "JVC",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      country: "United Arab Emirates",
    },
    mapPin: { lat: 25.0635, lng: 55.2008 },
    businessType: ["grooming", "wellness"],
    invoicing: {
      sameAsLocation: false,
      companyName: "Shampooch Trading LLC",
      address: "Office 504, Building 7, JLT",
      aptSuite: "",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      vatNumber: "100123456700003",
      invoiceNote: "",
    },
    status: "live",
    hours: JVC_HOURS,
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    photoUrl: "https://picsum.photos/seed/shampooch/80",
  },
  {
    id: "shampooch-jumeirah",
    name: "Shampooch Jumeirah",
    slug: "shampooch-jumeirah",
    phone: "+971 50 771 8820",
    email: "jumeirah@shampooch.ae",
    location: {
      address: "Beach Park Plaza, Jumeirah 2",
      aptSuite: "Unit 12",
      district: "Jumeirah",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      country: "United Arab Emirates",
    },
    mapPin: { lat: 25.2048, lng: 55.2426 },
    businessType: ["grooming"],
    /**
     * Same legal entity and TRN as JVC, its own receipt prefix. The shape R23
     * calls for: a business default with a per-field override, not a per-branch
     * copy of everything. Confirmed in #multi-location — "let's keep this
     * flexible, it will allow us to add unique tax numbers/VAT".
     */
    invoicing: {
      sameAsLocation: false,
      companyName: "Shampooch Trading LLC",
      address: "Office 504, Building 7, JLT",
      aptSuite: "",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      vatNumber: "100123456700003",
      invoiceNote: "",
    },
    status: "live",
    hours: JUMEIRAH_HOURS,
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    photoUrl: "https://picsum.photos/seed/shampooch-jumeirah/80",
  },
  {
    id: "shampooch-al-quoz",
    name: "Shampooch Al Quoz",
    slug: "shampooch-al-quoz",
    phone: "+971 55 340 1192",
    email: "alquoz@shampooch.ae",
    location: {
      address: "Warehouse 4, Al Quoz Industrial 3",
      aptSuite: "",
      district: "Al Quoz",
      city: "Dubai",
      state: "Dubai",
      postcode: "",
      country: "United Arab Emirates",
    },
    mapPin: { lat: 25.1279, lng: 55.2333 },
    businessType: ["boarding", "daycare"],
    invoicing: {
      sameAsLocation: true,
      companyName: "Shampooch Trading LLC",
      address: "",
      aptSuite: "",
      city: "",
      state: "",
      postcode: "",
      vatNumber: "100123456700003",
      invoiceNote: "",
    },
    /** Closed for a fit-out. Booking page hidden, calendar off, nothing lost. */
    status: "suspended",
    hours: AL_QUOZ_HOURS,
    ownerName: "Maz Khan",
    ownerEmail: "maaz@getcami.io",
    photoUrl: "https://picsum.photos/seed/shampooch-alquoz/80",
  },
]

/**
 * Display name for a location id, for the non-React callers that only hold an
 * id (a terminal row, a cart's target). Inside a component prefer
 * `useLocations().locationName`, which resolves through the same helper but
 * stays honest if the estate ever becomes stateful.
 *
 * Returns the id when nothing matches, so a stale reference shows up on screen
 * instead of resolving to a plausible-looking wrong branch.
 */
export function locationName(locationId: string): string {
  // The whole estate, not the first three. This resolved against `LOCATIONS`
  // from before the nine-branch seed existed, so six branches printed their raw
  // id — "shampooch-downtown-dubai" on an appointments table — and every
  // surface that reads a name off an id was quietly wrong for two thirds of the
  // business.
  return findSeeded(locationId)?.name ?? locationId
}

/**
 * A branch's opening hours by id, for the client-facing surfaces that hold only
 * an id. Undefined when the id names no branch, so the caller falls back rather
 * than rendering an empty week.
 */
export function locationHours(locationId: string): WeekSchedule | undefined {
  return findSeeded(locationId)?.hours
}

/**
 * What a client-facing surface needs to name and find a branch (R01, R15).
 *
 * The public mock used to hold its own `street`, `city`, `emirate`, `phone` and
 * `name` per branch, which is the same field set an operator edits in settings
 * — so an address changed there left the public page showing the old one. This
 * is the fourth copy collapsed onto this module, after the location list, the
 * public service menu and the opening hours.
 *
 * Two of the mappings are worth naming, because the two sides call the same
 * fact different things:
 *
 * - `emirate` reads `state`. The Location form says State because the field
 *   serves every country; the public page says what a client in the UAE would.
 * - `name` is `publicName` when the branch has one, and its `district`
 *   otherwise — never `Location.name`, which carries the brand too
 *   ("Shampooch JVC") while the page composes the brand back on, so it would
 *   read "Shampooch Shampooch JVC".
 *
 *   District alone was the whole rule until Chaps & Co showed it was not
 *   enough: their branches are "Bloomingdale's" and "Dubai Design District",
 *   and Bloomingdale's is a store inside Dubai Mall whose district is Downtown
 *   Dubai. The area is usually the label, which is why it stays the fallback —
 *   but it is a fallback, not the rule.
 */
export type LocationContact = {
  name: string
  street: string
  city: string
  emirate: string
  phone: string
}

/**
 * What a client is shown this branch as (D3).
 *
 * The one place the rule lives, because it is needed on both sides: the server
 * render resolves from the seed below, and a client render resolves from the
 * store. Two copies of `publicName ?? district` would drift the moment one of
 * them gained a case the other did not.
 */
export function publicLabel(location: Location): string {
  return location.publicName ?? location.location.district
}

/**
 * A seeded branch by id, across the whole estate rather than the first three.
 *
 * These lookups read `LOCATIONS` while only three branches were public. Six
 * more are now, and a branch whose name and hours resolve to nothing renders a
 * page with the business's name on it and no sign of which branch it is —
 * which is what /shampooch-mirdif did. `NINE_BRANCH_ESTATE` opens with those
 * same three, so nothing that resolved before resolves differently.
 */
function findSeeded(locationId: string): Location | undefined {
  return NINE_BRANCH_ESTATE.find((l) => l.id === locationId)
}

export function locationContact(locationId: string): LocationContact | undefined {
  const location = findSeeded(locationId)
  if (!location) return undefined
  return {
    name: publicLabel(location),
    street: location.location.address,
    city: location.location.city,
    emirate: location.location.state,
    phone: location.phone,
  }
}

/**
 * A nine-branch estate, for reviewing the designs at the scale the PRD assumes
 * (D5). Three branches is the demo; nine is where the layouts fail.
 *
 * Three of them are the real seed above, so nothing that reads the estate has to
 * change shape. The other six are generated, because writing out six more full
 * profiles by hand adds no information — what matters at this scale is how many
 * there are, how many of them are identical, and which one is the exception.
 *
 * Deliberately mostly-identical. That is the honest shape of a chain: nine
 * branches share a menu, keep the same hours, and one of them differs. A seed
 * where every branch was interestingly different would make the collapse look
 * unnecessary, when the collapse exists precisely because most rows say nothing.
 */
const EXTRA_BRANCHES: ReadonlyArray<{
  district: string
  city: string
  state: string
  /** Set only where the area is not what the branch is called (D3). */
  publicName?: string
  status?: LocationStatus
  hours?: WeekSchedule
  /** Set only where the branch does not follow the business default (R19). */
  timezone?: string
}> = [
  /**
   * The case Chaps & Co exposed: a branch inside a mall is called by the mall,
   * not by the district it sits in. Theirs is "Bloomingdale's" in Downtown
   * Dubai; this is the same shape with our own names, so the public surfaces
   * can be checked for using it.
   */
  { district: "Downtown Dubai", city: "Dubai", state: "Dubai", publicName: "The Dubai Mall" },
  { district: "Dubai Marina", city: "Dubai", state: "Dubai" },
  { district: "Mirdif", city: "Dubai", state: "Dubai" },
  // Another emirate, so the estate is not one city — a chain crossing an
  // emirate line is what makes per-branch tax identity (R23) matter.
  { district: "Al Reem", city: "Abu Dhabi", state: "Abu Dhabi" },
  {
    district: "Al Majaz",
    city: "Sharjah",
    state: "Sharjah",
    hours: JUMEIRAH_HOURS,
    // The one branch holding its own zone, so the estate shows an override
    // beside eight inheritances (R19). The three emirates share a zone today,
    // which is why an estate can run for years before anyone notices the
    // business default is doing all the work.
    timezone: "Asia/Riyadh",
  },
  // A second non-trading branch, so the nine-branch estate has more than one
  // exception to look at.
  { district: "Yas Island", city: "Abu Dhabi", state: "Abu Dhabi", status: "suspended" },
]

export const NINE_BRANCH_ESTATE: ReadonlyArray<Location> = [
  ...LOCATIONS,
  ...EXTRA_BRANCHES.map((branch, index): Location => {
    const slug = `shampooch-${slugifyDistrict(branch.district)}`
    const template = LOCATIONS[0]!
    return {
      ...template,
      id: slug,
      slug,
      name: `Shampooch ${branch.district}`,
      phone: `+971 50 ${400 + index} ${1000 + index * 7}`,
      email: `${slugifyDistrict(branch.district)}@shampooch.ae`,
      location: {
        ...template.location,
        address: `Unit ${index + 2}, ${branch.district}`,
        district: branch.district,
        city: branch.city,
        state: branch.state,
      },
      mapPin: null,
      publicName: branch.publicName,
      status: branch.status ?? "live",
      hours: branch.hours ?? template.hours,
      timezone: branch.timezone,
      photoUrl: `https://picsum.photos/seed/${slug}/80`,
    }
  }),
]

/** Local to the seed: the store's `slugify` is for operator input, not fixtures. */
function slugifyDistrict(district: string): string {
  return district.toLowerCase().replace(/[^a-z0-9]+/g, "-")
}
