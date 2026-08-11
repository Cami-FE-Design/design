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

const STORAGE_KEY = "cami-hq-camipay-v1"

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
 * One row of a merchant's rate card. Append-only: a rate change writes a new
 * row, it never mutates an existing one. `createdBy` / `createdAt` are the
 * attribution (INV-08); `effectiveFrom` is when the rate starts applying, which
 * is not the same thing as when it was entered.
 */
export type RateRow = {
  id: string
  merchantId: string
  rail: CamiPayRail
  /** Take rate as a percentage, e.g. 1.8 for 1.8%. */
  rate: number
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
    // Shampooch JVC: opened at 2%/3.5%, renegotiated down from 01 Jun.
    {
      id: "rate_sh_t1",
      merchantId: "biz_shampooch",
      rail: "terminal",
      rate: 2,
      effectiveFrom: "2026-03-04",
      createdBy: "Michelle You",
      createdAt: "2026-03-04T09:20:00Z",
    },
    {
      id: "rate_sh_o1",
      merchantId: "biz_shampooch",
      rail: "online",
      rate: 3.5,
      effectiveFrom: "2026-03-04",
      createdBy: "Michelle You",
      createdAt: "2026-03-04T09:20:00Z",
    },
    {
      id: "rate_sh_t2",
      merchantId: "biz_shampooch",
      rail: "terminal",
      rate: 1.8,
      effectiveFrom: "2026-06-01",
      createdBy: "Maz Khan",
      createdAt: "2026-05-22T11:04:00Z",
    },
    {
      id: "rate_sh_o2",
      merchantId: "biz_shampooch",
      rail: "online",
      rate: 3,
      effectiveFrom: "2026-06-01",
      createdBy: "Maz Khan",
      createdAt: "2026-05-22T11:04:00Z",
    },
    // Pawhaus: flat since onboarding, with a future-dated cut already agreed.
    // The scheduled row is what proves the forward-only model in the UI.
    {
      id: "rate_pw_t1",
      merchantId: "biz_pawhaus",
      rail: "terminal",
      rate: 2,
      effectiveFrom: "2026-03-18",
      createdBy: "Michelle You",
      createdAt: "2026-03-18T10:12:00Z",
    },
    {
      id: "rate_pw_o1",
      merchantId: "biz_pawhaus",
      rail: "online",
      rate: 3.25,
      effectiveFrom: "2026-03-18",
      createdBy: "Michelle You",
      createdAt: "2026-03-18T10:12:00Z",
    },
    {
      id: "rate_pw_t2",
      merchantId: "biz_pawhaus",
      rail: "terminal",
      rate: 1.9,
      effectiveFrom: "2026-09-01",
      createdBy: "Hareem Adil",
      createdAt: "2026-08-04T14:30:00Z",
    },
    {
      id: "rate_dg_t1",
      merchantId: "biz_doggos",
      rail: "terminal",
      rate: 2.2,
      effectiveFrom: "2026-02-12",
      createdBy: "Michelle You",
      createdAt: "2026-02-12T09:10:00Z",
    },
    {
      id: "rate_ft_t1",
      merchantId: "biz_furrytales",
      rail: "terminal",
      rate: 2.5,
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

export function formatRate(rate: number): string {
  // Trailing zero reads as precision that isn't there: 2%, not 2.00%.
  return `${Number(rate.toFixed(2))}%`
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
    rate: number
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
