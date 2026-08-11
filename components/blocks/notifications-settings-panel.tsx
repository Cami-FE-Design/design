"use client"

// Notifications panel inside the app settings dialog.
// Spec: docs/specs/notifications-sender-id-and-rates.md
//
// Follows the sales-settings.tsx / payments-settings-panel.tsx conventions:
// w-146 summary cards, one Edit per card, tinted notices with no accent border,
// prototype demo toggles pinned bottom-right.
//
// Two tabs. The log is a scanning surface with its own filters and doesn't read
// as a fourth configuration card, so it gets its own tab rather than being
// stacked under the three.
//
// Deep-links for /screens: `?nt=log` opens the Log tab, `?nt=sender` opens the
// Sender ID dialog. The registration states are walked with the demo toggle
// rather than a param — they're stored, so a URL that set one would persist it.

import {
  BadgeCheckIcon,
  BellIcon,
  CircleAlertIcon,
  ClockIcon,
  InfoIcon,
  MailIcon,
  MessageCircleIcon,
  MessageSquareIcon,
  XIcon,
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDemoBusiness } from "@/lib/demo-business"
import { useHqRates } from "@/lib/notifications/hq-store"
import { useNotifications } from "@/lib/notifications/store"
import {
  CHANNEL_LABEL,
  CHANNELS,
  channelEnabled,
  effectiveSenderId,
  eventLabel,
  FALLBACK_SENDER_ID,
  formatRate,
  MERCHANT_SEES_RATES,
  type NotificationChannel,
  type NotificationLogEntry,
  type NotificationStatus,
  periodTotalCost,
  REMINDER_EVENTS,
  type SenderId,
  type SenderIdStatus,
  senderIdLocked,
  validateSenderId,
} from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

/** Shared card footprint with the other settings panels (see sales-settings.tsx). */
const cardClass =
  "flex w-full flex-col gap-5 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146"

const CHANNEL_ICON: Record<NotificationChannel, typeof MailIcon> = {
  email: MailIcon,
  sms: MessageSquareIcon,
  whatsapp: MessageCircleIcon,
}

// ── Sender ID ────────────────────────────────────────────────────────────────

/**
 * The four registration states, and what each one has to tell the merchant.
 * CAMI is the fallback in three of the four, so it isn't an error state to
 * design around — it's the default the product ships on. The notice always
 * answers the same question: which name will my customers see?
 */
const SENDER_STATE: Record<
  SenderIdStatus,
  {
    pill: { label: string; className: string } | null
    noticeClass: string
    icon: typeof InfoIcon
  }
> = {
  "not-submitted": {
    pill: null,
    noticeClass: "bg-muted/50 text-muted-foreground",
    icon: InfoIcon,
  },
  submitted: {
    pill: { label: "Pending", className: "bg-cami-yellow-3 text-cami-yellow-11" },
    noticeClass: "bg-cami-yellow-2 text-foreground",
    icon: ClockIcon,
  },
  approved: {
    pill: { label: "Approved", className: "bg-cami-green-3 text-cami-green-11" },
    noticeClass: "bg-cami-green-2 text-foreground",
    icon: BadgeCheckIcon,
  },
  rejected: {
    pill: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
    noticeClass: "bg-destructive/5 text-foreground",
    icon: CircleAlertIcon,
  },
}

function senderNotice(senderId: SenderId): string {
  switch (senderId.status) {
    case "not-submitted":
      return `Messages send as ${FALLBACK_SENDER_ID}. Add your own Sender ID to have SMS arrive under your business name instead.`
    case "submitted":
      return `${senderId.value} is with the carrier for registration. Until it's approved, messages keep sending as ${FALLBACK_SENDER_ID}.`
    case "approved":
      return `SMS arrives from ${senderId.value}. Customers see this name instead of a phone number.`
    case "rejected":
      return (
        senderId.rejectionReason ??
        `${senderId.value} was not approved. Messages send as ${FALLBACK_SENDER_ID} until a new Sender ID is registered.`
      )
  }
}

function Notice({
  icon: Icon,
  className,
  children,
}: {
  icon: typeof InfoIcon
  className: string
  children: React.ReactNode
}) {
  // Tinted block, no accent border — the terminal-pairing convention.
  return (
    <p className={cn("flex items-start gap-2 rounded-xl p-3 text-sm leading-5", className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

function SenderIdCard({ onEdit }: { onEdit: () => void }) {
  const { senderId } = useNotifications()
  const state = SENDER_STATE[senderId.status]
  const locked = senderIdLocked(senderId)

  return (
    <section className={cardClass}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
              Sender ID
            </h3>
            {state.pill ? (
              <span
                className={cn("rounded-full px-2 py-0.5 text-xs font-medium", state.pill.className)}
              >
                {state.pill.label}
              </span>
            ) : null}
          </div>
          <p className="text-sm leading-5 text-muted-foreground">
            The name your SMS messages arrive from.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          radius="full"
          disabled={locked}
          onClick={onEdit}
        >
          {senderId.value && senderId.status !== "not-submitted" ? "Edit" : "Add"}
        </Button>
      </header>

      <div className="flex w-full max-w-md flex-col gap-1.5">
        <span className="text-sm font-medium leading-5 text-foreground">Sender ID</span>
        <div className="flex h-12 items-center rounded-2xl bg-input px-4">
          <span
            className={cn(
              "text-sm font-medium",
              senderId.value ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {senderId.value ?? `${FALLBACK_SENDER_ID} (default)`}
          </span>
        </div>
        <span className="text-sm leading-5 text-muted-foreground">
          Customers currently see <strong>{effectiveSenderId(senderId)}</strong>.
        </span>
      </div>

      <Notice icon={state.icon} className={state.noticeClass}>
        {senderNotice(senderId)}
      </Notice>
    </section>
  )
}

/**
 * Compact dialog, not a FullScreenTakeover. The takeover convention exists for
 * multi-section forms; a one-field form in a full-screen takeover reads as a
 * rendering bug (same call as the terminal rename dialog).
 */
function SenderIdDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { senderId, submitSenderId, clearSenderId } = useNotifications()
  const [draft, setDraft] = useState(senderId.value ?? "")
  // Validate on submit, not on every keystroke — an error under a field someone
  // is three characters into typing is noise.
  const [error, setError] = useState<string | null>(null)

  function save() {
    const problem = validateSenderId(draft)
    if (problem) {
      setError(problem)
      return
    }
    submitSenderId(draft)
    toast.success("Sender ID submitted for registration")
    onOpenChange(false)
  }

  function useFallback() {
    clearSenderId()
    toast.success(`Messages will send as ${FALLBACK_SENDER_ID}`)
    onOpenChange(false)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <div className="flex items-start justify-between gap-3 p-6 pb-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="font-heading text-lg font-semibold leading-7">
              {senderId.value ? "Change Sender ID" : "Add Sender ID"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-5 text-muted-foreground">
              Saving submits it for carrier registration.
            </DialogDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            radius="full"
            aria-label="Close"
            className="shrink-0"
            onClick={() => onOpenChange(false)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-4 px-6 pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium leading-5 text-foreground">Sender ID</span>
            <Input
              value={draft}
              autoFocus
              maxLength={11}
              aria-label="Sender ID"
              aria-invalid={error ? true : undefined}
              placeholder={FALLBACK_SENDER_ID}
              className="h-12 rounded-2xl bg-input px-4 font-medium uppercase"
              onChange={(e) => {
                setDraft(e.target.value)
                setError(null)
              }}
            />
            <span
              className={cn(
                "text-sm leading-5",
                error ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {error ?? "3–11 letters or numbers. This is what customers see instead of a number."}
            </span>
          </div>

          <Notice icon={ClockIcon} className="bg-cami-yellow-2 text-foreground">
            Registration is handled by the carrier and takes a few days. Messages keep sending as{" "}
            {FALLBACK_SENDER_ID} until it&rsquo;s approved.
          </Notice>

          <div className="flex items-center justify-between gap-3">
            {/* An explicit way back to the default. Without it, a merchant who
                registered the wrong name has no route to a working state. */}
            {senderId.value ? (
              <Button type="button" variant="ghost" size="sm" radius="full" onClick={useFallback}>
                Use {FALLBACK_SENDER_ID} instead
              </Button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                radius="full"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="button" radius="full" onClick={save}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </DialogPrimitive.Root>
  )
}

// ── Reminders matrix ─────────────────────────────────────────────────────────

function RemindersCard({ showRates }: { showRates: boolean }) {
  const { events, grant, toggleEvent } = useNotifications()
  // Rates come from the HQ store, not a merchant-side copy. Two sources for one
  // price drift apart, and the merchant's is the one that would silently go
  // stale — they can't edit it anyway.
  const { rates } = useHqRates()
  const ungranted = CHANNELS.filter((c) => !grant[c])

  return (
    <section className={cardClass}>
      <header className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">Reminders</h3>
        <p className="text-sm leading-5 text-muted-foreground">
          Which messages go out, and how. Each one sends per channel you switch on.
        </p>
      </header>

      {/*
        Two layouts from one tree, not two copies of the markup.

        The matrix needs ~300px of fixed width (label column + 3×88px + gaps),
        and a phone leaves ~272px inside the dialog and card padding — so the
        column layout overflowed on small screens. Below `sm` each event becomes
        a stacked block: title, then its three switches with their own labels.
        The channel wrapper is `sm:contents`, so at `sm` and up its children
        promote into the row's grid cells and the table reappears unchanged.

        Not an overflow-x container: a horizontally scrolling settings table is
        the wrong answer on the device maaz prioritised.
      */}
      <div className="flex flex-col">
        {/* Column headers only exist in the table layout. On mobile the rate
            rides on each switch's own label instead. */}
        <div className="hidden grid-cols-[minmax(0,1fr)_repeat(3,88px)] items-end gap-3 border-b border-border/60 pb-2 sm:grid">
          <span className="text-sm font-medium text-muted-foreground">Message</span>
          {CHANNELS.map((channel) => (
            <div key={channel} className="flex flex-col items-center gap-0.5 text-center">
              <span
                className={cn(
                  "text-sm font-medium",
                  grant[channel] ? "text-foreground" : "text-muted-foreground/60",
                )}
              >
                {CHANNEL_LABEL[channel]}
              </span>
              {/* Rate is read-only helper text — merchants never set it, that
                  lives in Cami HQ. Hidden entirely when MERCHANT_SEES_RATES is
                  off. nowrap: a wrapped rate made its column two lines tall, and
                  items-end then dropped that column's label below its siblings. */}
              {showRates ? (
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatRate(rates[channel])}/msg
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {REMINDER_EVENTS.map((event) => (
          <div
            key={event.id}
            className="flex flex-col gap-3 border-b border-border/40 py-3 last:border-b-0 sm:grid sm:grid-cols-[minmax(0,1fr)_repeat(3,88px)] sm:items-center sm:gap-3"
          >
            <div className="flex min-w-0 flex-col">
              {/* Truncation only makes sense in a fixed column. Stacked, the
                  title has the full card width and should use it. */}
              <span className="text-sm font-medium text-foreground sm:truncate">{event.label}</span>
              <span className="text-xs text-muted-foreground sm:truncate">{event.description}</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2 sm:contents">
              {CHANNELS.map((channel) => (
                <div key={channel} className="flex items-center gap-2 sm:justify-center sm:gap-0">
                  <Switch
                    // Effective state, so a granted-off channel can never show a
                    // switch that says "on" next to a message nobody receives.
                    checked={channelEnabled({ events, grant }, event.id, channel)}
                    disabled={!grant[channel]}
                    onCheckedChange={(next) => toggleEvent(event.id, channel, next)}
                    aria-label={`${event.label} over ${CHANNEL_LABEL[channel]}`}
                  />
                  {/* Mobile-only label. Without it a stacked row is three
                      unlabelled switches, and the ungranted one reads as broken
                      rather than as WhatsApp being off. */}
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs sm:hidden",
                      grant[channel] ? "text-muted-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {CHANNEL_LABEL[channel]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Rates have no home in the stacked layout — repeating them on every
          switch would print them seven times. One line under the list instead. */}
      {showRates ? (
        <p className="text-xs text-muted-foreground sm:hidden">
          {CHANNELS.map((c) => `${CHANNEL_LABEL[c]} ${formatRate(rates[c])}/msg`).join(" · ")}
        </p>
      ) : null}

      {/* An ungranted channel stays visible rather than being hidden. A merchant
          told that Cami supports WhatsApp needs to see that the block is on
          Cami's side — a missing column reads as a missing feature and turns
          into a support ticket anyway. */}
      {ungranted.length > 0 ? (
        <Notice icon={InfoIcon} className="bg-muted/50 text-muted-foreground">
          {ungranted.map((c) => CHANNEL_LABEL[c]).join(" and ")}{" "}
          {ungranted.length === 1 ? "isn't" : "aren't"} enabled for your business. Contact support
          to turn {ungranted.length === 1 ? "it" : "them"} on.
        </Notice>
      ) : null}
    </section>
  )
}

// ── Usage ────────────────────────────────────────────────────────────────────

function UsageCard({ onViewLog, showRates }: { onViewLog: () => void; showRates: boolean }) {
  // Reads periodUsage, NOT a sum over the log. The log holds the most recent
  // sends; a real month is hundreds of rows, so summing what happens to be
  // loaded reported AED 0.49 for a month that actually cost AED 42.92.
  const { periodUsage, grant } = useNotifications()
  const { rates } = useHqRates()
  const total = useMemo(() => periodTotalCost(periodUsage), [periodUsage])

  return (
    <section className={cardClass}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            Usage this month
          </h3>
          <p className="text-sm leading-5 text-muted-foreground">
            1 &ndash; 10 August. Your invoice is issued at the end of the month.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" radius="full" onClick={onViewLog}>
          View log
        </Button>
      </header>

      <div className="flex flex-col">
        {CHANNELS.filter(
          (c) => grant[c] || periodUsage[c].sent > 0 || periodUsage[c].failed > 0,
        ).map((channel) => {
          const Icon = CHANNEL_ICON[channel]
          const row = periodUsage[channel]
          return (
            <div
              key={channel}
              className="flex items-center gap-3 border-b border-border/40 py-3 last:border-b-0"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
                <Icon className="size-5" />
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="text-sm font-medium leading-5 text-foreground">
                  {CHANNEL_LABEL[channel]}
                </span>
                <span className="text-sm leading-5 text-muted-foreground">
                  {(() => {
                    // Failures are always called out rather than folded into the
                    // count — an unbilled failure is still a customer who never
                    // heard from the merchant.
                    const failed = row.failed > 0 ? ` · ${row.failed} failed, not charged` : ""
                    if (row.sent === 0 && row.failed === 0) {
                      // Granted but unused. "0 sent at AED 0.09 each" is
                      // arithmetic nobody asked for.
                      return showRates
                        ? `Nothing sent yet · ${formatRate(rates[channel])} per message`
                        : "Nothing sent yet"
                    }
                    const count = row.sent.toLocaleString("en-US")
                    return showRates
                      ? `${count} sent at ${formatRate(rates[channel])} each${failed}`
                      : `${count} sent${failed}`
                  })()}
                </span>
              </div>
              {/* Per-channel cost is the rate with one division (412 sends,
                  AED 8.24), so it hides with the rates. The period total below
                  stays — it's what they owe, and one number can't be solved
                  back into two per-channel rates. */}
              {showRates ? (
                <span className="ms-auto text-sm font-medium text-foreground">
                  {formatRate(row.cost)}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-3">
        <span className="text-sm font-medium text-foreground">Total so far</span>
        <span className="font-heading text-lg font-semibold text-foreground">
          {formatRate(total)}
        </span>
      </div>
    </section>
  )
}

// ── Log ──────────────────────────────────────────────────────────────────────

const LOG_STATUS: Record<NotificationStatus, { label: string; className: string }> = {
  queued: { label: "Queued", className: "bg-muted text-muted-foreground" },
  sent: { label: "Sent", className: "bg-cami-violet-3 text-cami-violet-11" },
  delivered: { label: "Delivered", className: "bg-cami-green-3 text-cami-green-11" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
}

const selectTriggerClass = "data-[size=default]:h-10 w-40 rounded-full bg-input px-4 font-medium"

function LogTab({ showRates }: { showRates: boolean }) {
  const { log } = useNotifications()
  const [channel, setChannel] = useState<NotificationChannel | "all">("all")
  const [status, setStatus] = useState<NotificationStatus | "all">("all")

  const visible = log.filter(
    (e) =>
      (channel === "all" || e.channel === channel) && (status === "all" || e.status === status),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
          <SelectTrigger className={selectTriggerClass} aria-label="Filter by channel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All channels</SelectItem>
            {CHANNELS.map((c) => (
              <SelectItem key={c} value={c}>
                {CHANNEL_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className={selectTriggerClass} aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(LOG_STATUS) as NotificationStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {LOG_STATUS[s].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ms-auto text-sm text-muted-foreground">
          {visible.length} of {log.length}
        </span>
      </div>

      {visible.length === 0 ? (
        <section className="rounded-2xl border border-border/60 p-5">
          <EmptyState
            icon={BellIcon}
            title="No messages match"
            description="Try a different channel or status."
            className="py-6"
          />
        </section>
      ) : (
        <ol className="flex flex-col gap-2">
          {visible.map((entry) => (
            <LogRow key={entry.id} entry={entry} showRates={showRates} />
          ))}
        </ol>
      )}

      {/* Says "most recent", not "every message this period". The Usage card's
          totals come from periodUsage and are larger than what's listed here;
          claiming completeness would make the two look like they disagree. */}
      <p className="text-xs text-muted-foreground">
        Your most recent sends. Usage totals for the current period are on the Settings tab.
      </p>
    </div>
  )
}

function LogRow({ entry, showRates }: { entry: NotificationLogEntry; showRates: boolean }) {
  const Icon = CHANNEL_ICON[entry.channel]
  const status = LOG_STATUS[entry.status]
  return (
    <li className="flex gap-3 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">{eventLabel(entry.event)}</span>
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", status.className)}>
            {status.label}
          </span>
          {/* One send's cost is the rate itself, so it hides with them. */}
          {showRates ? (
            <span className="ms-auto text-sm text-muted-foreground">
              {entry.cost > 0 ? formatRate(entry.cost) : "—"}
            </span>
          ) : null}
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {entry.recipientName} · {entry.recipient} · {entry.sentAt}
        </span>
        <p className="line-clamp-2 text-sm leading-5 text-foreground">{entry.body}</p>
        {/* Inline, not behind a tooltip — a failure is the one row type someone
            is actively hunting for. */}
        {entry.failureReason ? (
          <span className="text-xs font-medium text-destructive">{entry.failureReason}</span>
        ) : null}
      </div>
    </li>
  )
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function NotificationsSettingsPanel() {
  const searchParams = useSearchParams()
  const { name: businessName } = useDemoBusiness()
  const { senderId, grant, log, setSenderIdStatus, setGrant } = useNotifications()

  const [tab, setTab] = useState(searchParams?.get("nt") === "log" ? "log" : "settings")
  // `?nr=hidden` previews the merchant portal with prices withheld — the open
  // commercial question, reviewable rather than described. See
  // MERCHANT_SEES_RATES in lib/notifications/types.ts.
  const showRates = MERCHANT_SEES_RATES && searchParams?.get("nr") !== "hidden"
  const [senderDialog, setSenderDialog] = useState(searchParams?.get("nt") === "sender")

  // Demo: walk the Sender ID states. The transitions out of `submitted` are HQ
  // decisions taken in another portal, so nothing here could reach them.
  const nextStatus: Record<SenderIdStatus, SenderIdStatus> = {
    "not-submitted": "submitted",
    submitted: "approved",
    approved: "rejected",
    rejected: "not-submitted",
  }

  return (
    // The panel owns its scrolling: the heading and the tab bar stay put and
    // only the cards move, so you never lose the tabs while reading the log.
    // That means h-full + min-h-0 all the way down to the scrolling
    // TabsContent, and the demo row sits outside it (no mt-auto — it would pin
    // to the scroll box and land on top of the cards overflowing past it).
    <div className="flex h-full min-h-0 flex-col gap-6">
      <header className="flex shrink-0 flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Notifications
        </h2>
        <p className="max-w-xl text-sm leading-5 text-muted-foreground">
          The Sender ID your messages arrive from, which reminders {businessName} sends, and what
          they cost.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col gap-5">
        <TabsList variant="underline" className="shrink-0">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="log">
            Log
            <span className="text-sm font-normal text-muted-foreground">{log.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="settings"
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1"
        >
          <SenderIdCard onEdit={() => setSenderDialog(true)} />
          <RemindersCard showRates={showRates} />
          <UsageCard onViewLog={() => setTab("log")} showRates={showRates} />
        </TabsContent>

        <TabsContent value="log" className="min-h-0 flex-1 overflow-y-auto pr-1">
          <LogTab showRates={showRates} />
        </TabsContent>
      </Tabs>

      {/* Prototype demo controls (gift-cards convention). Both stand in for
          decisions taken in Cami HQ, which this portal can't reach. */}
      <div className="flex shrink-0 items-center justify-end gap-4 pt-2">
        <button
          type="button"
          onClick={() => setGrant("whatsapp", !grant.whatsapp)}
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          Demo: WhatsApp {grant.whatsapp ? "granted" : "not granted"}
        </button>
        <button
          type="button"
          onClick={() => setSenderIdStatus(nextStatus[senderId.status])}
          className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
        >
          Demo: Sender ID {senderId.status}
        </button>
      </div>

      <SenderIdDialog open={senderDialog} onOpenChange={setSenderDialog} />
    </div>
  )
}
