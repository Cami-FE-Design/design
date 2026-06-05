"use client"

import { BanknoteIcon, type LucideIcon, WalletIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"

const METHODS: { id: "cash" | "card"; label: string; icon: LucideIcon }[] = [
  { id: "cash", label: "Cash", icon: BanknoteIcon },
  { id: "card", label: "Card", icon: WalletIcon },
]

type SelectPaymentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (method: "cash" | "card") => void
}

export function SelectPaymentModal({ open, onOpenChange, onSelect }: SelectPaymentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-5 sm:max-w-sm">
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            className="absolute top-4 right-4 text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>
        <DialogTitle className="font-heading font-semibold text-xl">Select payment</DialogTitle>

        <div className="grid grid-cols-2 gap-3">
          {METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                onSelect(method.id)
                onOpenChange(false)
              }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-card px-4 py-8 text-center transition-colors hover:bg-muted/40"
            >
              <method.icon className="size-6 stroke-[1.5] text-foreground" />
              <span className="font-medium text-base text-foreground">{method.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
