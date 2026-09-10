import type { RosterMember, Shift } from "@/lib/team/shifts"

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
  // Lena: JVC mornings, Jumeirah evenings. Two branches in one day, no
  // overlap — the arrangement DW2.3 is written for, and it must not be flagged.
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

  /**
   * Sara: rostered at both branches over the same hours on Wednesday. This is
   * DW2.4's case, and the only kind of overlap that is a conflict — one person
   * cannot be in two places, however the branches were configured.
   */
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

  // Two shifts at the same branch, overlapping. Legal, and ADR-023 says so
  // explicitly — seeded so the screen can be checked for *not* flagging it.
  {
    id: "s5",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "09:00",
    end: "14:00",
  },
  {
    id: "s6",
    memberId: "mariam",
    locationId: "shampooch-jvc",
    day: "thu",
    start: "12:00",
    end: "18:00",
  },

  // A split shift at one branch, which is ordinary.
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
]
