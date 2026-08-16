"use client"

// CamiPay settlement config, per merchant, in Cami HQ (PRO-737).
// Spec: docs/specs/PRO-737-cami-hq-camipay-config.md
//
// Two things live here: the rail flags (mutable per-merchant config) and the
// rate card (append-only rows). The split is deliberate and load-bearing.
//
// A rate card is NOT one number you edit. It is a list of
// (rail, rate, effectiveFrom) rows, and changing a rate appends a row. That is
// why this store exposes `addRate` and no `updateRate` / `removeRate` — the
// missing actions are the invariant (INV-12, forward-only config). Reports and
// settlement read the rate snapshotted onto each transaction at capture time,
// never the merchant's current rate, or every past transaction silently
// re-rates the moment someone edits the card.
//
// Same shape as lib/terminals/store.tsx: React context + localStorage, with an
// inert default returned outside a provider so isolated surfaces (playground,
// tests) still render.

import { createContext, useContext, useEffect, useMemo, useState } from "react"

// v2: the rate stopped being a bare percentage and became percent + fixed +
// an optional ceiling for the fixed part. The old v1 payload cannot be read as
// the new shape, so the key is bumped rather than migrated.
const STORAGE_KEY = "cami-hq-camipay-v2"

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CamiPayRail = "terminal" | "online"

export const CAMIPAY_RAILS: {
  id: CamiPayRail
  label: string
  description: string
}[] = [
  {
    id: "terminal",
    label: "CamiPay Terminal",
    description: "Card machine payments taken in person, at the counter.",
  },
  {
    id: "online",
    label: "CamiPay Online",
    description: "Payment links and checkout on the public booking page.",
  },
]

export function railLabel(rail: CamiPayRail): string {
  return CAMIPAY_RAILS.find((r) => r.id === rail)?.label ?? rail
}

/**
 * Providers behind the rails. The rail is not hard-coupled to a provider
 * (INV-P3), so the two rails can sit on different gateways. NeoPay is the only
 * one routable today; the rest are listed so ops can see what is coming and
 * are marked so nobody assigns a merchant to a dead rail by accident.
 */
export type GatewayId = "neopay" | "tappay" | "ni" | "stripe"

export const GATEWAYS: {
  id: GatewayId
  label: string
  status: "live" | "onboarding"
}[] = [
  { id: "neopay", label: "NeoPay", status: "live" },
  { id: "tappay", label: "TapPay", status: "onboarding" },
  { id: "ni", label: "Network International", status: "onboarding" },
  { id: "stripe", label: "Stripe", status: "onboarding" },
]

export function gatewayLabel(id: GatewayId | null): string {
  if (!id) return "Not assigned"
  return GATEWAYS.find((g) => g.id === id)?.label ?? id
}

/**
 * What Cami charges the Partner on one transaction. Two components, because a
 * take rate in this market is quoted as both: "3% + AED 0.75 per transaction".
 * A percentage alone under-recovers on small tickets, where the gateway's own
 * per-transaction cost is close to the whole fee.
 *
 * Amounts are in fils (minor units), never floats. `fixedMinor: 75` is
 * AED 0.75.
 */
export type CamiPayRate = {
  /** Percentage component, e.g. 3 for 3%. */
  percent: number
  /** Fixed per-transaction component, in fils. 0 means percentage only. */
  fixedMinor: number
  /**
   * Ceiling for the fixed component, in fils. The fixed part applies only to
   * transactions BELOW this amount; at or above it the Partner pays the
   * percentage alone. `null` means the fixed part applies to every
   * transaction.
   *
   * This is Firaz's bracket: the fixed fee exists to cover the floor cost on
   * small tickets, so above a threshold it stops earning its keep and charging
   * it just makes Cami look expensive on the invoices Partners scrutinise most.
   */
  fixedBelowMinor: number | null
}

/** A rate that costs the Partner nothing. What an unconfigured rail resolves to. */
export const ZERO_RATE: CamiPayRate = { percent: 0, fixedMinor: 0, fixedBelowMinor: null }

export function isZeroRate(rate: CamiPayRate): boolean {
  return rate.percent === 0 && rate.fixedMinor === 0
}

/**
 * One row of a merchant's rate card. Append-only: a rate change writes a new
 * row, it never mutates an existing one. `createdBy` / `createdAt` are the
 * attribution (INV-08); `effectiveFrom` is when the rate starts applying, which
 * is not the same thing as when it was entered.
 */
export type RateRow = {
  id: string
  merchantId: string
  rail: CamiPayRail
  rate: CamiPayRate
  /** ISO `YYYY-MM-DD`. Applies to captures on or after this date. */
  effectiveFrom: string
  createdBy: string
  /** ISO timestamp of when the row was written. */
  createdAt: string
}

export type RailConfig = {
  enabled: boolean
  gatewayId: GatewayId | null
}

export type MerchantCamiPayConfig = Record<CamiPayRail, RailConfig>

export type CamiPayState = {
  /** Keyed by `AdminBusiness.id`. */
  configs: Record<string, MerchantCamiPayConfig>
  rates: RateRow[]
}

/* -------------------------------------------------------------------------- */
/* Mock data                                                                  */
/* -------------------------------------------------------------------------- */

const OFF: MerchantCamiPayConfig = {
  terminal: { enabled: false, gatewayId: null },
  online: { enabled: false, gatewayId: null },
}

export const DEFAULT_CAMIPAY_STATE: CamiPayState = {
  configs: {
    // Both rails live on one gateway, the common case.
    biz_shampooch: {
      terminal: { enabled: true, gatewayId: "neopay" },
      online: { enabled: true, gatewayId: "neopay" },
    },
    // Split providers across rails, the INV-P3 case worth seeing in the UI.
    biz_pawhaus: {
      terminal: { enabled: true, gatewayId: "tappay" },
      online: { enabled: true, gatewayId: "neopay" },
    },
    // Onboarding: rails off, no rate card yet. Drives the empty state.
    biz_velvetpaw: OFF,
    // Suspended: rails still configured. Suspension is a lifecycle state, the
    // commercial terms outlive it.
    biz_doggos: {
      terminal: { enabled: true, gatewayId: "neopay" },
      online: { enabled: false, gatewayId: null },
    },
    biz_furrytales: {
      terminal: { enabled: false, gatewayId: null },
      online: { enabled: false, gatewayId: "neopay" },
    },
  },
  rates: [
    // Shampooch JVC: opened on the platform defaults (2% / 3.5%, no fixed),
    // renegotiated from 01 May. The online cut trades percentage for a fixed
    // component under AED 100, which is the case the old percent-only model
    // could not hold. The date sits before the demo sales (25 May) on purpose,
    // so the rates on `/sales` and the rate card here tell the same story.
    {
      id: "rate_sh_t1",
      merchantId: "biz_shampooch",
      rail: "terminal",
      rate: { percent: 2, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-03-04",
      createdBy: "Michelle You",
      createdAt: "2026-03-04T09:20:00Z",
    },
    {
      id: "rate_sh_o1",
      merchantId: "biz_shampooch",
      rail: "online",
      rate: { percent: 3.5, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-03-04",
      createdBy: "Michelle You",
      createdAt: "2026-03-04T09:20:00Z",
    },
    {
      id: "rate_sh_t2",
      merchantId: "biz_shampooch",
      rail: "terminal",
      rate: { percent: 1.8, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-05-01",
      createdBy: "Maz Khan",
      createdAt: "2026-04-22T11:04:00Z",
    },
    {
      id: "rate_sh_o2",
      merchantId: "biz_shampooch",
      rail: "online",
      rate: { percent: 3, fixedMinor: 75, fixedBelowMinor: 10000 },
      effectiveFrom: "2026-05-01",
      createdBy: "Maz Khan",
      createdAt: "2026-04-22T11:04:00Z",
    },
    // Pawhaus: flat since onboarding, with a future-dated cut already agreed.
    // The scheduled row is what proves the forward-only model in the UI, and
    // the online rail carries the threshold bracket so it is visible somewhere.
    {
      id: "rate_pw_t1",
      merchantId: "biz_pawhaus",
      rail: "terminal",
      rate: { percent: 2, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-03-18",
      createdBy: "Michelle You",
      createdAt: "2026-03-18T10:12:00Z",
    },
    {
      id: "rate_pw_o1",
      merchantId: "biz_pawhaus",
      rail: "online",
      rate: { percent: 3.25, fixedMinor: 100, fixedBelowMinor: 10000 },
      effectiveFrom: "2026-03-18",
      createdBy: "Michelle You",
      createdAt: "2026-03-18T10:12:00Z",
    },
    {
      id: "rate_pw_t2",
      merchantId: "biz_pawhaus",
      rail: "terminal",
      rate: { percent: 1.9, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-09-01",
      createdBy: "Hareem Adil",
      createdAt: "2026-08-04T14:30:00Z",
    },
    {
      id: "rate_dg_t1",
      merchantId: "biz_doggos",
      rail: "terminal",
      rate: { percent: 2.2, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-02-12",
      createdBy: "Michelle You",
      createdAt: "2026-02-12T09:10:00Z",
    },
    {
      id: "rate_ft_t1",
      merchantId: "biz_furrytales",
      rail: "terminal",
      rate: { percent: 2.5, fixedMinor: 0, fixedBelowMinor: null },
      effectiveFrom: "2026-01-08",
      createdBy: "Michelle You",
      createdAt: "2026-01-08T08:30:00Z",
    },
  ],
}

/* -------------------------------------------------------------------------- */
/* Read helpers                                                               */
/* -------------------------------------------------------------------------- */

/** Local-date safe `YYYY-MM-DD` for today. */
export function todayIso(): string {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

/**
 * Parse a date-only `YYYY-MM-DD` as LOCAL midnight. `new Date("2026-06-01")`
 * parses as UTC midnight, which renders as 31 May in any timezone behind UTC
 * and makes "today" fall before local midnight in any timezone ahead of it.
 * Effective-from dates are calendar dates, not instants, so they must never go
 * through the UTC path.
 */
export function parseEffectiveDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Calendar-date formatter for `effectiveFrom`, matching `formatDate`'s style. */
export function formatEffectiveDate(iso: string): string {
  return parseEffectiveDate(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/**
 * The Partner the Business app is standing in for. The prototype's Business
 * portal is always Shampooch JVC, so its merchant-side surfaces read the same
 * store HQ writes to and a rate change in HQ shows up in the Partner's own
 * settings without any wiring in between.
 */
export const DEMO_MERCHANT_ID = "biz_shampooch"

export function merchantConfig(state: CamiPayState, merchantId: string): MerchantCamiPayConfig {
  return state.configs[merchantId] ?? OFF
}

/** Every row for one rail, newest effective date first. */
export function railRates(state: CamiPayState, merchantId: string, rail: CamiPayRail): RateRow[] {
  return state.rates
    .filter((r) => r.merchantId === merchantId && r.rail === rail)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
}

/** Every row for a merchant, newest effective date first, rail-agnostic. */
export function merchantRates(state: CamiPayState, merchantId: string): RateRow[] {
  return state.rates
    .filter((r) => r.merchantId === merchantId)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom) || b.rail.localeCompare(a.rail))
}

/**
 * The rate in force on a given date: newest row whose `effectiveFrom` is on or
 * before it. This is the same resolution a capture would run to snapshot the
 * rate onto a transaction, which is why it takes a date rather than assuming
 * "now".
 */
export function effectiveRate(
  state: CamiPayState,
  merchantId: string,
  rail: CamiPayRail,
  onIso: string = todayIso(),
): RateRow | null {
  return railRates(state, merchantId, rail).find((r) => r.effectiveFrom <= onIso) ?? null
}

/**
 * The rate a capture would actually charge. An unconfigured rail resolves to
 * `ZERO_RATE`, not to an error and not to a platform default: Maaz's rule is
 * that a missing rate means Cami charges nothing, and the surfaces make that
 * consequence visible rather than papering over it with a fallback number.
 */
export function effectiveRateValue(
  state: CamiPayState,
  merchantId: string,
  rail: CamiPayRail,
  onIso: string = todayIso(),
): CamiPayRate {
  return effectiveRate(state, merchantId, rail, onIso)?.rate ?? ZERO_RATE
}

/** Rows dated in the future, soonest first. Rendered as "Scheduled". */
export function scheduledRates(
  state: CamiPayState,
  merchantId: string,
  rail: CamiPayRail,
  onIso: string = todayIso(),
): RateRow[] {
  return railRates(state, merchantId, rail)
    .filter((r) => r.effectiveFrom > onIso)
    .reverse()
}

/* -------------------------------------------------------------------------- */
/* Rate formatting and fee maths                                              */
/* -------------------------------------------------------------------------- */

/** `7500` becomes `AED 75.00`. Always two decimals, money never trims. */
export function formatAed(minor: number): string {
  const sign = minor < 0 ? "-" : ""
  return `${sign}AED ${(Math.abs(minor) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatPercent(percent: number): string {
  // Trailing zero reads as precision that isn't there: 2%, not 2.00%.
  return `${Number(percent.toFixed(2))}%`
}

/**
 * The headline rate: `3%`, or `3% + AED 0.75`. The threshold is deliberately
 * NOT in here. A rate has to be sayable in one breath, and
 * "3% + AED 0.75 on sales under AED 100" is not that. The bracket renders as a
 * second line, see `formatRateBracket`.
 */
export function formatRate(rate: CamiPayRate): string {
  if (isZeroRate(rate)) return "No fee"
  if (rate.fixedMinor === 0) return formatPercent(rate.percent)
  if (rate.percent === 0) return `${formatAed(rate.fixedMinor)} per transaction`
  return `${formatPercent(rate.percent)} + ${formatAed(rate.fixedMinor)}`
}

/**
 * The bracket qualifier, or null when the rate has no bracket to explain.
 * Only meaningful when a fixed component exists, since the threshold gates
 * nothing else.
 */
export function formatRateBracket(rate: CamiPayRate): string | null {
  if (rate.fixedMinor === 0 || rate.fixedBelowMinor === null) return null
  return `${formatAed(rate.fixedMinor)} applies under ${formatAed(rate.fixedBelowMinor)}, ${formatPercent(rate.percent)} alone at or above`
}

export type FeeBreakdown = {
  /** The percentage component of the fee, in fils. */
  percentMinor: number
  /** The fixed component actually charged, in fils. Zero when the bracket excludes it. */
  fixedMinor: number
  /** What the Partner pays Cami on this transaction, in fils. */
  totalMinor: number
  /** What lands with the Partner, in fils. */
  netMinor: number
  /** False when a fixed component exists but this transaction sat above the bracket. */
  fixedApplied: boolean
}

/**
 * Apply a rate to one transaction. This is the single place the arithmetic
 * lives, so HQ's preview, the merchant's sale breakdown, and (eventually)
 * settlement cannot drift from each other.
 *
 * Takes an absolute amount. Refunds are handled by the caller deciding what to
 * do with a reversed fee, which is a commercial question this function has no
 * business answering.
 */
export function computeFee(rate: CamiPayRate, amountMinor: number): FeeBreakdown {
  const base = Math.abs(amountMinor)
  const percentMinor = Math.round((base * rate.percent) / 100)
  const fixedApplied =
    rate.fixedMinor > 0 && (rate.fixedBelowMinor === null || base < rate.fixedBelowMinor)
  const fixedMinor = fixedApplied ? rate.fixedMinor : 0
  const totalMinor = percentMinor + fixedMinor
  return { percentMinor, fixedMinor, totalMinor, netMinor: base - totalMinor, fixedApplied }
}

/**
 * How the fee was arrived at, in one line, for a specific transaction:
 * `3% of AED 120.00 + AED 0.75`. Shown to the Partner so the number is not a
 * black box, which is the whole point of GNK's breakdown requirement.
 */
export function explainFee(rate: CamiPayRate, amountMinor: number): string {
  const { fixedApplied } = computeFee(rate, amountMinor)
  const pct = `${formatPercent(rate.percent)} of ${formatAed(Math.abs(amountMinor))}`
  if (!fixedApplied) return pct
  return `${pct} + ${formatAed(rate.fixedMinor)}`
}

/* -------------------------------------------------------------------------- */
/* Store                                                                      */
/* -------------------------------------------------------------------------- */

export type CamiPayValue = CamiPayState & {
  setRailEnabled: (merchantId: string, rail: CamiPayRail, enabled: boolean) => void
  setRailGateway: (merchantId: string, rail: CamiPayRail, gatewayId: GatewayId | null) => void
  /**
   * Appends a rate-card row. There is no update or delete counterpart, by
   * design: a processed transaction's rate is a financial fact (INV-01).
   */
  addRate: (input: {
    merchantId: string
    rail: CamiPayRail
    rate: CamiPayRate
    effectiveFrom: string
    createdBy: string
  }) => void
  reset: () => void
}

const CamiPayContext = createContext<CamiPayValue | null>(null)

function readStored(): CamiPayState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CamiPayState
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.rates)) return null
    return parsed
  } catch {
    return null
  }
}

export function CamiPayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CamiPayState>(DEFAULT_CAMIPAY_STATE)

  // Hydrate after mount so the server and first client render agree.
  useEffect(() => {
    const stored = readStored()
    if (stored) setState(stored)
  }, [])

  const value = useMemo<CamiPayValue>(() => {
    function persist(next: CamiPayState) {
      setState(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // ignore
      }
    }

    function patchRail(merchantId: string, rail: CamiPayRail, patch: Partial<RailConfig>) {
      const current = merchantConfig(state, merchantId)
      persist({
        ...state,
        configs: {
          ...state.configs,
          [merchantId]: { ...current, [rail]: { ...current[rail], ...patch } },
        },
      })
    }

    return {
      ...state,
      setRailEnabled: (merchantId, rail, enabled) => patchRail(merchantId, rail, { enabled }),
      setRailGateway: (merchantId, rail, gatewayId) => patchRail(merchantId, rail, { gatewayId }),
      addRate: ({ merchantId, rail, rate, effectiveFrom, createdBy }) =>
        persist({
          ...state,
          rates: [
            ...state.rates,
            {
              id: `rate_${merchantId}_${rail}_${state.rates.length + 1}`,
              merchantId,
              rail,
              rate,
              effectiveFrom,
              createdBy,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      reset: () => {
        setState(DEFAULT_CAMIPAY_STATE)
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // ignore
        }
      },
    }
  }, [state])

  return <CamiPayContext.Provider value={value}>{children}</CamiPayContext.Provider>
}

/**
 * Read CamiPay config and rate cards. Returns the (inert) default outside a
 * provider so any surface rendered in isolation still works.
 */
export function useCamiPay(): CamiPayValue {
  const ctx = useContext(CamiPayContext)
  if (ctx) return ctx
  return {
    ...DEFAULT_CAMIPAY_STATE,
    setRailEnabled: () => {},
    setRailGateway: () => {},
    addRate: () => {},
    reset: () => {},
  }
}
