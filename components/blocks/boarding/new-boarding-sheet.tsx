"use client"

import { ChevronsRightIcon, MoonIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { formatAed } from "@/app/appointments/mock"
import { DatePicker } from "@/components/blocks/date-picker"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  BOARDING_ADD_ON_CATALOG,
  BOARDING_CLIENTS,
  BOARDING_FACILITIES,
  BOARDING_ROOMS,
  BOARDING_SERVICES,
  nightsBetween,
} from "@/lib/boarding-mock"
import { cn } from "@/lib/utils"

// ─── DateAvatarCard (matches new-appointment-sheet / appointment-detail-sheet) ──

function DateAvatarCard({ date }: { date: string }) {
  const d = new Date(`${date}T00:00:00`)
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase()
  const day = d.getDate()
  return (
    <div
      aria-hidden
      className="flex h-12 w-[3rem] shrink-0 flex-col overflow-hidden rounded-[9px] bg-background text-foreground shadow-[0_0_0_2px_var(--background)]"
    >
      <div className="bg-black/10 py-[3px] text-center text-[9px] leading-none font-bold tracking-tight text-foreground/50">
        {month}
      </div>
      <div className="flex flex-1 items-center justify-center text-2xl leading-none font-bold text-foreground/70">
        {day}
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold leading-7 text-foreground">{children}</h2>
}

// ─── New boarding sheet ────────────────────────────────────────────────────────

type NewBoardingSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** ISO date the operator started from (prefills check-in). */
  date: string
}

export function NewBoardingSheet({ open, onOpenChange, date }: NewBoardingSheetProps) {
  const [clientId, setClientId] = useState<string>("")
  const [petName, setPetName] = useState<string>("")
  const [serviceId, setServiceId] = useState<string>("")
  const [checkIn, setCheckIn] = useState<string>(date)
  const [checkOut, setCheckOut] = useState<string>("")
  const [roomId, setRoomId] = useState<string>("unassigned")
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [notes, setNotes] = useState<string>("")

  const client = BOARDING_CLIENTS.find((c) => c.id === clientId) ?? null
  const pet = client?.pets.find((p) => p.name === petName) ?? null
  const service = BOARDING_SERVICES.find((s) => s.id === serviceId) ?? null

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  const totalMinor = useMemo(() => {
    const base = service ? nights * service.ratePerNightMinor : 0
    const addOns = BOARDING_ADD_ON_CATALOG.filter((a) => addOnIds.includes(a.id)).reduce(
      (sum, a) => sum + a.priceMinor,
      0,
    )
    return base + addOns
  }, [service, nights, addOnIds])

  const canSave = Boolean(client && pet && service && nights > 0)

  const toggleAddOn = (id: string) =>
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const headerDate = checkIn || date

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex w-120 max-w-120 flex-col gap-0 overflow-hidden p-0 sm:max-w-120"
      >
        <SheetTitle className="sr-only">New boarding stay</SheetTitle>
        <SheetDescription className="sr-only">
          Create an overnight boarding booking
        </SheetDescription>

        {/* Close row */}
        <header className="flex min-h-12 items-center gap-3 border-b border-border/60 px-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <ChevronsRightIcon />
          </Button>
        </header>

        {/* Hero header */}
        <header className="flex items-center gap-3 bg-sand-2 px-6 py-7 text-foreground">
          <DateAvatarCard date={headerDate} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-[22px] font-semibold leading-7 tracking-tight">
              New boarding stay
            </span>
            <span className="inline-flex items-center gap-1 text-xs leading-4 text-muted-foreground">
              <MoonIcon className="size-3.5" />
              {nights > 0 ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Overnight stay"}
            </span>
          </div>
        </header>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-sand-2 px-6 py-5">
          {/* Pet parent */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Pet parent</SectionHeading>
            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <Select
                value={clientId}
                onValueChange={(v) => {
                  setClientId(v)
                  setPetName("")
                }}
              >
                <SelectTrigger className="h-12 w-full">
                  <SelectValue placeholder="Select pet parent" />
                </SelectTrigger>
                <SelectContent>
                  {BOARDING_CLIENTS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {client ? (
                <div className="flex items-center gap-3 border-t border-border/60 pt-3">
                  <Avatar size="sm" fallback="character" name={client.name} hashSeed={client.id} />
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-sm font-medium text-foreground">
                      {client.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {client.phone ?? "No phone"} · {client.email ?? "No email"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Pet & stay */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Pet & stay</SectionHeading>
            <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-card p-4">
              {/* Pet */}
              <Field label="Pet">
                <Select value={petName} onValueChange={setPetName} disabled={!client}>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder={client ? "Select pet" : "Pick a pet parent first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(client?.pets ?? []).map((p) => (
                      <SelectItem key={p.name} value={p.name}>
                        {p.name} · {p.size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pet ? (
                  <span className="text-xs text-muted-foreground">
                    {pet.breed ?? "Not defined"} · {pet.size}
                  </span>
                ) : null}
              </Field>

              {/* Service */}
              <Field label="Service">
                <Select value={serviceId} onValueChange={setServiceId}>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOARDING_SERVICES.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} · {formatAed(s.ratePerNightMinor)}/night
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check in">
                  <DatePicker value={checkIn} onChange={setCheckIn} />
                </Field>
                <Field label="Check out">
                  <DatePicker
                    value={checkOut}
                    onChange={setCheckOut}
                    disableBefore={checkIn ? new Date(`${checkIn}T00:00:00`) : undefined}
                  />
                </Field>
              </div>

              {/* Room */}
              <Field label="Room">
                <Select value={roomId} onValueChange={setRoomId}>
                  <SelectTrigger className="h-12 w-full">
                    <SelectValue placeholder="Assign a room" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {BOARDING_FACILITIES.map((f) => (
                      <SelectGroup key={f.id}>
                        <SelectLabel>{f.name}</SelectLabel>
                        {BOARDING_ROOMS.filter((r) => r.facilityId === f.id).map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Add-ons */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Add-ons</SectionHeading>
            <div className="flex flex-col gap-1 rounded-2xl border border-border/60 bg-card p-2">
              {BOARDING_ADD_ON_CATALOG.map((a) => (
                <label
                  key={a.id}
                  htmlFor={`boarding-addon-${a.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/40"
                >
                  <Checkbox
                    id={`boarding-addon-${a.id}`}
                    checked={addOnIds.includes(a.id)}
                    onCheckedChange={() => toggleAddOn(a.id)}
                  />
                  <span className="flex-1 text-sm text-foreground">{a.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {formatAed(a.priceMinor)}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="flex flex-col gap-3">
            <SectionHeading>Notes</SectionHeading>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Care instructions, feeding, meds…"
              className="min-h-24 bg-card"
            />
          </section>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-muted-foreground">Total</span>
            <span className="text-base font-semibold tabular-nums text-foreground">
              {formatAed(totalMinor)}
              {nights > 0 ? (
                <span className="text-xs font-normal text-muted-foreground">
                  {" "}
                  ({nights} Nights)
                </span>
              ) : null}
            </span>
          </div>
          <Button
            type="button"
            radius="full"
            className={cn("flex-1")}
            disabled={!canSave}
            onClick={() => onOpenChange(false)}
          >
            Book stay
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </div>
  )
}
