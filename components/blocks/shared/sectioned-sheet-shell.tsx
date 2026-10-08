"use client"

import type { LucideIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

export type SectionItem = {
  id: string
  label: string
  icon?: LucideIcon
  count?: string | number
}

export type SectionGroup = {
  /** Optional uppercase group heading shown above the items. */
  label?: string
  items: SectionItem[]
}

type SectionedSheetShellProps = {
  /** Ordered groups of sections. Pass a single group with no label for a flat list. */
  groups: SectionGroup[]
  activeId: string
  onActiveChange: (id: string) => void
  /**
   * Optional content above the section nav in the left column.
   * Used for the identity card on detail surfaces; omit for add/edit takeovers.
   */
  leading?: React.ReactNode
  /** Section content for the right column. Consumer renders the active section. */
  children: React.ReactNode
  className?: string
  /** Accessible label for the nav landmark. Defaults to "Sections". */
  navLabel?: string
}

/**
 * Two-column shell shared between sectioned takeovers (`<FullScreenEditDialog>`
 * for add/edit) and sectioned detail drawers (`<Sheet>` for read).
 *
 * Layout: 260px section nav on the left (collapses above content on small
 * screens), flexible scrollable column on the right. Optional `leading` slot
 * sits above the nav (used for the identity card on detail surfaces).
 */
export function SectionedSheetShell({
  groups,
  activeId,
  onActiveChange,
  leading,
  children,
  className,
  navLabel = "Sections",
}: SectionedSheetShellProps) {
  return (
    <div
      data-slot="sectioned-sheet-shell"
      className={cn("grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]", className)}
    >
      <aside aria-label={navLabel} className="flex min-w-0 flex-col gap-6">
        {leading}
        {groups.map((group, index) => (
          <SectionNavGroup
            key={group.label ?? `group-${index}`}
            group={group}
            activeId={activeId}
            onActiveChange={onActiveChange}
          />
        ))}
      </aside>
      <div className="flex min-w-0 flex-col gap-5">{children}</div>
    </div>
  )
}

function SectionNavGroup({
  group,
  activeId,
  onActiveChange,
}: {
  group: SectionGroup
  activeId: string
  onActiveChange: (id: string) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {group.label ? (
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {group.label}
        </span>
      ) : null}
      <ul className="flex flex-col gap-1">
        {group.items.map((item) => (
          <SectionNavItem
            key={item.id}
            item={item}
            active={item.id === activeId}
            onSelect={() => onActiveChange(item.id)}
          />
        ))}
      </ul>
    </div>
  )
}

function SectionNavItem({
  item,
  active,
  onSelect,
}: {
  item: SectionItem
  active: boolean
  onSelect: () => void
}) {
  const { id, label, icon: Icon, count } = item
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        data-section={id}
        data-active={active ? "true" : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
          active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted/50",
        )}
      >
        {Icon ? <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} /> : null}
        <span className="flex-1 truncate font-medium">{label}</span>
        {count !== undefined ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </button>
    </li>
  )
}
