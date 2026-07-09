"use client"

import {
  ChevronDownIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  MoreHorizontalIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import { AddVaccineDialog } from "@/components/blocks/add-vaccine-dialog"
import { AvatarStack } from "@/components/blocks/avatar-stack"
import { DocumentsFormsAndFiles } from "@/components/blocks/documents-files-card"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { LinkedEntityChip } from "@/components/blocks/linked-entity-chip"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { SectionCard } from "@/components/blocks/section-card"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoBusiness } from "@/lib/demo-business"
import { cn } from "@/lib/utils"

export type PetDetailPet = {
  id: string
  name: string
  species: AvatarSpecies
  breed: string
  meta?: string
}

export type PetDetailOwner = {
  id: string
  name: string
  /** Optional phone shown on the family member row inside the Family tab. */
  phone?: string
}

type PetDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet: PetDetailPet
  /** All clients who own this pet (multi-owner model). */
  owners: PetDetailOwner[]
  /** Owner-gated actions appear when true. */
  isOwner?: boolean
  onBookAppointment?: () => void
  onSelectOwner?: (ownerId: string) => void
  onDelete?: () => void
}

type PetTabId = "overview" | "family" | "visits" | "details" | "documents"

const PET_TABS: Array<{
  id: PetTabId
  label: string
  /** When true, the tab stays in the strip on mobile. Others move to a More dropdown. */
  mobileVisible?: boolean
}> = [
  { id: "overview", label: "Overview", mobileVisible: true },
  { id: "family", label: "Family", mobileVisible: true },
  { id: "visits", label: "Visit history" },
  { id: "details", label: "Pet details" },
  { id: "documents", label: "Documents" },
]

type PetVisitStatus =
  | "all"
  | "booked"
  | "confirmed"
  | "arrived"
  | "started"
  | "completed"
  | "canceled"
  | "no-show"

const VISIT_STATUS_PRIMARY: Array<{ value: PetVisitStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
]

const VISIT_STATUS_MORE: Array<{ value: PetVisitStatus; label: string }> = [
  { value: "arrived", label: "Arrived" },
  { value: "started", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "no-show", label: "No-show" },
]

// Literal match for the NewAppointmentSheet / AppointmentDetailSheet hero-band
// palette (pale step-5/6 fills with dark text) so a visit reads identically in
// this badge and in the open edit/detail sheet's hero band.
const VISIT_STATUS_BADGE_CLASS: Record<Exclude<PetVisitStatus, "all">, string> = {
  booked: "bg-blue-5 text-blue-12",
  confirmed: "bg-lime-5 text-lime-12",
  arrived: "bg-lime-3 text-lime-12",
  started: "bg-lime-9 text-lime-12",
  completed: "bg-cami-gray-6 text-cami-gray-12",
  canceled: "bg-olive-5 text-olive-12",
  "no-show": "bg-tomato-8 text-tomato-12",
}

type MockPetVisit = {
  id: string
  status: Exclude<PetVisitStatus, "all">
  statusLabel: string
  dayMonth: string
  weekday: string
  time: string
  location: string
  services: Array<{ name: string; staff: string; duration: string; price: string }>
}

const MOCK_PET_VISITS: MockPetVisit[] = [
  {
    id: "v1",
    status: "completed",
    statusLabel: "Completed",
    dayMonth: "Apr 8",
    weekday: "Wednesday",
    time: "2:30pm",
    location: "Shampooch JVC",
    services: [{ name: "Bath & tidy", staff: "Aisha", duration: "45min", price: "AED 130" }],
  },
  {
    id: "v2",
    status: "completed",
    statusLabel: "Completed",
    dayMonth: "Mar 4",
    weekday: "Monday",
    time: "11:00am",
    location: "Shampooch JVC",
    services: [{ name: "Full groom", staff: "Sophie", duration: "1h 30min", price: "AED 220" }],
  },
  {
    id: "v3",
    status: "no-show",
    statusLabel: "No-show",
    dayMonth: "Feb 12",
    weekday: "Wednesday",
    time: "3:00pm",
    location: "Shampooch JVC",
    services: [{ name: "Nail trim", staff: "Sophie", duration: "15min", price: "AED 40" }],
  },
]

type MockPetNote = {
  id: string
  text: string
  createdAt: string
  author: string
}

type MockVaccine = {
  id: string
  name: string
  expirationDate: string
  hasDocument: boolean
}

const MOCK_VACCINES: MockVaccine[] = [
  { id: "v-rabies", name: "Rabies", expirationDate: "2027-03-15", hasDocument: true },
  { id: "v-dhpp", name: "DHPP", expirationDate: "2026-06-22", hasDocument: true },
  { id: "v-bordetella", name: "Bordetella", expirationDate: "2026-05-04", hasDocument: false },
]

const MOCK_PET_NOTES: MockPetNote[] = [
  {
    id: "n1",
    text: "Anxious during baths — use a gentle voice and the lavender shampoo.",
    createdAt: "04/09/2026 11:51 am",
    author: "Michelle You",
  },
]

/**
 * Pet detail dialog — stacks over `<ClientDetailDialog>` (Dialog-on-Dialog).
 * Same shell shape as the client detail (centered ~630px, sticky header,
 * horizontal underline tabs, scrollable section content). Pet-specific
 * tabs and an Owners chip row in the header (multi-owner model).
 *
 * Skeleton: each tab renders a placeholder. Real content arrives per tab.
 */
export function PetDetailDialog({
  open,
  onOpenChange,
  pet,
  owners,
  isOwner = false,
  onBookAppointment,
  onSelectOwner,
  onDelete,
}: PetDetailDialogProps) {
  const [tab, setTab] = useState<PetTabId>("overview")
  const [visitStatus, setVisitStatus] = useState<PetVisitStatus>("all")
  const [editOpen, setEditOpen] = useState(false)
  const [editSection, setEditSection] = useState<"profile" | "health" | "family">("profile")
  function openEditAt(section: "profile" | "health" | "family") {
    setEditSection(section)
    setEditOpen(true)
  }
  const [addVaccineOpen, setAddVaccineOpen] = useState(false)
  const mobileMoreTabs = PET_TABS.filter((t) => !t.mobileVisible)
  const activeMobileMoreTab = mobileMoreTabs.find((t) => t.id === tab)
  const isVisitStatusInMore = VISIT_STATUS_MORE.some((s) => s.value === visitStatus)
  const filteredVisits =
    visitStatus === "all"
      ? MOCK_PET_VISITS
      : MOCK_PET_VISITS.filter((v) => v.status === visitStatus)
  const visitCounts = {
    all: MOCK_PET_VISITS.length,
    booked: MOCK_PET_VISITS.filter((v) => v.status === "booked").length,
    confirmed: MOCK_PET_VISITS.filter((v) => v.status === "confirmed").length,
    arrived: MOCK_PET_VISITS.filter((v) => v.status === "arrived").length,
    started: MOCK_PET_VISITS.filter((v) => v.status === "started").length,
    completed: MOCK_PET_VISITS.filter((v) => v.status === "completed").length,
    canceled: MOCK_PET_VISITS.filter((v) => v.status === "canceled").length,
    "no-show": MOCK_PET_VISITS.filter((v) => v.status === "no-show").length,
  } satisfies Record<PetVisitStatus, number>

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as PetTabId)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-[34px] pb-5">
                <Avatar size="lg" fallback="species" species={pet.species} hashSeed={pet.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <DialogTitle className="truncate text-[22px] leading-7 font-semibold">
                    {pet.name}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="flex min-w-0 items-center gap-1.5 text-sm">
                      {owners.length <= 2 ? (
                        owners.map((owner) => (
                          <LinkedEntityChip
                            key={owner.id}
                            name={owner.name}
                            avatar={{ fallback: "character", hashSeed: owner.id }}
                            onClick={() => onSelectOwner?.(owner.id)}
                          />
                        ))
                      ) : (
                        <AvatarStack
                          items={owners.map((owner) => ({
                            id: owner.id,
                            name: owner.name,
                            fallback: "character",
                            hashSeed: owner.id,
                          }))}
                          size="xs"
                          onSelect={onSelectOwner}
                        />
                      )}
                    </div>
                  </DialogDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    radius="full"
                    onClick={onBookAppointment}
                    className="hidden sm:inline-flex"
                  >
                    Book
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        radius="full"
                        aria-label="Actions"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEditAt("profile")}>
                        Edit pet details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!isOwner}
                        onSelect={onDelete}
                        variant="destructive"
                      >
                        Delete pet
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      radius="full"
                      aria-label="Close"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              <div className="flex items-center gap-6 px-9">
                <TabsList variant="underline">
                  {PET_TABS.map((t) => (
                    <TabsTrigger
                      key={t.id}
                      value={t.id}
                      className={cn(!t.mobileVisible && "hidden md:inline-flex")}
                    >
                      {t.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {mobileMoreTabs.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-active={activeMobileMoreTab ? "true" : undefined}
                        className={cn(
                          "relative inline-flex h-10 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:hidden",
                          "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:after:opacity-100",
                          activeMobileMoreTab && "text-foreground",
                        )}
                      >
                        {activeMobileMoreTab?.label ?? "More"}
                        <ChevronDownIcon className="size-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {mobileMoreTabs.map((t) => (
                        <DropdownMenuItem key={t.id} onSelect={() => setTab(t.id)}>
                          {t.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-5">
              <TabsContent value="overview" className="flex flex-col gap-3">
                <KpiGrid>
                  <KpiCard
                    label="Last visit"
                    value="Apr 8"
                    info="Date of this pet's most recent appointment."
                  />
                  <KpiCard
                    label="Total visits"
                    value="3"
                    info="Lifetime appointment count for this pet."
                  />
                  <KpiCard label="Upcoming" value="0" info="Bookings in the future for this pet." />
                </KpiGrid>
                <SectionCard title="Upcoming appointment">
                  <p className="text-sm text-muted-foreground">No upcoming appointment yet.</p>
                </SectionCard>
                <SectionCard
                  title="Pet notes"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <CirclePlusIcon />
                      Add note
                    </Button>
                  }
                >
                  {MOCK_PET_NOTES.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pet notes yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {MOCK_PET_NOTES.map((note) => (
                        <li key={note.id} className="flex flex-col gap-0.5">
                          <p className="text-sm">{note.text}</p>
                          <span className="text-xs text-muted-foreground">
                            Created: {note.createdAt} by {note.author}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              </TabsContent>
              <TabsContent value="family" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {owners.length} {owners.length === 1 ? "family member" : "family members"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    radius="full"
                    onClick={() => openEditAt("family")}
                  >
                    <CirclePlusIcon />
                    Add family
                  </Button>
                </div>
                <ul className="flex flex-col gap-2">
                  {owners.map((owner) => (
                    <li key={owner.id}>
                      <FamilyMemberCard owner={owner} onClick={() => onSelectOwner?.(owner.id)} />
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="visits" className="flex flex-col gap-4">
                <Tabs
                  value={visitStatus}
                  onValueChange={(v) => setVisitStatus(v as PetVisitStatus)}
                  className="w-full"
                >
                  <div className="flex items-center gap-1">
                    <TabsList variant="ghost">
                      {VISIT_STATUS_PRIMARY.map((opt) => (
                        <TabsTrigger key={opt.value} value={opt.value}>
                          {opt.label}
                          <span
                            className={cn(
                              "text-sm font-normal text-muted-foreground",
                              visitStatus === opt.value && "text-foreground/70",
                            )}
                          >
                            {visitCounts[opt.value]}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-active={isVisitStatusInMore ? "true" : undefined}
                        className={cn(
                          "inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground",
                          "data-active:bg-muted data-active:text-foreground",
                        )}
                      >
                        {isVisitStatusInMore ? (
                          <>
                            {VISIT_STATUS_MORE.find((s) => s.value === visitStatus)?.label}
                            <span className="text-sm font-normal text-foreground/70">
                              {visitCounts[visitStatus]}
                            </span>
                          </>
                        ) : (
                          "More"
                        )}
                        <ChevronDownIcon className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {VISIT_STATUS_MORE.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onSelect={() => setVisitStatus(opt.value)}
                          >
                            {opt.label}
                            <span className="ml-auto text-muted-foreground">
                              {visitCounts[opt.value]}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Tabs>
                {filteredVisits.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    No visits match this filter.
                  </p>
                ) : (
                  <ul className="flex flex-col">
                    {filteredVisits.map((visit, i) => (
                      <TimelineRow
                        key={visit.id}
                        isLast={i === filteredVisits.length - 1}
                        leading={<TimelineDate dayMonth={visit.dayMonth} weekday={visit.weekday} />}
                      >
                        <VisitCard visit={visit} />
                      </TimelineRow>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="details">
                <div className="rounded-2xl border border-border/60 bg-card">
                  <div className="flex justify-end px-4 pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      radius="full"
                      onClick={() => openEditAt("profile")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-col divide-y divide-border/60 px-4 pb-4">
                    <Subsection title="Profile">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailField label="Species" value="Dog" />
                        <DetailField label="Breed" value={pet.breed} />
                        <DetailField label="Sex" value="Male" />
                        <DetailField label="Birthday" value="Mar 12, 2022" />
                        <DetailField label="Weight" value="10 lbs" />
                        <DetailField label="Coat" value="Short" />
                        <DetailField label="Desexed status" value="Neutered" />
                        <DetailField label="Behavior" value="Friendly" />
                      </div>
                    </Subsection>

                    <Subsection title="Medical info">
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <DetailField label="Vet name" value="Dr. Lina Khoury" />
                          <DetailField label="Vet phone" value="+971 4 555 1234" />
                        </div>
                        <DetailField
                          label="Medical notes"
                          value="Mild allergy to chicken-based treats. No other known issues."
                        />
                      </div>
                    </Subsection>

                    <Subsection title="Preferences">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailField label="Preferred staff" value="Sophie" />
                      </div>
                    </Subsection>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="documents" className="flex flex-col gap-3">
                <SectionCard
                  title="Pet notes"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <CirclePlusIcon />
                      Add note
                    </Button>
                  }
                >
                  {MOCK_PET_NOTES.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pet notes yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-3">
                      {MOCK_PET_NOTES.map((note) => (
                        <li key={note.id} className="flex flex-col gap-0.5">
                          <p className="text-sm">{note.text}</p>
                          <span className="text-xs text-muted-foreground">
                            Created: {note.createdAt} by {note.author}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>

                <SectionCard
                  title="Vaccinations"
                  action={
                    <Button
                      variant="secondary"
                      size="sm"
                      radius="full"
                      onClick={() => setAddVaccineOpen(true)}
                    >
                      <CirclePlusIcon />
                      Add vaccine
                    </Button>
                  }
                >
                  {MOCK_VACCINES.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No vaccinations on file.</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-border/60">
                      {MOCK_VACCINES.map((v) => (
                        <VaccineRow key={v.id} vaccine={v} />
                      ))}
                    </ul>
                  )}
                </SectionCard>

                <DocumentsFormsAndFiles
                  formsTitle="Consent forms"
                  recipientName={owners[0]?.name}
                  recipientPhone={owners[0]?.phone}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <PetEditSheet
        open={editOpen}
        onOpenChange={setEditOpen}
        mode="edit"
        initialSection={editSection}
        initial={{
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          owners: owners.map((o) => ({ id: o.id, name: o.name, phone: o.phone })),
        }}
      />

      <AddVaccineDialog open={addVaccineOpen} onOpenChange={setAddVaccineOpen} />
    </>
  )
}

function Subsection({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  )
}

function DetailField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm">{value || "—"}</span>
    </div>
  )
}

function VaccineRow({ vaccine }: { vaccine: MockVaccine }) {
  const expDate = new Date(vaccine.expirationDate)
  const today = new Date("2026-05-11")
  const daysUntil = Math.floor((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  let status: { label: string; className: string }
  if (daysUntil < 0) {
    status = { label: "Expired", className: "text-tomato-11" }
  } else if (daysUntil <= 30) {
    status = { label: `Expires in ${daysUntil}d`, className: "text-yellow-11" }
  } else {
    status = { label: "Valid", className: "text-cami-green-11" }
  }
  const expDisplay = expDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">{vaccine.name}</span>
        <span className="truncate text-xs text-muted-foreground">Expires {expDisplay}</span>
      </div>
      <span className={cn("shrink-0 text-xs font-medium", status.className)}>{status.label}</span>
      {vaccine.hasDocument ? (
        <Button type="button" variant="ghost" size="sm" radius="full" className="shrink-0">
          View
        </Button>
      ) : null}
    </li>
  )
}

function VisitCard({ visit }: { visit: MockPetVisit }) {
  const { name: businessName } = useDemoBusiness()
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
          <span className="font-semibold text-foreground">{visit.time}</span>
          <span className="truncate text-muted-foreground">· {businessName}</span>
        </div>
        <Badge className={cn("border-transparent", VISIT_STATUS_BADGE_CLASS[visit.status])}>
          {visit.statusLabel}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2">
        {visit.services.map((svc) => (
          <li
            key={`${visit.id}-${svc.name}`}
            className="flex items-baseline justify-between gap-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate">
              {svc.name}
              <span className="text-muted-foreground">
                {" "}
                · {svc.staff} · {svc.duration}
              </span>
            </span>
            <span className="font-medium">{svc.price}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FamilyMemberCard({ owner, onClick }: { owner: PetDetailOwner; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
    >
      <Avatar size="md" fallback="character" name={owner.name} hashSeed={owner.id} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-semibold">{owner.name}</span>
        {owner.phone ? (
          <span className="truncate text-sm text-muted-foreground">{owner.phone}</span>
        ) : null}
      </div>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
    </button>
  )
}

function _SectionPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card p-6">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
