"use client"

// Communication templates panel inside the app settings dialog. DSG-83.
//
// Follows the sales-settings.tsx / notifications-settings-panel.tsx conventions:
// w-146 summary cards, tinted notices with no accent border, prototype demo
// toggles pinned bottom-right, FullScreenTakeover for the editor. Buttons use
// the repo's two clusters exactly — secondary/sm/full for the in-card Edit, and
// outline+primary at lg/full for the takeover's Close/Save — because an editor
// whose chrome doesn't match the one next to it reads as a different product.
//
// Tabs are per channel rather than one combined list. A merchant edits email copy
// or WhatsApp copy, not both at once, and 7 events × 2 channels of body excerpts
// does not fit the w-146 footprint side by side — the two-column version pushed
// each excerpt down to about four words, which is not enough to recognise a
// template by. Per channel, each row gets the full card width for its excerpt.
//
// This panel decides only *what a message says*. Whether it sends at all is the
// Reminders matrix in the Notifications panel, and there is deliberately no
// toggle here — two switches for one fact drift apart. A row that won't send
// carries an "Off" / "Not enabled" badge and stays editable, because writing
// copy for a channel you're about to switch on is reasonable while pretending it
// already sends is not. The explanation is one line in the card header, not a
// sentence per row: repeated on all seven it doubled every row's height to say
// the same thing seven times — the same reason the Reminders matrix keeps one
// notice per locked column rather than one per cell.
//
// Deep-links for /screens: `?ct=email` / `?ct=whatsapp` picks the tab, and
// `?ce=<event>:<channel>` opens straight into one editor.

import { CircleAlertIcon, InfoIcon, MailIcon, MessageCircleIcon, RotateCcwIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useId, useMemo, useState } from "react"
import { toast } from "sonner"
import { FullScreenTakeover } from "@/components/blocks/sales-settings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useCommsTemplates } from "@/lib/comms/store"
import {
  COMMS_CHANNEL_LABEL,
  COMMS_CHANNELS,
  COMMS_EVENTS,
  type CommsChannel,
  excerpt,
  previewLine,
} from "@/lib/comms/templates"
import {
  resolveTemplate,
  sampleTokens,
  type TemplateTokenKey,
  TOKEN_EXAMPLE,
  TOKENS,
  tokensUsed,
  unknownTokens,
} from "@/lib/comms/tokens"
import { useDemoBusiness } from "@/lib/demo-business"
import { useNotifications } from "@/lib/notifications/store"
import { channelEnabled, eventLabel, type ReminderEvent } from "@/lib/notifications/types"
import { cn } from "@/lib/utils"

/** Shared card footprint with the other settings panels (see sales-settings.tsx). */
const cardClass =
  "flex w-full flex-col gap-5 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146 sm:max-w-146"

const CHANNEL_ICON: Record<CommsChannel, typeof MailIcon> = {
  email: MailIcon,
  whatsapp: MessageCircleIcon,
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

// ── Editor ───────────────────────────────────────────────────────────────────

/**
 * Email preview chrome.
 *
 * Borrows the visual language of components/blocks/booking/confirmation-email.tsx
 * — 600px column, rounded card, brand band on top — but is not that component.
 * ConfirmationEmail composes its own content (a Confirmed pill, booking detail
 * rows); rendering the merchant's body through it would show their copy nowhere.
 * The idiom is the reusable part here, not the component.
 */
function EmailPreview({
  businessName,
  subject,
  body,
}: {
  businessName: string
  subject: string
  body: string
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">From</span> {businessName} via Cami
        </span>
        <span>
          <span className="font-medium text-foreground">To</span> {TOKEN_EXAMPLE.client} ·
          tom@example.com
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="border-b border-border/60 bg-muted/40 px-5 py-3">
          <p className="text-sm font-semibold leading-5 text-foreground">
            {subject || <span className="text-muted-foreground">(no subject)</span>}
          </p>
        </div>
        <p className="whitespace-pre-wrap px-5 py-5 text-sm leading-6 text-foreground">{body}</p>
      </div>
    </div>
  )
}

/** WhatsApp preview — a chat bubble, because that is the whole of the chrome there. */
function WhatsAppPreview({ businessName, body }: { businessName: string; body: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">From</span> {businessName} ·{" "}
        <span className="font-medium text-foreground">To</span> {TOKEN_EXAMPLE.client} · +971 50 123
        4567
      </p>
      {/* Left-aligned and light, not green. The preview is the customer's view,
          where the business's message is the incoming one — and WhatsApp only
          ever paints green on the outgoing side. Green on the left is the one
          combination it never renders, so it read as a mock of nothing. */}
      <div className="rounded-2xl bg-muted/40 p-4">
        <div className="w-fit max-w-[90%] rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{body}</p>
        </div>
      </div>
    </div>
  )
}

function TemplateEditor({
  event,
  channel,
  onClose,
}: {
  event: ReminderEvent
  channel: CommsChannel
  onClose: () => void
}) {
  const { template, customised, updateTemplate, resetTemplate } = useCommsTemplates()
  const { name: businessName } = useDemoBusiness()
  const stored = template(event, channel)
  const subjectId = useId()
  const bodyId = useId()

  const [subject, setSubject] = useState(stored.subject ?? "")
  const [body, setBody] = useState(stored.body)

  const isEmail = channel === "email"
  const dirty = body !== stored.body || (isEmail && subject !== (stored.subject ?? ""))
  const unknown = unknownTokens(body) // typo'd token names, surfaced rather than swallowed
  const used = tokensUsed(body)

  const samples = sampleTokens(businessName)
  const resolvedSubject = resolveTemplate(subject, samples)
  const resolvedBody = resolveTemplate(body, samples)

  const insert = (key: TemplateTokenKey) => {
    setBody((prev) => `${prev}{{${key}}}`)
  }

  const save = () => {
    updateTemplate(event, channel, { subject: isEmail ? subject : null, body })
    toast(`${eventLabel(event)} · ${COMMS_CHANNEL_LABEL[channel]} template saved`)
    onClose()
  }

  return (
    <FullScreenTakeover
      title={`${eventLabel(event)} · ${COMMS_CHANNEL_LABEL[channel]}`}
      ariaDescription={`Edit the ${COMMS_CHANNEL_LABEL[channel]} template for ${eventLabel(event)}.`}
      subtitle={COMMS_EVENTS.find((e) => e.id === event)?.description}
      // `wide`, the prop FullScreenTakeover already exposes for editors that
      // need more than the reading column — rather than a one-off
      // contentClassName. Two columns can't fit the max-w-2xl most takeovers
      // use; this is the same escape hatch the payments per-service table takes.
      wide
      onClose={onClose}
      actions={
        <>
          {/* Same geometry as the other two so the cluster reads as one row;
              `ghost` keeps Save the obvious primary. Every takeover in the repo
              uses size="lg" radius="full" here (sales-settings, payments policy,
              billing details) — bare Buttons made this editor's header the odd
              one out. */}
          {customised(event, channel) ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              radius="full"
              onClick={() => {
                resetTemplate(event, channel)
                toast(`${eventLabel(event)} · ${COMMS_CHANNEL_LABEL[channel]} reset to default`)
                onClose()
              }}
            >
              <RotateCcwIcon className="size-4" aria-hidden />
              Reset to default
            </Button>
          ) : null}
          <Button type="button" variant="outline" size="lg" radius="full" onClick={onClose}>
            Close
          </Button>
          <Button type="button" size="lg" radius="full" onClick={save} disabled={!dirty}>
            Save
          </Button>
        </>
      }
    >
      {/* Form left, preview right, and the preview is sticky so it stays beside
          you while you type — a preview you have to scroll to isn't a live
          preview, it's a second screen. Stacks below lg.
          Inside the form column, sections are separated by hr: the gift-card
          form idiom (sales-settings.tsx). */}
      <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
        <div className="flex min-w-0 flex-col gap-8">
          <section className="flex flex-col gap-5">
            {isEmail ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={subjectId} className="text-sm font-medium text-foreground">
                  Subject
                </label>
                <Input
                  id={subjectId}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Your appointment at {{business}} is confirmed"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-1.5">
              <label htmlFor={bodyId} className="text-sm font-medium text-foreground">
                Message
              </label>
              {/* Full column width rather than the max-w-md the short fields use —
              a message body is the one field here that earns the room. */}
              <Textarea
                id={bodyId}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={isEmail ? 16 : 12}
                className="font-normal leading-6"
              />
            </div>

            {unknown.length > 0 ? (
              <Notice icon={CircleAlertIcon} className="bg-cami-yellow-2 text-cami-yellow-12">
                {unknown.length === 1
                  ? `{{${unknown[0]}}} isn't a placeholder we recognise, so it will send as written.`
                  : `${unknown.map((u) => `{{${u}}}`).join(", ")} aren't placeholders we recognise, so they will send as written.`}{" "}
                Check the spelling against the list below.
              </Notice>
            ) : null}

            {/* cami-sage, not cami-blue: the palette has no blue hue, so
                `bg-cami-blue-2` compiled to nothing and this notice rendered as
                bare text on white. Informational notices use sage. */}
            {!isEmail ? (
              <Notice icon={InfoIcon} className="bg-cami-sage-2 text-cami-sage-12">
                WhatsApp templates have to be approved by Meta before they can send. Editing the
                copy here starts a new approval, so changes take a few days to go live.
              </Notice>
            ) : null}
          </section>

          <hr className="border-border/40" />

          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
                Placeholders
              </h3>
              <p className="text-sm leading-5 text-muted-foreground">
                Replaced with the booking's real values when the message sends. Click one to add it
                to the end of the message.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {TOKENS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => insert(t.key)}
                  title={t.description}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                    used.includes(t.key)
                      ? "border-cami-violet-5 bg-cami-violet-3 text-cami-violet-11"
                      : "border-border/60 text-muted-foreground hover:bg-muted",
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* top-0 against FullScreenTakeover's own scroll port. */}
        <section className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-0">
          <h3 className="font-heading text-base font-semibold leading-6 text-foreground">
            Preview
          </h3>
          {isEmail ? (
            <EmailPreview
              businessName={businessName}
              subject={resolvedSubject}
              body={resolvedBody}
            />
          ) : (
            <WhatsAppPreview businessName={businessName} body={resolvedBody} />
          )}
          {/* Caveat below the preview, not above it. Above, two lines of prose
              pushed the thing being previewed down the page — and it's a footnote
              you read once, not a heading you read every time. */}
          <p className="text-xs leading-5 text-muted-foreground">
            Sample values shown. A real send uses the booking's own details, and falls back to a
            readable phrase where a value is missing.
          </p>
        </section>
      </div>
    </FullScreenTakeover>
  )
}

// ── List ─────────────────────────────────────────────────────────────────────

function TemplateRow({
  event,
  channel,
  onEdit,
  markOff,
}: {
  event: ReminderEvent
  channel: CommsChannel
  onEdit: () => void
  /**
   * Whether to mark this row's off state at all.
   *
   * False when the whole channel is off. Dimming is a contrast device: it only
   * says "this one differs" while some sibling is undimmed. With all seven
   * dimmed and badged, the tab read as disabled rather than as seven editable
   * templates — and the fact is already stated once, in the card header, where
   * it isn't repeated seven times.
   */
  markOff: boolean
}) {
  const { template, customised } = useCommsTemplates()
  const { events, grant } = useNotifications()
  const { name: businessName } = useDemoBusiness()
  const stored = template(event, channel)
  const edited = customised(event, channel)

  /**
   * Resolved, not raw.
   *
   * Raw is defensible in an editor — it's what you're editing — but in a list
   * row it isn't: `Your appointment at {{business}} is confirmed` costs 13
   * characters of a 90-character line to say a word the reader already knows,
   * and seven rows of it read as markup rather than as messages. The editor is
   * where the placeholders are visible, and that's one click away.
   *
   * Email shows the subject, which the merchant wrote and which distinguishes
   * one template from another. WhatsApp has no subject, so the body does that
   * job — via previewLine(), which drops the shared greeting first.
   */
  const rowText =
    channel === "email" && stored.subject
      ? resolveTemplate(stored.subject, sampleTokens(businessName))
      : excerpt(resolveTemplate(previewLine(stored.body), sampleTokens(businessName)), 90)

  // Effective state from the Reminders matrix: the merchant has to have asked
  // for it AND HQ has to permit the channel. Read, never written, here.
  const sends = channelEnabled({ events, grant }, event, channel) || !markOff
  const ungranted = !grant[channel]

  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/40 py-3 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              sends ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {eventLabel(event)}
          </span>
          {edited ? (
            <Badge variant="primary-soft" size="sm">
              Edited
            </Badge>
          ) : null}
          {/* A badge, not a sentence per row. The full explanation is one line in
              the card header — repeated on all seven rows it doubled every row's
              height and said the same thing seven times, which is exactly what
              the Reminders matrix avoids by keeping one notice per locked
              column rather than one per cell. */}
          {!sends ? (
            <Badge variant="muted" size="sm">
              {ungranted ? "Not enabled" : "Off"}
            </Badge>
          ) : null}
        </div>
        <p
          className={cn(
            "truncate text-xs leading-5",
            sends ? "text-muted-foreground" : "text-muted-foreground/60",
          )}
        >
          {rowText}
        </p>
      </div>
      {/* The in-card action button, 26 call sites deep in this repo
          (sales-settings, notifications Sender ID, client detail …): secondary
          + sm + full, and no icon. */}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        radius="full"
        onClick={onEdit}
        className="shrink-0"
      >
        Edit
      </Button>
    </div>
  )
}

function ChannelCard({
  channel,
  onEdit,
}: {
  channel: CommsChannel
  onEdit: (event: ReminderEvent) => void
}) {
  const Icon = CHANNEL_ICON[channel]
  const { customised } = useCommsTemplates()
  const { events, grant } = useNotifications()
  // Per channel, not the 14-wide total: this card only speaks for its own tab,
  // and a number covering both tabs on one of them is a number that disagrees
  // with what you can see.
  const editedHere = COMMS_EVENTS.filter((e) => customised(e.id, channel)).length
  const offCount = COMMS_EVENTS.filter(
    (e) => !channelEnabled({ events, grant }, e.id, channel),
  ).length
  const ungranted = !grant[channel]
  // All off is the default state for WhatsApp, not an edge case: DEFAULT_EVENTS
  // ships it false on every event. So it has to read as "nothing is switched on
  // yet", not as seven broken rows.
  const allOff = offCount === COMMS_EVENTS.length

  return (
    <section className={cardClass}>
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" aria-hidden />
          <h3 className="font-heading text-lg font-semibold leading-7 text-foreground">
            {COMMS_CHANNEL_LABEL[channel]} templates
          </h3>
          {editedHere > 0 ? (
            <Badge variant="primary-soft" size="sm">
              {editedHere} edited
            </Badge>
          ) : null}
        </div>
        {/* One line, and it earns its place by changing with state. The old
            static blurb ("longer copy belongs here…") repeated what the panel
            description already said and cost the row list ~40px of a 680px
            dialog, which is a row and a half. */}
        <p className="text-sm leading-5 text-muted-foreground">
          {ungranted
            ? `${COMMS_CHANNEL_LABEL[channel]} isn't enabled for your business yet, so none of these send. You can write the copy now and it'll be ready.`
            : allOff
              ? // "7 of 7" is a silly way to say "none". And it's the shipped
                // default for WhatsApp, so it has to sound like a next step
                // rather than a fault.
                `None of these send yet — switch them on under Notifications → Reminders. You can write the copy first.`
              : offCount > 0
                ? `${offCount} of these are switched off under Notifications → Reminders and won't send. You can still edit them.`
                : channel === "email"
                  ? "The subject and body of each automated email."
                  : "The message body for each automated WhatsApp send."}
        </p>
      </header>

      {/* No scroll port here: the panel scrolls, like every other settings panel
          (the three Notifications cards, the Sales sub-screens). The card did
          scroll its rows internally for a while — the Form templates idiom — but
          that card is the whole of its panel, and this one isn't. Inside a fixed
          680px dialog with a header, a tab bar and a card header above it, an
          inner port left ~4 of 7 rows visible while the panel scrolled anyway,
          so there were two scrollbars for one list. And this panel is going to
          gain cards (PRO-865's manual templates), which an inner port doesn't
          scale to. */}
      <div className="flex flex-col">
        {COMMS_EVENTS.map((e) => (
          <TemplateRow
            key={e.id}
            event={e.id}
            channel={channel}
            onEdit={() => onEdit(e.id)}
            markOff={!allOff}
          />
        ))}
      </div>
    </section>
  )
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function CommsTemplatesPanel() {
  const params = useSearchParams()
  const { name: businessName } = useDemoBusiness()
  const { customisedCount, reset } = useCommsTemplates()

  // `?ce=<event>:<channel>` opens straight into one editor, for /screens.
  const deepLinked = useMemo(() => {
    const raw = params.get("ce")
    if (!raw) return null
    const [event, channel] = raw.split(":")
    if (!COMMS_EVENTS.some((e) => e.id === event)) return null
    if (!COMMS_CHANNELS.includes(channel as CommsChannel)) return null
    return { event: event as ReminderEvent, channel: channel as CommsChannel }
  }, [params])

  // A `ce` deep-link implies its own tab, and wins over `ct`. Otherwise closing
  // the WhatsApp editor dropped the reviewer onto the Email tab — the editor
  // they had just been in was nowhere on screen, which reads as the save having
  // gone somewhere else.
  const paramChannel = params.get("ct")
  const [tab, setTab] = useState<CommsChannel>(
    deepLinked?.channel ?? (paramChannel === "whatsapp" ? "whatsapp" : "email"),
  )

  const [editing, setEditing] = useState<{
    event: ReminderEvent
    channel: CommsChannel
  } | null>(deepLinked)

  const total = COMMS_EVENTS.length * COMMS_CHANNELS.length

  return (
    // Same frame as the notifications panel: the panel owns the scroll box inside
    // TabsContent, and the demo row sits outside it.
    <div className="flex h-full min-h-0 flex-col gap-6">
      <header className="flex shrink-0 flex-col gap-2">
        <h2 className="font-heading text-2xl font-semibold leading-8 text-foreground">
          Communication templates
        </h2>
        <p className="max-w-xl text-sm leading-5 text-muted-foreground">
          What {businessName}'s automated messages say. Whether each one sends is set under
          Notifications → Reminders.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as CommsChannel)}
        className="flex min-h-0 flex-1 flex-col gap-5"
      >
        <TabsList variant="underline" className="shrink-0">
          {COMMS_CHANNELS.map((c) => (
            <TabsTrigger key={c} value={c}>
              {COMMS_CHANNEL_LABEL[c]}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* The one scroll port, same as the notifications panel's tab body.
            `pr-1` keeps the scrollbar off the card's edge — without it the track
            sat against the border and read as belonging to the card. */}
        {COMMS_CHANNELS.map((c) => (
          <TabsContent
            key={c}
            value={c}
            className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1"
          >
            <ChannelCard channel={c} onEdit={(event) => setEditing({ event, channel: c })} />
          </TabsContent>
        ))}
      </Tabs>

      {/* No "SMS isn't here yet" notice. It named a Linear ticket to a merchant,
          it described our roadmap rather than their business, and it cost ~75px
          of a 680px dialog — the same row space the list is short of. That SMS
          was excluded deliberately rather than forgotten is a fact for the
          reviewer, so it lives on /screens and in the spec, not in the product. */}

      {/* Prototype demo control (gift-cards convention). Purely an action: the
          count lives on the card header as a badge, because the other panels'
          demo controls are toggles and one that doubles as a statistic reads as
          product chrome rather than a prototype affordance. Hidden with nothing
          to reset — an always-visible "reset all" implies state that isn't
          there. */}
      <div className="flex h-5 shrink-0 items-center justify-end gap-4 pt-2">
        {customisedCount > 0 ? (
          <button
            type="button"
            onClick={reset}
            className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          >
            Demo: reset all {customisedCount === total ? total : customisedCount} edits
          </button>
        ) : null}
      </div>

      {editing ? (
        <TemplateEditor
          event={editing.event}
          channel={editing.channel}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  )
}
