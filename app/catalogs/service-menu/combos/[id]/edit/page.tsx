"use client"

import { useParams, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  COMBO_SECTIONS,
  type ComboDraft,
  ComboForm,
  type ComboFormInitial,
  type ComboSectionId,
} from "@/components/blocks/combo-form"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { SectionNav } from "@/components/blocks/section-nav"
import { Skeleton } from "@/components/ui"
import { useService, useServiceCatalogMutations } from "@/lib/service-catalog/store"

/**
 * Editing a combo (PRD-143). A combo is stored as a service, but it is not
 * shaped like one — it has components, a schedule type and its own pricing
 * rules — so a combo card's Edit lands here rather than in the single-service
 * takeover, which had no field for any of that.
 */
export default function EditComboPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [section, setSection] = useState<ComboSectionId>("basics")
  const [draft, setDraft] = useState<ComboDraft | null>(null)

  const { data: combo, isLoading } = useService(id)
  const { updateCombo } = useServiceCatalogMutations()

  const handleDraftChange = useCallback((next: ComboDraft) => setDraft(next), [])

  const initial = useMemo<ComboFormInitial | undefined>(
    () =>
      combo
        ? {
            name: combo.name,
            categoryId: combo.categoryId,
            description: combo.description,
            componentIds: (combo.components ?? []).map((c) => c.id),
            scheduleType: combo.scheduleType,
            priceType: combo.comboPriceType,
            // Only the custom rule types a price in; the others derive it.
            retailPrice: combo.comboPriceType === "custom" ? combo.price : undefined,
            discountPercent: combo.comboDiscountPercent,
          }
        : undefined,
    [combo],
  )

  function goBack() {
    router.push("/catalogs/service-menu")
  }

  function handleSave() {
    if (!draft?.name) {
      toast.error("Add a combo name")
      return
    }
    if (!draft.categoryId) {
      toast.error("Pick a category for this combo")
      return
    }
    if (draft.components.length === 0) {
      toast.error("Add at least one service to this combo")
      return
    }

    updateCombo.mutate({
      id,
      input: {
        name: draft.name,
        categoryId: draft.categoryId,
        description: draft.description || undefined,
        priceType: draft.price === 0 ? "Free" : "Fixed",
        price: draft.price,
        duration: draft.durationMin,
        components: draft.components,
        scheduleType: draft.scheduleType,
        comboPriceType: draft.priceType,
        comboDiscountPercent: draft.discountPercent,
      },
    })
    goBack()
  }

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) goBack()
      }}
      title={combo ? `Edit ${combo.name}` : "Edit combo"}
      onSave={handleSave}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={COMBO_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          {isLoading || !initial ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-30 w-full rounded-2xl" />
            </div>
          ) : (
            // Keyed on the combo so the form's initial state is read against the
            // right record rather than a stale mount.
            <ComboForm
              key={id}
              section={section}
              initial={initial}
              onDraftChange={handleDraftChange}
            />
          )}
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
