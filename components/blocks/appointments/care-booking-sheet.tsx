"use client"

import {
  BoneIcon,
  CalendarClockIcon,
  CalendarXIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  CirclePlusIcon,
  DoorOpenIcon,
  EyeOffIcon,
  ListIcon,
  type LucideIcon,
  MailIcon,
  MapPinIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PhoneIcon,
  PlusIcon,
  SparklesIcon,
  UtensilsIcon,
} from "lucide-react"
import type * as React from "react"
import { useEffect, useState } from "react"

import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatLongDate } from "@/lib/format"
import { formatMoneyWhole } from "@/lib/money/format"
import { cn } from "@/lib/utils"

// The booking drawer boarding and daycare share. Everything but the service
// line, the timing block and the subtotal is the same for a stay and a
// session, so those three come in as props and the rest is drawn here once.

export type CareStatus = "booked" | "checked-in" | "checked-out" | "cancelled" | "no-show"

/** What the drawer reads from a boarding stay or a daycare session. */
export type CareBooking = {
  id: string
  petName: string
  petSpecies: AvatarSpecies
  petBreed?: string
  petSize: string
  clientName: string
  clientPhone?: string
  clientEmail?: string
  clientAddress?: string
  addOns: ReadonlyArray<{ id: string; label: string }>
  status: CareStatus
  lateCheckoutFee: boolean
  notes?: string
}

// ─── Status pill (mirrors appointment-detail-sheet lifecycle vocabulary) ───────

const STATUS_TONE: Record<CareStatus, { fill: string; text: string }> = {
  booked: { fill: "bg-blue-5", text: "text-blue-12" },
  "checked-in": { fill: "bg-lime-3", text: "text-lime-12" },
  "checked-out": { fill: "bg-cami-gray-6", text: "text-cami-gray-12" },
  cancelled: { fill: "bg-olive-5", text: "text-olive-12" },
  "no-show": { fill: "bg-tomato-8", text: "text-tomato-12" },
}

const STATUS_LABEL: Record<CareStatus, string> = {
  booked: "Booked",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Cancelled",
  "no-show": "No-show",
}

const STATUS_OPTIONS: { value: CareStatus; Icon: LucideIcon; destructive?: boolean }[] = [
  { value: "booked", Icon: CalendarClockIcon },
  { value: "checked-in", Icon: MapPinIcon },
  { value: "checked-out", Icon: DoorOpenIcon },
  { value: "no-show", Icon: EyeOffIcon, destructive: true },
  { value: "cancelled", Icon: CalendarXIcon, destructive: true },
]

function StatusPill({
  status,
  onChange,
}: {
  status: CareStatus
  onChange: (next: CareStatus) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
        >
          {STATUS_LABEL[status]}
          <ChevronDownIcon className="size-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {STATUS_OPTIONS.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onSelect={() => onChange(opt.value)}
            variant={opt.destructive ? "destructive" : undefined}
            data-active={status === opt.value}
            className="data-[active=true]:font-semibold"
          >
            <opt.Icon className="size-4" />
            {STATUS_LABEL[opt.value]}
            {status === opt.value ? <CheckIcon className="ml-auto size-3.5" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Customer card (collapsible) ───────────────────────────────────────────────

function CustomerCard({ booking }: { booking: CareBooking }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar size="md" fallback="character" name={booking.clientName} hashSeed={booking.id} />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">
            {booking.clientName}
          </span>
          <span className="truncate text-xs text-muted-foreground">Pet parent</span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="outline" size="icon-sm" radius="full" aria-label="Message">
            <MessageCircleIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronUpIcon className="size-4" /> : <ChevronDownIcon className="size-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-border/60 pt-3 text-sm">
          <ContactRow icon={PhoneIcon} value={booking.clientPhone ?? "Not defined"} />
          <ContactRow icon={MailIcon} value={booking.clientEmail ?? "Not defined"} />
          <ContactRow icon={MapPinIcon} value={booking.clientAddress ?? "Not defined"} />
        </div>
      ) : null}
    </div>
  )
}

function ContactRow({ icon: Icon, value }: { icon: LucideIcon; value: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate text-foreground">{value}</span>
    </div>
  )
}

// ─── Add-on chip (feeding / belongings, plus attached add-ons) ─────────────────

function AddOnChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

// ─── Booking card: pet, service line, timing, add-ons ──────────────────────────

function BookingCard({
  booking,
  status,
  onStatusChange,
  serviceTitle,
  serviceMeta,
  serviceExtra,
  timing,
}: {
  booking: CareBooking
  status: CareStatus
  onStatusChange: (next: CareStatus) => void
  serviceTitle: React.ReactNode
  serviceMeta: React.ReactNode
  serviceExtra?: React.ReactNode
  timing: React.ReactNode
}) {
  const feeding = booking.addOns.find((a) => a.id === "feed")
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar
          size="md"
          fallback="species"
          species={booking.petSpecies}
          name={booking.petName}
          hashSeed={booking.id}
        />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">{booking.petName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {booking.petBreed ?? "Not defined"} · {booking.petSize}
          </span>
        </div>
      </div>

      <div className="border-t border-border/60" />

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">{serviceTitle}</span>
          <span className="truncate text-xs text-muted-foreground">{serviceMeta}</span>
          {serviceExtra}
        </div>
        <StatusPill status={status} onChange={onStatusChange} />
      </div>

      {timing}

      <div className="flex flex-wrap items-center gap-1.5">
        <AddOnChip icon={UtensilsIcon} label={feeding ? feeding.label : "No feeding"} />
        <AddOnChip icon={BoneIcon} label="No belongings" />
        {booking.addOns
          .filter((a) => a.id !== "feed")
          .map((a) => (
            <AddOnChip key={a.id} icon={PlusIcon} label={a.label} />
          ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            radius="full"
            className="self-start gap-1.5 text-cami-violet-11"
          >
            <PlusIcon className="size-4" />
            Add
            <ChevronDownIcon className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-44">
          <DropdownMenuItem>
            <ListIcon className="size-4" />
            Primary Service
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SparklesIcon className="size-4" />
            Add-on
          </DropdownMenuItem>
          <DropdownMenuItem>
            <PackageIcon className="size-4" />
            Product
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CirclePlusIcon className="size-4" />
            Custom Item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

// ─── The drawer ────────────────────────────────────────────────────────────────

export function CareBookingSheet({
  open,
  onOpenChange,
  booking,
  ariaDescription,
  day,
  serviceTitle,
  serviceMeta,
  serviceExtra,
  timing,
  subtotal,
  subtotalNote,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: CareBooking
  ariaDescription: string
  /** The `YYYY-MM-DD` day shown in the status-tinted band. */
  day: string
  serviceTitle: React.ReactNode
  serviceMeta: React.ReactNode
  serviceExtra?: React.ReactNode
  /** The sand block under the service line: check-in/out for a stay, drop-off for a session. */
  timing: React.ReactNode
  /** The subtotal in fils, with or without the late check-out fee. */
  subtotal: (lateFee: boolean) => number
  /** Beside the subtotal: "(3 Nights)", "(4 hr)". */
  subtotalNote: string
}) {
  const [status, setStatus] = useState<CareStatus>(booking.status)
  const [lateFee, setLateFee] = useState<boolean>(booking.lateCheckoutFee)
  const [notes, setNotes] = useState<string>(booking.notes ?? "")

  useEffect(() => {
    setStatus(booking.status)
    setLateFee(booking.lateCheckoutFee)
    setNotes(booking.notes ?? "")
  }, [booking])

  const tone = STATUS_TONE[status]
  const isCheckedOut = status === "checked-out"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-120 max-w-120 flex-col gap-0 overflow-hidden p-0 sm:max-w-120"
      >
        <SheetTitle className="sr-only">Booking detail for {booking.petName}</SheetTitle>
        <SheetDescription className="sr-only">{ariaDescription}</SheetDescription>

        <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border/60 px-4">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close"
              onClick={() => onOpenChange(false)}
            >
              <ChevronsRightIcon />
            </Button>
            <span className="text-base font-semibold text-foreground">Booking Detail</span>
          </div>
          <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="More">
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </header>

        <div className="border-b border-border/60 px-4 py-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-sand-2 px-4 py-4">
          <CustomerCard booking={booking} />

          <div className={cn("rounded-xl px-3 py-2 text-sm font-semibold", tone.fill, tone.text)}>
            {formatLongDate(day)}
          </div>

          <BookingCard
            booking={booking}
            status={status}
            onStatusChange={setStatus}
            serviceTitle={serviceTitle}
            serviceMeta={serviceMeta}
            serviceExtra={serviceExtra}
            timing={timing}
          />

          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">Late check out fee</span>
            <Switch
              checked={lateFee}
              onCheckedChange={setLateFee}
              aria-label="Late check out fee"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-foreground">Booking notes</span>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes here…"
              className="min-h-24 bg-card"
            />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {formatMoneyWhole(subtotal(lateFee))}{" "}
              <span className="text-xs font-normal text-muted-foreground">({subtotalNote})</span>
            </span>
          </div>
          <Button type="button" radius="full" className="flex-1" disabled={isCheckedOut}>
            {isCheckedOut ? "Checked out" : "Check out"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  )
}
