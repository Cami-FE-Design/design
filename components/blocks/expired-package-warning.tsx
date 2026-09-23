"use client"

/**
 * A package that ran out of time with sessions still on it.
 *
 * Ported from `cami-business`'s `ExpiredPackageWarning`, and the wording is
 * **theirs, unchanged** — one sentence naming the package by its code, its
 * expiry date, what is left on it, and the two things an operator can do.
 * The first port here split it into a bold heading and a body and reworded the
 * last line, which is why it read as something written for this repo rather
 * than the notice the product already shows.
 *
 * Where it is mounted is ours: the dev repo puts it on the add- and detail-
 * appointment sheets, and this repo's coverage runs at the till, so it sits in
 * the cart — and only once the cart holds something the expired package would
 * have paid for. On the client alone it is noise.
 */

import { TriangleAlertIcon, XIcon } from "lucide-react"

import type { CustomerPackageSummary } from "@/lib/packages/customer-packages"

function expiryLabel(iso: string | null | undefined): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function ExpiredPackageWarning({
  pkg,
  onDismiss,
}: {
  pkg: CustomerPackageSummary
  onDismiss: () => void
}) {
  const expiredDate = expiryLabel(pkg.expiresAt)
  const left = pkg.sessionType === "unlimited" ? null : (pkg.sessionsRemaining ?? 0)

  const sessionText =
    left != null && left > 0
      ? `${left} session${left !== 1 ? "s" : ""} remain from the last active cycle. Charge at normal rate or apply manually.`
      : "No sessions remain from the last active cycle."

  return (
    <div className="flex items-start gap-3 rounded-xl bg-cami-yellow-2 px-4 py-3">
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
      <p className="flex-1 text-sm leading-5 text-foreground">
        This client&apos;s package <span className="font-medium">({pkg.code})</span>
        {expiredDate ? ` expired on ${expiredDate}.` : " has expired."} {sessionText}
      </p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss expired package warning"
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
