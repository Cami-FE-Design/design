"use client"

import { useMemo } from "react"
import { MOCK_SERVICE_CATALOG, type MockServiceCatalogItem } from "@/app/appointments/mock"
import { useCreatedCombos } from "@/lib/service-catalog/created-combos"
import { useServiceCategories } from "@/lib/service-catalog/store"
import { APPOINTMENT_COLORS } from "@/lib/service-catalog/types"

/**
 * The service list the appointment pickers show: the demo catalog, plus any
 * combo created on the service menu (PRD-143).
 *
 * The two mocks stay separate on purpose — the appointment demo data is pet
 * grooming, the catalog seed is a salon — but a combo an operator just built
 * has to be bookable, or Save looks like it did nothing. So only combos the
 * catalog did NOT ship with are bridged; each keeps its merchant category as
 * its own group heading and rail color rather than being forced into one of
 * the six demo categories.
 */
export function useAppointmentServiceCatalog(): MockServiceCatalogItem[] {
  const created = useCreatedCombos()
  const { data: categories } = useServiceCategories()

  return useMemo(() => {
    if (created.length === 0) return MOCK_SERVICE_CATALOG

    const bridged = created.map<MockServiceCatalogItem>((combo) => {
      const category = categories?.find((c) => c.id === combo.categoryId)
      return {
        id: combo.id,
        // Only used as the fallback for label/accent lookups, which the two
        // fields below override for every bridged item.
        category: "grooming",
        categoryLabel: category?.name ?? combo.categoryName ?? "Combos",
        accentHex: APPOINTMENT_COLORS.find((c) => c.value === category?.color)?.hex ?? "#c4b5fd",
        name: combo.name,
        durationMin: combo.duration,
        priceMinor: Math.round(combo.price * 100),
        isCombo: true,
        componentNames: (combo.components ?? []).map((c) => c.name),
      }
    })

    return [...MOCK_SERVICE_CATALOG, ...bridged]
  }, [created, categories])
}
