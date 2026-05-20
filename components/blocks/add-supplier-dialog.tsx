"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type AddSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onSave: (name: string) => void
}

export function AddSupplierDialog({
  open,
  onOpenChange,
  onCancel,
  onSave,
}: AddSupplierDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
    setName("")
    setDescription("")
  }

  function handleCancel() {
    setName("")
    setDescription("")
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-6">
          <DialogTitle>Add a supplier</DialogTitle>
          <DialogDescription className="sr-only">
            Create a new supplier to associate with your products.
          </DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6 pb-6">
          <div className="grid gap-2">
            <Label htmlFor="add-supplier-name">Supplier name</Label>
            <Input
              id="add-supplier-name"
              placeholder="e.g. Fresha"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="add-supplier-description">Supplier description</Label>
              <span className="text-xs text-muted-foreground">{description.length}/100</span>
            </div>
            <Textarea
              id="add-supplier-description"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 100))}
              className="min-h-24"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={handleCancel}>
            Cancel
          </Button>
          <Button radius="full" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
