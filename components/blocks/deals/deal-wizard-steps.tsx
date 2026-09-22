"use client"

/**
 * The deal wizard's steps (DW3.4, R04, R11, R18, R24).
 *
 * Five, in this order: **type → details → limits → locations → team**. The
 * built product has four — it has no locations step, and creates every deal
 * with `locationIds: []`, which its own mapper reads as every venue. That is
 * the whole of PRD-169 on this screen: the reach of an offer is a decision
 * somebody makes, not an empty array two systems read differently.
 */

import {
  BoxIcon,
  CirclePercentIcon,
  ClockIcon,
  LightbulbIcon,
  TagIcon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react"
import type * as React from "react"
import { useState } from "react"

import { DealScopePickerDialog } from "@/components/blocks/deals/deal-scope-picker-dialog"
import { LocationMultiSelect } from "@/components/blocks/location-multi-select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { scopePickerConfig } from "@/lib/deals/catalogue"
import type {
  DealApplicability,
  DealLimits,
  DealResourceScope,
  DealType,
  DiscountKind,
} from "@/lib/deals/mock"
import { scopeStatusLabel } from "@/lib/deals/mock"
import type { ScopeKind } from "@/lib/deals/wizard"
import { isRunnable, type PromotionScope } from "@/lib/locations/promotion-scope"
import { useLocations } from "@/lib/locations/store"
import type { TeamMember } from "@/lib/team/mock"
import { cn } from "@/lib/utils"

/**
 * A step's title and one line of why.
 *
 * The dev repo takes this to `text-4xl` with `gap-10` under it, which is a
 * marketing scale on a data-entry form — three fields and their labels were
 * pushed below the fold on a laptop. This repo's page titles are `text-2xl` and
 * its dialog titles about 22px, so a step heading sits at `text-xl`: still the
 * loudest thing on the step, no louder than the page that launched it.
 */
export function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="font-heading font-semibold text-foreground text-xl leading-7">{title}</h2>
      {hint ? <p className="max-w-xl text-muted-foreground text-sm leading-5">{hint}</p> : null}
    </div>
  )
}

/** A hint block, the same one the built details step uses twice. */
function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-2xl bg-cami-violet-2 px-4 py-3.5 text-muted-foreground text-sm">
      <LightbulbIcon className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        <div>{children}</div>
      </div>
    </div>
  )
}

/**
 * A chooser card: the whole card is the target, and the dot is drawn rather
 * than mounted.
 *
 * Radix's radio renders a `<button>`, and a `<button>` inside a `<button>` is
 * invalid HTML — React logs a hydration error and the browser may un-nest them,
 * which is how a card that looks clickable stops taking its own clicks. Hover
 * moves the border, not the fill: tinting the card grey put it within a shade
 * of the unselected dot and the control vanished under the pointer.
 */
function ChoiceCard({
  selected,
  onSelect,
  title,
  detail,
  icon: Icon,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  detail: string
  icon?: typeof CirclePercentIcon
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full cursor-pointer items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
        selected ? "border-cami-violet-8 bg-cami-violet-2" : "border-border/60 hover:border-border",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-primary bg-primary" : "border-border bg-input/90",
        )}
      >
        {selected ? <span className="size-2 rounded-full bg-primary-foreground" /> : null}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-semibold text-foreground text-sm">{title}</span>
        <span className="text-muted-foreground text-sm">{detail}</span>
      </span>
      {Icon ? <Icon className="mt-0.5 size-5 shrink-0 text-foreground" /> : null}
    </button>
  )
}

// ─── 1 · Type ────────────────────────────────────────────────────────────────

const DEAL_TYPES: Array<{
  id: DealType
  icon: typeof CirclePercentIcon
  title: string
  description: string
}> = [
  {
    id: "promotion",
    icon: CirclePercentIcon,
    title: "Promotion",
    description:
      "A discount redeemed by clients entering the code when booking online or at checkout.",
  },
  {
    id: "flash-sale",
    icon: ZapIcon,
    title: "Flash sale",
    description:
      "Applied immediately online, and your team can add it by hand to appointments and sales.",
  },
  {
    id: "last-minute-offer",
    icon: ClockIcon,
    title: "Last-minute offer",
    description: "A discount for bookings made shortly before the appointment starts.",
  },
]

export function DealTypeStep({
  value,
  onChange,
}: {
  value: DealType
  onChange: (type: DealType) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Select deal type"
        hint="Choose the type of deal you want to create. They differ in how a client reaches the offer, not in what it takes off."
      />
      <fieldset className="flex max-w-md flex-col gap-3">
        <legend className="sr-only">Deal type</legend>
        {DEAL_TYPES.map((option) => (
          <ChoiceCard
            key={option.id}
            selected={option.id === value}
            onSelect={() => onChange(option.id)}
            title={option.title}
            detail={option.description}
            icon={option.icon}
          />
        ))}
      </fieldset>
    </div>
  )
}

// ─── 2 · Details ─────────────────────────────────────────────────────────────

const DETAILS_TITLE: Record<DealType, string> = {
  promotion: "Customize promotion details",
  "flash-sale": "Customize flash sale details",
  "last-minute-offer": "Customize last-minute offer details",
}

export function DealDetailsStep({
  type,
  name,
  onName,
  description,
  onDescription,
  discountKind,
  onDiscountKind,
  discountValue,
  onDiscountValue,
  discountCode,
  onDiscountCode,
  startDate,
  onStartDate,
  endDate,
  onEndDate,
  enableAtPointOfSale,
  onEnableAtPointOfSale,
  applicability,
  onApplicability,
}: {
  type: DealType
  name: string
  onName: (v: string) => void
  description: string
  onDescription: (v: string) => void
  discountKind: DiscountKind
  onDiscountKind: (v: DiscountKind) => void
  discountValue: string
  onDiscountValue: (v: string) => void
  discountCode: string
  onDiscountCode: (v: string) => void
  startDate: string
  onStartDate: (v: string) => void
  endDate: string
  onEndDate: (v: string) => void
  enableAtPointOfSale: boolean
  onEnableAtPointOfSale: (v: boolean) => void
  applicability: DealApplicability
  onApplicability: (v: DealApplicability) => void
}) {
  const [pickerOpen, setPickerOpen] = useState<ScopeKind | null>(null)

  function scopeFor(kind: ScopeKind): DealResourceScope {
    return kind === "services"
      ? applicability.services
      : kind === "products"
        ? applicability.products
        : applicability.packages
  }

  /**
   * `null` from the picker means every box was ticked, which is stored as
   * `all` — the set that keeps growing with the catalogue. An explicit empty
   * set is `none`, which is a decision and not a blank.
   */
  function applyScope(kind: ScopeKind, next: Set<string> | null) {
    const scope: DealResourceScope =
      next === null
        ? { mode: "all", ids: [] }
        : next.size === 0
          ? { mode: "none", ids: [] }
          : { mode: "selected", ids: [...next] }
    onApplicability({ ...applicability, [kind]: scope })
  }

  const value = Number.parseFloat(discountValue)
  const percentTooBig = discountKind === "percentage" && Number.isFinite(value) && value > 100
  const datesOk = !endDate || endDate >= startDate
  const active = pickerOpen ? scopePickerConfig(pickerOpen) : null

  const ICONS = { services: WrenchIcon, products: BoxIcon, packages: TagIcon } as const
  const NOUNS = {
    services: ["service", "services"],
    products: ["product", "products"],
    packages: ["package", "packages"],
  } as const

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title={DETAILS_TITLE[type]}
        hint="Choose how and when to apply the discount, and what it comes off."
      />

      <div className="flex flex-col gap-5">
        <div className="flex max-w-md flex-col gap-2">
          <Label htmlFor="deal-name">Name</Label>
          <Input
            id="deal-name"
            value={name}
            onChange={(e) => onName(e.target.value)}
            placeholder="e.g. Summer sale"
          />
        </div>

        <div className="flex max-w-md flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="deal-description">Description (optional)</Label>
            <span className="text-muted-foreground text-xs tabular-nums">
              {description.length}/600
            </span>
          </div>
          <Textarea
            id="deal-description"
            value={description}
            maxLength={600}
            rows={3}
            onChange={(e) => onDescription(e.target.value)}
            placeholder="Tell clients what this deal is about"
          />
        </div>

        {/* Two controls, not one free-text box. Nobody filling "15 off" can say
            whether that is AED or a percentage, and neither could the till —
            the value was parsed out of the sentence with a regex that took
            nothing off at all for half the strings an owner would write. */}
        <div className="flex max-w-md flex-col gap-2">
          <Label htmlFor="deal-discount-value">Discount value</Label>
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="relative">
                <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 text-muted-foreground text-sm">
                  {discountKind === "percentage" ? "%" : "AED"}
                </span>
                <Input
                  id="deal-discount-value"
                  inputMode="decimal"
                  value={discountValue}
                  aria-invalid={percentTooBig}
                  placeholder={discountKind === "percentage" ? "15" : "30"}
                  onChange={(e) => onDiscountValue(e.target.value)}
                  className={discountKind === "percentage" ? "pl-10" : "pl-14"}
                />
              </div>
              {percentTooBig ? (
                <p className="text-cami-tomato-11 text-sm">
                  A percentage discount cannot exceed 100%.
                </p>
              ) : null}
            </div>
            <SegmentedToggle
              ariaLabel="Discount type"
              value={discountKind}
              onValueChange={onDiscountKind}
              size="lg"
              className="shrink-0"
              options={[
                { value: "percentage", label: "%" },
                { value: "fixed", label: "AED" },
              ]}
            />
          </div>
        </div>

        <div className="flex max-w-md flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="deal-discount-code">Discount code (optional)</Label>
            <Input
              id="deal-discount-code"
              value={discountCode}
              onChange={(e) => onDiscountCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER10"
            />
          </div>
          <Tip title="Discount codes only work on services and products.">
            Clients cannot apply a code when buying packages or gift cards online.
          </Tip>
        </div>

        <div className="flex max-w-md flex-col gap-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deal-start-date">Starts</Label>
              <Input
                id="deal-start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deal-end-date">Ends</Label>
              <Input
                id="deal-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => onEndDate(e.target.value)}
              />
              <span className="text-muted-foreground text-xs">
                Leave empty to run until you stop it.
              </span>
            </div>
          </div>
          {!datesOk ? (
            <p className="text-cami-tomato-11 text-sm">An end date cannot precede the start.</p>
          ) : null}
        </div>

        {/* The axis that put "20% off grooming" on a bottle of conditioner. */}
        <div className="flex max-w-md flex-col gap-3 border-border/60 border-t pt-5">
          <h3 className="font-semibold text-foreground text-sm">Apply this deal to</h3>
          {(["services", "products", "packages"] as const).map((kind) => {
            const scope = scopeFor(kind)
            const Icon = ICONS[kind]
            const [singular, plural] = NOUNS[kind]
            return (
              <div
                key={kind}
                className="flex h-12 min-w-0 items-center gap-2.5 overflow-hidden rounded-2xl bg-input px-4"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate font-medium text-foreground text-sm">
                  {scopeStatusLabel(scope, singular, plural)}
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(kind)}
                  className="shrink-0 cursor-pointer font-medium text-foreground text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  Edit
                </button>
              </div>
            )
          })}

          {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
          <label className="mt-1 flex cursor-pointer items-start gap-2.5">
            <Checkbox
              className="mt-0.5"
              checked={applicability.giftCardsInStore}
              onCheckedChange={(on) =>
                onApplicability({ ...applicability, giftCardsInStore: on === true })
              }
            />
            <span className="flex flex-col">
              <span className="text-foreground text-sm">Gift cards sold in store</span>
              <span className="text-muted-foreground text-xs">
                Worth a look: discounting a gift card sells AED 100 of credit for less than AED 100,
                and books the difference as a promotion.
              </span>
            </span>
          </label>
        </div>

        <div className="flex max-w-md items-start justify-between gap-4 border-border/60 border-t pt-5">
          <div>
            <Label htmlFor="deal-pos">Offer this at the till</Label>
            <p className="mt-0.5 text-muted-foreground text-sm">
              Off means the deal is online-only, or applied by hand — it will not appear in the
              checkout's discount list.
            </p>
          </div>
          <Switch
            id="deal-pos"
            checked={enableAtPointOfSale}
            onCheckedChange={onEnableAtPointOfSale}
          />
        </div>
      </div>

      {active && pickerOpen ? (
        <DealScopePickerDialog
          open
          onOpenChange={(o) => {
            if (!o) setPickerOpen(null)
          }}
          title={active.title}
          searchPlaceholder={active.searchPlaceholder}
          allLabel={active.allLabel}
          itemNounSingular={active.singular}
          itemNounPlural={active.plural}
          groups={active.groups}
          value={scopeFor(pickerOpen).mode === "all" ? null : new Set(scopeFor(pickerOpen).ids)}
          onApply={(next) => applyScope(pickerOpen, next)}
        />
      ) : null}
    </div>
  )
}

// ─── 3 · Limits ──────────────────────────────────────────────────────────────

export function DealLimitsStep({
  value,
  onChange,
}: {
  value: DealLimits
  onChange: (value: DealLimits) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Set up deal limits"
        hint="Cap how often this can be used. The till enforces each of these before it offers the deal."
      />

      <div className="flex max-w-md flex-col divide-y divide-border/60">
        <div className="flex items-start justify-between gap-4 py-4">
          <div>
            <Label htmlFor="deal-limit-one-per-client">Limit to one use per client</Label>
            <p className="mt-0.5 text-muted-foreground text-sm">
              Each client can use this deal only once.
            </p>
          </div>
          <Switch
            id="deal-limit-one-per-client"
            checked={value.oneUsePerClient}
            onCheckedChange={(v) => onChange({ ...value, oneUsePerClient: v })}
          />
        </div>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="deal-limit-total-uses">Limit the total number of uses</Label>
              <p className="mt-0.5 text-muted-foreground text-sm">
                Counted across every location this deal runs at.
              </p>
            </div>
            <Switch
              id="deal-limit-total-uses"
              checked={value.totalUsesEnabled}
              onCheckedChange={(v) => onChange({ ...value, totalUsesEnabled: v })}
            />
          </div>
          {value.totalUsesEnabled ? (
            <Input
              type="number"
              min={1}
              inputMode="numeric"
              aria-label="Total uses"
              placeholder="e.g. 100"
              value={value.totalUses ?? ""}
              onChange={(e) =>
                onChange({ ...value, totalUses: e.target.value ? Number(e.target.value) : null })
              }
              className="max-w-40"
            />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="deal-limit-min-purchase">Set a minimum purchase amount</Label>
              <p className="mt-0.5 text-muted-foreground text-sm">
                The cart must reach this before the deal can be added.
              </p>
            </div>
            <Switch
              id="deal-limit-min-purchase"
              checked={value.minimumPurchaseEnabled}
              onCheckedChange={(v) => onChange({ ...value, minimumPurchaseEnabled: v })}
            />
          </div>
          {value.minimumPurchaseEnabled ? (
            <div className="relative max-w-40">
              <span className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 text-muted-foreground text-sm">
                AED
              </span>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                aria-label="Minimum purchase amount"
                placeholder="500"
                value={value.minimumPurchaseAmount ?? ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    minimumPurchaseAmount: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="pl-14"
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─── 4 · Locations ───────────────────────────────────────────────────────────

/**
 * Where the deal runs — the step the built wizard does not have.
 *
 * "All locations" is a *named* set that will include the twenty-first branch;
 * ticking every box is a list that will not. For a promotion that difference is
 * money: a chain-wide January offer has to reach a branch opening on the 14th,
 * and an owner who expressed it by ticking nine boxes finds it does not. So the
 * choice comes first and the list only appears for the second case — the same
 * shape the branch switcher and the team grants use, so an owner learns it once.
 */
export function DealLocationsStep({
  value,
  onChange,
}: {
  value: PromotionScope
  onChange: (scope: PromotionScope) => void
}) {
  // The branches this owner may scope to — never the estate, since you cannot
  // run a deal at a branch you do not hold (R04).
  const { granted } = useLocations()
  const picked = value.kind === "branches" ? value.locationIds : []

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Where does this deal run?"
        hint="A chain-wide campaign and one branch filling a quiet Tuesday are both real, and they are stored differently."
      />

      <fieldset className="flex max-w-md flex-col gap-3">
        <legend className="sr-only">Where this deal runs</legend>
        <ChoiceCard
          selected={value.kind === "estate"}
          onSelect={() => onChange({ kind: "estate" })}
          title="All locations"
          detail="Including any location you open while this deal is running."
        />
        <ChoiceCard
          selected={value.kind === "branches"}
          onSelect={() => onChange({ kind: "branches", locationIds: picked })}
          title="Only the locations I choose"
          detail="A local offer, which a location opened later will not join."
        />
      </fieldset>

      {value.kind === "branches" ? (
        <div className="flex max-w-md flex-col gap-2">
          <Label>Locations</Label>
          <LocationMultiSelect
            locations={granted}
            selectedIds={picked}
            onChange={(ids) => onChange({ kind: "branches", locationIds: ids })}
          />
        </div>
      ) : null}

      {!isRunnable(value) ? (
        <p className="max-w-md rounded-xl bg-cami-yellow-2 p-3 text-foreground text-sm">
          Choose at least one location. A deal with none does not run everywhere — it runs nowhere,
          and nobody can use it.
        </p>
      ) : null}
    </div>
  )
}

// ─── 5 · Team ────────────────────────────────────────────────────────────────

/**
 * Who may sell it.
 *
 * Empty means everybody, which is the built product's reading and the one
 * empty set this repo does not argue with: a deal nobody may sell is not a
 * state anyone asks for, unlike a deal that runs nowhere.
 *
 * The multi-location part is the note under a name. A team member granted only
 * Mirdif cannot sell a JVC-only offer however many boxes are ticked, so the
 * row says so rather than letting an owner build a roster that cannot work.
 */
export function DealTeamStep({
  value,
  onChange,
  members,
  reach,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  members: ReadonlyArray<TeamMember>
  /** Branch ids this deal runs at, for the "works elsewhere" note. */
  reach: ReadonlyArray<string>
}) {
  const allSelected = members.length > 0 && members.every((m) => value.includes(m.id))

  function worksHere(member: TeamMember): boolean {
    if (member.locationGrants === "all") return true
    if (reach.length === 0) return true
    return member.locationGrants.some((id) => reach.includes(id))
  }

  return (
    <div className="flex flex-col gap-6">
      <StepHeading
        title="Who can sell this deal?"
        hint="Leave everyone selected unless the offer belongs to a particular team."
      />

      <div className="flex max-w-md flex-col">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
        <label className="flex cursor-pointer items-center gap-3 px-2 py-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onChange(allSelected ? [] : members.map((m) => m.id))}
          />
          <span className="font-semibold text-foreground text-sm">Select all</span>
          <span className="text-muted-foreground text-sm">{members.length}</span>
        </label>

        <div className="flex flex-col divide-y divide-border/60 border-border/60 border-t">
          {members.map((member) => {
            const here = worksHere(member)
            return (
              // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
              <label
                key={member.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/40"
              >
                <Checkbox
                  checked={value.includes(member.id)}
                  onCheckedChange={() =>
                    onChange(
                      value.includes(member.id)
                        ? value.filter((v) => v !== member.id)
                        : [...value, member.id],
                    )
                  }
                />
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 font-medium text-cami-violet-11 text-xs">
                  {member.initials}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium text-foreground text-sm">
                    {member.name ?? member.email}
                  </span>
                  {member.title ? (
                    <span className="truncate text-muted-foreground text-xs">{member.title}</span>
                  ) : null}
                </span>
                {!here ? (
                  <Badge variant="secondary" size="sm" className="shrink-0">
                    Not at these locations
                  </Badge>
                ) : null}
              </label>
            )
          })}
        </div>

        <p className="mt-4 text-muted-foreground text-sm">
          {value.length === 0
            ? "Nobody picked, so everybody can sell it."
            : `${value.length} of ${members.length} can sell it.`}
        </p>
      </div>
    </div>
  )
}
