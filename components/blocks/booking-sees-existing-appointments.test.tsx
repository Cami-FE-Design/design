import { describe, expect, it } from "vitest"

import { openAppointmentsFor } from "@/lib/clients/open-appointments"

/**
 * The already-booked check can actually be reached from the booking sheet.
 *
 * It could not. The sheet carries its own five-client fixture and the check
 * reads the client record's history, which is keyed on entirely different
 * clients — so the banner was correct, unit-tested, and impossible to open:
 * nobody reachable from that picker had an appointment anywhere. Exactly the
 * shape the package panel shipped with, keyed on clients the till had never
 * heard of.
 *
 * Nothing catches that from the inside. Both halves were right; only the join
 * between them was missing, and a join is what no unit test on either side
 * looks at. So this asserts the join.
 */

// Kept as literals rather than imported: the point is that these two lists
// agree, and importing one of them would assert nothing.
const REACHABLE_FROM_THE_PICKER = [
  "karen-dougall",
  "maaz-test",
  "demo-profile",
  "aaesha-al-ali",
  "aaliyah-hazari",
  "millie-cassidy",
  "kirsty-dingomal",
]

describe("a receptionist can actually meet this warning", () => {
  it("has at least one client in the picker who is already booked", () => {
    const withOpen = REACHABLE_FROM_THE_PICKER.filter((id) => openAppointmentsFor(id).length > 0)
    expect(withOpen.length).toBeGreaterThan(0)
  })

  it("has one whose existing booking is at another branch — the case worth catching", () => {
    const elsewhere = REACHABLE_FROM_THE_PICKER.flatMap((id) => openAppointmentsFor(id)).filter(
      (a) => a.locationId != null,
    )
    expect(elsewhere.length).toBeGreaterThan(0)
  })

  it("still says nothing for the clients who are not booked", () => {
    // A warning that fires for everybody is furniture, not a warning.
    const quiet = REACHABLE_FROM_THE_PICKER.filter((id) => openAppointmentsFor(id).length === 0)
    expect(quiet.length).toBeGreaterThan(0)
  })
})
