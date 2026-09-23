"use client"

import { CheckIcon, FileTextIcon, GlobeIcon, type LucideIcon, PaletteIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { SelectPackageServicesDialog } from "@/components/blocks/select-package-services-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { Package } from "@/lib/packages/catalog"
import { cn } from "@/lib/utils"

// ─── Local helpers ────────────────────────────────────────────────────────────

function SubSection({
  title,
  description,
  children,
}: {
  title?: string
  description?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      {title || description ? (
        <div className="flex flex-col gap-1">
          {title ? (
            <h3 className="font-heading text-2xl font-semibold leading-9 text-foreground">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="text-sm leading-5 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2">{children}</div>
}

function PriceInput({
  id,
  value,
  onChange,
  disabled,
}: {
  id: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div
      className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground data-[disabled=true]:opacity-50"
      data-disabled={disabled}
    >
      <span className="shrink-0 pl-4 pr-3 text-sm text-muted-foreground">AED</span>
      <span className="h-5 w-px shrink-0 bg-border/60" />
      <input
        id={id}
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed"
      />
    </div>
  )
}

const SELECT_TRIGGER =
  "data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"

// Brand-accent swatches — softened (mid-saturation) distinct hues.
// Calmer than Radix step 9 solids, still readable as a colour set.
const SWATCHES = [
  { id: "blue", color: "#6aa3e0" },
  { id: "green", color: "#66bb8a" },
  { id: "amber", color: "#e8c25e" },
  { id: "tomato", color: "#e89177" },
  { id: "violet", color: "#9b8bd6" },
  { id: "pink", color: "#d782b4" },
]

// ─── Sections ─────────────────────────────────────────────────────────────────

export type PackageSectionId = "basics" | "appearance" | "online" | "terms"

export const PACKAGE_SECTIONS: Array<{ id: PackageSectionId; label: string; icon: LucideIcon }> = [
  { id: "basics", label: "Basic info", icon: FileTextIcon },
  { id: "appearance", label: "Customisation", icon: PaletteIcon },
  { id: "online", label: "Online sales", icon: GlobeIcon },
  { id: "terms", label: "Terms & Conditions", icon: FileTextIcon },
]

// ─── Component ──────────────────────────────────────────────────────────────────

export type PackageDraft = Omit<Package, "id" | "createdAt" | "updatedAt" | "sales">

export function PackageForm({
  section,
  initialName,
  editing,
  onDraftChange,
}: {
  section?: PackageSectionId
  initialName?: string
  /**
   * Reports the form's current values upward.
   *
   * The page owns Save, because only it knows whether this is a create or an
   * edit and where to go afterwards — and the form is split across four
   * sections, so the fields the operator never opened still have to be in what
   * gets written. Sending the whole draft on every change is what keeps a
   * section they skipped from saving as empty.
   */
  onDraftChange?: (draft: PackageDraft) => void
  /**
   * The package being edited. Every field starts from it — an edit form that
   * pre-fills the name and nothing else asks the merchant to retype what they
   * already saved, and silently rewrites whatever they do not reach.
   */
  editing?: Package
}) {
  const show = (id: PackageSectionId) => !section || section === id

  const [name, setName] = useState(editing?.name ?? initialName ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")

  const [services, setServices] = useState<Set<string>>(new Set(editing?.services ?? []))
  const [servicesOpen, setServicesOpen] = useState(false)
  const [sessionType, setSessionType] = useState<string>(editing?.sessionType ?? "limited")
  const [sessionCount, setSessionCount] = useState(String(editing?.sessionCount ?? 5))

  const [payment, setPayment] = useState<"one-time" | "recurring">(editing?.payment ?? "one-time")
  const [validFor, setValidFor] = useState<string>(editing?.validFor ?? "1m")
  const [price, setPrice] = useState(editing?.price != null ? String(editing.price / 100) : "")
  const [frequency, setFrequency] = useState<string>(editing?.frequency ?? "monthly")
  const [recurringPrice, setRecurringPrice] = useState(
    editing?.recurringPrice != null ? String(editing.recurringPrice / 100) : "",
  )
  const [length, setLength] = useState<string>(editing?.length ?? "until-canceled")
  const [taxRate, setTaxRate] = useState<string>(editing?.taxRate ?? "none")
  /**
   * The branches that answer differently from the switch above (R15, INV-13).
   *
   * An absence means inheriting, so a later change to the business switch still
   * reaches every branch that never differed. Writing today's value into all of
   * them would freeze them at it, which is the same mistake the service
   * catalogue's reset avoids.
   */

  const [colour, setColour] = useState(editing?.colour ?? "violet")

  const [onlineSales, setOnlineSales] = useState(editing?.onlineSales ?? true)
  const [onlineRedemption, setOnlineRedemption] = useState(editing?.onlineRedemption ?? true)

  const [terms, setTerms] = useState(editing?.terms ?? "")

  const draft = useMemo<PackageDraft>(
    () => ({
      name: name.trim(),
      description: description.trim() || null,
      services: [...services],
      sessionType: sessionType === "unlimited" ? "unlimited" : "limited",
      sessionCount: sessionType === "unlimited" ? null : Number(sessionCount) || 0,
      payment,
      // A one-time package has no frequency and a recurring one has no expiry.
      // Writing both would save a row that contradicts itself, and the detail
      // would then have to guess which half to believe.
      validFor: payment === "one-time" ? (validFor as Package["validFor"]) : null,
      price: payment === "one-time" ? Math.round((Number(price) || 0) * 100) : null,
      frequency: payment === "recurring" ? (frequency as Package["frequency"]) : null,
      recurringPrice:
        payment === "recurring" ? Math.round((Number(recurringPrice) || 0) * 100) : null,
      length: payment === "recurring" ? (length as Package["length"]) : null,
      taxRate: taxRate === "none" ? null : taxRate,
      colour,
      onlineSales,
      onlineRedemption,
      terms: terms.trim() || null,
    }),
    [
      name,
      description,
      services,
      sessionType,
      sessionCount,
      payment,
      validFor,
      price,
      frequency,
      recurringPrice,
      length,
      taxRate,
      colour,
      onlineSales,
      onlineRedemption,
      terms,
    ],
  )

  useEffect(() => {
    onDraftChange?.(draft)
  }, [draft, onDraftChange])

  return (
    <>
      {/* ── Basic info ─────────────────────────────────────────────────── */}
      {show("basics") && (
        <SubSection title="Basic info">
          <FieldRow>
            <Label htmlFor="package-name">Package name</Label>
            <Input
              id="package-name"
              placeholder="Add a package name, e.g. 5-visit groom pack"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FieldRow>

          <FieldRow>
            <div className="flex items-center justify-between">
              <Label htmlFor="package-description">Package description</Label>
              <span className="text-xs text-muted-foreground">{description.length}/360</span>
            </div>
            <Textarea
              id="package-description"
              placeholder="Add a package description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 360))}
              className="min-h-24"
            />
          </FieldRow>
        </SubSection>
      )}

      {/* ── Services & sessions ────────────────────────────────────────── */}
      {show("basics") && (
        <SubSection
          title="Services & sessions"
          description="Add the services and sessions included in the package."
        >
          <FieldRow>
            <Label>Included services</Label>
            <button
              type="button"
              onClick={() => setServicesOpen(true)}
              className="flex h-12 items-center justify-between rounded-2xl bg-input px-4 text-left transition-colors hover:bg-input/70"
            >
              <span className="text-sm font-medium text-foreground">
                {services.size} service{services.size === 1 ? "" : "s"}
              </span>
              <span className="text-sm font-medium text-cami-violet-11">Edit</span>
            </button>
          </FieldRow>

          <div className="grid grid-cols-2 items-start gap-4">
            <FieldRow>
              <Label htmlFor="session-type">Sessions</Label>
              <Select value={sessionType} onValueChange={setSessionType}>
                <SelectTrigger id="session-type" className={SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="limited">Limited</SelectItem>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>

            {sessionType === "limited" && (
              <FieldRow>
                <Label htmlFor="session-count">Number of sessions</Label>
                <Input
                  id="session-count"
                  type="number"
                  min="1"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For recurring packages, the number of sessions renews at the beginning of each
                  payment cycle.
                </p>
              </FieldRow>
            )}
          </div>
        </SubSection>
      )}

      {/* ── Pricing & payment ──────────────────────────────────────────── */}
      {show("basics") && (
        <SubSection
          title="Pricing & payment"
          description="Choose how you'd like your clients to pay."
        >
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                {
                  id: "one-time",
                  title: "One-time payment",
                  desc: "Clients are charged once at the time of purchase.",
                },
                {
                  id: "recurring",
                  title: "Recurring payments",
                  desc: "Clients are charged on the package renewal date.",
                },
              ] as const
            ).map((opt) => {
              const active = payment === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPayment(opt.id)}
                  aria-pressed={active}
                  className={cn(
                    "relative flex flex-col gap-1 rounded-2xl border p-4 text-left transition-colors",
                    active
                      ? "border-transparent bg-cami-violet-3 outline-2 -outline-offset-2 outline-cami-violet-8"
                      : "border-border/60 hover:bg-muted/40",
                  )}
                >
                  {active && (
                    <span className="absolute right-3 top-3 flex size-4 items-center justify-center rounded-full bg-cami-violet-8 text-white">
                      <CheckIcon className="size-3" />
                    </span>
                  )}
                  <span className="text-sm font-semibold text-foreground">{opt.title}</span>
                  <span className="text-sm text-muted-foreground">{opt.desc}</span>
                </button>
              )
            })}
          </div>

          {payment === "one-time" ? (
            <div className="grid grid-cols-2 items-start gap-4">
              <FieldRow>
                <Label htmlFor="valid-for">Valid for</Label>
                <Select value={validFor} onValueChange={setValidFor}>
                  <SelectTrigger id="valid-for" className={SELECT_TRIGGER}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 month</SelectItem>
                    <SelectItem value="3m">3 months</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="12m">12 months</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow>
                <Label htmlFor="price">Price</Label>
                <PriceInput id="price" value={price} onChange={setPrice} />
              </FieldRow>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 items-start gap-4">
                <FieldRow>
                  <Label htmlFor="frequency">Payment frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency" className={SELECT_TRIGGER}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
                <FieldRow>
                  <Label htmlFor="recurring-price">Recurring price</Label>
                  <PriceInput
                    id="recurring-price"
                    value={recurringPrice}
                    onChange={setRecurringPrice}
                  />
                </FieldRow>
              </div>
              <FieldRow>
                <Label htmlFor="length">Length of package</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger
                    id="length"
                    className={cn(SELECT_TRIGGER, "max-w-[calc(50%-0.5rem)]")}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="until-canceled">Until canceled</SelectItem>
                    <SelectItem value="3m">3 months</SelectItem>
                    <SelectItem value="6m">6 months</SelectItem>
                    <SelectItem value="9m">9 months</SelectItem>
                    <SelectItem value="12m">12 months</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </FieldRow>
            </div>
          )}

          <FieldRow>
            <Label htmlFor="tax-rate">Tax rate</Label>
            <Select value={taxRate} onValueChange={setTaxRate}>
              <SelectTrigger
                id="tax-rate"
                className={cn(SELECT_TRIGGER, "max-w-[calc(50%-0.5rem)]")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No tax</SelectItem>
                <SelectItem value="vat5">VAT (5%)</SelectItem>
              </SelectContent>
            </Select>
          </FieldRow>
        </SubSection>
      )}

      {/* ── Customisation ──────────────────────────────────────────────── */}
      {show("appearance") && (
        <SubSection title="Customisation" description="Select a colour that matches your business.">
          <div className="flex items-center gap-3">
            {SWATCHES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setColour(s.id)}
                aria-label={`Colour ${s.id}`}
                aria-pressed={colour === s.id}
                className={cn(
                  "flex size-8 items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-shadow",
                  colour === s.id && "ring-2 ring-foreground/40",
                )}
                style={{ backgroundColor: s.color }}
              >
                {colour === s.id ? <CheckIcon className="size-4 text-white" /> : null}
              </button>
            ))}
          </div>
        </SubSection>
      )}

      {/* ── Online sales & redemption ──────────────────────────────────── */}
      {show("online") && (
        <SubSection title="Online sales & redemption">
          <div className="flex items-start gap-3">
            <Switch
              checked={onlineSales}
              onCheckedChange={setOnlineSales}
              aria-label="Enable online sales"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Enable online sales</p>
              <p className="text-sm text-muted-foreground">
                Clients can purchase this package online.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Switch
              checked={onlineRedemption}
              onCheckedChange={setOnlineRedemption}
              aria-label="Enable online redemption"
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">Enable online redemption</p>
              <p className="text-sm text-muted-foreground">
                Clients can use this package to book services online.
              </p>
            </div>
          </div>
        </SubSection>
      )}

      {/* ── Terms & Conditions ─────────────────────────────────────────── */}
      {show("terms") && (
        <SubSection
          title="Terms & Conditions"
          description="If there are any rules attached to your package it's a good place to mention them."
        >
          <FieldRow>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <span className="text-xs text-muted-foreground">{terms.length}/3000</span>
            </div>
            <Textarea
              id="terms"
              placeholder="Add Terms & Conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value.slice(0, 3000))}
              className="min-h-32"
            />
          </FieldRow>
        </SubSection>
      )}

      <SelectPackageServicesDialog
        open={servicesOpen}
        onOpenChange={setServicesOpen}
        value={services}
        onConfirm={setServices}
      />
    </>
  )
}
