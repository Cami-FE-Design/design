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
import {
  formatNoteMeta,
  type NoteRequestMode,
  ProfileNoteBody,
  simulateNoteRequest,
  useProfileNoteEditor,
} from "@/components/blocks/shared/profile-note"
import { SectionCard } from "@/components/blocks/shared/section-card"
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

const DEMO_PROFILE_NOTES = [
  {
    id: "pg-note-1",
    content: "Always asks for Aya. Do not rebook with anyone else without calling her first.",
    authorName: "Maz Khan",
    createdAt: "2026-09-07T17:49:00+04:00",
  },
  {
    id: "pg-note-2",
    content:
      "History from the old system:\n2 unused vouchers, expiring 31 Dec 2026.\nPrefers WhatsApp.",
    authorName: "Aya Hassan",
    createdAt: "2026-10-13T10:15:00+04:00",
  },
  {
    id: "pg-note-3",
    content: "Parks in the loading bay — takes the side entrance, buzz her in.",
    createdAt: "2026-09-07T18:20:00+04:00",
  },
]

/**
 * The note list the client and pet profiles share, on its own, with the
 * request outcome switchable so the saving and failure states can be reached.
 */
function ProfileNotesDemo() {
  const [mode, setMode] = useState<NoteRequestMode>("succeed")
  const [notes, setNotes] = useState(DEMO_PROFILE_NOTES)
  const editor = useProfileNoteEditor({
    onUpdate: async (id, content) => {
      await simulateNoteRequest(mode)
      setNotes((current) => current.map((n) => (n.id === id ? { ...n, content } : n)))
    },
    onDelete: async (id) => {
      await simulateNoteRequest(mode)
      setNotes((current) => current.filter((n) => n.id !== id))
    },
  })
  return (
    <>
      <Row label="Requests">
        <SegmentedToggle
          value={mode}
          onValueChange={(v) => setMode(v as NoteRequestMode)}
          options={[
            { value: "succeed", label: "Succeed" },
            { value: "slow", label: "Slow" },
            { value: "fail", label: "Fail" },
          ]}
          ariaLabel="How note requests behave"
        />
      </Row>
      <Row label="Notes" align="start">
        <div className="flex max-w-xl flex-col gap-2">
          <SectionCard title="Client notes">
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="divide-y divide-border/60">
                {notes.map((note) => (
                  <li key={note.id} className="py-1.5 first:pt-0 last:pb-0">
                    <ProfileNoteBody
                      content={note.content}
                      meta={formatNoteMeta(note.createdAt, note.authorName)}
                      onEdit={() => editor.edit(note)}
                      onDelete={() => editor.remove(note.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
          <Button
            variant="outline"
            radius="full"
            size="sm"
            className="self-start"
            onClick={() => setNotes(DEMO_PROFILE_NOTES)}
          >
            Reset notes
          </Button>
        </div>
      </Row>
      {editor.dialogs}
    </>
  )
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
        description="Centered client dialog with Book now, Actions and tabs. Overview leads with identity chips over a lifetime strip."
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
        description="Pet detail dialog on the Client detail shell, with five tabs, owner chips and Edit/Delete actions."
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
        title="Profile note edit and delete"
        description="Edit and Delete on each client and pet profile note, with a confirmation before delete and the saving and failure states (PRD-196)."
      >
        <ProfileNotesDemo />
      </Section>
      <Section
        title="Team member detail dialog"
        description="Team member dialog with sticky header and Overview and Details tabs, including locked owner rows and a pending invite."
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
        description="Boarding (night-based) and daycare (duration-based) booking drawers sharing customer, pet, status, add-ons and Check Out."
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
        description="Contact card with masked mobile and email behind one Edit, OTP for a new mobile, inbox check for email, pending badges."
      >
        <div className="max-w-2xl rounded-2xl border border-border/60 bg-muted/20 p-6">
          <MyProfilePanel />
        </div>
      </Section>
      <Section
        title="Add / Edit takeovers"
        description="Full-screen add and edit with a sectioned sidenav. Only first name, or name and species for a pet, is required."
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
        description="Full-screen search over clients and bookings (try 'B-77342'), with upcoming and recent items when empty."
      >
        <Row label="Open">
          <Button onClick={() => setGlobalSearchOpen(true)}>Open global search</Button>
        </Row>
        <GlobalSearchDialog open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
      </Section>
    </Lane>
  )
}
