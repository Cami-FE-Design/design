"use client"

import { XIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

type SaleNoteDialogProps = {
  open: boolean
  note: string
  onOpenChange: (open: boolean) => void
  onSave: (note: string) => void
}

export function SaleNoteDialog({ open, note, onOpenChange, onSave }: SaleNoteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-4 sm:max-w-md">
        <NoteBody note={note} onSave={onSave} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function NoteBody({
  note,
  onSave,
  onClose,
}: {
  note: string
  onSave: (note: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(note)
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <DialogTitle className="font-heading font-semibold text-xl">Add sale note</DialogTitle>
        <DialogClose asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            className="text-muted-foreground"
          >
            <XIcon className="size-5" />
          </Button>
        </DialogClose>
      </div>

      <Textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a note to this sale"
        className="min-h-28"
      />

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" radius="full" className="px-6" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          radius="full"
          className="px-6"
          onClick={() => {
            onSave(value.trim())
            onClose()
          }}
        >
          Save
        </Button>
      </div>
    </>
  )
}
