"use client"

import type * as React from "react"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type AdminProfileMenuProps = {
  trigger: React.ReactNode
  user: {
    firstName: string
    lastName: string
    email: string
    avatarSrc?: string
  }
  /** Display label for the role badge — derived from `useAuth().roleCodes[0]`. */
  roleLabel: string
  onSettings?: () => void
  onSignOut?: () => void
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase()
}

export function AdminProfileMenu({
  trigger,
  user,
  roleLabel,
  onSettings,
  onSignOut,
}: AdminProfileMenuProps) {
  const initials = `${initialOf(user.firstName)}${initialOf(user.lastName)}`
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-64">
        <div className="flex items-start gap-3 px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8 text-xs font-medium text-white">
            {user.avatarSrc ? (
              // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
              <img src={user.avatarSrc} alt={fullName} className="size-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-medium leading-5">{fullName}</span>
            <span className="truncate text-xs font-normal leading-4 text-muted-foreground">
              {user.email}
            </span>
            <Badge variant="secondary" className="mt-1 self-start">
              {roleLabel}
            </Badge>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onSettings}>Settings</DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
