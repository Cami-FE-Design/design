"use client"

import { useState } from "react"
import { toast } from "sonner"

import { BoardingDetailSheet } from "@/components/blocks/boarding/booking-detail-sheet"
import { NewBoardingSheet } from "@/components/blocks/boarding/new-boarding-sheet"
import { ClientDetailDialog } from "@/components/blocks/clients/client-detail-dialog"
import { ClientEditSheet } from "@/components/blocks/clients/client-edit-sheet"
import { PetDetailDialog } from "@/components/blocks/clients/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/clients/pet-edit-sheet"
import { DaycareDetailSheet } from "@/components/blocks/daycare/booking-detail-sheet"
import { Lane, Row, Section } from "@/components/blocks/playground/kit"
import { MyProfilePanel } from "@/components/blocks/settings/my-profile-panel"
import { GlobalSearchDialog } from "@/components/blocks/shell/global-search-dialog"
import { AddTeamMemberDialog } from "@/components/blocks/team/add-team-member-dialog"
import {
  TeamMemberDetailDialog,
  type TeamMemberDetailMember,
} from "@/components/blocks/team/team-member-detail-dialog"
import { Button } from "@/components/ui/button"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { BOARDING_STAYS, TODAY_ISO as BOARDING_TODAY } from "@/lib/boarding-mock"
import { DAYCARE_SESSIONS } from "@/lib/daycare-mock"

const TEAM_DEMO_MEMBERS: Record<"active" | "pending", TeamMemberDetailMember> = {
  active: {
    id: "pg-tm-active",
    name: "Sara Park",
    title: "Groomer",
    email: "sara@getcami.io",
    phone: "+971 54 402 0718",
    roleId: "staff",
    status: "active",
  },
  pending: {
    id: "pg-tm-pending",
    name: null,
    email: "ahmed@getcami.io",
    roleId: "receptionist",
    status: "pending",
  },
}

export function DetailViewsLane() {
  const [detailOpen, setDetailOpen] = useState(false)
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false)
  const [detailHasPets, setDetailHasPets] = useState(true)
  const [boardingDrawerOpen, setBoardingDrawerOpen] = useState(false)
  const [boardingCreateOpen, setBoardingCreateOpen] = useState(false)
  const [daycareDrawerOpen, setDaycareDrawerOpen] = useState(false)
  const [petDetailOpen, setPetDetailOpen] = useState(false)
  const [clientEditOpen, setClientEditOpen] = useState(false)
  const [petEditOpen, setPetEditOpen] = useState(false)
  const [teamDetailOpen, setTeamDetailOpen] = useState(false)
  const [teamAddOpen, setTeamAddOpen] = useState(false)
  const [teamDetailStatus, setTeamDetailStatus] = useState<"active" | "pending">("active")

  // A demo consent PDF built client-side for the <PdfViewer> showcase.

  return (
    <Lane
      id="detail-views"
      label="Detail views & takeovers"
      blurb="The drawers, dialogs and full-screen takeovers a row opens into."
    >
      <Section
        title="Client detail dialog"
        description="Centered Dialog modelled on <BusinessDetailDialog>, ~630px, sticky header with Book now + Actions, underline tabs with a 'More' overflow for Documents and Settings. Overview leads with identity chips over a lifetime strip, then Visits (Next above Last, one-tap Rebook), Wallet, Preferences, Pets, Notes. Every field is the client's own, so open several from /clients rather than judging it on one."
      >
        <Row label="Pets">
          <SegmentedToggle
            value={detailHasPets ? "yes" : "no"}
            onValueChange={(v) => setDetailHasPets(v === "yes")}
            options={[
              { value: "yes", label: "With pets" },
              { value: "no", label: "Without pets" },
            ]}
            ariaLabel="Whether the partner manages pets"
          />
        </Row>
        <Row label="Open">
          <Button onClick={() => setDetailOpen(true)}>Open client detail</Button>
        </Row>
        <ClientDetailDialog
          open={detailOpen}
          onOpenChange={setDetailOpen}
          client={{
            id: "millie-cassidy",
            name: "Millie Cassidy",
            phone: "+971 58 509 9313",
            recencyLabel: "First visit",
          }}
          hasPets={detailHasPets}
          isOwner
          onBookNow={() => toast("Book (stubbed)")}
          onMerge={() => toast("Merge profiles (stubbed)")}
          onDelete={() => toast.error("Delete client (stubbed)")}
        />
      </Section>
      <Section
        title="Pet detail dialog"
        description="Same shell as Client detail. Stacks over the client dialog when opened from inside it. Tabs: Overview · Family · Visit history · Pet details · Documents. Multi-owner aware — chip row in the header. Actions menu has Edit pet details + Delete pet."
      >
        <Row label="Open">
          <Button onClick={() => setPetDetailOpen(true)}>Open pet detail</Button>
        </Row>
        <PetDetailDialog
          open={petDetailOpen}
          onOpenChange={setPetDetailOpen}
          pet={{ id: "bobo", name: "Bobo", species: "dog", breed: "French Bulldog" }}
          owners={[
            { id: "millie-cassidy", name: "Millie Cassidy", phone: "+971 58 509 9313" },
            { id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" },
          ]}
          isOwner
        />
      </Section>
      <Section
        title="Team member detail dialog"
        description="The Client / Pet detail shell for a team member. Sticky header (avatar, permission access, email, phone, Edit, Actions) over two tabs: Overview (KPIs, Works at, Services, Notes) and Details (profile, role, addresses, emergency contacts). Owner rows lock profile and role edits; a pending invite shows an empty Overview. Add uses the full-screen takeover instead."
      >
        <Row label="Status">
          <SegmentedToggle
            value={teamDetailStatus}
            onValueChange={(v) => setTeamDetailStatus(v as "active" | "pending")}
            options={[
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending invite" },
            ]}
            ariaLabel="Team member status"
          />
        </Row>
        <Row label="Detail">
          <Button onClick={() => setTeamDetailOpen(true)}>Open team member detail</Button>
        </Row>
        <Row label="Add takeover">
          <Button variant="outline" radius="full" onClick={() => setTeamAddOpen(true)}>
            Open Add team member
          </Button>
        </Row>
        <TeamMemberDetailDialog
          open={teamDetailOpen}
          onOpenChange={setTeamDetailOpen}
          member={TEAM_DEMO_MEMBERS[teamDetailStatus]}
          onEditProfile={() => toast("Edit profile (stubbed)")}
          onEditRoles={() => toast("Edit roles & permissions (stubbed)")}
          onEditServices={() => toast("Edit services (stubbed)")}
          onEditSchedule={() => toast("Edit schedule (stubbed)")}
          onResendInvitation={() => toast("Resend invitation (stubbed)")}
          onRemove={() => toast.error("Remove from business (stubbed)")}
        />
        <AddTeamMemberDialog
          open={teamAddOpen}
          onOpenChange={setTeamAddOpen}
          onAdd={() => toast.success("Team member added (stubbed)")}
          businessName="Shampooch"
        />
      </Section>
      <Section
        lazy
        title="Boarding & daycare booking drawers"
        description="Right-side Sheet drawers on the <AppointmentDetailSheet> model. Boarding is night-based (rate/night, check-in/out, Subtotal by nights); daycare is duration-based ('Full Day · Up to 8 hours', Subtotal by minutes). Both share the collapsible customer card, pet card, editable status pill, add-on chips + Add menu, late-checkout toggle, notes and a sticky Check Out."
      >
        <Row label="Boarding">
          <div className="flex gap-2">
            <Button onClick={() => setBoardingDrawerOpen(true)}>Open booking detail</Button>
            <Button variant="outline" radius="full" onClick={() => setBoardingCreateOpen(true)}>
              New boarding stay
            </Button>
          </div>
        </Row>
        <Row label="Daycare">
          <Button onClick={() => setDaycareDrawerOpen(true)}>Open booking detail</Button>
        </Row>
        <BoardingDetailSheet
          open={boardingDrawerOpen}
          onOpenChange={setBoardingDrawerOpen}
          stay={BOARDING_STAYS[0]}
        />
        <NewBoardingSheet
          open={boardingCreateOpen}
          onOpenChange={setBoardingCreateOpen}
          date={BOARDING_TODAY}
        />
        <DaycareDetailSheet
          open={daycareDrawerOpen}
          onOpenChange={setDaycareDrawerOpen}
          session={DAYCARE_SESSIONS[3]}
        />
      </Section>
      <Section
        title="My profile (settings panel)"
        description="Personal info for the signed-in user, scoped to DSG-63's 'view and edit contact details': one Contact card with legal name and masked mobile/email behind a single Edit takeover. A new mobile goes through a 6-digit OTP, a new email through a 'Check your inbox' dialog with a 30s resend — the link click itself is the faint demo control bottom-right. Pending changes show as a badge on the affected row."
      >
        <div className="max-w-2xl rounded-2xl border border-border/60 bg-muted/20 p-6">
          <MyProfilePanel />
        </div>
      </Section>
      <Section
        title="Add / Edit takeovers"
        description="<FullScreenEditDialog> + sectioned sidenav. Quick-create rule: only the first name (client) or name + species (pet) are required. Edit mode pre-populates fields and deep-links to the relevant section."
      >
        <Row label="Add client">
          <Button onClick={() => setClientEditOpen(true)}>Open Add client</Button>
        </Row>
        <Row label="Add pet">
          <Button onClick={() => setPetEditOpen(true)}>Open Add pet</Button>
        </Row>
        <ClientEditSheet open={clientEditOpen} onOpenChange={setClientEditOpen} mode="add" />
        <PetEditSheet open={petEditOpen} onOpenChange={setPetEditOpen} mode="add" />
      </Section>
      <Section
        lazy
        title="Global search takeover"
        description="Full-screen search from the topbar magnifier or Cmd/Ctrl+K, reusing <FullScreenEditDialog>. Searches clients by name, mobile, email or pet, and bookings by client name or reference (try 'B-77342'). An empty query shows upcoming appointments and recently added clients. A result opens its detail dialog or sheet, stacked over the takeover."
      >
        <Row label="Open">
          <Button onClick={() => setGlobalSearchOpen(true)}>Open global search</Button>
        </Row>
        <GlobalSearchDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
      </Section>
    </Lane>
  )
}
