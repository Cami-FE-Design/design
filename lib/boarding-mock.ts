import type { AvatarSpecies } from "@/components/ui/avatar"

// ─── Boarding domain ──────────────────────────────────────────────────────────
// Overnight pet stays. Priced per night, span day columns on the calendar.
// Mirrors the Cuddles reference (calendar + booking-detail drawer) but uses the
// cami design system, tokens, and the same status-lifecycle vocabulary as
// appointments (see app/appointments/mock.ts).

export type BoardingStatus = "booked" | "checked-in" | "checked-out" | "cancelled" | "no-show"

export type PetSize = "X-Small" | "Small" | "Medium" | "Large" | "X-Large"

export type BoardingFacility = {
  id: string
  name: string
}

export type BoardingRoom = {
  id: string
  name: string
  facilityId: string
  /** How many pets the room holds. Boarding rooms are typically 1. */
  capacity: number
  /** cami color scale suffix used for the stay bar accent, e.g. "violet". */
  color: string
}

export type BoardingAddOn = {
  id: string
  label: string
  priceMinor: number
}

export type BoardingStay = {
  id: string
  // Pet
  petName: string
  petSpecies: AvatarSpecies
  petBreed?: string
  petSize: PetSize
  // Pet parent
  clientName: string
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  // Stay
  serviceName: string
  ratePerNightMinor: number
  facilityId: string
  /** null = Unassigned (sits in the Unassigned row until dragged onto a room). */
  roomId: string | null
  /** ISO date the pet arrives, e.g. "2026-07-05". */
  checkIn: string
  /** ISO date the pet leaves (exclusive — the morning of departure). */
  checkOut: string
  status: BoardingStatus
  addOns: BoardingAddOn[]
  lateCheckoutFee: boolean
  notes?: string
}

// ─── Visible week (matches the reference: Jul 05–11, 2026) ─────────────────────

export const TODAY_ISO = "2026-07-08"

export type WeekDay = { iso: string; weekday: string; day: number }

export const WEEK_DAYS: ReadonlyArray<WeekDay> = [
  { iso: "2026-07-05", weekday: "Sun", day: 5 },
  { iso: "2026-07-06", weekday: "Mon", day: 6 },
  { iso: "2026-07-07", weekday: "Tue", day: 7 },
  { iso: "2026-07-08", weekday: "Wed", day: 8 },
  { iso: "2026-07-09", weekday: "Thu", day: 9 },
  { iso: "2026-07-10", weekday: "Fri", day: 10 },
  { iso: "2026-07-11", weekday: "Sat", day: 11 },
]

export const WEEK_RANGE_LABEL = "Jul 05 – 11, 2026"

// ─── Late checkout ─────────────────────────────────────────────────────────────

export const LATE_CHECKOUT_FEE_MINOR = 2500 // AED 25.00

// ─── Facilities + rooms ────────────────────────────────────────────────────────

export const BOARDING_FACILITIES: ReadonlyArray<BoardingFacility> = [
  { id: "f1", name: "Main House" },
  { id: "f2", name: "Cattery" },
]

export const BOARDING_ROOMS: ReadonlyArray<BoardingRoom> = [
  { id: "rm1", name: "Suite 1", facilityId: "f1", capacity: 1, color: "violet" },
  { id: "rm2", name: "Suite 2", facilityId: "f1", capacity: 1, color: "green" },
  { id: "rm3", name: "Kennel A", facilityId: "f1", capacity: 1, color: "sage" },
  { id: "rm4", name: "Kennel B", facilityId: "f1", capacity: 1, color: "yellow" },
  { id: "rm5", name: "Cat Condo 1", facilityId: "f2", capacity: 1, color: "pink" },
  { id: "rm6", name: "Cat Condo 2", facilityId: "f2", capacity: 1, color: "blue" },
]

// ─── Add-ons (attached via the "Add" affordance on a stay) ─────────────────────

export const BOARDING_ADD_ON_CATALOG: ReadonlyArray<BoardingAddOn> = [
  { id: "feed", label: "Feeding plan", priceMinor: 1500 },
  { id: "walk", label: "Extra walk", priceMinor: 2000 },
  { id: "meds", label: "Medication", priceMinor: 1000 },
  { id: "groom", label: "Exit groom", priceMinor: 6000 },
]

// ─── Mock stays ────────────────────────────────────────────────────────────────

export const BOARDING_STAYS: ReadonlyArray<BoardingStay> = [
  {
    id: "s1",
    petName: "Biscuit",
    petSpecies: "dog",
    petBreed: "Golden Retriever",
    petSize: "Large",
    clientName: "Layla Hassan",
    clientPhone: "055 373 5522",
    clientEmail: "layla@example.com",
    clientAddress: "Jumeirah 1, Dubai",
    serviceName: "Overnight boarding",
    ratePerNightMinor: 12000,
    facilityId: "f1",
    roomId: "rm1",
    checkIn: "2026-07-05",
    checkOut: "2026-07-10",
    status: "checked-in",
    addOns: [{ id: "feed", label: "Feeding plan", priceMinor: 1500 }],
    lateCheckoutFee: false,
    notes: "Anxious around other large dogs. Feed twice daily.",
  },
  {
    id: "s2",
    petName: "Mochi",
    petSpecies: "cat",
    petBreed: "British Shorthair",
    petSize: "Small",
    clientName: "Omar Sayed",
    clientPhone: "050 118 2200",
    clientEmail: "omar@example.com",
    serviceName: "Cattery stay",
    ratePerNightMinor: 8000,
    facilityId: "f2",
    roomId: "rm5",
    checkIn: "2026-07-06",
    checkOut: "2026-07-09",
    status: "booked",
    addOns: [],
    lateCheckoutFee: false,
  },
  {
    id: "s3",
    petName: "Rex",
    petSpecies: "dog",
    petBreed: "German Shepherd",
    petSize: "X-Large",
    clientName: "Nadia Karim",
    clientPhone: "052 900 4410",
    clientEmail: "nadia@example.com",
    serviceName: "Overnight boarding",
    ratePerNightMinor: 14000,
    facilityId: "f1",
    roomId: "rm3",
    checkIn: "2026-07-08",
    checkOut: "2026-07-11",
    status: "booked",
    addOns: [
      { id: "walk", label: "Extra walk", priceMinor: 2000 },
      { id: "meds", label: "Medication", priceMinor: 1000 },
    ],
    lateCheckoutFee: false,
  },
  {
    id: "s4",
    petName: "Pip",
    petSpecies: "rabbit",
    petBreed: "Holland Lop",
    petSize: "X-Small",
    clientName: "Sara Ali",
    clientPhone: "056 220 1188",
    clientEmail: "sara@example.com",
    serviceName: "Small-pet boarding",
    ratePerNightMinor: 5000,
    facilityId: "f1",
    // Unassigned — sits in the Unassigned row until dragged onto a room.
    roomId: null,
    checkIn: "2026-07-07",
    checkOut: "2026-07-12",
    status: "booked",
    addOns: [],
    lateCheckoutFee: false,
    notes: "Needs timothy hay top-up daily.",
  },
  {
    id: "s5",
    petName: "Luna",
    petSpecies: "cat",
    petBreed: "Persian",
    petSize: "Small",
    clientName: "Yousef Rahman",
    clientPhone: "054 771 3030",
    clientEmail: "yousef@example.com",
    serviceName: "Cattery stay",
    ratePerNightMinor: 8000,
    facilityId: "f2",
    roomId: "rm6",
    checkIn: "2026-07-05",
    checkOut: "2026-07-07",
    status: "checked-out",
    addOns: [{ id: "groom", label: "Exit groom", priceMinor: 6000 }],
    lateCheckoutFee: true,
  },
]

// ─── Create-flow options (for the "New boarding" sheet) ────────────────────────

export type BoardingClientOption = {
  id: string
  name: string
  phone?: string
  email?: string
  pets: { name: string; species: AvatarSpecies; size: PetSize; breed?: string }[]
}

export const BOARDING_CLIENTS: ReadonlyArray<BoardingClientOption> = [
  {
    id: "c1",
    name: "Layla Hassan",
    phone: "055 373 5522",
    email: "layla@example.com",
    pets: [{ name: "Biscuit", species: "dog", size: "Large", breed: "Golden Retriever" }],
  },
  {
    id: "c2",
    name: "Omar Sayed",
    phone: "050 118 2200",
    email: "omar@example.com",
    pets: [{ name: "Mochi", species: "cat", size: "Small", breed: "British Shorthair" }],
  },
  {
    id: "c3",
    name: "Sara Ali",
    phone: "056 220 1188",
    email: "sara@example.com",
    pets: [
      { name: "Pip", species: "rabbit", size: "X-Small", breed: "Holland Lop" },
      { name: "Coco", species: "dog", size: "Medium", breed: "Poodle" },
    ],
  },
]

export type BoardingServiceOption = {
  id: string
  name: string
  ratePerNightMinor: number
}

export const BOARDING_SERVICES: ReadonlyArray<BoardingServiceOption> = [
  { id: "svc-overnight", name: "Overnight boarding", ratePerNightMinor: 12000 },
  { id: "svc-cattery", name: "Cattery stay", ratePerNightMinor: 8000 },
  { id: "svc-small", name: "Small-pet boarding", ratePerNightMinor: 5000 },
]

export const PET_SIZES: ReadonlyArray<PetSize> = ["X-Small", "Small", "Medium", "Large", "X-Large"]

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** Nights between two ISO dates (checkOut exclusive). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(`${checkIn}T00:00:00`)
  const b = new Date(`${checkOut}T00:00:00`)
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86_400_000))
}

export function stayNights(stay: BoardingStay): number {
  return nightsBetween(stay.checkIn, stay.checkOut)
}

/** nights × per-night rate + add-ons + optional late-checkout fee. */
export function staySubtotalMinor(stay: BoardingStay): number {
  const nights = stayNights(stay)
  const addOns = stay.addOns.reduce((sum, a) => sum + a.priceMinor, 0)
  const late = stay.lateCheckoutFee ? LATE_CHECKOUT_FEE_MINOR : 0
  return nights * stay.ratePerNightMinor + addOns + late
}

export function facilityName(id: string): string {
  return BOARDING_FACILITIES.find((f) => f.id === id)?.name ?? "—"
}

export function roomName(id: string | null): string {
  if (!id) return "Unassigned"
  return BOARDING_ROOMS.find((r) => r.id === id)?.name ?? "—"
}

/** Column index (0–6) of an ISO date within the visible week, or -1 if outside. */
export function dayIndex(iso: string): number {
  return WEEK_DAYS.findIndex((d) => d.iso === iso)
}

/**
 * Bar geometry in column units, clamped to the visible week.
 * `start` = left column, `span` = number of columns (nights) covered.
 * Returns null if the stay does not overlap the week at all.
 */
export function stayBarSpan(stay: BoardingStay): { start: number; span: number } | null {
  const first = WEEK_DAYS[0].iso
  const lastPlusOne = "2026-07-12" // exclusive right edge of the week
  // Overlap window in ISO space.
  const startIso = stay.checkIn < first ? first : stay.checkIn
  const endIso = stay.checkOut > lastPlusOne ? lastPlusOne : stay.checkOut
  if (endIso <= startIso) return null
  const startCol = startIso === first ? 0 : dayIndex(startIso)
  const nights = nightsBetween(startIso, endIso)
  if (startCol < 0 || nights <= 0) return null
  return { start: startCol, span: Math.min(nights, WEEK_DAYS.length - startCol) }
}
