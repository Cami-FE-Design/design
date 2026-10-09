// The one list of people who work at the businesses in this demo.
//
// Every screen that shows staff reads it — the calendar's columns, who a
// client can pick when booking, the rota, the service menu's team, daycare,
// the till — so a groomer on the calendar is the same person on the rota and
// on a receipt. Before this there were nine lists with nine different casts,
// and several of their names were also clients'. A name here is never a
// client's, a pet parent's or Cami's own staff's.
//
// What someone can *access* (role, grants, invite status) is a different
// question and lives in lib/team/mock.ts, keyed by these ids. So does anything
// a single feature adds about a person: shifts (lib/team/shifts-mock.ts),
// which services they perform (lib/service-catalog).

export type BusinessId = "shampooch" | "purr-palace" | "sota"

export type StaffMember = {
  id: string
  name: string
  /** Job title as shown under the name. */
  role: string
  businessId: BusinessId
  /**
   * The branches this person actually works (R05, DW2.3). A booking's branch
   * resolves through here rather than being assigned to it.
   *
   * Two branches means a genuinely split week, not a person in two places: the
   * branch is picked by the day, the way a rota does it.
   */
  locationIds: string[]
  /** Takes appointments. The owner runs the business but has no calendar column. */
  bookable: boolean
  photoUrl?: string
}

const JVC = "shampooch-jvc"
const JUMEIRAH = "shampooch-jumeirah"
const DOWNTOWN = "shampooch-downtown-dubai"
const MIRDIF = "shampooch-mirdif"
const MARINA = "shampooch-dubai-marina"
const AL_MAJAZ = "shampooch-al-majaz"
const AL_REEM = "shampooch-al-reem"
const YAS = "shampooch-yas-island"
const PURR_PALACE = "purr-palace"
const SOTA = "sota"

const shampooch = (id: string, name: string, role: string, locationIds: string[]): StaffMember => ({
  id,
  name,
  role,
  businessId: "shampooch",
  locationIds,
  bookable: true,
})

export const STAFF: ReadonlyArray<StaffMember> = [
  // ── Shampooch ─────────────────────────────────────────────────────────────
  // The owner. Runs every branch, books nobody, so no calendar column.
  {
    id: "maz-khan",
    name: "Maz Khan",
    role: "Owner",
    businessId: "shampooch",
    locationIds: [],
    bookable: false,
  },
  shampooch("aya-hassan", "Aya Hassan", "Senior Groomer", [JVC]),
  // Works both Dubai branches on a split day: the person DW2.3 is written for.
  shampooch("lena-petrov", "Lena Petrov", "Groomer", [JVC, JUMEIRAH]),
  shampooch("priya-nair", "Priya Nair", "Groomer", [JVC]),
  shampooch("marco-rossi", "Marco Rossi", "Senior Groomer", [JUMEIRAH]),
  shampooch("joel-batumbya", "Joel Batumbya", "Junior Groomer", [JVC]),
  shampooch("sarah-khoury", "Dr. Sarah Khoury", "Veterinarian", [DOWNTOWN]),
  shampooch("fatima-ali", "Fatima Ali", "Daycare Lead", [MIRDIF]),
  shampooch("hassan-kareem", "Hassan Kareem", "Boarding Attendant", [MIRDIF]),
  shampooch("olivia-park", "Olivia Park", "Trainer", [MARINA]),
  shampooch("diego-santos", "Diego Santos", "Vet Tech", [DOWNTOWN]),
  shampooch("mei-tanaka", "Mei Tanaka", "Groomer", [JUMEIRAH]),
  // Sharjah, so the estate's third emirate has somebody in it.
  shampooch("noor-jaber", "Noor Jaber", "Groomer", [AL_MAJAZ]),
  // Al Reem had nobody, which is not a quiet branch — it is a branch that
  // cannot take a booking at all, because `branchForBooking` resolves a
  // booking's branch through whoever performs it.
  shampooch("rana-idris", "Rana Idris", "Senior Groomer", [AL_REEM]),
  // Abu Dhabi's two branches share a groomer, so the estate has a split week
  // outside Dubai as well — the case DW2.2 is about.
  shampooch("omar-said", "Omar Said", "Groomer", [AL_REEM, DOWNTOWN]),
  // The rota's own cases (lib/team/shifts-mock.ts). Rostered at both Dubai
  // branches at once on a Wednesday — the clash the banner exists for.
  shampooch("tala-odeh", "Tala Odeh", "Stylist", [JVC, JUMEIRAH]),
  // Three branches, where "Also at …" stops being one name.
  shampooch("huda-karam", "Huda Karam", "Senior Groomer", [DOWNTOWN, MARINA, MIRDIF]),
  // Across an emirate line, with a Saturday clash.
  shampooch("faris-nasser", "Faris Nasser", "Groomer", [AL_REEM, AL_MAJAZ]),
  // Assigned only to the suspended branch: a rota can outlive trading.
  shampooch("hadi-mansour", "Hadi Mansour", "Groomer", [YAS]),

  // ── The other two businesses. Their people are theirs — a grant never
  // reaches across a business, so these never appear under Shampooch (R18).
  {
    id: "dana-aziz",
    name: "Dana Aziz",
    role: "Senior Groomer",
    businessId: "purr-palace",
    locationIds: [PURR_PALACE],
    bookable: true,
  },
  {
    id: "sami-haddad",
    name: "Sami Haddad",
    role: "Groomer",
    businessId: "purr-palace",
    locationIds: [PURR_PALACE],
    bookable: true,
  },
  {
    id: "lina-farouk",
    name: "Lina Farouk",
    role: "Colourist",
    businessId: "sota",
    locationIds: [SOTA],
    bookable: true,
  },
  {
    id: "yara-nasr",
    name: "Yara Nasr",
    role: "Stylist",
    businessId: "sota",
    locationIds: [SOTA],
    bookable: true,
  },
]

export function staffById(id: string): StaffMember | undefined {
  return STAFF.find((s) => s.id === id)
}

/** The people who take appointments at one business. */
export function bookableStaff(businessId: BusinessId): StaffMember[] {
  return STAFF.filter((s) => s.businessId === businessId && s.bookable)
}

/** Look a person up by the ids a feature keeps, in that order. */
export function staffByIds(ids: ReadonlyArray<string>): StaffMember[] {
  return ids.map((id) => {
    const person = staffById(id)
    if (!person) throw new Error(`No staff member "${id}" in lib/team/staff.ts`)
    return person
  })
}
