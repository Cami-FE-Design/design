"use client"

import { MoonIcon } from "lucide-react"
import { CareBookingSheet } from "@/components/blocks/appointments/care-booking-sheet"
import {
  type BoardingStay,
  facilityName,
  LATE_CHECKOUT_FEE_MINOR,
  roomName,
  stayNights,
  staySubtotalMinor,
} from "@/lib/boarding-mock"
import { formatMoneyWhole } from "@/lib/money/format"

// A boarding stay in the shared care drawer: rate per night and room on the
// service line, check-in / check-out / nights in the timing block.

function formatCheckStamp(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const day = d.getDate()
  const month = d.toLocaleDateString("en-GB", { month: "short" })
  const year = d.getFullYear()
  // Check-in/out default to 12:00 PM (business default; late fee keys off this).
  return `${month} ${day}, ${year} · 12:00 PM`
}

function StampCol({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}

type BoardingDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  stay: BoardingStay | null
}

export function BoardingDetailSheet({ open, onOpenChange, stay }: BoardingDetailSheetProps) {
  if (!stay) return null
  const nights = stayNights(stay)
  const base = staySubtotalMinor({ ...stay, lateCheckoutFee: false })

  return (
    <CareBookingSheet
      open={open}
      onOpenChange={onOpenChange}
      booking={stay}
      ariaDescription={`${stay.serviceName} — ${nights} nights`}
      day={stay.checkIn}
      serviceTitle={stay.serviceName}
      serviceMeta={
        <>
          {formatMoneyWhole(stay.ratePerNightMinor)}/night · {facilityName(stay.facilityId)} —{" "}
          {roomName(stay.roomId)}
        </>
      }
      timing={
        <div className="grid grid-cols-3 gap-3 rounded-xl bg-sand-2 p-3 text-xs">
          <StampCol label="Check in" value={formatCheckStamp(stay.checkIn)} />
          <StampCol label="Check out" value={formatCheckStamp(stay.checkOut)} />
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Nights</span>
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <MoonIcon className="size-3.5" />
              {nights} {nights === 1 ? "Night" : "Nights"}
            </span>
          </div>
        </div>
      }
      subtotal={(lateFee) => base + (lateFee ? LATE_CHECKOUT_FEE_MINOR : 0)}
      subtotalNote={`${nights} Nights`}
    />
  )
}
