"use client"

import type * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ProfileMenuProps = {
  trigger: React.ReactNode
  user: {
    firstName: string
    lastName: string
    email: string
    avatarSrc?: string
  }
  onMyProfile?: () => void
  onAccountSettings?: () => void
  onHelp?: () => void
  onLanguage?: () => void
  onSignOut?: () => void
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

export function ProfileMenu({
  trigger,
  user,
  onMyProfile,
  onAccountSettings,
  onHelp,
  onLanguage,
  onSignOut,
}: ProfileMenuProps) {
  const initials = `${initialOf(user.firstName)}${initialOf(user.lastName)}`
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-60">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white">
            {user.avatarSrc ? (
              // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
              <img src={user.avatarSrc} alt={fullName} className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium leading-5">{fullName}</span>
            <span className="truncate text-xs font-normal leading-4 text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onMyProfile}>My profile</DropdownMenuItem>
          <DropdownMenuItem onSelect={onAccountSettings}>Account Settings</DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={onHelp}>Help & Support</DropdownMenuItem>
          <DropdownMenuItem onSelect={onLanguage}>Language</DropdownMenuItem>
          <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
