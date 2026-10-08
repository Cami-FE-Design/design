"use client"

// The dashed strip that carries a control no operator will ever see.
//
// This repo has to show states production decides for you — which mock file an
// import ran, whether the account has the pet feature on, the as-built screen
// next to the redesign. Those controls kept being dressed as product controls:
// "Mode: with pets" sat in the clients header next to Options, reading like a
// feature the operator picks, when in reality HQ sets it per account and the
// operator has no choice at all.
//
// One dashed, muted strip for all of them, always saying so in its first line.

import { FlaskConicalIcon } from "lucide-react"

export function DesignRepoBar({
  label,
  note,
  children,
}: {
  /** What this bar lets a reviewer do. Prefixed "Design repo only —". */
  label: string
  /** One line on what the current selection means. */
  note?: string
  /** The controls themselves, on their own row below the label. */
  children?: React.ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-col gap-2 rounded-xl border border-dashed border-border bg-muted/30 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConicalIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Design repo only — {label}
        </span>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}
