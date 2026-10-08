import type * as React from "react"
import { cn } from "@/lib/utils"

type TableToolbarProps = {
  /** Left side of the toolbar — typically a `<TabsList>`. */
  tabs?: React.ReactNode
  /** Right side of the toolbar — search input + action buttons. */
  actions?: React.ReactNode
  className?: string
}

/**
 * Above-table toolbar with tabs on the left and search/CTAs on the right.
 *
 * Designed to live inside `<Tabs>` (so `tabs` can be a `<TabsList>`) but works
 * on its own too. For the search input, pair with `<SearchInput>` from
 * `@/components/ui/search-input`.
 */
export function TableToolbar({ tabs, actions, className }: TableToolbarProps) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn(
        "flex items-center gap-3",
        // With tabs: tabs left, actions right. Without tabs: actions sit on the left.
        tabs ? "justify-between" : "justify-start",
        className,
      )}
    >
      {tabs ? <div className="flex items-center">{tabs}</div> : null}
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
