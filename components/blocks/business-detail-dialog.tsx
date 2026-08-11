"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertTriangleIcon,
  ArchiveIcon,
  ArrowUpRightIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleCheckIcon,
  CircleSlash2Icon,
  ClockIcon,
  InfoIcon,
  KeyRoundIcon,
  LinkIcon,
  type LucideIcon,
  PencilIcon,
  XIcon,
} from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { HqCamiPayPanel } from "@/components/blocks/hq-camipay-panel"
import { LoginAsOwnerDialog } from "@/components/blocks/login-as-owner-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  type AdminBusiness,
  type BusinessState,
  formatDate,
  formatDateTime,
  REASON_CODES,
  type ReasonCodeId,
  relativeTime,
  STAFF_ROLE_LABELS,
  STATE_DESCRIPTION,
  STATE_DOT,
  STATE_OPTIONS,
  type StaffRole,
  stateLabel,
} from "@/lib/admin-businesses"
import { PermissionGate } from "@/lib/auth-mock"
import { EMIRATES } from "@/lib/business-profile"
import { useHqRates } from "@/lib/notifications/hq-store"
import {
  amountDue,
  type BusinessNotificationConfig,
  CHANNEL_LABEL,
  CHANNELS,
  effectiveSenderId,
  FALLBACK_SENDER_ID,
  formatRate,
  isRateOverridden,
  type NotificationChannel,
  resolvedGrant,
  resolvedRate,
  resolvedSenderId,
  type SenderIdStatus,
  totalSends,
} from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

const profileSchema = z.object({
  name: z.string().min(1, "Required"),
  street: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  emirate: z.enum(EMIRATES, { error: "Required" }),
  phone: z.string().min(1, "Required"),
  email: z.email("Invalid email"),
  vatNumber: z.string().optional(),
})
type ProfileValues = z.infer<typeof profileSchema>

const slugSchema = z.object({
  slug: z
    .string()
    .min(2, "Minimum 2 characters")
    .max(40, "Maximum 40 characters")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  acknowledged: z.literal(true, { error: "Tick the acknowledgement to proceed" }),
})
type SlugValues = z.infer<typeof slugSchema>

const reasonSchema = z.object({
  reason: z.enum(REASON_CODES.map((r) => r.id) as [ReasonCodeId, ...ReasonCodeId[]], {
    error: "Pick a reason",
  }),
  note: z.string().max(280, "Keep it under 280 characters").optional(),
})
type ReasonValues = z.infer<typeof reasonSchema>

export type BusinessDetailDialogProps = {
  business: AdminBusiness | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (patch: Partial<AdminBusiness>) => void
  onSlugChange?: (oldSlug: string, newSlug: string) => void
  /**
   * HQ user recorded against notification changes on the audit trail. Passed in
   * from the page (which sits inside the admin AuthProvider) rather than read
   * with useAuth() here, so this dialog keeps working on surfaces without an
   * auth scope.
   */
  actor?: string
  /**
   * Which tab to open on. URL-driven so a link can land on the section it means
   * — "open the partner then click Notifications" isn't a deep link.
   */
  initialTab?: string
}

export function BusinessDetailDialog({
  business,
  open,
  onOpenChange,
  onUpdate,
  onSlugChange,
  actor,
  initialTab,
}: BusinessDetailDialogProps) {
  const [tab, setTab] = useState(initialTab ?? "general")
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [changeSlugOpen, setChangeSlugOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  // Follow the link when one names a tab. Opening a different partner keeps the
  // tab you were on, which is what you want when comparing two of them.
  useEffect(() => {
    setTab(initialTab ?? "general")
  }, [initialTab])

  // Reset nested dialogs when the parent dialog closes or business changes.
  useEffect(() => {
    if (!open) {
      setEditProfileOpen(false)
      setChangeSlugOpen(false)
      setResetPasswordOpen(false)
      setSuspendOpen(false)
      setArchiveOpen(false)
    }
  }, [open])

  if (!business) return null

  const isSuspended = business.state === "suspended"
  const isArchived = business.state === "archived"

  function handleProfileSave(values: ProfileValues) {
    onUpdate({ ...values, vatNumber: values.vatNumber || undefined })
    toast.success("Profile saved")
  }

  function handleSlugSave(newSlug: string) {
    if (!business) return
    onSlugChange?.(business.slug, newSlug)
    onUpdate({ slug: newSlug })
    toast.success(`Slug changed to cami.app/${newSlug}`)
  }

  function handleResetPassword() {
    if (!business) return
    toast.success(`Reset link sent to ${business.ownerEmail}`)
  }

  function handleStateChange(next: BusinessState) {
    if (!business || next === business.state) return
    if (next === "suspended") {
      setSuspendOpen(true)
      return
    }
    if (next === "archived") {
      setArchiveOpen(true)
      return
    }
    onUpdate({ state: next, reasonCode: undefined, reasonNote: undefined })
    toast.success(`${business.name}, ${stateLabel(next).toLowerCase()}`)
  }

  function handleSuspend(reason: ReasonCodeId, note?: string) {
    if (!business) return
    onUpdate({ state: "suspended", reasonCode: reason, reasonNote: note })
    toast.success(`${business.name} is suspended`)
  }

  function handleUnsuspend() {
    if (!business) return
    onUpdate({ state: "live", reasonCode: undefined, reasonNote: undefined })
    toast.success(`${business.name} is live again`)
  }

  function handleArchive(reason: ReasonCodeId, note?: string) {
    if (!business) return
    onUpdate({ state: "archived", reasonCode: reason, reasonNote: note })
    toast.success(`${business.name} archived`)
  }

  function handleRestore() {
    if (!business) return
    onUpdate({ state: "live", reasonCode: undefined, reasonNote: undefined })
    toast.success(`${business.name} restored`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-[630px] flex h-[640px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-row items-start gap-3 px-9 pt-[34px] pb-5">
                <BusinessAvatar business={business} />
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <DialogTitle className="truncate text-[22px] leading-7 font-semibold">
                    {business.name}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <a
                      href={`/${business.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-muted-foreground hover:text-foreground"
                      onClick={(e) => e.stopPropagation()}
                    >
                      cami.app/{business.slug}
                    </a>
                  </DialogDescription>
                </div>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    radius="full"
                    aria-label="Close"
                    className="shrink-0"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </DialogClose>
              </DialogHeader>

              <TabsList variant="underline" className="px-9">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="team">
                  Team
                  <span className="text-sm font-normal text-muted-foreground">
                    {business.staffCount}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="activity">
                  Activity
                  <span className="text-sm font-normal text-muted-foreground">
                    {business.audit.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="manage">Manage</TabsTrigger>
              </TabsList>
            </div>

            {(isSuspended || isArchived) && (
              <ReasonBanner
                business={business}
                onUnsuspend={handleUnsuspend}
                onRestore={handleRestore}
              />
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-5">
              <TabsContent value="general" className="flex flex-col gap-6">
                <AccessSection
                  business={business}
                  onStateChange={handleStateChange}
                  disabled={isArchived}
                />
                <ProfileSection
                  business={business}
                  onEdit={() => setEditProfileOpen(true)}
                  disabled={isArchived}
                />
                <SlugSection
                  business={business}
                  onChange={() => setChangeSlugOpen(true)}
                  disabled={isArchived}
                />
              </TabsContent>
              <TabsContent value="team" className="flex flex-col gap-4">
                <TeamSection
                  business={business}
                  onResetPassword={() => setResetPasswordOpen(true)}
                  disabled={isArchived}
                />
              </TabsContent>
              <TabsContent value="activity" className="flex flex-col gap-3">
                <ActivitySection business={business} />
              </TabsContent>
              <TabsContent value="notifications" className="flex flex-col gap-4">
                <BusinessNotificationsSection
                  business={business}
                  onUpdate={onUpdate}
                  disabled={isArchived}
                  actor={actor}
                />
              </TabsContent>
              {/* Settings is the container for merchant config (PRO-737).
                  CamiPay settlement is the first section in it; reminder
                  pricing, add-ons, and method flags land here later. */}
              <TabsContent value="settings" className="flex flex-col gap-4">
                <HqCamiPayPanel business={business} disabled={isArchived} />
              </TabsContent>
              <TabsContent value="manage" className="flex flex-col gap-4">
                <ManageSection
                  business={business}
                  onSuspend={() => setSuspendOpen(true)}
                  onUnsuspend={handleUnsuspend}
                  onArchive={() => setArchiveOpen(true)}
                  onRestore={handleRestore}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Nested dialogs */}
      <ProfileSheet
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        business={business}
        onSave={handleProfileSave}
      />
      <ChangeSlugDialog
        open={changeSlugOpen}
        onOpenChange={setChangeSlugOpen}
        business={business}
        onSave={handleSlugSave}
      />
      <ResetPasswordDialog
        open={resetPasswordOpen}
        onOpenChange={setResetPasswordOpen}
        business={business}
        onConfirm={handleResetPassword}
      />
      <SuspendDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        business={business}
        onConfirm={handleSuspend}
      />
      <ArchiveDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        business={business}
        onConfirm={handleArchive}
      />
    </>
  )
}

function BusinessAvatar({ business }: { business: AdminBusiness }) {
  if (business.photoUrl) {
    return (
      <Image
        src={business.photoUrl}
        alt=""
        width={96}
        height={96}
        className="size-12 shrink-0 rounded-xl object-cover"
        unoptimized
      />
    )
  }
  const initials = business.name
    .split(/\s+/)
    .map((p) => p.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("")
  return (
    <span
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-base font-medium text-cami-violet-11"
    >
      {initials}
    </span>
  )
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  )
}

function StatBlock({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

const STATE_ICON: Record<BusinessState, LucideIcon> = {
  onboarding: ClockIcon,
  live: CircleCheckIcon,
  suspended: CircleSlash2Icon,
  archived: ArchiveIcon,
}

const STATE_ICON_TINT: Record<BusinessState, string> = {
  onboarding: "text-cami-violet-11",
  live: "text-white",
  suspended: "text-tomato-11",
  archived: "text-sand-11",
}

const STATE_LABEL_TINT: Record<BusinessState, string> = {
  onboarding: "text-cami-violet-11",
  live: "text-white",
  suspended: "text-tomato-11",
  archived: "text-sand-11",
}

const STATE_ROW_TINT: Record<BusinessState, string> = {
  onboarding: "bg-cami-violet-2 hover:bg-cami-violet-3",
  live: "bg-cami-green-11 hover:bg-cami-green-12",
  suspended: "bg-tomato-2 hover:bg-tomato-3",
  archived: "bg-sand-2 hover:bg-sand-3",
}

const STATE_DESCRIPTION_TINT: Record<BusinessState, string> = {
  onboarding: "text-muted-foreground",
  live: "text-white/80",
  suspended: "text-muted-foreground",
  archived: "text-muted-foreground",
}

const STATE_CHEVRON_TINT: Record<BusinessState, string> = {
  onboarding: "text-muted-foreground",
  live: "text-white/80",
  suspended: "text-muted-foreground",
  archived: "text-muted-foreground",
}

function AccessSection({
  business,
  onStateChange,
  disabled,
}: {
  business: AdminBusiness
  onStateChange: (next: BusinessState) => void
  disabled: boolean
}) {
  const StateIcon = STATE_ICON[business.state]
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-background">
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-none disabled:opacity-50",
              STATE_ROW_TINT[business.state],
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-md",
                STATE_ICON_TINT[business.state],
              )}
            >
              <StateIcon className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span
                className={cn("truncate text-sm font-medium", STATE_LABEL_TINT[business.state])}
              >
                {stateLabel(business.state)}
              </span>
              <span className={cn("truncate text-xs", STATE_DESCRIPTION_TINT[business.state])}>
                {STATE_DESCRIPTION[business.state]}
              </span>
            </div>
            <ChevronDownIcon
              className={cn("size-4 shrink-0", STATE_CHEVRON_TINT[business.state])}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          {STATE_OPTIONS.map((option) => {
            const active = option.id === business.state
            return (
              <DropdownMenuItem
                key={option.id}
                onSelect={() => {
                  if (!active) onStateChange(option.id)
                }}
                className="gap-2"
              >
                <span
                  aria-hidden
                  className={cn("size-1.5 shrink-0 rounded-full", STATE_DOT[option.id])}
                />
                <span className="flex-1">{option.label}</span>
                {active ? <CheckIcon className="size-3.5 text-muted-foreground" /> : null}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-3 border-t border-border/60 px-4 py-3">
        <OwnerInlineAvatar business={business} />
        <span className="flex-1 text-sm text-foreground">Owners</span>
        <span className="text-sm text-muted-foreground">Full access</span>
      </div>
    </section>
  )
}

function OwnerInlineAvatar({ business }: { business: AdminBusiness }) {
  if (business.ownerPhotoUrl) {
    return (
      <Image
        src={business.ownerPhotoUrl}
        alt=""
        width={56}
        height={56}
        className="size-7 shrink-0 rounded-full object-cover"
        unoptimized
      />
    )
  }
  const initial = business.ownerName.trim().charAt(0).toUpperCase()
  return (
    <span
      aria-hidden
      className="flex size-7 shrink-0 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white"
    >
      {initial}
    </span>
  )
}

function ManageSection({
  business,
  onSuspend,
  onUnsuspend,
  onArchive,
  onRestore,
}: {
  business: AdminBusiness
  onSuspend: () => void
  onUnsuspend: () => void
  onArchive: () => void
  onRestore: () => void
}) {
  const isSuspended = business.state === "suspended"
  const isArchived = business.state === "archived"
  return (
    <section className="flex flex-col gap-1 pt-2">
      <h3 className="mb-2 text-sm font-semibold text-foreground">Manage Partner Account</h3>

      <PermissionGate permission="merchants.impersonate">
        <ManageRow
          title="Sign in as Owner"
          description="Sign in as the Owner to debug. Every action is recorded against your HQ account in the audit log. Sessions expire after 30 minutes."
          action={
            <LoginAsOwnerDialog
              business={{
                id: business.slug,
                name: business.name,
                ownerName: business.ownerName,
                ownerEmail: business.ownerEmail,
              }}
            />
          }
        />
      </PermissionGate>

      {isArchived ? (
        <ManageRow
          title="Restore Account"
          description="Brings the account back to live and re-enables Owner sign-in. Available for 90 days after archive."
          action={
            <Button variant="outline" onClick={onRestore}>
              Restore account
            </Button>
          }
        />
      ) : (
        <ManageRow
          title={isSuspended ? "Un-suspend Account" : "Suspend Account"}
          description={
            isSuspended
              ? "Restores Owner login and re-publishes the public booking page."
              : "Hides the public booking page. Owner cannot sign in. Bookings, services, and staff are preserved. Reversible at any time."
          }
          action={
            isSuspended ? (
              <Button variant="outline" onClick={onUnsuspend}>
                Un-suspend account
              </Button>
            ) : (
              <Button variant="outline" onClick={onSuspend}>
                Suspend account
              </Button>
            )
          }
        />
      )}

      {!isArchived ? (
        <ManageRow
          title="Archive account"
          description="Soft-deletes the account. Data is preserved for 90 days, then permanently removed. The slug frees up after 90 days."
          action={
            <Button variant="destructive" onClick={onArchive}>
              Archive account
            </Button>
          }
        />
      ) : null}
    </section>
  )
}

function ManageRow({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <span className="text-sm text-muted-foreground">{description}</span>
      </div>
      <div className="shrink-0 pt-0.5">{action}</div>
    </div>
  )
}

function ProfileSection({
  business,
  onEdit,
  disabled,
}: {
  business: AdminBusiness
  onEdit: () => void
  disabled: boolean
}) {
  return (
    <SectionCard
      title="Profile"
      action={
        <Button variant="ghost" size="sm" onClick={onEdit} disabled={disabled}>
          <PencilIcon />
          Edit
        </Button>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <StatBlock label="Business name" value={business.name} />
        <StatBlock
          label="Address"
          value={
            <span className="block">
              {business.street}
              <br />
              <span className="text-muted-foreground">
                {business.city}, {business.emirate}
              </span>
            </span>
          }
        />
        <StatBlock
          label="Contact"
          value={
            <span className="block">
              {business.phone}
              <br />
              <span className="text-muted-foreground">{business.email}</span>
            </span>
          }
        />
        <StatBlock label="VAT number" value={business.vatNumber ?? "—"} />
      </div>
    </SectionCard>
  )
}

function SlugSection({
  business,
  onChange,
  disabled,
}: {
  business: AdminBusiness
  onChange: () => void
  disabled: boolean
}) {
  return (
    <SectionCard
      title="Public booking URL"
      action={
        <div className="flex items-center gap-1">
          <Button asChild variant="ghost" size="sm">
            <a
              href={`/${business.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open public page in new tab"
            >
              <ArrowUpRightIcon />
              Open
            </a>
          </Button>
          <Button variant="ghost" size="sm" onClick={onChange} disabled={disabled}>
            <LinkIcon />
            Change slug
          </Button>
        </div>
      }
    >
      <span className="font-mono text-sm text-foreground">cami.app/{business.slug}</span>
    </SectionCard>
  )
}

type TeamMember =
  | {
      key: string
      kind: "owner"
      name: string
      email: string
      photoUrl?: string
      lastActivityAt: string | null
    }
  | {
      key: string
      kind: "staff"
      name: string
      email: null
      photoUrl?: string
      staffRole: StaffRole
    }

function TeamSection({
  business,
  onResetPassword,
  disabled,
}: {
  business: AdminBusiness
  onResetPassword: () => void
  disabled: boolean
}) {
  const [query, setQuery] = useState("")

  const owner: TeamMember = {
    key: "owner",
    kind: "owner",
    name: business.ownerName,
    email: business.ownerEmail,
    photoUrl: business.ownerPhotoUrl,
    lastActivityAt: business.lastActivityAt,
  }
  const staff: TeamMember[] = business.staffPreview.map((s) => ({
    key: `staff-${s.name}`,
    kind: "staff",
    name: s.name,
    email: null,
    staffRole: s.role,
  }))
  const members = [owner, ...staff]

  const q = query.trim().toLowerCase()
  const visible = q
    ? members.filter(
        (m) => m.name.toLowerCase().includes(q) || (m.email?.toLowerCase().includes(q) ?? false),
      )
    : members

  return (
    <div className="flex flex-col gap-3">
      <SearchInput
        placeholder="Search team"
        aria-label="Search team"
        defaultValue={query}
        onValueChange={setQuery}
        containerClassName="w-full"
        className="w-full"
      />

      <div>
        <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 py-2 text-xs text-muted-foreground">
          <span>Name</span>
          <span>Role</span>
        </div>
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No members match.</p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((member) => (
              <TeamMemberRow
                key={member.key}
                member={member}
                onResetPassword={onResetPassword}
                disabled={disabled}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Staff is owner-managed. Use Sign in as Owner to add or edit team members.
      </p>
    </div>
  )
}

function TeamMemberRow({
  member,
  onResetPassword,
  disabled,
}: {
  member: TeamMember
  onResetPassword: () => void
  disabled: boolean
}) {
  const isOwner = member.kind === "owner"
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border/60 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3">
        <TeamMemberAvatar member={member} />
        <div className="flex min-w-0 flex-col">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">{member.name}</span>
            {isOwner ? (
              <span className="rounded-md bg-sand-3 px-1.5 py-0.5 text-xs font-medium text-sand-12">
                Business owner
              </span>
            ) : null}
          </div>
          {member.email ? (
            <span className="truncate text-sm text-muted-foreground">{member.email}</span>
          ) : null}
        </div>
      </div>
      {isOwner ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              radius="default"
              className="font-normal text-muted-foreground"
              data-icon="inline-end"
              disabled={disabled}
            >
              Owner
              <ChevronDownIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onSelect={onResetPassword} disabled={disabled}>
              <KeyRoundIcon />
              Send password reset link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <span className="px-3 text-sm text-muted-foreground">
          {STAFF_ROLE_LABELS[member.staffRole]}
        </span>
      )}
    </li>
  )
}

function TeamMemberAvatar({ member }: { member: TeamMember }) {
  if (member.photoUrl) {
    return (
      <Image
        src={member.photoUrl}
        alt=""
        width={64}
        height={64}
        className="size-8 shrink-0 rounded-full object-cover"
        unoptimized
      />
    )
  }
  const initial = member.name.trim().charAt(0).toUpperCase()
  if (member.kind === "owner") {
    return (
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white"
      >
        {initial}
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-xs font-medium text-cami-violet-11"
    >
      {initial}
    </span>
  )
}

function ActivitySection({ business }: { business: AdminBusiness }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 text-sm">
        <span className="font-medium text-foreground">Joined</span>
        <span className="text-muted-foreground">{formatDate(business.createdAt)}</span>
      </div>
      {business.audit.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <ul className="flex flex-col">
          {business.audit.map((event, i) => (
            <li
              key={event.id}
              className={cn(
                "grid grid-cols-[140px_1fr] items-start gap-4 py-3",
                i === 0 ? "border-t border-border/60" : "border-t border-border/60",
              )}
            >
              <div className="flex flex-col">
                <span className="text-sm text-foreground">{relativeTime(event.at)}</span>
                <span className="text-xs text-muted-foreground">{formatDateTime(event.at)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-foreground">
                  <span className="font-medium">{event.actor}</span>
                  <span className="text-muted-foreground">, {event.action}</span>
                </span>
                {event.detail ? (
                  <span className="text-sm text-muted-foreground">{event.detail}</span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Notifications (HQ control plane) ─────────────────────────────────────────
//
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// Three things HQ owns per merchant, in the order someone debugging a merchant
// asks about them: is the channel even on, whose name are messages going out
// under, and what are we charging.

const SENDER_STATUS_PILL: Record<SenderIdStatus, { label: string; className: string }> = {
  "not-submitted": { label: "Sending as CAMI", className: "bg-sand-3 text-sand-11" },
  submitted: { label: "Pending", className: "bg-cami-yellow-3 text-cami-yellow-11" },
  approved: { label: "Approved", className: "bg-cami-green-3 text-cami-green-11" },
  rejected: { label: "Rejected", className: "bg-tomato-3 text-tomato-11" },
}

/** Exported for the playground, which shows the three states side by side. */
export function BusinessNotificationsSection({
  business,
  onUpdate,
  disabled,
  actor = "Cami HQ",
}: {
  business: AdminBusiness
  onUpdate: (patch: Partial<AdminBusiness>) => void
  disabled?: boolean
  /**
   * Who gets recorded against these changes. Passed in rather than read from
   * useAuth() so this section still renders outside an AuthProvider (the
   * playground is outside /admin, where the provider lives).
   */
  actor?: string
}) {
  const config = business.notifications
  const grant = resolvedGrant(config)
  const senderId = resolvedSenderId(config)
  // Live platform rates, so "global is AED 0.12" tracks what HQ actually set
  // rather than the shipped constant. Returns defaults outside the provider.
  const { rates: globalRates } = useHqRates()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState("")
  // Rate inputs write on every keystroke, so the audit entry can't be written
  // there — "0", "0.", "0.1", "0.14" would be four rows. The value at focus is
  // held here and compared on blur, so one deliberate edit is one entry.
  const rateAtFocus = useRef<Partial<Record<NotificationChannel, number>>>({})

  /**
   * Merge into the existing config so one control can't wipe the others, and
   * record the change on the partner's audit trail. Every mutation here is one
   * a merchant may later ask about — "why did our reminders stop" has to be
   * answerable with a name and a time.
   */
  function patchConfig(
    patch: Partial<BusinessNotificationConfig>,
    audit?: { action: string; detail?: string },
  ) {
    onUpdate({
      notifications: { ...config, ...patch },
      ...(audit
        ? {
            audit: [
              {
                id: `ntf-${Date.now()}`,
                at: new Date().toISOString(),
                actor,
                action: audit.action,
                detail: audit.detail,
                kind: "edit" as const,
              },
              ...business.audit,
            ],
          }
        : {}),
    })
  }

  function toggleChannel(channel: NotificationChannel, next: boolean) {
    patchConfig(
      { grant: { ...grant, [channel]: next } },
      {
        action: `${CHANNEL_LABEL[channel]} notifications ${next ? "enabled" : "disabled"}`,
        detail: next
          ? `${business.name} can send reminders over ${CHANNEL_LABEL[channel]} again.`
          : `${business.name} can no longer send reminders over ${CHANNEL_LABEL[channel]}. Their own settings show the channel locked.`,
      },
    )
    toast.success(`${CHANNEL_LABEL[channel]} ${next ? "enabled" : "disabled"} for ${business.name}`)
  }

  function approve() {
    patchConfig(
      { senderId: { ...senderId, status: "approved", rejectionReason: undefined } },
      {
        action: "Sender ID approved",
        detail: `SMS for ${business.name} now sends as ${senderId.value} instead of ${FALLBACK_SENDER_ID}.`,
      },
    )
    toast.success(`${senderId.value} approved`)
  }

  function reject() {
    if (!reason.trim()) return
    patchConfig(
      { senderId: { ...senderId, status: "rejected", rejectionReason: reason.trim() } },
      {
        // The reason is on the audit entry as well as in the merchant's notice,
        // so the decision stays legible after the merchant submits a new one and
        // overwrites their copy.
        action: `Sender ID ${senderId.value} rejected`,
        detail: reason.trim(),
      },
    )
    toast.success(`${senderId.value} rejected`)
    setRejecting(false)
    setReason("")
  }

  /** Called on blur. Writes one audit entry if the rate actually moved. */
  function commitRate(channel: NotificationChannel) {
    const before = rateAtFocus.current[channel]
    const after = resolvedRate(config, channel, globalRates)
    rateAtFocus.current[channel] = undefined
    if (before === undefined || before === after) return
    patchConfig(
      {},
      {
        action: `${CHANNEL_LABEL[channel]} rate changed`,
        detail: `${formatRate(before)} → ${formatRate(after)} per message for ${business.name} (global is ${formatRate(globalRates[channel])}).`,
      },
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Channels">
        <p className="text-sm text-muted-foreground">
          Master switches. Turning one off locks that column in the merchant&rsquo;s own settings —
          it doesn&rsquo;t clear what they had switched on, so turning it back on restores exactly
          that.
        </p>
        <div className="flex flex-col">
          {CHANNELS.map((channel) => (
            <div
              key={channel}
              className="flex items-center justify-between gap-3 border-t border-border/60 py-3"
            >
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium text-foreground">
                  {CHANNEL_LABEL[channel]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(config?.usage?.[channel] ?? 0).toLocaleString("en-US")} sent this period
                </span>
              </div>
              <Switch
                checked={grant[channel]}
                disabled={disabled}
                onCheckedChange={(next) => toggleChannel(channel, next)}
                aria-label={`${CHANNEL_LABEL[channel]} for ${business.name}`}
              />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Sender ID"
        action={
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              SENDER_STATUS_PILL[senderId.status].className,
            )}
          >
            {SENDER_STATUS_PILL[senderId.status].label}
          </span>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <StatBlock
            label="Registered name"
            value={senderId.value ?? `${FALLBACK_SENDER_ID} (default)`}
          />
          <StatBlock label="Customers see" value={effectiveSenderId(senderId)} />
          {senderId.submittedAt ? (
            <StatBlock label="Submitted" value={formatDate(senderId.submittedAt)} />
          ) : null}
        </div>

        {senderId.rejectionReason ? (
          <p className="rounded-xl bg-tomato-2 p-3 text-sm leading-5 text-foreground">
            {senderId.rejectionReason}
          </p>
        ) : null}

        {/* Only a pending registration has a decision to take. Approving or
            rejecting anything else would name an action that already happened. */}
        {senderId.status === "submitted" && !disabled ? (
          rejecting ? (
            <div className="flex flex-col gap-2">
              {/* A reason is required because it renders verbatim in the
                  merchant's own settings — a rejection with no reason strands
                  them with nothing to fix. */}
              <Textarea
                value={reason}
                rows={3}
                autoFocus
                aria-label="Rejection reason"
                placeholder="Why the carrier or Cami rejected it. The merchant sees this."
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setRejecting(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" disabled={!reason.trim()} onClick={reject}>
                  Reject Sender ID
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={approve}>Approve</Button>
              <Button variant="outline" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </div>
          )
        ) : null}
      </SectionCard>

      <SectionCard title="Rates">
        <p className="text-sm text-muted-foreground">
          AED per message. Blank inherits the global rate; an override is labelled as one so nobody
          debugs a billing discrepancy by guessing.
        </p>
        <div className="flex flex-col">
          {CHANNELS.map((channel) => {
            const overridden = isRateOverridden(config, channel, globalRates)
            return (
              <div
                key={channel}
                className="flex items-center justify-between gap-3 border-t border-border/60 py-3"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {CHANNEL_LABEL[channel]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {overridden
                      ? `Overridden — global is ${formatRate(globalRates[channel])}`
                      : `Global rate ${formatRate(globalRates[channel])}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">AED</span>
                  <Input
                    inputMode="decimal"
                    disabled={disabled}
                    className="h-9! w-16 rounded-xl px-2.5 text-right"
                    aria-label={`${CHANNEL_LABEL[channel]} rate for ${business.name}`}
                    value={String(resolvedRate(config, channel, globalRates))}
                    onFocus={() => {
                      // Remember where the rate started so blur can tell a real
                      // edit from a click that touched the field and left.
                      rateAtFocus.current[channel] = resolvedRate(config, channel, globalRates)
                    }}
                    onBlur={() => commitRate(channel)}
                    onChange={(e) => {
                      const next = Number(e.target.value)
                      if (!Number.isFinite(next) || next < 0) return
                      // No audit entry here — one per keystroke. commitRate on
                      // blur writes the single entry for the whole edit.
                      patchConfig({
                        rateOverrides: { ...config?.rateOverrides, [channel]: next },
                      })
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2">
          <span className="text-sm text-muted-foreground">
            {totalSends(config).toLocaleString("en-US")} messages this period
          </span>
          <span className="text-sm font-medium text-foreground">
            {formatRate(amountDue(config, globalRates))} due
          </span>
        </div>
      </SectionCard>
    </div>
  )
}

function ReasonBanner({
  business,
  onUnsuspend,
  onRestore,
}: {
  business: AdminBusiness
  onUnsuspend: () => void
  onRestore: () => void
}) {
  const isSuspended = business.state === "suspended"
  const reasonLabel = REASON_CODES.find((r) => r.id === business.reasonCode)?.label ?? "Other"
  return (
    <div className="flex flex-col gap-3 bg-tomato-9 px-9 py-4 text-sm text-white">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-tomato-9"
        >
          <InfoIcon className="size-3" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium text-white">
            {isSuspended
              ? "Account is suspended. Owner cannot sign in and the public page is hidden."
              : "Account is archived. Data is preserved for 90 days then permanently removed."}
          </span>
          <span className="text-white/80">
            Reason: {reasonLabel}
            {business.reasonNote ? `, ${business.reasonNote}` : ""}
          </span>
        </div>
      </div>
      <div className="pl-8">
        <Button
          size="sm"
          variant="outline"
          onClick={isSuspended ? onUnsuspend : onRestore}
          className="border-transparent bg-white text-tomato-12 hover:bg-white/90 hover:text-tomato-12"
        >
          {isSuspended ? "Un-suspend" : "Restore"}
        </Button>
      </div>
    </div>
  )
}

function ProfileSheet({
  open,
  onOpenChange,
  business,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onSave: (values: ProfileValues) => void
}) {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema as never),
    defaultValues: {
      name: business.name,
      street: business.street,
      city: business.city,
      emirate: business.emirate,
      phone: business.phone,
      email: business.email,
      vatNumber: business.vatNumber ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: business.name,
        street: business.street,
        city: business.city,
        emirate: business.emirate,
        phone: business.phone,
        email: business.email,
        vatNumber: business.vatNumber ?? "",
      })
    }
  }, [open, business, form])

  function onSubmit(values: ProfileValues) {
    onSave(values)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Partner profile</SheetTitle>
          <p className="text-sm text-muted-foreground">
            Ops-only edits. Logo, description, and services stay with the Owner.
          </p>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-4 px-6 pb-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street address</FormLabel>
                  <FormControl>
                    <Input autoComplete="street-address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emirate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emirate</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-12 w-full rounded-2xl bg-input px-4 py-3 font-medium">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EMIRATES.map((emirate) => (
                          <SelectItem key={emirate} value={emirate}>
                            {emirate}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" autoComplete="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business email</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VAT number</FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      placeholder="100123456700003"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>UAE TRN, optional.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Button type="submit" size="xl" radius="full" className="w-full">
                Save changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xl"
                radius="full"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}

function ChangeSlugDialog({
  open,
  onOpenChange,
  business,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onSave: (newSlug: string) => void
}) {
  const form = useForm<SlugValues>({
    resolver: zodResolver(slugSchema as never),
    defaultValues: { slug: business.slug, acknowledged: false as unknown as true },
  })
  const slug = form.watch("slug")

  useEffect(() => {
    if (open) form.reset({ slug: business.slug, acknowledged: false as unknown as true })
  }, [open, business.slug, form])

  function onSubmit(values: SlugValues) {
    onSave(values.slug)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change URL slug</DialogTitle>
          <DialogDescription>
            The public booking page lives at{" "}
            <span className="font-mono text-foreground">cami.app/{business.slug}</span>. Changing
            the slug breaks any existing links the Owner has shared. The old URL won't redirect.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New slug</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
                  </FormControl>
                  {slug && slug !== business.slug ? (
                    <FormDescription>
                      New URL: <span className="font-mono text-foreground">cami.app/{slug}</span>
                    </FormDescription>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="acknowledged"
              render={({ field }) => (
                <FormItem>
                  <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl bg-tomato-3 p-4 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 cursor-pointer accent-tomato-9"
                      checked={field.value === true}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <span className="flex flex-col gap-1 text-tomato-12">
                      <span className="font-medium">I understand this breaks shared links.</span>
                      <span className="text-tomato-11">
                        The Owner will need to re-share the booking URL with anyone who saved it.
                      </span>
                    </span>
                  </label>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Change slug</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Owner password</DialogTitle>
          <DialogDescription>
            We'll email <span className="font-medium text-foreground">{business.ownerEmail}</span> a
            magic-link to set a new password. Their current password keeps working until they click
            the link.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm()
              onOpenChange(false)
            }}
          >
            Send reset link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SuspendDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: (reason: ReasonCodeId, note?: string) => void
}) {
  const form = useForm<ReasonValues>({
    resolver: zodResolver(reasonSchema as never),
    defaultValues: { note: "" },
  })

  useEffect(() => {
    if (!open) form.reset({ note: "" })
  }, [open, form])

  function onSubmit(values: ReasonValues) {
    onConfirm(values.reason, values.note)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {business.name}?</DialogTitle>
          <DialogDescription>
            The Owner can't sign in and the public booking page is hidden. Bookings, services, and
            staff records are preserved. You can un-suspend at any time.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-12 w-full rounded-2xl bg-input px-4 py-3 font-medium">
                        <SelectValue placeholder="Pick a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASON_CODES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything ops should know"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>Visible only in Cami HQ. Audit-logged.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Suspend account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function ArchiveDialog({
  open,
  onOpenChange,
  business,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  business: AdminBusiness
  onConfirm: (reason: ReasonCodeId, note?: string) => void
}) {
  const form = useForm<ReasonValues>({
    resolver: zodResolver(reasonSchema as never),
    defaultValues: { note: "" },
  })

  useEffect(() => {
    if (!open) form.reset({ note: "" })
  }, [open, form])

  function onSubmit(values: ReasonValues) {
    onConfirm(values.reason, values.note)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive {business.name}?</DialogTitle>
          <DialogDescription>
            Soft-delete the account and end the partnership. Data is preserved for 90 days, then
            permanently removed. The slug is freed up after 90 days.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-4">
            <div className="flex items-start gap-2.5 rounded-2xl bg-tomato-3 p-4 text-sm">
              <span
                aria-hidden
                className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sand-3 text-sand-11"
              >
                <AlertTriangleIcon className="size-3" />
              </span>
              <div className="flex flex-col gap-1 text-tomato-12">
                <span className="font-medium">This is not reversible after 90 days.</span>
                <span className="text-tomato-11">
                  Within 90 days, ops can restore the account from the Archived tab.
                </span>
              </div>
            </div>
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="h-12 w-full rounded-2xl bg-input px-4 py-3 font-medium">
                        <SelectValue placeholder="Pick a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASON_CODES.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Anything ops should know"
                      rows={3}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Archive account
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
