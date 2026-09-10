import type { Location } from "@/lib/locations/types"

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
