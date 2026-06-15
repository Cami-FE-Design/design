"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  MEMBERSHIP_SECTIONS,
  MembershipForm,
  type MembershipSectionId,
} from "@/components/blocks/membership-form"
import { SectionNav } from "@/components/blocks/section-nav"

export default function NewMembershipPage() {
  const router = useRouter()
  const [section, setSection] = useState<MembershipSectionId>("basics")

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/catalogs/memberships")
      }}
      title="Create a membership"
      subtitle="Sell a package of services your clients can redeem over time."
      saveLabel="Create membership"
      // Save is inert for now (no submission action).
      onSave={() => router.push("/catalogs/memberships")}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={MEMBERSHIP_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <MembershipForm section={section} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
