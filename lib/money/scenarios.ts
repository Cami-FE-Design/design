// Demo scenarios for the money surfaces (DSG-73).
//
// Two independent axes, not one list. They were one list first, and that was
// wrong in a way that misread as product: it put "Terminal-only merchant" next
// to "Payouts paused" as though a merchant had to be one or the other. They are
// different kinds of fact —
//
//   RAILS  — which rails the merchant runs. Configuration, set in CamiPay
//            (`RailConfig.enabled`). Rarely changes, never derived.
//   STATE  — where their settlement stands. Derived from data: is there a
//            verified destination, is the balance over the minimum, has any
//            money been taken yet.
//
// A terminal-only merchant can also have paused payouts. Flattening the two
// made that combination unreachable and the flow unreadable.
//
// None of this exists in production. There the rails come from config and the
// state falls out of the ledger; nobody picks either. It exists so a reviewer
// can reach any combination without seeding data.

import { MONEY_TXS, PAYOUTS, TODAY_ISO } from "./mock"
import type { MerchantRails, MoneyTx, Payout, SettlementBlock } from "./types"

/* -------------------------------------------------------------------------- */
/* Rails — configuration                                                      */
/* -------------------------------------------------------------------------- */

export type RailsId = "both" | "terminal-only" | "online-only"

export const RAILS_OPTIONS: ReadonlyArray<{ id: RailsId; label: string }> = [
  { id: "both", label: "Both rails" },
  { id: "terminal-only", label: "Terminal only (SET-X7)" },
  { id: "online-only", label: "Online only (SET-X8)" },
]

const RAILS: Record<RailsId, MerchantRails> = {
  both: { online: true, terminal: true },
  "terminal-only": { online: false, terminal: true },
  "online-only": { online: true, terminal: false },
}

export function isRailsId(value: string | null): value is RailsId {
  return RAILS_OPTIONS.some((r) => r.id === value)
}

/* -------------------------------------------------------------------------- */
/* State — derived from the ledger                                            */
/* -------------------------------------------------------------------------- */

export type StateId =
  | "healthy"
  | "paused"
  | "pending"
  | "not-ready"
  | "below-minimum"
  | "no-activity"

/**
 * Roughly the order a merchant passes through them, which is the order they
 * belong in a picker: a new merchant has no activity, then no payout setup,
 * then an unverified account, then a verified one.
 */
export const STATE_OPTIONS: ReadonlyArray<{ id: StateId; label: string }> = [
  { id: "healthy", label: "Healthy" },
  { id: "paused", label: "Payouts paused (unverified)" },
  { id: "pending", label: "Verification pending" },
  { id: "not-ready", label: "Not settle-ready" },
  { id: "below-minimum", label: "Below minimum, rolls forward" },
  { id: "no-activity", label: "No activity yet" },
]

export function isStateId(value: string | null): value is StateId {
  return STATE_OPTIONS.some((s) => s.id === value)
}

/* -------------------------------------------------------------------------- */

export type Scenario = {
  txs: ReadonlyArray<MoneyTx>
  payouts: ReadonlyArray<Payout>
  rails: MerchantRails
  block: SettlementBlock | null
}

const BLOCK: Record<StateId, SettlementBlock | null> = {
  healthy: null,
  paused: "destination-unverified",
  pending: "verification-pending",
  "not-ready": "not-settle-ready",
  "below-minimum": "below-minimum",
  "no-activity": null,
}

export function resolveScenario(state: StateId, rails: RailsId = "both"): Scenario {
  const merchantRails = RAILS[rails]
  const onRail = (t: { rail: keyof MerchantRails }) => merchantRails[t.rail]

  const ledger = MONEY_TXS.filter(onRail)
  const runs = PAYOUTS.filter(onRail)

  const base = { rails: merchantRails, block: BLOCK[state] }

  switch (state) {
    case "not-ready":
      // Nothing has ever gone out, so the money piles up. That is what the
      // banner has to explain — a large figure, none of it moving (SET-A5).
      return { ...base, txs: ledger.filter((t) => t.kind !== "payout"), payouts: [] }

    case "below-minimum": {
      // One day's takings, nothing swept yet. Skipped is not failed, and this
      // is the state where that copy has to hold (SET-X9).
      const today = ledger
        .filter((t) => t.at.slice(0, 10) === TODAY_ISO && t.kind !== "payout")
        .slice(-3)
      return { ...base, txs: today, payouts: [] }
    }

    case "no-activity":
      return { ...base, txs: [], payouts: [] }

    default:
      return { ...base, txs: ledger, payouts: runs }
  }
}
