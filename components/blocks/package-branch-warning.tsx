"use client"

/**
 * SCR-13 · The package-mismatch warning at checkout (R08, KC1.5).
 *
 * "Warning, the reason, and a path that still completes." All three are
 * load-bearing:
 *
 * - **Warning**, not an error. The sale completes either way, and styling it
 *   as a failure teaches reception to treat it as one.
 * - **The reason**, in the client's terms and with both numbers. "This package
 *   may not apply here" sends reception to the phone; "sold at AED 60, AED 75
 *   here" lets them decide in front of the client.
 * - **A path that completes.** The two choices are the two things businesses
 *   already do by hand today, so the warning offers them rather than leaving
 *   staff to improvise a workaround the books cannot explain.
 *
 * The decision is recorded because a warning nobody can audit costs the
 * business money quietly (EC-4). Not suspicion — it is so an owner reading a
 * branch's numbers can see why a package redeemed below its value instead of
 * finding an unexplained hole at month end.
 */

import { TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatAed } from "@/lib/format"
import { useLocations } from "@/lib/locations/store"
import type { PackageMismatch } from "@/lib/service-catalog/package-branch-check"
import { cn } from "@/lib/utils"

function aed(minor: number): string {
  return formatAed(Math.round(minor / 100))
}

/** How staff resolved it. Both options are what operators already do by hand. */
export type PackageDecision = "honour" | "chargeDifference"

export function PackageBranchWarning({
  mismatch,
  soldAtLocationId,
  serviceName,
  decision,
  onDecide,
  className,
}: {
  mismatch: PackageMismatch
  soldAtLocationId: string
  serviceName: string
  decision: PackageDecision | null
  onDecide: (decision: PackageDecision) => void
  className?: string
}) {
  const { locationName } = useLocations()

  // Nothing to say when the terms match. The absence is the design.
  if (mismatch.kind === "match") return null

  const soldAt = locationName(soldAtLocationId)

  const reason =
    mismatch.kind === "notOfferedHere"
      ? `${serviceName} isn't offered at this location. The package was sold at ${soldAt}.`
      : mismatch.kind === "priceDiffers"
        ? `${serviceName} was sold at ${aed(mismatch.soldAtMinor)} at ${soldAt}, and is ${aed(mismatch.hereMinor)} here.`
        : `${serviceName} was sold as ${mismatch.soldAtMin} min at ${soldAt}, and is ${mismatch.hereMin} min here.`

  return (
    <div className={cn("flex flex-col gap-3 rounded-xl bg-cami-yellow-2 p-3 text-sm", className)}>
      <div className="flex items-start gap-2">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" />
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">
            This package was sold on different terms
          </span>
          <span className="text-foreground">{reason}</span>
          {/* Said out loud, because the instinct on seeing a warning at
              checkout is to stop. */}
          <span className="text-muted-foreground">
            You can still complete this sale. Choose how to handle it and it'll be recorded on the
            sale.
          </span>
        </div>
      </div>

      {decision ? (
        <p className="text-foreground">
          Recorded:{" "}
          <span className="font-medium">
            {decision === "honour"
              ? "honoured at the price it was sold"
              : "client charged the difference"}
          </span>
          .{" "}
          <button
            type="button"
            className="underline underline-offset-2 hover:no-underline"
            onClick={() => onDecide(decision === "honour" ? "chargeDifference" : "honour")}
          >
            Change
          </button>
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            onClick={() => onDecide("honour")}
          >
            Honour the sold price
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            onClick={() => onDecide("chargeDifference")}
          >
            Charge the difference
          </Button>
        </div>
      )}
    </div>
  )
}
