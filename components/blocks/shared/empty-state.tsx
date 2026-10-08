import type { LucideIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  /** Icon shown above the title. Lucide stroke icon, rendered light. */
  icon: LucideIcon
  /** Short message — typically the only required text. */
  title: string
  /** Optional supporting copy below the title. */
  description?: string
  /** Optional action — typically a primary button. */
  action?: React.ReactNode
  className?: string
  /**
   * Visual treatment:
   * - "plain" (default): borderless, muted icon — for inline section empties.
   * - "card": the same light line-icon and muted title as "plain", inside a
   *   dashed self-framed card. This is the full-page listing treatment used
   *   across the sales, clients, pets, products, and appointments tables when
   *   a search/filter returns nothing (or the list is genuinely empty).
   */
  variant?: "plain" | "card"
}

/**
 * Centered empty state for "no items yet" / "no results match" patterns.
 * Use inside any section content (notes, files, pets, appointments, etc.)
 * when there's no data to render.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "plain",
}: EmptyStateProps) {
  if (variant === "card") {
    return (
      <div
        data-slot="empty-state"
        className={cn(
          "flex min-h-105 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center",
          className,
        )}
      >
        <Icon className="size-10 stroke-[1.25] text-muted-foreground/50" aria-hidden="true" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">{title}</p>
        {description ? (
          <p className="mt-1 max-w-xs text-balance text-sm text-muted-foreground/70">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    )
  }

  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      <Icon className="size-10 stroke-[1.25] text-muted-foreground/50" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description ? (
          <p className="max-w-xs text-balance text-sm text-muted-foreground/70">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
