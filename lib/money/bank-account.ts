// Payout destination — DSG-75.
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md
//
// The highest-severity screen in the pack, and the model carries most of that
// weight. Two rules shape everything here:
//
//   1. BOTH-OR-NEITHER (SET-B3). Cami and the gateway each hold a copy of the
//      destination. If Cami updates and the gateway does not, half the
//      merchant's money goes to a closed account and fails days later, in a
//      place support cannot see. So a change is one commit across two systems,
//      or it is nothing at all — there is no partial state in this model to
//      represent, because a partial state must never exist.
//
//   2. A NEW ACCOUNT IS UNVERIFIED, AND PAYOUTS PAUSE (SET-B4). They never fall
//      back to the previous account. That is the merchant's reasonable
//      assumption and it is wrong, so the model makes the pause explicit rather
//      than leaving it to be inferred.
//
// Change history is append-only (INV-08, INV-01): a failed attempt is a
// permanent row, not an absence.

import type { CamiPayRail } from "./types"

export type VerificationState =
  /** Money can go out. */
  | "verified"
  /** Added and not yet verified. Payouts are paused (SET-B4). */
  | "unverified"
  /** Verification is in flight. */
  | "pending"

export type PayoutDestination = {
  id: string
  /** The account holder. Must match the legal entity, which is what verification checks. */
  holderName: string
  bankName: string
  /** Last 4 only. The full number is never rendered anywhere (SET-A2). */
  last4: string
  verification: VerificationState
  addedAtIso: string
  addedBy: string
  /**
   * Which rails pay into this account. Both custodians pay into ONE destination,
   * which is the fact the screen exists to make legible: two senders, two
   * schedules, one account (SET-B1, SET-B2).
   */
  receives: ReadonlyArray<CamiPayRail>
}

/**
 * One entry in the permanent record of who pointed the money where (SET-B5,
 * INV-08).
 *
 * A failed attempt is recorded with the same weight as a successful one. The
 * question this log answers — "did someone try to redirect my money?" — is not
 * answered by a log that only keeps the attempts that worked.
 */
export type DestinationChange = {
  id: string
  atIso: string
  actor: string
  fromLast4: string | null
  toLast4: string
  outcome: "applied" | "failed"
  /** Present on a failure. Names which system refused and why. */
  failureReason?: string
}

/* -------------------------------------------------------------------------- */
/* The commit                                                                 */
/* -------------------------------------------------------------------------- */

export type CommitStage = "cami" | "gateway"

export type CommitResult =
  | { ok: true; destination: PayoutDestination }
  | {
      ok: false
      /** Which write refused. Shown to the merchant — "it failed" is not an answer. */
      stage: CommitStage
      message: string
      /**
       * Always true. Present as a field rather than a comment because it is the
       * thing the error screen has to promise, and a promise the UI makes on its
       * own is a promise that can drift from what the code did.
       */
      nothingChanged: true
    }

export type DraftDestination = {
  holderName: string
  bankName: string
  /** Full IBAN as typed. Only the last 4 survives into `PayoutDestination`. */
  iban: string
}

/**
 * Apply a new destination to both systems, or to neither.
 *
 * `simulateGatewayFailure` is how the demo reaches the state that matters most
 * (QA `SET-X1`). In production this is a real two-phase write; what a reviewer
 * needs to see is that the failure path leaves the old account untouched and
 * says so.
 */
export function commitDestination(
  current: PayoutDestination | null,
  draft: DraftDestination,
  options: { actor: string; nowIso: string; simulateGatewayFailure?: boolean },
): CommitResult {
  const last4 = draft.iban.replace(/\s+/g, "").slice(-4)

  if (options.simulateGatewayFailure) {
    // Cami's write is rolled back with the gateway's. The merchant's money keeps
    // going where it was already going, which for a failed change is the only
    // safe outcome.
    return {
      ok: false,
      stage: "gateway",
      message:
        "NeoPay did not accept the new account, so nothing was changed. Your payouts keep going to the account below.",
      nothingChanged: true,
    }
  }

  return {
    ok: true,
    destination: {
      id: `dest_${last4}`,
      holderName: draft.holderName,
      bankName: draft.bankName,
      last4,
      // Never inherits the old account's verified state. A new account is
      // unverified by definition (SET-B4).
      verification: "unverified",
      addedAtIso: options.nowIso,
      addedBy: options.actor,
      receives: current?.receives ?? ["online", "terminal"],
    },
  }
}

/** Payouts only move on a verified destination. */
export function payoutsPaused(destination: PayoutDestination | null): boolean {
  return destination === null || destination.verification !== "verified"
}

/* -------------------------------------------------------------------------- */
/* Demo data                                                                  */
/* -------------------------------------------------------------------------- */

export const DEMO_DESTINATION: PayoutDestination = {
  id: "dest_1001",
  holderName: "Shampooch Pet Grooming L.L.C",
  bankName: "Emirates NBD",
  last4: "1001",
  verification: "verified",
  addedAtIso: "2026-03-04T09:20:00Z",
  addedBy: "Omar Haddad",
  receives: ["online", "terminal"],
}

export const DEMO_CHANGE_HISTORY: ReadonlyArray<DestinationChange> = [
  {
    id: "chg_3",
    atIso: "2026-03-04T09:20:00Z",
    actor: "Omar Haddad",
    fromLast4: "4417",
    toLast4: "1001",
    outcome: "applied",
  },
  {
    id: "chg_2",
    atIso: "2026-03-02T14:05:00Z",
    actor: "Omar Haddad",
    fromLast4: "4417",
    toLast4: "1001",
    outcome: "failed",
    failureReason: "NeoPay rejected the account — the holder name did not match the bank's record",
  },
  {
    id: "chg_1",
    atIso: "2025-11-18T11:40:00Z",
    actor: "Maryam Siddiqui",
    fromLast4: null,
    toLast4: "4417",
    outcome: "applied",
  },
]
