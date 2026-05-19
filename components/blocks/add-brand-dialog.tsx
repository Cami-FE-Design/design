"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AddBrandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGoBack: () => void
  onSave: (name: string) => void
}

export function AddBrandDialog({ open, onOpenChange, onGoBack, onSave }: AddBrandDialogProps) {
  const [name, setName] = useState("")

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
    setName("")
  }

  function handleGoBack() {
    setName("")
    onGoBack()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-6">
          <DialogTitle>Add a brand</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="grid gap-2 px-6 pb-6">
          <Label htmlFor="add-brand-name">Brand name</Label>
          <Input
            id="add-brand-name"
            placeholder="e.g. Fresha"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={handleGoBack}>
            Go back
          </Button>
          <Button radius="full" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
