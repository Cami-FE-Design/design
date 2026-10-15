"use client"

import { XIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { ConfirmDialog } from "@/components/blocks/shared/confirm-dialog"
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
  /**
   * Return a promise to hold the dialog open while it saves: the buttons lock,
   * a rejection keeps the typed text and says so, and only a success closes.
   */
  onSave: (value: string) => void | Promise<void>
  onDelete?: () => void | Promise<void>
  /**
   * Blank or whitespace-only text can't be saved. Off for the appointment
   * note, where an empty note is a state of its own.
   */
  requireText?: boolean
  /** Delete asks first, in `<DeleteNoteDialog>`, before `onDelete` runs. */
  confirmDelete?: boolean
}

export function NoteDialog({
  open,
  onOpenChange,
  initialValue,
  onSave,
  onDelete,
  requireText = false,
  confirmDelete = false,
}: NoteDialogProps) {
  const [value, setValue] = useState(initialValue ?? "")
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const isEdit = initialValue !== null
  const blank = requireText && value.trim() === ""

  // Sync the textarea with the latest initial value each time the dialog
  // opens so reopening after a save shows the persisted text.
  useEffect(() => {
    if (open) {
      setValue(initialValue ?? "")
      setFailed(false)
    }
  }, [open, initialValue])

  function handleOpenChange(next: boolean) {
    if (pending) return
    onOpenChange(next)
  }

  async function handleSave() {
    if (blank) return
    const result = onSave(value.trim())
    if (!result) {
      onOpenChange(false)
      return
    }
    setPending(true)
    setFailed(false)
    try {
      await result
      setPending(false)
      onOpenChange(false)
    } catch {
      setPending(false)
      setFailed(true)
    }
  }

  function handleDelete() {
    if (confirmDelete) {
      setConfirmOpen(true)
      return
    }
    onDelete?.()
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex flex-col gap-4 sm:max-w-xl">
          <div className="flex items-start justify-between gap-3">
            <DialogTitle className="text-2xl">{isEdit ? "Edit note" : "Add a note"}</DialogTitle>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close"
                disabled={pending}
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
            <DialogDescription>
              This note will be visible only to your team members
            </DialogDescription>
            {failed ? (
              <p role="alert" className="text-sm text-destructive">
                {isEdit
                  ? "Couldn't update this note. Try again."
                  : "Couldn't save this note. Try again."}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            {isEdit && onDelete ? (
              <Button
                type="button"
                variant="outline"
                radius="full"
                onClick={handleDelete}
                disabled={pending}
                className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                Delete
              </Button>
            ) : null}
            <Button
              type="button"
              radius="full"
              onClick={handleSave}
              disabled={blank || pending}
              aria-busy={pending || undefined}
            >
              {isEdit ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Stacks over the editor, so Cancel goes back to the text as it was. */}
      {confirmDelete && onDelete ? (
        <DeleteNoteDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          onConfirm={async () => {
            await onDelete()
            onOpenChange(false)
          }}
        />
      ) : null}
    </>
  )
}

/**
 * The one delete confirmation for a profile note, whether it is opened from
 * the note's row or from inside the edit dialog. A failed delete keeps the
 * dialog up with the note untouched behind it.
 */
export function DeleteNoteDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void | Promise<void>
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete note?"
      description="You can't undo this."
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
      errorMessage="Couldn't delete this note. Try again."
    />
  )
}
