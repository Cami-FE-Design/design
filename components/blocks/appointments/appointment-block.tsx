"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { CARD_ICON } from "@/components/blocks/appointments/calendar-icons"
import {
  CARD_ICON_LABEL,
  type CardIconKey,
  cardIconsFor,
  fitCardIcons,
} from "@/lib/appointments/card-icons"
import {
  clientIdOf,
  formatTimeRange,
  type MockBooking,
  type MockBookingStatus,
} from "@/lib/appointments/mock"
import { clientNotesFor } from "@/lib/client-notes"
import { cn } from "@/lib/utils"

type CardStyle = {
  fill: string
  title: string
  subtle: string
  ring?: string
  opacity?: string
  decoration?: string
}

// Colour is the status, as in the built product: the same tones as the status
// badges in lists and sheets, a step louder for Started and No-show.
const STATUS_CARD: Record<MockBookingStatus, CardStyle> = {
  booked: {
    fill: "bg-blue-5",
    title: "text-blue-12",
    subtle: "text-blue-12",
  },
  confirmed: {
    fill: "bg-lime-5",
    title: "text-lime-12",
    subtle: "text-lime-12",
  },
  "checked-in": {
    fill: "bg-lime-3",
    title: "text-lime-12",
    subtle: "text-lime-12",
  },
  "ready-for-pickup": {
    fill: "bg-lime-9",
    title: "text-lime-12",
    subtle: "text-lime-12",
    ring: "ring-2 ring-lime-11/20",
  },
  completed: {
    fill: "bg-sand-6",
    title: "text-sand-12",
    subtle: "text-sand-12",
  },
  cancelled: {
    fill: "bg-olive-5",
    title: "text-olive-12",
    subtle: "text-olive-12",
    opacity: "opacity-50",
    decoration: "line-through",
  },
  "no-show": {
    fill: "bg-tomato-8",
    title: "text-tomato-12",
    subtle: "text-tomato-12",
    ring: "ring-2 ring-tomato-9/30",
  },
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
  const card = STATUS_CARD[booking.status]

  const titleText = hasPets && booking.petName ? booking.petName : booking.clientName
  const subtitleText = hasPets && booking.petName ? booking.clientName : undefined

  // DZ-209: the note marker. One glyph for either note kind; the popover it
  // opens says which.
  const hasNote = Boolean(booking.notes) || clientNotesFor(clientIdOf(booking)).length > 0
  const icons = cardIconsFor(booking, { hasNote })

  // As on the built card: the time and its icons on top, then pet · client,
  // then the service. A 15-minute block has room for the top row only, so its
  // name lives in the hover card. The service line starts at an hour. No
  // price: the built card has none, and the hover card lists it.
  const tight = height <= 28
  const compact = height <= 72

  return (
    <button
      type="button"
      data-slot="appointment-block"
      data-status={booking.status}
      data-category={booking.serviceCategory}
      onClick={() => onClick?.(booking)}
      className={cn(
        "absolute left-px right-px overflow-hidden rounded-sm text-left",
        "transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        card.fill,
        card.ring,
        card.opacity,
        className,
      )}
      style={{ top, height }}
    >
      <div className="flex h-full min-w-0 pt-1 pr-1 pb-0.5 pl-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <TimeRow
            time={formatTimeRange(booking.start, booking.durationMin)}
            icons={icons}
            subtleClass={card.subtle}
          />
          {!tight ? (
            <div
              className={cn("min-w-0 truncate text-xs font-semibold", card.title, card.decoration)}
            >
              {titleText}
              {subtitleText ? <span className="ml-1">· {subtitleText}</span> : null}
            </div>
          ) : null}
          {!compact ? (
            <div className={cn("min-w-0 truncate text-xs", card.subtle)}>{booking.serviceName}</div>
          ) : null}
        </div>
      </div>
    </button>
  )
}

const ICON_PX = 16
const ICON_GAP_PX = 2
const ROW_GAP_PX = 4

type TimeRowProps = {
  time: string
  icons: CardIconKey[]
  subtleClass: string
}

/**
 * The time, then as many icons as the row has room for (DZ-425). Icons keep
 * the order `cardIconsFor` gives them; whatever doesn't fit folds into "+N".
 */
function TimeRow({ time, icons, subtleClass }: TimeRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const [slots, setSlots] = useState(0)

  useLayoutEffect(() => {
    const row = rowRef.current
    const timeEl = timeRef.current
    if (!row || !timeEl) return
    const measure = () => {
      const free = row.clientWidth - timeEl.offsetWidth - ROW_GAP_PX
      setSlots(Math.max(0, Math.floor((free + ICON_GAP_PX) / (ICON_PX + ICON_GAP_PX))))
    }
    measure()
    // The time is watched too: it narrows when the web font lands after the
    // first measure, while the row's own width stays put.
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    observer.observe(timeEl)
    return () => observer.disconnect()
  }, [])

  const { shown, more } = fitCardIcons(icons.length, slots)
  const hidden = icons.slice(shown)

  return (
    <div
      ref={rowRef}
      className={cn("flex min-w-0 items-center justify-between gap-1 text-xs", subtleClass)}
    >
      <span ref={timeRef} className="shrink-0 whitespace-nowrap tabular-nums">
        {time}
      </span>
      {shown > 0 || more > 0 ? (
        <span data-slot="card-icons" className="flex shrink-0 items-center gap-0.5">
          {icons.slice(0, shown).map((key) => {
            const Icon = CARD_ICON[key]
            return (
              <Icon
                key={key}
                className={cn("size-4 shrink-0", key === "requested" && "text-tomato-9")}
              />
            )
          })}
          {more > 0 ? (
            <span
              data-slot="card-icons-more"
              title={hidden.map((key) => CARD_ICON_LABEL[key]).join(", ")}
              className="tabular-nums"
            >
              +{more}
            </span>
          ) : null}
        </span>
      ) : null}
      {icons.length > 0 ? (
        <span className="sr-only">{icons.map((key) => CARD_ICON_LABEL[key]).join(", ")}</span>
      ) : null}
    </div>
  )
}
