import type { AvatarSpecies } from "@/components/ui/avatar"
import type { PetSize } from "@/lib/boarding-mock"

// ─── Daycare domain ────────────────────────────────────────────────────────────
// Same-day pet stays. Priced per session/day, placed on a time axis with staff
// columns (Day view) or summarized as counts (Month view). Mirrors the Cuddles
// daycare reference but uses the cami design system + the appointment-style
// day-grid conventions (staff columns × hourly rows).

export type DaycareStatus = "booked" | "checked-in" | "checked-out" | "cancelled" | "no-show"

export type DaycareStaff = { id: string; name: string }

// `null` staffId → the Unassigned column.
export const DAYCARE_STAFF: ReadonlyArray<DaycareStaff> = [
  { id: "u1", name: "Michelle You" },
  { id: "u2", name: "Aisha K." },
  { id: "u3", name: "Diego R." },
]

export type DaycareAddOn = { id: string; label: string; priceMinor: number }

export type DaycareSession = {
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
  // Session
  serviceName: string
  priceMinor: number
  /** Plan label shown in the drawer, e.g. "Full Day · Up to 2 hours". */
  planLabel?: string
  facilityRoom?: string
  /** null = Unassigned column. */
  staffId: string | null
  /** ISO date "2026-07-08". */
  date: string
  /** "HH:MM" 24h start. */
  start: string
  durationMin: number
  status: DaycareStatus
  addOns: DaycareAddOn[]
  lateCheckoutFee: boolean
  notes?: string
}

// ─── Day grid geometry (hourly, mirrors appointment resource grid) ─────────────

export const DAY_START_MIN = 8 * 60 // 8:00 AM
export const DAY_END_MIN = 21 * 60 // 9:00 PM
export const PX_PER_MIN = 0.95

export const DAYCARE_ADD_ON_CATALOG: ReadonlyArray<DaycareAddOn> = [
  { id: "feed", label: "Lunch feeding", priceMinor: 1500 },
  { id: "walk", label: "Extra play session", priceMinor: 2000 },
  { id: "report", label: "Report card", priceMinor: 1000 },
]

// ─── Anchor day + month ────────────────────────────────────────────────────────

export const DAY_ISO = "2026-07-08"
export const MONTH_LABEL = "July, 2026"

// ─── Mock sessions ─────────────────────────────────────────────────────────────

export const DAYCARE_SESSIONS: ReadonlyArray<DaycareSession> = [
  {
    id: "d1",
    petName: "Biscuit",
    petSpecies: "dog",
    petBreed: "Golden Retriever",
    petSize: "Large",
    clientName: "Layla Hassan",
    clientPhone: "055 373 5522",
    clientEmail: "layla@example.com",
    serviceName: "Full-day daycare",
    priceMinor: 6000,
    planLabel: "Full Day · Up to 8 hours",
    facilityRoom: "Main House — Play Hall",
    staffId: "u1",
    date: "2026-07-08",
    start: "09:00",
    durationMin: 480,
    status: "checked-in",
    addOns: [{ id: "feed", label: "Lunch feeding", priceMinor: 1500 }],
    lateCheckoutFee: false,
    notes: "High energy, loves fetch.",
  },
  {
    id: "d2",
    petName: "Mochi",
    petSpecies: "cat",
    petBreed: "British Shorthair",
    petSize: "Small",
    clientName: "Omar Sayed",
    clientPhone: "050 118 2200",
    serviceName: "Half-day daycare",
    priceMinor: 3500,
    planLabel: "Half Day · Up to 4 hours",
    facilityRoom: "Cattery — Quiet Room",
    staffId: "u2",
    date: "2026-07-08",
    start: "10:30",
    durationMin: 240,
    status: "booked",
    addOns: [],
    lateCheckoutFee: false,
  },
  {
    id: "d3",
    petName: "Rex",
    petSpecies: "dog",
    petBreed: "German Shepherd",
    petSize: "X-Large",
    clientName: "Nadia Karim",
    clientPhone: "052 900 4410",
    serviceName: "Daycare + training",
    priceMinor: 9000,
    planLabel: "Full Day · Up to 8 hours",
    facilityRoom: "Main House — Play Hall",
    staffId: "u1",
    date: "2026-07-08",
    start: "13:00",
    durationMin: 300,
    status: "booked",
    addOns: [{ id: "walk", label: "Extra play session", priceMinor: 2000 }],
    lateCheckoutFee: false,
  },
  {
    id: "d4",
    petName: "Pip",
    petSpecies: "rabbit",
    petBreed: "Holland Lop",
    petSize: "X-Small",
    clientName: "Sara Ali",
    clientPhone: "056 220 1188",
    serviceName: "Small-pet daycare",
    priceMinor: 2500,
    planLabel: "Drop-in · Up to 2 hours",
    facilityRoom: "Main House — Small Pets",
    // Unassigned column.
    staffId: null,
    date: "2026-07-08",
    start: "16:15",
    durationMin: 45,
    status: "booked",
    addOns: [],
    lateCheckoutFee: false,
    notes: "Timothy hay only.",
  },
  {
    id: "d5",
    petName: "Luna",
    petSpecies: "cat",
    petBreed: "Persian",
    petSize: "Small",
    clientName: "Yousef Rahman",
    clientPhone: "054 771 3030",
    serviceName: "Half-day daycare",
    priceMinor: 3500,
    planLabel: "Half Day · Up to 4 hours",
    facilityRoom: "Cattery — Quiet Room",
    staffId: "u3",
    date: "2026-07-08",
    start: "11:00",
    durationMin: 240,
    status: "checked-out",
    addOns: [{ id: "report", label: "Report card", priceMinor: 1000 }],
    lateCheckoutFee: true,
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

/** "HH:MM" → minutes from midnight. */
export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

/** "HH:MM" → "9:00 AM". */
export function formatTime(time: string): string {
  const total = minutesOf(time)
  const h = Math.floor(total / 60)
  const m = total % 60
  const period = h >= 12 ? "PM" : "AM"
  const display = ((h + 11) % 12) + 1
  return `${display}:${String(m).padStart(2, "0")} ${period}`
}

export function endTime(start: string, durationMin: number): string {
  const total = minutesOf(start) + durationMin
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function formatTimeRange(start: string, durationMin: number): string {
  return `${formatTime(start)} - ${formatTime(endTime(start, durationMin))}`
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}

export function hourLabels(): { min: number; label: string }[] {
  const out: { min: number; label: string }[] = []
  for (let t = DAY_START_MIN; t <= DAY_END_MIN; t += 60) {
    const h = Math.floor(t / 60)
    const period = h >= 12 ? "PM" : "AM"
    const display = ((h + 11) % 12) + 1
    out.push({ min: t - DAY_START_MIN, label: `${display} ${period}` })
  }
  return out
}

// ─── Month grid ────────────────────────────────────────────────────────────────

export type MonthCell = { iso: string; day: number; inMonth: boolean }

/** 6×7 grid of cells for July 2026, Sunday-first (matches the reference). */
export function monthGrid(): MonthCell[] {
  // July 2026: 1st is a Wednesday. Grid starts on the preceding Sunday (Jun 28).
  const cells: MonthCell[] = []
  const start = new Date(2026, 5, 28) // Jun 28 2026 (Sunday)
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const dd = String(d.getDate()).padStart(2, "0")
    cells.push({ iso: `${y}-${m}-${dd}`, day: d.getDate(), inMonth: d.getMonth() === 6 })
  }
  return cells
}

export function sessionCountByDate(
  sessions: ReadonlyArray<DaycareSession>,
): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of sessions) out[s.date] = (out[s.date] ?? 0) + 1
  return out
}

export function staffName(id: string | null): string {
  if (!id) return "Unassigned"
  return DAYCARE_STAFF.find((s) => s.id === id)?.name ?? "—"
}

export const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const
