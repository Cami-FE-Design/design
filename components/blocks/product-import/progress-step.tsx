"use client"

// Steps 2 and 4 — the two machine phases. Production polls a job; here the
// wizard ticks a simulated progress value. Also carries the failure banner,
// whose only recovery is starting over (spec defect D6).

import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ClockIcon,
  Loader2Icon,
  PauseCircleIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { BulkJobStatus } from "@/lib/product-import/types"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  BulkJobStatus,
  {
    label: string
    variant: "muted" | "primary-soft" | "warning" | "outline" | "destructive"
    className?: string
    icon: typeof ClockIcon
    spin?: boolean
  }
> = {
  QUEUED: { label: "Queued", variant: "muted", icon: ClockIcon },
  PROCESSING: { label: "Processing", variant: "primary-soft", icon: Loader2Icon, spin: true },
  AWAITING_CONFIRMATION: { label: "Awaiting review", variant: "warning", icon: AlertCircleIcon },
  COMPLETED: {
    label: "Completed",
    variant: "outline",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CheckCircle2Icon,
  },
  FAILED: { label: "Failed", variant: "destructive", icon: AlertCircleIcon },
  CANCELLED: { label: "Cancelled", variant: "muted", icon: PauseCircleIcon },
}

export function JobStatusPill({ status }: { status: BulkJobStatus }) {
  const { label, variant, className, icon: Icon, spin } = STATUS_CONFIG[status]
  return (
    <Badge variant={variant} size="md" className={cn("gap-1", className)}>
      <Icon className={cn(spin && "animate-spin")} />
      {label}
    </Badge>
  )
}

function ProgressBar({ value }: { value: number | null }) {
  const determinate = typeof value === "number" && Number.isFinite(value)
  const pct = determinate ? Math.min(100, Math.max(0, value)) : null

  return (
    <div
      className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct ?? undefined}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary",
          determinate ? "transition-[width] duration-500 ease-out" : "w-2/5 animate-pulse",
        )}
        style={determinate ? { width: `${pct}%` } : undefined}
      />
    </div>
  )
}

type Props = {
  status: BulkJobStatus
  progress: number | null
  title: string
  description: string
  /** Set when the job failed — replaces the progress view with a banner. */
  error?: string | null
  onRetry: () => void
}

export function ProgressStep({ status, progress, title, description, error, onRetry }: Props) {
  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-2xl items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3.5">
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div className="flex flex-1 flex-col items-start gap-2">
          <p className="text-sm text-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Upload a different file
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-10 text-center">
      <JobStatusPill status={status} />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-medium">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ProgressBar value={progress} />
    </div>
  )
}
