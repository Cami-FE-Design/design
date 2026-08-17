// Pet-parent public booking flow (E3-4 + E3-6).
//
// The customer lands on /[slug], taps "Book now", and runs this flow on their
// own phone — no login until the identify step. Mirrors the checkout-flow money
// + Luma single-column conventions; prices are tax-inclusive whole AED (VAT
// back-calculated for display), reusing public-business as the source of truth.

import type { AvatarSpecies } from "@/components/ui/avatar"
import type { PublicBusiness, PublicService } from "@/lib/public-business"

// ─── Pet-module gate ──────────────────────────────────────────────────────────
// Pet steps (choose-a-pet) only appear for businesses that manage pets. Derived
// from categories so without-pets partners (salons, spas) skip the step cleanly.
// See project_cami_business_types — binary hasPets gate.
const PET_CATEGORIES = new Set(["grooming", "vet", "daycare", "boarding"])

export function businessHasPets(business: PublicBusiness): boolean {
  return business.categories.some((c) => PET_CATEGORIES.has(c))
}

// ─── Staff ────────────────────────────────────────────────────────────────────
// "Any team member" is the default — most pet parents don't have a preference.
export type BookingStaff = { id: string; name: string; role: string }

export const BOOKING_STAFF: ReadonlyArray<BookingStaff> = [
  { id: "lena", name: "Lena Hassan", role: "Senior groomer" },
  { id: "mariam", name: "Mariam Saleh", role: "Groomer" },
  { id: "deepa", name: "Deepa Nair", role: "Groomer" },
  { id: "aisha", name: "Aisha Rahman", role: "Senior groomer" },
  { id: "omar", name: "Omar Farooq", role: "Groomer" },
  { id: "priya", name: "Priya Menon", role: "Bather" },
  { id: "yusuf", name: "Yusuf Khan", role: "Groomer" },
  { id: "sara", name: "Sara Ali", role: "Stylist" },
  { id: "diana", name: "Diana Costa", role: "Groomer" },
  { id: "hana", name: "Hana Tariq", role: "Bather" },
  { id: "raj", name: "Raj Patel", role: "Senior groomer" },
  { id: "nadia", name: "Nadia Karim", role: "Groomer" },
]

// ─── Days + slots ─────────────────────────────────────────────────────────────
// Static demo week (today = 2026-06-30). Labels are pre-resolved so the flow
// stays a pure render with no Date math / hydration drift.
export type BookingDay = {
  id: string
  weekday: string
  dayNum: number
  /** Overrides the weekday label when present ("Today" / "Tomorrow"). */
  label?: string
  /** No open slots — chip is shown disabled. */
  full?: boolean
}

export const BOOKING_DAYS: ReadonlyArray<BookingDay> = [
  { id: "d0", weekday: "Tue", dayNum: 30, label: "Today" },
  { id: "d1", weekday: "Wed", dayNum: 1, label: "Tomorrow" },
  { id: "d2", weekday: "Thu", dayNum: 2 },
  { id: "d3", weekday: "Fri", dayNum: 3 },
  { id: "d4", weekday: "Sat", dayNum: 4, full: true },
  { id: "d5", weekday: "Sun", dayNum: 5, full: true },
  { id: "d6", weekday: "Mon", dayNum: 6 },
]

// ─── Service catalog (categorized, scales past 30 services) ───────────────────
// Grouped so the picker can show category tabs + an overflow "Categories" sheet,
// mirroring how a large menu (30+ services across many categories) is browsed.
export type CatalogService = {
  id: string
  name: string
  durationMinutes: number
  priceAed: number
  description?: string
  /** Small qualifier shown next to duration, e.g. "Up to 10kg". */
  tag?: string
}

export type ServiceCategory = {
  id: string
  name: string
  description?: string
  services: ReadonlyArray<CatalogService>
}

export const SERVICE_CATEGORIES: ReadonlyArray<ServiceCategory> = [
  {
    id: "grooming",
    name: "Grooming",
    description: "Full-service grooming tailored to coat, size, and temperament.",
    services: [
      {
        id: "full-groom",
        name: "Full groom",
        durationMinutes: 120,
        priceAed: 260,
        description: "Bath, hand-scissor cut, paw pads, sanitary trim, blow dry.",
      },
      {
        id: "puppy-groom",
        name: "Puppy's first groom",
        durationMinutes: 60,
        priceAed: 150,
        tag: "Under 6 months",
        description: "Gentle intro groom to get puppies comfortable with the salon.",
      },
      {
        id: "breed-cut",
        name: "Breed-standard cut",
        durationMinutes: 135,
        priceAed: 300,
        description: "Precision cut to your breed's standard by a senior groomer.",
      },
      {
        id: "deshed",
        name: "De-shedding treatment",
        durationMinutes: 90,
        priceAed: 210,
        description: "Reduce shedding up to 90% with a coat-specific de-shed system.",
      },
    ],
  },
  {
    id: "bath",
    name: "Bath & coat",
    description: "Baths, blow-outs, and coat care for every size.",
    services: [
      {
        id: "bath-small",
        name: "Bath & brush, small dog",
        durationMinutes: 60,
        priceAed: 120,
        tag: "Up to 10kg",
        description: "Shampoo, blow dry, ear clean, nail trim.",
      },
      {
        id: "bath-large",
        name: "Bath & brush, large dog",
        durationMinutes: 90,
        priceAed: 180,
        tag: "25kg+",
        description: "Shampoo, blow dry, ear clean, nail trim.",
      },
      {
        id: "cat-groom",
        name: "Cat grooming",
        durationMinutes: 75,
        priceAed: 200,
        description: "Bath, blow dry, sanitary trim. Specialty handling for nervous cats.",
      },
      {
        id: "medicated",
        name: "Medicated bath",
        durationMinutes: 45,
        priceAed: 140,
        description: "Vet-recommended shampoo for skin conditions.",
      },
      {
        id: "blowout",
        name: "Blow-out & fluff",
        durationMinutes: 40,
        priceAed: 90,
        description: "A quick refresh between full grooms.",
      },
    ],
  },
  {
    id: "nails",
    name: "Nails & paws",
    description: "Quick nail and paw care add-ons.",
    services: [
      { id: "nail-trim", name: "Nail trim", durationMinutes: 15, priceAed: 35 },
      {
        id: "nail-grind",
        name: "Nail trim & grind",
        durationMinutes: 25,
        priceAed: 55,
        description: "Trim plus smoothing for a rounded finish.",
      },
      {
        id: "paw-balm",
        name: "Paw pad treatment",
        durationMinutes: 20,
        priceAed: 45,
        description: "Trim, clean, and moisturising balm for cracked pads.",
      },
    ],
  },
  {
    id: "spa",
    name: "Spa add-ons",
    description: "Little extras to finish the visit.",
    services: [
      { id: "teeth", name: "Teeth brushing", durationMinutes: 15, priceAed: 40 },
      {
        id: "facial",
        name: "Blueberry facial",
        durationMinutes: 15,
        priceAed: 50,
        description: "Gentle brightening facial around the eyes and muzzle.",
      },
      { id: "cologne", name: "Finishing cologne & bow", durationMinutes: 10, priceAed: 25 },
      { id: "gland", name: "Gland expression", durationMinutes: 15, priceAed: 45 },
    ],
  },
  {
    id: "dental",
    name: "Dental",
    description: "Anaesthesia-free dental care.",
    services: [
      {
        id: "scale",
        name: "Dental scale & polish",
        durationMinutes: 45,
        priceAed: 220,
        description: "Anaesthesia-free scaling and polish by a trained tech.",
      },
      { id: "dental-check", name: "Dental health check", durationMinutes: 20, priceAed: 60 },
    ],
  },
  {
    id: "daycare",
    name: "Daycare & boarding",
    description: "Day and overnight stays with structured play.",
    services: [
      {
        id: "daycare-day",
        name: "Daycare, full day",
        durationMinutes: 660,
        priceAed: 140,
        description: "Drop-off from 8am, pickup by 7pm. Two play sessions.",
      },
      { id: "daycare-half", name: "Daycare, half day", durationMinutes: 300, priceAed: 90 },
      {
        id: "boarding",
        name: "Overnight boarding",
        durationMinutes: 1440,
        priceAed: 220,
        description: "Private suite, evening walk, and bedtime check-in.",
      },
    ],
  },
  {
    id: "packages",
    name: "Packages",
    description: "Bundled visits at a better rate.",
    services: [
      {
        id: "pkg-groom4",
        name: "Groom club · 4 visits",
        durationMinutes: 120,
        priceAed: 900,
        description: "Four full grooms over the year, save 15%.",
      },
      {
        id: "pkg-spa",
        name: "Spa day",
        durationMinutes: 180,
        priceAed: 420,
        description: "Full groom + facial + paw treatment + cologne.",
      },
    ],
  },
]

const ALL_SERVICES: ReadonlyArray<CatalogService> = SERVICE_CATEGORIES.flatMap((c) => c.services)

export function findCatalogService(id: string): CatalogService | undefined {
  return ALL_SERVICES.find((s) => s.id === id)
}

export function serviceTotals(ids: ReadonlyArray<string>): {
  count: number
  durationMinutes: number
  priceAed: number
} {
  const chosen = ids.map(findCatalogService).filter(Boolean) as CatalogService[]
  return {
    count: chosen.length,
    durationMinutes: chosen.reduce((n, s) => n + s.durationMinutes, 0),
    priceAed: chosen.reduce((n, s) => n + s.priceAed, 0),
  }
}

export type SlotGroup = { label: string; times: ReadonlyArray<{ time: string; taken?: boolean }> }

// A representative day's grid. Taken slots render disabled (the 5-min-hold model
// means another parent grabbed them).
export const SLOT_GROUPS: ReadonlyArray<SlotGroup> = [
  {
    label: "Morning",
    times: [
      { time: "9:00am" },
      { time: "9:30am", taken: true },
      { time: "10:00am" },
      { time: "10:30am" },
      { time: "11:00am", taken: true },
      { time: "11:30am" },
    ],
  },
  {
    label: "Afternoon",
    times: [
      { time: "12:00pm" },
      { time: "1:00pm" },
      { time: "1:30pm" },
      { time: "2:00pm", taken: true },
      { time: "3:00pm" },
      { time: "4:30pm" },
    ],
  },
]

// ─── Existing pets ────────────────────────────────────────────────────────────
// Returning parents see their household; new parents add one inline (quick-create
// is name + species only — project_cami_quick_create).
export type BookingPet = {
  id: string
  name: string
  species: AvatarSpecies
  breed: string
  /** Real pet photo — Avatar falls back to the species glyph when absent. */
  photoUrl?: string
}

export const RETURNING_PETS: ReadonlyArray<BookingPet> = [
  { id: "bella", name: "Bella", species: "dog", breed: "Cavapoo" },
  { id: "miso", name: "Miso", species: "cat", breed: "Domestic shorthair" },
]

// ─── Client lookup by phone (identify step) ───────────────────────────────────
// Phone is unique per customer (duplicates cleaned up), so it's the lookup key.
// After OTP verify the flow resolves the caller: a record on file pre-fills the
// details form + surfaces saved pets; no record = a fresh registration form.
export type ReturningClient = {
  firstName: string
  lastName: string
  email: string
  /** Saved address on the account — pre-fills the pickup address. */
  address?: string
  pets: ReadonlyArray<BookingPet>
}

export const RETURNING_CLIENT: ReturningClient = {
  firstName: "Michelle",
  lastName: "You",
  email: "michelle@email.com",
  address: "Villa 12, Street 4B, Jumeirah 1, Dubai",
  pets: RETURNING_PETS,
}

/**
 * Pickup + pet notes captured during the identify step.
 *
 * `needsPickup` is off by default: most parents drop off, and defaulting it on
 * would put a pickup icon on every appointment in the calendar. When it's on we
 * reuse the saved address (billing/shipping style) so nothing has to be typed
 * in the common case. `petNotes` is deliberately independent of pickup —
 * allergies and handling notes matter on every appointment.
 */
export type PickupDetails = {
  needsPickup: boolean
  useSavedAddress: boolean
  address: string
  petNotes: string
}

export const EMPTY_PICKUP_DETAILS: PickupDetails = {
  needsPickup: false,
  useSavedAddress: true,
  address: "",
  petNotes: "",
}

/** The address that will actually be used for collection, or null if none. */
export function resolvePickupAddress(pickup: PickupDetails, savedAddress?: string): string | null {
  if (!pickup.needsPickup) return null
  if (pickup.useSavedAddress && savedAddress) return savedAddress
  return pickup.address.trim() || null
}

// Demo resolver: a mobile ending in an EVEN digit is a returning client on file;
// ODD = new. Mirrors the OTP demo convention (a code starting with "0" fails).
// Production swaps this for the real phone → client lookup.
export function findClientByPhone(phone: string): ReturningClient | null {
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 0) return null
  return Number(digits[digits.length - 1]) % 2 === 0 ? RETURNING_CLIENT : null
}

export const PET_SPECIES_OPTIONS: ReadonlyArray<{ value: AvatarSpecies; label: string }> = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "other", label: "Other" },
]

// ─── Booking reference ────────────────────────────────────────────────────────
// Short human-quotable ref the parent uses to manage the booking. Deterministic
// from the chosen service + slot so the same selection always reproduces it.
export function bookingRef(serviceId: string, dayId: string, time: string): string {
  let h = 5381
  for (const ch of `${serviceId}-${dayId}-${time}`) h = (h << 5) + h + ch.charCodeAt(0)
  const n = (Math.abs(h | 0) % 9000) + 1000
  return `CAMI-${n}`
}

// ─── Booking detail (manage page) ─────────────────────────────────────────────
// In production the magic-link token resolves a ref to the real booking. Mock:
// synthesize a coherent snapshot from the business so /[slug]/booking/[ref]
// always has something faithful to show.
// "booked" = request placed, awaiting the salon to confirm. "confirmed" = salon
// accepted. New bookings always start as "booked".
export type BookingStatus = "booked" | "confirmed" | "cancelled"

export type BookingDetail = {
  ref: string
  businessSlug: string
  status: BookingStatus
  serviceName: string
  durationMinutes: number
  priceAed: number
  dayLabel: string
  timeLabel: string
  /** Machine start time (local, salon timezone) for calendar exports. */
  startISO: string
  staffName: string
  petName?: string
  customerName: string
  /** Set when the parent asked us to collect the pet. */
  pickupAddress?: string
  /** Pet notes the parent left at booking time. */
  petNotes?: string
}

export function resolveBooking(business: PublicBusiness, ref: string): BookingDetail {
  // Prefer a marquee service; fall back to the first on the menu.
  const service =
    business.services.find((s) => s.name.toLowerCase().includes("groom")) ?? business.services[0]!
  // Demo switch, matching the -confirmed / -cancelled suffix convention: a
  // "-pickup" ref renders the collection variant of the detail and the email.
  const withPickup = ref.endsWith("-pickup")
  return {
    ref,
    businessSlug: business.slug,
    status: ref.endsWith("-cancelled")
      ? "cancelled"
      : ref.endsWith("-confirmed")
        ? "confirmed"
        : "booked",
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    priceAed: service.priceAed,
    dayLabel: "Wed 1 Jul",
    timeLabel: "10:00am",
    startISO: "2026-07-01T10:00:00",
    staffName: BOOKING_STAFF[0]!.name,
    petName: businessHasPets(business) ? RETURNING_PETS[0]!.name : undefined,
    customerName: "Michelle You",
    pickupAddress: withPickup ? RETURNING_CLIENT.address : undefined,
    petNotes: withPickup ? "Anxious in the van — needs the crate, not a loose harness." : undefined,
  }
}

export type { PublicService }

// ─── Calendar export (Add to calendar) ────────────────────────────────────────

const SALON_TZ = "Asia/Dubai"

/** Local floating stamp: YYYYMMDDTHHMMSS — no trailing Z, interpreted in SALON_TZ. */
function stampCalendar(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0")
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `T${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  )
}

function escapeIcsText(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

export type CalendarEvent = {
  ref: string
  title: string
  location: string
  description: string
  startISO: string
  durationMinutes: number
}

/**
 * Build "Add to calendar" targets. Google gets a TEMPLATE URL; Apple/Outlook get
 * a downloadable .ics data URI (both consume the iCalendar format).
 */
export function calendarLinks(event: CalendarEvent): { google: string; ics: string } {
  const start = new Date(event.startISO)
  const end = new Date(start.getTime() + event.durationMinutes * 60_000)
  const startStamp = stampCalendar(start)
  const endStamp = stampCalendar(end)

  const google =
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(event.title)}` +
    `&dates=${startStamp}/${endStamp}` +
    `&details=${encodeURIComponent(event.description)}` +
    `&location=${encodeURIComponent(event.location)}` +
    `&ctz=${encodeURIComponent(SALON_TZ)}`

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Cami//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.ref}@cami.app`,
    `DTSTART;TZID=${SALON_TZ}:${startStamp}`,
    `DTEND;TZID=${SALON_TZ}:${endStamp}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `LOCATION:${escapeIcsText(event.location)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  return {
    google,
    ics: `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`,
  }
}
