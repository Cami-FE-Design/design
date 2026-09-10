import { CLOSED_DAY, openFor, openForShifts, type WeekSchedule } from "@/lib/locations/hours"
import type { Location } from "@/lib/locations/types"

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
    timezone: "Asia/Dubai",
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
    timezone: "Asia/Dubai",
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
    timezone: "Asia/Dubai",
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
  return LOCATIONS.find((l) => l.id === locationId)?.name ?? locationId
}

/**
 * A branch's opening hours by id, for the client-facing surfaces that hold only
 * an id. Undefined when the id names no branch, so the caller falls back rather
 * than rendering an empty week.
 */
export function locationHours(locationId: string): WeekSchedule | undefined {
  return LOCATIONS.find((l) => l.id === locationId)?.hours
}
