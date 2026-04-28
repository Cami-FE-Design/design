"use client"

import { CirclePlusIcon, CircleXIcon, EllipsisIcon, SettingsIcon, UsersIcon } from "lucide-react"
import type * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type Workspace = {
  id: string
  name: string
  imageSrc?: string
}

type WorkspaceSwitcherProps = {
  trigger: React.ReactNode
  currentWorkspace: Workspace & { joinedDate?: string }
  workspaces: Workspace[]
  selectedWorkspaceId: string
  user: { firstName: string; lastName: string; avatarSrc?: string }
  onSelectWorkspace?: (id: string) => void
  onNewMembers?: () => void
  onWorkspaceSettings?: () => void
  onAccountMenu?: () => void
  onNewWorkspace?: () => void
  onSignOut?: () => void
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

type ThumbProps = {
  src?: string
  size: "sm" | "lg"
  alt: string
}

export function WorkspaceThumb({ src, size, alt }: ThumbProps) {
  const sizeClass = size === "lg" ? "size-10 rounded-lg" : "size-5 rounded-sm"
  if (src) {
    return (
      <span aria-hidden className={cn("shrink-0 overflow-hidden bg-muted", sizeClass)}>
        {/* biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small */}
        <img src={src} alt={alt} className="size-full object-cover" />
      </span>
    )
  }
  return (
    <span
      aria-hidden
      className={cn("shrink-0 bg-gradient-to-br from-cami-pink-7 to-cami-pink-10", sizeClass)}
    />
  )
}

export function WorkspaceSwitcher({
  trigger,
  currentWorkspace,
  workspaces,
  selectedWorkspaceId,
  user,
  onSelectWorkspace,
  onNewMembers,
  onWorkspaceSettings,
  onAccountMenu,
  onNewWorkspace,
  onSignOut,
}: WorkspaceSwitcherProps) {
  const userInitials = `${initialOf(user.firstName)}${initialOf(user.lastName)}`
  const userLabel = `${user.firstName} ${user.lastName}`.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="w-60">
        <DropdownMenuGroup>
          <div className="flex items-center gap-3 px-2 py-2">
            <WorkspaceThumb src={currentWorkspace.imageSrc} size="lg" alt={currentWorkspace.name} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium leading-5">
                {currentWorkspace.name}
              </span>
              {currentWorkspace.joinedDate ? (
                <span className="truncate text-sm font-normal leading-5 text-muted-foreground">
                  Joined {currentWorkspace.joinedDate}
                </span>
              ) : null}
            </div>
          </div>
          <DropdownMenuItem onSelect={onNewMembers}>
            <UsersIcon />
            New members
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onWorkspaceSettings}>
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <div className="relative flex items-center gap-2.5 rounded-md py-2 pr-8 pl-3 text-sm font-medium text-muted-foreground">
            <span
              aria-hidden
              className="flex size-5 shrink-0 items-center justify-center rounded-full border-[0.75px] border-cami-violet-7 bg-cami-violet-8 text-[8px] font-medium text-white"
            >
              {userInitials}
            </span>
            <span className="min-w-0 flex-1 truncate">{userLabel}</span>
            <DropdownMenuItem
              onSelect={onAccountMenu}
              aria-label={`${userLabel} options`}
              className="absolute top-1/2 right-0.5 size-7 -translate-y-1/2 justify-center rounded-md p-0"
            >
              <EllipsisIcon className="size-4" />
            </DropdownMenuItem>
          </div>
          <DropdownMenuRadioGroup
            value={selectedWorkspaceId}
            onValueChange={(value) => onSelectWorkspace?.(value)}
          >
            {workspaces.map((ws) => (
              <DropdownMenuRadioItem key={ws.id} value={ws.id}>
                <WorkspaceThumb src={ws.imageSrc} size="sm" alt={ws.name} />
                <span className="min-w-0 flex-1 truncate">{ws.name}</span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          <DropdownMenuItem onSelect={onNewWorkspace}>
            <CirclePlusIcon />
            New workspace
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onSignOut}>
          <CircleXIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
