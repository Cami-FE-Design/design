"use client"

import { ChevronDownIcon, ChevronsRightIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { forwardRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { bottomMenu, type MenuItem, topMenu } from "@/lib/app-menu"
import { cn } from "@/lib/utils"

const menuButtonClass =
  "relative h-11 w-full justify-start rounded-xl pl-4 text-sidebar-foreground aria-expanded:bg-transparent aria-expanded:text-sidebar-foreground"

const easeOutCubic = "cubic-bezier(0.33, 1, 0.68, 1)"
const drawerDuration = "500ms"

const menuButtonTransition = `background-color 150ms ease, color 150ms ease, gap ${drawerDuration} ${easeOutCubic}, padding-right ${drawerDuration} ${easeOutCubic}`

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  item: MenuItem
  expanded: boolean
  isSubmenuOpen?: boolean
  onToggleSubmenu?: () => void
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  function SidebarMenuButton(
    { item, expanded, isSubmenuOpen = false, onToggleSubmenu, ...rest },
    ref,
  ) {
    const Icon = item.icon
    const hasChildren = !!item.children?.length
    const notificationCount = item.notificationCount ?? 0
    const showBadge = item.hasUpdate || notificationCount > 0

    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(menuButtonClass, expanded ? "gap-3" : "gap-0")}
        style={{
          transition: menuButtonTransition,
          paddingRight: expanded ? "60px" : "16px",
        }}
        aria-expanded={hasChildren && expanded ? isSubmenuOpen : undefined}
        aria-label={expanded ? undefined : item.label}
        onClick={hasChildren && expanded ? onToggleSubmenu : undefined}
        {...rest}
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
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 right-0 flex -translate-y-1/2 items-center",
            expanded ? "gap-1 pr-4" : "gap-0 pr-0",
          )}
          style={{
            transition: `padding ${drawerDuration} ${easeOutCubic}, gap ${drawerDuration} ${easeOutCubic}`,
          }}
          aria-hidden={!expanded}
        >
          {showBadge && (
            <span
              className={cn(
                "flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground transition-all",
                expanded ? "h-5 min-w-5 px-1 py-0.5" : "size-2 px-0 py-0",
              )}
              style={{
                transitionDuration: drawerDuration,
                transitionTimingFunction: easeOutCubic,
              }}
            >
              <span
                className="text-xs font-medium leading-4 transition-opacity duration-[250ms] ease-out"
                style={{ opacity: expanded ? 1 : 0 }}
              >
                {notificationCount > 0 ? notificationCount : null}
              </span>
            </span>
          )}
          {hasChildren && (
            <ChevronDownIcon
              className={cn("h-5 shrink-0", isSubmenuOpen && "rotate-180")}
              style={{
                opacity: expanded ? 1 : 0,
                width: expanded ? "1.25rem" : "0",
                transition: `opacity ${drawerDuration} ${easeOutCubic}, width ${drawerDuration} ${easeOutCubic}, transform 200ms ease-out`,
              }}
            />
          )}
        </span>
      </Button>
    )
  },
)

function TreeConnector({ isLast }: { isLast: boolean }) {
  if (isLast) {
    return (
      <svg
        width="22.5"
        height="36"
        viewBox="0 0 22.5 36"
        fill="none"
        aria-hidden
        className="shrink-0 text-border"
      >
        <title>Last submenu connector</title>
        <path d="M10 0 V10 Q10 18 17 18 H22.5" stroke="currentColor" strokeWidth="1" />
      </svg>
    )
  }
  return (
    <svg
      width="22.5"
      height="36"
      viewBox="0 0 22.5 36"
      fill="none"
      aria-hidden
      className="shrink-0 text-border"
    >
      <title>Submenu connector</title>
      <path d="M10 0 V36" stroke="currentColor" strokeWidth="1" />
      <path d="M10 18 H22.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function ChildMenuItem({ label, isLast }: { label: string; isLast: boolean }) {
  return (
    <div className="flex h-9 items-center pl-4">
      <TreeConnector isLast={isLast} />
      <Button
        variant="ghost"
        className="h-full flex-1 justify-start rounded-xl px-4 text-sidebar-foreground"
      >
        <span className="truncate text-base font-medium leading-6">{label}</span>
      </Button>
    </div>
  )
}

type SidebarItemProps = {
  item: MenuItem
  expanded: boolean
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function SidebarItem({ item, expanded, isOpen, onOpenChange }: SidebarItemProps) {
  const hasChildren = !!item.children?.length

  if (!expanded && hasChildren) {
    return (
      <HoverCard open={isOpen} onOpenChange={onOpenChange}>
        <HoverCardTrigger asChild>
          <SidebarMenuButton item={item} expanded={false} />
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          align="start"
          sideOffset={8}
          alignOffset={-4}
          className="w-60 rounded-xl p-0"
        >
          <div className="flex flex-col p-2">
            {item.children?.map((child) => (
              <Button
                key={child.label}
                variant="ghost"
                className="h-9 justify-start rounded-xl px-3 text-sm leading-5 font-medium"
              >
                {child.label}
              </Button>
            ))}
          </div>
        </HoverCardContent>
      </HoverCard>
    )
  }

  if (!expanded) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarMenuButton item={item} expanded={false} />
        </TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  const effectivelyOpen = hasChildren && isOpen

  return (
    <div className="flex w-full flex-col">
      <SidebarMenuButton
        item={item}
        expanded
        isSubmenuOpen={effectivelyOpen}
        onToggleSubmenu={hasChildren ? () => onOpenChange(!isOpen) : undefined}
      />
      <div
        className="grid overflow-hidden transition-[grid-template-rows] duration-[600ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          gridTemplateRows: effectivelyOpen ? "1fr" : "0fr",
        }}
      >
        <div className="min-h-0">
          {hasChildren &&
            item.children?.map((child, index) => (
              <ChildMenuItem
                key={child.label}
                label={child.label}
                isLast={index === (item.children?.length ?? 0) - 1}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

type AppSidebarProps = React.ComponentProps<"aside"> & {
  defaultExpanded?: boolean
}

export function AppSidebar({ className, defaultExpanded = false, ...props }: AppSidebarProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset open menu whenever expanded toggles
  useEffect(() => {
    setOpenMenuLabel(null)
  }, [expanded])

  const buildItemProps = (item: MenuItem) => ({
    isOpen: openMenuLabel === item.label,
    onOpenChange: (open: boolean) => {
      setOpenMenuLabel(open ? item.label : null)
    },
  })

  return (
    <aside
      data-slot="app-sidebar"
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
        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main">
          {topMenu.map((item) => (
            <SidebarItem
              key={item.label}
              item={item}
              expanded={expanded}
              {...buildItemProps(item)}
            />
          ))}
        </nav>
      </div>
      <nav className="flex flex-col gap-0.5" aria-label="Secondary">
        {bottomMenu.map((item) =>
          item.label === "Settings" ? (
            <SidebarSettingsItem key={item.label} item={item} expanded={expanded} />
          ) : (
            <SidebarItem
              key={item.label}
              item={item}
              expanded={expanded}
              {...buildItemProps(item)}
            />
          ),
        )}
      </nav>
    </aside>
  )
}

function SidebarSettingsItem({ item, expanded }: { item: MenuItem; expanded: boolean }) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const Icon = item.icon

  function openSettings() {
    const search = typeof window !== "undefined" ? window.location.search : ""
    const next = new URLSearchParams(search)
    next.set("settings", "profile")
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
