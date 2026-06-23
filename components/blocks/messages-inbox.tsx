"use client"

import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  HelpCircleIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  PanelRightIcon,
  PaperclipIcon,
  PlusIcon,
  SendIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { Fragment, useMemo, useState } from "react"

import { formatAed, MOCK_WHATSAPP_TEMPLATES, resolveTemplate } from "@/app/appointments/mock"
import {
  type Conversation,
  type ConversationState,
  FUNNEL_META,
  type FunnelStatus,
  formatSla,
  formatSlaShort,
  MOCK_CONVERSATIONS,
  slaTone,
  type ThreadItem,
} from "@/app/messages/mock"
import { AppShell } from "@/components/blocks/app-shell"
import { KpiCard, KpiGrid } from "@/components/blocks/kpi-card"
import { NewAppointmentSheet } from "@/components/blocks/new-appointment-sheet"
import { SectionCard } from "@/components/blocks/section-card"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const FUNNEL_ORDER: FunnelStatus[] = ["new-inquiry", "engaged", "quoted", "scheduled", "closed"]

// ─── Shared pills ─────────────────────────────────────────────────────────────

function FunnelPill({ funnel }: { funnel: FunnelStatus }) {
  const meta = FUNNEL_META[funnel]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        meta.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </span>
  )
}

function SlaChip({ minutes, compact = false }: { minutes: number; compact?: boolean }) {
  const tone = slaTone(minutes)
  const toneClass =
    tone === "urgent"
      ? "bg-tomato-3 text-tomato-11"
      : tone === "warn"
        ? "bg-cami-yellow-3 text-cami-yellow-11"
        : "bg-cami-sage-3 text-cami-sage-11"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        toneClass,
      )}
    >
      <ClockIcon className="size-3" aria-hidden />
      {compact ? formatSlaShort(minutes) : formatSla(minutes)}
    </span>
  )
}

function RoutingChip({ conversation }: { conversation: Conversation }) {
  if (conversation.escalatedTo) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cami-yellow-3 px-2 py-0.5 text-[11px] font-medium text-cami-yellow-11">
        <AlertTriangleIcon className="size-3" aria-hidden />
        Escalated
      </span>
    )
  }
  if (conversation.assignee) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cami-violet-3 px-1.5 py-0.5 text-[11px] font-medium text-cami-violet-11">
        <Avatar size="xs" fallback="character" name={conversation.assignee} className="size-3.5" />
        {conversation.assignee}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      Unassigned
    </span>
  )
}

function StatePill({ state }: { state: ConversationState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        state === "open" ? "bg-cami-sage-3 text-cami-sage-11" : "bg-cami-gray-3 text-cami-gray-11",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          state === "open" ? "bg-cami-sage-9" : "bg-cami-gray-8",
        )}
        aria-hidden
      />
      {state === "open" ? "Open" : "Closed"}
    </span>
  )
}

// ─── Pane 1 — conversation list ───────────────────────────────────────────────

function ConversationRow({
  conversation,
  selected,
  onSelect,
}: {
  conversation: Conversation
  selected: boolean
  onSelect: () => void
}) {
  const { client } = conversation
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex w-full flex-col gap-1.5 border-b border-border/50 px-4 py-3 text-left transition-colors",
        selected ? "bg-cami-violet-3/50" : "hover:bg-muted/40",
      )}
    >
      {selected ? (
        <span
          className="absolute inset-y-1 left-0 w-[3px] rounded-r-full bg-cami-violet-9"
          aria-hidden
        />
      ) : null}
      <div className="flex items-start gap-3">
        <Avatar size="md" fallback="character" name={client.name} hashSeed={client.id} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{client.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">{conversation.lastAt}</span>
          </div>
          <span className="truncate text-xs text-muted-foreground">{conversation.preview}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 pl-12">
        {conversation.escalatedTo ? <RoutingChip conversation={conversation} /> : null}
        {conversation.state === "closed" ? (
          <StatePill state="closed" />
        ) : (
          <FunnelPill funnel={conversation.funnel} />
        )}
        {conversation.slaRemainingMin > 0 ? (
          <SlaChip minutes={conversation.slaRemainingMin} compact />
        ) : null}
        {!conversation.escalatedTo && conversation.state === "open" ? (
          <RoutingChip conversation={conversation} />
        ) : null}
        {conversation.unread ? (
          <span
            className="ml-auto size-2 shrink-0 rounded-full bg-cami-violet-9"
            role="img"
            aria-label="Unread"
          />
        ) : null}
      </div>
    </button>
  )
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[]
  selectedId: string
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.client.name.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q) ||
        c.client.pets.some((p) => p.name.toLowerCase().includes(q)),
    )
  }, [conversations, query])

  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-4">
        <SearchInput size="default" onValueChange={setQuery} placeholder="Search conversations…" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            No conversations found.
          </p>
        ) : (
          filtered.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              selected={c.id === selectedId}
              onSelect={() => onSelect(c.id)}
            />
          ))
        )}
      </div>
    </aside>
  )
}

// ─── Pane 2 — thread ──────────────────────────────────────────────────────────

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  )
}

function MessageBubble({ item }: { item: Extract<ThreadItem, { kind: "message" }> }) {
  const isOut = item.dir === "out"
  return (
    <div className={cn("flex flex-col gap-1", isOut ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isOut
            ? "rounded-br-md bg-cami-sage-3 text-cami-sage-12"
            : "rounded-bl-md bg-card text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{item.body}</p>
      </div>
      <span className="px-1 text-[11px] text-muted-foreground">
        {item.at}
        {isOut && item.author ? ` · ${item.author}` : ""}
      </span>
    </div>
  )
}

function BookingRequestCard({
  item,
  hasPets,
  onConfirm,
  onReject,
}: {
  item: Extract<ThreadItem, { kind: "booking-request" }>
  hasPets: boolean
  onConfirm: () => void
  onReject: () => void
}) {
  const resolved = item.status !== "pending"
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-border/60 pb-2.5">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-cami-violet-3 text-cami-violet-11">
          <SparklesIcon className="size-4" aria-hidden />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
          Booking request
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">{item.at}</span>
      </div>
      <dl className="flex flex-col gap-2 py-3 text-sm">
        {hasPets ? (
          <div className="flex items-center gap-2">
            <MessageCircleIcon className="size-4 text-muted-foreground" aria-hidden />
            <span className="font-medium text-foreground">{item.petName}</span>
            <span className="text-muted-foreground">· {item.petBreed}</span>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-foreground">{item.service}</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="size-4 text-muted-foreground" aria-hidden />
          <span className="text-foreground">{item.requestedAt}</span>
        </div>
      </dl>
      {resolved ? (
        <div
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-medium",
            item.status === "confirmed"
              ? "bg-cami-sage-3 text-cami-sage-11"
              : "bg-cami-gray-3 text-cami-gray-11",
          )}
        >
          {item.status === "confirmed" ? (
            <>
              <CheckIcon className="size-4" aria-hidden /> Confirmed
            </>
          ) : (
            <>
              <XIcon className="size-4" aria-hidden /> Rejected
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button type="button" radius="full" className="flex-1 gap-1.5" onClick={onConfirm}>
            <CheckIcon className="size-4" aria-hidden />
            Confirm
          </Button>
          <Button
            type="button"
            variant="outline"
            radius="full"
            className="flex-1 gap-1.5"
            onClick={onReject}
          >
            <XIcon className="size-4" aria-hidden />
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

function SystemLine({ item }: { item: Extract<ThreadItem, { kind: "system" }> }) {
  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-[11px] text-muted-foreground">
        {item.body}
        <span aria-hidden>·</span>
        {item.at}
      </span>
    </div>
  )
}

function Composer({ onSend }: { onSend: (body: string) => void }) {
  const [value, setValue] = useState("")
  function send() {
    const trimmed = value.trim()
    if (!trimmed) return
    onSend(trimmed)
    setValue("")
  }
  return (
    <div className="border-t border-border bg-sand-2 px-4 py-3">
      <div className="rounded-2xl border border-border bg-card shadow-sm transition-shadow focus-within:border-cami-violet-7 focus-within:shadow-md">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          placeholder="Type a message…"
          className="min-h-[52px] resize-none border-0 bg-transparent px-4 pt-3 text-sm leading-relaxed shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center gap-1 px-2 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="sm" radius="full" className="gap-1.5">
                <SparklesIcon className="size-4 text-cami-violet-11" aria-hidden />
                Templates
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              {MOCK_WHATSAPP_TEMPLATES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onSelect={() => setValue(resolveTemplate(t.body, {}))}
                  className="flex-col items-start gap-0.5"
                >
                  <span className="text-sm font-medium text-foreground">{t.name}</span>
                  <span className="w-full truncate text-xs text-muted-foreground">
                    {resolveTemplate(t.body, {})}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Attach">
            <PaperclipIcon className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            radius="full"
            className="gap-1.5 text-cami-violet-11"
            // AI draft reply is a visual stub in v0 — fills a canned suggestion.
            onClick={() =>
              setValue(
                "Hi! Yes, we'd be happy to help. Could you share your preferred date and time so we can confirm availability?",
              )
            }
          >
            <SparklesIcon className="size-4" aria-hidden />
            AI draft reply
          </Button>
          <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
            ⌘/Ctrl + Enter
          </span>
          <Button
            type="button"
            radius="full"
            className="gap-1.5"
            disabled={value.trim().length === 0}
            onClick={send}
          >
            <SendIcon className="size-4" aria-hidden />
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}

function MessageThread({
  conversation,
  detailsOpen,
  onToggleDetails,
  onSend,
  onConfirmBooking,
  onRejectBooking,
  onEscalate,
  hasPets,
}: {
  conversation: Conversation
  detailsOpen: boolean
  onToggleDetails: () => void
  onSend: (body: string) => void
  onConfirmBooking: (index: number) => void
  onRejectBooking: (index: number) => void
  onEscalate: () => void
  hasPets: boolean
}) {
  const { client } = conversation
  const escalateTarget = conversation.escalatedTo ?? "Kristine"
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-card px-5 py-3">
        <Avatar size="md" fallback="character" name={client.name} hashSeed={client.id} />
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-foreground">{client.name}</span>
            <StatePill state={conversation.state} />
            {conversation.slaRemainingMin > 0 ? (
              <SlaChip minutes={conversation.slaRemainingMin} />
            ) : null}
            <FunnelPill funnel={conversation.funnel} />
          </div>
          <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <MessageCircleIcon className="size-3.5" aria-hidden />
            WhatsApp · {client.phone}
            {hasPets && client.pets.length ? ` · ${client.pets.map((p) => p.name).join(", ")}` : ""}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <AutoConfirmToggle />
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            className="gap-1.5 border-cami-yellow-5 text-cami-yellow-11 hover:bg-cami-yellow-3"
            onClick={onEscalate}
          >
            <AlertTriangleIcon className="size-3.5" aria-hidden />
            Escalate to {escalateTarget}
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="Help">
            <HelpCircleIcon className="size-4" aria-hidden />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon-sm" radius="full" aria-label="More">
                <MoreVerticalIcon className="size-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Mark as unread</DropdownMenuItem>
              <DropdownMenuItem>Assign to me</DropdownMenuItem>
              <DropdownMenuItem>Close conversation</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant={detailsOpen ? "secondary" : "outline"}
            size="sm"
            radius="full"
            className="gap-1.5"
            onClick={onToggleDetails}
          >
            <PanelRightIcon className="size-3.5" aria-hidden />
            Details
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-sand-2 px-5 py-4">
        {(() => {
          let lastDay: string | undefined
          return conversation.messages.map((item, i) => {
            const key = `${conversation.id}-${i}`
            const showSep = item.day && item.day !== lastDay
            if (item.day) lastDay = item.day
            return (
              <Fragment key={key}>
                {showSep ? <DateSeparator label={item.day!} /> : null}
                {item.kind === "system" ? (
                  <SystemLine item={item} />
                ) : item.kind === "booking-request" ? (
                  <BookingRequestCard
                    item={item}
                    hasPets={hasPets}
                    onConfirm={() => onConfirmBooking(i)}
                    onReject={() => onRejectBooking(i)}
                  />
                ) : (
                  <MessageBubble item={item} />
                )}
              </Fragment>
            )
          })
        })()}
      </div>

      <Composer onSend={onSend} />
    </section>
  )
}

function AutoConfirmToggle() {
  // Visual stub in v0 — no automation behind it.
  const [on, setOn] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
    >
      <SparklesIcon className="size-3.5 text-cami-violet-11" aria-hidden />
      Auto-confirm:
      <span className={on ? "text-cami-sage-11" : "text-muted-foreground"}>
        {on ? "On" : "Off"}
      </span>
    </button>
  )
}

// ─── Pane 3 — client panel ────────────────────────────────────────────────────

function ClientPanel({
  conversation,
  onFunnelChange,
  onRemoveTag,
  hasPets,
}: {
  conversation: Conversation
  onFunnelChange: (funnel: FunnelStatus) => void
  onRemoveTag: (tag: string) => void
  hasPets: boolean
}) {
  const { client } = conversation
  const a = client.activity
  return (
    <aside className="flex w-80 shrink-0 flex-col overflow-y-auto rounded-2xl border border-border bg-sand-2 shadow-sm">
      {/* Identity */}
      <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
        <Avatar size="lg" fallback="character" name={client.name} hashSeed={client.id} />
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-heading text-lg font-semibold text-foreground">
            {client.name}
          </span>
          <span className="text-sm text-muted-foreground">{client.phone}</span>
          {client.email ? (
            <span className="truncate text-sm text-muted-foreground">{client.email}</span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        {/* Meta chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-cami-violet-3 px-2.5 py-1 text-xs font-medium text-cami-violet-11">
            {client.clientType === "repeat" ? "Repeat" : "New"}
          </span>
          {client.since ? (
            <span className="text-xs text-muted-foreground">since {client.since}</span>
          ) : null}
          {client.whatsappPreferred ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cami-sage-3 px-2.5 py-1 text-xs font-medium text-cami-sage-11">
              <MessageCircleIcon className="size-3.5" aria-hidden />
              WhatsApp preferred
            </span>
          ) : null}
        </div>

        {/* Activity KPIs */}
        <KpiGrid>
          <KpiCard
            label="Last visit"
            value={a.lastVisit ?? "—"}
            info="Date of the client's most recent completed visit."
          />
          <KpiCard
            label="Visits"
            value={String(a.visits)}
            info="Lifetime count of completed visits."
          />
          <KpiCard
            label="Avg ticket"
            value={a.avgTicketMinor ? formatAed(a.avgTicketMinor) : "—"}
            info="Average spend per visit."
          />
          <KpiCard
            label="Lifetime"
            value={a.lifetimeMinor ? formatAed(a.lifetimeMinor) : "—"}
            info="Total lifetime revenue from this client."
          />
        </KpiGrid>

        {/* Funnel status */}
        <SectionCard title="Funnel status">
          <Select value={client.funnel} onValueChange={(v) => onFunnelChange(v as FunnelStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FUNNEL_ORDER.map((f) => (
                <SelectItem key={f} value={f}>
                  <span className="flex items-center gap-2">
                    <span className={cn("size-2 rounded-full", FUNNEL_META[f].dot)} aria-hidden />
                    {FUNNEL_META[f].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </SectionCard>

        {/* Pets */}
        {hasPets && client.pets.length ? (
          <SectionCard title={`Pets (${client.pets.length})`}>
            <div className="flex flex-col gap-2">
              {client.pets.map((pet) => (
                <div
                  key={pet.name}
                  className="rounded-2xl border border-border/60 bg-sand-2/40 p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm" fallback="species" species={pet.species} shape="square" />
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-foreground">{pet.name}</span>
                      <span className="text-xs text-muted-foreground">{pet.breed}</span>
                    </div>
                  </div>
                  {pet.careNote ? (
                    <p className="mt-2 rounded-lg bg-cami-yellow-3/60 px-2.5 py-1.5 text-xs text-cami-yellow-11">
                      {pet.careNote}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionCard>
        ) : null}

        {/* Tags */}
        <SectionCard title="Tags">
          <div className="flex flex-wrap items-center gap-1.5">
            {client.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-cami-violet-3 px-2.5 py-1 text-xs font-medium text-cami-violet-11"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => onRemoveTag(tag)}
                  className="text-cami-violet-11/70 hover:text-cami-violet-11"
                >
                  <XIcon className="size-3" aria-hidden />
                </button>
              </span>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted/50"
            >
              <PlusIcon className="size-3" aria-hidden />
              Add tag
            </button>
          </div>
        </SectionCard>

        {/* Notes */}
        <SectionCard
          title="Notes"
          action={
            <Button variant="secondary" size="sm" radius="full">
              <PlusIcon />
              Add note
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">{client.internalNotes ?? "No notes yet."}</p>
        </SectionCard>
      </div>
    </aside>
  )
}

// ─── Controller ───────────────────────────────────────────────────────────────

export function MessagesInbox({ hasPets = true }: { hasPets?: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS)
  const [selectedId, setSelectedId] = useState<string>("c-sarah")
  const [detailsOpen, setDetailsOpen] = useState(true)
  const [bookingSheetOpen, setBookingSheetOpen] = useState(false)
  const [pendingBookingIndex, setPendingBookingIndex] = useState<number | null>(null)

  const selected = conversations.find((c) => c.id === selectedId) ?? conversations[0]!

  function updateSelected(mutate: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === selected.id ? mutate(c) : c)))
  }

  function handleSend(body: string) {
    updateSelected((c) => ({
      ...c,
      messages: [...c.messages, { kind: "message", dir: "out", body, at: "Now", author: "You" }],
      preview: body,
      lastAt: "Now",
      unread: false,
    }))
  }

  // Confirm opens the new-appointment sheet pre-filled (date/time wiring is a
  // follow-up — NewAppointmentSheet needs client/pet/service prefill props).
  // On the sheet's close we mark the booking-request card confirmed.
  function handleConfirmBooking(index: number) {
    setPendingBookingIndex(index)
    setBookingSheetOpen(true)
  }

  function finalizeBookingConfirm() {
    if (pendingBookingIndex === null) return
    const idx = pendingBookingIndex
    updateSelected((c) => {
      const messages = c.messages.map((m, i) =>
        i === idx && m.kind === "booking-request" ? { ...m, status: "confirmed" as const } : m,
      )
      return {
        ...c,
        messages: [
          ...messages,
          { kind: "system", body: "Booking confirmed from request", at: "Now" },
        ],
        funnel: "scheduled",
      }
    })
    setPendingBookingIndex(null)
  }

  function handleRejectBooking(index: number) {
    updateSelected((c) => {
      const messages = c.messages.map((m, i) =>
        i === index && m.kind === "booking-request" ? { ...m, status: "rejected" as const } : m,
      )
      return {
        ...c,
        messages: [...messages, { kind: "system", body: "Booking request rejected", at: "Now" }],
      }
    })
  }

  function handleEscalate() {
    updateSelected((c) => ({
      ...c,
      escalatedTo: c.escalatedTo ?? "Kristine",
      assignee: c.assignee ?? "Kristine",
      messages: [
        ...c.messages,
        {
          kind: "system",
          body: `Conversation escalated to ${c.escalatedTo ?? "Kristine"}`,
          at: "Now",
        },
      ],
    }))
  }

  function handleFunnelChange(funnel: FunnelStatus) {
    updateSelected((c) => ({ ...c, funnel }))
  }

  function handleRemoveTag(tag: string) {
    updateSelected((c) => ({
      ...c,
      client: { ...c.client, tags: c.client.tags.filter((t) => t !== tag) },
    }))
  }

  return (
    <div className="flex h-full min-h-0 flex-1 gap-3 bg-sand-3 p-3">
      <ConversationList
        conversations={conversations}
        selectedId={selected.id}
        onSelect={setSelectedId}
      />
      <MessageThread
        key={selected.id}
        conversation={selected}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setDetailsOpen((v) => !v)}
        onSend={handleSend}
        onConfirmBooking={handleConfirmBooking}
        onRejectBooking={handleRejectBooking}
        onEscalate={handleEscalate}
        hasPets={hasPets}
      />
      {detailsOpen ? (
        <ClientPanel
          conversation={selected}
          onFunnelChange={handleFunnelChange}
          onRemoveTag={handleRemoveTag}
          hasPets={hasPets}
        />
      ) : null}

      <NewAppointmentSheet
        open={bookingSheetOpen}
        onOpenChange={(next) => {
          setBookingSheetOpen(next)
          if (!next) finalizeBookingConfirm()
        }}
        date="2026-06-24"
        hasPets={hasPets}
      />
    </div>
  )
}

// ─── Screen — page shell + pet-mode toggle ────────────────────────────────────

export function MessagesInboxScreen() {
  const [hasPets, setHasPets] = useState(true)
  return (
    <AppShell
      headerClassName="px-5"
      header={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl font-medium leading-8 text-foreground">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              {MOCK_CONVERSATIONS.length} conversations
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" radius="full" size="sm">
                Mode: {hasPets ? "with pets" : "without pets"}
                <ChevronDownIcon className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setHasPets(true)}>With pets</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setHasPets(false)}>Without pets</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      }
      contentClassName="px-0 pb-0"
    >
      <MessagesInbox hasPets={hasPets} />
    </AppShell>
  )
}
