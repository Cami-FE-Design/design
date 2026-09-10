"use client"

/**
 * SCR-13 · Redeeming a client's package at checkout, at one branch (R08,
 * KC1.5, R11).
 *
 * ## The host the warning never had
 *
 * `package-branch-warning.tsx` and its rule were built first and had nowhere to
 * fire: there was no package redemption at checkout to attach them to, in this
 * repo or in `cami-business`'s UI. The **contract** does exist though —
 * eligibility per service and `redeem` per session are both built and unused —
 * so this is the missing surface, against the real shape rather than a guessed
 * one.
 *
 * ## Per line, not per sale
 *
 * Eligibility is a verdict **per service**, so the panel is a list of the cart's
 * service lines and what covers each. A sale-level "apply package" would have to
 * pick a line, and picking is what a receptionist is doing.
 *
 * ## Warn, never block
 *
 * A branch mismatch sits beside a `covered` verdict rather than replacing it,
 * so Apply stays available and the sale completes either way. The decision is
 * recorded on the sale — not out of suspicion, but so an owner reading a
 * branch's numbers can see why a package redeemed below its value.
 *
 * A verdict that genuinely cannot be applied — exhausted, expired, nothing
 * covering it — says so in words a receptionist can repeat to the client, and
 * offers nothing. That is a different thing from a mismatch and reads
 * differently.
 *
 * ## Consumed here, owned by the business
 *
 * R08: the package is held at the business while the redemption resolves to
 * exactly one location. So the panel needs a branch before it can redeem, and
 * takes it from `WriteTargetLocation` rather than a default (R11).
 */

import { CheckIcon, PackageIcon } from "lucide-react"
import { useState } from "react"

import {
  PackageBranchWarning,
  type PackageDecision,
} from "@/components/blocks/package-branch-warning"
import { WriteTargetLocation } from "@/components/blocks/write-target-location"
import { Button } from "@/components/ui/button"
import {
  blockedReason,
  type PackageRedemption,
  type ServiceEligibility,
} from "@/lib/service-catalog/package-eligibility"
import { cn } from "@/lib/utils"

export type RedeemableLine = {
  /** The cart line's own id, so applying twice to one line is impossible. */
  uid: string
  serviceId: string
  serviceName: string
  /** What the line charges now, in fils. */
  priceMinor: number
  eligibility: ServiceEligibility
  /** Where the package was sold, for the mismatch copy. */
  soldAtLocationId: string
}

export function PackageRedemptionPanel({
  lines,
  applied,
  onApply,
  onRemove,
  className,
}: {
  lines: ReadonlyArray<RedeemableLine>
  /** Line uids already covered by a package in this sale. */
  applied: ReadonlyArray<string>
  onApply: (uid: string, redemption: PackageRedemption) => void
  onRemove: (uid: string) => void
  className?: string
}) {
  const [locationId, setLocationId] = useState<string | null>(null)
  const [decisions, setDecisions] = useState<Record<string, PackageDecision>>({})

  const covered = lines.filter((line) => line.eligibility.customerPackage !== null)

  if (covered.length === 0) {
    return (
      <div className={cn("flex items-start gap-3 rounded-2xl bg-muted/40 p-4", className)}>
        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-background text-muted-foreground">
          <PackageIcon className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-medium leading-5 text-foreground">
            No packages to apply
          </span>
          <p className="text-sm leading-5 text-muted-foreground">
            Nothing in this sale is covered by a package this client holds.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-base font-semibold leading-6 text-foreground">Packages</h3>
        <p className="text-sm leading-5 text-muted-foreground">
          A package belongs to the client and travels between locations. The session is used up
          here, at the location that does the work.
        </p>
      </div>

      {/* Before any Apply: a redemption resolves to exactly one location, and
          there is no default. */}
      <WriteTargetLocation
        value={locationId}
        onChange={setLocationId}
        label="Redeeming at"
        action="A redemption"
      />

      <ul className="flex flex-col gap-2">
        {covered.map((line) => {
          const { eligibility } = line
          const isApplied = applied.includes(line.uid)
          const reason = blockedReason(eligibility)
          const pkg = eligibility.customerPackage
          const decision = decisions[line.uid] ?? null
          // A mismatch has to be decided before it can be recorded — KC1.5 asks
          // for the decision on the sale, and applying without one would leave
          // an owner reading a discount with no reason attached.
          const needsDecision = Boolean(eligibility.mismatch) && decision === null

          return (
            <li
              key={line.uid}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border p-3",
                isApplied ? "border-cami-green-7 bg-cami-green-2" : "border-border/60",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm font-medium leading-5 text-foreground">
                    {line.serviceName}
                  </span>
                  {pkg ? (
                    <span className="text-xs text-muted-foreground">
                      {pkg.code}
                      <span aria-hidden> · </span>
                      {pkg.sessionsRemaining === null
                        ? "Unlimited sessions"
                        : `${pkg.sessionsRemaining} ${
                            pkg.sessionsRemaining === 1 ? "session" : "sessions"
                          } left`}
                    </span>
                  ) : null}
                </span>

                {isApplied ? (
                  <span className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm font-medium text-cami-green-11">
                      <CheckIcon className="size-4" />
                      Applied
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      radius="full"
                      onClick={() => onRemove(line.uid)}
                    >
                      Remove
                    </Button>
                  </span>
                ) : reason ? (
                  // Not applicable, and the sentence is the whole affordance —
                  // a disabled Apply beside it would invite a second try.
                  <span className="text-sm text-muted-foreground">{reason}</span>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    radius="full"
                    disabled={!locationId || needsDecision}
                    onClick={() =>
                      locationId &&
                      onApply(line.uid, {
                        packageId: pkg?.id ?? "",
                        serviceId: line.serviceId,
                        fulfilledAtLocationId: locationId,
                        source: "direct",
                        // The warning's own words, so what is recorded and
                        // what the operator pressed are the same thing.
                        decision:
                          decision === "honour"
                            ? "honoured-sold-price"
                            : decision === "chargeDifference"
                              ? "charged-the-difference"
                              : undefined,
                      })
                    }
                  >
                    Apply package
                  </Button>
                )}
              </div>

              {/* Beside a covered verdict, never instead of it. Apply stays
                  reachable — the sale completes either way (KC1.5). */}
              {eligibility.mismatch && !isApplied ? (
                <PackageBranchWarning
                  mismatch={eligibility.mismatch}
                  soldAtLocationId={line.soldAtLocationId}
                  serviceName={line.serviceName}
                  decision={decision}
                  onDecide={(next) => setDecisions((current) => ({ ...current, [line.uid]: next }))}
                />
              ) : null}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
