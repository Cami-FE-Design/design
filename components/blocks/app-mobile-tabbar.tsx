"use client"

import {
  CalendarIcon,
  ContactRoundIcon,
  Grid2x2Icon,
  type LucideIcon,
  ReceiptIcon,
} from "lucide-react"
import type * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TabItem = {
  icon: LucideIcon
  label: string
}

const tabs: TabItem[] = [
  { icon: CalendarIcon, label: "Schedules" },
  { icon: ContactRoundIcon, label: "Clients" },
  { icon: ReceiptIcon, label: "Sales" },
  { icon: Grid2x2Icon, label: "Catalogs" },
]

type AppMobileTabbarProps = React.ComponentProps<"nav">

export function AppMobileTabbar({ className, ...props }: AppMobileTabbarProps) {
  return (
    <nav
      data-slot="app-mobile-tabbar"
      aria-label="Primary"
      className={cn("flex w-full flex-col items-center", className)}
      {...props}
    >
      <div className="flex w-full items-start justify-center gap-0.5 px-2 py-2">
        {tabs.map(({ icon: Icon, label }) => (
          <Button
            key={label}
            variant="ghost"
            aria-label={label}
            className="h-11 rounded-xl px-4 text-sidebar-foreground"
          >
            <Icon className="size-8" />
          </Button>
        ))}
      </div>
      <div className="flex h-6 w-full items-center justify-center">
        <span aria-hidden className="h-[5px] w-[134px] rounded-full bg-foreground" />
      </div>
    </nav>
  )
}
