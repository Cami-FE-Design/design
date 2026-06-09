"use client"

import type { ServiceCategory } from "@/lib/service-catalog/types"
import { cn } from "@/lib/utils"

type CategorySidebarProps = {
  categories: ServiceCategory[]
  selectedId: string | null
  counts: Record<string, number>
  totalCount: number
  onSelect: (id: string | null) => void
  onAddCategory: () => void
  onAddService: (categoryId: string) => void
  onDeleteCategory: (id: string) => void
}

export function CategorySidebar({
  categories,
  selectedId,
  counts,
  totalCount,
  onSelect,
  onAddCategory: _onAddCategory,
  onAddService: _onAddService,
  onDeleteCategory: _onDeleteCategory,
}: CategorySidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-3 md:sticky md:top-6 md:w-72 md:shrink-0 md:self-start">
      <ul className="flex flex-row gap-2 overflow-x-auto pb-2 no-scrollbar md:flex-col md:gap-1 md:overflow-visible md:pb-0">
        <CategoryItem
          label="All categories"
          count={totalCount}
          active={selectedId === null}
          onClick={() => onSelect(null)}
        />
        {categories.map((cat) => (
          <CategoryItem
            key={cat.id}
            label={cat.name}
            count={counts[cat.id] ?? 0}
            active={selectedId === cat.id}
            onClick={() => onSelect(selectedId === cat.id ? null : cat.id)}
          />
        ))}
      </ul>
    </aside>
  )
}

function CategoryItem({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex w-max shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors md:w-full",
          active ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-muted/50",
        )}
      >
        <span className="flex-1 truncate font-medium">{label}</span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      </button>
    </li>
  )
}
