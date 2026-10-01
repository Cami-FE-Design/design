"use client"

import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  LinkIcon,
  Loader2Icon,
  LockIcon,
  MessageCircleIcon,
  PlayIcon,
  SmartphoneIcon,
  UserPlusIcon,
} from "lucide-react"
import { Fragment, useLayoutEffect, useRef, useState } from "react"

import {
  type IdentityEvent,
  INBOX_TEMPLATES,
  type InboxConversation,
  type InboxMedia,
  type InboxMessage,
} from "@/app/messages/inbox/phase-0/mock"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { Composer } from "./composer"
import { dayKey, dayLabel, formatBytes, type InboxCopy, type Lang, timeLabel } from "./copy"
import { ConversationTitle, MEDIA_ICON, mediaLabel, type PaneStatus } from "./shared"

// ─── Pane 2 — the thread (IX-A1, IX-A2, IX-A5) ────────────────────────────────

/** Keyset page size. The thread endpoint is never offset-paged (contract.md). */
const PAGE_SIZE = 40
/** Stand-in for the round trip of the next keyset page. */
const PAGE_LATENCY_MS = 700
/** Messages from one sender this close together read as one group. */
const GROUP_GAP_MS = 5 * 60_000
/** How long the floating day chip stays after scrolling stops. */
const FLOATING_DAY_MS = 1200

function ThreadHeader({ conversation }: { conversation: InboxConversation }) {
  // Same shell as the Inbox list header (px-4 py-3). The title row is 32px,
  // the search button's height, so the bottom borders line up. One line: the
  // name, or the number when unmatched. No phone line and no search icon.
  return (
    <header className="flex min-w-0 items-center border-b border-border px-4 py-3">
      <h2 className="flex min-h-8 min-w-0 flex-1 items-center">
        <span className="min-w-0 truncate text-base font-semibold text-foreground">
          <ConversationTitle conversation={conversation} />
        </span>
      </h2>
    </header>
  )
}

/** Same treatment as DateSeparator in messages-inbox.tsx: uppercase, small,
 *  muted, centered. No fill and no radius. The words stay (Today, Yesterday,
 *  a weekday); uppercase is the style, not a different label. */
function DayChip({ label }: { label: string }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </span>
  )
}

function ThreadNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center py-1">
      <span className="rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

/** INV-08, in the thread: who linked this chat to whom, and when. A re-match
 *  shows what it replaced; nothing is ever edited away. */
function IdentityLine({
  event,
  copy,
  lang,
}: {
  event: IdentityEvent
  copy: InboxCopy
  lang: Lang
}) {
  const text =
    event.kind === "auto_linked"
      ? copy.eventAutoLinked(event.customerName)
      : event.kind === "matched"
        ? copy.eventMatched(event.customerName, event.actorName)
        : event.kind === "rematched"
          ? copy.eventRematched(
              event.previousCustomerName ?? "",
              event.customerName,
              event.actorName,
            )
          : copy.eventCreated(event.customerName, event.actorName)
  const Icon = event.kind === "created" ? UserPlusIcon : LinkIcon
  return (
    // Centered, no fill and no radius. Day labels use DateSeparator's
    // uppercase treatment; this sentence stays sentence case.
    <div className="mt-3 flex items-center justify-center">
      <span className="inline-flex max-w-[85%] items-center gap-1.5 text-center text-[11px] font-medium text-muted-foreground">
        <Icon className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{text}</span>
        <span aria-hidden>·</span>
        <time dateTime={event.at} className="shrink-0">
          {timeLabel(event.at, lang)}
        </time>
      </span>
    </div>
  )
}

// ─── A message ────────────────────────────────────────────────────────────────

function DeliveryIcon({ message, copy }: { message: InboxMessage; copy: InboxCopy }) {
  if (message.deliveryState === "pending") {
    return <ClockIcon className="size-3" aria-label={copy.sending} />
  }
  if (message.deliveryState === "failed") {
    // The red "Not sent" line under the bubble is the signal. No icon on it.
    return null
  }
  return <CheckIcon className="size-3" aria-label={copy.sent} />
}

/** Time, who sent it and the delivery state, on their own line under the text.
 *  The staff name shows once per group — every message in it is theirs. */
function Meta({
  message,
  showName,
  copy,
  lang,
  onMedia = false,
}: {
  message: InboxMessage
  showName: boolean
  copy: InboxCopy
  lang: Lang
  onMedia?: boolean
}) {
  const isOut = message.direction === "outbound"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap text-[11px] leading-none",
        onMedia
          ? "rounded-full bg-black/45 px-1.5 py-1 text-white"
          : isOut
            ? "text-cami-sage-11"
            : "text-muted-foreground",
      )}
    >
      {showName && message.sentByStaffName ? <span>{message.sentByStaffName} ·</span> : null}
      {message.sentFromPhoneApp ? (
        <span className="inline-flex items-center gap-0.5">
          <SmartphoneIcon className="size-3" aria-hidden />
          {copy.answeredOnPhone} ·
        </span>
      ) : null}
      <time dateTime={message.providerSentAt}>{timeLabel(message.providerSentAt, lang)}</time>
      {isOut && message.origin === "live" ? <DeliveryIcon message={message} copy={copy} /> : null}
    </span>
  )
}

const TONES = [
  "from-cami-violet-4 to-cami-sage-4",
  "from-cami-sage-4 to-cami-yellow-4",
  "from-cami-yellow-4 to-cami-violet-4",
]

/** The stored file, drawn: a real preview when it came from this computer,
 *  otherwise a placeholder standing in for the S3 object. */
function MediaSurface({ media, large = false }: { media: InboxMedia; large?: boolean }) {
  const Icon = MEDIA_ICON[media.kind]
  if (media.previewUrl && media.kind === "image") {
    return (
      // biome-ignore lint/performance/noImgElement: a local object URL, not an optimisable asset
      <img
        src={media.previewUrl}
        alt=""
        className={cn("object-cover", large ? "max-h-[70vh] w-full object-contain" : "size-full")}
      />
    )
  }
  if (media.previewUrl && media.kind === "video") {
    // biome-ignore lint/a11y/useMediaCaption: a prototype preview of the client's own file
    return <video src={media.previewUrl} controls={large} className="size-full object-cover" />
  }
  return (
    <span
      className={cn(
        "flex size-full items-center justify-center bg-gradient-to-br text-cami-gray-11/60",
        TONES[(media.tone ?? 0) % TONES.length],
      )}
    >
      <Icon className={cn("stroke-[1.25]", large ? "size-16" : "size-8")} aria-hidden />
    </span>
  )
}

function MediaTile({
  media,
  copy,
  onOpen,
}: {
  media: InboxMedia
  copy: InboxCopy
  onOpen: () => void
}) {
  if (media.status === "phone_only") {
    // P12: a real state, not an error. Never a broken tile.
    return (
      <div className="flex w-60 items-center gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-3">
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-card text-muted-foreground">
          <SmartphoneIcon className="size-4" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-xs font-medium text-foreground">
            {mediaLabel(media.kind, copy)} · {copy.phoneOnlyTitle}
          </span>
          <span className="text-[11px] leading-snug text-muted-foreground">
            {copy.phoneOnlyBody}
          </span>
        </span>
      </div>
    )
  }
  if (media.kind === "file") {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="flex w-64 items-center gap-3 rounded-lg bg-card/70 p-2.5 text-start ring-1 ring-border/60 transition-colors hover:bg-card"
      >
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-tomato-3 text-tomato-11">
          <FileTextIcon className="size-5" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {media.fileName ?? copy.file}
          </span>
          <span className="text-[11px] text-muted-foreground">{fileMeta(media)}</span>
        </span>
        <DownloadIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`${mediaLabel(media.kind, copy)} · ${copy.openFullSize}`}
      className="relative block aspect-[4/3] w-60 overflow-hidden rounded-lg"
    >
      <MediaSurface media={media} />
      {media.kind === "video" ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-black/45 text-white">
            <PlayIcon className="size-5 translate-x-px fill-current" aria-hidden />
          </span>
        </span>
      ) : null}
    </button>
  )
}

/** "1.2 MB · PDF" */
function fileMeta(media: InboxMedia) {
  const ext =
    media.fileName?.split(".").pop()?.toUpperCase() ??
    media.mimeType.split("/").pop()?.toUpperCase()
  return [media.byteSize ? formatBytes(media.byteSize) : null, ext].filter(Boolean).join(" · ")
}

/** IX-A6 row 1: tap for full size. */
function MediaViewer({
  open,
  media,
  message,
  copy,
  lang,
  onOpenChange,
}: {
  open: boolean
  media: InboxMedia | null
  message: InboxMessage | null
  copy: InboxCopy
  lang: Lang
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir={lang === "ar" ? "rtl" : "ltr"} className="gap-4 p-4 pt-4 sm:max-w-3xl">
        {media && message ? (
          <>
            <div className="flex items-center gap-2 pe-8">
              <DialogTitle className="truncate text-sm font-medium">
                {media.fileName ?? mediaLabel(media.kind, copy)}
              </DialogTitle>
              <span className="text-xs text-muted-foreground">
                · {message.sentByStaffName ?? (message.direction === "inbound" ? "" : copy.you)}{" "}
                {timeLabel(message.providerSentAt, lang)}
              </span>
            </div>
            {media.kind === "file" ? (
              <div className="flex flex-col items-center gap-3 rounded-xl bg-muted/40 py-16">
                <FileTextIcon className="size-12 stroke-[1.25] text-muted-foreground" aria-hidden />
                <span className="text-sm text-muted-foreground">{fileMeta(media)}</span>
              </div>
            ) : (
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <MediaSurface media={media} large />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" radius="full" className="gap-1.5">
                <DownloadIcon className="size-4" aria-hidden />
                {copy.download}
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/** IX-A5: the failure sits inside the bubble, on the line under the text.
 *  No retry and no template button. A closed window still offers templates
 *  from the composer. */
function FailedLine({
  message,
  copy,
  lang,
}: {
  message: InboxMessage
  copy: InboxCopy
  lang: Lang
}) {
  const reason = copy.failure[message.failureCode ?? "UNKNOWN"] ?? copy.failure.UNKNOWN
  return (
    <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-tomato-11">
      <AlertCircleIcon className="size-3.5 shrink-0" aria-hidden />
      <span>
        {copy.notSent} · {reason}
      </span>
      <time dateTime={message.providerSentAt} className="shrink-0">
        {timeLabel(message.providerSentAt, lang)}
      </time>
    </p>
  )
}

function MessageBubble({
  message,
  firstInGroup,
  lastInGroup,
  copy,
  lang,
  onOpenMedia,
}: {
  message: InboxMessage
  firstInGroup: boolean
  lastInGroup: boolean
  copy: InboxCopy
  lang: Lang
  onOpenMedia: (media: InboxMedia) => void
}) {
  const isOut = message.direction === "outbound"
  const failed = isOut && message.deliveryState === "failed"
  const template = message.templateCode
    ? INBOX_TEMPLATES.find((t) => t.code === message.templateCode)
    : null
  const hasMedia = !!message.media?.length
  const meta = (onMedia = false) => (
    <Meta message={message} showName={lastInGroup} copy={copy} lang={lang} onMedia={onMedia} />
  )

  return (
    <div
      className={cn(
        "flex flex-col gap-1",
        isOut ? "items-end" : "items-start",
        firstInGroup ? "mt-3" : "mt-0.5",
      )}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-lg shadow-sm",
          // Failed uses tomato-3, the same step as the outgoing sage fill.
          failed
            ? "bg-tomato-3 text-tomato-12"
            : isOut
              ? "bg-cami-sage-3 text-cami-sage-12"
              : "bg-card text-foreground",
          hasMedia ? "p-1" : "px-3 py-1.5",
        )}
      >
        {template ? (
          <span
            className={cn(
              "flex items-center gap-1 pb-0.5 text-[11px] font-medium opacity-80",
              hasMedia && "px-2 pt-1",
            )}
          >
            <FileTextIcon className="size-3" aria-hidden />
            {copy.templateLabel(template.name)}
          </span>
        ) : null}
        {message.media?.map((m) => (
          <div key={m.publicId} className="relative">
            <MediaTile media={m} copy={copy} onOpen={() => onOpenMedia(m)} />
            {!failed && !message.body && m.status !== "phone_only" && m.kind !== "file" ? (
              <span className="absolute inset-e-1.5 bottom-1.5">{meta(true)}</span>
            ) : null}
          </div>
        ))}
        {message.body ? (
          // Name and time sit on the next line, clear of the message.
          // A failed send uses that line for the warning instead.
          <div className={cn(hasMedia && "px-2 pt-1 pb-0.5")}>
            <p dir="auto" className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.body}
            </p>
            {failed ? (
              <FailedLine message={message} copy={copy} lang={lang} />
            ) : (
              <div className="mt-1 flex justify-end">{meta()}</div>
            )}
          </div>
        ) : hasMedia &&
          message.media?.every((m) => m.status === "phone_only" || m.kind === "file") ? (
          <span className="flex justify-end px-2 pt-1 pb-0.5">
            {failed ? <FailedLine message={message} copy={copy} lang={lang} /> : meta()}
          </span>
        ) : failed ? (
          <div className={cn(hasMedia && "px-2 pt-1 pb-0.5")}>
            <FailedLine message={message} copy={copy} lang={lang} />
          </div>
        ) : null}
      </div>
    </div>
  )
}

// ─── The list of messages ─────────────────────────────────────────────────────

/** Same sender, same day, close together: one group. */
function continues(prev: InboxMessage | undefined, m: InboxMessage) {
  if (!prev) return false
  return (
    prev.direction === m.direction &&
    prev.sentByStaffName === m.sentByStaffName &&
    prev.sentFromPhoneApp === m.sentFromPhoneApp &&
    dayKey(prev.providerSentAt) === dayKey(m.providerSentAt) &&
    Date.parse(m.providerSentAt) - Date.parse(prev.providerSentAt) < GROUP_GAP_MS
  )
}

function MessageList({
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
  const { messages } = conversation
  const scrollRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [loadingEarlier, setLoadingEarlier] = useState(false)
  // While scrolling, the day of the topmost message floats over the thread, so
  // six months never loses its place; it fades once scrolling stops.
  const [floatingDay, setFloatingDay] = useState<string | null>(null)
  const floatTimer = useRef<number | null>(null)
  // Scroll bookkeeping: how tall the list was before a page was prepended, and
  // how many messages there were, so a new message at the end scrolls into view.
  const heightBeforePrepend = useRef<number | null>(null)
  const lastLength = useRef(messages.length)
  const [viewing, setViewing] = useState<{ media: InboxMedia; message: InboxMessage } | null>(null)

  const start = Math.max(0, messages.length - visible)
  const shown = messages.slice(start)
  const reachedStart = start === 0

  // Jumps the code makes — opening at the newest message, following a new one —
  // are not the reader scrolling, so they must not flash the floating day.
  const codeScrolled = useRef(false)

  // Open at the newest message.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el) return
    codeScrolled.current = true
    el.scrollTop = el.scrollHeight
  }, [])

  // Keep the reader's place when an older page lands above them.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs after each page is prepended
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || heightBeforePrepend.current === null) return
    el.scrollTop += el.scrollHeight - heightBeforePrepend.current
    heightBeforePrepend.current = null
  }, [visible])

  // Follow a new message at the end.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && messages.length > lastLength.current) {
      codeScrolled.current = true
      el.scrollTop = el.scrollHeight
    }
    lastLength.current = messages.length
  }, [messages.length])

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    if (codeScrolled.current) {
      codeScrolled.current = false
      return
    }

    // The last day header that has scrolled above the top edge names the day in view.
    let current: string | null = null
    for (const h of el.querySelectorAll<HTMLElement>("[data-day]")) {
      if (h.offsetTop - el.scrollTop < 4) current = h.dataset.day ?? null
      else break
    }
    setFloatingDay(current)
    if (floatTimer.current) window.clearTimeout(floatTimer.current)
    floatTimer.current = window.setTimeout(() => setFloatingDay(null), FLOATING_DAY_MS)

    if (loadingEarlier || reachedStart || el.scrollTop > 120) return
    setLoadingEarlier(true)
    window.setTimeout(() => {
      heightBeforePrepend.current = scrollRef.current?.scrollHeight ?? null
      setVisible((v) => v + PAGE_SIZE)
      setLoadingEarlier(false)
    }, PAGE_LATENCY_MS)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-2 z-10 flex justify-center transition-opacity duration-300",
          floatingDay ? "opacity-100" : "opacity-0",
        )}
      >
        {floatingDay ? <DayChip label={floatingDay} /> : null}
      </div>
      <div
        ref={scrollRef}
        onScroll={onScroll}
        role="log"
        aria-label={copy.messageLog}
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-sand-2 px-5 pt-2 pb-4"
      >
        {reachedStart ? (
          messages[0]?.origin === "history_import" ? (
            <ThreadNote>{copy.historyStart}</ThreadNote>
          ) : null
        ) : (
          <div className="flex h-8 shrink-0 items-center justify-center gap-2 text-xs text-muted-foreground">
            {loadingEarlier ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
                {copy.loadingEarlier}
              </>
            ) : null}
          </div>
        )}
        {shown.map((m, i) => {
          const prev = shown[i - 1]
          const next = shown[i + 1]
          const newDay = !prev || dayKey(prev.providerSentAt) !== dayKey(m.providerSentAt)
          const label = dayLabel(m.providerSentAt, now, lang)
          // Identity lines that happened after the previous message, up to this one.
          const after =
            prev?.providerSentAt ?? (reachedStart ? "" : messages[start - 1]!.providerSentAt)
          const lines = conversation.events.filter((e) => e.at > after && e.at <= m.providerSentAt)
          return (
            <Fragment key={m.publicId}>
              {newDay ? (
                <div data-day={label} className="mt-4 flex items-center justify-center py-1">
                  <DayChip label={label} />
                </div>
              ) : null}
              {lines.map((e) => (
                <IdentityLine key={e.publicId} event={e} copy={copy} lang={lang} />
              ))}
              <MessageBubble
                message={m}
                firstInGroup={newDay || lines.length > 0 || !continues(prev, m)}
                lastInGroup={!next || !continues(m, next)}
                copy={copy}
                lang={lang}
                onOpenMedia={(media) => setViewing({ media, message: m })}
              />
            </Fragment>
          )
        })}
        {conversation.events
          .filter((e) => e.at > (shown[shown.length - 1]?.providerSentAt ?? ""))
          .map((e) => (
            <IdentityLine key={e.publicId} event={e} copy={copy} lang={lang} />
          ))}
      </div>
      <MediaViewer
        open={viewing !== null}
        media={viewing?.media ?? null}
        message={viewing?.message ?? null}
        copy={copy}
        lang={lang}
        onOpenChange={(open) => {
          if (!open) setViewing(null)
        }}
      />
    </div>
  )
}

function ThreadSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-hidden>
      <div className="flex flex-col gap-2 border-b border-border px-5 py-3">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex flex-1 flex-col justify-end gap-3 bg-sand-2 px-5 py-4">
        {["w-52", "w-64 self-end", "w-40", "w-72 self-end", "w-48"].map((w) => (
          <Skeleton key={w} className={cn("h-10 rounded-lg", w)} />
        ))}
      </div>
    </div>
  )
}

export function Thread({
  status,
  conversation,
  now,
  onSendText,
  onSendTemplate,
  onMatch,
  onRetry,
  canReply,
  noChats = false,
  copy,
  lang,
}: {
  status: PaneStatus
  conversation: InboxConversation | null
  now: number
  onSendText: (body: string, media: InboxMedia[]) => void
  onSendTemplate: (templateCode: string, body: string) => void
  onMatch: () => void
  onRetry: () => void
  /** inbox:reply. Without it the chat reads normally and nothing can be sent. */
  canReply: boolean
  /** The inbox has no chats at all — nothing to select, so don't ask to. */
  noChats?: boolean
  copy: InboxCopy
  lang: Lang
}) {
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {status === "loading" ? (
        <ThreadSkeleton />
      ) : status === "error" ? (
        <EmptyState
          className="flex-1"
          icon={AlertTriangleIcon}
          title={copy.threadErrorTitle}
          description={copy.errorBody}
          action={
            <Button variant="outline" size="sm" radius="full" onClick={onRetry}>
              {copy.retry}
            </Button>
          }
        />
      ) : !conversation ? (
        <EmptyState
          className="flex-1"
          icon={MessageCircleIcon}
          title={noChats ? copy.noChatOpenTitle : copy.selectChat}
          description={noChats ? copy.noChatOpenBody : undefined}
        />
      ) : (
        <>
          <ThreadHeader conversation={conversation} />
          <MessageList
            key={conversation.publicId}
            conversation={conversation}
            now={now}
            copy={copy}
            lang={lang}
          />
          {canReply ? (
            <Composer
              key={`composer-${conversation.publicId}`}
              conversation={conversation}
              now={now}
              copy={copy}
              lang={lang}
              onSendText={onSendText}
              onSendTemplate={onSendTemplate}
              onMatch={onMatch}
            />
          ) : (
            <div className="flex items-start gap-3 border-t border-border bg-sand-2 px-5 py-4 text-sm">
              <LockIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="flex flex-col gap-0.5">
                <p className="font-medium text-foreground">{copy.readOnlyTitle}</p>
                <p className="text-muted-foreground">{copy.readOnlyBody}</p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
