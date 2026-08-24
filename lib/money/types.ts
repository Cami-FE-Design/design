// Merchant money surfaces — the shared model (DSG-73).
//
// Spec: docs/specs/DSG-73-merchant-money-surfaces.md. Read §2.1 before adding a
// figure to any screen.
//
// One ledger behind all five screens. That is the whole design: Fresha's
// account summary and their wallet header disagree by 9.3x in the same session
// because each surface computes its own number, and nothing forces them to
// agree. Here every headline, tile and breakdown row is DERIVED from this one
// list of transactions (see ledger.ts), so a screen physically cannot state a
// figure the breakdown does not arrive at.
//
// All money is minor units (fils), like lib/invoice. Amounts on a transaction
// are SIGNED: positive adds to what the merchant is owed, negative takes from
// it. That is what lets the reconciliation be a plain sum rather than a
// hand-maintained set of pluses and minuses — see `MoneySummary`.

import type { CamiPayRail, CamiPayRate } from "@/lib/hq-camipay/store"

export type { CamiPayRail, CamiPayRate }

/**
 * Who is holding the money right now, and therefore who the merchant's bank
 * statement will name as the sender.
 *
 * This is the split-custody fact the whole pack exists to make legible: Cami
 * holds and pays online money, the gateway holds and pays terminal money. One
 * merchant, two payouts, two senders, two schedules (G3). It is derived from
 * the rail rather than stored, because a rail moving to a different custodian
 * is a commercial change that must not require a data migration.
 */
export type Custodian = "cami" | "neopay"

export function custodianOf(rail: CamiPayRail): Custodian {
  return rail === "online" ? "cami" : "neopay"
}

/** The name the merchant reads. Never "the gateway" — they see a sender. */
export function custodianLabel(custodian: Custodian): string {
  return custodian === "cami" ? "Cami" : "NeoPay"
}

/**
 * Row types in the activity feed (T5-3).
 *
 * Deliberately absent: any kind of subscription or plan charge. The OS is free
 * (INV-P4, ADR-001) and a slot for it is how Fresha's deductions block ended up
 * 73% made of things Cami does not sell (§2.2).
 */
export type MoneyTxKind =
  /** Card payment for a completed sale. */
  | "sale"
  /** Prepayment collected before service. Held as a liability until capture (INV-P10). */
  | "deposit"
  /** Voluntary gratuity. Outside the VAT base (06 §4, INV-M5). */
  | "tip"
  /** Money returned to a client. */
  | "refund"
  /** What Cami charged on this transaction. Merchant-facing name: "Cami fee". */
  | "cami-fee"
  /** Messaging or add-on usage. The only other thing Cami bills for. */
  | "messaging"
  /** A correction. Never an edit of an existing row (INV-01, G5). */
  | "adjustment"
  /** Money that left for the merchant's bank. */
  | "payout"

/**
 * Terminal Phase 1 trusts a device report, so a terminal row can exist before
 * the gateway has confirmed it (SET-C9, ADR-014). The merchant sees the
 * difference — "reported" money is real enough to show and not yet real enough
 * to promise.
 */
export type TxConfirmation = "reported" | "confirmed"

export type MoneyTx = {
  id: string
  kind: MoneyTxKind
  rail: CamiPayRail
  /** Signed, fils. Positive = owed to the merchant, negative = taken away. */
  amountMinor: number
  /** ISO timestamp. */
  at: string
  /** Sale or appointment this row belongs to, linked in the detail panel (T5-4). */
  reference?: { label: string; href?: string }
  /** The client, on rows that have one. A fee has no client, a deposit does. */
  client?: string
  /** "Visa •••• 6892", "Terminal — Front desk". Shown, never inferred. */
  method?: string
  locationName: string
  confirmation: TxConfirmation
  /**
   * Plain-language reason, on rows where the kind alone does not explain the
   * money — an adjustment, or the reversal that follows a failed payout. Shown
   * on the row, not hidden behind the detail panel.
   */
  note?: string
  /**
   * The payment that caused this row. Set on fee rows so a fee and its
   * originating payment are visibly paired (T5-3) rather than two unrelated
   * lines that happen to sit next to each other.
   */
  causedByTxId?: string
  /**
   * The rate this fee was charged at, snapshotted at capture. Set on fee rows.
   *
   * Load-bearing for `SET-C2` / QA `SET-X5`: a fee statement is a historical
   * document and must not restate itself when the merchant renegotiates. Read
   * the current rate card to build a fee line and every past statement silently
   * re-rates — which is the same class of defect as an editable money record
   * (INV-01, INV-12).
   */
  rateSnapshot?: CamiPayRate
  /**
   * The payout that carried this money to the bank. Set once the money leaves,
   * which is what lets a refund show up on the payout that carried the original
   * payment (T5-8).
   */
  payoutId?: string
  /**
   * The payout this row reverses, when a payout came back. Deliberately NOT
   * `payoutId`: the payout did not carry this money, it failed to carry it, and
   * a reversal counted as contents would make the drill-in add up to twice the
   * payout.
   */
  reversesPayoutId?: string
}

/**
 * A payout is money that left for the bank. It exists as BOTH a `MoneyTx` of
 * kind "payout" (so the reconciliation sums it) and a `Payout` record (so the
 * merchant can open it and see what was inside).
 *
 * There is no "edit" on this type on purpose. A failed payout keeps its row
 * with its reason, and a retry is a NEW payout that points back at it
 * (SET-C5, SET-C6, INV-01). Never a mutated row.
 */
export type PayoutStatus =
  /** Landed in the merchant's account. */
  | "paid"
  /** Sent, not yet landed. The "arriving Thu 22 Aug" case. */
  | "in-transit"
  /** Never landed. Permanent row, carries a reason (T5-9). */
  | "failed"
  /**
   * Nothing was sent because the balance sat under the minimum. The money rolls
   * forward (SET-X9). Copy must not read as an error — skipped is not failed.
   */
  | "held-below-minimum"

export type Payout = {
  id: string
  rail: CamiPayRail
  /** Positive magnitude, fils. The signed side lives on the "payout" MoneyTx. */
  amountMinor: number
  sentAt: string
  /** When it lands. Absent on failed and held payouts — there is nothing to promise. */
  arrivesAt?: string
  status: PayoutStatus
  /** Required when status is "failed". Shown on the row, not hidden in a tooltip. */
  failureReason?: string
  /** Masked destination, last 4 only (SET-A2). */
  destinationLast4: string
  /** Set on a retry, pointing at the payout that failed. */
  retryOfPayoutId?: string
  /**
   * Whose contents this payout carries, when that is not its own. A retry moves
   * the SAME money the failed attempt tried to move, so it shows the failed
   * payout's transactions rather than an empty list — the alternative is
   * reassigning rows off a permanent record, which INV-01 forbids.
   */
  carriesPayoutId?: string
}

/* -------------------------------------------------------------------------- */
/* Derived figures                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The reconciliation. Every field is derived in ledger.ts — nothing here is
 * ever stored, so the breakdown cannot drift from the headline.
 *
 * Sign convention: `deductions` and `payouts` totals are NEGATIVE. That makes
 * the reconciliation a literal sum —
 *
 *     opening + moneyIn + deductions + adjustments + payouts = held
 *
 * — which is the arithmetic the screen has to make visible (T4-4). Storing
 * magnitudes and flipping signs at render time is how a screen ends up showing
 * a total its own rows do not produce.
 */
export type MoneySummary = {
  /** Inclusive ISO date bounds this was computed over. */
  period: { fromIso: string; toIso: string }
  /** Null when the summary spans every rail. */
  rail: CamiPayRail | null

  /**
   * What was already held when the period opened.
   *
   * Load-bearing, and the reason this model is not Fresha's. Held money is a
   * POINT-IN-TIME balance; money in, fees and payouts are PERIOD FLOWS. Put a
   * period selector above a balance without an opening figure and the arithmetic
   * breaks the moment a payout in this period carries money earned in the last
   * one — the "held" figure goes negative, which is not a state a merchant's
   * money can actually be in.
   *
   * So the reconciliation opens here and closes at `heldMinor`, and every row
   * between them is a flow.
   */
  openingMinor: number

  moneyIn: {
    salesMinor: number
    tipsMinor: number
    depositsMinor: number
    totalMinor: number
  }

  /** All negative. Three lines, not Fresha's eight — see spec §2.2. */
  deductions: {
    camiFeeMinor: number
    messagingMinor: number
    refundsMinor: number
    totalMinor: number
  }

  adjustments: {
    totalMinor: number
    count: number
  }

  /** Negative. The line Fresha omits, and the reason their figure ties to nothing (§2.1). */
  payouts: {
    totalMinor: number
    count: number
  }

  /**
   * The headline (G2): what is held at the END of the period, which for
   * month-to-date is what is held right now. Derived, never assigned.
   */
  heldMinor: number

  /**
   * Both totals, always. Amount due and taxable gross are different numbers
   * whenever a tip exists and a single "total" produces a wrong return
   * (06 §4, G4, EC-39).
   */
  tax: {
    /** Sales after discounts, VAT-inclusive. Excludes tips. */
    taxableGrossMinor: number
    /** Taxable gross + tips. What clients actually paid. */
    amountDueMinor: number
    /** VAT contained in taxable gross. Derived, never appended. */
    vatOnSalesMinor: number
    /** VAT on Cami's own fee — Cami charges a UAE business (INV-P9, SET-D6). */
    vatOnCamiFeeMinor: number
  }
}

/**
 * Why payouts are paused or nothing is arriving. Drives the account-summary
 * banner (T4-9) and the bank-account screen's state (T2-2, T2-6).
 *
 * `null` is the healthy case. Each of the rest has copy that must not read as
 * an error where it is not one.
 */
export type SettlementBlock =
  /** A new destination was added and has not been verified. Method pending D3. */
  | "destination-unverified"
  /** Verification is in flight. */
  | "verification-pending"
  /** Onboarding incomplete — the merchant is not yet settle-ready (SET-A5). */
  | "not-settle-ready"
  /** Balance under the payout minimum. Money rolls forward, nothing is wrong (SET-X9). */
  | "below-minimum"

/** Which rails a merchant actually runs on. Drives SET-X7 / SET-X8. */
export type MerchantRails = {
  online: boolean
  terminal: boolean
}
