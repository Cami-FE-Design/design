import type * as React from "react"

import { cn } from "@/lib/utils"

type SectionCardProps = {
  title: string
  /** Optional right-aligned action — typically a `<Button variant="secondary" size="sm" radius="full">` for Edit / Add. */
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Section panel used inside detail surfaces (`<ClientDetailDialog>`,
 * `<PetDetailDialog>`, etc.). Title row at the top with an optional
 * right-aligned action; children render below.
 *
 * Visual treatment matches the existing `<BusinessDetailDialog>` inline
 * pattern, extracted here so all detail surfaces share one shape.
 */
export function SectionCard({ title, action, children, className }: SectionCardProps) {
  return (
    <section
      data-slot="section-card"
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <h3 className="font-heading text-base font-semibold text-foreground">{title}</h3>
        {action}
      </header>
      {children}
    </section>
  )
}
