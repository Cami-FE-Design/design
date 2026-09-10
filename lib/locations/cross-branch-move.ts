/**
 * Moving an appointment to another branch (R07, R17, GB1.1–GB1.3, SCR-06).
 *
 * The move is the one operation that touches both branches at once, and every
 * way it can go wrong is a way money or access goes wrong:
 *
 * - Move to a branch the actor cannot reach and the grant meant nothing (GB1.2).
 * - Move to a branch that does not offer the service and the appointment
 *   cannot be delivered (R06, DW3.3).
 * - Move a paid appointment without resolving where the money sits and the
 *   deposit's trail is lost (GB1.3, R17).
 *
 * So this returns a decision with a reason rather than a boolean. Reception has
 * to be able to tell a client *why* not, and "no" with no reason is what makes
 * them phone the other branch.
 *
 * ## The money keeps both branches, forever
 *
 * R17: "a Sale collected at one Location and fulfilled at another records both
 * Locations while neither record is rewritten after the Sale completes." The
 * deposit was genuinely taken at the source — that is a historical fact, and
 * INV-01 makes financial records append-only — while the work now happens at
 * the destination. Both are true, so both are recorded.
 *
 * Overwriting the collection location instead would be simpler and would quietly
 * credit the destination for money it never took, which is the reconciliation
 * failure BG-04 is measured on.
 *
 * ## What this module deliberately does not decide
 *
 * Whether the destination has a free slot, and which staff member takes it. A
 * real check revalidates availability at the destination (R07), and this
 * exposes it as an input — `destinationHasSlot` — rather than pretending to
 * compute it, because there is no per-branch availability model yet.
 */

export type MoveDenialReason =
  | "sameLocation"
  | "destinationNotGranted"
  | "destinationNotLive"
  | "serviceNotOfferedThere"
  | "noSlotAtDestination"
  | "paymentCannotResolve"

export type MoveDecision =
  | { allowed: true; attribution: MoveAttribution }
  | { allowed: false; reason: MoveDenialReason }

/**
 * Where the money sits after the move. Two fields, and they are allowed to
 * differ — that is the point.
 */
export type MoveAttribution = {
  /** Where the deposit was actually taken. Never rewritten (R17, INV-01). */
  collectionLocationId: string
  /** Where the work now happens, and where the remaining balance will be taken. */
  fulfillmentLocationId: string
  /** Fils. Zero when nothing was collected, which is the simple case. */
  depositMinor: number
}

export type MoveRequest = {
  appointmentId: string
  sourceLocationId: string
  destinationLocationId: string
  serviceId: string
  /** Fils already collected against this appointment. */
  depositMinor: number
}

export type MoveContext = {
  /** The actor's granted branches. Both ends must be in it (GB1.1, GB1.2). */
  grantedLocationIds: ReadonlyArray<string>
  /** Branches accepting new operational writes — live only (R12). */
  writableLocationIds: ReadonlyArray<string>
  /** Whether the destination offers this service at all (R06, DW3.3). */
  destinationOffersService: boolean
  /** Revalidated availability at the destination (R07). Supplied, not inferred. */
  destinationHasSlot: boolean
  /**
   * Whether the collected payment can be attributed across the split. False is
   * the GB1.3 case: the move is rejected whole and the client keeps their
   * appointment and their payment where they were, rather than the money
   * ending up somewhere nobody can account for.
   */
  paymentResolvable: boolean
}

export function evaluateMove(request: MoveRequest, context: MoveContext): MoveDecision {
  const { sourceLocationId, destinationLocationId } = request

  if (sourceLocationId === destinationLocationId) {
    return { allowed: false, reason: "sameLocation" }
  }

  // Both ends, not just the destination. A receptionist who can reach the
  // destination but not the source is moving something they cannot see.
  const granted = new Set(context.grantedLocationIds)
  if (!granted.has(destinationLocationId) || !granted.has(sourceLocationId)) {
    return { allowed: false, reason: "destinationNotGranted" }
  }

  if (!context.writableLocationIds.includes(destinationLocationId)) {
    return { allowed: false, reason: "destinationNotLive" }
  }

  if (!context.destinationOffersService) {
    return { allowed: false, reason: "serviceNotOfferedThere" }
  }

  if (!context.destinationHasSlot) {
    return { allowed: false, reason: "noSlotAtDestination" }
  }

  // Checked last on purpose: it is the only reason a reception user cannot fix
  // by choosing differently, so the fixable reasons are reported first.
  if (request.depositMinor > 0 && !context.paymentResolvable) {
    return { allowed: false, reason: "paymentCannotResolve" }
  }

  return {
    allowed: true,
    attribution: {
      collectionLocationId: sourceLocationId,
      fulfillmentLocationId: destinationLocationId,
      depositMinor: request.depositMinor,
    },
  }
}

/**
 * What reception says to the client. Each one names the branch or the thing at
 * fault, because "this move isn't allowed" sends them to the phone.
 */
export const MOVE_DENIAL_COPY: Record<MoveDenialReason, string> = {
  sameLocation: "This appointment is already at that location.",
  destinationNotGranted:
    "You don't have access to one of these locations, so this move is blocked.",
  destinationNotLive: "That location isn't taking bookings right now.",
  serviceNotOfferedThere: "That location doesn't offer this service.",
  noSlotAtDestination: "That location has no free slot for this service at this time.",
  paymentCannotResolve:
    "The payment already taken can't be attributed across this move, so nothing has been changed — the appointment and the payment stay where they are.",
}

/** True when the sale will carry two different branches (R17). */
export function isSplitAttribution(attribution: MoveAttribution): boolean {
  return attribution.collectionLocationId !== attribution.fulfillmentLocationId
}
