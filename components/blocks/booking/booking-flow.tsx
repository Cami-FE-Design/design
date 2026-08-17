"use client"

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarPlusIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ClockIcon,
  Loader2Icon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

import { ServicePicker } from "@/components/blocks/booking/service-picker"
import { DayPicker, TimeList } from "@/components/blocks/booking/slot-picker"
import { PhoneField } from "@/components/blocks/phone-field"
import { Avatar, type AvatarSpecies } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OtpInput } from "@/components/ui/otp-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import {
  BOOKING_DAYS,
  BOOKING_STAFF,
  bookingRef,
  businessHasPets,
  type CatalogService,
  EMPTY_PICKUP_DETAILS,
  findCatalogService,
  findClientByPhone,
  PET_SPECIES_OPTIONS,
  type PickupDetails,
  type ReturningClient,
  resolvePickupAddress,
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
  const staffRailRef = useRef<HTMLDivElement>(null)
  const scrollStaff = (dir: -1 | 1) =>
    staffRailRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" })

  return (
    <div className="flex flex-col gap-5">
      <StepHeading title="Pick a time" hint="Choose a team member, day, and slot." />

      {/* Team member */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-foreground text-sm">Team member</span>
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              aria-label="Scroll team left"
              onClick={() => scrollStaff(-1)}
              className="flex size-7 items-center justify-center rounded-full hover:bg-muted/60"
            >
              <ChevronLeftIcon className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll team right"
              onClick={() => scrollStaff(1)}
              className="flex size-7 items-center justify-center rounded-full hover:bg-muted/60"
            >
              <ChevronRightIcon className="size-4" />
            </button>
          </div>
        </div>
        <div
          ref={staffRailRef}
          className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5 [mask-image:linear-gradient(to_right,black_0,black_calc(100%-72px),transparent_100%)]"
        >
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
        "flex w-24 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 transition-colors",
        active ? "border-cami-violet-8 bg-cami-violet-3" : "border-border/60 hover:bg-muted/40",
      )}
    >
      {avatarName ? <Avatar size="md" name={avatarName} fallback="initials" /> : null}
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

export type Customer = {
  firstName: string
  lastName: string
  /** Dial code, kept separate from the number so the field can offer a picker. */
  phoneCode: string
  /** National number without the dial code. */
  phone: string
  email: string
}

/** Dial code + number as one displayable string. */
export function formatCustomerPhone(customer: Customer): string {
  return `${customer.phoneCode} ${customer.phone}`.trim()
}

// Returning-user phone 2FA — mirrors the operator sign-in verify screen.
type VerifyState = "idle" | "verifying" | "success" | "error"
const CODE_LENGTH = 6
const RESEND_SECONDS = 30

function formatCountdown(s: number) {
  const m = Math.floor(s / 60)
    .toString()
    .padStart(2, "0")
  const ss = (s % 60).toString().padStart(2, "0")
  return `${m}:${ss}`
}

// Name + species inputs — shared by new-client capture and the "add a new pet"
// branch of the returning-client picker.
function PetDetailsFields({ pet, onPet }: { pet: NewPet; onPet: (p: NewPet) => void }) {
  return (
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
          <SelectTrigger
            id="pet-species"
            className="w-full rounded-2xl bg-input px-4 font-medium data-[size=default]:h-12"
          >
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
  )
}

// Pickup + pet notes. Rendered in both identify branches (returning and new)
// so the parent is asked the same two things either way.
function PickupAndNotesFields({
  pickup,
  onPickup,
  savedAddress,
}: {
  pickup: PickupDetails
  onPickup: (p: PickupDetails) => void
  savedAddress?: string
}) {
  const set = (patch: Partial<PickupDetails>) => onPickup({ ...pickup, ...patch })
  const showAddressInput = !pickup.useSavedAddress || !savedAddress

  return (
    <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
      <label htmlFor="needs-pickup" className="flex cursor-pointer items-start gap-3">
        <Checkbox
          id="needs-pickup"
          checked={pickup.needsPickup}
          onCheckedChange={(value) => set({ needsPickup: value === true })}
          className="mt-0.5"
        />
        <span className="flex flex-col gap-0.5 leading-tight">
          <span className="text-sm font-medium text-foreground">I need pickup</span>
          <span className="text-xs text-muted-foreground">
            We&apos;ll collect your pet instead of you dropping them off.
          </span>
        </span>
      </label>

      {pickup.needsPickup ? (
        <div className="flex flex-col gap-3 pl-7">
          {savedAddress ? (
            <label htmlFor="use-saved-address" className="flex cursor-pointer items-center gap-3">
              <Checkbox
                id="use-saved-address"
                checked={pickup.useSavedAddress}
                onCheckedChange={(value) => set({ useSavedAddress: value === true })}
              />
              <span className="text-sm text-foreground">Use my saved address</span>
            </label>
          ) : null}

          {pickup.useSavedAddress && savedAddress ? (
            <div className="flex items-start gap-2 rounded-xl bg-cami-sage-2 p-3 text-sm text-cami-sage-12">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              {savedAddress}
            </div>
          ) : null}

          {showAddressInput ? (
            <div className="group flex flex-col gap-1.5">
              <Label htmlFor="pickup-address">Pickup address</Label>
              <Input
                id="pickup-address"
                placeholder="Villa / apartment, street, area"
                value={pickup.address}
                onChange={(e) => set({ address: e.target.value })}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="group flex flex-col gap-1.5">
        <Label htmlFor="pet-notes">
          Anything we should know?{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id="pet-notes"
          placeholder="Allergies, behavior, handling instructions…"
          value={pickup.petNotes}
          onChange={(e) => set({ petNotes: e.target.value })}
          className="min-h-24"
        />
      </div>
    </div>
  )
}

// Sentinel picker value for "not one of my saved pets — add a new one".
const ADD_PET = "__new__"

function IdentifyStep({
  hasPets,
  customer,
  onChange,
  pet,
  onPet,
  pickup,
  onPickup,
}: {
  hasPets: boolean
  customer: Customer
  onChange: (c: Customer) => void
  pet: NewPet
  onPet: (p: NewPet) => void
  pickup: PickupDetails
  onPickup: (p: PickupDetails) => void
}) {
  // Linear sub-flow: phone → code → details. No first-visit fork; phone + OTP is
  // the single entry, and we resolve who the caller is on verify.
  const [authPhase, setAuthPhase] = useState<"phone" | "code" | "details">("phone")
  const [code, setCode] = useState("")
  const [verifyState, setVerifyState] = useState<VerifyState>("idle")
  const [seconds, setSeconds] = useState(RESEND_SECONDS)
  // The resolved client record (null = no account on file = new registration).
  const [resolved, setResolved] = useState<ReturningClient | null>(null)
  // Which saved pet is selected, or ADD_PET. Only meaningful for a returning
  // client with pets on file.
  const [petChoice, setPetChoice] = useState<string>("")
  const set = (patch: Partial<Customer>) => onChange({ ...customer, ...patch })

  const known = resolved !== null
  const savedPets = resolved?.pets ?? []

  // Resend countdown, only while the code screen is showing.
  useEffect(() => {
    if (authPhase !== "code" || seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [authPhase, seconds])

  // Auto-verify the moment 6 digits are entered — no manual submit. Demo: any
  // code starting with "0" fails; everything else succeeds.
  useEffect(() => {
    if (authPhase !== "code" || code.length !== CODE_LENGTH) return
    let cancelled = false
    setVerifyState("verifying")
    const check = setTimeout(() => {
      if (cancelled) return
      if (code.startsWith("0")) {
        setVerifyState("error")
        setCode("")
      } else {
        setVerifyState("success")
      }
    }, 1200)
    return () => {
      cancelled = true
      clearTimeout(check)
    }
  }, [authPhase, code])

  // On success, hold the "Verified" state briefly, then resolve the caller by
  // phone: a record on file pre-fills the form + default-selects a saved pet;
  // no record leaves an empty registration form. Either way, advance to details.
  useEffect(() => {
    if (verifyState !== "success") return
    const t = setTimeout(() => {
      const client = findClientByPhone(customer.phone)
      setResolved(client)
      if (client) {
        onChange({
          firstName: client.firstName,
          lastName: client.lastName,
          phoneCode: customer.phoneCode,
          phone: customer.phone,
          email: client.email,
        })
        if (hasPets && client.pets.length > 0) {
          const first = client.pets[0]!
          setPetChoice(first.id)
          onPet({ name: first.name, species: first.species })
        }
      }
      setAuthPhase("details")
    }, 700)
    return () => clearTimeout(t)
  }, [verifyState, customer.phone, customer.phoneCode, hasPets, onChange, onPet])

  function requestCode() {
    setAuthPhase("code")
    setSeconds(RESEND_SECONDS)
    setCode("")
    setVerifyState("idle")
  }

  function choosePet(v: string) {
    setPetChoice(v)
    if (v === ADD_PET) {
      onPet({ name: "", species: "dog" })
      return
    }
    const p = savedPets.find((x) => x.id === v)
    if (p) onPet({ name: p.name, species: p.species })
  }

  const isLocked = verifyState === "verifying" || verifyState === "success"

  // ── Phone entry ───────────────────────────────────────────────────────────
  if (authPhase === "phone") {
    return (
      <div className="flex flex-col gap-5">
        <StepHeading
          title="Let's confirm it's you"
          hint="Enter your mobile number — we'll text a 6-digit code."
        />
        <PhoneField
          id="ret-phone"
          label="Mobile number"
          code={customer.phoneCode}
          number={customer.phone}
          onCodeChange={(phoneCode) => set({ phoneCode })}
          onNumberChange={(phone) => set({ phone })}
        />
        <Button
          variant="outline"
          radius="full"
          size="lg"
          className="w-full"
          disabled={customer.phone.trim().length === 0}
          onClick={requestCode}
        >
          Send code
        </Button>
      </div>
    )
  }

  // ── Code entry ────────────────────────────────────────────────────────────
  if (authPhase === "code") {
    return (
      <div className="flex flex-col gap-5">
        <StepHeading
          title={`Enter the code we sent to ${formatCustomerPhone(customer)}`}
          hint="This helps us keep your account secure."
        />
        <div className="flex flex-col items-start gap-3">
          <OtpInput
            value={code}
            onValueChange={(v) => {
              if (isLocked) return
              if (verifyState === "error") setVerifyState("idle")
              setCode(v)
            }}
            disabled={isLocked}
            invalid={verifyState === "error"}
            className="justify-start"
          />
          <div className="flex h-5 items-center text-sm">
            {verifyState === "verifying" ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin" aria-hidden />
                Verifying…
              </span>
            ) : verifyState === "success" ? (
              <span className="flex items-center gap-2 font-medium text-foreground">
                <CheckIcon className="size-4" aria-hidden />
                Verified
              </span>
            ) : verifyState === "error" ? (
              <span role="alert" className="text-destructive">
                That code didn&apos;t match. Try again.
              </span>
            ) : null}
          </div>
        </div>
        <div
          className={cn("flex items-center justify-center gap-4 text-sm", isLocked && "invisible")}
        >
          {seconds > 0 ? (
            <span className="text-muted-foreground">
              Request a new code in{" "}
              <strong className="font-medium tabular-nums">{formatCountdown(seconds)}</strong>
            </span>
          ) : (
            <button
              type="button"
              onClick={requestCode}
              className="link font-medium text-muted-foreground"
            >
              Request a new code
            </button>
          )}
          <span className="text-border">·</span>
          <button
            type="button"
            onClick={() => {
              setAuthPhase("phone")
              setCode("")
              setVerifyState("idle")
            }}
            className="link font-medium text-muted-foreground"
          >
            Use a different number
          </button>
        </div>
      </div>
    )
  }

  // ── Details (post-verify) ─────────────────────────────────────────────────
  // "Who's coming in?" pet block — a saved-pet picker (returning, pets on file)
  // or inline capture (new pet). Reused across returning + new branches.
  const selectedPet = petChoice === ADD_PET ? null : savedPets.find((p) => p.id === petChoice)
  // Just the control (picker or inline capture), no header — the caller supplies
  // the heading (big StepHeading when it's the whole step, small when a subsection).
  const petControl =
    savedPets.length > 0 ? (
      <div className="flex flex-col gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background px-3 py-2.5 text-start transition-colors hover:bg-muted/40"
            >
              {selectedPet ? (
                <>
                  <Avatar
                    name={selectedPet.name}
                    fallback="species"
                    species={selectedPet.species}
                    src={selectedPet.photoUrl}
                    size="md"
                    shape="circle"
                  />
                  <div className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {selectedPet.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {selectedPet.breed}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 text-muted-foreground">
                    <PlusIcon className="size-4" aria-hidden />
                  </span>
                  <span className="flex-1 text-start text-sm font-medium text-foreground">
                    New friend
                  </span>
                </>
              )}
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-dropdown-menu-trigger-width)]"
          >
            {savedPets.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onSelect={() => choosePet(p.id)}
                className="items-center gap-2.5"
              >
                <Avatar
                  name={p.name}
                  fallback="species"
                  species={p.species}
                  src={p.photoUrl}
                  size="sm"
                  shape="circle"
                />
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">{p.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{p.breed}</span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              onSelect={() => choosePet(ADD_PET)}
              className="items-center gap-2.5 text-cami-violet-11"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-dashed border-muted-foreground/40">
                <PlusIcon className="size-3.5" aria-hidden />
              </span>
              New friend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {petChoice === ADD_PET ? <PetDetailsFields pet={pet} onPet={onPet} /> : null}
      </div>
    ) : (
      <PetDetailsFields pet={pet} onPet={onPet} />
    )

  // Returning client: name/phone/email are all on file — skip the form and only
  // ask which pet is coming in (non-pet businesses go straight to review).
  if (known) {
    return (
      <div className="flex flex-col gap-5">
        {hasPets ? (
          <>
            <StepHeading
              title="Who's coming in?"
              hint="Choose a pet from your account, or add a new one."
            />
            {petControl}
          </>
        ) : (
          <StepHeading title="Welcome back" hint="You're verified — review your booking next." />
        )}
        <PickupAndNotesFields
          pickup={pickup}
          onPickup={onPickup}
          savedAddress={resolved?.address}
        />
      </div>
    )
  }

  // New client: empty registration form. Phone is the verified key, so it's
  // shown disabled; pet is captured inline (feature-flagged).
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
      <div className="flex flex-col gap-1.5">
        <PhoneField
          id="phone"
          label="Mobile number"
          code={customer.phoneCode}
          number={customer.phone}
          onCodeChange={() => undefined}
          onNumberChange={() => undefined}
          disabled
        />
        <p className="text-xs text-muted-foreground">
          Verified. We send your confirmation and reminders here on Email / SMS / WhatsApp.
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
      {hasPets ? (
        <div className="flex flex-col gap-4 border-t border-border/60 pt-5">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-foreground">Who&apos;s coming in?</span>
            <span className="text-xs text-muted-foreground">
              Add your pet — you can add more from your account later.
            </span>
          </div>
          {petControl}
        </div>
      ) : null}
      <PickupAndNotesFields pickup={pickup} onPickup={onPickup} />
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
  pickupAddress,
  petNotes,
}: {
  business: PublicBusiness
  services: ReadonlyArray<CatalogService>
  whenLabel: string
  staffLabel: string
  petLabel?: string
  customerLabel: string
  pickupAddress?: string
  petNotes?: string
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
        {pickupAddress ? <SummaryRow label="Pickup" value={pickupAddress} /> : null}
        {petNotes ? <SummaryRow label="Notes" value={petNotes} /> : null}
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
  // Pet is picked/captured inside Identify after phone verify (feature-flagged),
  // not a separate step — see docs/specs/PRO-80.
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
    phoneCode: "+971",
    phone: "",
    email: "",
  })
  const [pet, setPet] = useState<NewPet>({ name: "", species: "dog" })
  const [pickup, setPickup] = useState<PickupDetails>(EMPTY_PICKUP_DETAILS)

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
  // Same resolver the identify step uses, so the review line shows whichever
  // address will actually be collected from.
  const pickupAddressLabel =
    resolvePickupAddress(pickup, findClientByPhone(customer.phone)?.address) ?? undefined
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
        pickup={pickup}
        onPickup={setPickup}
      />
    ) : services.length > 0 ? (
      <ConfirmStep
        business={business}
        services={services}
        whenLabel={whenLabel}
        staffLabel={staffLabel}
        petLabel={petLabel}
        customerLabel={customerLabel || "You"}
        pickupAddress={pickupAddressLabel}
        petNotes={pickup.petNotes.trim() || undefined}
      />
    ) : null

  return (
    <main className="relative flex min-h-dvh flex-col bg-background">
      <div className="relative mx-auto flex w-full max-w-[460px] flex-1 flex-col px-5 pb-6 lg:max-w-[960px] lg:pb-10">
        {/* Top bar: back + progress (sticky). Frosted bg + a soft skirt below so
            content scrolling underneath fades out instead of colliding. */}
        <div className="-mx-5 sticky top-0 z-20 mb-6 flex flex-col gap-3 bg-background/85 px-5 pt-6 pb-4 backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-6 after:bg-gradient-to-b after:from-background after:to-transparent lg:pt-10">
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
