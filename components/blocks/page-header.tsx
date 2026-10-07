import type * as React from "react"

import { cn } from "@/lib/utils"

type PageHeaderProps = {
  title: React.ReactNode
  /** Sits beside the title, e.g. a count badge. */
  badge?: React.ReactNode
  /** One line under the title: a count, or what the page is for. */
  description?: React.ReactNode
  /** Buttons and menus on the right, in reading order. */
  actions?: React.ReactNode
  className?: string
}

/**
 * The title row of a listing page, passed to AppShell or AdminShell as
 * `header`. The actions sit in their own group so `justify-between` keeps them
 * together on the right instead of spreading them across the row.
 */
export function PageHeader({ title, badge, description, actions, className }: PageHeaderProps) {
  return (
    <div
      data-slot="page-header"
      className={cn("flex w-full max-w-6xl items-center justify-between gap-3", className)}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-medium leading-8 text-foreground">{title}</h1>
          {badge}
        </div>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
