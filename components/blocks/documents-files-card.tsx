"use client"

import {
  ChevronDownIcon,
  CirclePlusIcon,
  DownloadIcon,
  EyeIcon,
  FileSignatureIcon,
  FileTextIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { Fragment, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { PdfViewer } from "@/components/blocks/pdf-viewer-lazy"
import { SectionCard } from "@/components/blocks/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { type UploadedFile, useDemoFiles } from "@/lib/demo-files"
import { buildConsentPdfUrl } from "@/lib/mock-pdf"
import { cn } from "@/lib/utils"

// ─── Types ──────────────────────────────────────────────────────────────────

type ConsentFormStatus = "awaiting" | "signed"

type ConsentForm = {
  id: string
  /** Operator-given title for the form, e.g. "Liability waiver". */
  name: string
  /** The attached document that was sent for signature. */
  fileName: string
  /** ISO timestamp of when the form was shared with the recipient. */
  sharedAt: string
  status: ConsentFormStatus
}

// ─── Config / seed data ───────────────────────────────────────────────────────

/** Only PDF is accepted for upload right now. */
const ACCEPTED_EXTENSIONS = [".pdf"]
const ACCEPT_ATTR = ACCEPTED_EXTENSIONS.join(",")

// Seeded so the listing shows both statuses by default.
const SEED_FORMS: ConsentForm[] = [
  {
    id: "seed-form-1",
    name: "Client consent",
    fileName: "Signed_consent_form.pdf",
    sharedAt: "2026-07-02T15:24:00",
    status: "signed",
  },
  {
    id: "seed-form-2",
    name: "Liability waiver",
    fileName: "Grooming_liability_waiver.pdf",
    sharedAt: "2026-07-05T10:10:00",
    status: "awaiting",
  },
]

// ─── Formatting ─────────────────────────────────────────────────────────────

/** Matches the app-wide date style used on the clients / pets lists (e.g. "Jul 7, 2026"). */
function formatFileDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** Row time, lowercased to match the app style (e.g. "10:10am"). */
function formatFormTime(iso: string): string {
  return new Date(iso)
    .toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    .replace(" ", "")
    .toLowerCase()
}

/** Status pill copy + colour, reusing the original Signed / Pending tag treatment. */
const FORM_STATUS_BADGE: Record<ConsentFormStatus, { label: string; className: string }> = {
  signed: { label: "Signed", className: "bg-lime-5 text-lime-12" },
  awaiting: { label: "Pending", className: "bg-cami-yellow-3 text-cami-yellow-11" },
}

/** Longer form shown in the preview header, e.g. "Tue, 7 Jul 2026, 7:24 pm". */
function formatPreviewTimestamp(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function hasAcceptedExtension(name: string): boolean {
  const lower = name.toLowerCase()
  return ACCEPTED_EXTENSIONS.some((ext) => lower.endsWith(ext))
}

/** File extension without the dot, upper-cased for the preview placeholder (e.g. "PDF"). */
function fileExtLabel(name: string): string {
  const dot = name.lastIndexOf(".")
  return dot >= 0 ? name.slice(dot + 1).toUpperCase() : "FILE"
}

/** Split a file name into its display base and extension (with the dot), e.g. "a.pdf" → ["a", ".pdf"]. */
function splitFileName(name: string): [base: string, ext: string] {
  const dot = name.lastIndexOf(".")
  // A leading dot (e.g. ".env") is treated as all-base, not an extension.
  return dot > 0 ? [name.slice(0, dot), name.slice(dot)] : [name, ""]
}

// ─── Consent form row ─────────────────────────────────────────────────────────

/**
 * A single consent form rendered as a flat listing row — mirroring the Files
 * section for a consistent, low-scroll Documents tab. The form name is the
 * title, with the sent date + time + document beneath it; the Signed / Pending
 * status is pinned right, followed by a 3-dot menu holding View form / Delete.
 */
function FormRow({
  form,
  onView,
  onDelete,
}: {
  form: ConsentForm
  onView: () => void
  onDelete: () => void
}) {
  const badge = FORM_STATUS_BADGE[form.status]
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
        <FileSignatureIcon className="size-4.5" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="truncate text-sm font-medium text-foreground">{form.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {formatFileDate(form.sharedAt)} · {formatFormTime(form.sharedAt)} · {form.fileName}
        </span>
      </div>
      <Badge className={cn("shrink-0 border-transparent", badge.className)}>{badge.label}</Badge>
      <FormActionsMenu label={`Actions for ${form.name}`} onView={onView} onDelete={onDelete} />
    </li>
  )
}

// ─── Consent form full-screen viewer ────────────────────────────────────────────

// Mock consent copy shown in the full-screen viewer — a pet grooming consent +
// liability waiver. Real forms would render their own saved question set.
const CONSENT_STATEMENTS = [
  "I confirm that the information I have provided about my pet — including its age, health, temperament and vaccination history — is accurate and complete.",
  "I consent to my pet being handled, bathed and groomed by the team, and understand that a muzzle or other safe restraint may be used if my pet becomes anxious or aggressive.",
  "I understand that grooming can occasionally reveal pre-existing conditions such as skin irritation, lumps or matting, and I authorise the groomer to proceed using their professional judgement.",
  "I understand that a severely matted coat may need to be shaved for my pet's comfort, and that this carries a small risk of nicks or skin sensitivity that the business is not liable for.",
  "I confirm my pet is in good health and free of fleas, ticks and contagious conditions; if any are found, the appointment may be paused or rescheduled for the safety of other animals.",
  "I authorise the business to seek veterinary care for my pet in an emergency if I cannot be reached, and I accept responsibility for any resulting costs.",
  "I release the staff and the business from liability for any accidental injury, illness or stress to my pet that may occur despite reasonable and professional care.",
]

/**
 * Full-screen read-only view of a consent form: a sticky header with the
 * document title + a single pill "Close" action, and a body centered to the
 * app's max-w-[960px] content column. No big page heading — the status lives in the
 * signature panel instead.
 *
 * The document is rendered as a real PDF (built from the consent copy) in a
 * left column, with the signature panel pinned to the right — mirroring the
 * public signer flow. On desktop the only scroll surface is the PDF viewer
 * itself; the signature panel stays fixed. A signed form shows the captured
 * signature; an unsigned one is flagged as awaiting signature.
 */
function FormViewDialog({
  form,
  signerName,
  open,
  onOpenChange,
}: {
  form: ConsentForm | null
  /** Client's full name — shown as the person who signed the form. */
  signerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  // Retain the last opened form while the dialog animates closed. Without this,
  // `form` drops to null the instant Close is clicked and the title flips to the
  // "Form" fallback for a frame before the exit finishes — a visible jerk.
  const [shown, setShown] = useState<ConsentForm | null>(form)
  useEffect(() => {
    if (form) setShown(form)
  }, [form])

  const signed = shown?.status === "signed"
  const documentTitle = shown?.name ?? "Consent form"

  // Build the embedded PDF from the consent copy while the dialog is open, then
  // revoke the object URL on close / unmount.
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!open) return
    let cancelled = false
    let built: string | null = null
    buildConsentPdfUrl(documentTitle, CONSENT_STATEMENTS).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url)
        return
      }
      built = url
      setPdfUrl(url)
    })
    return () => {
      cancelled = true
      setPdfUrl(null)
      if (built) URL.revokeObjectURL(built)
    }
  }, [open, documentTitle])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! translate-x-0! translate-y-0! flex-col gap-0 overflow-hidden rounded-none! bg-background! p-0 sm:max-w-none!">
        <DialogTitle className="sr-only">{documentTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          {signed ? "Completed and signed by the client." : "This form hasn’t been signed yet."}
        </DialogDescription>

        {/* Sticky header — no title anywhere, just a single Close action. */}
        <header className="shrink-0 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
          <div className="mx-auto flex w-full max-w-[960px] items-center justify-end gap-3">
            <DialogClose asChild>
              <Button type="button" variant="outline" size="lg" radius="full">
                Close
              </Button>
            </DialogClose>
          </div>
        </header>

        {/* Body — on desktop the only scroll lives inside the PDF viewer. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:overflow-hidden lg:px-10">
          <div className="mx-auto grid w-full max-w-[960px] gap-6 lg:h-full lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
            {/* Document */}
            {pdfUrl ? (
              <PdfViewer file={pdfUrl} className="h-[70vh] max-h-none lg:h-full" />
            ) : (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground lg:h-full">
                Preparing document…
              </div>
            )}

            {/* Signature panel — floating card, matching the public signer flow. */}
            <aside className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-md ring-1 ring-foreground/5 lg:h-full lg:p-8 dark:ring-foreground/10">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground">Signature</h3>
                <Badge
                  className={cn(
                    "border-transparent",
                    signed ? "bg-lime-5 text-lime-12" : "bg-cami-yellow-3 text-cami-yellow-11",
                  )}
                >
                  {signed ? "Signed" : "Pending"}
                </Badge>
              </div>

              {signed ? (
                <>
                  {/* Signature framed by a "[" bracket, mirroring the reference: a
                  ~40px left gutter (vertical rule + top & bottom rungs), the
                  brand label above the top rung, the scripted signature inside,
                  the typed name near the bottom rung, and the Signature ID
                  below the frame. */}
                  <div className="w-fit">
                    <span className="mb-1 block pl-10 text-sm font-semibold leading-none text-foreground">
                      Cami
                    </span>
                    <div className="relative min-w-56 pl-10">
                      <span aria-hidden className="absolute inset-y-0 left-0 w-px bg-foreground" />
                      <span aria-hidden className="absolute top-0 left-0 h-px w-10 bg-foreground" />
                      <span
                        aria-hidden
                        className="absolute bottom-0 left-0 h-px w-10 bg-foreground"
                      />
                      <span className="block py-1 font-['Segoe_Script','Snell_Roundhand','Brush_Script_MT',cursive] text-4xl leading-tight text-foreground">
                        {signerName}
                      </span>
                      <span className="block pb-2 text-xs font-semibold leading-none text-foreground">
                        {signerName}
                      </span>
                    </div>
                    <span className="mt-1 block pl-10 text-xs text-muted-foreground">
                      Signature ID: 1783434039981
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed and signed by {signerName}.
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This form hasn’t been signed by the client yet.
                </p>
              )}
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Row actions menu ─────────────────────────────────────────────────────────

/** View / delete for a single consent form, matching the Files row menu. */
function FormActionsMenu({
  label,
  onView,
  onDelete,
}: {
  label: string
  onView: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          radius="full"
          aria-label={label}
          className="shrink-0 text-muted-foreground"
        >
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={onView}>
          <EyeIcon />
          View form
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── File row actions menu ─────────────────────────────────────────────────────

/**
 * Preview / rename / download / delete for a single uploaded file.
 *
 * `variant` only swaps the trigger: "menu" (default) is the compact 3-dot
 * button used inside the client/pet Documents tab; "button" is the "Action ▾"
 * outline pill used in Settings, matching the Sales / Team action pattern. The
 * menu items themselves are identical, so the two surfaces never diverge.
 */
function FileActionsMenu({
  label,
  variant = "menu",
  onPreview,
  onRename,
  onDownload,
  onDelete,
}: {
  label: string
  variant?: "menu" | "button"
  onPreview: () => void
  onRename: () => void
  onDownload: () => void
  onDelete: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "button" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            aria-label={label}
            className="shrink-0 gap-1.5"
          >
            Action
            <ChevronDownIcon className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label={label}
            className="shrink-0 text-muted-foreground"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={onPreview}>
          <EyeIcon />
          Preview file
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onRename}>
          <PencilIcon />
          Rename file
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDownload}>
          <DownloadIcon />
          Download file
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onDelete}>
          <Trash2Icon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── File preview (full-screen) ─────────────────────────────────────────────────

/**
 * Full-screen file preview opened from a file row's "Preview file" action.
 * Mirrors the operator's "View form" screen — app-styled (not a dark viewer),
 * a sticky header with the file name + Download / Close, and the document as a
 * real in-app PDF below — but single-column (no signature panel). Seeded rows
 * with no underlying file fall back to a file-type placeholder + Download.
 */
function FilePreviewDialog({
  file,
  open,
  onOpenChange,
  onDownload,
}: {
  file: UploadedFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (file: UploadedFile) => void
}) {
  // Session uploads carry a real object URL. Seeded rows don't (object URLs
  // don't survive a reload), so build a demo PDF from the consent copy while
  // the dialog is open — everything is a PDF now that react-pdf is wired in.
  const [demoUrl, setDemoUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!open || !file || file.url) {
      setDemoUrl(null)
      return
    }
    let cancelled = false
    let built: string | null = null
    const title = file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ")
    buildConsentPdfUrl(title, CONSENT_STATEMENTS).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url)
        return
      }
      built = url
      setDemoUrl(url)
    })
    return () => {
      cancelled = true
      if (built) URL.revokeObjectURL(built)
    }
  }, [open, file])

  const pdfUrl = file?.url ?? demoUrl

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed! inset-0! top-0! left-0! h-dvh! w-screen! max-h-none! max-w-none! translate-x-0! translate-y-0! flex-col gap-0 overflow-hidden rounded-none! bg-background! p-0 sm:max-w-none!">
        <DialogTitle className="sr-only">{file?.name ?? "File preview"}</DialogTitle>
        <DialogDescription className="sr-only">Preview of the selected file.</DialogDescription>

        {/* Sticky header — file name + Download / Close, matching the View form. */}
        <header className="shrink-0 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
          <div className="mx-auto flex w-full max-w-[960px] items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold text-foreground">{file?.name}</span>
              {file ? (
                <span className="truncate text-xs text-muted-foreground">
                  {formatPreviewTimestamp(file.uploadedAt)} ·{" "}
                  {fileExtLabel(file.name).toLowerCase()}
                </span>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                radius="full"
                aria-label="Download"
                className="text-muted-foreground"
                onClick={() => file && onDownload(file)}
              >
                <DownloadIcon className="size-5" />
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline" size="lg" radius="full">
                  Close
                </Button>
              </DialogClose>
            </div>
          </div>
        </header>

        {/* Body — single column (no signature panel). Only the PDF scrolls. */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8 lg:overflow-hidden lg:px-10">
          <div className="mx-auto w-full max-w-[960px] lg:h-full">
            {pdfUrl ? (
              <PdfViewer file={pdfUrl} className="h-[70vh] max-h-none lg:h-full" />
            ) : (
              <div className="flex h-[70vh] items-center justify-center rounded-2xl border border-border/60 bg-muted/30 text-sm text-muted-foreground lg:h-full">
                <Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
                Preparing preview…
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Rename file dialog ─────────────────────────────────────────────────────────

function RenameFileDialog({
  file,
  open,
  onOpenChange,
  onRename,
}: {
  file: UploadedFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onRename: (id: string, name: string) => void
}) {
  // The operator edits only the display name; the extension is preserved and
  // never shown, so it can't be accidentally dropped or changed.
  const [base, setBase] = useState("")
  const ext = file ? splitFileName(file.name)[1] : ""

  useEffect(() => {
    if (open && file) setBase(splitFileName(file.name)[0])
  }, [open, file])

  const trimmed = base.trim()
  const canSave = trimmed !== "" && file != null

  function handleSave() {
    if (!canSave || !file) return
    onRename(file.id, trimmed + ext)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-110! max-w-110!">
        <DialogDescription className="sr-only">Rename the selected file.</DialogDescription>

        <div className="flex flex-col gap-2 px-8 pt-6">
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-[28px] font-semibold leading-8">
            Choose a name for the file
          </DialogTitle>
        </div>

        <div className="flex flex-col gap-6 px-8 pb-8 pt-6">
          <label htmlFor="rename-file" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">File name</span>
            <Input
              id="rename-file"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
            />
          </label>
          <div className="flex justify-end">
            <Button type="button" size="lg" radius="full" disabled={!canSave} onClick={handleSave}>
              Rename
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Consent form dialog (add + edit) ─────────────────────────────────────────

type ConsentFormSubmit = {
  name: string
  fileId: string
  message: string
  status: ConsentFormStatus
}

type ConsentFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: UploadedFile[]
  /** Recipient name from the profile — shown on the "sending to" line. */
  recipientName?: string
  /** Recipient email from the profile — the address the form is sent to. */
  recipientEmail?: string
  /** Recipient phone from the profile — shown alongside the send channel. */
  recipientPhone?: string
  /** When set, the dialog edits this form; otherwise it adds a new one. */
  initial?: ConsentForm | null
  onSubmit: (form: ConsentFormSubmit) => void
}

function ConsentFormDialog({
  open,
  onOpenChange,
  files,
  recipientName,
  recipientEmail,
  recipientPhone,
  initial,
  onSubmit,
}: ConsentFormDialogProps) {
  const isEdit = initial != null
  const [name, setName] = useState("")
  const [fileId, setFileId] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<ConsentFormStatus>("awaiting")

  useEffect(() => {
    if (!open) return
    if (initial) {
      setName(initial.name)
      setStatus(initial.status)
      setMessage("")
      // The form stores the document by name; match it back to a current file.
      const match = files.find((f) => f.name === initial.fileName)
      setFileId(match ? match.id : "")
    } else {
      setName("")
      setFileId("")
      setMessage("")
      setStatus("awaiting")
    }
  }, [open, initial, files])

  const noFiles = files.length === 0
  const canSubmit = name.trim() !== "" && fileId !== ""

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({ name: name.trim(), fileId, message: message.trim(), status })
    onOpenChange(false)
  }

  // Recipient contacts for the "sending to" line — each stays on one line so a
  // phone number or email is never broken mid-value across a wrap.
  const recipientContacts = [
    recipientEmail ? { value: recipientEmail, label: "Email" } : null,
    recipientPhone ? { value: recipientPhone, label: "WhatsApp" } : null,
  ].filter((c): c is { value: string; label: string } => c !== null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-130! max-w-130!">
        <DialogDescription className="sr-only">
          Name the form and pick an uploaded document to email to the profile contact for signature.
        </DialogDescription>

        <div className="flex flex-col gap-2 px-8 pt-6">
          <div className="flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogTitle className="text-[28px] font-semibold leading-8">
            {isEdit ? "Edit consent form" : "Add consent form"}
          </DialogTitle>
          {!isEdit && recipientName ? (
            // Everything flows inline: if it fits, name + contacts sit on one line
            // with "·" separators between them. When space runs out it wraps by
            // whole contact — each value stays intact, and the separator glues to
            // the preceding text (nbsp) so it trails a line instead of dangling at
            // the start of the next one.
            <p className="text-sm text-muted-foreground">
              To <span className="text-foreground">{recipientName}</span>
              {recipientContacts.map((contact) => (
                <span key={contact.label}>
                  {" · "}
                  <span className="whitespace-nowrap">
                    {contact.value} · {contact.label}
                  </span>
                </span>
              ))}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-5 px-8 pb-8 pt-6">
          <label htmlFor="consent-name" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Form name</span>
            <Input
              id="consent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Liability waiver"
              autoComplete="off"
            />
          </label>

          <label htmlFor="consent-document" className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Document</span>
            <Select value={fileId} onValueChange={setFileId} disabled={noFiles}>
              <SelectTrigger
                id="consent-document"
                className="h-12! w-full rounded-2xl bg-input px-4 text-sm font-medium"
              >
                <SelectValue placeholder={noFiles ? "Upload a file first" : "Select a document"} />
              </SelectTrigger>
              <SelectContent>
                {files.map((file) => (
                  <SelectItem key={file.id} value={file.id}>
                    {file.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noFiles ? (
              <span className="text-xs text-muted-foreground">
                Upload a PDF in the Files section below, then it can be sent for signature.
              </span>
            ) : null}
          </label>

          {isEdit ? (
            <label htmlFor="consent-status" className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Status</span>
              <Select value={status} onValueChange={(v) => setStatus(v as ConsentFormStatus)}>
                <SelectTrigger
                  id="consent-status"
                  className="h-12! w-full rounded-2xl bg-input px-4 text-sm font-medium"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="awaiting">Pending</SelectItem>
                  <SelectItem value="signed">Signed</SelectItem>
                </SelectContent>
              </Select>
            </label>
          ) : (
            <label htmlFor="consent-message" className="flex flex-col gap-1.5">
              <span className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Personal message</span>
                <span className="text-xs text-muted-foreground">{message.length}/200</span>
              </span>
              <Textarea
                id="consent-message"
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                maxLength={200}
                rows={4}
                placeholder="Add a short note for the recipient…"
              />
            </label>
          )}

          <Button
            type="button"
            size="lg"
            radius="full"
            className="w-full"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isEdit ? "Save changes" : "Send form"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function downloadFile(file: UploadedFile) {
  // Session uploads carry a real object URL. Seeded demo rows don't, so we
  // synthesize a small placeholder blob on the fly — download still works.
  const generated = !file.url
  const href =
    file.url ??
    URL.createObjectURL(
      new Blob([`Placeholder file for "${file.name}".`], { type: "application/pdf" }),
    )
  const link = document.createElement("a")
  link.href = href
  link.download = file.name
  document.body.appendChild(link)
  link.click()
  link.remove()
  if (generated) URL.revokeObjectURL(href)
}

// ─── Files section ────────────────────────────────────────────────────────────

type FilesSectionProps = {
  /** File id to open in the full-screen file preview on mount — for URL deep-links. */
  initialPreviewFileId?: string
  /**
   * "card" (default) is the detail-dialog look — a green circular file glyph,
   * scrolling with the dialog. "settings" matches the settings icon pattern
   * (a neutral bordered square, like `SettingsRow`) and scrolls the list inside
   * the card so the header + Upload action stay pinned.
   */
  variant?: "card" | "settings"
  /** Extra classes for the outer card — e.g. `flex-1 min-h-0` to fill a panel. */
  className?: string
}

/**
 * The shared Files library UI: an "Upload file" action (PDF only), the file
 * list, and the preview / rename / delete flows. Every file lives in the
 * app-wide `useDemoFiles` store, so this exact list is what the Settings "Files"
 * panel and every client/pet Documents tab render — an upload in one place
 * shows up in all of them.
 */
export function FilesSection({
  initialPreviewFileId,
  variant = "card",
  className,
}: FilesSectionProps) {
  const isSettings = variant === "settings"
  const { files, addFiles, renameFile, deleteFile } = useDemoFiles()
  const [fileToDelete, setFileToDelete] = useState<string | null>(null)
  // Deep-link: open the file preview on mount if the id resolves to a file.
  // The preview dialog builds a demo PDF for seeded (url-less) files itself.
  const [filePreviewId, setFilePreviewId] = useState<string | null>(
    initialPreviewFileId && files.some((f) => f.id === initialPreviewFileId)
      ? initialPreviewFileId
      : null,
  )
  const [fileToRename, setFileToRename] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? [])
    // Reset so re-picking the same file still fires onChange.
    e.target.value = ""
    const accepted = chosen.filter((f) => hasAcceptedExtension(f.name))
    const rejected = chosen.length - accepted.length
    if (rejected > 0) {
      toast.error(
        rejected === 1
          ? "That file isn’t a PDF. Only PDF files can be uploaded."
          : `${rejected} files weren’t PDFs. Only PDF files can be uploaded.`,
      )
    }
    if (!accepted.length) return
    const now = new Date().toISOString()
    addFiles(
      accepted.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        url: URL.createObjectURL(file),
        uploadedAt: now,
      })),
    )
    toast.success(accepted.length === 1 ? "File uploaded" : `${accepted.length} files uploaded`)
  }

  function handleRename(id: string, name: string) {
    renameFile(id, name)
    toast.success("File renamed")
  }

  const filePendingDelete = files.find((f) => f.id === fileToDelete) ?? null
  const filePreview = files.find((f) => f.id === filePreviewId) ?? null
  const filePendingRename = files.find((f) => f.id === fileToRename) ?? null

  // Row internals (icon + name/date + actions), shared by both variants. The
  // icon box swaps between the detail-dialog green glyph and the neutral
  // bordered square used across Settings (see `SettingsRow`).
  function fileRowInner(file: UploadedFile) {
    return (
      <>
        <span
          className={cn(
            "flex shrink-0 items-center justify-center",
            isSettings
              ? "size-10 rounded-xl border border-border/50 bg-background text-muted-foreground"
              : "size-9 rounded-full bg-cami-green-3 text-cami-green-11",
          )}
        >
          <FileTextIcon className={isSettings ? "size-5" : "size-4.5"} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          {file.url ? (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm font-medium text-foreground hover:underline"
            >
              {file.name}
            </a>
          ) : (
            <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
          )}
          <span className="text-xs text-muted-foreground">{formatFileDate(file.uploadedAt)}</span>
        </div>
        <FileActionsMenu
          label={`Actions for ${file.name}`}
          variant={isSettings ? "button" : "menu"}
          onPreview={() => setFilePreviewId(file.id)}
          onRename={() => setFileToRename(file.id)}
          onDownload={() => downloadFile(file)}
          onDelete={() => setFileToDelete(file.id)}
        />
      </>
    )
  }

  const uploadButton = (
    <Button
      variant="secondary"
      size="sm"
      radius="full"
      onClick={() => fileInputRef.current?.click()}
    >
      <CirclePlusIcon />
      Upload file
    </Button>
  )

  return (
    <>
      {isSettings ? (
        // Settings: matches the Sales sub-screens — rows inside one bordered
        // card that scrolls internally, with the Upload action as a pill below.
        <div className={cn("flex flex-col gap-4", className)}>
          {files.length === 0 ? (
            <div className="flex w-full flex-col rounded-2xl border border-border/60 p-5 sm:w-146">
              <p className="text-sm text-muted-foreground">No files yet.</p>
            </div>
          ) : (
            <ul className="flex max-h-105 w-full flex-col gap-4 overflow-y-auto rounded-2xl border border-border/60 p-5 sm:w-146">
              {files.map((file, index) => (
                <Fragment key={file.id}>
                  {index > 0 ? <li aria-hidden className="h-px shrink-0 bg-border/60" /> : null}
                  <li className="flex items-center gap-3">{fileRowInner(file)}</li>
                </Fragment>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-center gap-2">{uploadButton}</div>
        </div>
      ) : (
        <SectionCard title="Files" action={uploadButton} className={className}>
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No files yet.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border/60">
              {files.map((file) => (
                <li key={file.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  {fileRowInner(file)}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTR}
        className="sr-only"
        onChange={handleFileChange}
      />

      <FilePreviewDialog
        file={filePreview}
        open={filePreviewId !== null}
        onOpenChange={(o) => {
          if (!o) setFilePreviewId(null)
        }}
        onDownload={downloadFile}
      />

      <RenameFileDialog
        file={filePendingRename}
        open={fileToRename !== null}
        onOpenChange={(o) => {
          if (!o) setFileToRename(null)
        }}
        onRename={handleRename}
      />

      <ConfirmDialog
        open={fileToDelete !== null}
        onOpenChange={(o) => {
          if (!o) setFileToDelete(null)
        }}
        title="Delete file?"
        description={
          filePendingDelete
            ? `"${filePendingDelete.name}" will be permanently removed.`
            : "This action cannot be undone."
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (fileToDelete) deleteFile(fileToDelete)
          setFileToDelete(null)
        }}
      />
    </>
  )
}

// ─── Container: Consent forms + Files ─────────────────────────────────────────

type DocumentsFormsAndFilesProps = {
  /** "Forms" for the client dialog, "Consent forms" for the pet dialog. */
  formsTitle?: string
  /** Recipient name from the client/pet profile — shown in the send confirmation. */
  recipientName?: string
  /** Recipient email from the profile — where the form is sent (not entered in the form). */
  recipientEmail?: string
  /** Recipient phone from the profile — shown alongside the send channel. */
  recipientPhone?: string
  /** Form id to open in the full-screen viewer on mount — for URL deep-links. */
  initialViewFormId?: string
  /** File id to open in the full-screen file preview on mount — for URL deep-links. */
  initialPreviewFileId?: string
}

/**
 * Consent-forms + Files pair for the Documents tab of the client and pet detail
 * dialogs. The "Add consent form" modal picks from the shared file library, and
 * the Files section (rendered below) manages that same library — so a document
 * uploaded here, in another profile, or in Settings is available everywhere.
 *
 * - Files: the shared `<FilesSection>` — see `useDemoFiles`. Upload is PDF-only.
 * - Consent forms: "Add form" opens a modal to name the form + pick an uploaded
 *   document (+ optional message). It's emailed to the client/pet's profile
 *   contact, and listed with the form name, sent date, and signed / pending
 *   status. Forms are per-recipient and stay local to this dialog.
 *
 * Everything is mock-only and lives in state for the current session.
 */
export function DocumentsFormsAndFiles({
  formsTitle = "Forms",
  recipientName,
  recipientEmail,
  recipientPhone,
  initialViewFormId,
  initialPreviewFileId,
}: DocumentsFormsAndFilesProps) {
  const recipientLabel = recipientEmail ?? recipientName ?? undefined
  const { files } = useDemoFiles()
  const [forms, setForms] = useState<ConsentForm[]>(SEED_FORMS)
  const [formToDelete, setFormToDelete] = useState<string | null>(null)
  // Deep-link: open the viewer on mount if the id resolves to a seeded form.
  const [formViewId, setFormViewId] = useState<string | null>(
    initialViewFormId && SEED_FORMS.some((f) => f.id === initialViewFormId)
      ? initialViewFormId
      : null,
  )
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [editingFormId, setEditingFormId] = useState<string | null>(null)

  const editingForm = editingFormId ? (forms.find((f) => f.id === editingFormId) ?? null) : null

  // ── Consent forms ────────────────────────────────────────────────────────

  function openAddForm() {
    setEditingFormId(null)
    setFormDialogOpen(true)
  }

  // Edit is reached from the card's 3-dot menu, which is currently disabled.
  // Restore alongside <RowActionsMenu> in FormTimelineCard if edit returns.
  // function openEditForm(id: string) {
  //   setEditingFormId(id)
  //   setFormDialogOpen(true)
  // }

  function submitForm({ name, fileId, status }: ConsentFormSubmit) {
    const file = files.find((f) => f.id === fileId)
    if (!file) return
    if (editingFormId) {
      setForms((prev) =>
        prev.map((f) => (f.id === editingFormId ? { ...f, name, fileName: file.name, status } : f)),
      )
      toast.success("Consent form updated")
    } else {
      setForms((prev) => [
        {
          id: crypto.randomUUID(),
          name,
          fileName: file.name,
          sharedAt: new Date().toISOString(),
          status,
        },
        ...prev,
      ])
      toast.success(recipientLabel ? `Consent form sent to ${recipientLabel}` : "Consent form sent")
    }
  }

  function deleteForm(id: string) {
    setForms((prev) => prev.filter((f) => f.id !== id))
  }

  /** Open the full-screen read-only view of the form. */
  function viewForm(form: ConsentForm) {
    setFormViewId(form.id)
  }

  // Newest-first so the most recent form sits at the top of the list.
  const sortedForms = [...forms].sort(
    (a, b) => new Date(b.sharedAt).getTime() - new Date(a.sharedAt).getTime(),
  )

  const formPendingDelete = forms.find((f) => f.id === formToDelete) ?? null
  const formInView = forms.find((f) => f.id === formViewId) ?? null

  return (
    <>
      {/* ── Consent forms ─────────────────────────────────────────────────── */}
      <SectionCard
        title={formsTitle}
        action={
          <Button variant="secondary" size="sm" radius="full" onClick={openAddForm}>
            <CirclePlusIcon />
            Add form
          </Button>
        }
      >
        {forms.length === 0 ? (
          <p className="text-sm text-muted-foreground">No consent forms shared yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-border/60">
            {sortedForms.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                onView={() => viewForm(form)}
                onDelete={() => setFormToDelete(form.id)}
              />
            ))}
          </ul>
        )}
      </SectionCard>

      {/* ── Files (shared library) ────────────────────────────────────────── */}
      <FilesSection initialPreviewFileId={initialPreviewFileId} />

      <ConsentFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        files={files}
        recipientName={recipientName}
        recipientEmail={recipientEmail}
        recipientPhone={recipientPhone}
        initial={editingForm}
        onSubmit={submitForm}
      />

      <FormViewDialog
        form={formInView}
        signerName={recipientName ?? "Client"}
        open={formViewId !== null}
        onOpenChange={(o) => {
          if (!o) setFormViewId(null)
        }}
      />

      <ConfirmDialog
        open={formToDelete !== null}
        onOpenChange={(o) => {
          if (!o) setFormToDelete(null)
        }}
        title="Delete consent form?"
        description={
          formPendingDelete
            ? `"${formPendingDelete.name}" will be permanently removed.`
            : "This action cannot be undone."
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (formToDelete) deleteForm(formToDelete)
          setFormToDelete(null)
        }}
      />
    </>
  )
}
