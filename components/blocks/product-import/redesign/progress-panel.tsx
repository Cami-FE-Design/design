"use client"

// The machine phases, rendered inside a step rather than as steps of their own
// (spec defect D17). The operator has three steps; the file check and the write
// are things that happen during two of them.

import { AlertTriangleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PROGRESS_COPY } from "@/lib/product-import/copy"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  body: string
  progress: number | null
  error?: string | null
  onRetry: () => void
}

export function ProgressPanel({ title, body, progress, error, onRetry }: Props) {
  // The failure state used to be a narrow centred tinted block with no card
  // around it, so a failed job changed the shape of the whole step. It sits in
  // the same panel frame as every other state now; only the notice inside it
  // differs.
  if (error) {
    return (
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center rounded-2xl border border-border bg-card p-6">
        <div className="flex w-full max-w-xl flex-col gap-3 rounded-xl bg-cami-yellow-2 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon
              className="mt-0.5 size-4 shrink-0 text-cami-yellow-11"
              strokeWidth={1.5}
            />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-medium text-foreground">
                We couldn&apos;t get through that file
              </p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            radius="full"
            className="ms-7 w-fit"
            onClick={onRetry}
          >
            {PROGRESS_COPY.failedRetry}
          </Button>
        </div>
      </div>
    )
  }

  const determinate = typeof progress === "number" && Number.isFinite(progress)
  const pct = determinate ? Math.min(100, Math.max(0, progress as number)) : null

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card p-6 text-center">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct ?? undefined}
      >
        <div
          className={cn(
            "h-full rounded-full bg-cami-violet-9",
            determinate ? "transition-[width] duration-500 ease-out" : "w-2/5 animate-pulse",
          )}
          style={determinate ? { width: `${pct}%` } : undefined}
        />
      </div>
      {determinate && <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>}
    </div>
  )
}
