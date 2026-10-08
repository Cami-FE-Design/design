"use client"

import { CareBookingSheet } from "@/components/blocks/appointments/care-booking-sheet"
import { type DaycareSession, formatTime, formatTimeRange } from "@/lib/daycare-mock"
import { formatDurationLong } from "@/lib/format"
import { formatMoneyWhole } from "@/lib/money/format"

// A daycare session in the shared care drawer: price and plan on the service
// line, drop-off to pick-up in the timing block.

const LATE_FEE_MINOR = 2500

type DaycareDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: DaycareSession | null
}

export function DaycareDetailSheet({ open, onOpenChange, session }: DaycareDetailSheetProps) {
  if (!session) return null
  const addOns = session.addOns.reduce((sum, a) => sum + a.priceMinor, 0)
  const duration = formatDurationLong(session.durationMin)

  return (
    <CareBookingSheet
      open={open}
      onOpenChange={onOpenChange}
      booking={session}
      ariaDescription={`${session.serviceName} — ${duration}`}
      day={session.date}
      serviceTitle={
        <>
          {session.serviceName} · {formatMoneyWhole(session.priceMinor)}
        </>
      }
      serviceMeta={
        <>
          {formatTime(session.start)} · {session.planLabel ?? duration}
        </>
      }
      serviceExtra={
        session.facilityRoom ? (
          <span className="truncate text-xs text-muted-foreground">{session.facilityRoom}</span>
        ) : null
      }
      timing={
        <div className="rounded-xl bg-sand-2 p-3 text-xs">
          <span className="text-muted-foreground">Drop-off — pick-up</span>
          <div className="font-medium text-foreground">
            {formatTimeRange(session.start, session.durationMin)}
          </div>
        </div>
      }
      subtotal={(lateFee) => session.priceMinor + addOns + (lateFee ? LATE_FEE_MINOR : 0)}
      subtotalNote={duration}
    />
  )
}
