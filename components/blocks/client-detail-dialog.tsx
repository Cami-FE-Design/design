"use client"

import {
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
  PawPrintIcon,
  PlusIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { EmptyState } from "@/components/blocks/empty-state"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { SectionCard } from "@/components/blocks/section-card"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
import { Avatar } from "@/components/ui/avatar"
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
import { RecencyBadge } from "@/components/ui/recency-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type ClientDetailClient = {
  name: string
  phone?: string
  /** Optional recency label rendered inline with the meta line, e.g. "First visit" or "4 weeks". */
  recencyLabel?: string
  /** Stable identifier used as the avatar hash seed. Falls back to name. */
  id?: string
}

type ClientDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: ClientDetailClient
  /**
   * True for partners that manage pets (vet, groomer, pet store). False for
   * partners that don't (salon, fitness, spa). When true, the Pets tab and
   * the Pets card on Overview render.
   */
  hasPets?: boolean
  /** Owner-gated actions appear when true. */
  isOwner?: boolean
  onBookNow?: () => void
  onMerge?: () => void
  onDelete?: () => void
  /** Fired when an owner chip is clicked inside the stacked Pet detail. */
  onSelectOwner?: (ownerId: string) => void
}

type TabId = "overview" | "appointments" | "sales" | "details" | "pets" | "documents"

const PRIMARY_TABS: Array<{
  id: TabId
  label: string
  petOnly?: boolean
  /** When true, the tab stays in the strip on mobile. Others move to a More dropdown. */
  mobileVisible?: boolean
}> = [
  { id: "overview", label: "Overview", mobileVisible: true },
  { id: "appointments", label: "Appointments", mobileVisible: true },
  { id: "sales", label: "Sales" },
  { id: "details", label: "Details" },
  { id: "pets", label: "Pets", petOnly: true, mobileVisible: true },
  { id: "documents", label: "Documents" },
]

type ApptStatus =
  | "all"
  | "booked"
  | "confirmed"
  | "arrived"
  | "started"
  | "completed"
  | "canceled"
  | "no-show"

const APPT_STATUS_PRIMARY: Array<{ value: ApptStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "booked", label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
]

const APPT_STATUS_MORE: Array<{ value: ApptStatus; label: string }> = [
  { value: "arrived", label: "Arrived" },
  { value: "started", label: "Started" },
  { value: "completed", label: "Completed" },
  { value: "canceled", label: "Canceled" },
  { value: "no-show", label: "No-show" },
]

type MockAppointment = {
  id: string
  status: Exclude<ApptStatus, "all">
  statusLabel: string
  dayMonth: string
  weekday: string
  time: string
  location: string
  /** Optional pet info shown in the card header. Pet mode only. */
  pet?: {
    id: string
    name: string
    breed: string
    species: "dog" | "cat" | "bird" | "rabbit" | "other"
  }
  services: Array<{ name: string; staff: string; duration: string; price: string }>
}

type MockPet = {
  id: string
  name: string
  species: "dog" | "cat" | "bird" | "rabbit" | "other"
  breed: string
  weight?: string
  coat?: string
  /** Reproductive status — "Spayed" (female), "Neutered" (male), or "Intact". */
  desexedStatus?: "Spayed" | "Neutered" | "Intact"
  /** Compact service-tier codes shown next to the pet name. */
  serviceCodes?: string[]
}

const MOCK_PETS: MockPet[] = [
  {
    id: "bobo",
    name: "Bobo",
    species: "dog",
    breed: "French Bulldog",
    weight: "10 lbs",
    coat: "Short coat",
    desexedStatus: "Neutered",
    serviceCodes: ["5f", "4f"],
  },
  {
    id: "mochi",
    name: "Mochi",
    species: "cat",
    breed: "Domestic Shorthair",
    weight: "8 lbs",
    coat: "Short coat",
    desexedStatus: "Spayed",
    serviceCodes: ["3f"],
  },
  {
    id: "kiwi",
    name: "Kiwi",
    species: "bird",
    breed: "Cockatiel",
    weight: "85 g",
    desexedStatus: "Intact",
  },
]

const MOCK_APPOINTMENTS: MockAppointment[] = [
  {
    id: "1",
    status: "booked",
    statusLabel: "Booked",
    pet: { id: "bobo", name: "Bobo", breed: "French Bulldog · 10 lbs", species: "dog" },
    dayMonth: "May 22",
    weekday: "Friday",
    time: "10:00am",
    location: "Shampooch JVC",
    services: [
      { name: "Full groom", staff: "Sophie", duration: "1h 30min", price: "AED 220" },
      { name: "Nail trim", staff: "Sophie", duration: "15min", price: "AED 40" },
    ],
  },
  {
    id: "2",
    status: "completed",
    statusLabel: "Completed",
    pet: { id: "mochi", name: "Mochi", breed: "Domestic Shorthair · 8 lbs", species: "cat" },
    dayMonth: "Apr 8",
    weekday: "Wednesday",
    time: "2:30pm",
    location: "Shampooch JVC",
    services: [{ name: "Bath & tidy", staff: "Aisha", duration: "45min", price: "AED 130" }],
  },
]

/**
 * Centered detail dialog modeled on `<BusinessDetailDialog>`. ~630px wide.
 * Sticky header (avatar + name + meta + Book now + Actions + Close), horizontal
 * underline tabs with a "More" overflow dropdown for less-used sections.
 *
 * Skeleton: each tab renders a placeholder. Real content arrives per-section.
 */
export function ClientDetailDialog({
  open,
  onOpenChange,
  client,
  hasPets = true,
  isOwner = false,
  onBookNow,
  onMerge,
  onDelete,
  onSelectOwner,
}: ClientDetailDialogProps) {
  const [tab, setTab] = useState<TabId>("overview")
  const [apptStatus, setApptStatus] = useState<ApptStatus>("all")
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const selectedPet = MOCK_PETS.find((p) => p.id === selectedPetId) ?? null
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [editClientOpen, setEditClientOpen] = useState(false)
  const [editClientSection, setEditClientSection] = useState<
    "profile" | "additional" | "addresses" | "contacts" | "pets" | "settings"
  >("profile")
  function openEditClientAt(section: typeof editClientSection) {
    setEditClientSection(section)
    setEditClientOpen(true)
  }
  const visiblePrimaryTabs = PRIMARY_TABS.filter((t) => !t.petOnly || hasPets)
  const mobileMoreTabs = visiblePrimaryTabs.filter((t) => !t.mobileVisible)
  const activeMobileMoreTab = mobileMoreTabs.find((t) => t.id === tab)
  const isApptStatusInMore = APPT_STATUS_MORE.some((s) => s.value === apptStatus)
  const filteredAppointments =
    apptStatus === "all"
      ? MOCK_APPOINTMENTS
      : MOCK_APPOINTMENTS.filter((appt) => appt.status === apptStatus)
  const apptCounts = {
    all: MOCK_APPOINTMENTS.length,
    booked: MOCK_APPOINTMENTS.filter((a) => a.status === "booked").length,
    confirmed: MOCK_APPOINTMENTS.filter((a) => a.status === "confirmed").length,
    arrived: MOCK_APPOINTMENTS.filter((a) => a.status === "arrived").length,
    started: MOCK_APPOINTMENTS.filter((a) => a.status === "started").length,
    completed: MOCK_APPOINTMENTS.filter((a) => a.status === "completed").length,
    canceled: MOCK_APPOINTMENTS.filter((a) => a.status === "canceled").length,
    "no-show": MOCK_APPOINTMENTS.filter((a) => a.status === "no-show").length,
  } satisfies Record<ApptStatus, number>

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabId)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-[34px] pb-5">
                <Avatar size="lg" fallback="character" name={client.name} hashSeed={client.id} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <DialogTitle className="truncate text-[22px] leading-7 font-semibold">
                    {client.name}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                      {client.phone ? <span className="truncate">{client.phone}</span> : null}
                      {client.recencyLabel ? (
                        <RecencyBadge>{client.recencyLabel}</RecencyBadge>
                      ) : null}
                      {!client.phone && !client.recencyLabel ? <span>—</span> : null}
                    </div>
                  </DialogDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    radius="full"
                    onClick={onBookNow}
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
                      <DropdownMenuItem onSelect={() => openEditClientAt("profile")}>
                        Edit client details
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={!isOwner} onSelect={onMerge}>
                        Merge profiles
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!isOwner}
                        onSelect={onDelete}
                        variant="destructive"
                      >
                        Delete client
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
                  {visiblePrimaryTabs.map((t) => (
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
                    label="Upcoming"
                    value="0"
                    info="Count of bookings in the future for this client."
                  />
                  <KpiCard
                    label="Total appts"
                    value="4"
                    info="Lifetime appointment count, including no-shows and cancellations."
                  />
                  <KpiCard
                    label="Total sales"
                    value="AED 0"
                    info="Lifetime revenue from this client."
                  />
                  <KpiCard label="No-shows" value="0" info="Lifetime count of no-shows." />
                </KpiGrid>
                <SectionCard title="Upcoming appointment">
                  <p className="text-sm text-muted-foreground">No upcoming appointment yet.</p>
                </SectionCard>
                {hasPets ? <PetsOverviewCard onAddPet={() => setAddPetOpen(true)} /> : null}
                <SectionCard
                  title="Notes"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Add note
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                </SectionCard>
              </TabsContent>
              <TabsContent value="appointments" className="flex flex-col gap-4">
                <Tabs
                  value={apptStatus}
                  onValueChange={(v) => setApptStatus(v as ApptStatus)}
                  className="w-full"
                >
                  <div className="flex items-center gap-1">
                    <TabsList variant="ghost">
                      {APPT_STATUS_PRIMARY.map((opt) => (
                        <TabsTrigger key={opt.value} value={opt.value}>
                          {opt.label}
                          <span
                            className={cn(
                              "text-sm font-normal text-muted-foreground",
                              apptStatus === opt.value && "text-foreground/70",
                            )}
                          >
                            {apptCounts[opt.value]}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-active={isApptStatusInMore ? "true" : undefined}
                        className={cn(
                          "inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground",
                          "data-active:bg-muted data-active:text-foreground",
                        )}
                      >
                        {isApptStatusInMore ? (
                          <>
                            {APPT_STATUS_MORE.find((s) => s.value === apptStatus)?.label}
                            <span className="text-sm font-normal text-foreground/70">
                              {apptCounts[apptStatus]}
                            </span>
                          </>
                        ) : (
                          "More"
                        )}
                        <ChevronDownIcon className="size-3.5" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {APPT_STATUS_MORE.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onSelect={() => setApptStatus(opt.value)}
                          >
                            {opt.label}
                            <span className="ml-auto text-muted-foreground">
                              {apptCounts[opt.value]}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Tabs>
                {filteredAppointments.length === 0 ? (
                  <EmptyState
                    icon={CalendarIcon}
                    title={
                      apptStatus === "all"
                        ? "No appointments yet."
                        : "No appointments match this filter."
                    }
                  />
                ) : (
                  <ul className="flex flex-col">
                    {filteredAppointments.map((appt, i) => (
                      <TimelineRow
                        key={appt.id}
                        isLast={i === filteredAppointments.length - 1}
                        leading={<TimelineDate dayMonth={appt.dayMonth} weekday={appt.weekday} />}
                      >
                        <AppointmentCard appt={appt} hasPets={hasPets} />
                      </TimelineRow>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="sales">
                <SectionPlaceholder
                  title="Sales"
                  body="All / Paid / Drafts / Unpaid filter pills. Table layout. Sell CTA on header."
                />
              </TabsContent>
              <TabsContent value="details">
                <div className="rounded-2xl border border-border/60 bg-card">
                  <div className="flex justify-end px-4 pt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      radius="full"
                      onClick={() => openEditClientAt("profile")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="flex flex-col divide-y divide-border/60 px-4 pb-4">
                    <Subsection title="Profile">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailField label="Full name" value={client.name} />
                        <DetailField label="Phone" value={client.phone} />
                        <DetailField label="Email" value="millie@example.com" />
                        <DetailField label="Birthday" value="May 14" />
                        <DetailField label="Gender" value="Female" />
                      </div>
                    </Subsection>

                    <Subsection title="Additional info">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailField label="Source" value="Walk-in" />
                        <DetailField label="Country" value="United Arab Emirates" />
                        <div className="col-span-2 flex flex-col">
                          <span className="text-xs text-muted-foreground">Tags</span>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cami-violet-3 px-2.5 py-1 text-sm font-medium text-cami-violet-11">
                              <UserIcon className="size-3.5" strokeWidth={1.75} />
                              VIP
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-cami-violet-3 px-2.5 py-1 text-sm font-medium text-cami-violet-11">
                              <UserIcon className="size-3.5" strokeWidth={1.75} />
                              Loyal
                            </span>
                          </div>
                        </div>
                      </div>
                    </Subsection>

                    <Subsection title="Addresses">
                      <ul className="flex flex-col">
                        <AddressRow
                          label="Home"
                          line="10250 Santa Monica Blvd, Los Angeles, CA 90067, US"
                        />
                        <AddressRow label="Work" line="JVC Tower 4, Apt 1102, Dubai, AE" />
                      </ul>
                    </Subsection>

                    <Subsection title="Additional contacts">
                      <ul className="flex flex-col">
                        <ContactRow
                          relationship="Emergency"
                          name="Tom Cassidy"
                          phone="+971 50 222 1133"
                          email="tom@example.com"
                        />
                        <ContactRow
                          relationship="Pickup"
                          name="Sarah Johnson"
                          phone="+971 55 555 0001"
                        />
                      </ul>
                    </Subsection>

                    <Subsection title="Notifications">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <NotificationDisplay
                          label="Service-related"
                          channels={["WhatsApp", "Email"]}
                        />
                        <NotificationDisplay label="Marketing" channels={["Email"]} />
                      </div>
                    </Subsection>

                    <Subsection title="Payment policy">
                      <p className="text-sm">Card on file required at booking.</p>
                    </Subsection>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="pets" className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {MOCK_PETS.length} {MOCK_PETS.length === 1 ? "pet" : "pets"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    radius="full"
                    onClick={() => setAddPetOpen(true)}
                  >
                    <PlusIcon />
                    Add pet
                  </Button>
                </div>
                {MOCK_PETS.length === 0 ? (
                  <EmptyState
                    icon={PawPrintIcon}
                    title="No pets yet."
                    description="Add a pet to start booking grooming, vet visits, or boarding."
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {MOCK_PETS.map((pet) => (
                      <li key={pet.id}>
                        <PetCard pet={pet} onClick={() => setSelectedPetId(pet.id)} />
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="documents" className="flex flex-col gap-3">
                <SectionCard
                  title="Notes"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Add note
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                </SectionCard>
                <SectionCard
                  title="Allergies"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Add allergy
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">No allergies recorded yet.</p>
                </SectionCard>
                <SectionCard
                  title="Patch tests"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Add patch test
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">No patch tests yet.</p>
                </SectionCard>
                <SectionCard
                  title="Forms"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Add form
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">
                    Client intake, COVID screening, liability waiver, photo release, etc. — full
                    forms catalog comes in v1.
                  </p>
                </SectionCard>
                <SectionCard
                  title="Files"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <PlusIcon />
                      Upload file
                    </Button>
                  }
                >
                  <p className="text-sm text-muted-foreground">No files yet.</p>
                </SectionCard>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
      {selectedPet ? (
        <PetDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setSelectedPetId(null)
          }}
          pet={{
            id: selectedPet.id,
            name: selectedPet.name,
            species: selectedPet.species,
            breed: selectedPet.breed,
          }}
          owners={[
            {
              id: client.id ?? "current-client",
              name: client.name,
              phone: client.phone,
            },
            // Demo a co-owner on Bobo to show the multi-owner chip row
            ...(selectedPet.id === "bobo"
              ? [{ id: "tom-cassidy", name: "Tom Cassidy", phone: "+971 50 222 1133" }]
              : []),
          ]}
          isOwner={isOwner}
          onSelectOwner={(ownerId) => {
            setSelectedPetId(null)
            onSelectOwner?.(ownerId)
          }}
        />
      ) : null}

      <PetEditSheet
        open={addPetOpen}
        onOpenChange={setAddPetOpen}
        mode="add"
        initial={{
          owners: [
            {
              id: client.id ?? "current-client",
              name: client.name,
              phone: client.phone,
            },
          ],
        }}
      />

      <ClientEditSheet
        open={editClientOpen}
        onOpenChange={setEditClientOpen}
        mode="edit"
        initialSection={editClientSection}
        hasPets={hasPets}
        initial={{
          firstName: client.name.split(" ")[0] ?? "",
          lastName: client.name.split(" ").slice(1).join(" "),
          phone: client.phone ?? "",
        }}
      />
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

function AddressRow({ label, line }: { label: string; line: string }) {
  return (
    <li className="flex flex-col py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{line}</span>
    </li>
  )
}

function ContactRow({
  relationship,
  name,
  phone,
  email,
}: {
  relationship: string
  name: string
  phone?: string
  email?: string
}) {
  return (
    <li className="flex flex-col py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{relationship}</span>
      <span className="font-medium">{name}</span>
      {email ? <span className="font-medium">{email}</span> : null}
      {phone ? <span className="font-medium">{phone}</span> : null}
    </li>
  )
}

function NotificationDisplay({ label, channels }: { label: string; channels: string[] }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm">
        {channels.length === 0 ? (
          <span className="text-muted-foreground">Off</span>
        ) : (
          channels.join(" · ")
        )}
      </span>
    </div>
  )
}

function SectionPlaceholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-background p-6">
      <h3 className="font-heading text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

const OVERVIEW_PETS = [
  { id: "bobo", name: "Bobo", breed: "French Bulldog · 10 lbs", species: "dog" as const },
  { id: "mochi", name: "Mochi", breed: "Domestic Shorthair · 8 lbs", species: "cat" as const },
]

// Figma-aligned status colors (per the design tokens shared 2026-05-10).
// arrived / started don't have explicit Figma tones yet — using lime (same
// as confirmed) since they're "going through the flow" states; revisit when
// the design tokens add specific colors for them.
const STATUS_BADGE_CLASS: Record<Exclude<ApptStatus, "all">, string> = {
  booked: "bg-blue-5 text-blue-12",
  confirmed: "bg-lime-5 text-lime-12",
  arrived: "bg-lime-5 text-lime-12",
  started: "bg-lime-5 text-lime-12",
  completed: "bg-gray-6 text-gray-12",
  canceled: "bg-olive-5 text-olive-12",
  "no-show": "bg-tomato-8 text-tomato-12",
}

function AppointmentCard({ appt, hasPets }: { appt: MockAppointment; hasPets: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
            <span className="font-semibold text-foreground">{appt.time}</span>
            <span className="truncate text-muted-foreground">· {appt.location}</span>
          </div>
          {hasPets && appt.pet ? (
            <div className="flex items-center gap-2">
              <Avatar
                size="sm"
                fallback="species"
                species={appt.pet.species}
                hashSeed={appt.pet.id}
              />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">
                  {appt.pet.name}
                </span>
                <span className="truncate text-xs text-muted-foreground">{appt.pet.breed}</span>
              </div>
            </div>
          ) : null}
        </div>
        <Badge className={cn("border-transparent", STATUS_BADGE_CLASS[appt.status])}>
          {appt.statusLabel}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2">
        {appt.services.map((svc) => (
          <li
            key={`${appt.id}-${svc.name}`}
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
      <AppointmentActions status={appt.status} />
    </div>
  )
}

function AppointmentActions({ status }: { status: Exclude<ApptStatus, "all"> }) {
  if (
    status === "booked" ||
    status === "confirmed" ||
    status === "arrived" ||
    status === "started"
  ) {
    return (
      <div className="flex">
        <Button variant="outline" size="sm" radius="full">
          Checkout
        </Button>
      </div>
    )
  }
  if (status === "completed") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" radius="full">
          View sale
        </Button>
        <Button variant="outline" size="sm" radius="full">
          Rebook
        </Button>
      </div>
    )
  }
  if (status === "canceled" || status === "no-show") {
    return (
      <div className="flex">
        <Button variant="outline" size="sm" radius="full">
          Rebook
        </Button>
      </div>
    )
  }
  return null
}

function PetCard({ pet, onClick }: { pet: MockPet; onClick?: () => void }) {
  const meta = [pet.breed, pet.weight, pet.coat, pet.desexedStatus].filter(Boolean).join(" · ")
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
    >
      <Avatar size="lg" fallback="species" species={pet.species} hashSeed={pet.id} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold">{pet.name}</span>
          {pet.serviceCodes?.map((code) => (
            <Badge key={code} variant="primary-soft">
              {code}
            </Badge>
          ))}
        </div>
        <span className="truncate text-sm text-muted-foreground">{meta}</span>
      </div>
      <ChevronRightIcon className="size-5 shrink-0 text-muted-foreground" />
    </button>
  )
}

function PetsOverviewCard({ onAddPet }: { onAddPet?: () => void }) {
  return (
    <SectionCard
      title="Pets"
      action={
        <Button variant="secondary" size="sm" radius="full" onClick={onAddPet}>
          <PlusIcon />
          Add pet
        </Button>
      }
    >
      <ul className="flex flex-col">
        {OVERVIEW_PETS.map((pet) => (
          <li
            key={pet.id}
            className="flex items-center gap-3 border-border/60 border-b py-3 first:pt-0 last:border-b-0 last:pb-0"
          >
            <Avatar size="md" fallback="species" species={pet.species} hashSeed={pet.id} />
            <div className="flex min-w-0 flex-col">
              <span className="font-medium">{pet.name}</span>
              <span className="text-sm text-muted-foreground">{pet.breed}</span>
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
