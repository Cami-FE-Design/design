"use client"

import { BellIcon, ChevronDownIcon, CirclePlusIcon, MenuIcon, SearchIcon } from "lucide-react"
import type * as React from "react"
import { useState } from "react"
import { NotificationSheet } from "@/components/blocks/notification-sheet"
import { ProfileMenu } from "@/components/blocks/profile-menu"
import { QuickAddMenu } from "@/components/blocks/quick-add-menu"
import {
  type Workspace,
  WorkspaceSwitcher,
  WorkspaceThumb,
} from "@/components/blocks/workspace-switcher"
import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type AppMobileTopbarProps = React.ComponentProps<"div"> & {
  firstName?: string
  lastName?: string
  email?: string
  avatarSrc?: string
  notificationCount?: number
  workspaces?: Workspace[]
  defaultWorkspaceId?: string
  workspaceJoinedDate?: string
}

const defaultWorkspaces: Workspace[] = [
  { id: "jvc", name: "Shampooch JVC" },
  { id: "jumeirah", name: "Shampooch Jumeirah" },
]

function initialOf(name?: string) {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

const iconButtonClass = "size-11 rounded-full text-sidebar-foreground"

export function AppMobileTopbar({
  className,
  firstName = "Michelle",
  lastName = "You",
  email = "michelle.h.you@gmail.com",
  avatarSrc,
  notificationCount = 0,
  workspaces = defaultWorkspaces,
  defaultWorkspaceId = "jvc",
  workspaceJoinedDate = "Apr 14, 2025",
  ...props
}: AppMobileTopbarProps) {
  const [selectedId, setSelectedId] = useState(defaultWorkspaceId)
  const selected = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
  const accountLabel = `${firstName} ${lastName}`.trim() || "Account"
  const initials = `${initialOf(firstName)}${initialOf(lastName)}`
  const notificationsAriaLabel =
    notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"

  return (
    <div
      data-slot="app-mobile-topbar"
      className={cn("flex h-[72px] w-full items-center justify-between px-3", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-0.5 pr-2">
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="size-11 rounded-xl text-sidebar-foreground"
          >
            <MenuIcon className="size-5" />
          </Button>
        </SheetTrigger>
        <WorkspaceSwitcher
          trigger={
            <Button
              variant="secondary"
              className="h-10 min-w-0 flex-1 justify-between gap-2 rounded-xl bg-background pr-4 pl-3 text-sm font-medium text-foreground drop-shadow-[-22px_-44px_44px_rgba(221,221,221,0.87)] hover:bg-background/90"
            >
              <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
                <WorkspaceThumb
                  src={selected?.imageSrc}
                  size="sm"
                  alt={selected?.name ?? "Workspace"}
                />
                <span className="min-w-0 flex-1 truncate">{selected?.name ?? "Workspace"}</span>
              </span>
              <ChevronDownIcon className="size-4 shrink-0" />
            </Button>
          }
          currentWorkspace={{ ...selected, joinedDate: workspaceJoinedDate }}
          workspaces={workspaces}
          selectedWorkspaceId={selectedId}
          user={{ firstName, lastName, avatarSrc }}
          onSelectWorkspace={setSelectedId}
        />
      </div>
      <div className="flex items-center gap-0.5">
        <QuickAddMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Quick add" className={iconButtonClass}>
              <CirclePlusIcon className="size-5" />
            </Button>
          }
        />
        <Button variant="ghost" size="icon" aria-label="Search" className={iconButtonClass}>
          <SearchIcon className="size-5" />
        </Button>
        <NotificationSheet
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={notificationsAriaLabel}
              className={iconButtonClass}
            >
              <BellIcon className="size-5" />
            </Button>
          }
        />
        <ProfileMenu
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${accountLabel} account`}
              className="size-11 rounded-full"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8">
                {avatarSrc ? (
                  // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
                  <img src={avatarSrc} alt={accountLabel} className="size-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-white">{initials}</span>
                )}
              </span>
            </Button>
          }
          user={{ firstName, lastName, email, avatarSrc }}
        />
      </div>
    </div>
  )
}
