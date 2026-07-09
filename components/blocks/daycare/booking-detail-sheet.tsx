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
import { useEffect, useState } from "react"

import { formatAed } from "@/app/appointments/mock"
import { Avatar } from "@/components/ui/avatar"
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
import {
  type DaycareSession,
  type DaycareStatus,
  formatDuration,
  formatTime,
  formatTimeRange,
} from "@/lib/daycare-mock"
import { cn } from "@/lib/utils"

const LATE_FEE_MINOR = 2500

function formatSessionDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "long" })
  const day = d.getDate()
  const month = d.toLocaleDateString("en-GB", { month: "short" })
  const year = d.getFullYear()
  return `${weekday}, ${day} ${month} ${year}`
}

// ─── Status pill (shared lifecycle vocabulary) ─────────────────────────────────

type StatusTheme = { fill: string; text: string }

const STATUS_THEME: Record<DaycareStatus, StatusTheme> = {
  booked: { fill: "bg-blue-5", text: "text-blue-12" },
  "checked-in": { fill: "bg-lime-3", text: "text-lime-12" },
  "checked-out": { fill: "bg-cami-gray-6", text: "text-cami-gray-12" },
  cancelled: { fill: "bg-olive-5", text: "text-olive-12" },
  "no-show": { fill: "bg-tomato-8", text: "text-tomato-12" },
}

const STATUS_LABEL: Record<DaycareStatus, string> = {
  booked: "Booked",
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  cancelled: "Canceled",
  "no-show": "No-show",
}

const STATUS_OPTIONS: {
  value: DaycareStatus
  label: string
  Icon: LucideIcon
  destructive?: boolean
}[] = [
  { value: "booked", label: "Booked", Icon: CalendarClockIcon },
  { value: "checked-in", label: "Checked in", Icon: MapPinIcon },
  { value: "checked-out", label: "Checked out", Icon: DoorOpenIcon },
  { value: "no-show", label: "No-show", Icon: EyeOffIcon, destructive: true },
  { value: "cancelled", label: "Canceled", Icon: CalendarXIcon, destructive: true },
]

function StatusPill({
  status,
  onChange,
}: {
  status: DaycareStatus
  onChange: (next: DaycareStatus) => void
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
            {opt.label}
            {status === opt.value ? <CheckIcon className="ml-auto size-3.5" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Customer card ─────────────────────────────────────────────────────────────

function CustomerCard({ session }: { session: DaycareSession }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar size="md" fallback="character" name={session.clientName} hashSeed={session.id} />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">
            {session.clientName}
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
          <ContactRow icon={PhoneIcon} value={session.clientPhone ?? "Not defined"} />
          <ContactRow icon={MailIcon} value={session.clientEmail ?? "Not defined"} />
          <ContactRow icon={MapPinIcon} value={session.clientAddress ?? "Not defined"} />
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

function AddOnChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" />
      {label}
    </span>
  )
}

// ─── Session card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  status,
  onStatusChange,
}: {
  session: DaycareSession
  status: DaycareStatus
  onStatusChange: (next: DaycareStatus) => void
}) {
  const feeding = session.addOns.find((a) => a.id === "feed")
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
      {/* Pet identity */}
      <div className="flex items-center gap-3">
        <Avatar
          size="md"
          fallback="species"
          species={session.petSpecies}
          name={session.petName}
          hashSeed={session.id}
        />
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">{session.petName}</span>
          <span className="truncate text-xs text-muted-foreground">
            {session.petBreed ?? "Not defined"} · {session.petSize}
          </span>
        </div>
      </div>

      <div className="border-t border-border/60" />

      {/* Service line */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-foreground">
            {session.serviceName} · {formatAed(session.priceMinor)}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {formatTime(session.start)} · {session.planLabel ?? formatDuration(session.durationMin)}
          </span>
          {session.facilityRoom ? (
            <span className="truncate text-xs text-muted-foreground">{session.facilityRoom}</span>
          ) : null}
        </div>
        <StatusPill status={status} onChange={onStatusChange} />
      </div>

      {/* Time range */}
      <div className="rounded-xl bg-sand-2 p-3 text-xs">
        <span className="text-muted-foreground">Drop-off — pick-up</span>
        <div className="font-medium text-foreground">
          {formatTimeRange(session.start, session.durationMin)}
        </div>
      </div>

      {/* Add-ons + Add */}
      <div className="flex flex-wrap items-center gap-1.5">
        <AddOnChip icon={UtensilsIcon} label={feeding ? feeding.label : "No feeding"} />
        <AddOnChip icon={BoneIcon} label="No belongings" />
        {session.addOns
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

// ─── Main sheet ────────────────────────────────────────────────────────────────

type DaycareDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: DaycareSession | null
}

export function DaycareDetailSheet({ open, onOpenChange, session }: DaycareDetailSheetProps) {
  const [status, setStatus] = useState<DaycareStatus>(session?.status ?? "booked")
  const [lateFee, setLateFee] = useState<boolean>(session?.lateCheckoutFee ?? false)
  const [notes, setNotes] = useState<string>(session?.notes ?? "")

  useEffect(() => {
    if (session) {
      setStatus(session.status)
      setLateFee(session.lateCheckoutFee)
      setNotes(session.notes ?? "")
    }
  }, [session])

  if (!session) return null

  const addOns = session.addOns.reduce((sum, a) => sum + a.priceMinor, 0)
  const subtotal = session.priceMinor + addOns + (lateFee ? LATE_FEE_MINOR : 0)
  const theme = STATUS_THEME[status]
  const isCheckedOut = status === "checked-out"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-120 max-w-120 flex-col gap-0 overflow-hidden p-0 sm:max-w-120"
      >
        <SheetTitle className="sr-only">Booking detail for {session.petName}</SheetTitle>
        <SheetDescription className="sr-only">
          {session.serviceName} — {formatDuration(session.durationMin)}
        </SheetDescription>

        {/* Header */}
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

        {/* Tabs */}
        <div className="border-b border-border/60 px-4 py-2">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="activities">Activities</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-sand-2 px-4 py-4">
          <CustomerCard session={session} />

          <div className={cn("rounded-xl px-3 py-2 text-sm font-semibold", theme.fill, theme.text)}>
            {formatSessionDate(session.date)}
          </div>

          <SessionCard session={session} status={status} onStatusChange={setStatus} />

          {/* Late checkout fee */}
          <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card px-4 py-3">
            <span className="text-sm font-medium text-foreground">Late check out fee</span>
            <Switch
              checked={lateFee}
              onCheckedChange={setLateFee}
              aria-label="Late check out fee"
            />
          </div>

          {/* Notes */}
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

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {formatAed(subtotal)}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({formatDuration(session.durationMin)})
              </span>
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
