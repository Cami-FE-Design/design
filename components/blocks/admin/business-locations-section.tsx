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
 * ## Single-site partners see no chain view
 *
 * G3 read in the HQ plane. Four of the five seeded partners trade from one
 * address, and a tab full of chain concepts would make an Account Manager
 * reason about branches for an account that has none.
 *
 * ## What is deliberately not here: a write path
 *
 * An Account Manager standing a chain up is doing it **as the owner** — that is
 * what impersonation is for, and the repo already has it. Duplicating
 * create-and-configure here would be exactly the "lesser HQ-only path" HQ1.1
 * rules out, and it would write to a business with no actor on the record
 * (INV-08). So the action links into a session rather than acting from here.
 */

import { ArrowUpRightIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"

import { LocationStatusBadge } from "@/components/blocks/location-status-badge"
import { MoneyByLocationView } from "@/components/blocks/money/money-by-location"
import { Button } from "@/components/ui/button"
import type { AdminBusiness } from "@/lib/admin-businesses"
import { LocationsProvider, useLocations } from "@/lib/locations/store"
import { isPubliclyBookable } from "@/lib/locations/types"
import type { PeriodFilter } from "@/lib/money/ledger"
import { MONEY_TXS, periodBounds } from "@/lib/money/mock"

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
    return (
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Locations
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {business.name} trades from one location, so there is no chain to view. The owner can
            add branches themselves at any time.
          </p>
        </div>
        <div className="flex items-start gap-3 rounded-2xl bg-muted/40 p-4">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
            <MapPinIcon className="size-4" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-medium leading-5 text-foreground">{business.name}</span>
            <span className="text-sm leading-5 text-muted-foreground">
              {business.street}, {business.city}
            </span>
          </div>
        </div>
      </section>
    )
  }

  return (
    // Scoped to this partner's branches, and read-only by construction: an
    // Account Manager viewing a chain is not inside the owner's session.
    <LocationsProvider persist={false} initialGrants={[...branchIds]}>
      <ChainView business={business} />
    </LocationsProvider>
  )
}

function ChainView({ business }: { business: AdminBusiness }) {
  const { granted } = useLocations()
  const live = granted.filter((location) => location.status === "live")

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            {granted.length} locations
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            {live.length === granted.length
              ? "All trading."
              : `${live.length} trading, ${granted.length - live.length} not.`}{" "}
            Everything here is the owner&apos;s own record, read live.
          </p>
        </div>

        <ul className="flex flex-col gap-2">
          {granted.map((location) => (
            <li
              key={location.id}
              className="flex items-start gap-3 rounded-2xl border border-border/60 p-3"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <MapPinIcon className="size-4" />
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
          Branches are added and configured inside the account, as the owner — the same setup they
          would use themselves. Start a session and every change is recorded against you.
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
