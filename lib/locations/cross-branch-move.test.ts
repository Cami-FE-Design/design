import { describe, expect, it } from "vitest"

import {
  evaluateMove,
  isSplitAttribution,
  type MoveContext,
  type MoveRequest,
} from "@/lib/locations/cross-branch-move"

const request: MoveRequest = {
  appointmentId: "b-004",
  sourceLocationId: "shampooch-jvc",
  destinationLocationId: "shampooch-jumeirah",
  serviceId: "full-groom",
  depositMinor: 5_000,
}

const ok: MoveContext = {
  grantedLocationIds: ["shampooch-jvc", "shampooch-jumeirah"],
  writableLocationIds: ["shampooch-jvc", "shampooch-jumeirah"],
  destinationOffersService: true,
  destinationHasSlot: true,
  paymentResolvable: true,
}

describe("evaluateMove", () => {
  it("allows a move when both branches are granted and the destination can take it", () => {
    // GB1.1: reception never has to tell a client "no, not here".
    const decision = evaluateMove(request, ok)
    expect(decision.allowed).toBe(true)
  })

  it("records both branches on the money, and rewrites neither", () => {
    // R17 is the whole point: the deposit was really taken at the source, and
    // the work really happens at the destination. Both are facts.
    const decision = evaluateMove(request, ok)
    if (!decision.allowed) throw new Error("expected the move to be allowed")

    expect(decision.attribution).toEqual({
      collectionLocationId: "shampooch-jvc",
      fulfillmentLocationId: "shampooch-jumeirah",
      depositMinor: 5_000,
    })
    expect(isSplitAttribution(decision.attribution)).toBe(true)
  })

  it("blocks a move to a branch the actor is not granted", () => {
    // GB1.2: denied outright, so nobody acts outside what they hold.
    const decision = evaluateMove(request, { ...ok, grantedLocationIds: ["shampooch-jvc"] })
    expect(decision).toEqual({ allowed: false, reason: "destinationNotGranted" })
  })

  it("blocks a move out of a branch the actor is not granted either", () => {
    // Both ends are checked. Holding the destination alone means moving
    // something you cannot see.
    const decision = evaluateMove(request, { ...ok, grantedLocationIds: ["shampooch-jumeirah"] })
    expect(decision).toEqual({ allowed: false, reason: "destinationNotGranted" })
  })

  it("blocks a move into a suspended or archived branch", () => {
    // R12: an archived branch accepts no new operational write, and an
    // appointment is one.
    const decision = evaluateMove(request, { ...ok, writableLocationIds: ["shampooch-jvc"] })
    expect(decision).toEqual({ allowed: false, reason: "destinationNotLive" })
  })

  it("blocks a move to a branch that does not offer the service", () => {
    // DW3.3 read from the other side: a branch that turned the service off
    // cannot be sent an appointment for it.
    const decision = evaluateMove(request, { ...ok, destinationOffersService: false })
    expect(decision).toEqual({ allowed: false, reason: "serviceNotOfferedThere" })
  })

  it("blocks a move when the destination has no slot", () => {
    const decision = evaluateMove(request, { ...ok, destinationHasSlot: false })
    expect(decision).toEqual({ allowed: false, reason: "noSlotAtDestination" })
  })

  it("rejects the move whole when a collected payment cannot be attributed", () => {
    // GB1.3: fail cleanly rather than lose the money's trail. Nothing partial.
    const decision = evaluateMove(request, { ...ok, paymentResolvable: false })
    expect(decision).toEqual({ allowed: false, reason: "paymentCannotResolve" })
  })

  it("does not care about payment attribution when nothing was collected", () => {
    // An unpaid appointment has no money to lose, so the hardest check does
    // not apply to the commonest case.
    const decision = evaluateMove(
      { ...request, depositMinor: 0 },
      { ...ok, paymentResolvable: false },
    )
    expect(decision.allowed).toBe(true)
  })

  it("reports a fixable reason before an unfixable one", () => {
    // Both wrong: no slot, and the payment cannot resolve. Reception can act
    // on the slot, so that is what they are told.
    const decision = evaluateMove(request, {
      ...ok,
      destinationHasSlot: false,
      paymentResolvable: false,
    })
    expect(decision).toEqual({ allowed: false, reason: "noSlotAtDestination" })
  })

  it("refuses a move to the branch it is already at", () => {
    const decision = evaluateMove({ ...request, destinationLocationId: "shampooch-jvc" }, ok)
    expect(decision).toEqual({ allowed: false, reason: "sameLocation" })
  })
})
