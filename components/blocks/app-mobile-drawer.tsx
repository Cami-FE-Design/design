"use client"

import { ChevronDownIcon, ChevronsLeftIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { bottomMenu, type MenuItem, topMenu } from "@/lib/app-menu"
import { cn } from "@/lib/utils"

const menuButtonClass =
  "relative h-11 w-full justify-start gap-3 rounded-xl pl-4 text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground"

const easeOutCubic = "cubic-bezier(0.33, 1, 0.68, 1)"

function TreeConnector({ isLast }: { isLast: boolean }) {
  if (isLast) {
    return (
      <svg
        width="22.5"
        height="36"
        viewBox="0 0 22.5 36"
        fill="none"
        aria-hidden
        className="shrink-0 text-border"
      >
        <title>Last submenu connector</title>
        <path d="M11.25 0 V10 Q11.25 18 18.25 18 H22.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  }
  return (
    <svg
      width="22.5"
      height="36"
      viewBox="0 0 22.5 36"
      fill="none"
      aria-hidden
      className="shrink-0 text-border"
    >
      <title>Submenu connector</title>
      <path d="M11.25 0 V36" stroke="currentColor" strokeWidth="1" />
      <path d="M11.25 18 H22.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ChildMenuItem({ label, isLast }: { label: string; isLast: boolean }) {
  return (
    <div className="flex h-9 items-center pl-6">
      <TreeConnector isLast={isLast} />
      <Button
        variant="ghost"
        className="h-full flex-1 justify-start rounded-xl px-4 text-sidebar-foreground"
      >
        <span className="truncate text-base font-medium leading-6">{label}</span>
      </Button>
    </div>
  )
}

type DrawerMenuItemProps = {
  item: MenuItem
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function DrawerMenuItem({ item, isOpen, onOpenChange }: DrawerMenuItemProps) {
  const Icon = item.icon
  const hasChildren = !!item.children?.length
  const notificationCount = item.notificationCount ?? 0
  const showBadge = item.hasUpdate || notificationCount > 0
  const expanded = hasChildren && isOpen

  return (
    <div className="flex w-full flex-col">
      <Button
        variant="ghost"
        className={menuButtonClass}
        aria-expanded={hasChildren ? isOpen : undefined}
        onClick={hasChildren ? () => onOpenChange(!isOpen) : undefined}
      >
        <Icon className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-base font-medium leading-6">
          {item.label}
        </span>
        {showBadge && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-primary px-1 py-0.5 text-xs font-medium leading-4 text-primary-foreground">
            {notificationCount > 0 ? notificationCount : null}
          </span>
        )}
        {hasChildren && (
          <ChevronDownIcon className={cn("size-5 shrink-0", expanded && "rotate-180")} />
        )}
      </Button>
      {hasChildren && (
        <div
          className="grid overflow-hidden"
          style={{
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: `grid-template-rows 300ms ${easeOutCubic}`,
          }}
        >
          <div className="min-h-0">
            {item.children?.map((child, i) => (
              <ChildMenuItem
                key={child.label}
                label={child.label}
                isLast={i === (item.children?.length ?? 0) - 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AppMobileDrawer() {
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null)

  const buildItemProps = (item: MenuItem) => ({
    isOpen: openMenuLabel === item.label,
    onOpenChange: (open: boolean) => {
      setOpenMenuLabel(open ? item.label : null)
    },
  })

  return (
    <div className="flex h-full flex-col px-2 py-3">
      <div className="flex justify-end">
        <SheetClose asChild>
          <Button
            variant="ghost"
            aria-label="Close menu"
            className="h-11 w-[52px] rounded-xl text-sidebar-foreground"
          >
            <ChevronsLeftIcon className="size-5" />
          </Button>
        </SheetClose>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label="Main">
        {topMenu.map((item) => (
          <DrawerMenuItem key={item.label} item={item} {...buildItemProps(item)} />
        ))}
      </nav>
      <nav className="flex flex-col gap-0.5" aria-label="Secondary">
        {bottomMenu.map((item) => (
          <DrawerMenuItem key={item.label} item={item} {...buildItemProps(item)} />
        ))}
      </nav>
    </div>
  )
}
