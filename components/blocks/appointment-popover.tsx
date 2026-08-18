"use client"

import {
  AlertTriangleIcon,
  ArrowRightToLineIcon,
  BellRingIcon,
  CheckIcon,
  ChevronDownIcon,
  Clock3Icon,
  CreditCardIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  type LucideIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PhoneIcon,
  PlusIcon,
  RepeatIcon,
  ThumbsUpIcon,
  XIcon,
} from "lucide-react"
import { useState } from "react"

import {
  formatAed,
  formatTimeRange,
  type MockBooking,
  type MockBookingStatus,
} from "@/app/appointments/mock"
import { AppointmentBlock } from "@/components/blocks/appointment-block"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { formatPetNotes, petNoteLabel } from "@/lib/pet-notes"
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
  const secondaryLine = showsPet ? `Owner · ${booking.clientName}` : booking.clientPhone
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
      </div>
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

type ServiceRowProps = {
  serviceName: string
  durationMin: number
  priceMinor: number
  staffName?: string
  startTime?: string
}

function ServiceRow({
  serviceName,
  durationMin,
  priceMinor,
  staffName,
  startTime,
}: ServiceRowProps) {
  return (
    <div data-slot="appointment-service-row" className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-medium">{serviceName}</div>
        <div className="truncate text-[10px] text-muted-foreground">
          {startTime ? `${startTime} · ` : null}
          {durationMin} mins
          {staffName ? ` · ${staffName}` : null}
        </div>
      </div>
      <div className="shrink-0 text-[11px] font-medium tabular-nums">{formatAed(priceMinor)}</div>
    </div>
  )
}

type AgreementBannerProps = {
  onCheckDetails?: () => void
  onDismiss?: () => void
}

function AgreementBanner({ onCheckDetails, onDismiss }: AgreementBannerProps) {
  return (
    <div
      data-slot="agreement-banner"
      className="flex items-center justify-between gap-2 border-cami-pink-7 border-b bg-cami-pink-2 px-3 py-1.5 text-[11px] text-cami-pink-12"
    >
      <div className="flex items-center gap-1.5">
        <AlertTriangleIcon className="size-3" aria-hidden />
        <span>
          Agreement hasn't been signed.{" "}
          <button
            type="button"
            className="cursor-pointer font-medium underline"
            onClick={onCheckDetails}
          >
            Check details
          </button>
        </span>
      </div>
      <button
        type="button"
        className="text-cami-pink-11 hover:text-cami-pink-12"
        onClick={onDismiss}
        aria-label="Dismiss agreement banner"
      >
        <XIcon className="size-3" aria-hidden />
      </button>
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
  return (
    <div
      data-slot="appointment-quick-panel"
      className={cn(
        "flex w-[280px] flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-overlay",
        className,
      )}
    >
      <StatusHeaderBar
        status={booking.status}
        start={booking.start}
        durationMin={booking.durationMin}
      />
      <div className="flex flex-col gap-2 p-3">
        <IdentityBlock booking={booking} hasPets={hasPets} compact />
        <TagRow booking={booking} />
        {booking.hasSafetyFlag ? <StaffAlertBlock message="Behavior flag on file" /> : null}
        <Separator />
        <ServiceRow
          serviceName={booking.serviceName}
          durationMin={booking.durationMin}
          priceMinor={booking.priceMinor}
        />
        {booking.petNotes?.length ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground italic">
            {formatPetNotes(booking.petNotes)}
          </p>
        ) : null}
        {booking.notes ? (
          <p className="line-clamp-1 text-[11px] text-muted-foreground italic">{booking.notes}</p>
        ) : null}
        {booking.needsPickup ? (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <MapPinIcon className="size-2.5 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">
              Pet address
              {booking.pickupAddress ? ` · ${booking.pickupAddress}` : null}
            </span>
          </div>
        ) : null}
        {booking.hasDeposit ? (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <CreditCardIcon className="size-2.5" aria-hidden />
            Deposit paid
            {booking.depositAmountMinor ? ` · ${formatAed(booking.depositAmountMinor)}` : null}
          </div>
        ) : null}
        <div className="flex items-center justify-end pt-1 text-[10px] text-muted-foreground">
          Click for details
          <ExternalLinkIcon className="ml-1 size-2.5" aria-hidden />
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Detail Panel (click)
// Sub-drawers (activity log, edit repeating, payment policy) and the
// Comments & Notes 3-tab split are stubbed for this slice — the structural
// shell is complete; sub-features land in follow-up passes.
// ─────────────────────────────────────────────────────────────────────────

type AppointmentDetailPanelProps = {
  booking: MockBooking
  hasPets?: boolean
  onClose?: () => void
  className?: string
}

export function AppointmentDetailPanel({
  booking,
  hasPets = true,
  onClose,
  className,
}: AppointmentDetailPanelProps) {
  const [agreementBannerOpen, setAgreementBannerOpen] = useState(true)
  const meta = STATUS_META[booking.status]
  const showAgreement = hasPets && booking.agreementSigned === false && agreementBannerOpen

  return (
    <div
      data-slot="appointment-detail-panel"
      className={cn(
        "flex w-[380px] flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-overlay",
        className,
      )}
    >
      <StatusHeaderBar
        status={booking.status}
        start={booking.start}
        durationMin={booking.durationMin}
        interactive
      />
      {booking.bookingRef ? (
        <div className="px-3 pt-1.5 text-[10px] text-muted-foreground">
          Booking #{booking.bookingRef}
        </div>
      ) : null}
      {showAgreement ? <AgreementBanner onDismiss={() => setAgreementBannerOpen(false)} /> : null}
      <div className="flex flex-col gap-3 p-3">
        <IdentityBlock booking={booking} hasPets={hasPets} />
        <TagRow booking={booking} withAddTag />
        {booking.hasSafetyFlag ? (
          <StaffAlertBlock
            message="Behavior flag on file"
            note="Pet flagged for reactivity; review intake before service."
          />
        ) : null}

        <Separator />

        <section data-slot="services-section" className="flex flex-col gap-2">
          {hasPets && booking.petName ? (
            <PetCardHeader booking={booking} />
          ) : (
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Services
            </div>
          )}
          <ServiceRow
            serviceName={booking.serviceName}
            durationMin={booking.durationMin}
            priceMinor={booking.priceMinor}
            startTime={booking.start}
          />
          <button
            type="button"
            className="self-start text-[11px] text-muted-foreground hover:text-foreground"
          >
            + Add service
          </button>
        </section>

        {booking.petNotes?.length ? (
          <section data-slot="pet-notes-section" className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Pet notes
            </div>
            <ul className="flex flex-col gap-1 rounded-md bg-muted px-2 py-1.5 text-[11px]">
              {booking.petNotes.map((note) => (
                <li key={note.category}>
                  <span className="font-medium">{petNoteLabel(note.category)}:</span> {note.detail}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {booking.notes ? (
          <section data-slot="notes-section" className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Notes
            </div>
            <p className="rounded-md bg-cami-yellow-2 px-2 py-1.5 text-[11px]">{booking.notes}</p>
          </section>
        ) : null}

        {booking.needsPickup ? (
          <section data-slot="pickup-section" className="flex flex-col gap-1">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Your Pet Address
            </div>
            <div className="flex items-start gap-1.5 rounded-md bg-cami-sage-2 px-2 py-1.5 text-[11px] text-cami-sage-12">
              <MapPinIcon className="mt-px size-3 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">
                {booking.pickupAddress ?? "No pet address on file"}
              </span>
            </div>
          </section>
        ) : null}

        <section data-slot="payment-section" className="flex flex-col gap-1">
          {booking.hasDeposit ? (
            <div className="flex items-center gap-1.5 text-[11px]">
              <CreditCardIcon className="size-3 text-muted-foreground" aria-hidden />
              <span>
                Deposit paid
                {booking.depositAmountMinor ? ` · ${formatAed(booking.depositAmountMinor)}` : null}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium tabular-nums">{formatAed(booking.priceMinor)}</span>
          </div>
        </section>

        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {booking.isRecurring ? (
            <>
              <RepeatIcon className="size-3" aria-hidden />
              Repeats
            </>
          ) : (
            "Doesn't repeat"
          )}
          {booking.groomingFrequency ? <span>· every {booking.groomingFrequency}</span> : null}
        </div>
      </div>

      <Separator />

      <footer
        data-slot="appointment-detail-actions"
        className="flex items-center gap-2 bg-card px-3 py-2"
      >
        <Button variant="ghost" size="icon" aria-label="More actions">
          <MoreHorizontalIcon className="size-4" aria-hidden />
        </Button>
        {meta.forwardActionLabel ? (
          <Button variant="default" size="sm" className="flex-1">
            {meta.forwardActionLabel}
          </Button>
        ) : (
          <span className="flex-1 text-center text-[11px] text-muted-foreground">
            Booking complete
          </span>
        )}
        {onClose ? (
          <Button variant="ghost" size="icon" aria-label="Close" onClick={onClose}>
            <XIcon className="size-4" aria-hidden />
          </Button>
        ) : null}
      </footer>
    </div>
  )
}

function PetCardHeader({ booking }: { booking: MockBooking }) {
  return (
    <div data-slot="pet-card-header" className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Avatar
          name={booking.petName ?? ""}
          fallback="species"
          species={booking.petSpecies}
          size="md"
        />
        <div className="flex flex-1 flex-col">
          <div className="text-[12px] font-semibold leading-tight">{booking.petName}</div>
          {(booking.petBreed || booking.petWeight || booking.petCoat) && (
            <div className="text-[10px] text-muted-foreground leading-tight">
              {[
                booking.petBreed,
                booking.petWeight,
                booking.petCoat,
                booking.petSpayed ? "Spayed" : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {booking.intakeFormSubmitted ? (
            <Badge variant="muted" size="sm" title="Intake form signed">
              Intake
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Wrapper: orchestrates HoverCard (Quick) + Popover (Detail) around the block
// ─────────────────────────────────────────────────────────────────────────

type AppointmentBlockPopoverProps = {
  booking: MockBooking
  top: number
  height: number
  hasPets?: boolean
}

export function AppointmentBlockPopover({
  booking,
  top,
  height,
  hasPets = true,
}: AppointmentBlockPopoverProps) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <Popover open={detailOpen} onOpenChange={setDetailOpen}>
      <HoverCard openDelay={200} closeDelay={120}>
        <PopoverAnchor asChild>
          <HoverCardTrigger asChild>
            <AppointmentBlock
              booking={booking}
              top={top}
              height={height}
              hasPets={hasPets}
              onClick={() => setDetailOpen(true)}
            />
          </HoverCardTrigger>
        </PopoverAnchor>
        {/* HoverCard suppresses itself while the detail popover is open so they don't stack */}
        {detailOpen ? null : (
          <HoverCardContent
            side="right"
            align="start"
            sideOffset={8}
            className="w-auto border-none bg-transparent p-0 shadow-none"
          >
            <AppointmentQuickPanel booking={booking} hasPets={hasPets} />
          </HoverCardContent>
        )}
      </HoverCard>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-auto border-none bg-transparent p-0 shadow-none"
      >
        <AppointmentDetailPanel
          booking={booking}
          hasPets={hasPets}
          onClose={() => setDetailOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
