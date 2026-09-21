import type { BlockTime, Leave, RosterMember, Shift } from "@/lib/team/shifts"

/**
 * A roster week seeded for the states that carry a rule (DW2.3, DW2.4).
 *
 * The names are the bookable roster's, so a branch's roster and the staff a
 * client can pick are the same people rather than two lists — see
 * `BOOKING_STAFF` in lib/booking.ts.
 */
export const ROSTER_MEMBERS: RosterMember[] = [
  // Assigned to two branches, and the reason DW2.3 exists: mornings at one,
  // evenings at the other.
  {
    id: "lena",
    name: "Lena Hassan",
    role: "Senior groomer",
    locationIds: ["shampooch-jvc", "shampooch-jumeirah"],
  },
  // Also two branches, and deliberately the one with a clash below.
  {
    id: "sara",
    name: "Sara Ali",
    role: "Stylist",
    locationIds: ["shampooch-jvc", "shampooch-jumeirah"],
  },
  { id: "mariam", name: "Mariam Saleh", role: "Groomer", locationIds: ["shampooch-jvc"] },
  { id: "omar", name: "Omar Farooq", role: "Groomer", locationIds: ["shampooch-jumeirah"] },
]

export const ROSTER_SHIFTS: Shift[] = [
  /**
   * Lena works both branches. Tuesday and Thursday are the split day DW2.3 is
   * written for — mornings at one, evenings at the other — and they must never
   * be flagged. Wednesday and Saturday are Jumeirah only, Monday and Friday JVC
   * only, and Sunday is her day off.
   */
  {
    id: "s11",
    memberId: "lena",
    locationId: "shampooch-jvc",
    day: "mon",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s1",
    memberId: "lena",
    locationId: "shampooch-jvc",
    day: "tue",
    start: "09:00",
    end: "13:00",
  },
  {
    id: "s2",
    memberId: "lena",
    locationId: "shampooch-jumeirah",
    day: "tue",
    start: "15:00",
    end: "20:00",
  },
  {
    id: "s12",
    memberId: "lena",
    locationId: "shampooch-jumeirah",
    day: "wed",
    start: "12:00",
    end: "20:00",
  },

  // The same split again on Thursday, so the leave in ROSTER_LEAVES lands on a
  // day she is genuinely due at both. A full-day leave falling on a day
  // somebody was not working anyway proves nothing.
  {
    id: "s9",
    memberId: "lena",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "09:00",
    end: "13:00",
  },
  {
    id: "s10",
    memberId: "lena",
    locationId: "shampooch-jumeirah",
    day: "thu",
    start: "15:00",
    end: "19:00",
  },
  {
    id: "s13",
    memberId: "lena",
    locationId: "shampooch-jvc",
    day: "fri",
    start: "10:00",
    end: "18:00",
  },
  {
    id: "s14",
    memberId: "lena",
    locationId: "shampooch-jumeirah",
    day: "sat",
    start: "10:00",
    end: "18:00",
  },

  /**
   * Sara: rostered at both branches over the same hours on Wednesday. This is
   * DW2.4's case, and the only kind of overlap that is a conflict — one person
   * cannot be in two places, however the branches were configured. Her other
   * days are ordinary single-branch ones, so the clash reads as the exception
   * it is rather than as the shape of her week.
   */
  {
    id: "s15",
    memberId: "sara",
    locationId: "shampooch-jvc",
    day: "mon",
    start: "10:00",
    end: "18:00",
  },
  {
    id: "s16",
    memberId: "sara",
    locationId: "shampooch-jumeirah",
    day: "tue",
    start: "10:00",
    end: "18:00",
  },
  {
    id: "s3",
    memberId: "sara",
    locationId: "shampooch-jvc",
    day: "wed",
    start: "10:00",
    end: "16:00",
  },
  {
    id: "s4",
    memberId: "sara",
    locationId: "shampooch-jumeirah",
    day: "wed",
    start: "14:00",
    end: "19:00",
  },
  {
    id: "s17",
    memberId: "sara",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "10:00",
    end: "18:00",
  },
  {
    id: "s18",
    memberId: "sara",
    locationId: "shampooch-jvc",
    day: "sat",
    start: "11:00",
    end: "19:00",
  },

  // Mariam is at JVC only, five days. Thursday is a split shift with a proper
  // break: the built product's shift dialog refuses two windows that overlap at
  // one branch and requires at least thirty minutes between them, so a rota
  // with an overlap in it is a state nobody can actually create.
  {
    id: "s19",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "mon",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s20",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "tue",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s21",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "wed",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s5",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "09:00",
    end: "13:00",
  },
  {
    id: "s6",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "14:00",
    end: "18:00",
  },
  {
    id: "s22",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "fri",
    start: "09:00",
    end: "17:00",
  },

  // Omar is at Jumeirah only. His Tuesday is a split shift at one branch, which
  // is ordinary and is also where the half-day sick leave lands.
  {
    id: "s23",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "mon",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s7",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "tue",
    start: "09:00",
    end: "12:00",
  },
  {
    id: "s8",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "tue",
    start: "16:00",
    end: "20:00",
  },
  {
    id: "s24",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "wed",
    start: "09:00",
    end: "17:00",
  },
  {
    id: "s25",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "fri",
    start: "12:00",
    end: "20:00",
  },
  {
    id: "s26",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    day: "sat",
    start: "10:00",
    end: "18:00",
  },
]

/**
 * Time off. `locationId` records where it was entered, not where it applies.
 *
 * Lena works two branches on Thursday and is entered as off at **one** of them,
 * which is the case worth reviewing: her JVC leave closes her Jumeirah day too,
 * because somebody away is away. Scoped to the branch that filed it, Jumeirah
 * would happily roster and sell a person who is out of the country.
 */
export const ROSTER_LEAVES: Leave[] = [
  {
    id: "l1",
    memberId: "lena",
    locationId: "shampooch-jvc",
    type: "Annual leave",
    day: "thu",
    start: "09:00",
    end: "18:00",
    fullDay: true,
  },
  // Half a day, inside a shift. The grid has to split the window around it
  // rather than draw one pill over hours she is not there for.
  {
    id: "l2",
    memberId: "omar",
    locationId: "shampooch-jumeirah",
    type: "Sick leave",
    day: "tue",
    start: "10:00",
    end: "11:30",
    fullDay: false,
  },
]

/**
 * Block times — a branch's own hole in the day, not the person's. Seeded at one
 * branch for somebody who works at two, so the grid can be checked for *not*
 * carrying it across.
 */
export const ROSTER_BLOCKS: BlockTime[] = [
  {
    id: "bt1",
    memberId: "sara",
    locationId: "shampooch-jvc",
    day: "wed",
    title: "Lunch",
    start: "12:00",
    end: "12:30",
  },
  {
    id: "bt2",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "thu",
    title: "Training",
    start: "15:00",
    end: "16:00",
  },
]

// ─── The same estate at nine branches ─────────────────────────────────────────
//
// Three branches is where a layout looks fine and a rule looks obvious. Nine is
// where both get tested: a tab row that has to stay readable, a person spread
// over three sites, a branch with nobody on it, and a suspended one that still
// holds a rota. Six defects in this repo have only ever shown up at nine.

const DOWNTOWN = "shampooch-downtown-dubai"
const MARINA = "shampooch-dubai-marina"
const MIRDIF = "shampooch-mirdif"
const AL_REEM = "shampooch-al-reem"
const AL_MAJAZ = "shampooch-al-majaz"
const YAS = "shampooch-yas-island"

export const NINE_BRANCH_MEMBERS: RosterMember[] = [
  ...ROSTER_MEMBERS,
  // Three branches, which is where "Also at …" stops being one name and a
  // per-branch hours total stops being guessable from the person's week.
  {
    id: "yara",
    name: "Yara Haddad",
    role: "Senior groomer",
    locationIds: [DOWNTOWN, MARINA, MIRDIF],
  },
  // Across an emirate line, so the estate is not one city's rota.
  { id: "faris", name: "Faris Nasser", role: "Groomer", locationIds: [AL_REEM, AL_MAJAZ] },
  { id: "noor", name: "Noor Abbas", role: "Bather", locationIds: [MARINA] },
  // Assigned only to the suspended branch: a rota can outlive trading, and the
  // screen has to hold both facts at once.
  { id: "hadi", name: "Hadi Mansour", role: "Groomer", locationIds: [YAS] },
]

export const NINE_BRANCH_SHIFTS: Shift[] = [
  ...ROSTER_SHIFTS,

  // Yara: three branches in one week, none of them overlapping. The shape
  // DW2.3 is written for, at the size that makes it hard to read by eye.
  { id: "n1", memberId: "yara", locationId: DOWNTOWN, day: "mon", start: "09:00", end: "17:00" },
  { id: "n2", memberId: "yara", locationId: MARINA, day: "tue", start: "10:00", end: "18:00" },
  { id: "n3", memberId: "yara", locationId: MIRDIF, day: "wed", start: "09:00", end: "15:00" },
  { id: "n4", memberId: "yara", locationId: DOWNTOWN, day: "thu", start: "09:00", end: "17:00" },
  { id: "n5", memberId: "yara", locationId: MARINA, day: "fri", start: "12:00", end: "20:00" },

  // Faris: two emirates, and a clash on Saturday. At three branches the one
  // clash was easy to spot; at nine it is the reason the banner exists.
  { id: "n6", memberId: "faris", locationId: AL_REEM, day: "mon", start: "09:00", end: "17:00" },
  { id: "n7", memberId: "faris", locationId: AL_MAJAZ, day: "wed", start: "10:00", end: "18:00" },
  { id: "n8", memberId: "faris", locationId: AL_REEM, day: "sat", start: "10:00", end: "18:00" },
  { id: "n9", memberId: "faris", locationId: AL_MAJAZ, day: "sat", start: "14:00", end: "20:00" },

  { id: "n10", memberId: "noor", locationId: MARINA, day: "mon", start: "11:00", end: "19:00" },
  { id: "n11", memberId: "noor", locationId: MARINA, day: "tue", start: "11:00", end: "19:00" },
  { id: "n12", memberId: "noor", locationId: MARINA, day: "sat", start: "10:00", end: "18:00" },

  // Rostered at a suspended branch. Nothing about a rota stops when trading
  // does, and a screen that hid this would lose the hours somebody is owed.
  { id: "n13", memberId: "hadi", locationId: YAS, day: "tue", start: "09:00", end: "17:00" },
  { id: "n14", memberId: "hadi", locationId: YAS, day: "thu", start: "09:00", end: "17:00" },
]

export const NINE_BRANCH_LEAVES: Leave[] = [
  ...ROSTER_LEAVES,
  // At one of Yara's three branches, so the DW2.2 cost is visible at the size
  // where nobody can hold the whole estate in their head.
  {
    id: "n-l1",
    memberId: "yara",
    locationId: MIRDIF,
    type: "Annual leave",
    day: "wed",
    start: "00:00",
    end: "23:30",
    fullDay: true,
    approved: true,
  },
]
