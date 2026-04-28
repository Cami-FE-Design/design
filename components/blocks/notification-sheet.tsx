"use client"

import type * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type NotificationSheetProps = {
  trigger: React.ReactNode
}

export function NotificationSheet({ trigger }: NotificationSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Recent activity and updates from your workspaces.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <p className="text-sm text-muted-foreground">No new notifications.</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
