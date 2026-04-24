"use client"

import { BellIcon, ChevronDownIcon, CirclePlusIcon, SearchIcon } from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type AppTopbarProps = React.ComponentProps<"div"> & {
  businessName?: string
  avatarSrc?: string
  firstName?: string
  lastName?: string
  notificationCount?: number
}

function initialOf(name?: string) {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

const iconButtonClass =
  "size-11 rounded-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"

type TopbarIconButtonProps = {
  label: string
  ariaLabel?: string
  children: React.ReactNode
}

function TopbarIconButton({ label, ariaLabel, children }: TopbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel ?? label}
          className={iconButtonClass}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppTopbar({
  className,
  businessName = "Business Name",
  avatarSrc,
  firstName = "Michelle",
  lastName = "You",
  notificationCount = 0,
  ...props
}: AppTopbarProps) {
  const notificationsAriaLabel =
    notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"
  const initials = `${initialOf(firstName)}${initialOf(lastName)}`
  const accountLabel = `${firstName} ${lastName}`.trim() || "Account"

  return (
    <div
      data-slot="app-topbar"
      className={cn("flex h-[72px] w-full items-center justify-between pr-3", className)}
      {...props}
    >
      <Button
        variant="secondary"
        className="h-11 gap-2 rounded-full border border-border bg-background px-4 text-sm font-normal text-foreground shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)] hover:bg-background/90"
      >
        {businessName}
        <ChevronDownIcon className="size-4" />
      </Button>
      <div className="flex items-center">
        <TopbarIconButton label="New">
          <CirclePlusIcon className="size-5" />
        </TopbarIconButton>
        <TopbarIconButton label="Search">
          <SearchIcon className="size-5" />
        </TopbarIconButton>
        <div className="relative size-11">
          <TopbarIconButton label="Notifications" ariaLabel={notificationsAriaLabel}>
            <BellIcon className="size-5" />
          </TopbarIconButton>
          {notificationCount > 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 flex min-h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1 py-0.5 text-xs font-medium leading-4 text-primary-foreground"
            >
              {notificationCount}
            </span>
          )}
        </div>
        <TopbarIconButton label={accountLabel} ariaLabel={`${accountLabel} account`}>
          <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-pink-8 bg-muted">
            {avatarSrc ? (
              <img src={avatarSrc} alt={accountLabel} className="size-full object-cover" />
            ) : (
              <span className="text-xs font-medium text-muted-foreground">{initials}</span>
            )}
          </span>
        </TopbarIconButton>
      </div>
    </div>
  )
}
