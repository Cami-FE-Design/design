"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { type ReactNode, useState } from "react"
import { toast } from "sonner"

import { DeleteNoteDialog, NoteDialog } from "@/components/blocks/shared/note-dialog"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Edit and Delete for one note: the outlined round pair the appointment
 * sheet's note card has always carried (PILOT-60 names it the reference).
 * The appointment sheet renders this too, so the two can't drift.
 */
export function NoteRowActions({
  onEdit,
  onDelete,
  className,
}: {
  onEdit: () => void
  onDelete: () => void
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            radius="full"
            onClick={onEdit}
            aria-label="Edit note"
          >
            <PencilIcon className="size-4" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            radius="full"
            onClick={onDelete}
            aria-label="Delete note"
          >
            <Trash2Icon className="size-4" aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete</TooltipContent>
      </Tooltip>
    </div>
  )
}

/**
 * One client or pet profile note: the text, who wrote it and when, and its
 * actions. The actions show on hover or keyboard focus, like the appointment
 * note's, and stay visible on touch screens, where there is no hover.
 */
export function ProfileNoteBody({
  content,
  meta,
  onEdit,
  onDelete,
}: {
  content: string
  meta?: ReactNode
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <div className="group/note flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Not clamped, and line breaks kept: a note typed over several lines
            reads back the way it was written. */}
        <p className="whitespace-pre-line text-sm leading-snug text-foreground">{content}</p>
        {meta ? <p className="text-xs text-muted-foreground">{meta}</p> : null}
      </div>
      {onEdit && onDelete ? (
        <NoteRowActions
          onEdit={onEdit}
          onDelete={onDelete}
          className="shrink-0 opacity-0 transition-opacity group-hover/note:opacity-100 group-focus-within/note:opacity-100 pointer-coarse:opacity-100"
        />
      ) : null}
    </div>
  )
}

/**
 * "Created: 09/15/2026 11:09 am by Maz Khan" — the as-built profile line, for
 * client and pet notes alike.
 *
 * Deliberately not the calendar preview's "Maz Khan · 7 Sep, 5:49pm". That
 * one is short because it sits under a clamped note on a surface read in a
 * second; this is the record, where a full date is what someone asking "when
 * was this written" actually wants. Author is optional — it arrives only when
 * the backend enriches the row.
 */
export function formatNoteMeta(createdAt: string, authorName?: string): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  const hour = date.getHours() % 12 || 12
  const stamp = `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()} ${hour}:${pad(date.getMinutes())} ${date.getHours() >= 12 ? "pm" : "am"}`
  return authorName ? `Created: ${stamp} by ${authorName}` : `Created: ${stamp}`
}

/** How a demo note request behaves. The playground switches it to show failures. */
export type NoteRequestMode = "succeed" | "slow" | "fail"

/** Stands in for the notes API so the saving and failure states are real. */
export function simulateNoteRequest(mode: NoteRequestMode = "succeed"): Promise<void> {
  return new Promise((resolve, reject) => {
    window.setTimeout(
      () => (mode === "fail" ? reject(new Error("Simulated failure")) : resolve()),
      mode === "slow" ? 3000 : 450,
    )
  })
}

type EditableNote = { id: string; content: string }

/**
 * Edit and Delete for a list of profile notes. The caller owns the notes and
 * says how to change them; this owns the two dialogs. Both reject to report a
 * failure, which leaves the note as it was.
 *
 * Delete always asks first, from the row and from inside the editor. That is
 * new: the appointment note still deletes straight away, and PILOT-60 leaves
 * it that way.
 */
export function useProfileNoteEditor({
  onUpdate,
  onDelete,
}: {
  onUpdate: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState<EditableNote | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function remove(id: string) {
    await onDelete(id)
    toast.success("Note deleted")
  }

  const dialogs = (
    <>
      <NoteDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValue={editing?.content ?? ""}
        requireText
        confirmDelete
        onSave={(value) => (editing ? onUpdate(editing.id, value) : undefined)}
        onDelete={() => (editing ? remove(editing.id) : undefined)}
      />
      <DeleteNoteDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null)
        }}
        onConfirm={() => (deletingId ? remove(deletingId) : undefined)}
      />
    </>
  )

  return {
    edit: (note: EditableNote) => {
      setEditing(note)
      setEditOpen(true)
    },
    remove: (id: string) => setDeletingId(id),
    dialogs,
  }
}
