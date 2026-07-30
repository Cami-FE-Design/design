"use client"

import { BellIcon, ChevronDownIcon, CirclePlusIcon, SearchIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { appSettingsHref } from "@/components/blocks/app-settings-controller"
import { DemoBusinessRename } from "@/components/blocks/demo-business-rename"
import { GlobalSearchDialog } from "@/components/blocks/global-search-dialog"
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
import { useCurrentUser } from "@/lib/current-user"
import { useDemoBusiness } from "@/lib/demo-business"
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

function initialOf(name?: string) {
  if (!name) return ""
  return name.trim().charAt(0).toUpperCase()
}

const iconButtonClass = "size-11 rounded-full text-sidebar-foreground"

type TopbarIconButtonProps = {
  label: string
  ariaLabel?: string
  onClick?: () => void
  children: React.ReactNode
}

function TopbarIconButton({ label, ariaLabel, onClick, children }: TopbarIconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={ariaLabel ?? label}
          className={iconButtonClass}
          onClick={onClick}
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
  avatarSrc: avatarSrcProp,
  firstName: firstNameProp,
  lastName: lastNameProp,
  email: emailProp,
  notificationCount = 0,
  workspaces,
  defaultWorkspaceId = "jvc",
  workspaceJoinedDate = "Apr 14, 2025",
  ...props
}: AppTopbarProps) {
  const { name: businessName } = useDemoBusiness()
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  // Current-user store backs the avatar and profile menu; explicit props still
  // override for one-off demos.
  const { user: currentUser } = useCurrentUser()
  const avatarSrc = avatarSrcProp ?? currentUser.avatarSrc
  const firstName = firstNameProp ?? currentUser.firstName
  const lastName = lastNameProp ?? currentUser.lastName
  const email = emailProp ?? currentUser.email
  // Derive the workspace list from the demo business name so a rename in the
  // switcher rebrands the topbar (and its second location) live.
  const resolvedWorkspaces = workspaces ?? [
    { id: "jvc", name: businessName },
    { id: "jumeirah", name: `${businessName} · Jumeirah` },
  ]
  const [selectedId, setSelectedId] = useState(defaultWorkspaceId)
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd/Ctrl+K opens global search from anywhere in the shell.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
  const selected = resolvedWorkspaces.find((w) => w.id === selectedId) ?? resolvedWorkspaces[0]
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
        workspaces={resolvedWorkspaces}
        selectedWorkspaceId={selectedId}
        user={{ firstName, lastName, avatarSrc }}
        onSelectWorkspace={setSelectedId}
      />
      <div className="flex items-center">
        <DemoBusinessRename />
        <QuickAddMenu
          trigger={
            <Button variant="ghost" size="icon" aria-label="Quick add" className={iconButtonClass}>
              <CirclePlusIcon className="size-5" />
            </Button>
          }
        />
        <TopbarIconButton label="Search" onClick={() => setSearchOpen(true)}>
          <SearchIcon className="size-5" />
        </TopbarIconButton>
        <GlobalSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
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
          onMyProfile={() => router.push(appSettingsHref(pathname, "profile"), { scroll: false })}
          onAccountSettings={() =>
            router.push(appSettingsHref(pathname, "business-details"), { scroll: false })
          }
        />
      </div>
    </div>
  )
}
