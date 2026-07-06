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
export type BookingPet = { id: string; name: string; species: AvatarSpecies; breed: string }

export const RETURNING_PETS: ReadonlyArray<BookingPet> = [
  { id: "bella", name: "Bella", species: "dog", breed: "Cavapoo" },
  { id: "miso", name: "Miso", species: "cat", breed: "Domestic shorthair" },
]

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
export type BookingStatus = "confirmed" | "cancelled"

export type BookingDetail = {
  ref: string
  businessSlug: string
  status: BookingStatus
  serviceName: string
  durationMinutes: number
  priceAed: number
  dayLabel: string
  timeLabel: string
  staffName: string
  petName?: string
  customerName: string
}

export function resolveBooking(business: PublicBusiness, ref: string): BookingDetail {
  // Prefer a marquee service; fall back to the first on the menu.
  const service =
    business.services.find((s) => s.name.toLowerCase().includes("groom")) ?? business.services[0]!
  return {
    ref,
    businessSlug: business.slug,
    status: ref.endsWith("-cancelled") ? "cancelled" : "confirmed",
    serviceName: service.name,
    durationMinutes: service.durationMinutes,
    priceAed: service.priceAed,
    dayLabel: "Wed 1 Jul",
    timeLabel: "10:00am",
    staffName: BOOKING_STAFF[0]!.name,
    petName: businessHasPets(business) ? RETURNING_PETS[0]!.name : undefined,
    customerName: "Michelle You",
  }
}

export type { PublicService }
