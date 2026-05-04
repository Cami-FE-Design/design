"use client"

import { BellIcon, CirclePlusIcon, SearchIcon } from "lucide-react"
import type * as React from "react"
import { AdminProfileMenu } from "@/components/blocks/admin-profile-menu"
import { CamiMark } from "@/components/brand/cami-mark"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

type AdminTopbarProps = React.ComponentProps<"div"> & {
  brand?: React.ReactNode
  notificationCount?: number
}

const ROLE_LABELS: Record<string, string> = {
  hq_admin: "HQ Admin",
  hq_support: "HQ Support",
  hq_billing: "HQ Billing",
}

function initialOf(name?: string) {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

function splitName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/)
  return { firstName: first ?? "", lastName: rest.join(" ") }
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

function CamiHQBrand() {
  return (
    <div className="flex h-11 items-center gap-2 rounded-full bg-background px-3 text-sm font-medium text-foreground shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]">
      <CamiMark size={20} />
      Cami HQ
    </div>
  )
}

export function AdminTopbar({
  className,
  brand,
  notificationCount = 0,
  ...props
}: AdminTopbarProps) {
  const auth = useAuth()
  const { firstName, lastName } = splitName(auth.user.name)
  const initials = `${initialOf(firstName)}${initialOf(lastName)}`
  const accountLabel = auth.user.name || "Account"
  const notificationsAriaLabel =
    notificationCount > 0 ? `Notifications, ${notificationCount} unread` : "Notifications"
  const roleLabel = ROLE_LABELS[auth.roleCodes[0] ?? ""] ?? auth.roleCodes[0] ?? "Member"

  return (
    <div
      data-slot="admin-topbar"
      className={cn("flex h-[72px] w-full items-center justify-between pr-3", className)}
      {...props}
    >
      {brand ?? <CamiHQBrand />}
      <div className="flex items-center">
        <TopbarIconButton label="Quick add">
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
        <AdminProfileMenu
          user={{
            firstName,
            lastName,
            email: auth.user.email,
            avatarSrc: auth.user.avatarUrl,
          }}
          roleLabel={roleLabel}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`${accountLabel} account`}
              className="size-11 rounded-full"
            >
              <span className="flex size-8 items-center justify-center overflow-hidden rounded-full border-[1.21px] border-cami-violet-7 bg-cami-violet-8">
                {auth.user.avatarUrl ? (
                  // biome-ignore lint/performance/noImgElement: avatar URL may be cross-origin and is small
                  <img
                    src={auth.user.avatarUrl}
                    alt={accountLabel}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-medium text-white">{initials}</span>
                )}
              </span>
            </Button>
          }
        />
      </div>
    </div>
  )
}
