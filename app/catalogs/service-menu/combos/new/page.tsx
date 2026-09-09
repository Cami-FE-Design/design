"use client"

import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { toast } from "sonner"
import {
  COMBO_SECTIONS,
  type ComboDraft,
  ComboForm,
  type ComboSectionId,
} from "@/components/blocks/combo-form"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { SectionNav } from "@/components/blocks/section-nav"
import { useServiceCatalogMutations } from "@/lib/service-catalog/store"

export default function NewComboPage() {
  const router = useRouter()
  const [section, setSection] = useState<ComboSectionId>("basics")
  const [draft, setDraft] = useState<ComboDraft | null>(null)
  const { createCombo } = useServiceCatalogMutations()

  // Stable so the form's report-upward effect doesn't fire on every render.
  const handleDraftChange = useCallback((next: ComboDraft) => setDraft(next), [])

  function handleSave() {
    // The three fields a combo cannot be stored without. Reported as toasts
    // rather than inline errors because the offending field can be in a section
    // the operator has navigated away from.
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

    createCombo.mutate({
      name: draft.name,
      categoryId: draft.categoryId,
      description: draft.description || undefined,
      // "Free" is a price type of its own in the catalog, not a price of zero.
      priceType: draft.price === 0 ? "Free" : "Fixed",
      price: draft.price,
      duration: draft.durationMin,
      components: draft.components,
      scheduleType: draft.scheduleType,
      comboPriceType: draft.priceType,
      comboDiscountPercent: draft.discountPercent,
    })
    router.push("/catalogs/service-menu")
  }

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/catalogs/service-menu")
      }}
      title="New combo"
      onSave={handleSave}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={COMBO_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <ComboForm section={section} onDraftChange={handleDraftChange} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
