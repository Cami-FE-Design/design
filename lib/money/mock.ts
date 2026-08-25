// Demo ledger for the merchant money surfaces (DSG-73).
//
// One generated ledger, both rails, and every screen in the pack reads it. The
// figures are not hand-written per screen on purpose — see spec §2.1 for what
// happens when they are.
//
// Deterministic: a seeded LCG, a fixed "today", and no clock reads. The same
// numbers appear on every reload and in the test, so a screenshot in a design
// review and an assertion in CI are talking about the same money.
//
// Fee arithmetic and rates come from lib/hq-camipay (PRO-737) rather than being
// restated here. That store is what HQ writes and what the merchant's CamiPay
// rates panel already reads, so the fee a merchant sees on this ledger is the
// fee their rate card says they pay.

import { type CamiPayRate, computeFee } from "@/lib/hq-camipay/store"
import type { CamiPayRail, MerchantRails, MoneyTx, Payout } from "./types"

/** Fixed anchor. Everything relative ("Today", "arriving") reads from this. */
export const TODAY_ISO = "2026-08-24"

/** The merchant. Named on every "from"/"to" row in a transaction detail. */
export const BUSINESS_NAME = "Shampooch JVC"

const LOCATION = BUSINESS_NAME

/**
 * Shampooch JVC's rates as they stand from 01 May 2026 in the CamiPay demo
 * config. Mirrored, not invented — if the rate card there changes, this is the
 * line to update.
 */
export const DEMO_RATES: Record<CamiPayRail, CamiPayRate> = {
  terminal: { percent: 1.8, fixedMinor: 0, fixedBelowMinor: null },
  online: { percent: 3, fixedMinor: 75, fixedBelowMinor: 10000 },
}

/** Below this, nothing is sent and the balance rolls forward (SET-B6, SET-X9). */
export const PAYOUT_MINIMUM_MINOR = 50_000 // AED 500.00

/**
 * Two custodians, two cadences — the whole reason a merchant sees two deposits
 * with two different senders (journey step 3, SET-D3).
 */
export const PAYOUT_SCHEDULE: Record<
  CamiPayRail,
  { label: string; editable: boolean; description: string }
> = {
  online: {
    label: "Weekly, every Thursday",
    // Cami holds this money, so Cami controls the timing (SET-B6).
    editable: true,
    // Says who holds the money, which the cadence line above it does not. It
    // used to end "...paid to your bank every Thursday", repeating the line
    // directly above it word for word.
    description: "Card payments taken online are held by Cami until the next run.",
  },
  terminal: {
    label: "Daily, next business day",
    // The gateway's schedule. Read-only is the requirement, not an oversight
    // (SET-B7) — Cami cannot change what NeoPay does.
    editable: false,
    description: "Card machine payments are held by NeoPay, not by Cami.",
  },
}

export const DEMO_MERCHANT_RAILS: MerchantRails = { online: true, terminal: true }

export const DESTINATION_LAST4 = "1001"

/* -------------------------------------------------------------------------- */
/* Generation                                                                 */
/* -------------------------------------------------------------------------- */

const FROM_ISO = "2026-07-01"

const CLIENTS = [
  "Aisha Rahman",
  "Omar Haddad",
  "Priya Menon",
  "Yusuf Karim",
  "Lina Farouk",
  "Daniel Okoro",
  "Fatima Noor",
  "Rohan Verma",
]

const ONLINE_METHODS = ["Visa •••• 4821", "Mastercard •••• 6576", "Apple Pay"]
const TERMINAL_METHODS = ["Terminal — Front desk", "Terminal — Grooming bay"]

/** Seeded LCG (glibc constants). Deterministic across runs and platforms. */
function makeRandom(seed: number): () => number {
  let state = seed
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

function eachDay(fromIso: string, toIso: string): string[] {
  const days: string[] = []
  const cursor = new Date(`${fromIso}T00:00:00Z`)
  const end = new Date(`${toIso}T00:00:00Z`)
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

function weekdayOf(dayIso: string): number {
  return new Date(`${dayIso}T00:00:00Z`).getUTCDay()
}

function addDays(dayIso: string, days: number): string {
  const d = new Date(`${dayIso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function at(dayIso: string, minutesFrom9am: number): string {
  const d = new Date(`${dayIso}T09:00:00Z`)
  d.setUTCMinutes(d.getUTCMinutes() + minutesFrom9am)
  return d.toISOString()
}

function pick<T>(rand: () => number, list: ReadonlyArray<T>): T {
  return list[Math.floor(rand() * list.length)]
}

/** Rounded to the nearest 50 fils, the way a real price list lands. */
function amountBetween(rand: () => number, minMinor: number, maxMinor: number): number {
  const raw = minMinor + rand() * (maxMinor - minMinor)
  return Math.round(raw / 50) * 50
}

function build(): { txs: MoneyTx[]; payouts: Payout[] } {
  const rand = makeRandom(20260824)
  const txs: MoneyTx[] = []
  let seq = 0
  const nextId = (prefix: string) => `${prefix}_${(++seq).toString().padStart(4, "0")}`

  for (const day of eachDay(FROM_ISO, TODAY_ISO)) {
    const rows = 3 + Math.floor(rand() * 5)

    for (let i = 0; i < rows; i++) {
      // Terminal is the majority rail (BRD: most of a Tier 1 merchant's money
      // is taken at the counter), which is also why D1 matters so much.
      const rail: CamiPayRail = rand() < 0.68 ? "terminal" : "online"
      const kind = rand() < 0.35 ? "deposit" : "sale"
      const amountMinor = amountBetween(rand, 6_000, 48_000)
      const client = pick(rand, CLIENTS)
      const reference = { label: `APT-${(1000 + seq).toString(36).toUpperCase()}` }
      const method = rail === "online" ? pick(rand, ONLINE_METHODS) : pick(rand, TERMINAL_METHODS)

      // Terminal Phase 1 trusts the device report, so a small share of recent
      // terminal rows are "reported" rather than gateway-confirmed (SET-C9).
      const isRecent = day >= addDays(TODAY_ISO, -2)
      const confirmation =
        rail === "terminal" && isRecent && rand() < 0.35 ? "reported" : "confirmed"

      const payment: MoneyTx = {
        id: nextId("tx"),
        kind,
        rail,
        amountMinor,
        at: at(day, i * 47),
        reference,
        client,
        method,
        locationName: LOCATION,
        confirmation,
      }
      txs.push(payment)

      // Tips ride on counter sales, and exist here so the tax block has a case
      // where amount due and taxable gross differ (G4).
      if (rail === "terminal" && kind === "sale" && rand() < 0.22) {
        txs.push({
          id: nextId("tx"),
          kind: "tip",
          rail,
          amountMinor: amountBetween(rand, 500, 3_000),
          at: at(day, i * 47 + 1),
          reference,
          client,
          method,
          locationName: LOCATION,
          confirmation,
          causedByTxId: payment.id,
        })
      }

      // Every payment carries its fee, pointing back at what caused it, so the
      // pair is visible in the feed rather than two lines that happen to be
      // adjacent (T5-3, T3-4).
      const fee = computeFee(DEMO_RATES[rail], amountMinor)
      if (fee.totalMinor > 0) {
        txs.push({
          id: nextId("tx"),
          kind: "cami-fee",
          rail,
          amountMinor: -fee.totalMinor,
          at: at(day, i * 47 + 2),
          reference,
          locationName: LOCATION,
          confirmation: "confirmed",
          causedByTxId: payment.id,
          // Snapshotted here, not looked up later. See `rateSnapshot` on MoneyTx.
          rateSnapshot: DEMO_RATES[rail],
        })
      }
    }

    // A refund roughly every nine days, with its own fee left in place — Cami
    // does not reverse its fee on a refund, and the merchant should see that
    // rather than discover it.
    //
    // The refund points at the PAYMENT it reverses, on an earlier day. That link
    // is what makes T5-8 possible: open the payout that carried the original
    // money and the refund against it is visible there, even though the refund
    // itself went out with a later payout.
    if (rand() < 0.11) {
      const refundable = txs.filter(
        (t) => (t.kind === "sale" || t.kind === "deposit") && t.at.slice(0, 10) < day,
      )
      if (refundable.length > 0) {
        const original = refundable[Math.floor(rand() * refundable.length)]
        txs.push({
          id: nextId("tx"),
          kind: "refund",
          rail: original.rail,
          amountMinor: -original.amountMinor,
          at: at(day, 300),
          client: original.client,
          reference: original.reference,
          method: original.method,
          locationName: LOCATION,
          confirmation: "confirmed",
          causedByTxId: original.id,
        })
      }
    }

    // Messaging usage, billed weekly. The only non-processing thing Cami
    // charges for — there is no subscription line and never will be (INV-P4).
    if (weekdayOf(day) === 1) {
      txs.push({
        id: nextId("tx"),
        kind: "messaging",
        rail: "online",
        amountMinor: -amountBetween(rand, 2_000, 6_000),
        at: at(day, 30),
        locationName: LOCATION,
        confirmation: "confirmed",
        note: "WhatsApp reminders and campaign sends",
      })
    }
  }

  const payouts = schedulePayouts(txs, nextId)
  txs.sort((a, b) => (a.at < b.at ? 1 : -1))
  return { txs, payouts }
}

/**
 * Turn held money into payouts, rail by rail.
 *
 * A payout sweeps everything on its rail that has not been swept yet and is
 * dated strictly before the run — which is what makes the drill-in add up to
 * the payout figure by construction (SET-C4, SET-D4) rather than by a fixture
 * someone kept in sync by hand.
 */
function schedulePayouts(txs: MoneyTx[], nextId: (prefix: string) => string): Payout[] {
  const payouts: Payout[] = []

  // The one deliberate failure in the demo data. Every state in DSG-78 T5-9
  // needs a row to point at: a permanent failed payout, the reversal that put
  // the money back, and a retry that is its own row.
  //
  // Pinned to the first terminal run that actually SENDS on or after this date,
  // not to the date itself — a run can fall under the minimum and send nothing,
  // and a failure has to happen to money that left.
  const FAILED_RUN = { rail: "terminal" as CamiPayRail, notBefore: "2026-08-12" }
  let failureUsed = false

  for (const rail of ["online", "terminal"] as const) {
    for (const day of eachDay(FROM_ISO, TODAY_ISO)) {
      const isRunDay = rail === "online" ? weekdayOf(day) === 4 : true
      if (!isRunDay) continue

      const carried = txs.filter(
        (t) =>
          t.rail === rail &&
          t.kind !== "payout" &&
          !t.payoutId &&
          t.at.slice(0, 10) < day &&
          t.at.slice(0, 10) >= FROM_ISO,
      )
      const amountMinor = carried.reduce((sum, t) => sum + t.amountMinor, 0)
      if (amountMinor <= 0) continue

      // Under the minimum nothing moves and nothing is assigned, so the same
      // money is swept by the next run. Recorded anyway: the merchant asking
      // "why did nothing come on Thursday" needs an answer (SET-X9).
      if (amountMinor < PAYOUT_MINIMUM_MINOR) {
        payouts.push({
          id: nextId("po"),
          rail,
          amountMinor,
          sentAt: at(day, -180),
          status: "held-below-minimum",
          destinationLast4: DESTINATION_LAST4,
        })
        continue
      }

      const id = nextId("po")
      const arrivesAt = addDays(day, rail === "online" ? 1 : 1)
      const failed = !failureUsed && rail === FAILED_RUN.rail && day >= FAILED_RUN.notBefore
      if (failed) failureUsed = true

      payouts.push({
        id,
        rail,
        amountMinor,
        sentAt: at(day, -180),
        arrivesAt: failed ? undefined : `${arrivesAt}T00:00:00.000Z`,
        status: failed ? "failed" : arrivesAt <= TODAY_ISO ? "paid" : "in-transit",
        failureReason: failed
          ? "NeoPay rejected the transfer — the account holder name did not match the bank's record"
          : undefined,
        destinationLast4: DESTINATION_LAST4,
      })

      for (const tx of carried) tx.payoutId = id

      txs.push({
        id: nextId("tx"),
        kind: "payout",
        rail,
        amountMinor: -amountMinor,
        at: at(day, -180),
        locationName: LOCATION,
        confirmation: "confirmed",
        payoutId: id,
      })

      if (failed) {
        // The retry is its own payout, moving the same money (SET-C6).
        const retryDay = addDays(day, 1)
        const retryId = nextId("po")

        // The money came back. A new row, never an edit of the payout row
        // (INV-01, G5) — and the reason travels with it.
        //
        // `payoutId` points at the RETRY, not at the payout that failed. That is
        // what stops the returned money being swept a second time by the next
        // run and paid out twice: it left with the retry. `reversesPayoutId`
        // keeps the link back to the failure, so the drill-in on the failed
        // payout still shows what it tried to carry and nothing more.
        txs.push({
          id: nextId("tx"),
          kind: "adjustment",
          rail,
          amountMinor,
          at: at(day, 540),
          locationName: LOCATION,
          confirmation: "confirmed",
          payoutId: retryId,
          reversesPayoutId: id,
          note: "Payout returned by NeoPay — account holder name did not match",
        })

        payouts.push({
          id: retryId,
          rail,
          amountMinor,
          sentAt: at(retryDay, -180),
          arrivesAt: `${addDays(retryDay, 1)}T00:00:00.000Z`,
          status: "paid",
          destinationLast4: DESTINATION_LAST4,
          retryOfPayoutId: id,
          carriesPayoutId: id,
        })
        txs.push({
          id: nextId("tx"),
          kind: "payout",
          rail,
          amountMinor: -amountMinor,
          at: at(retryDay, -180),
          locationName: LOCATION,
          confirmation: "confirmed",
          payoutId: retryId,
          note: "Retry of the payout NeoPay returned",
        })
      }
    }
  }

  return payouts.sort((a, b) => (a.sentAt < b.sentAt ? 1 : -1))
}

const LEDGER = build()

/** Every transaction, newest first. */
export const MONEY_TXS: ReadonlyArray<MoneyTx> = LEDGER.txs

/** Every payout run, newest first. Includes runs where nothing was sent. */
export const PAYOUTS: ReadonlyArray<Payout> = LEDGER.payouts

/* -------------------------------------------------------------------------- */
/* Periods                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Named bounds the tests pin against. The screens no longer carry a preset
 * dropdown of their own — they use the shared range control, whose presets
 * include these and which can actually resolve a custom range. The old list had
 * a "Custom" option that silently returned month-to-date.
 */
export type PeriodKey = "month-to-date" | "last-month"

/**
 * What the money surfaces open on: this month so far.
 *
 * Local Dates, because the shared range picker works in local time and the
 * ledger is keyed by local day strings — going through UTC moves the range by a
 * day west of Greenwich, which on a month boundary drops a day of takings.
 */
export function defaultRange(): { from: Date; to: Date } {
  const [y, m, d] = TODAY_ISO.split("-").map(Number)
  return { from: new Date(y, m - 1, 1), to: new Date(y, m - 1, d) }
}

export function periodBounds(key: PeriodKey): {
  fromIso: string
  toIso: string
} {
  if (key === "month-to-date") return { fromIso: `${TODAY_ISO.slice(0, 7)}-01`, toIso: TODAY_ISO }
  return { fromIso: "2026-07-01", toIso: "2026-07-31" }
}

/** The next run per rail — what the headline's "arriving" clause reads (G1). */
export function nextPayoutDay(rail: CamiPayRail): string {
  if (rail === "terminal") return addDays(TODAY_ISO, 1)
  const day = new Date(`${TODAY_ISO}T00:00:00Z`)
  do {
    day.setUTCDate(day.getUTCDate() + 1)
  } while (day.getUTCDay() !== 4)
  return day.toISOString().slice(0, 10)
}
