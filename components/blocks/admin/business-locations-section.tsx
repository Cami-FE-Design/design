"use client"

/**
 * SCR-16 · A chain, seen from CamiHQ (E15, HQ1.1, HQ1.2, R02, R18).
 *
 * ## Why this reuses the owner's surfaces instead of drawing its own
 *
 * Both stories fix it. HQ1.1: "HQ-assisted setup produces the same result as if
 * the owner had done it themselves. **There is no lesser HQ-only path.**"
 * HQ1.2: "Viewing from HQ shows **the same** per-branch breakdown and roll-up
 * an owner would see." A bespoke HQ chain dashboard would be a second
 * implementation of both, and the second one is the one that drifts.
 *
 * So this section mounts the estate and the money roll-up an owner uses, and
 * adds only what HQ genuinely has that the owner does not: which partner am I
 * looking at, and the fact that this is not my data.
 *
 * ## Single-site partners see no chain view, but do see the switch
 *
 * G3 read in the HQ plane. Four of the five seeded partners trade from one
 * address, and a tab full of chain concepts would make an Account Manager
 * reason about branches for an account that has none. The multi-location
 * switch is the exception: HQ turns it on before the second branch exists, so
 * it has to be reachable on an account that still has one.
 *
 * ## What is deliberately not here: a write path
 *
 * An Account Manager standing a chain up is doing it **as the owner** — that is
 * what impersonation is for, and the repo already has it. Duplicating
 * create-and-configure here would be exactly the "lesser HQ-only path" HQ1.1
 * rules out, and it would write to a business with no actor on the record
 * (INV-08). So the action links into a session rather than acting from here.
 */

import { ArrowUpRightIcon, BuildingIcon } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { DesignRepoBar } from "@/components/blocks/design-repo-bar"
import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { MoneyByLocationView } from "@/components/blocks/money/money-by-location"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { AdminBusiness } from "@/lib/admin-businesses"
import {
  blockedReason,
  canEnable,
  checkBlockers,
  formatEnabledOn,
  type MultiLocationEnablement,
} from "@/lib/locations/enablement"
import { locationsForBusiness } from "@/lib/locations/from-business"
import { NINE_BRANCH_ESTATE } from "@/lib/locations/mock"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { isPubliclyBookable, type Location } from "@/lib/locations/types"
import type { PeriodFilter } from "@/lib/money/ledger"
import { MONEY_TXS, periodBounds } from "@/lib/money/mock"
import { getPublicBusinessBySlug } from "@/lib/public-business"

/**
 * The period the roll-up opens on. Month to date, because the question an
 * Account Manager brings is "is this account operating **now**" — a lifetime
 * total says a chain traded once.
 */
const HQ_PERIOD: PeriodFilter = {
  fromIso: periodBounds("month-to-date").fromIso,
  toIso: periodBounds("month-to-date").toIso,
}

export function BusinessLocationsSection({ business }: { business: AdminBusiness }) {
  const branchIds = business.locationIds ?? []

  if (branchIds.length <= 1) {
    return <SingleLocationView business={business} />
  }

  return (
    // Scoped to this partner's branches, and read-only by construction: an
    // Account Manager viewing a chain is not inside the owner's session.
    //
    // The ESTATE has to be passed as well as the grants. Given grants alone the
    // provider falls back to the three-branch demo estate, and nine ids
    // resolved against three left the tab saying "9 locations" while the panel
    // under it listed three and the money roll-up summed those three — HQ1.2
    // says HQ shows the same breakdown an owner sees, and it was showing a
    // third of it.
    <LocationsProvider
      persist={false}
      initialLocations={estateFor(business)}
      initialGrants={[...branchIds]}
    >
      <ChainView business={business} />
    </LocationsProvider>
  )
}

/**
 * One address, and the switch above it. The switch is held here rather than
 * in a provider: the demo provider seeds the chain's switched-on state, and a
 * single-site partner starts off.
 */
function SingleLocationView({ business }: { business: AdminBusiness }) {
  const [enablement, setEnablement] = useState<MultiLocationEnablement>({
    enabled: false,
    dataCheck: "passed",
  })
  return (
    <div className="flex flex-col gap-6">
      <EnablementCard
        business={business}
        enablement={enablement}
        setEnabled={(enabled) => setEnablement((current) => switchedTo(current, enabled))}
      />
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Locations
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">One location.</p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
            <BuildingIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium leading-5 text-foreground">{business.name}</span>
            <span className="text-sm leading-5 text-muted-foreground">
              {business.street}, {business.city}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}

/** The switch flipped, recording who and when on the way on (INV-08). */
function switchedTo(current: MultiLocationEnablement, enabled: boolean): MultiLocationEnablement {
  return {
    ...current,
    enabled,
    enabledBy: enabled ? "Michelle You" : current.enabledBy,
    enabledAt: enabled ? new Date().toISOString().slice(0, 10) : current.enabledAt,
  }
}

/** The chain's switch, read from the provider every chain surface reads. */
function ChainEnablementCard({ business }: { business: AdminBusiness }) {
  const { enablement, setEnabled } = useLocations()
  return <EnablementCard business={business} enablement={enablement} setEnabled={setEnabled} />
}

/**
 * This partner's own branches, read the way every other surface reads them.
 *
 * Falls back to the ids on the admin record when the partner has no public
 * business behind it — a partner that has not published yet still has an
 * estate, and an Account Manager still has to be able to see it.
 */
function estateFor(business: AdminBusiness): Location[] {
  const published = getPublicBusinessBySlug(business.slug)
  if (published) return locationsForBusiness(published)
  const ids = new Set(business.locationIds ?? [])
  return NINE_BRANCH_ESTATE.filter((l) => ids.has(l.id))
}

/**
 * Branches listed before the dialog becomes a scroll.
 *
 * This sits in a partner dialog with a money roll-up under it and five tabs
 * around it. Nine two-line cards push the roll-up off the bottom, and an
 * Account Manager opening Locations wants to know the shape of the account
 * before they want its ninth address.
 */
const VISIBLE_BRANCHES = 4

/**
 * HQ's own switch, and the only write on this tab (GNK §2).
 *
 * "Before any of this appears, Cami HQ turns multi-location on for that
 * business, once its data check has passed." It is not a lesser HQ-only path
 * to the owner's features — it is the gate in front of them, which only HQ
 * holds, so it does not fall foul of HQ1.1 the way a duplicate setup flow would.
 *
 * The check is shown next to the switch rather than behind it. Hidden, "why
 * can't I turn this on" becomes a support call; named, an Account Manager can
 * see what has to be fixed and who has to fix it.
 *
 * Turning it OFF is never blocked. Somebody standing an account down should not
 * be stopped by the reason they are standing it down. Either way it applies
 * straight away, like the other merchant switches HQ holds.
 */
function EnablementCard({
  business,
  enablement: stored,
  setEnabled,
}: {
  business: AdminBusiness
  enablement: MultiLocationEnablement
  setEnabled: (enabled: boolean) => void
}) {
  // Demo only: a failed check is not reachable from the seeded chain, whose
  // check passed before it was switched on. The control below stands in for
  // the check coming back with findings. It lands on an account that is off,
  // the state the findings stand in front of, without touching the stored
  // switch, so showing the check passing again puts back whatever was there.
  const [demoFailed, setDemoFailed] = useState(false)
  const enablement = demoFailed ? { ...stored, ...DEMO_FAILED_CHECK, enabled: false } : stored
  const reason = blockedReason(enablement)
  const blockers = checkBlockers(enablement)
  const allowed = canEnable(enablement)

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium leading-5 text-foreground">Multi-location</span>
          <span className="text-sm leading-5 text-muted-foreground">
            {enablement.enabled
              ? `On since ${formatEnabledOn(enablement.enabledAt)}, switched on by ${enablement.enabledBy}.`
              : `Off. Locations are hidden from ${business.name}.`}
          </span>
        </div>
        <Switch
          checked={enablement.enabled}
          // Off is always allowed; on waits for the check.
          disabled={!enablement.enabled && !allowed}
          onCheckedChange={setEnabled}
          aria-label="Multi-location"
        />
      </div>

      {/* The check, said out loud whatever it found — including that it passed,
          because an Account Manager about to switch an account on wants to know
          the thing behind the switch actually ran. A failed check lists every
          finding, so one round of fixes clears it. */}
      {blockers.length > 0 ? (
        <div className="flex flex-col gap-1 rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground">
          <p className="font-medium">Data check failed. Fix these first:</p>
          <ul aria-label="Data check findings" className="list-disc pl-5">
            {blockers.map((blocker) => (
              <li key={blocker}>{blocker}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p
          className={
            reason
              ? "rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5 text-foreground"
              : "text-sm leading-5 text-muted-foreground"
          }
        >
          {reason ?? "Data check passed."}
        </p>
      )}

      {/* The seeded chain always passes its check, so a failed one is only
          reachable from here — in the design-repo strip, not the page. */}
      <DesignRepoBar label="see the data check fail">
        <Button
          type="button"
          size="sm"
          variant="outline"
          radius="full"
          onClick={() => setDemoFailed((v) => !v)}
        >
          {demoFailed ? "Show the check passing" : "Show the check failing"}
        </Button>
      </DesignRepoBar>
    </section>
  )
}

/** What the demo's failed check found. Facts an account manager can hand on. */
const DEMO_FAILED_CHECK: Pick<MultiLocationEnablement, "dataCheck" | "dataCheckFindings"> = {
  dataCheck: "failed",
  dataCheckFindings: [
    "12 appointments have no location",
    "3 card machines have no location",
    "2 team members have no location",
  ],
}

function ChainView({ business }: { business: AdminBusiness }) {
  const { granted } = useLocations()
  const live = granted.filter((location) => location.status === "live")
  const [showAll, setShowAll] = useState(false)
  const shown = showAll ? granted : granted.slice(0, VISIBLE_BRANCHES)
  const hidden = granted.length - shown.length

  return (
    <div className="flex flex-col gap-6">
      <ChainEnablementCard business={business} />
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            {granted.length} locations
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {live.length === granted.length
              ? "All live."
              : `${live.length} of ${granted.length} live`}
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {shown.map((location) => (
            <li
              key={location.id}
              className="flex items-start gap-3 rounded-2xl border border-border/60 p-3"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <BuildingIcon className="size-4" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium leading-5 text-foreground">
                    {location.name}
                  </span>
                  <LocationStatusBadge status={location.status} />
                </span>
                <span className="truncate text-sm leading-5 text-muted-foreground">
                  {location.location.address}, {location.location.city}
                </span>
              </div>
              {/* The one check an Account Manager can make without entering the
                  account at all: is this branch actually reachable by a client.
                  Offered only when it is — a paused branch's page 404s, and a
                  link to it next to a Paused badge has the row contradicting
                  itself. Absent, with the reason, rather than broken. */}
              {isPubliclyBookable(location.status) ? (
                <Link
                  href={`/${location.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Public page
                </Link>
              ) : (
                <span className="shrink-0 text-sm text-muted-foreground">No public page</span>
              )}
            </li>
          ))}
        </ul>

        {/* Counted, because four of nine hidden is a different decision from
            one — and the heading above already says how many there are, so the
            list being short is a choice rather than the whole account. */}
        {hidden > 0 || showAll ? (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="w-fit text-left font-medium text-cami-violet-11 text-sm hover:underline"
          >
            {showAll
              ? "Show fewer locations"
              : `Show ${hidden} more ${hidden === 1 ? "location" : "locations"}`}
          </button>
        ) : null}
      </section>

      {/* No heading of its own: MoneyByLocationView brings one ("Money by
          location") and a line explaining itself, and two stacked headings with
          two paragraphs put a wall of prose between an Account Manager and the
          only numbers on the screen. */}
      <MoneyByLocationView txs={MONEY_TXS} filter={HQ_PERIOD} />

      <section className="flex flex-col gap-2 rounded-2xl bg-muted/40 p-4">
        <span className="text-sm font-medium leading-5 text-foreground">
          Standing this chain up
        </span>
        <p className="text-sm leading-5 text-muted-foreground">
          Add locations from inside the account. Changes are recorded against you.
        </p>
        <Button asChild variant="outline" radius="full" className="w-fit gap-1.5">
          <Link href={`/admin/impersonation?business=${business.slug}`}>
            Start a session
            <ArrowUpRightIcon className="size-4" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
