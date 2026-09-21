"use client"

/**
 * Per-branch stock, as a session can change it (R16, R11).
 *
 * Same shape as `lib/service-catalog/offerings-store.tsx` and
 * `lib/locations/branch-settings.tsx`, for the same reason: a control that
 * offers an input and drops the value is worse than one that shows a figure it
 * cannot change. The reorder thresholds were rendered as text under a card
 * whose copy said "each location sets its own", which is a claim with nowhere
 * to act on it.
 *
 * **There is no business total in here.** R16 says it is derived from the
 * Locations and never stored independently, so `businessQuantity()` is the only
 * way to get one and there is no setter it could disagree with.
 *
 * A movement changes exactly one branch's balance (DW4.1). That is not a rule
 * enforced by a comment: `adjust` takes a `locationId` and touches only the row
 * for it, and every caller gets that id from `WriteTargetLocation` rather than
 * from a default.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import type { BranchStock } from "@/lib/inventory/branch-stock"
import { BRANCH_STOCK } from "@/lib/inventory/mock"

const STORAGE_KEY = "cami-branch-stock"

type BranchStockValue = {
  /** Every row, for the resolvers in branch-stock.ts to read. */
  stock: BranchStock[]
  /**
   * Apply a movement at one branch (R11, R16, DW4.1). `delta` is signed: a
   * delivery is positive, a removal negative. Nothing clamps at zero — the
   * built product allows a negative balance, and hiding it would lose the fact
   * that more was sold than received.
   */
  adjust: (productId: string, locationId: string, delta: number) => void
  /** Set one branch's reorder configuration. `undefined` clears it. */
  setThresholds: (
    productId: string,
    locationId: string,
    patch: { lowStockLevel?: number; reorderQty?: number },
  ) => void
}

const BranchStockContext = createContext<BranchStockValue | null>(null)

function readStored(): BranchStock[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BranchStock[]
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Find the row, or make one — a branch with no row has none of this product. */
function withRow(
  rows: BranchStock[],
  productId: string,
  locationId: string,
): { rows: BranchStock[]; index: number } {
  const index = rows.findIndex(
    (row) => row.productId === productId && row.locationId === locationId,
  )
  if (index >= 0) return { rows: [...rows], index }
  return {
    rows: [...rows, { productId, locationId, quantity: 0 }],
    index: rows.length,
  }
}

export function BranchStockProvider({
  children,
  persist = true,
}: {
  children: React.ReactNode
  /** False for a showcase, so a demo movement is not written over the real one. */
  persist?: boolean
}) {
  // Seeded, then hydrated in an effect so server and first client render agree.
  const [stock, setStock] = useState<BranchStock[]>(BRANCH_STOCK)

  useEffect(() => {
    if (!persist) return
    const saved = readStored()
    if (saved) setStock(saved)
  }, [persist])

  const write = useCallback(
    (mutate: (rows: BranchStock[]) => BranchStock[]) => {
      setStock((current) => {
        const next = mutate(current)
        if (persist) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    },
    [persist],
  )

  const value = useMemo<BranchStockValue>(
    () => ({
      stock,
      adjust: (productId, locationId, delta) =>
        write((current) => {
          const { rows, index } = withRow(current, productId, locationId)
          const row = rows[index]!
          rows[index] = { ...row, quantity: row.quantity + delta }
          return rows
        }),
      setThresholds: (productId, locationId, patch) =>
        write((current) => {
          const { rows, index } = withRow(current, productId, locationId)
          rows[index] = { ...rows[index]!, ...patch }
          return rows
        }),
    }),
    [stock, write],
  )

  return <BranchStockContext.Provider value={value}>{children}</BranchStockContext.Provider>
}

/**
 * Works outside a provider, on the seed, so a surface rendered in isolation
 * still resolves coherent balances — the same shape `useLocations` uses. Writes
 * are no-ops there rather than throwing.
 */
export function useBranchStock(): BranchStockValue {
  const ctx = useContext(BranchStockContext)
  if (ctx) return ctx
  return { stock: BRANCH_STOCK, adjust: () => {}, setThresholds: () => {} }
}
