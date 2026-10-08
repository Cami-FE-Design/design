"use client"

import { ChevronLeftIcon, type LucideIcon, XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import type * as React from "react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// The settings dialog both products open: a grouped category rail on the left,
// the chosen panel on the right, and on narrow screens one of the two at a
// time with a back arrow between them. The business app and Cami HQ pass their
// own categories and panels; the frame is written once here.

export type SettingsCategory = {
  id: string
  label: string
  /** Subtitle shown under the right-pane title, where the dialog draws one. */
  description?: string
  /** Icon shown in the left rail. */
  icon?: LucideIcon
  /** Marks the screen as not yet ready for handoff. Adds a visible WIP badge. */
  wip?: boolean
}

export type SettingsGroup = {
  label: string
  items: SettingsCategory[]
}

export function SettingsDialogFrame({
  open,
  onOpenChange,
  groups,
  defaultCategoryId,
  ariaDescription,
  itemOverride,
  isUnpadded,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: SettingsGroup[]
  defaultCategoryId: string
  ariaDescription: string
  /** Replace an item's icon and label in the rail (Cami HQ's own-profile row). */
  itemOverride?: (item: SettingsCategory) => { leading: React.ReactNode; label: string } | null
  /** A panel that brings its own padding, e.g. one with a full-bleed header rule. */
  isUnpadded?: (category: SettingsCategory) => boolean
  /** The panel for the chosen category. */
  children: (active: SettingsCategory) => React.ReactNode
}) {
  const all = groups.flatMap((g) => g.items)
  const [activeId, setActiveId] = useState(defaultCategoryId)
  const [mobileView, setMobileView] = useState<"rail" | "content">("rail")
  const active = all.find((c) => c.id === activeId) ?? all[0]

  useEffect(() => {
    if (open) setMobileView("rail")
  }, [open])

  useEffect(() => {
    if (open) setActiveId(defaultCategoryId)
  }, [open, defaultCategoryId])

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "h-[680px] max-h-[calc(100dvh-3rem)] w-[1080px] max-w-[calc(100vw-3rem)] flex-row gap-0 p-0",
          "sm:max-w-[calc(100vw-3rem)]",
          "max-lg:h-[calc(100dvh-3rem)]",
        )}
      >
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">{ariaDescription}</DialogDescription>

        <aside
          className={cn(
            "shrink-0 flex-col gap-5 overflow-y-auto bg-muted/30 px-3 py-5",
            "w-full lg:w-[260px] lg:border-r lg:border-border/40",
            mobileView === "rail" ? "flex" : "hidden lg:flex",
          )}
        >
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-2 text-xs font-medium text-muted-foreground">{group.label}</p>
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const override = itemOverride?.(item)
                  const Icon = item.icon
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(item.id)
                          setMobileView("content")
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm font-medium text-foreground transition-colors hover:bg-foreground/5",
                          item.id === activeId && "bg-foreground/10",
                        )}
                      >
                        {override ? (
                          override.leading
                        ) : Icon ? (
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                        ) : null}
                        <span className="truncate">{override ? override.label : item.label}</span>
                        {item.wip ? (
                          <Badge variant="secondary" className="ml-auto font-normal">
                            WIP
                          </Badge>
                        ) : null}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </aside>

        <div
          className={cn(
            "relative min-w-0 flex-1 flex-col overflow-hidden",
            mobileView === "content" ? "flex" : "hidden lg:flex",
          )}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Back to settings menu"
            onClick={() => setMobileView("rail")}
            className="absolute left-3 top-3 z-10 rounded-full text-muted-foreground lg:hidden"
          >
            <ChevronLeftIcon className="size-5" />
          </Button>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close settings"
              className="absolute right-4 top-4 z-10 rounded-full text-muted-foreground"
            >
              <XIcon className="size-5" strokeWidth={2} />
            </Button>
          </DialogClose>

          {/* Padding and top offset live here; the scrolling belongs to the
              panel, which pins its own header (settings-panel.tsx). */}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              !isUnpadded?.(active) && "px-6 pt-9 max-lg:pt-14 lg:px-10",
            )}
          >
            {children(active)}
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}
