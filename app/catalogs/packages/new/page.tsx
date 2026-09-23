"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  PACKAGE_SECTIONS,
  type PackageDraft,
  PackageForm,
  type PackageSectionId,
} from "@/components/blocks/package-form"
import { SectionNav } from "@/components/blocks/section-nav"
import { usePackages } from "@/lib/packages/store"

export default function NewPackagePage() {
  const router = useRouter()
  const [section, setSection] = useState<PackageSectionId>("basics")
  const { create } = usePackages()
  const [draft, setDraft] = useState<PackageDraft | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/catalogs/packages")
      }}
      title="Create package"
      saveLabel="Create package"
      /* A name and at least one service, because a package covering nothing
         can never pay for a line — and the till would show it as an option
         that does nothing. Said beside Save rather than greying it out in
         silence. */
      onSave={() => {
        if (!draft?.name) return setError("Give the package a name.")
        if (draft.services.length === 0) return setError("Choose at least one service.")
        const created = create(draft)
        router.push(`/catalogs/packages?package=${created.id}`)
      }}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={PACKAGE_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          {error ? (
            <p className="rounded-xl bg-cami-tomato-2 p-3 text-sm leading-5 text-foreground">
              {error}
            </p>
          ) : null}
          <PackageForm section={section} onDraftChange={setDraft} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
