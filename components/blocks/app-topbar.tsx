"use client"

import { BellIcon, ChevronDownIcon, CirclePlusIcon, SearchIcon } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type AppTopbarProps = React.ComponentProps<"div"> & {
  avatarSrc?: string
  firstName?: string
  lastName?: string
  email?: string
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
  avatarSrc,
  firstName = "Michelle",
  lastName = "You",
  email = "michelle.h.you@gmail.com",
  notificationCount = 0,
  workspaces = defaultWorkspaces,
  defaultWorkspaceId = "jvc",
  workspaceJoinedDate = "Apr 14, 2025",
  ...props
}: AppTopbarProps) {
  const [selectedId, setSelectedId] = useState(defaultWorkspaceId)
  const selected = workspaces.find((w) => w.id === selectedId) ?? workspaces[0]
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
      <WorkspaceSwitcher
        trigger={
          <Button
            variant="secondary"
            className="h-11 w-[240px] min-w-0 justify-start gap-2 bg-background px-3 text-sm font-medium text-foreground shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)] hover:bg-background/90"
          >
            <WorkspaceThumb
              src={selected?.imageSrc}
              size="sm"
              alt={selected?.name ?? "Workspace"}
            />
            <span className="min-w-0 flex-1 truncate text-left">
              {selected?.name ?? "Workspace"}
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
      <div className="flex items-center">
        <QuickAddMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Quick add" className={iconButtonClass}>
              <CirclePlusIcon className="size-5" />
            </Button>
          }
        />
        <TopbarIconButton label="Search">
          <SearchIcon className="size-5" />
        </TopbarIconButton>
        <div className="relative size-11">
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
          {notificationCount > 0 && (
            <span
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 flex min-h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1 py-0.5 text-xs font-medium leading-4 text-primary-foreground"
            >
              {notificationCount}
            </span>
          )}
        </div>
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
