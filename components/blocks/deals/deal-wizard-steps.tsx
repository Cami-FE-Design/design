"use client"

/**
 * The deal wizard's steps — `DealDetailsStep`, `DealLimitsStep` and
 * `DealWizardPrimitives` on the dev repo's `promotion-discount-ui`, with its
 * copy and layout.
 *
 * One step is added: **locations**, drawn in the idiom of the built
 * `DealTeamStep` (a Select-all row over a checkbox list). The built wizard
 * creates every deal with `locationIds: []`, which its own mapper reads as
 * every venue (R24).
 */

import { CoinsIcon, LightbulbIcon, PercentIcon } from "lucide-react"
import { useState } from "react"

import { DealScopePickerDialog } from "@/components/blocks/deals/deal-scope-picker-dialog"
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
import type { ScopeKind } from "@/lib/deals/wizard"
import type { PromotionScope } from "@/lib/locations/promotion-scope"
import type { Location } from "@/lib/locations/types"
import { cn } from "@/lib/utils"

export function StepHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-heading font-semibold text-2xl text-foreground leading-tight lg:text-4xl">
        {title}
      </h1>
      {hint ? <p className="max-w-2xl text-base text-muted-foreground leading-6">{hint}</p> : null}
    </div>
  )
}

function Tip({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 rounded-2xl bg-cami-violet-2 px-4 py-3.5 text-muted-foreground text-sm">
      <LightbulbIcon className="mt-0.5 size-4 shrink-0" />
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-foreground">{title}</p>
        <p>{children}</p>
      </div>
    </div>
  )
}

// ─── Details ─────────────────────────────────────────────────────────────────

const TITLES: Record<DealType, string> = {
  promotion: "Customize promotion details",
  "flash-sale": "Customize flash sale details",
  "last-minute-offer": "Customize last-minute offer details",
}

function scopeSummary(scope: DealResourceScope, plural: string) {
  if (scope.mode === "all") return `All ${plural}`
  if (scope.mode === "none") return `No ${plural}`
  return `${scope.ids.length} ${plural}`
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
  applicability: DealApplicability
  onApplicability: (v: DealApplicability) => void
}) {
  const [pickerOpen, setPickerOpen] = useState<ScopeKind | null>(null)

  const dateRangeError =
    endDate && startDate && endDate < startDate
      ? "End date must be on or after the start date."
      : null
  const discountValueNumber = Number(discountValue)
  const discountValueError =
    discountValue.trim().length > 0 &&
    (!Number.isFinite(discountValueNumber) || discountValueNumber <= 0)
      ? "Enter a value greater than 0."
      : null
  const scopeError =
    applicability.services.mode === "none" &&
    applicability.products.mode === "none" &&
    applicability.packages.mode === "none"
      ? "Select at least one service, product or package."
      : null

  function scopeFor(kind: ScopeKind): DealResourceScope {
    return kind === "services"
      ? applicability.services
      : kind === "products"
        ? applicability.products
        : applicability.packages
  }

  function applyScope(kind: ScopeKind, next: Set<string> | null) {
    const scope: DealResourceScope =
      next === null
        ? { mode: "all", ids: [] }
        : next.size === 0
          ? { mode: "none", ids: [] }
          : { mode: "selected", ids: [...next] }
    onApplicability({ ...applicability, [kind]: scope })
  }

  const activePicker = pickerOpen ? scopePickerConfig(pickerOpen) : null

  return (
    <div className="flex flex-col gap-10">
      <StepHeading title={TITLES[type]} hint="Choose how and when to apply the promotion." />

      <div className="flex flex-col gap-6">
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
            <Label htmlFor="deal-description">Description (Optional)</Label>
            <span className="text-muted-foreground text-xs">{description.length}/600</span>
          </div>
          <Textarea
            id="deal-description"
            value={description}
            maxLength={600}
            rows={8}
            onChange={(e) => onDescription(e.target.value)}
            placeholder="Tell clients what this deal is about"
          />
        </div>

        <div className="flex max-w-md flex-col gap-2">
          <Label htmlFor="deal-discount-value">Discount value</Label>
          <div className="flex items-center gap-3">
            <div className="flex h-12 flex-1 items-center overflow-hidden rounded-2xl border-2 border-transparent bg-input transition-colors focus-within:border-foreground">
              <span className="shrink-0 pr-2 pl-4 text-muted-foreground text-sm">
                {discountKind === "percentage" ? "%" : "AED"}
              </span>
              <input
                id="deal-discount-value"
                inputMode="decimal"
                value={discountValue}
                onChange={(e) => onDiscountValue(e.target.value.replace(/-/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "-") e.preventDefault()
                }}
                className="h-full min-w-0 flex-1 bg-transparent px-1 font-medium text-foreground text-sm outline-none"
              />
            </div>
            <SegmentedToggle
              ariaLabel="Discount type"
              value={discountKind}
              onValueChange={onDiscountKind}
              className="shrink-0"
              options={[
                {
                  value: "percentage",
                  label: (
                    <>
                      <PercentIcon className="size-4" />
                      <span className="sr-only">Percentage discount</span>
                    </>
                  ),
                },
                {
                  value: "fixed",
                  label: (
                    <>
                      <CoinsIcon className="size-4" />
                      <span className="sr-only">Fixed amount discount</span>
                    </>
                  ),
                },
              ]}
            />
          </div>
          {discountValueError ? (
            <p className="text-destructive text-xs">{discountValueError}</p>
          ) : discountKind === "percentage" && discountValueNumber > 100 ? (
            <p className="text-destructive text-xs">A percentage discount can't exceed 100%.</p>
          ) : null}
        </div>

        <div className="flex max-w-md flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="deal-discount-code">Discount code</Label>
            <Input
              id="deal-discount-code"
              value={discountCode}
              onChange={(e) => onDiscountCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER10"
            />
            <p className="text-muted-foreground text-xs">
              Create a catchy code for clients to use when they book an appointment or buy products
              online
            </p>
          </div>
          <Tip title="Discount codes only available for services and products.">
            Clients cannot apply discount codes when buying memberships or gift cards online.
          </Tip>
        </div>

        <div className="flex max-w-md flex-col gap-3">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="deal-start-date">Promotion starts</Label>
              <Input
                id="deal-start-date"
                type="date"
                value={startDate}
                onChange={(e) => onStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deal-end-date">Promotion ends</Label>
              <Input
                id="deal-end-date"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(e) => onEndDate(e.target.value)}
              />
            </div>
          </div>
          {dateRangeError ? <p className="text-destructive text-xs">{dateRangeError}</p> : null}
          <Tip title="Valid between the start and end dates only.">
            This promotion can only be applied to appointments booked within this period.
          </Tip>
        </div>

        <div className="border-border/60 border-t pt-6">
          <h3 className="mb-4 font-semibold text-foreground text-sm">Apply promotion to</h3>
          <div className="flex max-w-md flex-col gap-3">
            {(["services", "products", "packages"] as const).map((kind) => (
              <div
                key={kind}
                className="flex h-12 min-w-0 items-center gap-2 overflow-hidden rounded-2xl bg-input px-4"
              >
                <span className="flex-1 truncate font-medium text-foreground text-sm">
                  {scopeSummary(scopeFor(kind), kind)}
                </span>
                <button
                  type="button"
                  onClick={() => setPickerOpen(kind)}
                  className="shrink-0 cursor-pointer font-medium text-foreground text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
          {scopeError ? <p className="mt-2 text-destructive text-xs">{scopeError}</p> : null}
        </div>
      </div>

      {activePicker && pickerOpen ? (
        <DealScopePickerDialog
          open
          onOpenChange={(o) => {
            if (!o) setPickerOpen(null)
          }}
          title={activePicker.title}
          searchPlaceholder={activePicker.searchPlaceholder}
          allLabel={activePicker.allLabel}
          itemNounSingular={activePicker.singular}
          itemNounPlural={activePicker.plural}
          groups={activePicker.groups}
          value={scopeFor(pickerOpen).mode === "all" ? null : new Set(scopeFor(pickerOpen).ids)}
          onApply={(next) => applyScope(pickerOpen, next)}
        />
      ) : null}
    </div>
  )
}

// ─── Limits ──────────────────────────────────────────────────────────────────

// A number input still lets "-", "e" and "+" through — blocked at the keystroke
// so a negative limit never renders, as the built step does.
function blockNegativeKeys(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === "-" || e.key === "e" || e.key === "+") e.preventDefault()
}

export function DealLimitsStep({
  value,
  onChange,
}: {
  value: DealLimits
  onChange: (value: DealLimits) => void
}) {
  const totalUsesError =
    value.totalUsesEnabled && (value.totalUses == null || value.totalUses <= 0)
      ? "Enter a number greater than 0."
      : null
  const minPurchaseError =
    value.minimumPurchaseEnabled &&
    (value.minimumPurchaseAmount == null || value.minimumPurchaseAmount <= 0)
      ? "Enter an amount greater than 0."
      : null

  return (
    <div className="flex flex-col gap-10">
      <StepHeading
        title="Set up promotion limits"
        hint="Limit the number of times this promotion can be used"
      />

      <div className="flex max-w-md flex-col divide-y divide-border/60">
        <div className="flex items-start justify-between gap-4 py-5">
          <div>
            <Label htmlFor="deal-limit-one-per-client">Limit to one use per client</Label>
            <p className="mt-0.5 text-muted-foreground text-sm">
              Each client will be able to use this promotion only once.
            </p>
          </div>
          <Switch
            id="deal-limit-one-per-client"
            checked={value.oneUsePerClient}
            onCheckedChange={(v) => onChange({ ...value, oneUsePerClient: v })}
          />
        </div>

        <div className="flex flex-col gap-3 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="deal-limit-total-uses">Limit total number of uses</Label>
              <p className="mt-0.5 text-muted-foreground text-sm">
                Set the total amount of times this promotion can be used.
              </p>
            </div>
            <Switch
              id="deal-limit-total-uses"
              checked={value.totalUsesEnabled}
              onCheckedChange={(v) => onChange({ ...value, totalUsesEnabled: v })}
            />
          </div>
          {value.totalUsesEnabled ? (
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                min={1}
                inputMode="numeric"
                aria-label="Total uses"
                placeholder="e.g. 100"
                value={value.totalUses ?? ""}
                onKeyDown={blockNegativeKeys}
                onChange={(e) => {
                  const next = e.target.value ? Number(e.target.value) : null
                  if (next != null && next < 0) return
                  onChange({ ...value, totalUses: next })
                }}
                className="max-w-40"
              />
              {totalUsesError ? <p className="text-destructive text-xs">{totalUsesError}</p> : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Label htmlFor="deal-limit-min-purchase">Set minimum purchase amount</Label>
              <p className="mt-0.5 text-muted-foreground text-sm">
                The client must spend a minimum amount to qualify for this promotion.
              </p>
            </div>
            <Switch
              id="deal-limit-min-purchase"
              checked={value.minimumPurchaseEnabled}
              onCheckedChange={(v) => onChange({ ...value, minimumPurchaseEnabled: v })}
            />
          </div>
          {value.minimumPurchaseEnabled ? (
            <div className="flex flex-col gap-1">
              <Input
                type="number"
                min={0.01}
                step="0.01"
                inputMode="decimal"
                aria-label="Minimum purchase amount"
                placeholder="e.g. 500"
                value={value.minimumPurchaseAmount ?? ""}
                onKeyDown={blockNegativeKeys}
                onChange={(e) => {
                  const next = e.target.value ? Number(e.target.value) : null
                  if (next != null && next < 0) return
                  onChange({ ...value, minimumPurchaseAmount: next })
                }}
                className="max-w-40"
              />
              {minPurchaseError ? (
                <p className="text-destructive text-xs">{minPurchaseError}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─── Locations ───────────────────────────────────────────────────────────────

/**
 * Turn a ticked set back into a scope.
 *
 * Every box ticked by someone who holds the whole estate is stored as the
 * estate — the named set a branch opened next month joins — the same way the
 * catalogue picker stores `all` rather than today's ids. A manager ticking all
 * of their branches has chosen those branches, not the chain.
 */
export function scopeFromPicked(
  picked: ReadonlyArray<string>,
  available: ReadonlyArray<Location>,
  holdsEstate: boolean,
): PromotionScope {
  if (holdsEstate && available.length > 0 && available.every((l) => picked.includes(l.id))) {
    return { kind: "estate" }
  }
  return { kind: "branches", locationIds: [...picked] }
}

/**
 * Branches grouped by city, in the order the estate lists them.
 *
 * The catalogue picker groups services by category for the same reason: past
 * a handful of rows a flat list is read by searching, and "every Dubai branch"
 * is one decision an owner makes often enough to deserve one click.
 */
export function groupByCity(
  locations: ReadonlyArray<Location>,
): Array<{ city: string; locations: Location[] }> {
  const groups: Array<{ city: string; locations: Location[] }> = []
  for (const l of locations) {
    const city = l.location.city || "Other"
    const group = groups.find((g) => g.city === city)
    if (group) group.locations.push(l)
    else groups.push({ city, locations: [l] })
  }
  return groups
}

export function DealLocationsStep({
  value,
  onChange,
  locations,
  holdsEstate,
}: {
  value: PromotionScope
  onChange: (scope: PromotionScope) => void
  /** The branches this user may scope to — never beyond their grant (R04). */
  locations: ReadonlyArray<Location>
  holdsEstate: boolean
}) {
  const picked =
    value.kind === "estate"
      ? locations.map((l) => l.id)
      : value.locationIds.filter((id) => locations.some((l) => l.id === id))
  const allSelected = locations.length > 0 && locations.every((l) => picked.includes(l.id))
  const groups = groupByCity(locations)

  function set(next: string[]) {
    onChange(scopeFromPicked(next, locations, holdsEstate))
  }

  return (
    <div className="flex flex-col gap-10">
      <StepHeading
        title="Select locations"
        hint="Choose which locations this promotion can be used at."
      />

      <div className="flex max-w-md flex-col">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control */}
        <label className="flex cursor-pointer items-center gap-3 px-2 py-3">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => set(allSelected ? [] : locations.map((l) => l.id))}
          />
          <span className="font-semibold text-foreground text-sm">Select all</span>
          <span className="text-muted-foreground text-sm">{locations.length}</span>
        </label>

        <div className="flex flex-col border-border/60 border-t">
          {groups.map((group) => {
            const ids = group.locations.map((l) => l.id)
            const on = ids.filter((id) => picked.includes(id)).length
            return (
              <div key={group.city} className="flex flex-col">
                {/* One city is no grouping at all, so a single-city chain
                    keeps the flat list. */}
                {groups.length > 1 ? (
                  // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                  <label className="flex cursor-pointer items-center gap-3 border-border/60 border-b px-2 py-3">
                    <Checkbox
                      checked={on === 0 ? false : on === ids.length ? true : "indeterminate"}
                      onCheckedChange={() =>
                        set(
                          on === ids.length
                            ? picked.filter((id) => !ids.includes(id))
                            : [...new Set([...picked, ...ids])],
                        )
                      }
                    />
                    <span className="font-semibold text-foreground text-sm">{group.city}</span>
                    <span className="text-muted-foreground text-sm">{ids.length}</span>
                  </label>
                ) : null}
                {group.locations.map((location) => (
                  // biome-ignore lint/a11y/noLabelWithoutControl: Radix Checkbox is the control
                  <label
                    key={location.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 border-border/40 border-b py-3 pr-2 hover:bg-muted/40",
                      groups.length > 1 ? "pl-9" : "pl-2",
                    )}
                  >
                    <Checkbox
                      checked={picked.includes(location.id)}
                      onCheckedChange={() =>
                        set(
                          picked.includes(location.id)
                            ? picked.filter((id) => id !== location.id)
                            : [...picked, location.id],
                        )
                      }
                    />
                    <span className="truncate text-foreground text-sm">{location.name}</span>
                  </label>
                ))}
              </div>
            )
          })}
        </div>

        {picked.length === 0 ? (
          <p className="mt-2 text-destructive text-xs">Select at least one location.</p>
        ) : value.kind === "estate" ? (
          <p className="mt-4 text-muted-foreground text-sm">
            All locations, including any you open while this promotion runs.
          </p>
        ) : null}
      </div>
    </div>
  )
}
