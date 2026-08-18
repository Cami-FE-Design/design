"use client"

import {
  CarFrontIcon,
  CreditCardIcon,
  type LucideIcon,
  RotateCwIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react"

import {
  formatAed,
  formatTimeRange,
  type MockBooking,
  type MockBookingStatus,
  type MockServiceCategory,
} from "@/app/appointments/mock"
import { cn } from "@/lib/utils"

type CategoryStyle = {
  fill: string
  border: string
  title: string
  subtle: string
  chip: string
}

const CATEGORY_STYLES: Record<MockServiceCategory, CategoryStyle> = {
  grooming: {
    fill: "bg-cami-violet-3",
    border: "border-cami-violet-6",
    title: "text-cami-violet-12",
    subtle: "text-cami-violet-11",
    chip: "bg-cami-violet-4 text-cami-violet-12",
  },
  vet: {
    fill: "bg-cami-green-3",
    border: "border-cami-green-6",
    title: "text-cami-green-12",
    subtle: "text-cami-green-11",
    chip: "bg-cami-green-4 text-cami-green-12",
  },
  daycare: {
    fill: "bg-cami-sage-3",
    border: "border-cami-sage-6",
    title: "text-cami-sage-12",
    subtle: "text-cami-sage-11",
    chip: "bg-cami-sage-4 text-cami-sage-12",
  },
  boarding: {
    fill: "bg-cami-yellow-3",
    border: "border-cami-yellow-6",
    title: "text-cami-yellow-12",
    subtle: "text-cami-yellow-11",
    chip: "bg-cami-yellow-4 text-cami-yellow-12",
  },
  details: {
    fill: "bg-cami-pink-3",
    border: "border-cami-pink-6",
    title: "text-cami-pink-12",
    subtle: "text-cami-pink-11",
    chip: "bg-cami-pink-4 text-cami-pink-12",
  },
  welcome: {
    fill: "bg-cami-gray-3",
    border: "border-cami-gray-6",
    title: "text-cami-gray-12",
    subtle: "text-cami-gray-11",
    chip: "bg-cami-gray-4 text-cami-gray-12",
  },
}

type StatusModifier = {
  border?: string
  fill?: string
  title?: string
  subtle?: string
  ring?: string
  opacity?: string
  decoration?: string
}

// Status ring/border colors reference cami yellow + pink as fallbacks for amber + tomato
// until those scales land in globals.css. Per status palette spec: ready-for-pickup → amber,
// no-show → tomato.
const STATUS_MODIFIERS: Record<MockBookingStatus, StatusModifier> = {
  booked: { border: "border-dashed" },
  confirmed: {},
  "checked-in": { fill: "saturate-150" },
  "ready-for-pickup": { fill: "saturate-150", ring: "ring-2 ring-cami-yellow-7/40" },
  completed: { opacity: "opacity-60" },
  cancelled: { opacity: "opacity-50", decoration: "line-through" },
  "no-show": { ring: "ring-2 ring-cami-pink-9/60" },
}

type AppointmentBlockProps = {
  booking: MockBooking
  /** px height computed from durationMin × pxPerMin in the parent grid. */
  height: number
  /** px top offset computed from start time in the parent grid. */
  top: number
  hasPets?: boolean
  onClick?: (booking: MockBooking) => void
  className?: string
}

export function AppointmentBlock({
  booking,
  height,
  top,
  hasPets = true,
  onClick,
  className,
}: AppointmentBlockProps) {
  const style = CATEGORY_STYLES[booking.serviceCategory]
  const status = STATUS_MODIFIERS[booking.status]

  const titleText = hasPets && booking.petName ? booking.petName : booking.clientName
  const subtitleText = hasPets && booking.petName ? booking.clientName : undefined

  const tight = height <= 28
  const compact = height <= 56

  return (
    <button
      type="button"
      data-slot="appointment-block"
      data-status={booking.status}
      data-category={booking.serviceCategory}
      onClick={() => onClick?.(booking)}
      className={cn(
        "absolute left-px right-px overflow-hidden rounded-md border text-left",
        "transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        style.fill,
        style.border,
        status.border,
        status.fill,
        status.ring,
        status.opacity,
        className,
      )}
      style={{ top, height }}
    >
      <div
        className={cn(
          "flex h-full flex-col gap-0.5",
          tight ? "px-1.5 py-0.5" : compact ? "px-2 py-1" : "px-2 py-1.5",
        )}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="flex min-w-0 flex-1 items-baseline gap-1">
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] tabular-nums leading-none",
                style.subtle,
              )}
            >
              {tight ? booking.start : formatTimeRange(booking.start, booking.durationMin)}
            </span>
            {tight ? (
              <span
                className={cn(
                  "min-w-0 truncate text-[11px] font-semibold leading-none",
                  style.title,
                  status.decoration,
                )}
              >
                {titleText}
              </span>
            ) : null}
          </div>
          {booking.priceMinor > 0 ? (
            <span
              className={cn(
                "shrink-0 rounded-sm px-1 text-[9px] font-semibold leading-tight",
                style.chip,
              )}
            >
              {formatAed(booking.priceMinor)}
            </span>
          ) : null}
        </div>
        {!tight ? (
          <div
            className={cn(
              "min-w-0 truncate text-[12px] font-semibold leading-tight",
              style.title,
              status.decoration,
            )}
          >
            {titleText}
            {subtitleText ? (
              <span className={cn("ml-1 font-normal", style.subtle)}>· {subtitleText}</span>
            ) : null}
          </div>
        ) : null}
        {!compact ? (
          <div className={cn("min-w-0 flex-1 truncate text-[11px] leading-tight", style.subtle)}>
            {booking.serviceName}
          </div>
        ) : null}
        <BlockIconRow booking={booking} subtleClass={style.subtle} tight={tight} />
      </div>
    </button>
  )
}

type BlockIconRowProps = {
  booking: MockBooking
  subtleClass: string
  tight: boolean
}

function BlockIconRow({ booking, subtleClass, tight }: BlockIconRowProps) {
  const icons: { key: string; Icon: LucideIcon }[] = []
  if (booking.hasDeposit) icons.push({ key: "deposit", Icon: CreditCardIcon })
  if (booking.isRecurring) icons.push({ key: "recurring", Icon: RotateCwIcon })
  if (booking.linkCount && booking.linkCount > 0) icons.push({ key: "links", Icon: UsersIcon })
  if (booking.hasSafetyFlag) icons.push({ key: "safety", Icon: ShieldAlertIcon })
  if (icons.length === 0 && !booking.needsPickup) return null
  return (
    <div
      className={cn(
        "mt-auto flex items-center gap-1",
        subtleClass,
        tight ? "absolute right-1 top-0.5" : "",
      )}
    >
      {/* Pickup leads the row as a filled chip, not another hairline glyph: it's
          the one flag staff must act on before the appointment, and a muted
          10px icon disappears among the passive deposit / recurring marks. */}
      {booking.needsPickup ? (
        <span
          title="Pet Address"
          className="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-cami-sage-9 text-white"
        >
          <CarFrontIcon className="size-2.5" aria-hidden />
          <span className="sr-only">Pet Address</span>
        </span>
      ) : null}
      {icons.map(({ key, Icon }) => (
        <Icon key={key} className="size-2.5" aria-hidden />
      ))}
    </div>
  )
}
