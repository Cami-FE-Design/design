import { describe, expect, it } from "vitest"

import { openAppointmentsFor, spansOtherBranches } from "@/lib/clients/open-appointments"

/**
 * The duplicate is caught before the booking, not after (CL-A1 / RC-B1, EC-1).
 *
 * The PRD's last user story ends "Duplicate caught before booking", and the
 * readable half of it — a client's visits across the estate — shipped with
 * SCR-07. The catching half did not: a record answers only when somebody opens
 * it, and somebody mid-booking does not. So these assert what the booking sheet
 * is handed, and in particular that it is NOT bounded by the grant — the
 * duplicate worth catching is the one at the branch you cannot see.
 */

const MILLIE = "millie-cassidy"
const KIRSTY = "kirsty-dingomal"

describe("what the booking sheet is told about a client", () => {
  it("lists only appointments still to be honoured", () => {
    const open = openAppointmentsFor(MILLIE)
    // Millie's record holds completed visits and a no-show as well.
    expect(open.length).toBeGreaterThan(0)
    expect(open.every((a) => a.when.length > 0)).toBe(true)
  })

  it("carries R13's field set: date, location and service", () => {
    const [first] = openAppointmentsFor(MILLIE)
    expect(first).toBeDefined()
    expect(first!.when).toMatch(/,/)
    expect(first!.time).toBeTruthy()
    expect(first!.services).toBeTruthy()
  })

  it("says nothing about a client who is not booked", () => {
    expect(openAppointmentsFor(undefined)).toEqual([])
    expect(openAppointmentsFor("nobody-at-all")).toEqual([])
  })

  it("finds the client booked but never yet seen", () => {
    // The opposite fixture: no history, one upcoming appointment. If this were
    // read off completed visits it would come back empty.
    expect(openAppointmentsFor(KIRSTY).length).toBeGreaterThan(0)
  })
})

describe("the sentence changes when the duplicate is somewhere else", () => {
  const atJvc = [
    {
      id: "a",
      when: "Friday, May 22",
      time: "10:00am",
      locationId: "shampooch-jvc",
      services: "Full groom",
    },
  ]

  it("is the interesting case when the booking lands at another branch", () => {
    expect(spansOtherBranches(atJvc, "shampooch-jumeirah")).toBe(true)
  })

  it("is the ordinary case on your own calendar", () => {
    expect(spansOtherBranches(atJvc, "shampooch-jvc")).toBe(false)
  })

  it("claims nothing before a branch has been chosen", () => {
    // Mid-booking the target may not be picked yet, and "already booked
    // elsewhere" is a claim about a branch, so it waits for one.
    expect(spansOtherBranches(atJvc, null)).toBe(false)
  })

  it("ignores a record from before the estate existed", () => {
    const noBranch = [{ id: "b", when: "Friday, May 22", time: "10:00am", services: "Bath" }]
    expect(spansOtherBranches(noBranch, "shampooch-jvc")).toBe(false)
  })
})
