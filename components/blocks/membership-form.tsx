"use client"

import {
  CreditCardIcon,
  FileTextIcon,
  GlobeIcon,
  type LucideIcon,
  PaletteIcon,
  PencilIcon,
  ScrollTextIcon,
  SquareStackIcon,
} from "lucide-react"
import { useState } from "react"
import { MEMBERSHIP_COLORS, type MembershipColorId } from "@/components/blocks/memberships-table"
import {
  type ComboService,
  formatDuration,
  formatPrice,
  SelectServicesDialog,
} from "@/components/blocks/select-services-dialog"
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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ─── Local helpers (mirror combo-form) ──────────────────────────────────────────

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

const SELECT_TRIGGER =
  "data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"

// ─── Options ────────────────────────────────────────────────────────────────────

const VALID_FOR_OPTIONS = [
  "7 days",
  "14 days",
  "1 month",
  "2 months",
  "3 months",
  "4 months",
  "6 months",
  "8 months",
  "1 year",
  "18 months",
  "2 years",
  "3 years",
  "5 years",
]

const TAX_OPTIONS = [
  { value: "none", label: "No tax" },
  { value: "vat-5", label: "VAT 5%" },
]

// ─── Sections ─────────────────────────────────────────────────────────────────

export type MembershipSectionId =
  | "basics"
  | "services"
  | "pricing"
  | "appearance"
  | "online"
  | "terms"

export const MEMBERSHIP_SECTIONS: Array<{
  id: MembershipSectionId
  label: string
  icon: LucideIcon
}> = [
  { id: "basics", label: "Basic info", icon: FileTextIcon },
  { id: "services", label: "Services & sessions", icon: SquareStackIcon },
  { id: "pricing", label: "Pricing & payment", icon: CreditCardIcon },
  { id: "appearance", label: "Appearance", icon: PaletteIcon },
  { id: "online", label: "Online sales", icon: GlobeIcon },
  { id: "terms", label: "Terms & conditions", icon: ScrollTextIcon },
]

// ─── Initial values (edit pre-fill) ─────────────────────────────────────────────

export type MembershipFormInitial = {
  name?: string
  description?: string
  services?: ComboService[]
  sessionType?: "limited" | "unlimited"
  sessionCount?: string
  validFor?: string
  price?: string
  taxRate?: string
  color?: MembershipColorId
  onlineSales?: boolean
  onlineRedemption?: boolean
  terms?: string
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function MembershipForm({
  section,
  initial,
}: {
  section?: MembershipSectionId
  initial?: MembershipFormInitial
}) {
  const showBasics = !section || section === "basics"
  const showServices = !section || section === "services"
  const showPricing = !section || section === "pricing"
  const showAppearance = !section || section === "appearance"
  const showOnline = !section || section === "online"
  const showTerms = !section || section === "terms"

  const [name, setName] = useState(initial?.name ?? "")
  const [description, setDescription] = useState(initial?.description ?? "")

  const [services, setServices] = useState<ComboService[]>(initial?.services ?? [])
  const [servicesOpen, setServicesOpen] = useState(false)
  const [sessionType, setSessionType] = useState<"limited" | "unlimited">(
    initial?.sessionType ?? "unlimited",
  )
  const [sessionCount, setSessionCount] = useState(initial?.sessionCount ?? "5")

  const [validFor, setValidFor] = useState(initial?.validFor ?? "1 month")
  const [price, setPrice] = useState(initial?.price ?? "")
  const [taxRate, setTaxRate] = useState(initial?.taxRate ?? "none")

  const [color, setColor] = useState<MembershipColorId>(initial?.color ?? "violet")

  const [onlineSales, setOnlineSales] = useState(initial?.onlineSales ?? false)
  const [onlineRedemption, setOnlineRedemption] = useState(initial?.onlineRedemption ?? true)

  const [terms, setTerms] = useState(initial?.terms ?? "")

  function toggleService(service: ComboService) {
    setServices((prev) =>
      prev.some((s) => s.id === service.id)
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service],
    )
  }

  function removeService(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <>
      {showBasics && (
        <SubSection
          title="Basic info"
          description="Give the membership a name and a short description for your clients."
        >
          <FieldRow>
            <Label htmlFor="membership-name">Membership name</Label>
            <Input
              id="membership-name"
              placeholder="Add a membership name, e.g. Monthly Grooming Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FieldRow>

          <FieldRow>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <Label htmlFor="membership-description">Membership description</Label>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <span className="text-xs text-muted-foreground">{description.length}/360</span>
            </div>
            <Textarea
              id="membership-description"
              placeholder="Add a membership description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 360))}
              className="min-h-30"
            />
          </FieldRow>
        </SubSection>
      )}

      {showServices && (
        <SubSection
          title="Services & sessions"
          description="Add the services and sessions included in the membership."
        >
          {/* Included services summary row → opens the service picker */}
          <FieldRow>
            <Label>Included services</Label>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3.5">
              <span className="text-sm font-medium text-foreground">
                {services.length} service{services.length === 1 ? "" : "s"}
              </span>
              <button
                type="button"
                onClick={() => setServicesOpen(true)}
                className="flex items-center gap-1.5 text-sm font-medium text-cami-violet-11 hover:underline"
              >
                <PencilIcon className="size-3.5" />
                Edit
              </button>
            </div>
          </FieldRow>

          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 border-l-4 py-3 pr-3 pl-3.5"
                  style={{ borderLeftColor: service.color }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(service.duration)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm text-foreground">
                    {formatPrice(service.price)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    radius="full"
                    className="shrink-0 text-destructive hover:text-destructive"
                    onClick={() => removeService(service.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 items-start gap-4">
            <FieldRow>
              <Label htmlFor="session-type">Sessions</Label>
              <Select
                value={sessionType}
                onValueChange={(v) => setSessionType(v as "limited" | "unlimited")}
              >
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
                  step="1"
                  placeholder="5"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(e.target.value)}
                />
              </FieldRow>
            )}
          </div>
        </SubSection>
      )}

      {showPricing && (
        <SubSection
          title="Pricing & payment"
          description="Choose how you'd like your clients to pay."
        >
          <div className="grid grid-cols-2 items-start gap-4">
            <FieldRow>
              <Label htmlFor="valid-for">Valid for</Label>
              <Select value={validFor} onValueChange={setValidFor}>
                <SelectTrigger id="valid-for" className={SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALID_FOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow>
              <Label htmlFor="membership-price">Price</Label>
              <div className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground">
                <span className="shrink-0 pl-4 pr-3 text-sm text-muted-foreground">AED</span>
                <span className="h-5 w-px shrink-0 bg-border/60" />
                <input
                  id="membership-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="h-full flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                />
              </div>
            </FieldRow>
          </div>

          <FieldRow>
            <Label htmlFor="tax-rate">Tax rate</Label>
            <Select value={taxRate} onValueChange={setTaxRate}>
              <SelectTrigger id="tax-rate" className={SELECT_TRIGGER}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TAX_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
        </SubSection>
      )}

      {showAppearance && (
        <SubSection
          title="Colour customisation"
          description="Select a colour that matches your business."
        >
          <div className="flex flex-wrap gap-2.5 pt-1">
            {MEMBERSHIP_COLORS.map((c) => {
              const selected = color === c.id
              return (
                <button
                  key={c.id}
                  type="button"
                  aria-label={c.id}
                  aria-pressed={selected}
                  onClick={() => setColor(c.id)}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-transform",
                    selected
                      ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                      : "hover:scale-110",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-8 rounded-full ring-1 ring-inset ring-border/40",
                      c.className,
                    )}
                  />
                </button>
              )
            })}
          </div>
        </SubSection>
      )}

      {showOnline && (
        <SubSection title="Online sales & redemption">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="online-sales" className="text-base">
                Enable online sales
              </Label>
              <p className="text-sm text-muted-foreground">
                Clients can purchase this membership online
              </p>
            </div>
            <Switch id="online-sales" checked={onlineSales} onCheckedChange={setOnlineSales} />
          </div>

          <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="online-redemption" className="text-base">
                Enable online redemption
              </Label>
              <p className="text-sm text-muted-foreground">
                Clients can use this membership to book services online
              </p>
            </div>
            <Switch
              id="online-redemption"
              checked={onlineRedemption}
              onCheckedChange={setOnlineRedemption}
            />
          </div>
        </SubSection>
      )}

      {showTerms && (
        <SubSection
          title="Terms & conditions"
          description="If there are any rules attached to your membership it's a good place to mention them."
        >
          <FieldRow>
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <Label htmlFor="membership-terms">Terms & conditions</Label>
                <span className="text-sm text-muted-foreground">(Optional)</span>
              </div>
              <span className="text-xs text-muted-foreground">{terms.length}/3000</span>
            </div>
            <Textarea
              id="membership-terms"
              placeholder="Add terms & conditions"
              value={terms}
              onChange={(e) => setTerms(e.target.value.slice(0, 3000))}
              className="min-h-30"
            />
          </FieldRow>
        </SubSection>
      )}

      <SelectServicesDialog
        open={servicesOpen}
        onOpenChange={setServicesOpen}
        selectedIds={services.map((s) => s.id)}
        onToggle={toggleService}
      />
    </>
  )
}
