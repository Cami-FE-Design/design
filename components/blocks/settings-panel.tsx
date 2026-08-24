"use client"

// The frame every settings panel sits in.
//
// A settings panel is two things stacked: an identity block (breadcrumb, title,
// description) that says where you are, and a body that says what's there. Only
// the body may move. Scrolling the breadcrumb and title out of view takes away
// the one thing that tells the merchant which screen they're on — and inside a
// dialog, where there is no browser chrome to fall back on, that's the whole
// orientation. Same rule the app shell follows for its own page headers.
//
// So the panel owns the split, not its container: the header is `shrink-0`, the
// body is the scroll port. The settings dialog's content column supplies the
// horizontal padding and top offset and stops scrolling itself
// (app-settings-dialog.tsx) — otherwise there would be two nested scrollers and
// the outer one would drag the header along anyway.
//
// Outside the dialog (the playground demos), there is no bounded-height flex
// parent, so `flex-1` collapses to auto and the panel simply renders at its
// natural height — nothing to scroll, nothing clipped.

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function SettingsPanel({
  header,
  children,
  className,
  bodyClassName,
}: {
  /** Breadcrumb + title + description. Pinned; never scrolls. */
  header?: ReactNode
  children: ReactNode
  /** Extra classes for the frame (panel-level animation, etc.). */
  className?: string
  /** Extra classes for the scrolling body. */
  bodyClassName?: string
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      {header ? <div className="flex shrink-0 flex-col gap-4 pb-6">{header}</div> : null}
      <div className={cn("flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-9", bodyClassName)}>
        {children}
      </div>
    </div>
  )
}
