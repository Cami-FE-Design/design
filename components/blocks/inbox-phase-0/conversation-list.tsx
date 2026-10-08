"use client"

import { AlertCircleIcon, AlertTriangleIcon, MessageCircleIcon } from "lucide-react"
import { useMemo } from "react"

import { CURRENT_STAFF, type InboxConversation } from "@/app/messages/inbox/phase-0/mock"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { type InboxCopy, type Lang, listTimeLabel } from "./copy"
import {
  ConversationAvatar,
  ConversationTitle,
  customerName,
  type PaneStatus,
  previewOf,
} from "./shared"

// ─── Pane 1 — the chat list (IX-A1) ───────────────────────────────────────────
// One row per number (IX-A1 row 3), newest first by `lastMessageAt`. A number
// with no client shows the number and the unmatched marker (IX-C3 row 1) — it
// is never hidden and never blocked.

function ConversationRow({
  conversation,
  selected,
  onSelect,
  copy,
  lang,
  now,
}: {
  conversation: InboxConversation
  selected: boolean
  onSelect: () => void
  copy: InboxCopy
  lang: Lang
  now: number
}) {
  const last = conversation.messages[conversation.messages.length - 1]!
  const preview = previewOf(last, copy)
  const lastFailed = last.direction === "outbound" && last.deliveryState === "failed"
  const who =
    last.direction === "outbound"
      ? last.sentByStaffName === CURRENT_STAFF
        ? copy.you
        : last.sentByStaffName
      : null
  const PreviewIcon = preview.icon

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "relative flex w-full items-start gap-3 px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cami-violet-8",
          // Active is bg-accent (sand-3). Unselected hover is the next
          // darker neutral, sand-4, as an opaque fill. &:hover is not gated
          // on @media (hover: hover), so it still paints on this machine.
          selected
            ? "bg-accent text-accent-foreground"
            : "bg-white-a11 [&:hover]:bg-sand-4 hover:text-foreground dark:[&:hover]:bg-white-a2",
        )}
      >
        <span className="relative inline-flex shrink-0">
          <ConversationAvatar conversation={conversation} unmatchedLabel={copy.unmatched} />
          {/* Not sent sits on the avatar. Unmatched is already its own avatar,
              so a failed unmatched row is not marked a second time. */}
          {lastFailed && customerName(conversation) ? (
            <span
              className="absolute -bottom-0.5 -end-0.5 flex size-4 items-center justify-center rounded-full bg-card text-tomato-11 ring-2 ring-card"
              title={copy.notSent}
            >
              <AlertCircleIcon className="size-3.5" aria-hidden />
              <span className="sr-only">{copy.notSent}</span>
            </span>
          ) : null}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              <ConversationTitle conversation={conversation} />
            </span>
            <span className="flex-1" />
            <span className="shrink-0 text-xs text-muted-foreground">
              {listTimeLabel(conversation.lastMessageAt, now, lang)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted-foreground">
              {PreviewIcon ? <PreviewIcon className="size-3.5 shrink-0" aria-hidden /> : null}
              {who ? <span className="shrink-0">{`${who}:`}</span> : null}
              {/* The message follows its own direction: English stays LTR inside
                  the Arabic UI, so it truncates at its end, not its start. */}
              <span className="min-w-0 truncate" dir="auto">
                {preview.text}
              </span>
            </span>
          </div>
        </div>
      </button>
    </li>
  )
}

function ListSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden>
      {["a", "b", "c", "d", "e", "f", "g"].map((k, i) => (
        <div key={k} className="flex items-start gap-3 px-4 py-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-2 pt-0.5">
            <div className="flex justify-between gap-6">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className={cn("h-3", i % 2 ? "w-40" : "w-32")} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ConversationList({
  status,
  conversations,
  selectedId,
  onSelect,
  onRetry,
  copy,
  lang,
  now,
  className,
}: {
  status: PaneStatus
  conversations: InboxConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRetry: () => void
  copy: InboxCopy
  lang: Lang
  now: number
  className?: string
}) {
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    [conversations],
  )

  return (
    <aside
      aria-label={copy.chatList}
      className={cn(
        "flex w-72 max-w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center border-b border-border px-4 py-3">
        <h1 className="flex min-h-9 min-w-0 flex-1 items-center truncate text-base font-semibold text-foreground">
          {copy.inbox}
        </h1>
      </div>
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto bg-sand-3">
        {status === "loading" ? (
          <ListSkeleton />
        ) : status === "error" ? (
          <EmptyState
            className="flex-1"
            icon={AlertTriangleIcon}
            title={copy.listErrorTitle}
            description={copy.errorBody}
            action={
              <Button variant="outline" size="sm" radius="full" onClick={onRetry}>
                {copy.retry}
              </Button>
            }
          />
        ) : status === "empty" ? (
          <EmptyState
            className="flex-1"
            icon={MessageCircleIcon}
            title={copy.listEmptyTitle}
            description={copy.listEmptyBody}
          />
        ) : (
          <ul>
            {sorted.map((c) => (
              <ConversationRow
                key={c.publicId}
                conversation={c}
                selected={c.publicId === selectedId}
                onSelect={() => onSelect(c.publicId)}
                copy={copy}
                lang={lang}
                now={now}
              />
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
