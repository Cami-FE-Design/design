"use client"

import { CalendarClockIcon } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { EmptyState } from "@/components/blocks/empty-state"
import { FullScreenEditDialog } from "@/components/blocks/full-screen-edit-dialog"
import {
  MEMBERSHIP_SECTIONS,
  MembershipForm,
  type MembershipFormInitial,
  type MembershipSectionId,
} from "@/components/blocks/membership-form"
import { MOCK_MEMBERSHIPS } from "@/components/blocks/memberships-table"
import { SectionNav } from "@/components/blocks/section-nav"
import { MOCK_SERVICES } from "@/components/blocks/select-services-dialog"

export default function EditMembershipPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [section, setSection] = useState<MembershipSectionId>("basics")

  const membership = MOCK_MEMBERSHIPS.find((m) => m.id === params.id)

  function close() {
    router.push("/catalogs/memberships")
  }

  if (!membership) {
    return (
      <FullScreenEditDialog
        open
        onOpenChange={(o) => {
          if (!o) close()
        }}
        title="Membership not found"
      >
        <EmptyState
          icon={CalendarClockIcon}
          title="Membership not found"
          description="This membership may have been deleted."
          className="py-24"
        />
      </FullScreenEditDialog>
    )
  }

  // Pre-fill from the mock row. Services aren't stored on the row, so seed the
  // first N services from the shared catalog to match the row's service count.
  const initial: MembershipFormInitial = {
    name: membership.name,
    services: MOCK_SERVICES.slice(0, membership.serviceCount),
    sessionType: membership.sessions === "unlimited" ? "unlimited" : "limited",
    sessionCount: membership.sessions === "unlimited" ? "5" : String(membership.sessions),
    validFor: membership.validFor,
    price: String(membership.price),
    color: membership.color,
    onlineRedemption: true,
  }

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) close()
      }}
      title="Edit membership"
      subtitle={membership.name}
      saveLabel="Save"
      onSave={close}
    >
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
        <SectionNav sections={MEMBERSHIP_SECTIONS} active={section} onChange={setSection} />

        <section className="flex min-w-0 flex-col gap-8 rounded-2xl border border-border/60 bg-background p-5">
          <MembershipForm key={membership.id} section={section} initial={initial} />
        </section>
      </div>
    </FullScreenEditDialog>
  )
}
