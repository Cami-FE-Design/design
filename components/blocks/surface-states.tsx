"use client"

import { CircleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * The two states a list of branches is in before it is a list (PRD-169's
 * "Done means … empty, loading and error").
 *
 * Empty is each surface's own sentence, because what an empty list means
 * differs — no branches granted (R24) is not no deals. Loading and error do
 * not differ, so they are one pair here rather than five near-copies:
 *
 * - **Loading** keeps the shape of the rows it stands in for, so the panel does
 *   not jump when they land, and says what it is loading to a screen reader.
 * - **Error** says what failed, that nothing was changed, and offers the one
 *   thing reception can do about it. It never falls back to a partial list: a
 *   list of six branches that should be nine reads as a smaller business, the
 *   failure G7 exists to prevent.
 *
 * `status` defaults to `"ready"` on every surface that takes it, so a caller
 * that passes nothing renders exactly as before. The prototype's data is
 * local, so the other two states are reached from /playground.
 */
export type SurfaceStatus = "ready" | "loading" | "error"

export function CardListSkeleton({
  label,
  rows = 3,
  className,
}: {
  /** What is loading, for a screen reader: "Loading locations". */
  label: string
  rows?: number
  className?: string
}) {
  return (
    <div role="status" aria-label={label} className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/60 p-4"
        >
          <Skeleton className="size-9 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  )
}

export function LoadError({
  what,
  onRetry,
  className,
}: {
  /** The thing that failed, lower case: "locations", "deals". */
  what: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-foreground",
        className,
      )}
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
      <div className="flex flex-1 flex-col gap-2">
        <span>
          Couldn&rsquo;t load {what}. Nothing has been changed &mdash; try again, and if it keeps
          happening, check your connection.
        </span>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="self-start"
            onClick={onRetry}
          >
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  )
}
