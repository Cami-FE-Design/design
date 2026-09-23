"use client"

import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  PACKAGE_SECTIONS,
  type PackageDraft,
  PackageForm,
  type PackageSectionId,
} from "@/components/blocks/package-form"
import { SectionNav } from "@/components/blocks/section-nav"
import { usePackages } from "@/lib/packages/store"

function EditPackagePageInner() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  /**
   * `?s=<section>` opens the takeover on that section.
   *
   * A link about where a package sells has to land on Online sales; dropping
   * the reader on Basic info asks them to find it, which is the same defect the
   * service editor's `?ss=` closed.
   */
  const sectionParam = useSearchParams().get("s")
  const [section, setSection] = useState<PackageSectionId>(
    PACKAGE_SECTIONS.some((x) => x.id === sectionParam)
      ? (sectionParam as PackageSectionId)
      : "basics",
  )

  const { byId, update, remove } = usePackages()
  const [draft, setDraft] = useState<PackageDraft | null>(null)
  const pkg = byId(id)
  const name = pkg?.name ?? "Package"

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
      onSave={() => {
        if (draft) update(id, draft)
        goBack()
      }}
      onDelete={() => {
        remove(id)
        goBack()
      }}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={PACKAGE_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <PackageForm
            section={section}
            editing={pkg}
            initialName={name}
            onDraftChange={setDraft}
          />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}

// `useSearchParams` needs a boundary above it, the same shape the service menu
// route uses.
export default function EditPackagePage() {
  return (
    <Suspense>
      <EditPackagePageInner />
    </Suspense>
  )
}
