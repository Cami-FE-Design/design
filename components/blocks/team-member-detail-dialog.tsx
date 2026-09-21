"use client"

import {
  BuildingIcon,
  CalendarIcon,
  CirclePlusIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  ScissorsIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import { EmptyState } from "@/components/blocks/empty-state"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { SectionCard } from "@/components/blocks/section-card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type LocationGrants, useLocations } from "@/lib/locations/store"
import { roleById } from "@/lib/team/roles"

export type TeamMemberStatus = "active" | "pending"

export type TeamMemberDetailMember = {
  id: string
  name: string | null
  title?: string
  email: string
  phone?: string
  /** The role, which is the only notion of access this product has (R04). */
  roleId: string
  /**
   * Where they work (R04, R05).
   *
   * This card read the BUSINESS name with "Default workspace" under it — the
   * business-as-location conflation this whole slice exists to delete, left
   * standing on the one screen whose heading is literally "Works at". An owner
   * checking which branches somebody covers was told the name of the company.
   */
  locationGrants?: LocationGrants
  status: TeamMemberStatus
}

export type TeamMemberDetailTabId = "overview" | "details"

const PRIMARY_TABS: Array<{ id: TeamMemberDetailTabId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
]

// Static demo detail — the listing carries only the thin row, so the extra
// profile fields (birthday, country, calendar color, addresses, emergency
// contact, assigned services) are mocked here the same way the client/pet
// detail dialogs mock their deeper sections.
const MOCK_SERVICES = [
  { id: "wash-tidy", label: "Wash & tidy", duration: "45 min" },
  { id: "full-groom", label: "Full groom", duration: "1 hr 30 min" },
  { id: "nails", label: "Nail trim", duration: "15 min" },
]

/**
 * Which branches this person actually works at (R04, R05, SCR-03).
 *
 * It said the business name with "Default workspace" beneath it, which is the
 * conflation the topbar switcher had and the rest of this slice removed: the
 * business is the tenancy, a branch is where work happens. On the one card
 * headed "Works at", an owner was being told the name of their company.
 *
 * An owner's "all locations" stays a named set rather than a list of nine —
 * ticking every branch today and holding the estate are different claims, and
 * the second is the one an owner has. An empty grant is said out loud, because
 * it is a real and permitted state and must never read as "all" (R24).
 */
function WorksAtCard({ grants }: { grants?: LocationGrants }) {
  const { granted, locationName, isMultiLocation } = useLocations()

  // Nothing to tell apart at one branch, and a "Works at" card naming the only
  // branch there is repeats the business back at the reader (DW1.2).
  if (!isMultiLocation) return null

  const rows =
    grants === "all" || grants == null ? granted : granted.filter((l) => grants.includes(l.id))
  const holdsEverything = grants === "all"

  return (
    <SectionCard title="Works at">
      {grants !== "all" && rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No locations yet, so this member cannot open or change anything. An owner can grant
          access.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {holdsEverything ? (
            <p className="text-sm text-muted-foreground">
              Every location, including any added later.
            </p>
          ) : null}
          <ul className="flex flex-col divide-y divide-border/60">
            {rows.map((location) => (
              <li key={location.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                  <BuildingIcon className="size-4" strokeWidth={1.5} />
                </div>
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate font-medium text-foreground text-sm">
                    {locationName(location.id)}
                  </span>
                  {location.status === "live" ? null : (
                    <LocationStatusBadge status={location.status} />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}

type TeamMemberDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  member: TeamMemberDetailMember
  /** Owner rows lock profile / role edits, matching the listing behaviour. */
  isLocked?: boolean
  onEditProfile?: () => void
  onEditRoles?: () => void
  onEditServices?: () => void
  onEditSchedule?: () => void
  onResendInvitation?: () => void
  onRemove?: () => void
  /** Tab to open on first mount. */
  initialTab?: TeamMemberDetailTabId
}

/**
 * Centered detail dialog for a team member, modeled on `<ClientDetailDialog>`.
 * ~630px wide, sticky header (avatar + name + meta + Edit + Actions + Close),
 * horizontal underline tabs (Overview / Details).
 */
export function TeamMemberDetailDialog({
  open,
  onOpenChange,
  member,
  isLocked = false,
  onEditProfile,
  onEditRoles,
  onEditServices,
  onEditSchedule,
  onResendInvitation,
  onRemove,
  initialTab,
}: TeamMemberDetailDialogProps) {
  const [tab, setTab] = useState<TeamMemberDetailTabId>(
    initialTab && PRIMARY_TABS.some((t) => t.id === initialTab) ? initialTab : "overview",
  )

  const displayName = member.name ?? member.email
  const isPending = member.status === "pending"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[760px] max-h-[calc(100vh-100px)] max-w-[630px]! flex-col gap-0 p-0 sm:max-w-[630px]!"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as TeamMemberDetailTabId)}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex flex-col gap-0 bg-muted/40">
            <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-[34px] pb-5">
              <Avatar size="lg" fallback="character" name={displayName} hashSeed={member.id} />
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <DialogTitle className="flex min-w-0 items-center gap-2 text-[22px] leading-7 font-semibold">
                  <span className="truncate">{displayName}</span>
                  {isPending ? <Badge variant="secondary">Pending</Badge> : null}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-sm text-muted-foreground">
                    <span className="truncate">
                      {roleById(member.roleId)?.name ?? member.roleId}
                    </span>
                    <span className="truncate">· {member.email}</span>
                    {member.phone ? <span className="truncate">· {member.phone}</span> : null}
                  </div>
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  radius="full"
                  onClick={onEditProfile}
                  disabled={isLocked}
                  className="hidden sm:inline-flex"
                >
                  Edit
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
                    <DropdownMenuItem disabled={isLocked} onSelect={onEditProfile}>
                      Edit Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled={isLocked} onSelect={onEditRoles}>
                      Edit Roles & Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={onEditServices}>Edit Services</DropdownMenuItem>
                    <DropdownMenuItem onSelect={onEditSchedule}>Edit Schedule</DropdownMenuItem>
                    {isPending ? (
                      <DropdownMenuItem onSelect={onResendInvitation}>
                        Resend invitation
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled={isLocked} onSelect={onRemove} variant="destructive">
                      Remove from business
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
                {PRIMARY_TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-5">
            <TabsContent value="overview" className="flex flex-col gap-3">
              {isPending ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="Invitation pending."
                  description="This team member hasn't accepted their invitation yet. Their activity appears here once they join."
                />
              ) : (
                <>
                  <KpiGrid>
                    <KpiCard
                      label="Upcoming"
                      value="3"
                      info="Bookings assigned to this team member in the future."
                    />
                    <KpiCard
                      label="Completed"
                      value="128"
                      info="Lifetime completed appointments performed by this team member."
                    />
                    <KpiCard
                      label="Cancellations"
                      value="4"
                      info="Lifetime count of cancelled or no-show appointments."
                    />
                    <KpiCard
                      label="Total sales"
                      value="AED 24,600"
                      info="Lifetime revenue attributed to this team member."
                    />
                  </KpiGrid>
                  <WorksAtCard grants={member.locationGrants} />
                  <SectionCard title="Services">
                    <ul className="flex flex-col divide-y divide-border/60">
                      {MOCK_SERVICES.map((service) => (
                        <li
                          key={service.id}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <ScissorsIcon className="size-4" strokeWidth={1.5} />
                          </div>
                          <div className="flex min-w-0 flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {service.label}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {service.duration}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>
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
                </>
              )}
            </TabsContent>

            <TabsContent value="details">
              <div className="rounded-2xl border border-border/60 bg-card">
                <div className="flex justify-end px-4 pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    radius="full"
                    onClick={onEditProfile}
                    disabled={isLocked}
                  >
                    Edit
                  </Button>
                </div>
                <div className="flex flex-col divide-y divide-border/60 px-4 pb-4">
                  <Subsection title="Profile">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <DetailField label="Full name" value={member.name} />
                      <DetailField label="Job title" value={member.title} />
                      <DetailField label="Email" value={member.email} />
                      <DetailField label="Phone" value={member.phone} />
                      <DetailField label="Birthday" value="May 14" />
                      <DetailField label="Country" value="United Arab Emirates" />
                    </div>
                  </Subsection>

                  <Subsection title="Settings">
                    <div className="flex flex-col gap-3">
                      <DetailField label="Calendar bookings" value="Allowed" />
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Permission role</span>
                        <span className="text-sm">
                          {roleById(member.roleId)?.name ?? member.roleId}
                        </span>
                        <span className="pt-1 text-muted-foreground text-sm">
                          {roleById(member.roleId)?.capability}
                        </span>
                      </div>
                    </div>
                  </Subsection>

                  <Subsection title="Addresses">
                    <SummaryRow
                      icon={MapPinIcon}
                      label="Home address"
                      value="JVC Tower 4, Apt 1102, Dubai, AE"
                    />
                  </Subsection>

                  <Subsection title="Emergency contacts">
                    <SummaryRow
                      icon={PhoneIcon}
                      label="Emergency contact"
                      value="Spouse · +971 50 222 1133"
                    />
                  </Subsection>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
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

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="truncate text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}
