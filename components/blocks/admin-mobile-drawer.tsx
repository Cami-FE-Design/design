"use client"

import { ChevronsLeftIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useMemo } from "react"
import { CamiMark } from "@/components/brand/cami-mark"
import { Button } from "@/components/ui/button"
import { SheetClose } from "@/components/ui/sheet"
import { type AdminMenuItem, adminBottomMenu, adminTopMenu } from "@/lib/admin-menu"
import { useAuth } from "@/lib/auth-mock"
import { cn } from "@/lib/utils"

const menuButtonClass =
  "relative h-11 w-full justify-start gap-3 rounded-xl pl-4 text-sidebar-foreground"

function useAllowedItems(items: AdminMenuItem[]): AdminMenuItem[] {
  const auth = useAuth()
  return useMemo(() => {
    return items
      .map((item) => {
        if (item.children) {
          const allowedChildren = item.children.filter(
            (child) => !child.permission || auth.permissions.has(child.permission),
          )
          if (allowedChildren.length === 0) return null
          return { ...item, children: allowedChildren }
        }
        if (item.permission && !auth.permissions.has(item.permission)) return null
        return item
      })
      .filter((x): x is AdminMenuItem => x !== null)
  }, [items, auth.permissions])
}

type DrawerLeafProps = {
  item: AdminMenuItem
  active?: boolean
}

function DrawerLeaf({ item, active }: DrawerLeafProps) {
  const Icon = item.icon
  return (
    <SheetClose asChild>
      <Button
        asChild
        variant="ghost"
        className={cn(
          menuButtonClass,
          active && "bg-sidebar-accent text-foreground hover:bg-sidebar-accent",
        )}
        aria-current={active ? "page" : undefined}
      >
        <a href={item.href ?? "#"}>
          <Icon className="size-5 shrink-0" />
          <span className="min-w-0 flex-1 truncate text-left text-base font-medium leading-6">
            {item.label}
          </span>
        </a>
      </Button>
    </SheetClose>
  )
}

function DrawerSettingsItem({ item }: { item: AdminMenuItem }) {
  const router = useRouter()
  const pathname = usePathname() ?? "/"
  const Icon = item.icon

  function openSettings() {
    const search = typeof window !== "undefined" ? window.location.search : ""
    const next = new URLSearchParams(search)
    next.set("settings", "roles")
    router.push(`${pathname}?${next.toString()}`)
  }

  return (
    <SheetClose asChild>
      <Button variant="ghost" type="button" onClick={openSettings} className={menuButtonClass}>
        <Icon className="size-5 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-left text-base font-medium leading-6">
          {item.label}
        </span>
      </Button>
    </SheetClose>
  )
}

function isItemActive(item: AdminMenuItem, pathname: string) {
  if (!item.href) return false
  if (item.href === "/admin") return pathname === "/admin"
  return pathname.startsWith(item.href)
}

export function AdminMobileDrawer() {
  const pathname = usePathname() ?? ""
  const topItems = useAllowedItems(adminTopMenu)
  const bottomItems = useAllowedItems(adminBottomMenu)

  return (
    <div className="flex h-full flex-col px-2 py-3">
      <div className="flex items-center justify-between pl-2">
        <div className="flex h-10 items-center gap-2 rounded-full bg-background px-3 text-sm font-medium text-foreground">
          <CamiMark size={20} />
          Cami HQ
        </div>
        <SheetClose asChild>
          <Button
            variant="ghost"
            aria-label="Close menu"
            className="h-11 w-[52px] rounded-xl text-sidebar-foreground"
          >
            <ChevronsLeftIcon className="size-5" />
          </Button>
        </SheetClose>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-0.5" aria-label="Admin">
        {topItems.map((item) => (
          <DrawerLeaf key={item.label} item={item} active={isItemActive(item, pathname)} />
        ))}
      </nav>
      <nav className="flex flex-col gap-0.5" aria-label="Secondary">
        {bottomItems.map((item) =>
          item.label === "Settings" ? (
            <DrawerSettingsItem key={item.label} item={item} />
          ) : (
            <DrawerLeaf key={item.label} item={item} active={isItemActive(item, pathname)} />
          ),
        )}
      </nav>
    </div>
  )
}
