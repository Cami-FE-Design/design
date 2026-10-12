"use client"

import { XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type NoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** null = Add mode, string = Edit mode (even for empty string). */
  initialValue: string | null
  onSave: (value: string) => void
  onDelete?: () => void
}

export function NoteDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
  onDelete,
}: NoteDialogProps) {
  const [value, setValue] = useState(initialValue ?? "")
  const isEdit = initialValue !== null

  // Sync the textarea with the latest initial value each time the dialog
  // opens so reopening after a save shows the persisted text.
  useEffect(() => {
    if (open) setValue(initialValue ?? "")
  }, [open, initialValue])

  function handleSave() {
    onSave(value.trim())
    onOpenChange(false)
  }

  function handleDelete() {
    onDelete?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-xl">
        <div className="flex items-start justify-between gap-3">
          <DialogTitle className="text-2xl">{isEdit ? "Edit note" : "Add a note"}</DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close"
              className="-mt-1 inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <XIcon className="size-4" aria-hidden />
            </button>
          </DialogClose>
        </div>
        <div className="flex flex-col gap-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter any special instructions or details about the appointment here"
            rows={8}
            className="min-h-40"
          />
          <DialogDescription>This note will be visible only to your team members</DialogDescription>
        </div>
        <DialogFooter>
          {isEdit && onDelete ? (
            <Button
              type="button"
              variant="outline"
              radius="full"
              onClick={handleDelete}
              className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              Delete
            </Button>
          ) : null}
          <Button type="button" radius="full" onClick={handleSave}>
            {isEdit ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
