"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { COMBO_SECTIONS, ComboForm, type ComboSectionId } from "@/components/blocks/combo-form"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import { SectionNav } from "@/components/blocks/section-nav"

export default function NewComboPage() {
  const router = useRouter()
  const [section, setSection] = useState<ComboSectionId>("basics")

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/catalogs/service-menu")
      }}
      title="New combo"
      // Save is inert for now (no submission action).
      onSave={() => {}}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={COMBO_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <ComboForm section={section} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
