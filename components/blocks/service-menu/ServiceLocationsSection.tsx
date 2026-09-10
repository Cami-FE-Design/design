"use client"

/**
 * SCR-09 · Branch service catalog (R06, DW3.1–DW3.3).
 *
 * One service, configured per branch. The section sits on the service's own
 * sheet rather than on each branch's settings, because the question it answers
 * is "where do I sell this, and for how much" — asked once per service, not
 * once per branch. A nine-branch chain configuring a menu the other way round
 * would open nine settings panels per service.
 *
 * Three rules, and each is a thing that could quietly go wrong:
 *
 * - **DW3.1** Raising the business default must leave an overridden branch
 *   untouched. That works because an override stores only the field the branch
 *   deliberately differs on. Inherited fields stay live and follow the default.
 * - **DW3.2** Resetting one field reverts only that field. Reset is per field
 *   and manual — never a "reset branch" button, which would throw away
 *   decisions the operator never mentioned.
 * - **DW3.3** A service can be turned off at one branch without touching the
 *   business definition or any other branch.
 *
 * Why inherited values are shown rather than left blank: an empty price field
 * next to "inherited" makes the operator go and look up the default. The value
 * is shown, marked as the business's, and typing over it is what creates the
 * override. Clearing the field is what removes it.
 */

import { RotateCcwIcon } from "lucide-react"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useLocations } from "@/lib/locations/store"
import {
  type LocationOffering,
  offeringKey,
  overrideCount,
  resetField,
  resolveOffering,
  type ServiceDefaults,
} from "@/lib/service-catalog/offerings"
import { formatDurationMin } from "@/lib/service-catalog/types"
import { cn } from "@/lib/utils"

export function ServiceLocationsSection({
  serviceId,
  defaults,
  offerings,
  onChange,
}: {
  serviceId: string
  /** The business-level values every branch inherits until it says otherwise. */
  defaults: ServiceDefaults
  offerings: LocationOffering[]
  onChange: (next: LocationOffering[]) => void
}) {
  const { locations } = useLocations()

  function offeringFor(locationId: string): LocationOffering | undefined {
    return offerings.find((o) => o.locationId === locationId)
  }

  function upsert(locationId: string, mutate: (current: LocationOffering) => LocationOffering) {
    const existing = offeringFor(locationId)
    const base: LocationOffering = existing ?? {
      serviceId,
      locationId,
      enabled: true,
      overrides: {},
    }
    const next = mutate(base)
    // An offering that says nothing — enabled with no overrides — is the
    // default, so it is dropped rather than stored. Otherwise every branch
    // accumulates a row that means "no opinion", and a later default change
    // has to be reasoned about against rows that do nothing.
    const isDefault = next.enabled && overrideCount(next) === 0
    const others = offerings.filter((o) => o.locationId !== locationId)
    onChange(isDefault ? others : [...others, next])
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        This service is defined once for the business. Each location inherits it, and can differ on
        any field. Business default:{" "}
        <span className="font-medium text-foreground">
          AED {defaults.price} · {formatDurationMin(defaults.duration)}
        </span>
        .
      </p>

      {locations.map((loc) => {
        const offering = offeringFor(loc.id)
        const resolved = resolveOffering(defaults, offering)
        const count = overrideCount(offering)
        const priceId = `${offeringKey(serviceId, loc.id)}-price`
        const durationId = `${offeringKey(serviceId, loc.id)}-duration`
        const enabledId = `${offeringKey(serviceId, loc.id)}-enabled`

        return (
          <div
            key={loc.id}
            className={cn(
              "flex flex-col gap-3 rounded-2xl border border-border/60 p-4",
              !resolved.enabled && "bg-muted/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">{loc.name}</span>
                  <LocationStatusBadge status={loc.status} />
                </span>
                <span className="text-sm text-muted-foreground">
                  {!resolved.enabled
                    ? "Not offered here"
                    : count === 0
                      ? "Inherits the business default"
                      : count === 1
                        ? "1 field set for this location"
                        : `${count} fields set for this location`}
                </span>
                {/* A paused location is still configurable — you set a menu up
                    before reopening. But "on" next to a Paused badge reads as
                    "bookable here", which it is not, so the row says which of
                    the two the toggle is about. */}
                {loc.status !== "live" ? (
                  <span className="text-sm text-muted-foreground">
                    {loc.status === "archived"
                      ? "This location is archived and takes no bookings. Its menu is kept for its history."
                      : "This location is paused, so nothing is bookable here yet. This applies when it reopens."}
                  </span>
                ) : null}
              </div>
              {/* Labelled, not just an aria-label: a bare switch beside a
                  location name does not say what it switches. */}
              <div className="flex shrink-0 items-center gap-2">
                <Label htmlFor={enabledId} className="text-sm font-normal text-muted-foreground">
                  Offered here
                </Label>
                <Switch
                  id={enabledId}
                  checked={resolved.enabled}
                  aria-label={`Offer this service at ${loc.name}`}
                  onCheckedChange={(on) => upsert(loc.id, (cur) => ({ ...cur, enabled: on }))}
                />
              </div>
            </div>

            {/* Stacked, and capped at max-w-md like every other settings form.
                Side by side could not fit a label, a Custom chip and Reset
                without the duration label wrapping, and a wrapped header in one
                column threw the two inputs out of alignment. */}
            {resolved.enabled ? (
              <div className="flex w-full max-w-md flex-col gap-5">
                <FieldWithReset
                  id={priceId}
                  label="Price"
                  overridden={resolved.source.price === "location"}
                  onReset={() => upsert(loc.id, (cur) => resetField(cur, "price"))}
                >
                  <Input
                    id={priceId}
                    type="number"
                    min={0}
                    value={String(resolved.price)}
                    onChange={(e) => {
                      const raw = e.target.value
                      // Clearing the field is the same operation as Reset:
                      // back to inheriting, not "this branch charges nothing"
                      // — free is a price type, not an empty field.
                      upsert(loc.id, (cur) =>
                        raw === ""
                          ? resetField(cur, "price")
                          : { ...cur, overrides: { ...cur.overrides, price: Number(raw) } },
                      )
                    }}
                  />
                </FieldWithReset>
                <FieldWithReset
                  id={durationId}
                  label="Duration"
                  overridden={resolved.source.duration === "location"}
                  unit="In minutes"
                  onReset={() => upsert(loc.id, (cur) => resetField(cur, "duration"))}
                >
                  <Input
                    id={durationId}
                    type="number"
                    min={0}
                    step={5}
                    value={String(resolved.duration)}
                    onChange={(e) => {
                      const raw = e.target.value
                      upsert(loc.id, (cur) =>
                        raw === ""
                          ? resetField(cur, "duration")
                          : { ...cur, overrides: { ...cur.overrides, duration: Number(raw) } },
                      )
                    }}
                  />
                </FieldWithReset>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

/**
 * A field that says where its value came from, and offers exactly one way back.
 *
 * The marker is on the field, not the row: a branch can differ on price while
 * still following the business duration, and a row-level badge would hide
 * which is which — the whole point of "the UI always shows which state a field
 * is in".
 */
function FieldWithReset({
  id,
  label,
  overridden,
  onReset,
  children,
  unit,
}: {
  id: string
  label: string
  overridden: boolean
  onReset: () => void
  children: React.ReactNode
  /** Appended to the source line, so the label never carries a wrapping "(min)". */
  unit?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <Label htmlFor={id}>{label}</Label>
          {/* Beside the label, and quiet. It was violet and sat under the field
              like a link — which put the status where the eye looks for an
              action and left Reset, the only interactive thing here, looking
              passive. */}
          {overridden ? (
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium leading-4 text-muted-foreground">
              Custom
            </span>
          ) : null}
        </span>
        {overridden ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto gap-1 px-1.5 py-0.5 text-xs text-muted-foreground"
            onClick={onReset}
          >
            <RotateCcwIcon className="size-3" />
            Reset
          </Button>
        ) : null}
      </div>
      {children}
      <span className="text-xs text-muted-foreground">
        {overridden ? "Set for this location" : "Inherited from the business"}
        {unit ? `. ${unit}` : ""}
      </span>
    </div>
  )
}
