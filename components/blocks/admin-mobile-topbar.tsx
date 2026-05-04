"use client"

import { MenuIcon } from "lucide-react"
import type * as React from "react"
import { AdminProfileMenu } from "@/components/blocks/admin-profile-menu"
import { CamiMark } from "@/components/brand/cami-mark"
import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

type AdminMobileTopbarProps = React.ComponentProps<"div">

const ROLE_LABELS: Record<string, string> = {
  hq_admin: "HQ Admin",
  hq_support: "HQ Support",
  hq_billing: "HQ Billing",
}

function initialOf(name: string) {
  return name.trim().charAt(0).toUpperCase() || ""
}

function splitName(full: string) {
  const [first, ...rest] = full.trim().split(/\s+/)
  return { firstName: first ?? "", lastName: rest.join(" ") }
}

export function AdminMobileTopbar({ className, ...props }: AdminMobileTopbarProps) {
  const auth = useAuth()
  const { firstName, lastName } = splitName(auth.user.name)
  const initials = `${initialOf(firstName)}${initialOf(lastName)}`
  const accountLabel = auth.user.name || "Account"
  const roleLabel = ROLE_LABELS[auth.roleCodes[0] ?? ""] ?? auth.roleCodes[0] ?? "Member"

  return (
    <div
      data-slot="admin-mobile-topbar"
      className={cn("flex h-[72px] w-full items-center justify-between px-3", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
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
        <div className="flex h-10 items-center gap-2 rounded-full bg-background px-3 text-sm font-medium text-foreground">
          <CamiMark size={20} />
          Cami HQ
        </div>
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
            className="size-11 shrink-0 rounded-full"
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
  )
}
