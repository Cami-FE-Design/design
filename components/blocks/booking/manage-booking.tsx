"use client"

import {
  ArrowLeftIcon,
  CalendarPlusIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { DayPicker, TimeList } from "@/components/blocks/booking/slot-picker"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { BOOKING_DAYS, type BookingDetail } from "@/lib/booking"
import { formatDuration, formatPriceAed, type PublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"

// Self-service management surface reached from the confirmation (magic-link in
// production). Same Luma single column as the booking flow; reschedule re-enters
// the slot picker, cancel is a guarded destructive step.

type View = "detail" | "reschedule" | "cancel" | "rescheduled" | "cancelled"

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function StatusPill({ status }: { status: "confirmed" | "cancelled" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        status === "confirmed"
          ? "bg-cami-green-3 text-cami-green-11"
          : "bg-sand-3 text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "confirmed" ? "bg-cami-green-9" : "bg-sand-9",
        )}
      />
      {status === "confirmed" ? "Confirmed" : "Cancelled"}
    </span>
  )
}

export function ManageBooking({
  business,
  booking,
}: {
  business: PublicBusiness
  booking: BookingDetail
}) {
  const [view, setView] = useState<View>(booking.status === "cancelled" ? "cancelled" : "detail")
  const [dayId, setDayId] = useState(BOOKING_DAYS[1]!.id)
  const [time, setTime] = useState<string | null>(null)
  const [when, setWhen] = useState({ day: booking.dayLabel, time: booking.timeLabel })

  const fullAddress = [business.street, business.city, business.emirate].filter(Boolean).join(", ")
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`

  function commitReschedule() {
    const d = BOOKING_DAYS.find((x) => x.id === dayId)!
    setWhen({ day: d.label ?? `${d.weekday} ${d.dayNum}`, time: time ?? booking.timeLabel })
    setView("rescheduled")
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <PublicTopGradient />
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 py-6">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            radius="full"
            aria-label="Back"
            onClick={() => {
              if (view === "reschedule" || view === "cancel") {
                setView("detail")
              } else {
                window.location.href = `/${business.slug}`
              }
            }}
          >
            <ArrowLeftIcon className="size-5" />
          </Button>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {booking.ref}
          </span>
        </div>

        {/* Business row */}
        <div className="mb-6 flex items-center gap-3">
          <Avatar
            size="lg"
            shape="square"
            fallback="initials"
            name={business.businessName}
            src={business.logoUrl}
            hashSeed={business.slug}
          />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-base font-semibold text-foreground">
              {business.displayName}
            </span>
            <span className="text-sm text-muted-foreground">{fullAddress}</span>
          </div>
        </div>

        {/* Terminal states */}
        {view === "cancelled" ? (
          <Terminal
            tone="neutral"
            icon={XIcon}
            title="Booking cancelled"
            body={`Your appointment at ${business.displayName} has been cancelled. Book again anytime.`}
            cta={
              <Button asChild radius="full" size="lg" className="w-full">
                <Link href={`/${business.slug}/book`}>Book again</Link>
              </Button>
            }
          />
        ) : view === "rescheduled" ? (
          <Terminal
            tone="success"
            icon={CheckIcon}
            title="Booking updated"
            body={`You're now booked for ${when.day} at ${when.time}. We sent the new details to WhatsApp.`}
            cta={
              <Button radius="full" size="lg" className="w-full" onClick={() => setView("detail")}>
                View booking
              </Button>
            }
          />
        ) : view === "reschedule" ? (
          <RescheduleView
            dayId={dayId}
            onDay={setDayId}
            time={time}
            onTime={setTime}
            onConfirm={commitReschedule}
          />
        ) : view === "cancel" ? (
          <CancelView
            business={business}
            booking={booking}
            when={when}
            onKeep={() => setView("detail")}
            onConfirm={() => setView("cancelled")}
          />
        ) : (
          /* Detail */
          <div className="flex flex-1 flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                Your booking
              </h1>
              <StatusPill status={booking.status} />
            </div>

            <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
              <DetailRow label="Service" value={booking.serviceName} />
              <DetailRow
                label="When"
                value={
                  <span className="tabular-nums">
                    {when.day} · {when.time}
                  </span>
                }
              />
              <DetailRow label="Duration" value={formatDuration(booking.durationMinutes)} />
              <DetailRow label="With" value={booking.staffName} />
              {booking.petName ? <DetailRow label="Pet" value={booking.petName} /> : null}
              <DetailRow
                label="Total"
                value={<span className="tabular-nums">{formatPriceAed(booking.priceAed)}</span>}
              />
            </div>

            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 text-sm font-medium text-cami-violet-11"
            >
              <MapPinIcon className="size-4" />
              Get directions
            </a>

            <div className="mt-auto flex flex-col gap-2 pt-8">
              <Button variant="outline" radius="full" size="lg" className="w-full gap-2">
                <CalendarPlusIcon className="size-4" />
                Add to calendar
              </Button>
              <Button
                variant="outline"
                radius="full"
                size="lg"
                className="w-full"
                onClick={() => {
                  setTime(null)
                  setView("reschedule")
                }}
              >
                Reschedule
              </Button>
              <Button
                variant="ghost"
                radius="full"
                size="lg"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setView("cancel")}
              >
                Cancel booking
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// ─── Reschedule ───────────────────────────────────────────────────────────────

function RescheduleView({
  dayId,
  onDay,
  time,
  onTime,
  onConfirm,
}: {
  dayId: string
  onDay: (id: string) => void
  time: string | null
  onTime: (t: string) => void
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pick a new time</h1>
        <p className="text-sm text-muted-foreground">Your service and team member stay the same.</p>
      </div>

      <div className="mb-5">
        <DayPicker dayId={dayId} onDay={onDay} />
      </div>

      <TimeList time={time} onTime={onTime} />

      {time ? (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          We&apos;ll hold this slot for 5 minutes.
        </p>
      ) : null}

      <div className="sticky bottom-0 mt-6 bg-background/80 pb-2 pt-3 backdrop-blur">
        <Button radius="full" size="lg" className="w-full" disabled={!time} onClick={onConfirm}>
          Confirm new time
        </Button>
      </div>
    </div>
  )
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

function CancelView({
  business,
  booking,
  when,
  onKeep,
  onConfirm,
}: {
  business: PublicBusiness
  booking: BookingDetail
  when: { day: string; time: string }
  onKeep: () => void
  onConfirm: () => void
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Cancel booking?</h1>
        <p className="text-sm text-muted-foreground">
          This frees your slot for someone else. You can always book again.
        </p>
      </div>

      <div className="flex flex-col divide-y divide-border/60 rounded-2xl bg-muted/40 px-4">
        <DetailRow label="Service" value={booking.serviceName} />
        <DetailRow
          label="When"
          value={
            <span className="tabular-nums">
              {when.day} · {when.time}
            </span>
          }
        />
        {booking.petName ? <DetailRow label="Pet" value={booking.petName} /> : null}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Free cancellation up to 24 hours before. {business.displayName} will be notified.
      </p>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button
          radius="full"
          size="lg"
          variant="destructive"
          className="w-full"
          onClick={onConfirm}
        >
          Yes, cancel booking
        </Button>
        <Button variant="ghost" radius="full" size="lg" className="w-full" onClick={onKeep}>
          Keep my booking
        </Button>
      </div>
    </div>
  )
}

// ─── Terminal ─────────────────────────────────────────────────────────────────

function Terminal({
  tone,
  icon: Icon,
  title,
  body,
  cta,
}: {
  tone: "success" | "neutral"
  icon: typeof CheckIcon
  title: string
  body: string
  cta: React.ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            tone === "success"
              ? "bg-cami-green-3 text-cami-green-11"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="size-7" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="max-w-xs text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
      <div className="mt-auto">{cta}</div>
    </div>
  )
}
