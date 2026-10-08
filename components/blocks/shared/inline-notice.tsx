import { InfoIcon, type LucideIcon, TriangleAlertIcon } from "lucide-react"
import type * as React from "react"

import { cn } from "@/lib/utils"

type InlineNoticeProps = {
  /**
   * - "warning": something the reader should act on or check (yellow).
   * - "info": a neutral fact about what will happen (sage).
   * - "muted": a quiet aside (grey).
   */
  tone?: "warning" | "info" | "muted"
  /** "md" for panels and dialogs; "sm" for a footnote under a card or row. */
  size?: "md" | "sm"
  /** Defaults to a triangle for warnings and an info circle otherwise. */
  icon?: LucideIcon
  /** Overrides the tone's tint and text colour, e.g. for a status-coloured notice. */
  className?: string
  iconClassName?: string
  children: React.ReactNode
}

const TONE: Record<"md" | "sm", Record<NonNullable<InlineNoticeProps["tone"]>, string>> = {
  md: {
    warning: "bg-cami-yellow-2 text-cami-yellow-12",
    info: "bg-cami-sage-2 text-cami-sage-12",
    muted: "bg-muted/50 text-muted-foreground",
  },
  // The footnote size sits on white cards, where step-2 disappears.
  sm: {
    warning: "bg-cami-yellow-3 text-cami-yellow-11",
    info: "bg-cami-sage-3 text-cami-sage-11",
    muted: "bg-muted/50 text-muted-foreground",
  },
}

/**
 * A tinted box with an icon and one short message. No accent border: the
 * left-bar style is not part of Cami's system. For anything with a title,
 * buttons or several lines of structure, build the block in place instead.
 */
export function InlineNotice({
  tone = "info",
  size = "md",
  icon,
  className,
  iconClassName,
  children,
}: InlineNoticeProps) {
  const Icon = icon ?? (tone === "warning" ? TriangleAlertIcon : InfoIcon)
  return (
    <div
      data-slot="inline-notice"
      className={cn(
        "flex items-start gap-2 rounded-xl",
        size === "md" ? "p-3 text-sm leading-5" : "px-3 py-2.5 text-xs leading-4",
        TONE[size][tone],
        className,
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          size === "md" ? "mt-0.5 size-4" : "mt-px size-3.5",
          iconClassName,
        )}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  )
}
