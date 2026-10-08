// Stand-in for the customer module's reads behind `ClientSummary`: the client's
// appointments (useCustomerAppointments, business-wide) and notes. The card
// displays these and computes nothing (FND-4, display only).

import type { PetNoteEntry } from "@/lib/pet-notes"

/** Same reference day as the seeded demos, so relative dates read the same. */
const REF = Date.UTC(2026, 8, 24, 10, 30)
const DAY = 24 * 60 * 60 * 1000
const daysFrom = (n: number) => new Date(REF + n * DAY).toISOString()

export type SummaryVisitLine = {
  service: string
  staffName: string
  /** AED, integer minor units (fils). Upcoming: the booked price. */
  amountMinor: number
}

/** One appointment: a day, and every service in it. */
export type SummaryVisit = { id: string; at: string; lines: SummaryVisitLine[] }

export type SummaryNote = { id: string; body: string; authorName: string; at: string }

export type ClientSummaryHistory = {
  /** Booked and not yet happened, soonest first. */
  upcoming: SummaryVisit[]
  /** Completed, most recent first, first three only. */
  visits: SummaryVisit[]
  notes: SummaryNote[]
  /** Pet notes by pet name. They travel with the animal, not the client. */
  petNotes: Record<string, PetNoteEntry[]>
}

const line = (service: string, staffName: string, aed: number): SummaryVisitLine => ({
  service,
  staffName,
  amountMinor: aed * 100,
})
/** Negative days are past, positive are upcoming. */
const visit = (id: string, days: number, ...lines: SummaryVisitLine[]): SummaryVisit => ({
  id,
  at: daysFrom(days),
  lines,
})

const APPOINTMENTS: Record<string, SummaryVisit[]> = {
  "cus-layla": [
    visit(
      "l0",
      1,
      line("Full groom with de-shedding treatment and blueberry facial", "Aisha Rahman", 340),
      line("Nail trim and paw pad tidy", "Queenie Santos", 60),
    ),
    visit("l1", -34, line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 280)),
    visit("l2", -48, line("Nail trim and paw pad tidy", "Queenie Santos", 60)),
    visit(
      "l3",
      -62,
      line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 280),
      line("Nail trim and paw pad tidy", "Queenie Santos", 60),
    ),
    visit("l4", -90, line("Full groom, medium breed, hand scissoring", "Mona Haddad", 280)),
  ],
  "cus-omar": [
    visit("o1", -27, line("Bath, blow-dry and sanitary tidy", "Mona Haddad", 180)),
    visit(
      "o2",
      -55,
      line("Bath, blow-dry and sanitary tidy", "Mona Haddad", 180),
      line("De-shedding treatment with conditioning mask", "Aisha Rahman", 220),
    ),
    visit("o3", -83, line("Bath, blow-dry and sanitary tidy", "Aisha Rahman", 180)),
  ],
  "cus-sara": [
    visit("s1", -12, line("Puppy introduction groom, under 6 months", "Queenie Santos", 150)),
  ],
  "cus-noura": [
    visit("n0", 4, line("Nail trim and paw pad tidy", "Mona Haddad", 60)),
    visit("n1", -60, line("Nail trim and paw pad tidy", "Mona Haddad", 60)),
    visit("n2", -95, line("Nail trim and paw pad tidy", "Mona Haddad", 60)),
  ],
  "cus-maryam": [
    visit("m1", -45, line("De-shedding treatment with conditioning mask", "Mona Haddad", 220)),
  ],
  // Two dogs on one account: one visit, two grooms.
  "cus-huda": [
    visit(
      "h1",
      -20,
      line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 260),
      line("Full groom, medium breed, hand scissoring", "Queenie Santos", 260),
    ),
    visit(
      "h2",
      -48,
      line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 260),
      line("Bath, blow-dry and sanitary tidy", "Queenie Santos", 150),
    ),
    visit("h3", -76, line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 260)),
  ],
  "cus-fatima-hashimi": [
    visit("f1", -90, line("Bath, blow-dry and sanitary tidy", "Queenie Santos", 180)),
  ],
  "cus-ahmed": [
    visit("a1", -400, line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 250)),
  ],
  "cus-rana": [visit("r1", -15, line("Nail trim and paw pad tidy", "Mona Haddad", 60))],
  "cus-khalid": [
    visit("k1", -40, line("Full groom, medium breed, hand scissoring", "Aisha Rahman", 300)),
  ],
  "cus-khalid-2": [
    visit("k2", -300, line("Bath, blow-dry and sanitary tidy", "Queenie Santos", 180)),
  ],
}

const NOTES: Record<string, SummaryNote[]> = {
  "cus-layla": [
    {
      id: "nl2",
      body: "Imported from their old system: 2 unused vouchers on the account, expiring 31 Dec 2026.",
      authorName: "Queenie",
      at: daysFrom(-120),
    },
  ],
  "cus-sara": [
    { id: "ns1", body: "Prefers morning slots.", authorName: "Queenie", at: daysFrom(-12) },
  ],
  "cus-huda": [
    {
      id: "nh1",
      body: "Two dogs on one account, Bella (mum's) and Max (Huda's). Ask which one when booking.",
      authorName: "Queenie",
      at: daysFrom(-20),
    },
  ],
}

const PET_NOTES: Record<string, Record<string, PetNoteEntry[]>> = {
  "cus-layla": {
    Coco: [{ category: "behavior", detail: "Anxious with the dryer. Hand-dry, low heat." }],
  },
  "cus-sara": {
    Milo: [{ category: "grooming-sensitivity", detail: "Sensitive skin, mats behind the ears." }],
  },
  "cus-huda": {
    Bella: [
      { category: "allergies", detail: "Oatmeal shampoo." },
      { category: "handling", detail: "Needs a muzzle for nail trims." },
    ],
  },
}

export function readClientSummaryHistory(customerId: string, now = REF): ClientSummaryHistory {
  const all = APPOINTMENTS[customerId] ?? []
  const byTime = (a: SummaryVisit, b: SummaryVisit) => Date.parse(a.at) - Date.parse(b.at)
  return {
    upcoming: all.filter((v) => Date.parse(v.at) > now).sort(byTime),
    visits: all
      .filter((v) => Date.parse(v.at) <= now)
      .sort((a, b) => byTime(b, a))
      .slice(0, 3),
    notes: NOTES[customerId] ?? [],
    petNotes: PET_NOTES[customerId] ?? {},
  }
}
