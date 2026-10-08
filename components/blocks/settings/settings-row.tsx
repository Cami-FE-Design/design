"use client"

import { PlusIcon } from "lucide-react"
import type { ComponentType } from "react"

type IconComponent = ComponentType<{ className?: string }>

type SettingsRowProps = {
  icon: IconComponent
  label: string
  /** When null, the row collapses into a subtle "Add {label}" pill. */
  value: string | null
  onAdd?: () => void
  /** Override the empty-state text. Defaults to `Add {label}`. */
  addLabel?: string
}

/**
 * Settings summary row — icon container + label/value stack. When `value` is
 * null, the row collapses into a subtle "Add {label}" pill that triggers
 * `onAdd`. Used inside summary cards to show the at-a-glance state of a
 * setting before the user enters edit mode.
 */
export function SettingsRow({ icon: Icon, label, value, onAdd, addLabel }: SettingsRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      {value ? (
        <div className="flex min-w-0 flex-col">
          <span className="text-sm leading-5 text-muted-foreground">{label}</span>
          <span className="truncate text-sm font-medium leading-5 text-foreground">{value}</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={onAdd}
          className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl bg-muted/40 px-3 text-left text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <PlusIcon className="size-4 shrink-0" />
          <span className="truncate text-sm leading-5">{addLabel ?? `Add ${label}`}</span>
        </button>
      )}
    </div>
  )
}
