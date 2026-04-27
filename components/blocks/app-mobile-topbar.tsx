"use client"

import { BellIcon, CirclePlusIcon, SearchIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AppMobileTopbarProps = React.ComponentProps<"div"> & {
  firstName?: string
  lastName?: string
  avatarSrc?: string
  notificationCount?: number
}

function initialOf(name?: string) {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

const iconButtonClass = "size-11 rounded-full text-sidebar-foreground"

export function AppMobileTopbar({
  className,
  firstName = "Michelle",
  lastName = "You",
  avatarSrc,
  notificationCount = 0,
  ...props
}: AppMobileTopbarProps) {
  const accountLabel = `${firstName} ${lastName}`.trim() || "Account"
  const initials = `${initialOf(firstName)}${initialOf(lastName)}`
  const notificationsAriaLabel =
    notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"

  return (
    <div
      data-slot="app-mobile-topbar"
      className={cn("flex w-full items-center justify-between px-2 py-2", className)}
      {...props}
    >
      <Button variant="ghost" size="icon" aria-label="New" className={iconButtonClass}>
        <CirclePlusIcon className="size-8" />
      </Button>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Search" className={iconButtonClass}>
          <SearchIcon className="size-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={notificationsAriaLabel}
          className={iconButtonClass}
        >
          <BellIcon className="size-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${accountLabel} account`}
          className="size-11 rounded-full"
        >
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-pink-8 bg-pink-9">
            {avatarSrc ? (
              // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
              <img src={avatarSrc} alt={accountLabel} className="size-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-white">{initials}</span>
            )}
          </span>
        </Button>
      </div>
    </div>
  )
}
