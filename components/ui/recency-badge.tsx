import type * as React from "react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Recency indicator for client / pet rows and identity headers.
 *
 * Common labels: `New` (≤14d since first visit), `4 weeks` / `2 days` /
 * etc. (relative time since last visit), `Lapsed` (>90d since last visit).
 *
 * Visual is a single dark-sand pill regardless of label — the tone
 * intentionally doesn't change with semantics; the label carries the
 * meaning. Caller computes the label from data; thresholds are tunable
 * per partner so they don't live inside the component.
 */
type RecencyBadgeProps = {
  className?: string
  children: React.ReactNode
}

export function RecencyBadge({ className, children }: RecencyBadgeProps) {
  return (
    <Badge variant="secondary" className={cn("bg-sand-7 text-sand-12", className)}>
      {children}
    </Badge>
  )
}
