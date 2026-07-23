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
import { AppointmentDetailSheet } from "@/components/blocks/appointment-detail-sheet"
import {
  type ClientDetailClient,
  ClientDetailDialog,
} from "@/components/blocks/client-detail-dialog"
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

// "Upcoming" for the empty-query state = not-yet-started bookings with a real
// client attached (skips the group Daycare session row).
const UPCOMING_STATUSES = new Set<MockBookingStatus>(["booked", "confirmed"])
const UPCOMING_LIMIT = 4
const CLIENT_LIMIT = 5

function byDateThenTime(a: MockBooking, b: MockBooking) {
  return (a.dayOffset ?? 0) - (b.dayOffset ?? 0) || minutesOf(a.start) - minutesOf(b.start)
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
  const [selectedBooking, setSelectedBooking] = useState<MockBooking | null>(null)

  const q = query.trim().toLowerCase()

  const appointments = useMemo(() => {
    const matches = q
      ? MOCK_BOOKINGS.filter(
          (b) =>
            b.clientName.toLowerCase().includes(q) ||
            refOf(b).toLowerCase().includes(q) ||
            (b.bookingRef ?? "").toLowerCase().includes(q),
        )
      : MOCK_BOOKINGS.filter(
          (b) => UPCOMING_STATUSES.has(b.status) && b.serviceCategory !== "daycare",
        )
    return [...matches].sort(byDateThenTime).slice(0, UPCOMING_LIMIT)
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

  function openBookingClient(booking: MockBooking) {
    const match = MOCK_CLIENTS.find((c) => c.name === booking.clientName)
    if (match) {
      setSelectedClient(clientToDetail(match))
      return
    }
    const slug = booking.clientName.toLowerCase().replace(/\s+/g, "-")
    setSelectedClient({
      id: slug,
      name: booking.clientName,
      phone: booking.clientPhone,
      email: `${slug.replace(/-/g, ".")}@example.com`,
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className={fullScreenDialogClass} aria-describedby={undefined}>
          <DialogTitle className="sr-only">What are you looking for?</DialogTitle>

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

          {/* Title + search stay pinned; only the results below scroll. */}
          <div className="px-6 pt-10 lg:px-10">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
              <h1 className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl">
                What are you looking for?
              </h1>
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
                {appointments.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">None found</p>
                ) : (
                  <ul className="mt-4 flex flex-col">
                    {appointments.map((b, index) => {
                      const status = STATUS_META[b.status]
                      const staff = STAFF_BY_ID[b.staffId]
                      const date = dateOf(b)
                      // Date shows once per day group; later cards on the same day
                      // keep the gutter (empty leading) so the connector stays
                      // aligned.
                      const showDate =
                        index === 0 ||
                        (b.dayOffset ?? 0) !== (appointments[index - 1]?.dayOffset ?? 0)
                      return (
                        <TimelineRow
                          key={b.id}
                          isLast={index === appointments.length - 1}
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
                            onClick={() => setSelectedBooking(b)}
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

      <AppointmentDetailSheet
        open={selectedBooking !== null}
        onOpenChange={(next) => {
          if (!next) setSelectedBooking(null)
        }}
        booking={selectedBooking}
        staff={MOCK_STAFF}
        onViewProfile={() => {
          if (selectedBooking) openBookingClient(selectedBooking)
        }}
      />
    </>
  )
}
