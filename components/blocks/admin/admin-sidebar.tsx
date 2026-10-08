"use client"

import { ChevronDownIcon, ChevronsRightIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type AdminMenuItem, adminBottomMenu, adminTopMenu } from "@/lib/admin-menu"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

const easeOutCubic = "cubic-bezier(0.33, 1, 0.68, 1)"
const drawerDuration = "500ms"

const menuButtonClass =
  "relative h-11 w-full justify-start rounded-xl pl-4 text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground"

function useAllowedItems(items: AdminMenuItem[]): AdminMenuItem[] {
  const auth = useAuth()
  return useMemo(() => {
    function filter(list: AdminMenuItem[]): AdminMenuItem[] {
      return list
        .map((item) => {
          if (item.children) {
            const allowedChildren = filter(item.children)
            if (allowedChildren.length === 0) return null
            return { ...item, children: allowedChildren }
          }
          if (item.permission && !auth.permissions.has(item.permission)) return null
          return item
        })
        .filter((x): x is AdminMenuItem => x !== null)
    }
    return filter(items)
  }, [items, auth.permissions])
}

type SidebarLeafButtonProps = {
  item: AdminMenuItem
  expanded: boolean
  active?: boolean
  size?: "default" | "child"
}

function SidebarLeafButton({ item, expanded, active, size = "default" }: SidebarLeafButtonProps) {
  const Icon = item.icon
  const button = (
    <Button
      asChild
      variant="ghost"
      className={cn(
        menuButtonClass,
        size === "child" && "h-9 pl-11 text-sm",
        expanded ? "gap-3" : "gap-0",
        active && "bg-sidebar-accent text-foreground hover:bg-sidebar-accent",
      )}
      style={{
        transition: `gap ${drawerDuration} ${easeOutCubic}`,
      }}
      aria-current={active ? "page" : undefined}
      aria-label={expanded ? undefined : item.label}
    >
      <a href={item.href ?? "#"}>
        <Icon className={cn("shrink-0", size === "child" ? "size-4" : "size-5")} />
        <span
          className={cn(
            "min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left font-medium leading-6",
            size === "child" ? "text-sm" : "text-base",
          )}
          style={{
            maxWidth: expanded ? "12rem" : "0",
            opacity: expanded ? 1 : 0,
            transition: `max-width ${drawerDuration} ${easeOutCubic}, opacity ${drawerDuration} ${easeOutCubic}`,
          }}
        >
          {item.label}
        </span>
      </a>
    </Button>
  )

  if (expanded) return button

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

type SidebarGroupProps = {
  item: AdminMenuItem
  expanded: boolean
  pathname: string
  defaultOpen?: boolean
}

function SidebarGroup({ item, expanded, pathname, defaultOpen }: SidebarGroupProps) {
  const Icon = item.icon
  const containsActive = (item.children ?? []).some(
    (child) => child.href && pathname.startsWith(child.href),
  )
  const [open, setOpen] = useState(defaultOpen ?? containsActive)

  useEffect(() => {
    if (containsActive) setOpen(true)
  }, [containsActive])

  if (!expanded) {
    return (
      <HoverCard openDelay={80} closeDelay={120}>
        <HoverCardTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              menuButtonClass,
              "gap-0",
              containsActive && "bg-sidebar-accent text-foreground",
            )}
            aria-label={item.label}
          >
            <Icon className="size-5 shrink-0" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent side="right" align="start" sideOffset={12} className="w-56 p-1.5">
          <div className="px-3 pt-2 pb-1.5 text-xs text-muted-foreground">{item.label}</div>
          {item.children?.map((child) => (
            <Button
              key={child.label}
              asChild
              variant="ghost"
              className="h-9 w-full justify-start gap-2.5 rounded-xl px-3 text-sm font-medium"
            >
              <a href={child.href ?? "#"}>
                <child.icon className="size-4" />
                {child.label}
              </a>
            </Button>
          ))}
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <div>
      <Button
        variant="ghost"
        className={cn(menuButtonClass, "gap-3")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 text-left text-base font-medium leading-6">
          {item.label}
        </span>
        <ChevronDownIcon
          className={cn("size-4 transition-transform duration-200 ease-out", open && "rotate-180")}
        />
      </Button>
      <div
        className="overflow-hidden"
        style={{
          maxHeight: open ? `${(item.children?.length ?? 0) * 40 + 8}px` : "0px",
          transition: `max-height ${drawerDuration} ${easeOutCubic}`,
        }}
      >
        <div className="flex flex-col gap-0.5 pt-1">
          {item.children?.map((child) => (
            <SidebarLeafButton
              key={child.label}
              item={child}
              expanded={expanded}
              active={!!child.href && pathname.startsWith(child.href)}
              size="child"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

type AdminSidebarProps = React.ComponentProps<"aside"> & {
  defaultExpanded?: boolean
}

function isItemActive(item: AdminMenuItem, pathname: string) {
  if (!item.href) return false
  if (item.href === "/admin") return pathname === "/admin"
  return pathname.startsWith(item.href)
}

export function AdminSidebar({ className, defaultExpanded = false, ...props }: AdminSidebarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const pathname = usePathname() ?? ""

  const topItems = useAllowedItems(adminTopMenu)
  const bottomItems = useAllowedItems(adminBottomMenu)

  return (
    <aside
      data-slot="admin-sidebar"
      data-expanded={expanded}
      className={cn(
        "z-[2] flex h-full flex-col justify-between px-2 py-3 text-sidebar-foreground",
        expanded ? "w-[248px]" : "w-[68px]",
        className,
      )}
      style={{ transition: `width ${drawerDuration} ${easeOutCubic}` }}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex justify-end">
          <Tooltip delayDuration={1500}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                aria-label={expanded ? "Close sidebar" : "Open sidebar"}
                aria-expanded={expanded}
                className="h-11 w-[52px] rounded-xl text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground"
                onClick={() => setExpanded((v) => !v)}
              >
                <ChevronsRightIcon
                  className={cn(
                    "size-5 transition-transform duration-200 ease-out",
                    expanded && "rotate-180",
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {expanded ? "Close sidebar" : "Open sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Admin">
          {topItems.map((item) =>
            item.children ? (
              <SidebarGroup key={item.label} item={item} expanded={expanded} pathname={pathname} />
            ) : (
              <SidebarLeafButton
                key={item.label}
                item={item}
                expanded={expanded}
                active={isItemActive(item, pathname)}
              />
            ),
          )}
        </nav>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Secondary">
        {bottomItems.map((item) => {
          if (item.label === "Settings") {
            return <SidebarSettingsItem key={item.label} item={item} expanded={expanded} />
          }
          if (item.children) {
            return (
              <SidebarGroup key={item.label} item={item} expanded={expanded} pathname={pathname} />
            )
          }
          return (
            <SidebarLeafButton
              key={item.label}
              item={item}
              expanded={expanded}
              active={isItemActive(item, pathname)}
            />
          )
        })}
      </nav>
    </aside>
  )
}

type SidebarSettingsItemProps = {
  item: AdminMenuItem
  expanded: boolean
}

function SidebarSettingsItem({ item, expanded }: SidebarSettingsItemProps) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const Icon = item.icon

  function openSettings() {
    const search = typeof window !== "undefined" ? window.location.search : ""
    const next = new URLSearchParams(search)
    next.set("settings", "roles")
    router.push(`${pathname}?${next.toString()}`)
  }

  const button = (
    <Button
      variant="ghost"
      type="button"
      onClick={openSettings}
      className={cn(menuButtonClass, expanded ? "gap-3" : "gap-0")}
      style={{ transition: `gap ${drawerDuration} ${easeOutCubic}` }}
      aria-label={expanded ? undefined : item.label}
    >
      <Icon className="size-5 shrink-0" />
      <span
        className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left text-base font-medium leading-6"
        style={{
          maxWidth: expanded ? "12rem" : "0",
          opacity: expanded ? 1 : 0,
          transition: `max-width ${drawerDuration} ${easeOutCubic}, opacity ${drawerDuration} ${easeOutCubic}`,
        }}
      >
        {item.label}
      </span>
    </Button>
  )
  if (expanded) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}
