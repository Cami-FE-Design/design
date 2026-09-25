"use client"

import { AlertCircleIcon, AlertTriangleIcon, MessageCircleIcon, SearchXIcon } from "lucide-react"
import { useMemo, useState } from "react"

import { CURRENT_STAFF, type InboxConversation } from "@/app/messages/inbox/phase-0/mock"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { type InboxCopy, type Lang, listTimeLabel } from "./copy"
import {
  ConversationAvatar,
  ConversationTitle,
  customerName,
  type PaneStatus,
  previewOf,
  UnmatchedPill,
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
  const PreviewIcon = lastFailed ? AlertCircleIcon : preview.icon

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "relative flex w-full items-start gap-3 border-b border-border/50 px-4 py-3 text-start transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cami-violet-8",
          selected ? "bg-cami-violet-3/50" : "hover:bg-muted/40",
        )}
      >
        {selected ? (
          <span
            className="absolute inset-y-1 start-0 w-[3px] rounded-e-full bg-cami-violet-9"
            aria-hidden
          />
        ) : null}
        <ConversationAvatar conversation={conversation} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm text-foreground",
                conversation.unreadCount > 0 ? "font-semibold" : "font-medium",
              )}
            >
              <ConversationTitle conversation={conversation} />
            </span>
            <span className="flex-1" />
            <span
              className={cn(
                "shrink-0 text-xs",
                conversation.unreadCount > 0
                  ? "font-medium text-cami-violet-11"
                  : "text-muted-foreground",
              )}
            >
              {listTimeLabel(conversation.lastMessageAt, now, lang)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* Unmatched, the number is the chat's only identity, so it never
                truncates: the marker sits here and the preview gives way. */}
            {!conversation.customer ? <UnmatchedPill copy={copy} /> : null}
            <span
              className={cn(
                "flex min-w-0 flex-1 items-center gap-1 text-xs",
                lastFailed ? "text-tomato-11" : "text-muted-foreground",
              )}
            >
              {PreviewIcon ? <PreviewIcon className="size-3.5 shrink-0" aria-hidden /> : null}
              {lastFailed || who ? (
                <span className="shrink-0">{lastFailed ? `${copy.notSent} ·` : `${who}:`}</span>
              ) : null}
              {/* The message follows its own direction: English stays LTR inside
                  the Arabic UI, so it truncates at its end, not its start. */}
              <span className="min-w-0 truncate" dir="auto">
                {preview.text}
              </span>
            </span>
            {conversation.unreadCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cami-violet-9 px-1.5 text-[11px] font-semibold text-white">
                <span aria-hidden>{conversation.unreadCount}</span>
                <span className="sr-only">{copy.unreadCount(conversation.unreadCount)}</span>
              </span>
            ) : null}
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
        <div key={k} className="flex items-start gap-3 border-b border-border/50 px-4 py-3">
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
}: {
  status: PaneStatus
  conversations: InboxConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  onRetry: () => void
  copy: InboxCopy
  lang: Lang
  now: number
}) {
  const [query, setQuery] = useState("")
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)),
    [conversations],
  )
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sorted
    const digits = q.replace(/\D/g, "")
    return sorted.filter((c) => {
      const last = c.messages[c.messages.length - 1]
      return (
        customerName(c)?.toLowerCase().includes(q) ||
        (digits.length >= 3 && c.phoneE164.includes(digits)) ||
        last?.body?.toLowerCase().includes(q)
      )
    })
  }, [sorted, query])

  return (
    <aside
      aria-label={copy.chatList}
      className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border p-3">
        <SearchInput
          size="default"
          containerClassName="w-full"
          className="h-9 w-full"
          onValueChange={setQuery}
          placeholder={copy.searchPlaceholder}
          disabled={status !== "ready"}
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
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
        ) : filtered.length === 0 ? (
          <EmptyState className="flex-1" icon={SearchXIcon} title={copy.noResults} />
        ) : (
          <ul>
            {filtered.map((c) => (
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
