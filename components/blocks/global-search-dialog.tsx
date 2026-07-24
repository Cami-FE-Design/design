"use client"

import { XIcon } from "lucide-react"
import { useMemo, useState } from "react"

import {
  formatAed,
  formatDuration,
  MOCK_BOOKINGS,
  MOCK_STAFF,
  type MockBooking,
  type MockBookingStatus,
} from "@/app/appointments/mock"
import { MOCK_CLIENTS, type MockClient } from "@/app/clients/mock"
import { AppointmentSubject } from "@/app/sales/new-sale/appointment-subject"
import { CartFlow } from "@/app/sales/new-sale/cart-flow"
import { APPOINTMENTS } from "@/app/sales/new-sale/mock"
import type { CartLine, ClientAttachment } from "@/app/sales/new-sale/types"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"
import { TimelineDate, TimelineRow } from "@/components/blocks/timeline-row"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { SearchInput } from "@/components/ui/search-input"
import { useDemoBusiness } from "@/lib/demo-business"
import { cn } from "@/lib/utils"

/**
 * Full-viewport takeover sizing — mirrors `fullScreenDialogClass` in
 * full-screen-edit-dialog.tsx. The search takeover can't use
 * <FullScreenEditDialog> directly because its title + search input must stay
 * pinned while only the results scroll (that dialog scrolls the whole body).
 */
const fullScreenDialogClass =
  "fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! sm:max-w-none! translate-x-0! translate-y-0! rounded-none! flex-col bg-background! p-0"

// Same status→chip palette as the appointments list and detail sheet so a
// "Booked" chip reads identically everywhere.
const STATUS_META: Record<MockBookingStatus, { label: string; className: string }> = {
  booked: { label: "Booked", className: "bg-blue-5 text-blue-12" },
  confirmed: { label: "Confirmed", className: "bg-lime-5 text-lime-12" },
  "checked-in": { label: "Arrived", className: "bg-lime-3 text-lime-12" },
  "ready-for-pickup": { label: "Started", className: "bg-lime-9 text-lime-12" },
  completed: { label: "Completed", className: "bg-cami-gray-6 text-cami-gray-12" },
  cancelled: { label: "Canceled", className: "bg-olive-5 text-olive-12" },
  "no-show": { label: "No-show", className: "bg-tomato-8 text-tomato-12" },
}

// Demo dates anchor on 18 May 2026 (a Monday) — the same anchor the
// appointments list and the detail sheet use. Bookings carrying a `dayOffset`
// land N days later, and the detail sheet honors the same offset, so the date
// shown here always matches the sheet that opens on click.
const ANCHOR_DATE = new Date(2026, 4, 18)

function dateOf(b: MockBooking): Date {
  const date = new Date(ANCHOR_DATE)
  date.setDate(date.getDate() + (b.dayOffset ?? 0))
  return date
}

/** "13:00" → "1:00pm", "9:15" → "9:15am" */
function formatTime12h(start: string) {
  const [h = 0, m = 0] = start.split(":").map(Number)
  const suffix = h >= 12 ? "pm" : "am"
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, "0")}${suffix}`
}

function minutesOf(start: string) {
  const [h = 0, m = 0] = start.split(":").map(Number)
  return h * 60 + m
}

/** Same ref derivation as the appointments list so search-by-reference matches it. */
function refOf(b: MockBooking) {
  if (b.bookingRef) {
    const cleaned = b.bookingRef
      .replace(/[^0-9A-Z]/gi, "")
      .toUpperCase()
      .padStart(8, "0")
      .slice(0, 8)
    return `#${cleaned}`
  }
  let h = 0
  for (let i = 0; i < b.id.length; i++) {
    h = ((h << 5) - h + b.id.charCodeAt(i)) | 0
  }
  return `#${Math.abs(h).toString(16).toUpperCase().padStart(8, "0").slice(0, 8)}`
}

const STAFF_BY_ID = Object.fromEntries(MOCK_STAFF.map((s) => [s.id, s]))

const UPCOMING_LIMIT = 4
const CLIENT_LIMIT = 5

function byDateThenTime(a: MockBooking, b: MockBooking) {
  return (a.dayOffset ?? 0) - (b.dayOffset ?? 0) || minutesOf(a.start) - minutesOf(b.start)
}

// ─── Upcoming = the checkout's appointment list (DSG-56) ─────────────────────
// The empty-query state shows the exact same appointments the cart's "Search
// appointments" picker offers, so both surfaces always agree.

/** "9:00am" / "2:00pm" → minutes since midnight. */
function minutes12h(t: string) {
  const m = /(\d+):(\d+)\s*(am|pm)/i.exec(t)
  if (!m) return 0
  let h = Number(m[1]) % 12
  if (m[3]?.toLowerCase() === "pm") h += 12
  return h * 60 + Number(m[2])
}

const UPCOMING_CHECKOUT = [...APPOINTMENTS]
  .sort((a, b) => minutes12h(a.start) - minutes12h(b.start))
  .slice(0, UPCOMING_LIMIT)

// The checkout list is "upcoming today" — all on the demo anchor day.
const ANCHOR_DAY_MONTH = ANCHOR_DATE.toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
})
const ANCHOR_WEEKDAY = ANCHOR_DATE.toLocaleDateString("en-US", { weekday: "long" })

/** "9:00am" → "9:00" 24h, for the edit sheet's startTime prop. */
function to24h(t: string) {
  const total = minutes12h(t)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** ISO date for the anchor day + optional offset — the edit sheet's date prop. */
function isoOfOffset(dayOffset = 0) {
  const d = new Date(ANCHOR_DATE)
  d.setDate(d.getDate() + dayOffset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

/**
 * What the edit sheet needs about the clicked appointment. Matches DSG-54: the
 * panel is the same <NewAppointmentSheet flow="edit"> that /appointments opens
 * (status pill + Checkout CTA), not the read-only detail sheet.
 */
type EditTarget = {
  id: string
  date: string
  startTime: string
  status: MockBookingStatus
}

function clientToDetail(c: MockClient): ClientDetailClient {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone }
}

type GlobalSearchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GlobalSearchDialog({ open, onOpenChange }: GlobalSearchDialogProps) {
  const { name: businessName } = useDemoBusiness()
  const [query, setQuery] = useState("")
  const [selectedClient, setSelectedClient] = useState<ClientDetailClient | null>(null)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  // When set, the appointment's services launch the checkout flow at the Tip
  // step — same handoff as /appointments.
  const [checkout, setCheckout] = useState<{
    lines: CartLine[]
    attachment: ClientAttachment
  } | null>(null)

  const q = query.trim().toLowerCase()

  // Query results search the full booking dataset (by client name / booking
  // reference); the empty-query state instead shows UPCOMING_CHECKOUT.
  const bookingMatches = useMemo(() => {
    if (!q) return []
    return MOCK_BOOKINGS.filter(
      (b) =>
        b.clientName.toLowerCase().includes(q) ||
        refOf(b).toLowerCase().includes(q) ||
        (b.bookingRef ?? "").toLowerCase().includes(q),
    )
      .sort(byDateThenTime)
      .slice(0, UPCOMING_LIMIT)
  }, [q])

  const clients = useMemo(() => {
    const recentFirst = [...MOCK_CLIENTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (!q) return recentFirst.slice(0, CLIENT_LIMIT)
    return recentFirst
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q) ||
          (c.phone ?? "").toLowerCase().includes(q) ||
          c.pets.some((p) => p.name.toLowerCase().includes(q)),
      )
      .slice(0, CLIENT_LIMIT)
  }, [q])

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("")
    onOpenChange(next)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={fullScreenDialogClass} aria-describedby={undefined}>
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Header chrome — same as FullScreenEditDialog: pill Close on desktop,
              round X on mobile. */}
          <header className="border-b border-border/40 bg-background px-6 py-3 lg:px-10">
            <div className="mx-auto flex max-w-5xl items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                radius="full"
                aria-label="Close"
                onClick={() => handleOpenChange(false)}
                className="lg:hidden"
              >
                <XIcon className="size-5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                radius="full"
                onClick={() => handleOpenChange(false)}
                className="hidden lg:inline-flex"
              >
                Close
              </Button>
            </div>
          </header>

          {/* Search stays pinned; only the results below scroll. */}
          <div className="px-6 pt-8 lg:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col">
              <SearchInput
                size="xl"
                autoFocus
                placeholder="Search by client name, mobile, email or booking reference"
                aria-label="Search"
                onValueChange={setQuery}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-10 lg:px-10">
            <div className="mx-auto grid w-full max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
              {/* Upcoming appointments */}
              <section>
                <h2 className="font-heading text-lg font-semibold leading-7 text-foreground">
                  {q ? "Appointments" : "Upcoming appointments (nearest first)"}
                </h2>
                {!q ? (
                  <ul className="mt-4 flex flex-col">
                    {UPCOMING_CHECKOUT.map((appt, index) => (
                      <TimelineRow
                        key={appt.id}
                        isLast={index === UPCOMING_CHECKOUT.length - 1}
                        leading={
                          index === 0 ? (
                            <TimelineDate dayMonth={ANCHOR_DAY_MONTH} weekday={ANCHOR_WEEKDAY} />
                          ) : (
                            <span aria-hidden />
                          )
                        }
                      >
                        {/* Same card as the checkout "Search appointments" picker
                            (DSG-56) — time · location, pet subject, one row per
                            service line. Click opens the detail sheet. */}
                        <button
                          type="button"
                          onClick={() =>
                            setEditTarget({
                              id: appt.id,
                              date: isoOfOffset(0),
                              startTime: to24h(appt.start),
                              status: "booked",
                            })
                          }
                          className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-sand-2"
                        >
                          <span className="flex items-start justify-between gap-3">
                            <span className="flex min-w-0 flex-1 flex-col gap-2">
                              <span className="flex min-w-0 items-baseline gap-1.5 text-sm">
                                <span className="font-semibold text-foreground">{appt.start}</span>
                                <span className="truncate text-muted-foreground">
                                  · {appt.location ?? businessName}
                                </span>
                              </span>
                              <AppointmentSubject appt={appt} />
                            </span>
                            <Badge
                              className={cn("border-transparent", STATUS_META.booked.className)}
                            >
                              {appt.status ?? "Booked"}
                            </Badge>
                          </span>
                          <span className="flex flex-col gap-2">
                            {appt.lines.map((line) => (
                              <span
                                key={line.serviceId}
                                className="flex items-baseline justify-between gap-2 text-sm"
                              >
                                <span className="min-w-0 flex-1 truncate">
                                  {line.name}
                                  <span className="text-muted-foreground">
                                    {" "}
                                    · {line.staffName} · {formatDuration(line.durationMin)}
                                  </span>
                                </span>
                                <span className="font-medium">{formatAed(line.priceMinor)}</span>
                              </span>
                            ))}
                          </span>
                        </button>
                      </TimelineRow>
                    ))}
                  </ul>
                ) : bookingMatches.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">None found</p>
                ) : (
                  <ul className="mt-4 flex flex-col">
                    {bookingMatches.map((b, index) => {
                      const status = STATUS_META[b.status]
                      const staff = STAFF_BY_ID[b.staffId]
                      const date = dateOf(b)
                      // Date shows once per day group; later cards on the same day
                      // keep the gutter (empty leading) so the connector stays
                      // aligned.
                      const showDate =
                        index === 0 ||
                        (b.dayOffset ?? 0) !== (bookingMatches[index - 1]?.dayOffset ?? 0)
                      return (
                        <TimelineRow
                          key={b.id}
                          isLast={index === bookingMatches.length - 1}
                          leading={
                            showDate ? (
                              <TimelineDate
                                dayMonth={date.toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                                weekday={date.toLocaleDateString("en-US", { weekday: "long" })}
                              />
                            ) : (
                              <span aria-hidden />
                            )
                          }
                        >
                          {/* Mirrors <AppointmentCard> in client-detail-dialog.tsx — same
                          card anatomy, minus the action row (the whole card is the
                          click target here and opens the detail sheet). */}
                          <button
                            type="button"
                            onClick={() =>
                              setEditTarget({
                                id: b.id,
                                date: isoOfOffset(b.dayOffset),
                                startTime: b.start,
                                status: b.status,
                              })
                            }
                            className="flex w-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:bg-sand-2"
                          >
                            <span className="flex items-start justify-between gap-3">
                              <span className="flex min-w-0 flex-1 flex-col gap-2">
                                <span className="flex min-w-0 items-baseline gap-1.5 text-sm">
                                  <span className="font-semibold text-foreground">
                                    {formatTime12h(b.start)}
                                  </span>
                                  <span className="truncate text-muted-foreground">
                                    · {businessName}
                                  </span>
                                </span>
                                {b.petName ? (
                                  <span className="flex items-center gap-2">
                                    <Avatar
                                      size="sm"
                                      fallback="species"
                                      species={b.petSpecies}
                                      hashSeed={b.id}
                                    />
                                    <span className="flex min-w-0 flex-col leading-tight">
                                      <span className="truncate text-sm font-medium text-foreground">
                                        {b.petName}
                                      </span>
                                      {b.petSpecies ? (
                                        <span className="truncate text-xs capitalize text-muted-foreground">
                                          {b.petSpecies}
                                        </span>
                                      ) : null}
                                    </span>
                                  </span>
                                ) : null}
                              </span>
                              <Badge className={cn("border-transparent", status.className)}>
                                {status.label}
                              </Badge>
                            </span>
                            <span className="flex items-baseline justify-between gap-2 text-sm">
                              <span className="min-w-0 flex-1 truncate">
                                {b.serviceName}
                                <span className="text-muted-foreground">
                                  {staff ? ` · ${staff.name}` : ""} ·{" "}
                                  {formatDuration(b.durationMin)}
                                </span>
                              </span>
                              <span className="font-medium">{formatAed(b.priceMinor)}</span>
                            </span>
                          </button>
                        </TimelineRow>
                      )
                    })}
                  </ul>
                )}
              </section>

              {/* Clients */}
              <section>
                <h2 className="font-heading text-lg font-semibold leading-7 text-foreground">
                  {q ? "Clients" : "Clients (recently added)"}
                </h2>
                {clients.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">None found</p>
                ) : (
                  <ul className="mt-4 flex flex-col">
                    {clients.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedClient(clientToDetail(c))}
                          className="flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-sand-2"
                        >
                          <Avatar
                            size="lg"
                            fallback="character"
                            name={c.name}
                            hashSeed={c.id}
                            src={c.photoUrl}
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate text-base font-medium text-foreground">
                              {c.name}
                            </span>
                            <span className="truncate text-sm text-muted-foreground">
                              {c.email ?? c.phone ?? "No contact details"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stacks over the search takeover — portals render later in the DOM. */}
      {selectedClient ? (
        <ClientDetailDialog
          open
          onOpenChange={(next) => {
            if (!next) setSelectedClient(null)
          }}
          client={selectedClient}
        />
      ) : null}

      {/* Same edit panel /appointments opens (DSG-54) — status pill visible,
          CTA = Checkout, which hands off to the cart flow at the Tip step.
          Keyed per appointment so each open starts a fresh sheet. */}
      {editTarget ? (
        <NewAppointmentSheet
          key={editTarget.id}
          open
          onOpenChange={(next) => {
            if (!next) setEditTarget(null)
          }}
          date={editTarget.date}
          startTime={editTarget.startTime}
          hasPets
          flow="edit"
          initialStatus={editTarget.status}
          onCheckout={(lines, client) => {
            setEditTarget(null)
            setCheckout({
              lines,
              attachment: client ? { type: "client", client } : { type: "walk-in" },
            })
          }}
        />
      ) : null}
      {checkout ? (
        <CartFlow
          open
          onOpenChange={(next) => {
            if (!next) setCheckout(null)
          }}
          initialLines={checkout.lines}
          initialAttachment={checkout.attachment}
          initialStep="tip"
        />
      ) : null}
    </>
  )
}
