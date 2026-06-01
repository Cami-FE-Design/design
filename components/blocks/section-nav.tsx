"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type SectionItem<TId extends string> = {
  id: TId
  label: string
  /** Optional leading icon. When omitted, the label sits flush-left. */
  icon?: LucideIcon
  /** Optional short tag rendered after the label (e.g. "WIP", "Beta"). */
  badge?: string
}

type SectionNavProps<TId extends string> = {
  sections: SectionItem<TId>[]
  active: TId
  onChange: (id: TId) => void
  ariaLabel?: string
}

export function SectionNav<TId extends string>({
  sections,
  active,
  onChange,
  ariaLabel = "Sections",
}: SectionNavProps<TId>) {
  return (
    <aside aria-label={ariaLabel} className="flex min-w-0 flex-col">
      <ul className="flex flex-col gap-1">
        {sections.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onChange(item.id)}
                aria-current={active === item.id ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition-colors",
                  active === item.id
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground hover:bg-muted/50",
                )}
              >
                {Icon ? (
                  <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                ) : null}
                <span className="flex-1 truncate font-medium">{item.label}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-cami-yellow-3 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cami-yellow-11">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
