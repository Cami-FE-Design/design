import type { AvatarSpecies } from "@/components/ui/avatar"
import type { PetNoteEntry } from "@/lib/pet-notes"

export type MockBookingStatus =
  | "booked"
  | "confirmed"
  | "checked-in"
  | "ready-for-pickup"
  | "completed"
  | "cancelled"
  | "no-show"

export type MockServiceCategory =
  | "grooming"
  | "vet"
  | "daycare"
  | "boarding"
  | "details"
  | "welcome"

export type MockStaff = {
  id: string
  name: string
  role: string
  photoUrl?: string
}

export type MockBooking = {
  id: string
  staffId: string
  start: string
  durationMin: number
  status: MockBookingStatus
  serviceCategory: MockServiceCategory
  serviceName: string
  clientName: string
  petName?: string
  petSpecies?: AvatarSpecies
  priceMinor: number
  isRecurring?: boolean
  linkCount?: number
  hasDeposit?: boolean
  hasSafetyFlag?: boolean
  // Popover-context fields. Optional so existing data stays valid.
  bookingRef?: string
  clientPhone?: string
  notes?: string
  tags?: string[]
  relationshipPills?: string[]
  agreementSigned?: boolean
  intakeFormSubmitted?: boolean
  groomingFrequency?: string
  petBreed?: string
  petWeight?: string
  petCoat?: string
  petSpayed?: boolean
  depositAmountMinor?: number
  /** True for the client's very first booking (used by the "First visit" pill in the detail sheet). */
  isFirstVisit?: boolean
  /** Recurrence label shown in the sheet header below the date, e.g. "Doesn't repeat" / "Every 4 weeks". */
  recurrence?: string
  /**
   * Pet parent asked us to collect the pet rather than dropping it off.
   * Drives the pickup icon on the calendar block and the pickup rows in the
   * popover / detail sheet. Set from the "Pickup required" checkbox in both
   * the public booking flow and the staff new-appointment sheet.
   */
  needsPickup?: boolean
  /**
   * Where the pet is collected from. Only meaningful when `needsPickup`.
   * Defaults to the client's saved address at booking time; the booking keeps
   * its own copy so editing the client profile later doesn't rewrite history.
   */
  pickupAddress?: string
  /**
   * Pet-related notes (allergies, behavior, handling). Deliberately separate
   * from `notes` — those are booking-specific, these travel with the pet and
   * show on every appointment regardless of whether we go to the pet.
   * Structured category + detail pairs so groomers get comparable data.
   */
  petNotes?: PetNoteEntry[]
  /**
   * Days after the 18 May 2026 demo anchor this booking is scheduled.
   * Unset = anchor day. Only set on bookings outside the appointments-list
   * curated subset so that listing keeps reading like the figma; the global
   * search and the detail sheet both respect it, giving the search's
   * "Upcoming appointments" a multi-day spread.
   */
  dayOffset?: number
}

export const MOCK_STAFF: MockStaff[] = [
  { id: "aya-hassan", name: "Aya Hassan", role: "Senior Groomer" },
  { id: "lena-petrov", name: "Lena Petrov", role: "Groomer" },
  { id: "priya-nair", name: "Priya Nair", role: "Groomer" },
  { id: "marco-rossi", name: "Marco Rossi", role: "Senior Groomer" },
  { id: "joel-batumbya", name: "Joel Batumbya", role: "Junior Groomer" },
  { id: "sarah-khoury", name: "Dr. Sarah Khoury", role: "Veterinarian" },
  { id: "fatima-ali", name: "Fatima Ali", role: "Daycare Lead" },
  { id: "hassan-kareem", name: "Hassan Kareem", role: "Boarding Attendant" },
  { id: "olivia-park", name: "Olivia Park", role: "Trainer" },
  { id: "diego-santos", name: "Diego Santos", role: "Vet Tech" },
  { id: "mei-tanaka", name: "Mei Tanaka", role: "Groomer" },
]

export const DAY_START_HOUR = 7
export const DAY_END_HOUR = 19
export const PX_PER_MIN = 95 / 60
export const COLUMN_HEADER_HEIGHT = 86
export const TIME_AXIS_WIDTH = 48
export const MIN_COLUMN_WIDTH = 120

export function minutesFromDayStart(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return (h! - DAY_START_HOUR) * 60 + (m ?? 0)
}

export function formatTimeRange(start: string, durationMin: number): string {
  const [h, m] = start.split(":").map(Number)
  const startTotal = h! * 60 + (m ?? 0)
  const endTotal = startTotal + durationMin
  const fmt = (total: number) => {
    const hh = Math.floor(total / 60)
    const mm = total % 60
    return `${hh}:${mm.toString().padStart(2, "0")}`
  }
  return `${fmt(startTotal)} – ${fmt(endTotal)}`
}

export function formatAed(minor: number): string {
  if (minor === 0) return "AED 0"
  const aed = Math.round(minor / 100)
  return `AED ${aed.toLocaleString("en-US")}`
}

export const MOCK_BOOKINGS: MockBooking[] = [
  // Aya Hassan — column 1
  {
    id: "b-001",
    staffId: "aya-hassan",
    start: "9:00",
    durationMin: 60,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming SM",
    clientName: "Millie Cassidy",
    petName: "Bobo",
    petSpecies: "dog",
    priceMinor: 21000,
  },
  {
    id: "b-002",
    staffId: "aya-hassan",
    start: "10:15",
    durationMin: 60,
    status: "ready-for-pickup",
    serviceCategory: "grooming",
    serviceName: "Wash & Blow Dry MD",
    clientName: "Tom Cassidy",
    clientPhone: "+971 50 374 5511",
    petName: "Luna",
    petSpecies: "cat",
    petBreed: "British Shorthair",
    petWeight: "4.2 kg",
    petCoat: "Short",
    petSpayed: true,
    priceMinor: 14000,
    hasDeposit: true,
    depositAmountMinor: 5000,
    bookingRef: "B-77342",
    relationshipPills: ["Regular", "4 weeks"],
    tags: ["Sensitive ears"],
    notes: "Owner asked for extra paw moisturizer last visit.",
    petNotes: [
      { category: "grooming-sensitivity", detail: "Hates the dryer on high." },
      { category: "handling", detail: "Sensitive ears — no water near the head." },
    ],
    needsPickup: true,
    pickupAddress: "Villa 12, Street 4B, Jumeirah 1, Dubai",
    agreementSigned: true,
    intakeFormSubmitted: true,
    groomingFrequency: "4 weeks",
  },
  {
    id: "b-003",
    staffId: "aya-hassan",
    start: "11:30",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming MD",
    clientName: "Karen Dougall",
    clientPhone: "+971 50 491 2202",
    petName: "Willow",
    petSpecies: "dog",
    petBreed: "Golden Retriever",
    petWeight: "28 kg",
    petCoat: "Long",
    petSpayed: true,
    priceMinor: 26000,
    isRecurring: true,
    bookingRef: "B-77351",
    relationshipPills: ["VIP", "8 weeks"],
    tags: ["Anxious"],
    notes: "Prefers female groomers. Treat-motivated.",
    petNotes: [
      {
        category: "behavior",
        detail: "Anxious in the van — needs the crate, not a loose harness.",
      },
    ],
    agreementSigned: false,
    intakeFormSubmitted: true,
    groomingFrequency: "8 weeks",
  },
  {
    id: "b-004",
    staffId: "aya-hassan",
    start: "13:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Deshedding LG",
    clientName: "Luke Tan",
    petName: "Rocky",
    petSpecies: "dog",
    priceMinor: 25000,
    hasSafetyFlag: true,
    needsPickup: true,
    pickupAddress: "Apt 1804, Marina Heights Tower, Dubai Marina",
    petNotes: [
      { category: "handling", detail: "Muzzle for nail work." },
      { category: "behavior", detail: "Reactive to other dogs in the van." },
    ],
    dayOffset: 1,
  },

  // Lena Petrov — column 2
  {
    id: "b-005",
    staffId: "lena-petrov",
    start: "9:30",
    durationMin: 60,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming SM",
    clientName: "Millie Cassidy",
    petName: "Mochi",
    petSpecies: "cat",
    priceMinor: 18000,
    linkCount: 1,
  },
  {
    id: "b-006",
    staffId: "lena-petrov",
    start: "10:45",
    durationMin: 15,
    status: "confirmed",
    serviceCategory: "details",
    serviceName: "Nails Clip",
    clientName: "Frances",
    petName: "Duke",
    petSpecies: "dog",
    priceMinor: 3000,
    dayOffset: 1,
  },
  {
    id: "b-007",
    staffId: "lena-petrov",
    start: "11:15",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Wash & Blow Dry SM",
    clientName: "Grace Kent",
    petName: "Pepper",
    petSpecies: "rabbit",
    priceMinor: 10000,
    dayOffset: 2,
  },

  // Priya Nair — column 3
  {
    id: "b-008",
    staffId: "priya-nair",
    start: "9:15",
    durationMin: 60,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Wash & Blow Dry SM",
    clientName: "Lisa Lyons Wilson",
    petName: "Ralph",
    petSpecies: "dog",
    priceMinor: 10000,
  },
  {
    id: "b-009",
    staffId: "priya-nair",
    start: "10:30",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming SM",
    clientName: "Amy",
    petName: "Tofu",
    petSpecies: "cat",
    priceMinor: 18000,
    linkCount: 1,
    dayOffset: 3,
  },
  {
    id: "b-010",
    staffId: "priya-nair",
    start: "12:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming SM",
    clientName: "Amy",
    petName: "Muffin",
    petSpecies: "cat",
    priceMinor: 18000,
    linkCount: 1,
    dayOffset: 3,
  },

  // Marco Rossi — column 4
  {
    id: "b-011",
    staffId: "marco-rossi",
    start: "9:00",
    durationMin: 60,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Deshedding LG",
    clientName: "Luke Tan",
    petName: "Shadow",
    petSpecies: "dog",
    priceMinor: 25000,
  },
  {
    id: "b-012",
    staffId: "marco-rossi",
    start: "10:15",
    durationMin: 15,
    status: "completed",
    serviceCategory: "details",
    serviceName: "Ear Clean",
    clientName: "Karen Dougall",
    petName: "Pickle",
    petSpecies: "cat",
    priceMinor: 4000,
  },
  {
    id: "b-013",
    staffId: "marco-rossi",
    start: "10:45",
    durationMin: 60,
    status: "checked-in",
    serviceCategory: "grooming",
    serviceName: "Full Grooming MD",
    clientName: "Karen Dougall",
    petName: "Pickle",
    petSpecies: "cat",
    priceMinor: 22000,
    hasDeposit: true,
  },
  {
    id: "b-014",
    staffId: "marco-rossi",
    start: "12:15",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming LG",
    clientName: "Evie Lelliott",
    petName: "Olive",
    petSpecies: "rabbit",
    priceMinor: 30000,
  },

  // Joel Batumbya — column 5
  {
    id: "b-015",
    staffId: "joel-batumbya",
    start: "9:30",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Wash & Blow Dry SM",
    clientName: "Kirsty Dingomal",
    petName: "Biscuit",
    petSpecies: "dog",
    priceMinor: 10000,
    dayOffset: 1,
  },
  {
    id: "b-016",
    staffId: "joel-batumbya",
    start: "10:45",
    durationMin: 45,
    status: "booked",
    serviceCategory: "grooming",
    serviceName: "Wash Only SM",
    clientName: "Nadia Martinez",
    petName: "Coco",
    petSpecies: "dog",
    priceMinor: 8000,
  },
  {
    id: "b-017",
    staffId: "joel-batumbya",
    start: "13:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "welcome",
    serviceName: "Meet & Greet",
    clientName: "Jamielee Haggerty",
    petName: "Beans",
    petSpecies: "dog",
    priceMinor: 0,
    dayOffset: 4,
  },

  // Dr. Sarah Khoury — column 6 (vet)
  {
    id: "b-018",
    staffId: "sarah-khoury",
    start: "10:00",
    durationMin: 30,
    status: "completed",
    serviceCategory: "vet",
    serviceName: "General Consultation",
    clientName: "Lisa Lyons Wilson",
    petName: "Ralph",
    petSpecies: "dog",
    priceMinor: 15000,
  },
  {
    id: "b-019",
    staffId: "sarah-khoury",
    start: "11:00",
    durationMin: 30,
    status: "checked-in",
    serviceCategory: "vet",
    serviceName: "Annual Vaccination",
    clientName: "Frances",
    petName: "Duke",
    petSpecies: "dog",
    priceMinor: 18000,
    hasSafetyFlag: true,
  },

  // Fatima Ali — column 7 (daycare)
  {
    id: "b-020",
    staffId: "fatima-ali",
    start: "8:00",
    durationMin: 540,
    status: "checked-in",
    serviceCategory: "daycare",
    serviceName: "Day Care · 12 pets",
    clientName: "Daycare session",
    priceMinor: 0,
  },

  // Hassan Kareem — column 8 (boarding desk, idle morning)
  {
    id: "b-021",
    staffId: "hassan-kareem",
    start: "11:30",
    durationMin: 30,
    status: "confirmed",
    serviceCategory: "welcome",
    serviceName: "Boarding Intake",
    clientName: "Charmaine Hayes",
    petName: "Snickers",
    petSpecies: "dog",
    priceMinor: 0,
    dayOffset: 1,
  },

  // Olivia Park — column 9 (trainer)
  {
    id: "b-022",
    staffId: "olivia-park",
    start: "9:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "welcome",
    serviceName: "Behavior Assessment",
    clientName: "Violetta",
    petName: "Marlow",
    petSpecies: "dog",
    priceMinor: 12000,
    dayOffset: 2,
  },

  // Diego Santos — column 10 (vet tech)
  {
    id: "b-023",
    staffId: "diego-santos",
    start: "9:00",
    durationMin: 30,
    status: "confirmed",
    serviceCategory: "vet",
    serviceName: "Nail Trim",
    clientName: "Karen Dougall",
    petName: "Willow",
    petSpecies: "dog",
    priceMinor: 4000,
    dayOffset: 2,
  },
  {
    id: "b-024",
    staffId: "diego-santos",
    start: "10:00",
    durationMin: 30,
    status: "cancelled",
    serviceCategory: "vet",
    serviceName: "Microchip",
    clientName: "Tom Cassidy",
    petName: "Bobo",
    petSpecies: "dog",
    priceMinor: 8000,
  },

  // Mei Tanaka — column 11
  {
    id: "b-025",
    staffId: "mei-tanaka",
    start: "9:45",
    durationMin: 45,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Wash Only MD",
    clientName: "Frances",
    petName: "Duke",
    petSpecies: "dog",
    priceMinor: 9000,
    dayOffset: 3,
  },
  {
    id: "b-026",
    staffId: "mei-tanaka",
    start: "11:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Full Grooming SM",
    clientName: "Luke Tan",
    petName: "Mango",
    petSpecies: "bird",
    priceMinor: 14000,
    dayOffset: 4,
  },
  {
    id: "b-027",
    staffId: "mei-tanaka",
    start: "12:30",
    durationMin: 45,
    status: "no-show",
    serviceCategory: "grooming",
    serviceName: "Wash & Blow Dry SM",
    clientName: "test michelle",
    petName: "Ginger",
    petSpecies: "cat",
    priceMinor: 10000,
  },
]

// Without-pets demo dataset. Generic salon / wellness services to show how
// the calendar reads when hasPets is false: client name is primary, no pet
// chips, no grooming-report affordances, no agreement banner, etc.
export const MOCK_BOOKINGS_WITHOUT_PETS: MockBooking[] = [
  {
    id: "wp-001",
    staffId: "aya-hassan",
    start: "9:00",
    durationMin: 45,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Haircut",
    clientName: "Megan O'Connor",
    clientPhone: "+971 50 217 8804",
    priceMinor: 18000,
    bookingRef: "B-22101",
    relationshipPills: ["Regular"],
  },
  {
    id: "wp-002",
    staffId: "aya-hassan",
    start: "10:00",
    durationMin: 60,
    status: "ready-for-pickup",
    serviceCategory: "grooming",
    serviceName: "Color + Toner",
    clientName: "Priya Suresh",
    clientPhone: "+971 50 311 4501",
    priceMinor: 32000,
    hasDeposit: true,
    depositAmountMinor: 10000,
    bookingRef: "B-22118",
    relationshipPills: ["VIP"],
    tags: ["Sensitive scalp"],
    notes: "Allergic to ammonia products.",
  },
  {
    id: "wp-003",
    staffId: "aya-hassan",
    start: "11:30",
    durationMin: 90,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Balayage",
    clientName: "Aishling Mc Mahon",
    clientPhone: "+971 50 998 3322",
    priceMinor: 56000,
    isRecurring: true,
    bookingRef: "B-22134",
    relationshipPills: ["VIP"],
  },
  {
    id: "wp-004",
    staffId: "lena-petrov",
    start: "9:15",
    durationMin: 30,
    status: "completed",
    serviceCategory: "details",
    serviceName: "Blow Dry",
    clientName: "Frances Lyon",
    priceMinor: 9000,
  },
  {
    id: "wp-005",
    staffId: "lena-petrov",
    start: "10:00",
    durationMin: 60,
    status: "checked-in",
    serviceCategory: "grooming",
    serviceName: "Cut & Blow Dry",
    clientName: "Grace Kent",
    clientPhone: "+971 50 871 6620",
    priceMinor: 22000,
    bookingRef: "B-22155",
    relationshipPills: ["Regular"],
    tags: ["No fragrance"],
  },
  {
    id: "wp-006",
    staffId: "lena-petrov",
    start: "11:30",
    durationMin: 45,
    status: "booked",
    serviceCategory: "details",
    serviceName: "Root Tint",
    clientName: "Nadia Martinez",
    priceMinor: 16000,
  },
  {
    id: "wp-007",
    staffId: "priya-nair",
    start: "9:00",
    durationMin: 60,
    status: "checked-in",
    serviceCategory: "details",
    serviceName: "Gel Manicure",
    clientName: "Lisa Lyons Wilson",
    priceMinor: 12000,
  },
  {
    id: "wp-008",
    staffId: "priya-nair",
    start: "10:30",
    durationMin: 75,
    status: "confirmed",
    serviceCategory: "details",
    serviceName: "Mani + Pedi",
    clientName: "Amy Patel",
    priceMinor: 26000,
  },
  {
    id: "wp-009",
    staffId: "marco-rossi",
    start: "9:00",
    durationMin: 60,
    status: "completed",
    serviceCategory: "grooming",
    serviceName: "Beard Trim + Hot Towel",
    clientName: "Luke Tan",
    priceMinor: 12000,
  },
  {
    id: "wp-010",
    staffId: "marco-rossi",
    start: "10:30",
    durationMin: 30,
    status: "confirmed",
    serviceCategory: "details",
    serviceName: "Quick Trim",
    clientName: "Diego Santos",
    priceMinor: 8000,
  },
  {
    id: "wp-011",
    staffId: "marco-rossi",
    start: "11:15",
    durationMin: 60,
    status: "booked",
    serviceCategory: "grooming",
    serviceName: "Skin Fade",
    clientName: "Marco Vidal",
    priceMinor: 15000,
  },
  {
    id: "wp-012",
    staffId: "sarah-khoury",
    start: "10:00",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "welcome",
    serviceName: "Consultation",
    clientName: "Sara Vincente",
    clientPhone: "+971 50 220 4488",
    priceMinor: 0,
    relationshipPills: ["First visit"],
  },
  {
    id: "wp-013",
    staffId: "olivia-park",
    start: "9:00",
    durationMin: 90,
    status: "checked-in",
    serviceCategory: "grooming",
    serviceName: "Deep Tissue Massage",
    clientName: "Violetta Romano",
    priceMinor: 28000,
  },
  {
    id: "wp-014",
    staffId: "mei-tanaka",
    start: "9:45",
    durationMin: 60,
    status: "confirmed",
    serviceCategory: "grooming",
    serviceName: "Hot Stone Massage",
    clientName: "Frances Lyon",
    priceMinor: 26000,
  },
  {
    id: "wp-015",
    staffId: "mei-tanaka",
    start: "11:30",
    durationMin: 45,
    status: "no-show",
    serviceCategory: "details",
    serviceName: "Eyebrow Threading",
    clientName: "Test Michelle",
    priceMinor: 6000,
  },
]

// ─────────────────────────────────────────────────────────────────────────
// Service catalog mock — used by the create-booking flow (service picker).
// ─────────────────────────────────────────────────────────────────────────

export type MockServiceCatalogItem = {
  id: string
  category: MockServiceCategory
  name: string
  durationMin: number
  priceMinor: number
  /** Soft warnings rendered as amber pills under the row in the picker.
   *  Used to surface eligibility issues (e.g. selected team member doesn't
   *  provide this service, service not available on this day). */
  warnings?: string[]
}

export const MOCK_SERVICE_CATALOG: MockServiceCatalogItem[] = [
  {
    id: "full-grooming-sm",
    category: "grooming",
    name: "Full Grooming SM",
    durationMin: 90,
    priceMinor: 21000,
  },
  {
    id: "full-grooming-md",
    category: "grooming",
    name: "Full Grooming MD",
    durationMin: 90,
    priceMinor: 22000,
  },
  {
    id: "full-grooming-lg",
    category: "grooming",
    name: "Full Grooming LG",
    durationMin: 120,
    priceMinor: 26000,
    warnings: ["Team member doesn't provide this service"],
  },
  {
    id: "deshedding-lg",
    category: "grooming",
    name: "Deshedding LG",
    durationMin: 90,
    priceMinor: 25000,
  },
  {
    id: "puppy-first",
    category: "grooming",
    name: "Puppy First Groom",
    durationMin: 60,
    priceMinor: 18000,
  },
  {
    id: "wash-blow-sm",
    category: "grooming",
    name: "Wash & Blow Dry SM",
    durationMin: 45,
    priceMinor: 18000,
  },
  {
    id: "wash-blow-md",
    category: "grooming",
    name: "Wash & Blow Dry MD",
    durationMin: 60,
    priceMinor: 20000,
  },
  {
    id: "wash-only-sm",
    category: "grooming",
    name: "Wash Only SM",
    durationMin: 30,
    priceMinor: 8000,
  },
  { id: "nails-clip", category: "details", name: "Nails Clip", durationMin: 15, priceMinor: 4000 },
  { id: "ear-clean", category: "details", name: "Ear Clean", durationMin: 15, priceMinor: 4000 },
  {
    id: "teeth-clean",
    category: "details",
    name: "Teeth Clean",
    durationMin: 30,
    priceMinor: 8000,
  },
  { id: "daycare-day", category: "daycare", name: "Day Care", durationMin: 540, priceMinor: 15000 },
  {
    id: "boarding-night",
    category: "boarding",
    name: "Boarding (per night)",
    durationMin: 1440,
    priceMinor: 20000,
  },
  {
    id: "vet-checkup",
    category: "vet",
    name: "Vet Checkup",
    durationMin: 30,
    priceMinor: 15000,
    warnings: ["Team member doesn't provide this service"],
  },
  { id: "meet-greet", category: "welcome", name: "Meet & Greet", durationMin: 30, priceMinor: 0 },
]

export const SERVICE_CATEGORY_LABEL: Record<MockServiceCategory, string> = {
  grooming: "Grooming",
  vet: "Vet",
  daycare: "Daycare",
  boarding: "Boarding",
  details: "Details",
  welcome: "Welcome",
}

// Left-bar accent color per service category in the picker list.
export const SERVICE_CATEGORY_ACCENT: Record<MockServiceCategory, string> = {
  grooming: "bg-cami-violet-9",
  vet: "bg-tomato-9",
  daycare: "bg-cami-yellow-9",
  boarding: "bg-cami-sage-9",
  details: "bg-cami-pink-9",
  welcome: "bg-lime-9",
}

export function formatDuration(durationMin: number): string {
  if (durationMin < 60) return `${durationMin}min`
  const h = Math.floor(durationMin / 60)
  const m = durationMin % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

// ─── WhatsApp message templates ───────────────────────────────────────────────
// Businesses store a handful of WhatsApp templates. The appointment Messages
// section surfaces them as quick-send buttons. Bodies carry {{tokens}} resolved
// from the booking before preview. Real impl reads from business settings.

/**
 * Deposit is orthogonal to lifecycle status (PRO-68): a booking can be
 * `booked + required` or `confirmed + paid`. The message dropdown gates on
 * status AND this axis, never status alone.
 */
export type DepositState = "none" | "required" | "paid" | "waived"

/**
 * How a template is sent. The appointments drawer shows manually-sendable
 * templates only (`manual` + `both`); `automated`-only templates fire on a
 * trigger and are configured in Settings, never hand-sent from the drawer.
 */
export type TemplateAutomation = "manual" | "automated" | "both"

export type WhatsAppTemplate = {
  id: string
  name: string
  /** Body with {{client}} {{service}} {{date}} {{time}} {{business}} {{paymentLink}} {{bookingLink}} tokens. */
  body: string
  /** Statuses this template is offered for. Dropdown filters to the booking's status. */
  statuses: MockBookingStatus[]
  /** Send mode (CSV "Automated / Manual" column). Drawer keeps manual + both. */
  automation: TemplateAutomation
  /** Extra deposit gate. When set, only show if the booking's deposit matches. */
  deposit?: Extract<DepositState, "required" | "paid">
}

export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  // ── Deposit ladder (SOTA) — booked + deposit owed ──────────────────────────
  {
    id: "appointment-created",
    name: "Appointment created",
    // Fires immediately on booking (CSV: Automated). Never hand-sent → hidden
    // from the drawer, configured in Settings.
    body: `Hi {{client}}! 🤍

Your appointment is booked — we can't wait to see you!

📅 {{date}} at {{time}}
🐾 {{service}} with {{staff}}

Team {{business}} x`,
    statuses: ["booked"],
    automation: "automated",
    deposit: "required",
  },
  {
    id: "deposit-reminder",
    name: "Deposit reminder",
    body: `Hi {{client}},

Just a heads-up — your deposit hasn't been received yet, but your spot is still held for you! 🤍

Please complete your 25% deposit to fully confirm your booking:
👉 {{paymentLink}}

Your slot may be released if payment isn't received soon.

Team {{business}} x`,
    statuses: ["booked"],
    automation: "both",
    deposit: "required",
  },
  {
    id: "final-confirmation",
    name: "Final confirmation",
    body: `Hi {{client}},

This is your final reminder — your deposit is due now to keep your appointment. ⏰

📅 {{date}} at {{time}}

Without payment, we'll need to release your slot to clients on our waitlist.
👉 {{paymentLink}}

We'd love to hold this spot for you — please act now!

Team {{business}} x`,
    statuses: ["booked"],
    automation: "both",
    deposit: "required",
  },
  {
    id: "deposit-not-received",
    name: "Deposit not received",
    body: `Hi {{client}},

As we haven't received your deposit, we've had to release your appointment and offer the slot to other clients. 🤍

We completely understand — and we'd love to welcome you another time! Whenever you're ready, you can rebook here:
👉 {{bookingLink}}

Thank you for your understanding,
Team {{business}} x`,
    statuses: ["booked", "cancelled"],
    automation: "manual",
  },
  // ── Confirmed + deposit paid ───────────────────────────────────────────────
  {
    id: "deposit-confirmation",
    name: "Deposit confirmation",
    body: `Hi {{client}}! 🤍

Your deposit is confirmed and your appointment is all set!

📅 {{date}} at {{time}}
🐾 {{service}} with {{staff}}

We're so excited to see you. If you have any questions before your visit, just reply to this message.

See you soon,
Team {{business}} x`,
    statuses: ["confirmed"],
    automation: "manual",
    deposit: "paid",
  },
  // ── Cancelled ──────────────────────────────────────────────────────────────
  {
    id: "appointment-cancelled",
    name: "Appointment cancelled",
    body: `Hi {{client}},

Your appointment on {{date}} at {{time}} has been cancelled. 🤍

If a deposit was paid, please allow up to 14 business days for the refund to appear in your account.

We'd love to welcome you back whenever you're ready:
👉 {{bookingLink}}

Thank you,
Team {{business}} x`,
    statuses: ["cancelled"],
    automation: "both",
  },
  // ── Generic lifecycle templates ────────────────────────────────────────────
  {
    id: "appointment-reminder",
    name: "Appointment reminder",
    body: `Hi {{client}}! 🤍

You're almost here — your appointment is today at {{time}}.

📍 {{location}}

We can't wait to see you! If anything's come up, please let us know right away.

Team {{business}} x`,
    statuses: ["confirmed"],
    automation: "both",
  },
  {
    id: "running-late",
    name: "Running late",
    body: "Hi {{client}}, we're running a little behind for your {{time}} appointment. Thanks for your patience — we'll be ready shortly.",
    statuses: ["checked-in"],
    automation: "manual",
  },
  {
    id: "ready-for-pickup",
    name: "Ready for pickup",
    body: "Hi {{client}}, {{service}} is all done and ready for pickup at {{business}}. See you soon!",
    statuses: ["ready-for-pickup"],
    automation: "both",
  },
]

/**
 * Templates offered in the appointments drawer for a booking's current state.
 * Only manually-sendable templates appear (`manual` + `both`); `automated`-only
 * templates fire on a trigger and live in Settings. Gates on status, then on the
 * deposit axis when a template declares one. Empty result → caller shows the
 * "Write custom message" fallback only.
 */
export function templatesForBooking(
  status: MockBookingStatus,
  depositState: DepositState = "none",
  all: WhatsAppTemplate[] = MOCK_WHATSAPP_TEMPLATES,
): WhatsAppTemplate[] {
  return all.filter((t) => {
    if (t.automation === "automated") return false
    if (!t.statuses.includes(status)) return false
    if (t.deposit && t.deposit !== depositState) return false
    return true
  })
}

// The token vocabulary and its resolver now live in lib/comms/tokens.ts, so the
// settings-side template editor (DSG-83) and the appointments drawer read one
// list. Re-exported here because the drawer callers import them from this mock.
export { resolveTemplate, type TemplateTokens } from "@/lib/comms/tokens"
