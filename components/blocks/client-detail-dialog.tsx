"use client"

import {
  ArrowUpRightIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CirclePlusIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PawPrintIcon,
  PlusIcon,
  ReceiptIcon,
  UserIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import {
  type ClientAllergies,
  type ClientPatchTest,
  formatPatchTestDate,
  MOCK_CLIENTS,
  type MockClient,
  patchTestExpiry,
  patchTestState,
} from "@/app/clients/mock"
import { ClientEditSheet } from "@/components/blocks/client-edit-sheet"
import { DocumentsFormsAndFiles } from "@/components/blocks/documents-files-card"
import { EmptyState } from "@/components/blocks/empty-state"
import { PetDetailDialog } from "@/components/blocks/pet-detail-dialog"
import { PetEditSheet } from "@/components/blocks/pet-edit-sheet"
import { SectionCard } from "@/components/blocks/section-card"
import { TAG_COLOR_CLASS, TAG_LIBRARY } from "@/components/blocks/tag-library"
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
import { RecencyBadge } from "@/components/ui/recency-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mapsDirectionsHref } from "@/lib/address"
import {
  APPT_STATUS_LABEL,
  type ClientAppointment,
  type ClientApptStatus,
  type ClientSale,
  type ClientSaleStatus,
  getClientActivity,
  PET_DETAILS,
  type PetDetail,
} from "@/lib/clients/activity"
import { useDemoBusiness } from "@/lib/demo-business"
import { cn } from "@/lib/utils"

export type ClientTag = {
  id: string
  label: string
}

export type ClientDetailClient = {
  name: string
  phone?: string
  email?: string
  /** Optional recency label rendered inline with the meta line, e.g. "First visit" or "4 weeks". */
  recencyLabel?: string
  /** Stable identifier used as the avatar hash seed. Falls back to name. */
  id?: string
  /** Lifetime no-show count. When > 0, renders a tomato status pill in the meta line. */
  noShowCount?: number
  /** Outstanding unpaid amount in minor units (AED). When > 0, renders a cami-yellow pill in the meta line. */
  unpaidMinor?: number
  /** Operator-set tags rendered as Overview chips and in the Details tab. */
  tags?: ClientTag[]
  /** Short locality for the Overview chip row, e.g. "Marina, Dubai". */
  locality?: string
  /** How the client found the business, e.g. "Instagram". Pairs with `activeSince`. */
  source?: string
  /** Month + year the client became active, e.g. "Feb 2025". */
  activeSince?: string
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
  /** Tab to open on first mount — lets a URL deep-link land on e.g. Documents. */
  initialTab?: TabId
  /** Consent-form id to open in the full-screen viewer on mount (Documents tab). */
  initialViewFormId?: string
  /** File id to open in the full-screen file preview on mount (Documents tab). */
  initialPreviewFileId?: string
}

export type TabId = "overview" | "appointments" | "sales" | "details" | "pets" | "documents"

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

type ApptStatus = "all" | ClientApptStatus

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

/** A client's pet, as Overview and the Pets tab render it. */
type MockPet = {
  id: string
  name: string
  species: AvatarSpecies
} & PetDetail

// ─── Sales ────────────────────────────────────────────────────────────────────

type SaleStatus = "all" | ClientSaleStatus
type ConcreteSaleStatus = ClientSaleStatus

const SALES_STATUS_PRIMARY: Array<{ value: SaleStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "draft", label: "Drafts" },
]

const SALES_STATUS_MORE: Array<{ value: SaleStatus; label: string }> = [
  { value: "part-paid", label: "Part paid" },
  { value: "unpaid", label: "Unpaid" },
  { value: "refunded", label: "Refunded" },
]

const SALE_STATUS_LABEL: Record<ConcreteSaleStatus, string> = {
  paid: "Paid",
  "part-paid": "Part paid",
  unpaid: "Unpaid",
  draft: "Draft",
  refunded: "Refunded",
}

// Soft-pill set, one tone per status so they're visually distinct at a glance.
// Step-5/-12 to match the visual weight of the appointment status badges
// (which use the same step pattern). Unpaid = cami-yellow step-3/-11 to match
// the "AED N Unpaid" pill in the appointment detail sheet. Part paid = gold
// (orange-tan, between paid and unpaid). Paid = lime.
const SALE_BADGE_CLASS: Record<ConcreteSaleStatus, string> = {
  paid: "bg-lime-5 text-lime-12",
  "part-paid": "bg-gold-5 text-gold-12",
  unpaid: "bg-cami-yellow-3 text-cami-yellow-11",
  draft: "bg-cami-gray-5 text-cami-gray-12",
  refunded: "bg-olive-5 text-olive-12",
}

function formatAed(minor: number) {
  if (minor < 0) return `- AED ${Math.abs(Math.round(minor / 100)).toLocaleString()}`
  return `AED ${Math.round(minor / 100).toLocaleString()}`
}

// ─── Overview identity + wallet ───────────────────────────────────────────────

/**
 * Everything the dialog shows that varies per client, resolved from the client
 * record in app/clients/mock.ts and their activity in lib/clients/activity.ts.
 *
 * This started as module-level constants — one address, one source, one set of
 * tags, one package, one appointment list, one sales list. Every client the
 * dialog was opened on, from every call site, showed the same "Marina, Dubai ·
 * Instagram · VIP", the same three pets, and the same AED 75. Fine on the first
 * render, wrong the moment anyone opened two clients in a row, and actively
 * misleading on a record that has no address at all.
 *
 * A call site can still pass `locality` / `source` / `tags` on the client prop
 * and those win — that is for the pet and sales surfaces, where the record in
 * hand is not a MockClient.
 */
export type OverviewProfile = {
  locality?: string
  source?: string
  /** Derived from the record's createdAt, e.g. "Since Apr 2026". */
  activeSince?: string
  tags: Array<{ id: string; label: string; className: string }>
  pets: MockPet[]
  appointments: ClientAppointment[]
  sales: ClientSale[]
  salesMinor: number
  packages: NonNullable<MockClient["packages"]>
  loyaltyPoints: number
  giftCardAed: number
  membershipTier?: string
  /** Staff-maintained, customer-visible — the one field both faces render. */
  preferences: NonNullable<MockClient["preferences"]>
  allergies?: ClientAllergies
  patchTest?: ClientPatchTest
  birthday?: string
  gender?: string
  country?: string
  addresses: NonNullable<MockClient["addresses"]>
  contacts: NonNullable<MockClient["contacts"]>
}

function monthYear(iso: string): string | undefined {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return undefined
  return date.toLocaleDateString("en-GB", { month: "short", year: "numeric" })
}

/**
 * Tag ids on the client record resolve through TAG_LIBRARY, so a tag reads the
 * same colour here as it does on the clients table and the tag picker. A
 * caller-supplied tag has no library entry and falls back to the violet used
 * for "client" tags.
 */
function resolveTags(client: ClientDetailClient, record?: MockClient) {
  if (client.tags) {
    return client.tags.map((tag) => ({ ...tag, className: TAG_COLOR_CLASS.violet }))
  }
  return (record?.tags ?? []).flatMap((id) => {
    const def = TAG_LIBRARY.find((t) => t.id === id)
    return def ? [{ id, label: def.label, className: TAG_COLOR_CLASS[def.color] }] : []
  })
}

export function resolveProfile(client: ClientDetailClient): OverviewProfile {
  const record = client.id ? MOCK_CLIENTS.find((c) => c.id === client.id) : undefined
  const activity = getClientActivity(client.id)
  return {
    locality: client.locality ?? record?.locality,
    source: client.source ?? record?.source,
    activeSince: client.activeSince ?? (record ? monthYear(record.createdAt) : undefined),
    tags: resolveTags(client, record),
    // Name and species come off the client record; PET_DETAILS adds only the
    // breed and weight a record has no room for. One list of pets, not two.
    pets: (record?.pets ?? []).map((pet) => ({ ...pet, ...PET_DETAILS[pet.id] })),
    appointments: activity.appointments,
    sales: activity.sales,
    salesMinor: (record?.salesAed ?? 0) * 100,
    packages: record?.packages ?? [],
    loyaltyPoints: record?.loyaltyPoints ?? 0,
    giftCardAed: record?.giftCardAed ?? 0,
    membershipTier: record?.membershipTier,
    preferences: record?.preferences ?? [],
    allergies: record?.allergies,
    patchTest: record?.patchTest,
    birthday: record?.birthday,
    gender: record?.gender,
    country: record?.country,
    addresses: record?.addresses ?? [],
    contacts: record?.contacts ?? [],
  }
}

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
  initialTab,
  initialViewFormId,
  initialPreviewFileId,
}: ClientDetailDialogProps) {
  const [tab, setTab] = useState<TabId>(
    initialTab && PRIMARY_TABS.some((t) => t.id === initialTab) ? initialTab : "overview",
  )
  const [apptStatus, setApptStatus] = useState<ApptStatus>("all")
  const [saleStatus, setSaleStatus] = useState<SaleStatus>("all")
  const [noShowDialogOpen, setNoShowDialogOpen] = useState(false)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)
  const profile = resolveProfile(client)
  const appointments = profile.appointments
  const noShowAppointments = appointments.filter((a) => a.status === "no-show")
  const selectedPet = profile.pets.find((p) => p.id === selectedPetId) ?? null
  const [addPetOpen, setAddPetOpen] = useState(false)
  const [editClientOpen, setEditClientOpen] = useState(false)
  const [editClientSection, setEditClientSection] = useState<
    "profile" | "additional" | "preferences" | "addresses" | "contacts" | "pets" | "settings"
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
    apptStatus === "all" ? appointments : appointments.filter((a) => a.status === apptStatus)
  const apptCounts = {
    all: appointments.length,
    booked: appointments.filter((a) => a.status === "booked").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    arrived: appointments.filter((a) => a.status === "arrived").length,
    started: appointments.filter((a) => a.status === "started").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    canceled: appointments.filter((a) => a.status === "canceled").length,
    "no-show": appointments.filter((a) => a.status === "no-show").length,
  } satisfies Record<ApptStatus, number>

  const isSaleStatusInMore = SALES_STATUS_MORE.some((s) => s.value === saleStatus)
  const sales = profile.sales
  // The header's no-show and unpaid pills were props no call site passed, so
  // they never rendered. Both are derivable from the activity now, and a
  // caller that knows better still wins.
  const noShowCount = client.noShowCount ?? noShowAppointments.length
  const unpaidMinor =
    client.unpaidMinor ??
    sales.reduce((sum, sale) => {
      if (sale.status === "unpaid") {
        return sum + sale.items.reduce((n, item) => n + item.priceMinor, 0)
      }
      if (sale.status === "part-paid") {
        const total = sale.items.reduce((n, item) => n + item.priceMinor, 0)
        return sum + Math.max(total - (sale.paidMinor ?? 0), 0)
      }
      return sum
    }, 0)
  const filteredSales = saleStatus === "all" ? sales : sales.filter((s) => s.status === saleStatus)
  const saleCounts = {
    all: sales.length,
    paid: sales.filter((s) => s.status === "paid").length,
    draft: sales.filter((s) => s.status === "draft").length,
    "part-paid": sales.filter((s) => s.status === "part-paid").length,
    unpaid: sales.filter((s) => s.status === "unpaid").length,
    refunded: sales.filter((s) => s.status === "refunded").length,
  } satisfies Record<SaleStatus, number>

  // Overview derives its numbers from the same mocks the other tabs render, so
  // the strip can't drift from the Appointments / Sales lists the way the old
  // hardcoded KPI values did.
  const upcomingAppointments = appointments.filter(
    (a) => a.status === "booked" || a.status === "confirmed" || a.status === "arrived",
  )
  const nextAppointment = upcomingAppointments[0] ?? null
  // Most recent completed visit — the one reception rebooks.
  const lastVisit = appointments.find((a) => a.status === "completed") ?? null
  // Lifetime sales: everything invoiced except drafts and refunds.
  const totalSalesMinor = profile.salesMinor

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
                    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
                      {client.phone ? <span className="truncate">{client.phone}</span> : null}
                      {client.email ? (
                        <span className="truncate">
                          {client.phone ? "· " : null}
                          {client.email}
                        </span>
                      ) : null}
                      {client.recencyLabel ? (
                        <RecencyBadge>{client.recencyLabel}</RecencyBadge>
                      ) : null}
                      {noShowCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => setNoShowDialogOpen(true)}
                          className="inline-flex size-5 cursor-pointer items-center justify-center rounded-full bg-tomato-8 text-xs font-medium text-tomato-12 transition-colors hover:bg-tomato-9"
                          aria-label={`Show ${noShowCount} no-show appointment${noShowCount === 1 ? "" : "s"}`}
                        >
                          {noShowCount}
                        </button>
                      ) : null}
                      {unpaidMinor > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTab("sales")
                            setSaleStatus("unpaid")
                          }}
                          className="inline-flex cursor-pointer items-center rounded-full bg-cami-yellow-3 px-2.5 py-0.5 text-xs font-medium text-cami-yellow-11 transition-colors hover:bg-cami-yellow-4"
                          aria-label={`Show unpaid sales — ${formatAed(unpaidMinor)}`}
                        >
                          {formatAed(unpaidMinor)}
                        </button>
                      ) : null}
                      {!client.phone &&
                      !client.email &&
                      !client.recencyLabel &&
                      !noShowCount &&
                      !unpaidMinor ? (
                        <span>—</span>
                      ) : null}
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
                <ClientOverview
                  profile={profile}
                  hasPets={hasPets}
                  appts={appointments.length}
                  salesMinor={totalSalesMinor}
                  noShows={noShowAppointments.length}
                  upcoming={upcomingAppointments.length}
                  lastVisit={lastVisit}
                  nextAppointment={nextAppointment}
                  onNoShowsClick={() => setNoShowDialogOpen(true)}
                  onRebook={onBookNow}
                  onEditPreferences={() => openEditClientAt("preferences")}
                  onAddPet={() => setAddPetOpen(true)}
                  onSelectPet={setSelectedPetId}
                />
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
                        <AppointmentCard appt={appt} pets={profile.pets} hasPets={hasPets} />
                      </TimelineRow>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="sales" className="flex flex-col gap-4">
                <Tabs
                  value={saleStatus}
                  onValueChange={(v) => setSaleStatus(v as SaleStatus)}
                  className="w-full"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <TabsList variant="ghost">
                        {SALES_STATUS_PRIMARY.map((opt) => (
                          <TabsTrigger key={opt.value} value={opt.value}>
                            {opt.label}
                            <span
                              className={cn(
                                "text-sm font-normal text-muted-foreground",
                                saleStatus === opt.value && "text-foreground/70",
                              )}
                            >
                              {saleCounts[opt.value]}
                            </span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          data-active={isSaleStatusInMore ? "true" : undefined}
                          className={cn(
                            "inline-flex h-8 items-center gap-2 rounded-full px-3 text-sm font-semibold whitespace-nowrap text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground",
                            "data-active:bg-muted data-active:text-foreground",
                          )}
                        >
                          {isSaleStatusInMore ? (
                            <>
                              {SALES_STATUS_MORE.find((s) => s.value === saleStatus)?.label}
                              <span className="text-sm font-normal text-foreground/70">
                                {saleCounts[saleStatus]}
                              </span>
                            </>
                          ) : (
                            "More"
                          )}
                          <ChevronDownIcon className="size-3.5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {SALES_STATUS_MORE.map((opt) => (
                            <DropdownMenuItem
                              key={opt.value}
                              onSelect={() => setSaleStatus(opt.value)}
                            >
                              {opt.label}
                              <span className="ml-auto text-muted-foreground">
                                {saleCounts[opt.value]}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Button type="button" variant="outline" size="sm" radius="full">
                      <PlusIcon />
                      Sell
                    </Button>
                  </div>
                </Tabs>
                {filteredSales.length === 0 ? (
                  <EmptyState
                    icon={ReceiptIcon}
                    title={saleStatus === "all" ? "No sales yet." : "No sales match this filter."}
                  />
                ) : (
                  <ul className="flex flex-col">
                    {filteredSales.map((sale, i) => (
                      <TimelineRow
                        key={sale.id}
                        isLast={i === filteredSales.length - 1}
                        leading={<TimelineDate dayMonth={sale.dayMonth} weekday={sale.weekday} />}
                      >
                        <SaleCard sale={sale} />
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
                        <DetailField label="Email" value={client.email} />
                        <DetailField label="Birthday" value={profile.birthday} />
                        <DetailField label="Gender" value={profile.gender} />
                      </div>
                    </Subsection>

                    <Subsection title="Additional info">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <DetailField label="Source" value={profile.source} />
                        <DetailField label="Country" value={profile.country} />
                        <div className="col-span-2 flex flex-col">
                          <span className="text-xs text-muted-foreground">Tags</span>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            {profile.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium",
                                  tag.className,
                                )}
                              >
                                <UserIcon className="size-3.5" strokeWidth={1.75} />
                                {tag.label}
                              </span>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="xs"
                              radius="full"
                              className="gap-1"
                            >
                              <CirclePlusIcon className="size-3.5" />
                              Add tag
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Subsection>

                    <Subsection title="Addresses">
                      {profile.addresses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No addresses on file.</p>
                      ) : (
                        <ul className="flex flex-col">
                          {profile.addresses.map((address) => (
                            <AddressRow
                              key={address.id}
                              label={address.label}
                              line={address.line}
                            />
                          ))}
                        </ul>
                      )}
                    </Subsection>

                    <Subsection title="Additional contacts">
                      {profile.contacts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No additional contacts.</p>
                      ) : (
                        <ul className="flex flex-col">
                          {profile.contacts.map((contact) => (
                            <ContactRow
                              key={contact.id}
                              relationship={contact.relationship}
                              name={contact.name}
                              phone={contact.phone}
                              email={contact.email}
                            />
                          ))}
                        </ul>
                      )}
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
                    {profile.pets.length} {profile.pets.length === 1 ? "pet" : "pets"}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    radius="full"
                    onClick={() => setAddPetOpen(true)}
                  >
                    <CirclePlusIcon />
                    Add pet
                  </Button>
                </div>
                {profile.pets.length === 0 ? (
                  <EmptyState
                    icon={PawPrintIcon}
                    title="No pets yet."
                    description="Add a pet to start booking grooming, vet visits, or boarding."
                  />
                ) : (
                  <ul className="flex flex-col gap-3">
                    {profile.pets.map((pet) => (
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
                      <CirclePlusIcon />
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
                      <CirclePlusIcon />
                      Add allergy
                    </Button>
                  }
                >
                  <AllergiesBody allergies={profile.allergies} />
                </SectionCard>
                <SectionCard
                  title="Patch tests"
                  action={
                    <Button variant="secondary" size="sm" radius="full">
                      <CirclePlusIcon />
                      Add patch test
                    </Button>
                  }
                >
                  <PatchTestBody test={profile.patchTest} />
                </SectionCard>
                <DocumentsFormsAndFiles
                  formsTitle="Forms"
                  recipientName={client.name}
                  recipientEmail={client.email}
                  recipientPhone={client.phone}
                  initialViewFormId={initialViewFormId}
                  initialPreviewFileId={initialPreviewFileId}
                />
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
            breed: selectedPet.breed ?? "Breed not recorded",
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
        // Seeded from the same record the tabs render. It used to carry only
        // name and phone, so opening Edit on a client with three preferences
        // and a home address showed an empty form — which reads as "this client
        // has nothing" rather than "this form hasn't loaded".
        initial={{
          firstName: client.name.split(" ")[0] ?? "",
          lastName: client.name.split(" ").slice(1).join(" "),
          phone: client.phone ?? "",
          email: client.email ?? "",
          birthday: profile.birthday ?? "",
          gender: profile.gender ?? "",
          source: profile.source?.toLowerCase() ?? "",
          country: profile.country ?? "",
          tags: profile.tags.map((tag) => tag.id),
          preferences: profile.preferences.map((pref) => ({ ...pref })),
          pets: profile.pets.map((pet) => ({
            id: pet.id,
            name: pet.name,
            species: pet.species,
          })),
        }}
      />

      {/* No-show appointments — small dialog stacked over the client modal,
          triggered by the no-show pill in the header meta line or the
          "No-shows" KPI card on the Overview tab. */}
      <Dialog open={noShowDialogOpen} onOpenChange={setNoShowDialogOpen}>
        <DialogContent className="max-w-140 gap-0 p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="flex flex-row items-center justify-between gap-3 px-6 py-5">
            <DialogTitle className="text-base font-semibold">No-show appointments</DialogTitle>
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <DialogDescription className="sr-only">
            No-show appointments for {client.name}
          </DialogDescription>
          <div className="flex flex-col gap-3 px-6 pb-6">
            {noShowAppointments.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="No no-show appointments." />
            ) : (
              noShowAppointments.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} pets={profile.pets} hasPets={hasPets} />
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
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

// Literal match for the NewAppointmentSheet / AppointmentDetailSheet hero-band
// palette (pale step-5/6 fills with dark text) so the same status reads
// identically in the list row badge and in the open edit/detail sheet's
// hero band. Status keys here use the list-friendly aliases
// (arrived/started/canceled) mapped from the underlying booking statuses
// (checked-in/ready-for-pickup/cancelled).
/**
 * A patch test is not a yes/no, and the two things it carries are independent:
 * how the test went, and whether it is still current. A pending test is not a
 * pass, and a pass from eight months ago is not cover for today's colour.
 */
const PATCH_TEST_LABEL: Record<"pending" | "failed" | "valid" | "expired", string> = {
  pending: "Pending",
  failed: "Failed",
  valid: "Valid",
  expired: "Expired",
}

const PATCH_TEST_BADGE_CLASS: Record<"pending" | "failed" | "valid" | "expired", string> = {
  pending: "bg-cami-yellow-3 text-cami-yellow-11",
  failed: "bg-tomato-8 text-tomato-12",
  valid: "bg-lime-5 text-lime-12",
  expired: "bg-cami-gray-5 text-cami-gray-12",
}

/**
 * "No allergies recorded" and "no known allergies" look the same in a database
 * and mean opposite things at the chair: one is a question nobody has asked,
 * the other is a question that was asked and answered. The section says which.
 */
function AllergiesBody({ allergies }: { allergies?: ClientAllergies }) {
  if (!allergies) {
    return <p className="text-sm text-muted-foreground">No allergies recorded yet.</p>
  }
  if (allergies.status === "none-known") {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Badge className="border-transparent bg-lime-5 text-lime-12">No known allergies</Badge>
        <span className="text-muted-foreground">Confirmed with the client.</span>
      </div>
    )
  }
  return (
    <ul className="flex flex-col">
      {allergies.items.map((allergy, index) => (
        <li
          key={allergy.id}
          className={cn(
            "flex items-baseline justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0",
            index > 0 && "border-t border-border/60",
          )}
        >
          <span className="min-w-0 font-medium">{allergy.name}</span>
          <span className="shrink-0 text-muted-foreground">
            {[allergy.reaction, allergy.severity].filter(Boolean).join(" · ")}
          </span>
        </li>
      ))}
    </ul>
  )
}

/**
 * Expiry is shown as a date rather than a flag, because the date is the thing
 * reception acts on — "expired" tells you to rebook, "valid until 12 Feb" tells
 * you whether today's colour is covered.
 */
function PatchTestBody({ test }: { test?: ClientPatchTest }) {
  if (!test) {
    return <p className="text-sm text-muted-foreground">No patch tests yet.</p>
  }
  const state = patchTestState(test)
  const expiry = formatPatchTestDate(patchTestExpiry(test).toISOString())
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium">{test.title ?? "Patch test"}</span>
        <Badge className={cn("shrink-0 border-transparent", PATCH_TEST_BADGE_CLASS[state])}>
          {PATCH_TEST_LABEL[state]}
        </Badge>
      </div>
      <span className="text-xs text-muted-foreground">
        {[
          `Tested ${formatPatchTestDate(test.testedOn)}`,
          test.testedBy ? `by ${test.testedBy}` : null,
          test.result === "passed"
            ? `· ${state === "valid" ? "Valid until" : "Expired"} ${expiry}`
            : null,
        ]
          .filter(Boolean)
          .join(" ")}
      </span>
    </div>
  )
}

const STATUS_BADGE_CLASS: Record<Exclude<ApptStatus, "all">, string> = {
  booked: "bg-blue-5 text-blue-12",
  confirmed: "bg-lime-5 text-lime-12",
  arrived: "bg-lime-3 text-lime-12",
  started: "bg-lime-9 text-lime-12",
  completed: "bg-cami-gray-6 text-cami-gray-12",
  canceled: "bg-olive-5 text-olive-12",
  "no-show": "bg-tomato-8 text-tomato-12",
}

function AppointmentCard({
  appt,
  pets,
  hasPets,
}: {
  appt: ClientAppointment
  pets: MockPet[]
  hasPets: boolean
}) {
  const { name: businessName } = useDemoBusiness()
  const pet = pets.find((p) => p.id === appt.petId)
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
            <span className="font-semibold text-foreground">{appt.time}</span>
            <span className="truncate text-muted-foreground">· {businessName}</span>
          </div>
          {hasPets && pet ? (
            <div className="flex items-center gap-2">
              <Avatar size="sm" fallback="species" species={pet.species} hashSeed={pet.id} />
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-medium text-foreground">{pet.name}</span>
                {pet.breed ? (
                  <span className="truncate text-xs text-muted-foreground">
                    {[pet.breed, pet.weight].filter(Boolean).join(" · ")}
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <Badge className={cn("border-transparent", STATUS_BADGE_CLASS[appt.status])}>
          {APPT_STATUS_LABEL[appt.status]}
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

function SaleCard({ sale }: { sale: ClientSale }) {
  const totalMinor = sale.items.reduce((sum, item) => sum + item.priceMinor, 0)
  const showViewSale =
    sale.status === "part-paid" || sale.status === "unpaid" || sale.status === "draft"
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
            <span className="font-semibold text-foreground">Sale</span>
          </div>
        </div>
        <Badge className={cn("border-transparent", SALE_BADGE_CLASS[sale.status])}>
          {SALE_STATUS_LABEL[sale.status]}
        </Badge>
      </div>
      <ul className="flex flex-col gap-2">
        {sale.items.map((item) => (
          <li
            key={`${sale.id}-${item.name}`}
            className="flex items-baseline justify-between gap-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate">{item.name}</span>
            <span className="font-medium">{formatAed(item.priceMinor)}</span>
          </li>
        ))}
        {sale.status === "part-paid" && typeof sale.paidMinor === "number" ? (
          <li className="flex items-baseline justify-between gap-2 text-sm text-muted-foreground">
            <span>Paid part</span>
            <span>{formatAed(-sale.paidMinor)}</span>
          </li>
        ) : null}
        <li className="flex items-baseline justify-between gap-2 text-sm">
          <span className="font-semibold">Total</span>
          <span className="font-semibold">{formatAed(totalMinor)}</span>
        </li>
      </ul>
      {showViewSale ? (
        <div className="flex">
          <Button variant="outline" size="sm" radius="full">
            View sale
          </Button>
        </div>
      ) : null}
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
      className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-muted/30"
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

/**
 * Pets on Overview, as chips rather than stacked rows.
 *
 * The stacked version repeated the Pets tab in full — avatar, name, breed,
 * weight, one row each — and cost enough height that the second pet fell below
 * the fold on an 800px dialog. The brief is explicit that pets stay visible on
 * the first screen, and it draws them as chips for exactly this reason: on
 * Overview the question is "who are this client's pets", not "tell me about
 * them". Tapping one opens the pet, which the stacked card never did.
 *
 * It takes the same list the Pets tab renders, so Overview can't say two pets
 * while the tab says three — which it did, off two separate hardcoded arrays.
 */
function PetsOverviewCard({
  pets,
  onAddPet,
  onSelectPet,
}: {
  pets: MockPet[]
  onAddPet?: () => void
  onSelectPet?: (petId: string) => void
}) {
  return (
    <SectionCard
      title="Pets"
      action={
        <Button variant="outline" size="sm" radius="full" onClick={onAddPet}>
          <CirclePlusIcon />
          Add pet
        </Button>
      }
    >
      {pets.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pets on this client yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {pets.map((pet) => (
            <button
              key={pet.id}
              type="button"
              onClick={() => onSelectPet?.(pet.id)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border/60 py-1 pr-3 pl-1 transition-colors hover:bg-muted/40"
            >
              <Avatar size="sm" fallback="species" species={pet.species} hashSeed={pet.id} />
              <span className="text-sm font-medium">{pet.name}</span>
            </button>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

/**
 * The Overview tab's body, lifted out of the dialog and exported.
 *
 * The brief's side-by-side is a test, and running it means holding the two faces
 * up next to each other. A `<Dialog>` cannot be held next to anything — it
 * portals to the body and covers whatever it is compared with — so the content
 * had to stop being trapped inside one. The dialog renders this; so does the
 * comparison view in /playground. There is no second copy to drift.
 */
export function ClientOverview({
  profile,
  hasPets,
  appts,
  salesMinor,
  noShows,
  upcoming,
  lastVisit,
  nextAppointment,
  onNoShowsClick,
  onRebook,
  onEditPreferences,
  onAddPet,
  onSelectPet,
}: {
  profile: OverviewProfile
  hasPets: boolean
  appts: number
  salesMinor: number
  noShows: number
  upcoming: number
  lastVisit: ClientAppointment | null
  nextAppointment: ClientAppointment | null
  onNoShowsClick?: () => void
  onRebook?: () => void
  onEditPreferences?: () => void
  onAddPet?: () => void
  onSelectPet?: (petId: string) => void
}) {
  return (
    <div className="flex flex-col gap-3">
      <OverviewHeaderBlock
        profile={profile}
        appts={appts}
        salesMinor={salesMinor}
        noShows={noShows}
        upcoming={upcoming}
        onNoShowsClick={onNoShowsClick}
      />
      <VisitsCard
        last={lastVisit}
        next={nextAppointment}
        pets={profile.pets}
        hasPets={hasPets}
        onRebook={onRebook}
      />
      <WalletCard profile={profile} />
      <PreferencesCard preferences={profile.preferences} onEdit={onEditPreferences} />
      {hasPets ? (
        <PetsOverviewCard pets={profile.pets} onAddPet={onAddPet} onSelectPet={onSelectPet} />
      ) : null}
      {/* Lowest-priority card on the tab, and it duplicates the Notes section
          under Documents — so it is compact rather than a full card spent on
          "No notes yet." Whether it belongs on Overview at all is a product
          call, not a layout one. */}
      <SectionCard
        title="Notes"
        className="gap-2 py-3"
        action={
          <Button variant="outline" size="sm" radius="full">
            <CirclePlusIcon />
            Add note
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      </SectionCard>
    </div>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────

/**
 * Locality, source + active-since, and tags — the third line of the dialog
 * header, under phone · email. All of it lives under Details as fields;
 * reception needs it at a glance — address for home visits, source for "how did
 * they find us", tags for handling notes — without opening another tab.
 *
 * It shares a block with the counters rather than standing alone, which is what
 * the brief's own wireframe draws — chips, a hairline, then the numbers. Two
 * earlier attempts are worth not repeating: as a bare text line at the top of
 * the tab it floated between the header band and the stats belonging to
 * neither, and as a fourth line inside the dialog header it pushed the header
 * to four rows and wrapped the last tag under the Book button on its own.
 *
 * Two tints, not three: a fact about the client is a grey pill, a tag is violet,
 * because violet is what "somebody chose this" looks like everywhere else in
 * the product. Both sit on the card, not on the block's tint — a pale pill on a
 * pale fill left the chips barely readable, which is the opposite of the point
 * of putting them here.
 */
function IdentityRow({ profile }: { profile: OverviewProfile }) {
  const { locality, source, activeSince, tags } = profile
  const afterLocality = [source, activeSince ? `Since ${activeSince}` : null]
    .filter(Boolean)
    .join(" · ")

  if (!locality && !afterLocality && tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-3 py-3">
      {locality ? (
        // The address is the one thing on this line anyone acts on — a mobile
        // groomer reading it off the screen and retyping it into Maps is the
        // slow path, and the one that mistypes. Same directions link the
        // pickup rows use (<NavigateToAddress>), on the text itself, since a
        // second "Navigate" button in a header this dense earns nothing.
        <a
          href={mapsDirectionsHref(locality)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${locality} in Google Maps`}
          className="group inline-flex max-w-full items-center gap-1 rounded-full bg-cami-sage-3 px-2.5 py-1 text-xs font-medium text-cami-sage-12 transition-colors hover:bg-cami-sage-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <MapPinIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
          <span className="truncate underline decoration-cami-sage-9 underline-offset-2">
            {locality}
          </span>
          <ArrowUpRightIcon className="size-3 shrink-0 opacity-60" strokeWidth={2} />
        </a>
      ) : null}
      {afterLocality ? (
        <span className="inline-flex max-w-full items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
          <span className="truncate">{afterLocality}</span>
        </span>
      ) : null}
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
            tag.className,
          )}
        >
          {tag.label}
        </span>
      ))}
    </div>
  )
}

/**
 * Lifetime counters, condensed. These four used to open Overview as full
 * `<KpiCard>`s; they are reference figures, not the reason anyone opens a
 * profile, so they share one divided row at the top of the tab.
 *
 * Filled rather than bordered, on purpose. As a bordered white card it was the
 * fifth in a stack of five identical white cards and nothing on the tab had any
 * hierarchy. A tinted strip reads as chrome — a band of reference numbers —
 * and leaves "card" meaning "something you act on".
 *
 * No-shows stays clickable; it is the only cell with somewhere to go.
 */
function OverviewHeaderBlock({
  profile,
  appts,
  salesMinor,
  noShows,
  upcoming,
  onNoShowsClick,
}: {
  profile: OverviewProfile
  appts: number
  salesMinor: number
  noShows: number
  upcoming: number
  onNoShowsClick?: () => void
}) {
  const cells: Array<{ label: string; value: React.ReactNode; onClick?: () => void }> = [
    { label: appts === 1 ? "Appt" : "Appts", value: appts },
    // The currency belongs to the figure, not to the label: "75" under
    // "AED SALES" asks the reader to reassemble an amount that was never
    // broken up anywhere else in the product.
    { label: "Sales", value: formatAed(salesMinor) },
    {
      label: noShows === 1 ? "No-show" : "No-shows",
      value: noShows,
      onClick: noShows > 0 ? onNoShowsClick : undefined,
    },
    { label: "Upcoming", value: upcoming },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
      <IdentityRow profile={profile} />
      <div className="grid grid-cols-4 divide-x divide-border/60 border-t border-border/60 bg-muted/50">
        {cells.map((cell) =>
          cell.onClick ? (
            <button
              key={cell.label}
              type="button"
              onClick={cell.onClick}
              className="flex cursor-pointer flex-col items-center gap-1 px-2 py-3 transition-colors hover:bg-muted"
              aria-label={`${cell.label} — ${cell.value}`}
            >
              <StatValue>{cell.value}</StatValue>
              <StatLabel>{cell.label}</StatLabel>
            </button>
          ) : (
            <div key={cell.label} className="flex flex-col items-center gap-1 px-2 py-3">
              <StatValue>{cell.value}</StatValue>
              <StatLabel>{cell.label}</StatLabel>
            </div>
          ),
        )}
      </div>
    </div>
  )
}

function StatValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-heading text-lg leading-none font-semibold whitespace-nowrap">
      {children}
    </span>
  )
}

function StatLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  )
}

/**
 * Last visit and next visit, one card, two rows.
 *
 * They were two cards, and between them they cost 230px of an 800px dialog to
 * answer one question — where is this client in their cycle. Reception reads
 * them together, so they sit together, and the height that frees is what lets
 * Packages and Pets clear the fold on the first screen.
 *
 * Next leads, then Last. Rebook is the only control here anyone presses, and
 * the brief calls it the single most repeated reception task — which argued for
 * putting Last on top. But rebooking is what you do when there is *nothing*
 * booked: a client already on the calendar is not one you rebook. So the row
 * that answers "are they coming in" goes first, and when it is empty it sits
 * directly above the thing that fixes that.
 *
 * Service names and staff come off the appointment record itself, not the
 * catalog, so renaming a service later doesn't rewrite what was done in April.
 */
function VisitsCard({
  last,
  next,
  pets,
  hasPets,
  onRebook,
}: {
  last: ClientAppointment | null
  next: ClientAppointment | null
  pets: MockPet[]
  hasPets: boolean
  onRebook?: () => void
}) {
  const petName = (appt: ClientAppointment) =>
    hasPets ? (pets.find((p) => p.id === appt.petId)?.name ?? null) : null
  const lastStaff = last ? Array.from(new Set(last.services.map((s) => s.staff))) : []
  const lastMeta = last
    ? [lastStaff.length > 0 ? `with ${lastStaff.join(", ")}` : null, last.dayMonth, petName(last)]
        .filter(Boolean)
        .join(" · ")
    : null
  // Both rows read the same way: who it is with, then when. Next used to lead
  // with the date and drop the staff member entirely, which is the one thing
  // reception is asked on the phone — "who have I got on Thursday".
  const nextStaff = next ? Array.from(new Set(next.services.map((s) => s.staff))) : []
  const nextMeta = next
    ? [
        nextStaff.length > 0 ? `with ${nextStaff.join(", ")}` : null,
        `${next.weekday} ${next.dayMonth} · ${next.time}`,
        petName(next),
      ]
        .filter(Boolean)
        .join(" · ")
    : null

  return (
    <SectionCard title="Visits">
      <div className="flex flex-col divide-y divide-border/60">
        <VisitRow
          label="Next"
          title={next ? next.services.map((s) => s.name).join(" + ") : null}
          meta={nextMeta}
          empty="Nothing booked yet."
          action={
            next ? (
              <Badge className={cn("border-transparent", STATUS_BADGE_CLASS[next.status])}>
                {APPT_STATUS_LABEL[next.status]}
              </Badge>
            ) : null
          }
        />
        <VisitRow
          label="Last"
          title={last ? last.services.map((s) => s.name).join(" + ") : null}
          meta={lastMeta}
          empty="No completed visits yet."
          action={
            last ? (
              // Outline, like every other action on this tab. Two earlier goes
              // were wrong in opposite directions: a filled primary made it the
              // twin of Book in the header, and `secondary` left it the only
              // filled thing on a screen of outlined ones, which read as an
              // arbitrary difference rather than a rank.
              //
              // The emphasis it was reaching for was never asked for. The brief
              // calls rebooking the most repeated *task*, not the loudest
              // control, and draws it as a soft pill. The rung it needed to
              // out-weigh only existed because Add pet and Add note used to be
              // filled; once those went quiet, so did the reason. In a card with
              // no other control, position already does the work.
              <Button variant="outline" size="sm" radius="full" onClick={onRebook}>
                Rebook
              </Button>
            ) : null
          }
        />
      </div>
    </SectionCard>
  )
}

function VisitRow({
  label,
  title,
  meta,
  empty,
  action,
}: {
  label: string
  title: string | null
  meta: string | null
  empty: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span className="shrink-0 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          <span className={cn("truncate text-sm", title ? "font-medium" : "text-muted-foreground")}>
            {title ?? empty}
          </span>
        </div>
        {meta ? <span className="truncate text-xs text-muted-foreground">{meta}</span> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

/**
 * Everything this client holds with the business: loyalty, gift card,
 * membership, packages and passes. The brief's only ask here was "packages,
 * passes, and loyalty balance", and that is what this card was.
 *
 * Gift card and membership joined it because the customer's own card shows both
 * — which meant a client could open their phone and see a balance their own
 * salon's reception could not. That asymmetry is precisely what the brief's
 * side-by-side is a test for, and the fix belongs on this side rather than by
 * hiding it from the customer.
 *
 * Loyalty leads as a row rather than the badge in the header it started as: it
 * is the number that brings a client back, and it was the smallest thing on the
 * card while a full-width bar for one package was the largest.
 *
 * Packages collapse past two. A client holding four passes is ordinary, and
 * four stacked pushed Pets back below the fold — the exact problem this tab was
 * rebuilt to fix.
 */
function WalletCard({ profile }: { profile: OverviewProfile }) {
  const [expanded, setExpanded] = useState(false)
  const COLLAPSED = 2
  const { packages, loyaltyPoints, giftCardAed, membershipTier } = profile
  const hidden = Math.max(packages.length - COLLAPSED, 0)
  const shown = expanded ? packages : packages.slice(0, COLLAPSED)

  const balances: Array<{ id: string; label: string; value: string; accent?: boolean }> = []
  if (loyaltyPoints > 0) {
    balances.push({
      id: "loyalty",
      label: "Loyalty balance",
      value: `${loyaltyPoints.toLocaleString()} pts`,
      accent: true,
    })
  }
  if (giftCardAed > 0) {
    balances.push({ id: "gift-card", label: "Gift card", value: formatAed(giftCardAed * 100) })
  }
  if (membershipTier) {
    balances.push({ id: "membership", label: "Membership", value: membershipTier })
  }

  const empty = balances.length === 0 && packages.length === 0

  return (
    <SectionCard title="Wallet">
      {empty ? (
        <p className="text-sm text-muted-foreground">No packages, passes, gift cards or points.</p>
      ) : null}
      {balances.length > 0 ? (
        <dl className="flex flex-col gap-2">
          {balances.map((row) => (
            <div key={row.id} className="flex items-baseline justify-between gap-2">
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  "font-heading text-lg leading-none font-semibold",
                  row.accent && "text-cami-violet-11",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {packages.length > 0 ? (
        <ul
          className={cn(
            "flex flex-col gap-3",
            balances.length > 0 && "border-t border-border/60 pt-3",
          )}
        >
          {shown.map((pkg) => {
            const remaining = Math.max(pkg.totalVisits - pkg.usedVisits, 0)
            // The bar fills with what is LEFT, not what is used. "3 of 5 left"
            // over a 40%-full bar is two different numbers for one fact, and
            // the reader has to work out which one the bar means.
            const remainingPct = pkg.totalVisits > 0 ? (remaining / pkg.totalVisits) * 100 : 0
            return (
              <li key={pkg.id} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate font-medium">{pkg.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {remaining} of {pkg.totalVisits} left
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-cami-violet-9"
                    style={{ width: `${remainingPct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}
      {hidden > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-fit cursor-pointer text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          {expanded ? "Show less" : `Show ${hidden} more`}
        </button>
      ) : null}
    </SectionCard>
  )
}

/**
 * Preferences: what the business keeps on this client's behalf.
 *
 * It existed only on the customer's card, which meant staff could not edit
 * something the brief explicitly says they maintain — and the customer's card
 * says "Maintained by <venue>" while the venue had nowhere to maintain it. This
 * is that place.
 *
 * Labels come from a closed list (lib/clients/preferences.ts) because these
 * rows are customer-visible, and five receptionists left to type freely produce
 * five spellings of one idea.
 *
 * No icon, and the same outline every other action on the tab uses. Overview
 * has exactly one filled control — Book, in the header — and everything else is
 * outlined, so nothing inside the tab is silently ranked against anything else.
 * A "+" stays only where something is genuinely being added.
 */
function PreferencesCard({
  preferences,
  onEdit,
}: {
  preferences: NonNullable<MockClient["preferences"]>
  onEdit?: () => void
}) {
  return (
    <SectionCard
      title="Preferences"
      action={
        <Button variant="outline" size="sm" radius="full" onClick={onEdit}>
          Edit
        </Button>
      }
    >
      {preferences.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing recorded yet. These show on the client's own card.
        </p>
      ) : (
        <dl className="flex flex-col">
          {preferences.map((pref, index) => (
            <div
              key={pref.id}
              className={cn(
                "flex items-baseline justify-between gap-4 py-2 text-sm first:pt-0 last:pb-0",
                index > 0 && "border-t border-border/60",
              )}
            >
              <dt className="shrink-0 text-muted-foreground">{pref.label}</dt>
              <dd className="min-w-0 text-right font-medium">{pref.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </SectionCard>
  )
}
