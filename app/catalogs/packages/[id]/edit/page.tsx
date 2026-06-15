"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  PACKAGE_SECTIONS,
  PackageForm,
  type PackageSectionId,
} from "@/components/blocks/package-form"
import { SectionNav } from "@/components/blocks/section-nav"

// Prototype: name lookup mirrors the listing mock. Replace with the real
// package store once it exists.
const NAME_BY_ID: Record<string, string> = {
  "bath-brush-5": "Bath & Brush 5+1",
  "full-groom-3": "Full Groom 3+1",
  "puppy-starter": "Puppy Starter Pack",
  "nail-trim-10": "Nail Trim 10-pack",
  "spa-day-4": "Spa Day x4",
  "deshed-monthly": "De-shed Monthly",
  "cat-groom-3": "Cat Groom 3+1",
  "aroma-5": "Aromatherapy Spa x5",
}

export default function EditPackagePage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [section, setSection] = useState<PackageSectionId>("basics")

  const name = NAME_BY_ID[id] ?? "Package"

  function goBack() {
    router.push("/catalogs/packages")
  }

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) goBack()
      }}
      title={`Edit ${name}`}
      // Save and Delete are inert for now (no persistence) — both return to the list.
      onSave={goBack}
      onDelete={goBack}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={PACKAGE_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <PackageForm section={section} initialName={name} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
