"use client"

import {
  AlertTriangleIcon,
  ArrowRightToLineIcon,
  BellRingIcon,
  CheckIcon,
  ChevronDownIcon,
  Clock3Icon,
  EyeOffIcon,
  FileTextIcon,
  type LucideIcon,
  MapPinIcon,
  PhoneIcon,
  PlusIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react"

import {
  clientIdOf,
  EXTRA_TIME_LABEL,
  formatAed,
  formatTimeRange,
  type MockBooking,
  type MockBookingStatus,
  type MockServiceItem,
  serviceItemsOf,
} from "@/app/appointments/mock"
import { AppointmentBlock } from "@/components/blocks/appointment-block"
import { ClientNoteBanner } from "@/components/blocks/client-note-banner"
import { NavigateToAddress } from "@/components/blocks/navigate-to-address"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { formatPetNotes } from "@/lib/pet-notes"
import { cn } from "@/lib/utils"

// Status metadata. Tailwind classes use the closest available cami- token
// since the full status palette (blue/lime/teal/amber/olive/tomato) is not
// yet wired in globals.css. Intent column documents the design-spec target.
type StatusMeta = {
  label: string
  Icon: LucideIcon
  // Status header bar background + foreground (saturated pill on the popover top)
  fill: string
  foreground: string
  // Border / accent (used for dashed border on booked, ring on no-show)
  accent?: string
  // Primary forward action button label (varies by status, see spec)
  forwardActionLabel?: string
}

const STATUS_META: Record<MockBookingStatus, StatusMeta> = {
  // intent: blue/5 + blue/12 + dashed blue/11
  booked: {
    label: "Booked",
    Icon: Clock3Icon,
    fill: "bg-cami-gray-3",
    foreground: "text-cami-gray-12",
    accent: "border-dashed border-cami-gray-8",
    forwardActionLabel: "Confirm",
  },
  // intent: lime/5 + lime/12 + lime/11
  confirmed: {
    label: "Confirmed",
    Icon: ThumbsUpIcon,
    fill: "bg-cami-green-3",
    foreground: "text-cami-green-12",
    forwardActionLabel: "Check in",
  },
  // intent: teal/5 + teal/12 + teal/11
  "checked-in": {
    label: "Arrived",
    Icon: ArrowRightToLineIcon,
    fill: "bg-cami-sage-3",
    foreground: "text-cami-sage-12",
    forwardActionLabel: "Mark as ready",
  },
  // intent: amber/5 + amber/12 + amber/11
  "ready-for-pickup": {
    label: "Started",
    Icon: BellRingIcon,
    fill: "bg-cami-yellow-3",
    foreground: "text-cami-yellow-12",
    forwardActionLabel: "Check out",
  },
  // intent: gray/6 + gray/12 + gray/11
  completed: {
    label: "Completed",
    Icon: CheckIcon,
    fill: "bg-cami-gray-4",
    foreground: "text-cami-gray-12",
  },
  // intent: olive/5 + olive/12 + olive/11
  cancelled: {
    label: "Canceled",
    Icon: XIcon,
    fill: "bg-cami-gray-3",
    foreground: "text-cami-gray-11",
    forwardActionLabel: "Rebook",
  },
  // intent: tomato/8 + tomato/12 + tomato/11
  "no-show": {
    label: "No-show",
    Icon: EyeOffIcon,
    fill: "bg-cami-pink-3",
    foreground: "text-cami-pink-12",
    forwardActionLabel: "Rebook",
  },
}

// ─────────────────────────────────────────────────────────────────────────
// Shared building blocks
// ─────────────────────────────────────────────────────────────────────────

type StatusHeaderBarProps = {
  status: MockBookingStatus
  start: string
  durationMin: number
  interactive?: boolean
  className?: string
}

function StatusHeaderBar({
  status,
  start,
  durationMin,
  interactive = false,
  className,
}: StatusHeaderBarProps) {
  const meta = STATUS_META[status]
  const { Icon } = meta
  return (
    <div
      data-slot="appointment-status-bar"
      data-status={status}
      className={cn(
        "flex items-center justify-between gap-2 rounded-t-xl border-b px-3 py-2",
        meta.fill,
        meta.foreground,
        meta.accent,
        className,
      )}
    >
      <span className="font-mono text-[11px] tabular-nums">
        {formatTimeRange(start, durationMin)}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px] font-medium",
          interactive && "cursor-pointer rounded-full px-1.5 py-0.5 hover:bg-black/5",
        )}
      >
        <Icon className="size-3" aria-hidden />
        {meta.label}
        {interactive ? <ChevronDownIcon className="size-3" aria-hidden /> : null}
      </span>
    </div>
  )
}

type IdentityBlockProps = {
  booking: MockBooking
  hasPets: boolean
  compact?: boolean
}

function IdentityBlock({ booking, hasPets, compact = false }: IdentityBlockProps) {
  const showsPet = hasPets && booking.petName
  const primaryName = showsPet ? booking.petName! : booking.clientName
  // Pet first, owner beneath — the same resolution the as-built EventDetailPopup
  // uses (`titleName = petName ?? clientLabel`). The "Owner ·" prefix stays
  // because this panel also shows a phone number, and an unlabelled second name
  // above a phone reads as the phone's owner.
  const secondaryLine = showsPet ? `Owner · ${booking.clientName}` : booking.clientPhone
  // Pet facts and the intake badge used to live in a second identity card that
  // opened the services group. That card restated the pet the panel had already
  // introduced, and once client notes and the pet address landed between the
  // two, the repeat read as a stray fragment. The as-built popup shows the
  // identity exactly once, so this one absorbed what the card was carrying.
  const petFacts = showsPet
    ? [booking.petBreed, booking.petWeight, booking.petCoat, booking.petSpayed ? "Spayed" : null]
        .filter(Boolean)
        .join(" · ")
    : ""
  return (
    <div data-slot="appointment-identity" className="flex items-center gap-2.5">
      <Avatar
        name={primaryName}
        fallback={showsPet ? "species" : "character"}
        species={booking.petSpecies}
        size={compact ? "md" : "lg"}
        shape={showsPet ? "circle" : "circle"}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold leading-tight">{primaryName}</div>
        {secondaryLine ? (
          <div className="truncate text-[11px] text-muted-foreground leading-tight">
            {secondaryLine}
          </div>
        ) : null}
        {!compact && booking.clientPhone && showsPet ? (
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <PhoneIcon className="size-2.5" aria-hidden />
            {booking.clientPhone}
          </div>
        ) : null}
        {!compact && petFacts ? (
          <div className="truncate text-[10px] leading-tight text-muted-foreground">{petFacts}</div>
        ) : null}
      </div>
      {!compact && booking.intakeFormSubmitted ? (
        <Badge variant="muted" size="sm" title="Intake form signed" className="shrink-0">
          Intake
        </Badge>
      ) : null}
    </div>
  )
}

type TagRowProps = {
  booking: MockBooking
  withAddTag?: boolean
}

function TagRow({ booking, withAddTag = false }: TagRowProps) {
  const pills = booking.relationshipPills ?? []
  const tags = booking.tags ?? []
  if (pills.length === 0 && tags.length === 0 && !withAddTag) return null
  return (
    <div data-slot="appointment-tag-row" className="flex flex-wrap gap-1">
      {pills.map((pill) => (
        <Badge key={pill} variant="primary-soft" size="sm">
          {pill}
        </Badge>
      ))}
      {tags.map((tag) => (
        <Badge key={tag} variant="outline" size="sm">
          {tag}
        </Badge>
      ))}
      {withAddTag ? (
        <Badge variant="outline" size="sm" className="cursor-pointer border-dashed">
          <PlusIcon className="size-2.5" aria-hidden />
          Add tag
        </Badge>
      ) : null}
    </div>
  )
}

type StaffAlertBlockProps = {
  message: string
  note?: string
}

function StaffAlertBlock({ message, note }: StaffAlertBlockProps) {
  return (
    <div
      data-slot="appointment-staff-alert"
      className="flex gap-2 rounded-md border-l-2 border-cami-yellow-8 bg-cami-yellow-2 p-2"
    >
      <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0 text-cami-yellow-11" aria-hidden />
      <div className="min-w-0 flex-1 text-[11px]">
        <div className="font-semibold uppercase tracking-wide text-cami-yellow-12">{message}</div>
        {note ? (
          <div className="mt-1 rounded bg-cami-yellow-3 px-1.5 py-0.5 text-cami-yellow-12">
            {note}
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * One service on the booking, with everything that makes it different from its
 * siblings: who performs it, how long it runs, what it costs, the duration
 * modifiers that stretch the appointment past the sum of its services, and the
 * membership chip when a session is being drawn down rather than charged.
 *
 * Mirrors the as-built row in EventDetailPopup. A covered item prints a net of
 * zero with the gross struck through — the price is not simply hidden, because
 * "free" and "already paid for" are different facts at the counter.
 */
function ServiceItemRow({ item }: { item: MockServiceItem }) {
  const meta = [`${item.durationMin} mins`, item.staffName].filter(Boolean).join(" · ")
  const covered = Boolean(item.membership)
  return (
    <div data-slot="appointment-service-item" className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-medium">{item.name}</div>
          {meta ? <div className="truncate text-[10px] text-muted-foreground">{meta}</div> : null}
        </div>
        <div className="flex shrink-0 flex-col items-end leading-tight tabular-nums">
          <span className="text-[11px] font-medium">
            {formatAed(covered ? 0 : item.priceMinor)}
          </span>
          {item.membership ? (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatAed(item.membership.grossPriceMinor)}
            </span>
          ) : null}
        </div>
      </div>
      {item.membership ? (
        <Badge variant="primary-soft" size="sm" className="w-fit">
          {item.membership.label}
        </Badge>
      ) : null}
      {item.extraTimes?.length ? (
        <div className="flex flex-wrap gap-1">
          {item.extraTimes.map((extra) => (
            <Badge key={extra.type} variant="outline" size="sm">
              +{extra.durationMin}min {EXTRA_TIME_LABEL[extra.type]}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Quick Panel (hover)
// ─────────────────────────────────────────────────────────────────────────

type AppointmentQuickPanelProps = {
  booking: MockBooking
  hasPets?: boolean
  className?: string
}

export function AppointmentQuickPanel({
  booking,
  hasPets = true,
  className,
}: AppointmentQuickPanelProps) {
  const serviceItems = serviceItemsOf(booking)
  // Membership-covered items settle at zero, so the footer total is what is
  // actually payable rather than the sum of the list prices above it.
  const total = serviceItems.reduce((sum, item) => sum + (item.membership ? 0 : item.priceMinor), 0)
  return (
    <div
      data-slot="appointment-quick-panel"
      className={cn(
        // 320px, matching the as-built popup. 280 was sized for a card showing
        // one service; it cannot hold a service list without wrapping every
        // price onto its own line.
        //
        // No cap on the card: the services list below carries the scroll, so
        // the card's height is already bounded and nothing can be clipped
        // mid-line. See the note above this component.
        "flex w-[320px] flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-overlay",
        className,
      )}
    >
      {/* Status is read here and changed on the sheet — the as-built popup
          shows a flat label and keeps the dropdown for the drawer. */}
      <StatusHeaderBar
        status={booking.status}
        start={booking.start}
        durationMin={booking.durationMin}
        className="shrink-0"
      />
      <div className="flex flex-col gap-2.5 p-3">
        <IdentityBlock booking={booking} hasPets={hasPets} />
        <TagRow booking={booking} />
        {/* DZ-209 parity with cami-business: client notes sit directly under the
            client, compact on a glance surface. Above the staff alert, because
            the alert is one boolean and these are the actual context. */}
        <ClientNoteBanner compact clientId={clientIdOf(booking)} />
        {booking.hasSafetyFlag ? <StaffAlertBlock message="Behavior flag on file" /> : null}
        {/* With the client, not at the foot of the panel: this is where the
            appointment is, and it is read together with who it is for. Carries
            its own Navigate action (PRD-144) — a mobile groomer scanning the
            day should not have to open the sheet to get a route. */}
        {booking.needsPickup ? (
          <section data-slot="pickup-section" className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Your Pet Address
            </div>
            <div className="flex flex-col gap-1 rounded-md bg-cami-sage-2 px-2 py-1.5 text-[11px] text-cami-sage-12">
              <div className="flex items-start gap-1.5">
                <MapPinIcon className="mt-px size-3 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1">
                  {booking.pickupAddress ?? "No pet address on file"}
                </span>
              </div>
              <NavigateToAddress
                size="compact"
                address={booking.pickupAddress}
                place={booking.pickupPlace}
                className="pl-4.5"
              />
            </div>
          </section>
        ) : null}
        {booking.petNotes?.length ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground italic">
            {formatPetNotes(booking.petNotes)}
          </p>
        ) : null}

        <Separator />

        <section data-slot="services-section" className="flex flex-col gap-2">
          {/* The label stays outside the scroller — a heading that scrolls away
              leaves an unlabelled list of prices. */}
          <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Services
          </div>
          {/* 7.5rem holds two rows comfortably and scrolls from the third, which
              is where the list stops being glanceable. `pr-1` keeps the
              scrollbar off the prices. */}
          <div className="flex max-h-30 flex-col gap-2.5 overflow-y-auto pr-1">
            {serviceItems.map((item) => (
              <ServiceItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      </div>
      <footer
        data-slot="appointment-quick-footer"
        className="flex shrink-0 items-center justify-between gap-2 border-t border-border/60 bg-card px-3 py-2"
      >
        <span className="text-[12px] font-semibold text-foreground">
          {serviceItems.length} {serviceItems.length === 1 ? "service" : "services"}
        </span>
        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {formatAed(total)}
        </span>
      </footer>
      {/* THE LAST THING ON THE CARD. Service count above it, note below —
          that order is the requirement, and it is the order Fresha uses. The
          note is free text of unknown length, so anything placed after it
          moves by an unpredictable amount; the count and total are fixed-width
          facts and belong above it. Outside the scroll area, so it stays put
          while the services list scrolls. */}
      {booking.notes ? (
        <div
          data-slot="notes-section"
          className="flex shrink-0 items-start gap-1.5 border-t border-border/60 bg-cami-violet-2 px-3 py-2"
        >
          <p className="line-clamp-2 min-w-0 flex-1 text-[11px] leading-snug text-foreground">
            <span className="font-semibold">Note: </span>
            {booking.notes}
          </p>
          <FileTextIcon className="mt-px size-3 shrink-0 text-muted-foreground" aria-hidden />
        </div>
      ) : null}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Wrapper: hover shows the card, click opens the detail sheet the caller owns
// ─────────────────────────────────────────────────────────────────────────

type AppointmentBlockPopoverProps = {
  booking: MockBooking
  top: number
  height: number
  hasPets?: boolean
  /**
   * Clicking the block opens the appointment's detail sheet. The sheet is not
   * mounted here: one drawer per grid, owned by the grid, rather than one per
   * booking block — 26 mounted sheets is 26 copies of a form.
   */
  onOpenDetail?: (booking: MockBooking) => void
}

export function AppointmentBlockPopover({
  booking,
  top,
  height,
  hasPets = true,
  onOpenDetail,
}: AppointmentBlockPopoverProps) {
  return (
    <HoverCard openDelay={200} closeDelay={120}>
      <HoverCardTrigger asChild>
        <AppointmentBlock
          booking={booking}
          top={top}
          height={height}
          hasPets={hasPets}
          onClick={() => onOpenDetail?.(booking)}
        />
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-auto border-none bg-transparent p-0 shadow-none"
      >
        <AppointmentQuickPanel booking={booking} hasPets={hasPets} />
      </HoverCardContent>
    </HoverCard>
  )
}
