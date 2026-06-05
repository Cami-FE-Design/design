"use client"

import { ConfirmDialog } from "@/components/blocks/confirm-dialog"

type DeleteProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  onDelete: () => void
}

// Thin wrapper over the shared ConfirmDialog so product deletion matches every
// other destructive confirmation in the app (Cancel draft, Void sale, …) —
// same top-right close, muted description, right-aligned Cancel + destructive
// action. Keeps the product name emphasised in the body copy.
export function DeleteProductDialog({
  open,
  onOpenChange,
  productName,
  onDelete,
}: DeleteProductDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete product?"
      description={
        <>
          All data associated with{" "}
          <span className="font-medium text-foreground">{productName}</span> will be permanently
          deleted.
        </>
      }
      cancelLabel="Cancel"
      confirmLabel="Delete"
      destructive
      onConfirm={onDelete}
    />
  )
}
