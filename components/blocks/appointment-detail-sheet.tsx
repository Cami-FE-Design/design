"use client"

import {
  AlertOctagonIcon,
  ArrowLeftIcon,
  CalendarClockIcon,
  CalendarXIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  EyeOffIcon,
  FlagIcon,
  HeartPulseIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  PencilIcon,
  PlayIcon,
  RepeatIcon,
  TagIcon,
  ThumbsUpIcon,
  UsersIcon,
} from "lucide-react"
import { useEffect, useState } from "react"

import {
  formatAed,
  formatDuration,
  type MockBooking,
  type MockBookingStatus,
  type MockStaff,
  SERVICE_CATEGORY_ACCENT,
} from "@/app/appointments/mock"
import { CancelAppointmentDialog } from "@/components/blocks/cancel-appointment-dialog"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { useNotifications } from "@/lib/notifications/store"
import {
  CHANNEL_LABEL,
  eventLabel,
  logForAppointment,
  type NotificationChannel,
  type NotificationStatus,
} from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

// ─── Helpers (mirror new-appointment-sheet conventions) ───────────────────────

// "10:00" → "10:00AM"
function formatTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":")
  const h = Number(hStr)
  const period = h >= 12 ? "PM" : "AM"
  const display = ((h + 11) % 12) + 1
  return `${display}:${mStr ?? "00"}${period}`
}

// Booking's local anchor date (matches the listing's anchor on 18 May 2026).
// Bookings can carry a `dayOffset` (days after the anchor) so surfaces like the
// global search can show a multi-day spread — the sheet honors it so its header
// date always matches the row that opened it.
const ANCHOR_DATE = new Date(2026, 4, 18)
function isoOfAnchor(dayOffset = 0): string {
  const date = new Date(ANCHOR_DATE)
  date.setDate(date.getDate() + dayOffset)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatHeaderDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const day = d.getDate()
  const month = d.toLocaleDateString("en-GB", { month: "short" })
  return `${weekday}, ${day} ${month}`
}

// ─── Status pill: status-keyed hero band styling + dropdown rules ─────────────

type StatusTheme = {
  fill: string
  text: string
  subText: string
  /** Pill background within the hero band. */
  pillBg: string
  pillText: string
}

// Hero band palette — mirrors NewAppointmentSheet STATUS_THEME so the detail
// sheet at /sales/appointments-list reads identically to the edit modal at
// /appointments for the same status. Pastel step-5/6 fills with dark text on
// passive/active states; lime/9 for "Started" with lime-12 text; tomato/8 for
// no-show destructive weight. The status pill inside the band uses solid
// bg-foreground (matching the NewAppointmentSheet trigger) for consistent
// pill styling across both modals.
const STATUS_THEME: Record<MockBookingStatus, StatusTheme> = {
  booked: {
    fill: "bg-blue-5",
    text: "text-blue-12",
    subText: "text-blue-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  confirmed: {
    fill: "bg-lime-5",
    text: "text-lime-12",
    subText: "text-lime-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  "checked-in": {
    fill: "bg-lime-3",
    text: "text-lime-12",
    subText: "text-lime-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  "ready-for-pickup": {
    fill: "bg-lime-9",
    text: "text-lime-12",
    subText: "text-lime-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  completed: {
    fill: "bg-cami-gray-6",
    text: "text-cami-gray-12",
    subText: "text-cami-gray-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  cancelled: {
    fill: "bg-olive-5",
    text: "text-olive-12",
    subText: "text-olive-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
  "no-show": {
    fill: "bg-tomato-8",
    text: "text-tomato-12",
    subText: "text-tomato-12/70",
    pillBg: "bg-foreground",
    pillText: "text-background",
  },
}

type StatusOption = {
  value: MockBookingStatus
  label: string
  Icon: LucideIcon
  destructive?: boolean
}

const FULL_STATUS_OPTIONS: StatusOption[] = [
  { value: "booked", label: "Booked", Icon: CalendarClockIcon },
  { value: "confirmed", label: "Confirmed", Icon: ThumbsUpIcon },
  { value: "checked-in", label: "Arrived", Icon: MapPinIcon },
  { value: "ready-for-pickup", label: "Started", Icon: PlayIcon },
  { value: "no-show", label: "No-show", Icon: EyeOffIcon, destructive: true },
  { value: "cancelled", label: "Canceled", Icon: CalendarXIcon, destructive: true },
]

const STATUS_LABEL: Record<MockBookingStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  "checked-in": "Arrived",
  "ready-for-pickup": "Started",
  completed: "Completed",
  cancelled: "Canceled",
  "no-show": "No-show",
}

function StatusPill({
  status,
  onChange,
}: {
  status: MockBookingStatus
  onChange: (next: MockBookingStatus) => void
}) {
  const theme = STATUS_THEME[status]
  const isTerminal = status === "completed" || status === "cancelled"

  if (isTerminal) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
          theme.pillBg,
          theme.pillText,
        )}
      >
        {STATUS_LABEL[status]}
        <CheckIcon className="size-3.5" />
      </span>
    )
  }

  // `no-show` collapses to a single "Undo no-show" option (flips back to booked).
  const options =
    status === "no-show"
      ? [{ value: "booked" as const, label: "Undo no-show", Icon: EyeOffIcon }]
      : FULL_STATUS_OPTIONS

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90",
            theme.pillBg,
            theme.pillText,
          )}
        >
          {STATUS_LABEL[status]}
          <ChevronDownIcon className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onChange(opt.value)}
            variant={opt.destructive ? "destructive" : undefined}
            data-active={status === opt.value}
            className="data-[active=true]:font-semibold"
          >
            <opt.Icon className="size-4" />
            {opt.label}
            {status === opt.value ? <CheckIcon className="ml-auto size-3.5" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── DateAvatarCard (matches new-appointment-sheet) ───────────────────────────

function DateAvatarCard({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`)
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  const day = d.getDate()
  return (
    <div
      aria-hidden
      className="flex h-12 w-[3rem] shrink-0 flex-col overflow-hidden rounded-[9px] bg-background text-foreground shadow-[0_0_0_2px_var(--background)]"
    >
      <div className="bg-black/10 py-[3px] text-center text-[9px] leading-none font-bold tracking-tight text-foreground/50">
        {month}
      </div>
      <div className="flex flex-1 items-center justify-center text-2xl leading-none font-bold text-foreground/70">
        {day}
      </div>
    </div>
  )
}

// ─── Sale-total footer with inline expand ─────────────────────────────────────

type AppointmentTotals = {
  subtotal: number
  tax: number
  total: number
  cashPaid: number
}

function SaleTotalSection({
  totals,
  label,
}: {
  totals: AppointmentTotals
  /** Switches between "Sale total" (active states) and "To pay" (cancelled / no-show). */
  label: string
}) {
  const [expanded, setExpanded] = useState(false)
  const saleTotal = totals.total - totals.cashPaid

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold leading-7 text-foreground">{label}</h2>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        {expanded ? (
          <div className="flex flex-col gap-2 border-b border-border/60 px-4 py-4 text-sm">
            <FooterRow label="Subtotal" value={formatAed(totals.subtotal)} muted />
            <FooterRow label="Tax" value={formatAed(totals.tax)} muted />
            <FooterRow label="Total" value={formatAed(totals.total)} emphasis />
            <div className="mt-2 border-t border-border/60 pt-3">
              <FooterRow label="Cash" value={`- ${formatAed(totals.cashPaid)}`} muted />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 px-4 pt-4 pb-3 text-sm">
            <FooterRow label="Total" value={formatAed(totals.total)} muted />
            <FooterRow label="Payments" value={`- ${formatAed(totals.cashPaid)}`} muted />
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-muted/30"
        >
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            {label}
            {expanded ? (
              <ChevronUpIcon className="size-3.5" />
            ) : (
              <ChevronDownIcon className="size-3.5" />
            )}
          </span>
          <span className="font-semibold tabular-nums text-foreground">{formatAed(saleTotal)}</span>
        </button>
      </div>
    </section>
  )
}

function FooterRow({
  label,
  value,
  emphasis,
  muted,
}: {
  label: string
  value: string
  emphasis?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={cn(emphasis && "font-semibold", muted && "text-muted-foreground")}>
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasis && "font-semibold",
          muted && "text-muted-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Client snapshot card ─────────────────────────────────────────────────────

type ClientSnapshot = {
  id: string
  name: string
  email?: string
  phone?: string
  unpaidMinor?: number
  isFirstVisit?: boolean
  extraTags?: string[]
}

function ClientCard({
  client,
  onViewProfile,
}: {
  client: ClientSnapshot
  onViewProfile?: () => void
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold leading-7 text-foreground">Client</h2>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
        <div className="flex items-center gap-3">
          <Avatar size="md" fallback="character" name={client.name} hashSeed={client.id} />
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-foreground">{client.name}</span>
            {client.email ? (
              <span className="truncate text-xs text-muted-foreground">{client.email}</span>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" radius="full" className="gap-1.5">
                  Actions
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem>
                  <MessageCircleIcon className="size-4" />
                  Messages
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FlagIcon className="size-4" />
                  Add staff alert
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HeartPulseIcon className="size-4" />
                  Add allergy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertOctagonIcon className="size-4" />
                  Add patch test
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <TagIcon className="size-4" />
                  Add tag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit client details</DropdownMenuItem>
                <DropdownMenuItem>Block client</DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  className="text-tomato-11 focus:bg-tomato-3 focus:text-tomato-11 data-highlighted:bg-tomato-3 data-highlighted:text-tomato-11"
                >
                  Delete client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" size="sm" radius="full" onClick={onViewProfile}>
              View profile
            </Button>
          </div>
        </div>
        {client.unpaidMinor || client.isFirstVisit || (client.extraTags?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {client.unpaidMinor && client.unpaidMinor > 0 ? (
              <span className="inline-flex items-center rounded-full bg-cami-yellow-3 px-2.5 py-1 text-xs font-medium text-cami-yellow-11">
                {formatAed(client.unpaidMinor)} Unpaid
              </span>
            ) : null}
            {client.isFirstVisit ? (
              <span className="inline-flex items-center rounded-full bg-cami-violet-9 px-2.5 py-1 text-xs font-medium text-white">
                First visit
              </span>
            ) : null}
            {client.extraTags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-cami-violet-3 px-2.5 py-1 text-xs font-medium text-cami-violet-11"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

// ─── Services section (view-only, mirrors new-appointment-sheet shape) ────────

function ServicesSection({ booking, staffName }: { booking: MockBooking; staffName: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold leading-7 text-foreground">Services</h2>
      <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
        <ul className="-mx-3 flex flex-col gap-1">
          <li className="flex gap-3 rounded-2xl px-3 py-2">
            <span
              aria-hidden
              className={cn(
                "w-1 shrink-0 self-stretch rounded-full",
                SERVICE_CATEGORY_ACCENT[booking.serviceCategory],
              )}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-3">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="text-base font-semibold text-foreground">
                    {booking.serviceName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatTime(booking.start)} · {formatDuration(booking.durationMin)} ·{" "}
                    {staffName}
                  </span>
                </div>
                <span className="shrink-0 text-base font-semibold leading-tight tabular-nums text-foreground">
                  {formatAed(booking.priceMinor)}
                </span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </section>
  )
}

// ─── Quick actions popover ────────────────────────────────────────────────────

function QuickActionsMenu({
  onViewActivity,
  onViewSale,
}: {
  onViewActivity: () => void
  onViewSale?: () => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          radius="full"
          aria-label="Quick actions"
        >
          <MoreVerticalIcon className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-56 p-1">
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Quick actions</div>
        <QuickActionItem icon={PencilIcon} label="Add a note" onClick={() => setOpen(false)} />
        <DropdownMenuSeparator />
        <QuickActionItem
          icon={CalendarClockIcon}
          label="View appointment activity"
          onClick={() => {
            setOpen(false)
            onViewActivity()
          }}
        />
        <QuickActionItem
          icon={UsersIcon}
          label="Add to group appointment"
          onClick={() => setOpen(false)}
        />
        <QuickActionItem
          icon={TagIcon}
          label="View sale"
          onClick={() => {
            setOpen(false)
            onViewSale?.()
          }}
        />
        <DropdownMenuSeparator />
        <QuickActionItem icon={RepeatIcon} label="Rebook" onClick={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

function QuickActionItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/50"
    >
      <Icon className="size-4 text-muted-foreground" />
      {label}
    </button>
  )
}

// ─── Activity panel (in-sheet slide-in via mode swap) ─────────────────────────

type ActivityEvent = {
  id: string
  title: string
  timestamp: string
  body: React.ReactNode
  /**
   * Set when the event is a notification Cami sent on the merchant's behalf.
   * This is the answer to "are the messages linked to the appointment activity
   * screen" — a send is one more thing that happened to this appointment, so it
   * belongs in this timeline rather than in a separate messages view.
   * Spec: docs/specs/notifications-sender-id-and-rates.md
   */
  notification?: {
    channel: NotificationChannel
    status: NotificationStatus
    /** Recipient as addressed — phone for SMS/WhatsApp, address for Email. */
    recipient: string
    failureReason?: string
  }
}

const NOTIFICATION_ICON: Record<NotificationChannel, typeof MailIcon> = {
  email: MailIcon,
  sms: MessageSquareIcon,
  whatsapp: MessageCircleIcon,
}

const NOTIFICATION_STATUS: Record<NotificationStatus, { label: string; className: string }> = {
  queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", className: "bg-cami-violet-3 text-cami-violet-11" },
  delivered: { label: "Delivered", className: "bg-cami-green-3 text-cami-green-11" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
}

function ActivityPanel({ events, onBack }: { events: ActivityEvent[]; onBack: () => void }) {
  return (
    <>
      <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeftIcon />
          Back
        </Button>
      </header>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-sand-2 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-tight text-foreground">
          Appointment activity
        </h2>

        <ol className="flex flex-col">
          {events.map((event, i) => {
            const isLast = i === events.length - 1
            const notification = event.notification
            const ChannelIcon = notification ? NOTIFICATION_ICON[notification.channel] : null
            const status = notification ? NOTIFICATION_STATUS[notification.status] : null
            const failed = notification?.status === "failed"
            return (
              <li key={event.id} className="grid grid-cols-[16px_minmax(0,1fr)] gap-3">
                <div className="relative flex justify-center">
                  {!isLast ? (
                    <div className="absolute inset-y-0 top-3 border-l border-dashed border-border" />
                  ) : null}
                  {/* A notification carries its channel on the dot — it's what
                      separates two otherwise identical reminder rows. */}
                  {ChannelIcon ? (
                    <div className="relative mt-2 flex size-4 shrink-0 items-center justify-center rounded-full bg-sand-2 text-muted-foreground">
                      <ChannelIcon className="size-3" aria-hidden />
                    </div>
                  ) : (
                    <div className="relative mt-3 size-2 shrink-0 rounded-full bg-foreground/40" />
                  )}
                </div>
                <div
                  className={cn(
                    "rounded-2xl border border-border/60 bg-card p-4",
                    // A failed send is the only activity event that tints: it's
                    // the only one that means the customer heard nothing.
                    failed && "border-destructive/30 bg-destructive/5",
                    !isLast && "mb-4",
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{event.title}</span>
                      {status ? (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp}
                      {notification ? ` · to ${notification.recipient}` : ""}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-foreground">{event.body}</p>
                  {notification?.failureReason ? (
                    <p className="mt-2 text-xs font-medium text-destructive">
                      {notification.failureReason}
                    </p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>

        <p className="text-xs text-muted-foreground">
          Activity for this appointment in the last 12 months
        </p>
      </div>
    </>
  )
}

// ─── Main sheet ───────────────────────────────────────────────────────────────

type AppointmentDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: MockBooking | null
  staff: MockStaff[]
  /** Fired when "View profile" in the Client card is clicked. */
  onViewProfile?: () => void
  /** Fired when "View sale" in the Quick actions popover is clicked. */
  onViewSale?: () => void
}

type SheetMode = "detail" | "activity"

export function AppointmentDetailSheet({
  open,
  onOpenChange,
  booking,
  staff,
  onViewProfile,
  onViewSale,
}: AppointmentDetailSheetProps) {
  const [status, setStatus] = useState<MockBookingStatus>(booking?.status ?? "booked")
  const [mode, setMode] = useState<SheetMode>("detail")
  // Read above the `!booking` early return — hooks can't sit behind it.
  const { log: notificationLog } = useNotifications()
  // Selecting "Canceled" opens a full-screen confirmation flow rather than
  // flipping the status outright; the status only changes once confirmed.
  const [cancelOpen, setCancelOpen] = useState(false)

  // Re-sync local status when a new booking is opened. Reset mode so the next
  // open lands on the detail view rather than the activity slide-in.
  useEffect(() => {
    if (booking) {
      setStatus(booking.status)
      setMode("detail")
    }
  }, [booking])

  if (!booking) return null

  // Demo activity events — matches the figma so the slide-in has something to show.
  //
  // The notification rows come from the same store the Settings > Notifications
  // log reads, so the two surfaces can't disagree about what was sent. Filtered
  // by this booking's id, so an appointment with no sends shows none rather than
  // borrowing another booking's messages. Bookings b-002 … b-005 carry demo
  // sends; every other appointment's timeline is correctly notification-free.
  const notificationEvents: ActivityEvent[] = logForAppointment(notificationLog, booking.id).map(
    (entry) => ({
      id: entry.id,
      title: `${eventLabel(entry.event)} · ${CHANNEL_LABEL[entry.channel]}`,
      timestamp: entry.sentAt,
      body: entry.body,
      notification: {
        channel: entry.channel,
        status: entry.status,
        recipient: entry.recipient,
        failureReason: entry.failureReason,
      },
    }),
  )

  const activityEvents: ActivityEvent[] = [
    ...notificationEvents,
    {
      id: "sale-created",
      title: "Sale created",
      timestamp: "May 22, 2026, 10:33 AM",
      body: (
        <>
          Checked out by Hussain with{" "}
          <button type="button" className="text-cami-violet-11 hover:underline">
            sale receipt 2
          </button>
        </>
      ),
    },
    {
      id: "appointment-created",
      title: "Appointment created",
      timestamp: "May 22, 2026, 10:32 AM",
      body: "Booked by Hussain, reference 641E6833",
    },
  ]

  const theme = STATUS_THEME[status]
  const iso = isoOfAnchor(booking.dayOffset)
  const dateLabel = formatHeaderDate(iso)
  const timeLabel = formatTime(booking.start)
  const recurrence = booking.recurrence ?? "doesn't repeat"
  const staffName = staff.find((s) => s.id === booking.staffId)?.name ?? "—"

  // Footer + sale-total labels switch on terminal-vs-active statuses:
  //   - terminal (cancelled / completed / no-show): wide "Done" button + "To pay"
  //   - active   (booked / confirmed / arrived / started): Pay now + Complete now + "Sale total"
  const isTerminal = status === "cancelled" || status === "completed" || status === "no-show"
  const totalLabel = isTerminal ? "To pay" : "Sale total"

  const total = booking.priceMinor
  const totals: AppointmentTotals = {
    subtotal: total,
    tax: 0,
    total,
    cashPaid: 1100,
  }

  const client: ClientSnapshot = {
    id: booking.clientName.toLowerCase().replace(/\s+/g, "-"),
    name: booking.clientName,
    email: `${booking.clientName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
    phone: booking.clientPhone,
    unpaidMinor: 3900,
    isFirstVisit: booking.isFirstVisit ?? true,
    extraTags: ["Senior"],
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="flex w-120 max-w-120 flex-col gap-0 overflow-hidden p-0 sm:max-w-120"
        >
          <SheetTitle className="sr-only">Appointment for {client.name}</SheetTitle>
          <SheetDescription className="sr-only">
            {dateLabel} at {timeLabel} — {booking.serviceName}
          </SheetDescription>

          {mode === "activity" ? (
            <ActivityPanel events={activityEvents} onBack={() => setMode("detail")} />
          ) : (
            <>
              {/* Close row (only the close button — quick actions live in the footer to match the figma) */}
              <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
                <SheetClose asChild>
                  <Button type="button" variant="ghost" size="icon-sm" aria-label="Close">
                    <ChevronsRightIcon />
                  </Button>
                </SheetClose>
              </header>

              {/* Status-colored hero header (matches new-appointment-sheet padding: px-6 py-7) */}
              <header
                data-slot="appointment-sheet-header"
                className={cn("flex items-center gap-3 px-6 py-7", theme.fill, theme.text)}
              >
                <DateAvatarCard date={iso} />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="self-start truncate text-[22px] leading-7 font-semibold tracking-tight">
                    {dateLabel}
                  </span>
                  <div className={cn("text-xs leading-4", theme.subText)}>
                    <span className="font-medium">{timeLabel}</span>
                    <span aria-hidden>, </span>
                    <span>{recurrence}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusPill
                    status={status}
                    onChange={(next) => {
                      if (next === "cancelled") {
                        setCancelOpen(true)
                        return
                      }
                      setStatus(next)
                    }}
                  />
                </div>
              </header>

              {/* Scrollable body — same bg-sand-2, padding (gap-6 px-6 py-5), and section h2 style as new-appointment-sheet */}
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-sand-2 px-6 py-5">
                <ClientCard client={client} onViewProfile={onViewProfile} />
                <ServicesSection booking={booking} staffName={staffName} />
                <SaleTotalSection totals={totals} label={totalLabel} />
              </div>

              {/* Footer — vertical dots on the left, status-keyed actions on the right
                (mirrors new-appointment-sheet footer dimensions: border-t border-border bg-card px-6 py-4) */}
              <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
                <QuickActionsMenu
                  onViewActivity={() => setMode("activity")}
                  onViewSale={onViewSale}
                />
                {isTerminal ? (
                  <Button type="button" variant="outline" radius="full" className="flex-1">
                    Done
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" radius="full">
                      Pay now
                    </Button>
                    <Button type="button" radius="full">
                      Complete now
                    </Button>
                  </div>
                )}
              </footer>
            </>
          )}
        </SheetContent>
      </Sheet>

      <CancelAppointmentDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        totalMinor={booking.priceMinor}
        onConfirm={() => setStatus("cancelled")}
      />
    </>
  )
}
