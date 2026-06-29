"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  PACKAGE_SECTIONS,
  PackageForm,
  type PackageSectionId,
} from "@/components/blocks/package-form"
import { SectionNav } from "@/components/blocks/section-nav"

export default function NewPackagePage() {
  const router = useRouter()
  const [section, setSection] = useState<PackageSectionId>("basics")

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/catalogs/packages")
      }}
      title="Create package"
      saveLabel="Create package"
      // Save is inert for now (no submission action).
      onSave={() => {}}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={PACKAGE_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <PackageForm section={section} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
