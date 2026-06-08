"use client"

import {
  CalendarIcon,
  CirclePlusIcon,
  FileTextIcon,
  ImageIcon,
  type LucideIcon,
  MoreVerticalIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  type ComboService,
  formatDuration,
  formatPrice,
  SelectServicesDialog,
} from "@/components/blocks/select-services-dialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ─── Local helpers ────────────────────────────────────────────────────────────

/**
 * One titled sub-block inside a nav section's card. Flat — no border or divider;
 * the surrounding <section> card supplies the surface (mirrors the service editor).
 */
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

// ─── Mock categories ────────────────────────────────────────────────────────────

const CATEGORIES: Array<{ id: string; name: string; color: string }> = [
  { id: "grooming", name: "Grooming", color: "#5eead4" },
  { id: "bathing", name: "Bathing", color: "#93c5fd" },
  { id: "nail-paw", name: "Nail & paw care", color: "#fdba74" },
  { id: "addons", name: "Add-ons", color: "#86efac" },
  { id: "spa", name: "Spa & wellness", color: "#c4b5fd" },
  { id: "cats", name: "Cats", color: "#f9a8d4" },
]

const PRICE_TYPES = [
  { value: "service", label: "Service pricing", hint: undefined },
  { value: "custom", label: "Custom pricing", hint: "Services in combo are free" },
  { value: "percentage", label: "Percentage discount", hint: "Services in combo are free" },
  { value: "free", label: "Free", hint: undefined },
] as const

type PriceType = (typeof PRICE_TYPES)[number]["value"]

// ─── Sections ─────────────────────────────────────────────────────────────────

export type ComboSectionId = "basics" | "online" | "portfolio"

export const COMBO_SECTIONS: Array<{ id: ComboSectionId; label: string; icon: LucideIcon }> = [
  { id: "basics", label: "Basic details", icon: FileTextIcon },
  { id: "online", label: "Online booking", icon: CalendarIcon },
  { id: "portfolio", label: "Portfolio images", icon: ImageIcon },
]

// ─── Component ──────────────────────────────────────────────────────────────────

export function ComboForm({ section }: { section?: ComboSectionId }) {
  const showBasics = !section || section === "basics"
  const showOnline = !section || section === "online"
  const showPortfolio = !section || section === "portfolio"

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  const [services, setServices] = useState<ComboService[]>([])
  const [servicesOpen, setServicesOpen] = useState(false)
  const [scheduleType, setScheduleType] = useState("sequence")

  const [priceType, setPriceType] = useState<PriceType>("service")
  const [retailPrice, setRetailPrice] = useState("")
  const [discountPct, setDiscountPct] = useState("10")

  const [onlineBooking, setOnlineBooking] = useState(true)
  const [availableFor, setAvailableFor] = useState("all")

  // ── Pricing model ──────────────────────────────────────────────────────────
  // Sum of the included services' own prices — the baseline for every price type.
  const servicesTotal = services.reduce((sum, s) => sum + s.price, 0)
  const pct = Math.min(100, Math.max(0, Number(discountPct) || 0))
  const customTotal = Number(retailPrice) || 0

  // Combo total after the selected price type is applied.
  const comboTotal = (() => {
    switch (priceType) {
      case "custom":
        return customTotal
      case "percentage":
        return servicesTotal * (1 - pct / 100)
      case "free":
        return 0
      default:
        return servicesTotal
    }
  })()

  const isDiscounted = priceType !== "service"
  const discountAmount = Math.max(0, servicesTotal - comboTotal)

  /** Price shown per service after the combo's price type is applied. */
  function servicePrice(service: ComboService): number {
    switch (priceType) {
      case "custom":
        // Distribute the custom total across services proportionally to their price.
        return servicesTotal > 0 ? (customTotal * service.price) / servicesTotal : 0
      case "percentage":
        return service.price * (1 - pct / 100)
      case "free":
        return 0
      default:
        return service.price
    }
  }

  // Sequence runs services back-to-back (sum); parallel overlaps them (max).
  const totalDuration =
    scheduleType === "parallel"
      ? services.reduce((max, s) => Math.max(max, s.duration), 0)
      : services.reduce((sum, s) => sum + s.duration, 0)

  function handlePriceTypeChange(value: PriceType) {
    setPriceType(value)
    // Seed sensible defaults so the field is immediately usable (mirrors Fresha).
    if (value === "custom") setRetailPrice(String(servicesTotal))
    if (value === "percentage") setDiscountPct((prev) => prev || "10")
  }

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

  // Custom / percentage need services to discount — fall back to service pricing
  // once the combo is emptied, so the form can't sit in an impossible state.
  const noServices = services.length === 0
  useEffect(() => {
    if (noServices && (priceType === "custom" || priceType === "percentage")) {
      setPriceType("service")
    }
  }, [noServices, priceType])

  return (
    <>
      {showBasics && (
        <>
          {/* ── Basic details ──────────────────────────────────────────────── */}
          <SubSection title="Basic details">
            <FieldRow>
              <Label htmlFor="combo-name">Combo name</Label>
              <Input
                id="combo-name"
                placeholder="Add a combo name, e.g. Bath & full groom"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </FieldRow>

            <FieldRow>
              <Label htmlFor="combo-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="combo-category" className={SELECT_TRIGGER}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c.color }}
                      />
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow>
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <Label htmlFor="combo-description">Description</Label>
                  <span className="text-sm text-muted-foreground">(Optional)</span>
                </div>
                <span className="text-xs text-muted-foreground">{description.length}/1000</span>
              </div>
              <Textarea
                id="combo-description"
                placeholder="Add a description about this combo"
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                className="min-h-30"
              />
            </FieldRow>
          </SubSection>

          {/* ── Services ───────────────────────────────────────────────────── */}
          <SubSection
            title="Services"
            description="Select which services to include in this combo and how they should be sequenced when booked."
          >
            {services.length > 0 && (
              <div className="flex flex-col gap-2">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center gap-3 overflow-hidden rounded-xl border border-border/60 border-l-4 py-3 pr-2 pl-3.5"
                    style={{ borderLeftColor: service.color }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDuration(service.duration)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right text-sm">
                      <span className="text-foreground">{formatPrice(servicePrice(service))}</span>
                      {isDiscounted && (
                        <span className="block text-xs text-muted-foreground line-through">
                          {formatPrice(service.price)}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          radius="full"
                          aria-label={`Options for ${service.name}`}
                        >
                          <MoreVerticalIcon className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => removeService(service.id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" radius="full" onClick={() => setServicesOpen(true)}>
                <CirclePlusIcon className="size-4" />
                Add service
              </Button>
              {services.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Total duration: {formatDuration(totalDuration)}
                  </span>
                  {isDiscounted && (
                    <span className="text-muted-foreground line-through">
                      {formatPrice(servicesTotal)}
                    </span>
                  )}
                  <span className="font-semibold text-foreground">{formatPrice(comboTotal)}</span>
                </div>
              )}
            </div>

            <FieldRow>
              <Label htmlFor="schedule-type">Schedule type</Label>
              <Select value={scheduleType} onValueChange={setScheduleType}>
                <SelectTrigger id="schedule-type" className={SELECT_TRIGGER}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequence">Booked in sequence</SelectItem>
                  <SelectItem value="parallel">Booked in parallel</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </SubSection>

          {/* ── Pricing ────────────────────────────────────────────────────── */}
          <SubSection title="Pricing">
            <div className="grid grid-cols-2 items-start gap-4">
              <FieldRow>
                <Label htmlFor="price-type">Price type</Label>
                <Select
                  value={priceType}
                  onValueChange={(v) => handlePriceTypeChange(v as PriceType)}
                >
                  <SelectTrigger id="price-type" className={SELECT_TRIGGER}>
                    {/* Show only the label in the trigger — the hint belongs in the list. */}
                    <span className="truncate">
                      {PRICE_TYPES.find((pt) => pt.value === priceType)?.label}
                    </span>
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    className="w-(--radix-select-trigger-width)"
                  >
                    {PRICE_TYPES.map((pt) => {
                      const needsServices = pt.value === "custom" || pt.value === "percentage"
                      return (
                        <SelectItem
                          key={pt.value}
                          value={pt.value}
                          disabled={needsServices && noServices}
                        >
                          <span className="flex flex-col gap-0.5">
                            <span>{pt.label}</span>
                            {pt.hint ? (
                              <span className="text-xs text-muted-foreground">{pt.hint}</span>
                            ) : null}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </FieldRow>

              {priceType === "percentage" ? (
                <FieldRow>
                  <Label htmlFor="discount-value">Discount value</Label>
                  <div className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground">
                    <input
                      id="discount-value"
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      placeholder="0"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(e.target.value)}
                      className="h-full flex-1 bg-transparent px-4 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                    />
                    <span className="h-5 w-px shrink-0 bg-border/60" />
                    <span className="shrink-0 px-3 text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {discountAmount > 0
                      ? `Discounted by ${formatPrice(discountAmount)}`
                      : "No discount applied"}
                  </p>
                </FieldRow>
              ) : (
                <FieldRow>
                  <Label htmlFor="retail-price">Retail price</Label>
                  <div
                    className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground data-[disabled=true]:opacity-50"
                    data-disabled={priceType !== "custom"}
                  >
                    <span className="shrink-0 pl-4 pr-3 text-sm text-muted-foreground">AED</span>
                    <span className="h-5 w-px shrink-0 bg-border/60" />
                    <input
                      id="retail-price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={priceType === "free" ? "0.00" : "0"}
                      disabled={priceType !== "custom"}
                      value={
                        priceType === "custom"
                          ? retailPrice
                          : priceType === "free"
                            ? ""
                            : String(servicesTotal)
                      }
                      onChange={(e) => setRetailPrice(e.target.value)}
                      className="h-full flex-1 bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {discountAmount > 0
                      ? `Discounted by ${formatPrice(discountAmount)}`
                      : "No discount applied"}
                  </p>
                </FieldRow>
              )}
            </div>
          </SubSection>
        </>
      )}

      {/* ── Online booking ─────────────────────────────────────────────── */}
      {showOnline && (
        <SubSection>
          <div className="-mt-1 flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="font-heading text-2xl font-semibold leading-9 text-foreground">
                Online booking
              </h2>
              <p className="text-sm leading-5 text-muted-foreground">
                Allow clients to book this combo online via the Marketplace, socials and your own
                custom booking links.
              </p>
            </div>
            <SegmentedToggle
              value={onlineBooking ? "on" : "off"}
              onValueChange={(v) => setOnlineBooking(v === "on")}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On", activeTone: "primary" },
              ]}
              ariaLabel="Online booking"
            />
          </div>

          <div
            aria-disabled={!onlineBooking}
            className={cn(!onlineBooking && "pointer-events-none opacity-50")}
          >
            <FieldRow>
              <Label htmlFor="available-for">Available for</Label>
              <Select
                value={availableFor}
                onValueChange={setAvailableFor}
                disabled={!onlineBooking}
              >
                <SelectTrigger id="available-for" className={SELECT_TRIGGER}>
                  <SelectValue placeholder="All types & breed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types &amp; breed</SelectItem>
                  <SelectItem value="custom" disabled>
                    Customize <span className="text-muted-foreground">(coming soon)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
          </div>
        </SubSection>
      )}

      {/* ── Portfolio images ───────────────────────────────────────────── */}
      {showPortfolio && (
        <SubSection
          title="Portfolio images"
          description="Add and manage imagery shown to clients when booking online."
        >
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:bg-muted/50"
          >
            <FileTextIcon className="size-6 text-muted-foreground" />
            <span className="font-heading text-lg font-semibold text-foreground">
              Add your images here
            </span>
            <span className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-sm font-medium">
              Choose a file
            </span>
          </button>
          <p className="text-xs text-muted-foreground">
            File type .jpg, .png, .avif, .webp · max size 10mb
          </p>
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
