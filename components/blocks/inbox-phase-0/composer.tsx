"use client"

import {
  CheckIcon,
  ClockIcon,
  CopyIcon,
  FileTextIcon,
  LinkIcon,
  LockIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

import {
  checkMedia,
  INBOX_TEMPLATES,
  type InboxConversation,
  type InboxMedia,
  type InboxTemplate,
  type MediaCheck,
  type TemplateBlank,
} from "@/app/messages/inbox/phase-0/mock"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  dayLabel,
  formatBytes,
  formatLeft,
  type InboxCopy,
  type Lang,
  timeLabel,
  whenLabel,
} from "./copy"
import { MEDIA_ICON } from "./shared"

// ─── The composer (IX-A2 open window, IX-A4 closed window) ────────────────────
// One source for the window: `conversation.windowClosesAt`, which the backend
// computes (24 h after the client's last message, or the moment WhatsApp
// rejected a send as outside it). There is never a second countdown.

/** The countdown is quiet while there is time, and raises its voice near the
 *  end: amber under two hours, red in the last ten minutes. IX-A2 row 2 only
 *  needs it visible before typing — not loud for 22 of the 24 hours. */
const CLOSING_SOON_MS = 2 * 60 * 60_000
const CLOSING_NOW_MS = 10 * 60_000

// ─── Template filling (IX-A4 rows 2–3) ────────────────────────────────────────

type Segment = { text: string } | { blank: TemplateBlank; value: string | null }

/** Template bodies are in the template's language (en), whatever the UI language. */
function fillTemplate(t: InboxTemplate, c: InboxConversation, now: number): Segment[] {
  const booking = c.customer?.nextBooking ?? null
  const values: Record<TemplateBlank, string | null> = {
    first_name: c.customer?.firstName ?? null,
    service: booking?.service ?? null,
    booking_date: booking ? dayLabel(booking.at, now, "en") : null,
    booking_time: booking ? timeLabel(booking.at, "en") : null,
  }
  return t.body.split(/(\{\{\w+\}\})/).map((part) => {
    const m = part.match(/^\{\{(\w+)\}\}$/)
    if (!m) return { text: part }
    const blank = m[1] as TemplateBlank
    return { blank, value: values[blank] }
  })
}

const blanksOf = (segments: Segment[]) =>
  segments.flatMap((s) => ("blank" in s && s.value === null ? [s.blank] : []))

const render = (segments: Segment[]) =>
  segments.map((s) => ("text" in s ? s.text : (s.value ?? ""))).join("")

function TemplateBody({ segments, copy }: { segments: Segment[]; copy: InboxCopy }) {
  return (
    <p dir="ltr" className="text-start text-sm leading-relaxed text-foreground">
      {segments.map((s, i) =>
        "text" in s ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and never reorder
          <span key={i}>{s.text}</span>
        ) : s.value !== null ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and never reorder
          <mark key={i} className="rounded-sm bg-cami-violet-3 px-0.5 text-cami-violet-11">
            {s.value}
          </mark>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are positional and never reorder
          <mark key={i} className="rounded-sm bg-tomato-3 px-0.5 font-medium text-tomato-11">
            [{copy.blank[s.blank]}]
          </mark>
        ),
      )}
    </p>
  )
}

function TemplatePicker({
  conversation,
  now,
  copy,
  onPick,
  trigger,
}: {
  conversation: InboxConversation
  now: number
  copy: InboxCopy
  onPick: (t: InboxTemplate) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-96 gap-2 p-2">
        <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
          {copy.templatesHeading}
        </p>
        <ul className="flex flex-col">
          {/* Asking for a name only makes sense when we don't have one. */}
          {INBOX_TEMPLATES.filter((t) => t.code !== "ask_name" || !conversation.customer).map(
            (t) => {
              const segments = fillTemplate(t, conversation, now)
              return (
                <li key={t.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(t)
                      setOpen(false)
                    }}
                    className="flex w-full flex-col gap-1 rounded-lg px-2 py-2 text-start hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{t.name}</span>
                      <span className="rounded bg-muted px-1 text-[10px] font-medium uppercase text-muted-foreground">
                        {t.language}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-xs text-muted-foreground" dir="ltr">
                      {segments.map((s) =>
                        "text" in s ? s.text : (s.value ?? `[${copy.blank[s.blank]}]`),
                      )}
                    </span>
                  </button>
                </li>
              )
            },
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

function TemplateDraft({
  template,
  conversation,
  now,
  copy,
  onChange,
  onRemove,
  onSend,
  onMatch,
}: {
  template: InboxTemplate
  conversation: InboxConversation
  now: number
  copy: InboxCopy
  onChange: (t: InboxTemplate) => void
  onRemove: () => void
  onSend: (body: string) => void
  onMatch: () => void
}) {
  const segments = fillTemplate(template, conversation, now)
  const blanks = blanksOf(segments)
  const unmatchedName = blanks.includes("first_name") && !conversation.customer
  const bookingBlank = blanks.some((b) => b !== "first_name")
  const uniqueBlanks = [...new Set(blanks)]
  const names = uniqueBlanks.map((b) => copy.blank[b])
  // "service, booking date and booking time" — commas, then "and" before the last.
  const blankList =
    names.length > 1
      ? `${names.slice(0, -1).join(", ")}${copy.and}${names.at(-1)}`
      : (names[0] ?? "")

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <FileTextIcon className="size-4 text-muted-foreground" aria-hidden />
        <span className="text-xs font-medium text-foreground">
          {copy.templateLabel(template.name)}
        </span>
        <div className="ms-auto flex items-center gap-1">
          <TemplatePicker
            conversation={conversation}
            now={now}
            copy={copy}
            onPick={onChange}
            trigger={
              <Button type="button" variant="ghost" size="sm" radius="full">
                {copy.changeTemplate}
              </Button>
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label={copy.removeTemplate}
            onClick={onRemove}
          >
            <XIcon className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
      <TemplateBody segments={segments} copy={copy} />
      {blanks.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl bg-tomato-2 p-3 text-sm text-foreground">
          <p className="font-medium text-tomato-11">
            {copy.blankBlocked(blankList, uniqueBlanks.length)}
          </p>
          {unmatchedName ? <p>{copy.blankUnmatched}</p> : null}
          {bookingBlank && conversation.customer ? (
            <p>{copy.blankNoBooking(conversation.customer.firstName)}</p>
          ) : null}
          {unmatchedName ? (
            <Button
              type="button"
              size="sm"
              radius="full"
              variant="outline"
              className="gap-1.5 self-start"
              onClick={onMatch}
            >
              <LinkIcon className="size-3.5" aria-hidden />
              {copy.match}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="button"
          radius="full"
          className="gap-1.5"
          disabled={blanks.length > 0}
          onClick={() => onSend(render(segments))}
        >
          <SendIcon className="size-4 rtl:-scale-x-100" aria-hidden />
          {copy.sendTemplate}
        </Button>
      </div>
    </div>
  )
}

// ─── Attachments (IX-A6 row 2, "file type WhatsApp rejects") ──────────────────

type Attachment = { id: string; file: File; check: MediaCheck; previewUrl?: string }

function toAttachment(file: File): Attachment {
  const check = checkMedia(file)
  const previewable = check.ok && (check.kind === "image" || check.kind === "video")
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`,
    file,
    check,
    previewUrl: previewable ? URL.createObjectURL(file) : undefined,
  }
}

function AttachmentChip({
  attachment,
  copy,
  onRemove,
}: {
  attachment: Attachment
  copy: InboxCopy
  onRemove: () => void
}) {
  const { file, check, previewUrl } = attachment
  const Icon = MEDIA_ICON[check.kind ?? "file"]
  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : file.type || file.name
  return (
    <div
      className={cn(
        "flex max-w-full items-center gap-2 rounded-xl p-1.5 pe-2 ring-1",
        check.ok ? "bg-muted/40 ring-border/60" : "bg-tomato-2 ring-tomato-6",
      )}
    >
      <span className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card text-muted-foreground">
        {previewUrl && check.ok && check.kind === "image" ? (
          // biome-ignore lint/performance/noImgElement: a local object URL, not an optimisable asset
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon className="size-4" aria-hidden />
        )}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-xs font-medium text-foreground">{file.name}</span>
        <span className={cn("text-[11px]", check.ok ? "text-muted-foreground" : "text-tomato-11")}>
          {check.ok
            ? formatBytes(file.size)
            : check.reason === "type"
              ? copy.rejectedType(ext)
              : copy.rejectedSize(formatBytes(check.maxBytes ?? 0))}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        radius="full"
        aria-label={`${copy.removeAttachment} ${file.name}`}
        onClick={onRemove}
      >
        <XIcon className="size-3.5" aria-hidden />
      </Button>
    </div>
  )
}

// ─── The two states of the window ─────────────────────────────────────────────

function WindowOpenBar({
  closesAt,
  lastInboundAt,
  now,
  copy,
  lang,
}: {
  closesAt: number
  lastInboundAt: string | null
  now: number
  copy: InboxCopy
  lang: Lang
}) {
  const left = closesAt - now
  const tone = left < CLOSING_NOW_MS ? "now" : left < CLOSING_SOON_MS ? "soon" : "calm"
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-t-2xl px-4 py-2 text-xs",
        tone === "now"
          ? "bg-tomato-2 text-tomato-11"
          : tone === "soon"
            ? "bg-cami-yellow-2 text-cami-yellow-11"
            : "border-b border-border/60 text-muted-foreground",
      )}
    >
      <span className={cn("inline-flex items-center gap-1.5", tone !== "calm" && "font-medium")}>
        <ClockIcon className="size-3.5" aria-hidden />
        {/* Not a live region: a minute-by-minute announcement is noise. The
            change a screen reader must hear is the close, and that swaps the
            whole composer for the closed notice. */}
        <span>{copy.windowOpen(formatLeft(left, lang))}</span>
      </span>
      {lastInboundAt ? (
        <span className="ms-auto text-muted-foreground">
          {copy.clientLastWrote(whenLabel(lastInboundAt, now, lang))}
        </span>
      ) : null}
    </div>
  )
}

function ClosedNotice({
  conversation,
  now,
  copy,
  lang,
}: {
  conversation: InboxConversation
  now: number
  copy: InboxCopy
  lang: Lang
}) {
  const closesAt = conversation.windowClosesAt ? Date.parse(conversation.windowClosesAt) : null
  // Closed by WhatsApp before Cami's 24 h ran out: the provider's word is final.
  const byProvider =
    closesAt !== null &&
    conversation.lastInboundAt !== null &&
    closesAt < Date.parse(conversation.lastInboundAt) + 24 * 60 * 60_000 - 1000
  return (
    <div className="flex gap-3 rounded-xl bg-cami-yellow-2 p-3 text-sm text-foreground">
      <LockIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium">{copy.windowClosedTitle}</p>
        <p className="text-muted-foreground">
          {byProvider || !conversation.lastInboundAt
            ? copy.providerClosedBody
            : copy.windowClosedBody(whenLabel(conversation.lastInboundAt, now, lang))}
        </p>
      </div>
    </div>
  )
}

function KeptDraft({
  draft,
  closedAt,
  now,
  copy,
  lang,
  onDiscard,
}: {
  draft: string
  closedAt: string | null
  now: number
  copy: InboxCopy
  lang: Lang
  onDiscard: () => void
}) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-dashed border-border bg-card p-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{copy.draftKeptTitle}</p>
        {closedAt ? (
          <p className="text-xs text-muted-foreground">
            {copy.draftKeptBody(whenLabel(closedAt, now, lang))}
          </p>
        ) : null}
      </div>
      <p
        className="whitespace-pre-wrap rounded-lg bg-muted/50 px-3 py-2 text-sm text-foreground"
        dir="auto"
      >
        {draft}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          radius="full"
          className="gap-1.5"
          onClick={() => {
            void navigator.clipboard?.writeText(draft)
            setCopied(true)
          }}
        >
          {copied ? (
            <CheckIcon className="size-3.5" aria-hidden />
          ) : (
            <CopyIcon className="size-3.5" aria-hidden />
          )}
          {copied ? copy.copied : copy.copyText}
        </Button>
        <Button type="button" variant="ghost" size="sm" radius="full" onClick={onDiscard}>
          {copy.discard}
        </Button>
      </div>
    </div>
  )
}

export function Composer({
  conversation,
  now,
  copy,
  lang,
  onSendText,
  onSendTemplate,
  onMatch,
}: {
  conversation: InboxConversation
  now: number
  copy: InboxCopy
  lang: Lang
  onSendText: (body: string, media: InboxMedia[]) => void
  onSendTemplate: (templateCode: string, body: string) => void
  onMatch: () => void
}) {
  const [draft, setDraft] = useState("")
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInput = useRef<HTMLInputElement>(null)
  const rejected = attachments.some((a) => !a.check.ok)
  const [template, setTemplate] = useState<InboxTemplate | null>(null)
  const [isMac, setIsMac] = useState(false)
  useEffect(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)), [])

  const closesAt = conversation.windowClosesAt ? Date.parse(conversation.windowClosesAt) : null
  const open = closesAt !== null && now < closesAt

  // The client wrote again: the window reopened, so a template picked while it
  // was closed is no longer the only way. The typed text is untouched.
  useEffect(() => {
    if (open) setTemplate(null)
  }, [open])

  function send() {
    const body = draft.trim()
    if ((!body && attachments.length === 0) || !open || rejected) return
    // WhatsApp sends each file as its own message; the text rides as the first
    // one's caption.
    onSendText(
      body,
      attachments.map((a) => ({
        publicId: a.id,
        kind: a.check.ok ? a.check.kind : "file",
        mimeType: a.file.type,
        fileName: a.file.name,
        byteSize: a.file.size,
        status: "synced",
        previewUrl: a.previewUrl,
      })),
    )
    setDraft("")
    setAttachments([])
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const gone = prev.find((a) => a.id === id)
      if (gone?.previewUrl) URL.revokeObjectURL(gone.previewUrl)
      return prev.filter((a) => a.id !== id)
    })
  }

  if (open) {
    return (
      <div className="border-t border-border bg-sand-2 px-4 py-3">
        <div className="rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:border-cami-violet-7 focus-within:shadow-md">
          <WindowOpenBar
            closesAt={closesAt}
            lastInboundAt={conversation.lastInboundAt}
            now={now}
            copy={copy}
            lang={lang}
          />
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault()
                send()
              }
            }}
            rows={2}
            dir="auto"
            aria-label={copy.composerPlaceholder}
            placeholder={copy.composerPlaceholder}
            className="min-h-[52px] resize-none border-0 bg-transparent px-4 pt-3 text-sm leading-relaxed shadow-none focus-visible:ring-0"
          />
          {attachments.length > 0 ? (
            <div className="flex flex-col gap-2 px-3 pb-1">
              <div className="flex flex-wrap gap-2">
                {attachments.map((a) => (
                  <AttachmentChip
                    key={a.id}
                    attachment={a}
                    copy={copy}
                    onRemove={() => removeAttachment(a.id)}
                  />
                ))}
              </div>
              {rejected ? <p className="text-xs text-tomato-11">{copy.removeRejected}</p> : null}
            </div>
          ) : null}
          <div className="flex items-center gap-2 px-2 pb-2">
            <input
              ref={fileInput}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files ?? [])
                setAttachments((prev) => [...prev, ...files.map(toAttachment)])
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              radius="full"
              aria-label={copy.attach}
              title={copy.attach}
              onClick={() => fileInput.current?.click()}
            >
              <PaperclipIcon className="size-4" aria-hidden />
            </Button>
            <span className="ms-auto text-[11px] text-muted-foreground">
              {isMac ? copy.shortcutHintMac : copy.shortcutHint}
            </span>
            <Button
              type="button"
              radius="full"
              className="gap-1.5"
              disabled={(!draft.trim() && attachments.length === 0) || rejected}
              onClick={send}
            >
              <SendIcon className="size-4 rtl:-scale-x-100" aria-hidden />
              {copy.send}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Closed: free typing is not offered (IX-A4 row 4). Anything typed before it
  // closed is kept, never sent and never thrown away (IX-A2 edge case).
  return (
    <div className="flex flex-col gap-2 border-t border-border bg-sand-2 px-4 py-3">
      <ClosedNotice conversation={conversation} now={now} copy={copy} lang={lang} />
      {draft.trim() ? (
        <KeptDraft
          draft={draft}
          closedAt={conversation.windowClosesAt}
          now={now}
          copy={copy}
          lang={lang}
          onDiscard={() => setDraft("")}
        />
      ) : null}
      {template ? (
        <TemplateDraft
          template={template}
          conversation={conversation}
          now={now}
          copy={copy}
          onChange={setTemplate}
          onRemove={() => setTemplate(null)}
          onMatch={onMatch}
          onSend={(body) => {
            onSendTemplate(template.code, body)
            setTemplate(null)
          }}
        />
      ) : (
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
          <Textarea
            disabled
            rows={1}
            aria-label={copy.composerPlaceholder}
            placeholder={copy.typingBlocked}
            className="min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm shadow-none disabled:cursor-not-allowed"
          />
          <TemplatePicker
            conversation={conversation}
            now={now}
            copy={copy}
            onPick={setTemplate}
            trigger={
              <Button type="button" radius="full" className="shrink-0 gap-1.5">
                <FileTextIcon className="size-4" aria-hidden />
                {copy.chooseTemplate}
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
