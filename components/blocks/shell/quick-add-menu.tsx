"use client"

import { CalendarPlusIcon, CoinsIcon, ReceiptTextIcon, UserPlusIcon } from "lucide-react"
import type * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type QuickAddMenuProps = {
  trigger: React.ReactNode
  align?: "start" | "end" | "center"
  onAppointment?: () => void
  onPetParent?: () => void
  onInvoice?: () => void
  onQuickPayment?: () => void
}

export function QuickAddMenu({
  trigger,
  align = "center",
  onAppointment,
  onPetParent,
  onInvoice,
  onQuickPayment,
}: QuickAddMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} sideOffset={8} className="w-52">
        <DropdownMenuItem onSelect={onAppointment}>
          <CalendarPlusIcon />
          New Appointment
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onPetParent}>
          <UserPlusIcon />
          New Pet Parent
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onInvoice}>
          <ReceiptTextIcon />
          New Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onQuickPayment}>
          <CoinsIcon />
          Quick Payment
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
