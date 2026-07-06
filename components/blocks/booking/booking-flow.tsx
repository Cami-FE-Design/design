"use client"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarPlusIcon,
  CheckIcon,
  ChevronUpIcon,
  ClockIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ServicePicker } from "@/components/blocks/booking/service-picker"
import { DayPicker, TimeList } from "@/components/blocks/booking/slot-picker"
import { PublicTopGradient } from "@/components/blocks/public-top-gradient"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  BOOKING_DAYS,
  BOOKING_STAFF,
  bookingRef,
  businessHasPets,
  type CatalogService,
  findCatalogService,
  PET_SPECIES_OPTIONS,
  serviceTotals,
} from "@/lib/booking"
import { formatDuration, formatPriceAed, type PublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"

// Luma single-column flow, sibling to checkout-flow. ONE flat surface, hairline
// rules + whitespace between sections. Violet = the live selection accent;
// the dark primary button is always the forward action.

type StepId = "service" | "slot" | "identify" | "confirm"

// ─── Shared bits ──────────────────────────────────────────────────────────────

function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

// ─── Step 1 — Service (multi-select, categorized) ─────────────────────────────

function ServiceStep({
  selectedIds,
  onToggle,
}: {
  selectedIds: ReadonlyArray<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Select services" hint="Add one or more — pick a category to browse." />
      <ServicePicker selectedIds={selectedIds} onToggle={onToggle} />
    </div>
  )
}

// ─── Step 2 — Slot ────────────────────────────────────────────────────────────

function SlotStep({
  staffId,
  onStaff,
  dayId,
  onDay,
  time,
  onTime,
}: {
  staffId: string
  onStaff: (id: string) => void
  dayId: string
  onDay: (id: string) => void
  time: string | null
  onTime: (t: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Pick a time" hint="Choose a team member, day, and slot." />

      {/* Team member */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Team member</span>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
          <StaffChip
            active={staffId === "any"}
            onSelect={() => onStaff("any")}
            label="Any"
            sub="Soonest"
          />
          {BOOKING_STAFF.map((s) => (
            <StaffChip
              key={s.id}
              active={staffId === s.id}
              onSelect={() => onStaff(s.id)}
              label={s.name.split(" ")[0]!}
              sub={s.role}
              avatarName={s.name}
            />
          ))}
        </div>
      </div>

      {/* Day — circle picker with month header */}
      <DayPicker dayId={dayId} onDay={onDay} />

      {/* Available times — full-width stacked rows */}
      <TimeList time={time} onTime={onTime} />

      {time ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ClockIcon className="size-3.5" />
          We&apos;ll hold this slot for 5 minutes while you finish.
        </p>
      ) : null}
    </div>
  )
}

function StaffChip({
  active,
  onSelect,
  label,
  sub,
  avatarName,
}: {
  active: boolean
  onSelect: () => void
  label: string
  sub: string
  avatarName?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-2xl border px-2 py-3 transition-colors",
        active ? "border-cami-violet-8 bg-cami-violet-3" : "border-border/60 hover:bg-muted/40",
      )}
    >
      {avatarName ? (
        <Avatar size="md" name={avatarName} fallback="initials" />
      ) : (
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
          Any
        </span>
      )}
      <span className="flex flex-col items-center leading-tight">
        <span
          className={cn("text-xs font-medium", active ? "text-cami-violet-12" : "text-foreground")}
        >
          {label}
        </span>
        <span className="max-w-full truncate text-[10px] text-muted-foreground">{sub}</span>
      </span>
    </button>
  )
}

// ─── Step 3 — Identify ────────────────────────────────────────────────────────

export type Customer = { firstName: string; lastName: string; phone: string; email: string }

function IdentifyStep({
  hasPets,
  customer,
  onChange,
  pet,
  onPet,
}: {
  hasPets: boolean
  customer: Customer
  onChange: (c: Customer) => void
  pet: NewPet
  onPet: (p: NewPet) => void
}) {
  const [returning, setReturning] = useState(false)
  const set = (patch: Partial<Customer>) => onChange({ ...customer, ...patch })

  if (returning) {
    return (
      <div className="flex flex-col gap-5">
        <StepHeading title="Welcome back" hint="We'll text you a link to sign in — no password." />
        <div className="group flex flex-col gap-1.5">
          <Label htmlFor="ret-phone">Mobile number</Label>
          <Input
            id="ret-phone"
            inputMode="tel"
            placeholder="+971 50 123 4567"
            value={customer.phone}
            onChange={(e) => set({ phone: e.target.value })}
          />
        </div>
        <Button variant="outline" radius="full" size="lg" className="w-full">
          Send me a link
        </Button>
        <button
          type="button"
          onClick={() => setReturning(false)}
          className="link mx-auto w-fit text-sm font-medium text-muted-foreground"
        >
          First time here? Add your details
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Your details" hint="So we can confirm and send reminders." />
      <div className="grid grid-cols-2 gap-3">
        <div className="group flex flex-col gap-1.5">
          <Label htmlFor="first">First name</Label>
          <Input
            id="first"
            placeholder="Michelle"
            value={customer.firstName}
            onChange={(e) => set({ firstName: e.target.value })}
          />
        </div>
        <div className="group flex flex-col gap-1.5">
          <Label htmlFor="last">
            Last name <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="last"
            placeholder="You"
            value={customer.lastName}
            onChange={(e) => set({ lastName: e.target.value })}
          />
        </div>
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="phone">Mobile number</Label>
        <Input
          id="phone"
          inputMode="tel"
          placeholder="+971 50 123 4567"
          value={customer.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          We send your confirmation and reminders here on WhatsApp.
        </p>
      </div>
      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="email">
          Email <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          placeholder="you@email.com"
          value={customer.email}
          onChange={(e) => set({ email: e.target.value })}
        />
      </div>
      {/* Pet capture — feature-flagged by the pet module. A first-time booker
          has no pet on file, so it's collected inline here, not a separate step. */}
      {hasPets ? (
        <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Who&apos;s coming in?</span>
            <span className="text-xs text-muted-foreground">
              Add your pet — you can add more from your account later.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="pet-name">Pet name</Label>
              <Input
                id="pet-name"
                placeholder="Bella"
                value={pet.name}
                onChange={(e) => onPet({ ...pet, name: e.target.value })}
              />
            </div>
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="pet-species">Species</Label>
              <Select
                value={pet.species}
                onValueChange={(v) => onPet({ ...pet, species: v as AvatarSpecies })}
              >
                <SelectTrigger id="pet-species" className="h-12 w-full rounded-2xl bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PET_SPECIES_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setReturning(true)}
        className="link mx-auto w-fit text-sm font-medium text-muted-foreground"
      >
        Booked here before? Sign in
      </button>
    </div>
  )
}

// ─── Pet capture lives inside Identify (feature-flagged by hasPets) ───────────

export type NewPet = { name: string; species: AvatarSpecies }

// ─── Confirm ──────────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function ConfirmStep({
  business,
  services,
  whenLabel,
  staffLabel,
  petLabel,
  customerLabel,
}: {
  business: PublicBusiness
  services: ReadonlyArray<CatalogService>
  whenLabel: string
  staffLabel: string
  petLabel?: string
  customerLabel: string
}) {
  const total = services.reduce((n, s) => n + s.priceAed, 0)
  const duration = services.reduce((n, s) => n + s.durationMinutes, 0)
  const subtotal = Math.round(total / 1.05)
  const vat = total - subtotal

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Review & confirm" hint="One last look before we lock it in." />

      <div className="flex items-center gap-3">
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
          <span className="text-sm text-muted-foreground">{whenLabel}</span>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-border/60 border-y border-border/60">
        {services.map((s) => (
          <div key={s.id} className="flex items-start justify-between gap-3 py-2.5">
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="text-sm font-medium text-foreground">{s.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDuration(s.durationMinutes)}
              </span>
            </div>
            <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
              {formatPriceAed(s.priceAed)}
            </span>
          </div>
        ))}
        <SummaryRow label="With" value={staffLabel} />
        {petLabel ? <SummaryRow label="Pet" value={petLabel} /> : null}
        <SummaryRow label="Booked by" value={customerLabel} />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between py-1 text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="tabular-nums text-muted-foreground">{formatPriceAed(subtotal)}</span>
        </div>
        <div className="flex items-baseline justify-between py-1 text-sm">
          <span className="text-muted-foreground">VAT (5%)</span>
          <span className="tabular-nums text-muted-foreground">{formatPriceAed(vat)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-border/60 pt-3">
          <div className="flex flex-col leading-tight">
            <span className="text-base font-medium text-foreground">Total</span>
            <span className="text-xs text-muted-foreground">
              {services.length} {services.length === 1 ? "service" : "services"} ·{" "}
              {formatDuration(duration)}
            </span>
          </div>
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-foreground">
            {formatPriceAed(total)}
          </span>
        </div>
      </div>

      <p className="rounded-2xl bg-sand-3 px-4 py-3 text-sm text-sand-11">
        Nothing to pay now — settle at the salon after your appointment.
      </p>
    </div>
  )
}

// ─── Done ─────────────────────────────────────────────────────────────────────

function DoneState({
  business,
  whenLabel,
  reference,
}: {
  business: PublicBusiness
  whenLabel: string
  reference: string
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-cami-green-3 text-cami-green-11">
          <CheckIcon className="size-7" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            You&apos;re booked
          </h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            We sent your confirmation to WhatsApp. {business.displayName} is expecting you.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-border/60 p-4">
        <div className="flex items-baseline justify-between py-1.5 text-sm">
          <span className="text-muted-foreground">When</span>
          <span className="font-medium text-foreground">{whenLabel}</span>
        </div>
        <div className="flex items-baseline justify-between py-1.5 text-sm">
          <span className="text-muted-foreground">Reference</span>
          <span className="font-medium tabular-nums text-foreground">{reference}</span>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <Button asChild radius="full" size="lg" className="w-full">
          <Link href={`/${business.slug}/booking/${reference}`}>Manage booking</Link>
        </Button>
        <Button variant="outline" radius="full" size="lg" className="w-full gap-2">
          <CalendarPlusIcon className="size-4" />
          Add to calendar
        </Button>
      </div>
    </div>
  )
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

// ─── Desktop summary panel (sticky cart, lg+) ─────────────────────────────────

function DesktopSummary({
  business,
  services,
  totals,
  whenLabel,
  hasSlot,
  canContinue,
  isLast,
  onCta,
}: {
  business: PublicBusiness
  services: ReadonlyArray<CatalogService>
  totals: { count: number; durationMinutes: number; priceAed: number }
  whenLabel: string
  hasSlot: boolean
  canContinue: boolean
  isLast: boolean
  onCta: () => void
}) {
  const address = [business.street, business.city, business.emirate].filter(Boolean).join(", ")

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-card p-5 shadow-md ring-1 ring-foreground/5 lg:min-h-[540px] dark:ring-foreground/10">
      <div className="flex items-center gap-3">
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
          <span className="truncate text-xs text-muted-foreground">{address}</span>
        </div>
      </div>

      <div className="border-border/60 border-t pt-4">
        {services.length > 0 ? (
          <div className="flex flex-col divide-y divide-border/60">
            {services.map((s) => (
              <div key={s.id} className="flex items-start justify-between gap-3 py-2.5">
                <div className="flex min-w-0 flex-col leading-tight">
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatDuration(s.durationMinutes)}
                    {hasSlot ? ` · ${whenLabel}` : ""}
                  </span>
                </div>
                <span className="shrink-0 font-medium text-foreground text-sm tabular-nums">
                  {formatPriceAed(s.priceAed)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Add a service to see your booking summary.
          </p>
        )}
      </div>

      {totals.count > 0 ? (
        <div className="flex items-center justify-between border-border/60 border-t pt-4">
          <div className="flex flex-col leading-tight">
            <span className="font-medium text-base text-foreground">Total</span>
            <span className="text-muted-foreground text-xs">
              {totals.count} {totals.count === 1 ? "service" : "services"} ·{" "}
              {formatDuration(totals.durationMinutes)}
            </span>
          </div>
          <span className="font-semibold text-foreground text-lg tabular-nums">
            {formatPriceAed(totals.priceAed)}
          </span>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 pt-6">
        <Button
          radius="full"
          size="lg"
          className="w-full gap-2"
          disabled={!canContinue}
          onClick={onCta}
        >
          {isLast ? "Confirm booking" : "Continue"}
          {!isLast ? <ArrowRightIcon className="size-4" /> : null}
        </Button>

        {isLast ? (
          <p className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
            <ShieldCheckIcon className="size-3.5" />
            Free cancellation up to 24 hours before.
          </p>
        ) : null}
      </div>
    </div>
  )
}

export function BookingFlow({ business }: { business: PublicBusiness }) {
  const hasPets = businessHasPets(business)
  // Pet is captured inside Identify (feature-flagged), not a separate step.
  const steps: StepId[] = ["service", "slot", "identify", "confirm"]

  const [stepIndex, setStepIndex] = useState(0)
  const [done, setDone] = useState(false)
  const [breakdownOpen, setBreakdownOpen] = useState(false)

  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [staffId, setStaffId] = useState("any")
  const [dayId, setDayId] = useState(BOOKING_DAYS[0]!.id)
  const [time, setTime] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Customer>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  })
  const [pet, setPet] = useState<NewPet>({ name: "", species: "dog" })

  const step = steps[stepIndex]!
  const services = serviceIds.map(findCatalogService).filter(Boolean) as CatalogService[]
  const totals = serviceTotals(serviceIds)

  function toggleService(id: string) {
    setServiceIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const day = BOOKING_DAYS.find((d) => d.id === dayId)!
  const whenLabel = `${day.label ?? `${day.weekday} ${day.dayNum}`}${time ? ` · ${time}` : ""}`
  const staffLabel =
    staffId === "any"
      ? "Any team member"
      : (BOOKING_STAFF.find((s) => s.id === staffId)?.name ?? "Any team member")
  const petLabel = hasPets && pet.name.trim() ? pet.name : undefined
  const customerLabel = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim()

  const canContinue =
    step === "service"
      ? serviceIds.length > 0
      : step === "slot"
        ? Boolean(time)
        : step === "identify"
          ? customer.firstName.trim().length > 0 &&
            customer.phone.trim().length > 0 &&
            (!hasPets || pet.name.trim().length > 0)
          : true

  const isLast = stepIndex === steps.length - 1

  function back() {
    if (stepIndex === 0) {
      window.location.href = `/${business.slug}`
      return
    }
    setStepIndex((i) => i - 1)
  }

  function next() {
    if (isLast) {
      setDone(true)
      return
    }
    setStepIndex((i) => i + 1)
  }

  const reference = serviceIds[0] ? bookingRef(serviceIds[0], dayId, time ?? "") : "CAMI-0000"

  if (done) {
    return (
      <main className="relative flex min-h-dvh flex-col bg-background">
        <PublicTopGradient />
        <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 py-6">
          <div className="flex flex-1 flex-col">
            <DoneState business={business} whenLabel={whenLabel} reference={reference} />
          </div>
          <p className="mt-auto pt-6 text-center text-xs text-muted-foreground">Powered by Cami</p>
        </div>
      </main>
    )
  }

  const stepBody =
    step === "service" ? (
      <ServiceStep selectedIds={serviceIds} onToggle={toggleService} />
    ) : step === "slot" ? (
      <SlotStep
        staffId={staffId}
        onStaff={setStaffId}
        dayId={dayId}
        onDay={setDayId}
        time={time}
        onTime={setTime}
      />
    ) : step === "identify" ? (
      <IdentifyStep
        hasPets={hasPets}
        customer={customer}
        onChange={setCustomer}
        pet={pet}
        onPet={setPet}
      />
    ) : services.length > 0 ? (
      <ConfirmStep
        business={business}
        services={services}
        whenLabel={whenLabel}
        staffLabel={staffLabel}
        petLabel={petLabel}
        customerLabel={customerLabel || "You"}
      />
    ) : null

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <PublicTopGradient />
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pb-6 lg:max-w-[960px] lg:pb-10">
        {/* Top bar: back + progress (sticky) */}
        <div className="-mx-5 sticky top-0 z-20 mb-6 flex flex-col gap-3 px-5 pt-6 pb-4 lg:pt-10">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" radius="full" onClick={back} aria-label="Go back">
              <ArrowLeftIcon className="size-5" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              Step {stepIndex + 1} of {steps.length}
            </span>
          </div>
          <div className="flex gap-1.5" aria-hidden>
            {steps.map((s, i) => (
              <span
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= stepIndex ? "bg-cami-violet-9" : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>

        {/* Content: single column on mobile, step + sticky summary on desktop */}
        <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
          <div className="flex flex-col">{stepBody}</div>
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <DesktopSummary
              business={business}
              services={services}
              totals={totals}
              whenLabel={whenLabel}
              hasSlot={Boolean(time)}
              canContinue={canContinue}
              isLast={isLast}
              onCta={next}
            />
          </aside>
        </div>

        {/* Mobile footer — hidden on desktop (the summary panel carries the CTA) */}
        {step === "service" ? (
          <div className="sticky bottom-0 mt-6 flex items-center justify-between gap-3 border-border/60 border-t bg-background/90 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              onClick={() => totals.count > 0 && setBreakdownOpen(true)}
              disabled={totals.count === 0}
              className="flex flex-col items-start leading-tight disabled:opacity-60"
            >
              <span className="font-semibold text-foreground text-lg tabular-nums">
                {formatPriceAed(totals.priceAed)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <ShoppingBagIcon className="size-3.5" />
                {totals.count} {totals.count === 1 ? "service" : "services"}
                {totals.count > 0 ? ` · ${formatDuration(totals.durationMinutes)}` : ""}
                {totals.count > 0 ? <ChevronUpIcon className="size-3.5" /> : null}
              </span>
            </button>
            <Button
              radius="full"
              size="lg"
              className="gap-2"
              disabled={!canContinue}
              onClick={next}
            >
              Continue
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="sticky bottom-0 mt-6 flex flex-col gap-2 bg-background/80 pt-3 pb-2 backdrop-blur lg:hidden">
            <Button
              radius="full"
              size="lg"
              className="w-full"
              disabled={!canContinue}
              onClick={next}
            >
              {isLast ? "Confirm booking" : "Continue"}
            </Button>
            {isLast ? (
              <p className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs">
                <ShieldCheckIcon className="size-3.5" />
                Free cancellation up to 24 hours before.
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Price breakdown sheet — opened from the bottom bar total */}
      <Sheet open={breakdownOpen} onOpenChange={setBreakdownOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="max-h-[80dvh] overflow-y-auto"
        >
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="font-semibold text-lg">Price breakdown</SheetTitle>
            <SheetClose asChild>
              <button
                type="button"
                aria-label="Close"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted/60"
              >
                <XIcon className="size-5" />
              </button>
            </SheetClose>
          </SheetHeader>
          <div className="mx-auto flex w-full max-w-[460px] flex-col px-4 pb-6">
            <div className="flex flex-col divide-y divide-border/60">
              {services.map((s) => (
                <div key={s.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="flex min-w-0 flex-col leading-tight">
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(s.durationMinutes)} with any professional
                    </span>
                  </div>
                  <span className="shrink-0 text-sm font-medium tabular-nums text-foreground">
                    {formatPriceAed(s.priceAed)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-base font-semibold text-foreground">Total</span>
              <span className="text-base font-semibold tabular-nums text-foreground">
                {formatPriceAed(totals.priceAed)}
              </span>
            </div>
            <Button
              radius="full"
              size="lg"
              className="mt-5 w-full gap-2"
              onClick={() => {
                setBreakdownOpen(false)
                next()
              }}
            >
              Continue
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
