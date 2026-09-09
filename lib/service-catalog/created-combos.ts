"use client"

import { useMemo } from "react"
import { seedServices } from "./mock-data"
import { useServices } from "./store"
import type { Service } from "./types"

/**
 * Combos an operator built on the service menu (PRD-143) — the ones the seed
 * data did not ship with.
 *
 * The appointment sheet and the POS cart each keep their own demo catalog (pet
 * grooming, and a salon), and those stay separate on purpose. But a combo
 * someone just created has to be bookable and sellable, or Save looks like it
 * did nothing — so both surfaces append this list to their own and map it into
 * their own item shape.
 */
export function useCreatedCombos(): Service[] {
  const { data: services } = useServices()

  return useMemo(
    () =>
      (services ?? []).filter(
        (s) =>
          s.serviceType === "combo" &&
          s.isActive !== false &&
          !seedServices.some((seed) => seed.id === s.id),
      ),
    [services],
  )
}
