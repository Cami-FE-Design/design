"use client"

import { XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DeleteProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  onDelete: () => void
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  productName,
  onDelete,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-0">
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription className="sr-only">
            Permanently delete this product and all associated data.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="px-6 py-6">
          <p className="text-sm text-muted-foreground">
            All data associated with{" "}
            <span className="font-medium text-foreground">{productName}</span> will be permanently
            deleted.
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            radius="full"
            onClick={() => {
              onDelete()
              onOpenChange(false)
            }}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
