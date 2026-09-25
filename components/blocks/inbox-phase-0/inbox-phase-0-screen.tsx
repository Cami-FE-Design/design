"use client"

import { ChevronDownIcon, FlaskConicalIcon, LockIcon, PowerOffIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"

import {
  buildConversations,
  buildDirectory,
  CURRENT_STAFF,
  DEMO_NOW,
  type DirectoryClient,
  INBOX_TEMPLATES,
  type InboxConversation,
  type InboxCustomer,
  type InboxMedia,
  type InboxMessage,
  windowFrom,
} from "@/app/messages/inbox/phase-0/mock"
import { AppShell } from "@/components/blocks/app-shell"
import { DesignRepoBar } from "@/components/blocks/design-repo-bar"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import { SegmentedToggle } from "@/components/ui/segmented-toggle"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import {
  ClientPane,
  type NewClient,
  type PaneMode,
  type PhoneChoice,
  type VisitsMode,
  type Waiting,
} from "./client-pane"
import { ConversationList } from "./conversation-list"
import { COPY, type Lang } from "./copy"
import { customerName, type PaneStatus } from "./shared"
import { Thread } from "./thread"

// ─── Inbox CRM, Phase 0 — the T1 prototype (ENG3-33) ──────────────────────────
// Everything a reviewer can switch lives in the URL, so every frame T1's
// evidence table asks for is a link:
//   ?state=   a page-level state (loading, empty, error…); default is the live inbox
//   ?c=       which chat is open — the feature states live on the seeded chats
//   ?lang=ar  Arabic, right to left
//   ?pets=off a business without pets
//   ?width=   frame the inbox at 1280 or 1366 wide
//   ?controls=open  open with the design-repo bar showing
//   ?send=    what the next send does: fail, late, window

type Access = "full" | "read-only" | "no-access" | "feature-off"

type Scenario = {
  id: string
  label: string
  note: string
  list: PaneStatus
  thread: PaneStatus
  visits?: VisitsMode
  access?: Access
}

const SCENARIOS: readonly Scenario[] = [
  {
    id: "live",
    label: "Live inbox",
    note: "The seeded inbox. Layla: window open. Maryam: window closes about 2 minutes after load, so start typing to see it close mid-reply. Sara: window closed, templates only. Two unmatched numbers, one with its window closed (name blank). Omar: six months of history and media. Noura: a failed send. Fatima: a name to guess when adding her. Huda: two pets, one number.",
    list: "ready",
    thread: "ready",
  },
  {
    id: "list-loading",
    label: "Loading — first open",
    note: "First read of the chat list and the thread. Skeletons, never a spinner in place of content.",
    list: "loading",
    thread: "loading",
  },
  {
    id: "thread-loading",
    label: "Loading — opening a chat",
    note: "The list is in; the chat just picked is still reading.",
    list: "ready",
    thread: "loading",
  },
  {
    id: "list-empty",
    label: "Empty — no chats yet",
    note: "WhatsApp is connected and nobody has written yet.",
    list: "empty",
    thread: "ready",
  },
  {
    id: "list-error",
    label: "Error — list failed",
    note: "The chat list read failed. Retry refetches; nothing is lost because nothing is stored in the browser.",
    list: "error",
    thread: "ready",
  },
  {
    id: "thread-error",
    label: "Error — chat failed",
    note: "The list is fine; this chat's read failed.",
    list: "ready",
    thread: "error",
  },
  {
    id: "visits-slow",
    label: "Slow — visits read",
    note: "Name, pet and last service paint with the messages; the last visits fill in after, under skeleton rows. Never a spinner where the name should be (IX-C6 edge case).",
    list: "ready",
    thread: "ready",
    visits: "slow",
  },
  {
    id: "visits-error",
    label: "Partial — visits failed",
    note: "The thread and the client's name are in; only the visits read failed, and says so with a retry.",
    list: "ready",
    thread: "ready",
    visits: "error",
  },
  {
    id: "read-only",
    label: "Permission — read only",
    note: "The role has inbox:read but not inbox:reply. Chats read normally; the composer, retry, Match and Add are not offered.",
    list: "ready",
    thread: "ready",
    access: "read-only",
  },
  {
    id: "no-access",
    label: "Permission — no inbox access",
    note: "The role has no inbox:read. The nav entry is hidden; a direct link lands here.",
    list: "ready",
    thread: "ready",
    access: "no-access",
  },
  {
    id: "feature-off",
    label: "Feature off for this business",
    note: "The merchant flag is off: the API answers 403 FEATURE_DISABLED and useHasInbox() reads false, so the nav entry is hidden. A direct link lands here.",
    list: "ready",
    thread: "ready",
    access: "feature-off",
  },
]

const DEFAULT_CHAT = "layla"
/** The app sidebar on this route is collapsed: 68 px. A width frame is the
 *  viewport minus that, so the panes get exactly what they get on a real screen. */
const SIDEBAR_COLLAPSED = 68
const WIDTH_OPTIONS = [
  { value: "fit", label: "Fit" },
  { value: "1280", label: "1280" },
  { value: "1366", label: "1366" },
] as const
type WidthOption = (typeof WIDTH_OPTIONS)[number]["value"]

/** How the next send (or retry) goes — a reviewer's control, like the scenario. */
const SEND_OUTCOMES = [
  { value: "ok", label: "Next send: goes" },
  { value: "fail", label: "Next send: fails" },
  { value: "late", label: "Next send: fails late" },
  { value: "window", label: "Next send: WhatsApp says window closed" },
] as const
type SendOutcome = (typeof SEND_OUTCOMES)[number]["value"]
const SEND_LATENCY_MS = 1200
const LATE_FAILURE_MS = 6000
const CLIENT_LINE_EN = "One more question — is there parking nearby?"
const CLIENT_LINE_AR = "سؤال أخير — هل يوجد موقف سيارات؟"
/** What the client answers when Cami has asked their name (IX-C4 row 4). */
const NAME_REPLY = "It's Rana, thanks!"

const newId = () => `msg-new-${Math.random().toString(36).slice(2, 10)}`

function InboxPhase0() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const scenario = SCENARIOS.find((s) => s.id === params.get("state")) ?? SCENARIOS[0]!
  const lang: Lang = params.get("lang") === "ar" ? "ar" : "en"
  const hasPets = params.get("pets") !== "off"
  const widthParam = params.get("width")
  const width: WidthOption = widthParam === "1280" || widthParam === "1366" ? widthParam : "fit"
  const copy = COPY[lang]

  const go = (next: Record<string, string | null>) => {
    const qs = new URLSearchParams(params.toString())
    for (const [k, v] of Object.entries(next)) {
      if (v === null) qs.delete(k)
      else qs.set(k, v)
    }
    const s = qs.toString()
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false })
  }

  // The seed is anchored to DEMO_NOW; once mounted the clock moves on from it,
  // so a countdown can tick without the server and client disagreeing.
  const mountedAt = useRef<number | null>(null)
  const clock = () =>
    mountedAt.current === null ? DEMO_NOW : DEMO_NOW + (Date.now() - mountedAt.current)
  const [now, setNow] = useState(DEMO_NOW)
  useEffect(() => {
    mountedAt.current = Date.now()
    const id = window.setInterval(
      () => setNow(DEMO_NOW + (Date.now() - (mountedAt.current ?? 0))),
      5_000,
    )
    return () => window.clearInterval(id)
  }, [])

  const [seed] = useState(() => {
    const chats = buildConversations()
    return { chats, directory: buildDirectory(chats) }
  })
  const [conversations, setConversations] = useState<InboxConversation[]>(seed.chats)
  const [directory, setDirectory] = useState<DirectoryClient[]>(seed.directory)
  const [paneMode, setPaneMode] = useState<PaneMode>("summary")
  const [waiting, setWaiting] = useState<Record<string, Waiting>>({})
  const [retrying, setRetrying] = useState(false)
  const outcome: SendOutcome =
    SEND_OUTCOMES.find((o) => o.value === params.get("send"))?.value ?? "ok"

  const listStatus: PaneStatus = retrying ? "loading" : scenario.list
  const threadStatus: PaneStatus = retrying ? "loading" : scenario.thread
  const visible = listStatus === "empty" ? [] : conversations
  const selectedId = listStatus === "empty" ? null : (params.get("c") ?? DEFAULT_CHAT)
  const selected = useMemo(
    () => visible.find((c) => c.publicId === selectedId) ?? null,
    [visible, selectedId],
  )

  // An open chat is a read chat — whether it was clicked in the list or opened
  // straight from a link.
  useEffect(() => {
    if (!selectedId) return
    setConversations((prev) =>
      prev.map((c) =>
        c.publicId === selectedId && c.unreadCount > 0 ? { ...c, unreadCount: 0 } : c,
      ),
    )
  }, [selectedId])

  function retry() {
    setRetrying(true)
    window.setTimeout(() => {
      setRetrying(false)
      go({ state: null })
    }, 900)
  }

  function update(id: string, mutate: (c: InboxConversation) => InboxConversation) {
    setConversations((prev) => prev.map((c) => (c.publicId === id ? mutate(c) : c)))
  }

  function patchMessage(convId: string, msgId: string, patch: Partial<InboxMessage>) {
    update(convId, (c) => ({
      ...c,
      messages: c.messages.map((m) => (m.publicId === msgId ? { ...m, ...patch } : m)),
    }))
  }

  function select(id: string) {
    setPaneMode("summary")
    update(id, (c) => ({ ...c, unreadCount: 0 }))
    go({ c: id === DEFAULT_CHAT ? null : id })
  }

  /** What the provider does with one attempt. A retry is another attempt of
   *  the same message (same idempotency key), so it lands on the same bubble. */
  function attempt(convId: string, msg: InboxMessage) {
    window.setTimeout(() => {
      if (outcome === "fail") {
        patchMessage(convId, msg.publicId, {
          deliveryState: "failed",
          failureCode: "PROVIDER_REJECTED",
        })
      } else if (outcome === "window" && !msg.templateCode) {
        // WhatsApp's "outside the window" is final: the window closes now for
        // this chat, and the composer shows the same closed state as a
        // countdown that ran out. Templates are allowed outside it, so they go.
        patchMessage(convId, msg.publicId, {
          deliveryState: "failed",
          failureCode: "WINDOW_CLOSED",
        })
        update(convId, (c) => ({ ...c, windowClosesAt: new Date(clock()).toISOString() }))
      } else {
        patchMessage(convId, msg.publicId, { deliveryState: "sent" })
        if (outcome === "late") {
          // The failure arrives minutes later as a status webhook (IX-A5 edge case).
          window.setTimeout(
            () =>
              patchMessage(convId, msg.publicId, {
                deliveryState: "failed",
                failureCode: "PROVIDER_REJECTED",
              }),
            LATE_FAILURE_MS,
          )
        }
      }
    }, SEND_LATENCY_MS)
  }

  function sendMessage(body: string | null, templateCode: string | null, media?: InboxMedia[]) {
    if (!selected) return
    const id = selected.publicId
    const message: InboxMessage = {
      publicId: newId(),
      direction: "outbound",
      origin: "live",
      sentFromPhoneApp: false,
      sentByStaffName: CURRENT_STAFF,
      body,
      templateCode,
      deliveryState: "pending",
      retryCount: 0,
      failureCode: null,
      providerSentAt: new Date(clock()).toISOString(),
      media,
    }
    update(id, (c) => ({
      ...c,
      messages: [...c.messages, message],
      lastMessageAt: message.providerSentAt,
    }))
    attempt(id, message)
  }

  /** Text alone, or one message per file with the text as the first caption. */
  function sendText(body: string, media: InboxMedia[]) {
    if (media.length === 0) {
      sendMessage(body, null)
      return
    }
    for (const [i, m] of media.entries()) {
      sendMessage(i === 0 && body ? body : null, null, [m])
    }
  }

  function retrySend(messageId: string) {
    if (!selected) return
    const msg = selected.messages.find((m) => m.publicId === messageId)
    if (!msg) return
    patchMessage(selected.publicId, messageId, {
      deliveryState: "pending",
      failureCode: null,
      retryCount: msg.retryCount + 1,
    })
    attempt(selected.publicId, msg)
  }

  /** The client writes: the window resets to 24 h from now (IX-A2 edge case). */
  function clientWrites() {
    if (!selected) return
    const at = new Date(clock()).toISOString()
    const message: InboxMessage = {
      publicId: newId(),
      direction: "inbound",
      origin: "live",
      sentFromPhoneApp: false,
      sentByStaffName: null,
      body: waiting[selected.publicId]
        ? NAME_REPLY
        : lang === "ar"
          ? CLIENT_LINE_AR
          : CLIENT_LINE_EN,
      templateCode: null,
      deliveryState: "sent",
      retryCount: 0,
      failureCode: null,
      providerSentAt: at,
    }
    update(selected.publicId, (c) => ({
      ...c,
      messages: [...c.messages, message],
      lastMessageAt: at,
      lastInboundAt: at,
      windowClosesAt: windowFrom(at),
    }))
    // Waiting for a name: the reply is what the form was waiting for.
    const w = waiting[selected.publicId]
    if (w) setWaiting((all) => ({ ...all, [selected.publicId]: { ...w, repliedAt: at } }))
  }

  // ─── Identity (IX-C3, IX-C4) — every change kept, with who and when ─────────

  function matchChat(client: DirectoryClient, choice: PhoneChoice) {
    if (!selected) return
    const at = new Date(clock()).toISOString()
    const previous = customerName(selected)
    const name = [client.firstName, client.lastName].filter(Boolean).join(" ")
    const customer: InboxCustomer = {
      publicId: client.publicId,
      firstName: client.firstName,
      lastName: client.lastName,
      pets: client.pets,
      lastService: client.lastService,
      nextBooking: client.nextBooking,
    }
    update(selected.publicId, (c) => ({
      ...c,
      customer,
      events: [
        ...c.events,
        {
          publicId: newId(),
          kind: previous ? "rematched" : "matched",
          actorName: CURRENT_STAFF,
          at,
          customerName: name,
          previousCustomerName: previous ?? undefined,
        },
      ],
    }))
    // The number is saved on the client (IX-C3 row 2), unless Keep was chosen.
    if (choice === "save" || choice === "replace") {
      const phone = selected.phoneE164
      setDirectory((d) =>
        d.map((x) => (x.publicId === client.publicId ? { ...x, phoneE164: phone } : x)),
      )
    }
    stopWaiting()
  }

  function createClient(nc: NewClient) {
    if (!selected) return
    const at = new Date(clock()).toISOString()
    const created: DirectoryClient = {
      publicId: `cus-new-${Math.random().toString(36).slice(2, 8)}`,
      firstName: nc.firstName,
      lastName: nc.lastName || null,
      pets: nc.pet ? [{ name: nc.pet.name, species: nc.pet.species, breed: "" }] : [],
      phoneE164: selected.phoneE164,
      email: null,
      archived: false,
      homeLocation: null,
      lastService: null,
      nextBooking: null,
    }
    setDirectory((d) => [...d, created])
    const { phoneE164: _p, email: _e, archived: _a, homeLocation: _h, ...customer } = created
    update(selected.publicId, (c) => ({
      ...c,
      customer,
      events: [
        ...c.events,
        {
          publicId: newId(),
          kind: "created",
          actorName: CURRENT_STAFF,
          at,
          customerName: [nc.firstName, nc.lastName].filter(Boolean).join(" "),
        },
      ],
    }))
    stopWaiting()
  }

  /** IX-C4 row 4 / P10. Window open: the question goes as a message. Closed:
   *  nothing is sent, and the form waits. */
  function askName() {
    if (!selected) return
    const at = new Date(clock()).toISOString()
    if (windowOpen) sendMessage(COPY.en.askNameText, null)
    setWaiting((w) => ({ ...w, [selected.publicId]: { askedAt: at, sent: windowOpen } }))
  }

  /** The closed-window question as a template — IX-A4's half of P10. */
  function sendAskTemplate() {
    if (!selected) return
    const t = INBOX_TEMPLATES.find((x) => x.code === "ask_name")!
    sendMessage(t.body, t.code)
    const at = new Date(clock()).toISOString()
    setWaiting((w) => ({ ...w, [selected.publicId]: { askedAt: at, sent: true } }))
  }

  function stopWaiting() {
    if (!selected) return
    const id = selected.publicId
    setWaiting((w) => {
      const { [id]: _gone, ...rest } = w
      return rest
    })
  }

  const windowOpen = !!selected?.windowClosesAt && now < Date.parse(selected.windowClosesAt)
  const access: Access = scenario.access ?? "full"
  // ?controls=open — a walkthrough link that needs "Client writes now" or
  // "Next send" opens with the bar already showing.
  const [showControls, setShowControls] = useState(params.get("controls") === "open")
  const frameWidth = width === "fit" ? undefined : Number(width) - SIDEBAR_COLLAPSED

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 bg-sand-3 p-3">
      {/* A slim page header: the panes are the page. The design-repo controls
          fold into one dashed chip, so the product is what the eye lands on. */}
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        lang={lang}
        className="flex items-center gap-3 px-2 pt-1"
      >
        <h1 className="text-xl font-medium text-foreground">{copy.inbox}</h1>
        <button
          type="button"
          aria-expanded={showControls}
          onClick={() => setShowControls((v) => !v)}
          className="ms-auto inline-flex max-w-full items-center gap-1.5 rounded-full border border-dashed border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/60"
        >
          <FlaskConicalIcon className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            Design repo · {scenario.label} · {lang === "ar" ? "Arabic" : "English"}
            {width !== "fit" ? ` · ${width}` : ""}
            {outcome !== "ok"
              ? ` · ${SEND_OUTCOMES.find((o) => o.value === outcome)?.label.toLowerCase()}`
              : ""}
          </span>
          <ChevronDownIcon
            className={cn("size-3.5 shrink-0 transition-transform", showControls && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>
      {showControls ? (
        <DesignRepoBar
          label="switch the state, what the next send does, language and frame width"
          note={scenario.note}
        >
          <Select value={scenario.id} onValueChange={(v) => go({ state: v === "live" ? null : v })}>
            <SelectTrigger size="sm" className="w-60">
              <SelectValue>{scenario.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SCENARIOS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={outcome} onValueChange={(v) => go({ send: v === "ok" ? null : v })}>
            <SelectTrigger size="sm" className="w-72">
              <SelectValue>{SEND_OUTCOMES.find((o) => o.value === outcome)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SEND_OUTCOMES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            radius="full"
            disabled={!selected || threadStatus !== "ready"}
            onClick={clientWrites}
          >
            Client writes now
          </Button>
          <SegmentedToggle
            size="sm"
            ariaLabel="Language"
            value={lang}
            onValueChange={(v) => go({ lang: v === "ar" ? "ar" : null })}
            options={[
              { value: "en", label: "English" },
              { value: "ar", label: "العربية" },
            ]}
          />
          <SegmentedToggle
            size="sm"
            ariaLabel="Pets feature"
            value={hasPets ? "on" : "off"}
            onValueChange={(v) => go({ pets: v === "off" ? "off" : null })}
            options={[
              { value: "on", label: "With pets" },
              { value: "off", label: "Without pets" },
            ]}
          />
          <SegmentedToggle
            size="sm"
            ariaLabel="Frame width"
            value={width}
            onValueChange={(v) => go({ width: v === "fit" ? null : v })}
            options={WIDTH_OPTIONS}
          />
        </DesignRepoBar>
      ) : null}

      {access === "no-access" || access === "feature-off" ? (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-border bg-card">
          <EmptyState
            icon={access === "no-access" ? LockIcon : PowerOffIcon}
            title={access === "no-access" ? copy.noAccessTitle : copy.featureOffTitle}
            description={access === "no-access" ? copy.noAccessBody : copy.featureOffBody}
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 justify-center overflow-x-auto">
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            lang={lang}
            style={frameWidth ? { width: frameWidth } : undefined}
            className={cn(
              "flex min-h-0 shrink-0 gap-3",
              frameWidth
                ? "rounded-2xl outline-1 outline-offset-4 outline-border outline-dashed"
                : "w-full",
            )}
          >
            <ConversationList
              status={listStatus}
              conversations={visible}
              selectedId={selected?.publicId ?? null}
              onSelect={select}
              onRetry={retry}
              copy={copy}
              lang={lang}
              now={now}
            />
            <Thread
              status={listStatus === "loading" ? "loading" : threadStatus}
              conversation={selected}
              now={now}
              onSendText={sendText}
              onSendTemplate={(code, body) => sendMessage(body, code)}
              onRetrySend={retrySend}
              onMatch={() => setPaneMode("match")}
              onRetry={retry}
              canReply={access === "full"}
              noChats={listStatus === "empty"}
              copy={copy}
              lang={lang}
            />
            <ClientPane
              status={
                listStatus === "loading" || threadStatus === "loading" ? "loading" : threadStatus
              }
              conversation={selected}
              directory={directory}
              mode={access === "full" ? paneMode : "summary"}
              onModeChange={setPaneMode}
              waiting={selected ? (waiting[selected.publicId] ?? null) : null}
              windowOpen={windowOpen}
              hasPets={hasPets}
              visitsMode={scenario.visits ?? "normal"}
              canEdit={access === "full"}
              now={now}
              copy={copy}
              lang={lang}
              onMatch={matchChat}
              onCreate={createClient}
              onAskName={askName}
              onSendAskTemplate={sendAskTemplate}
              onStopWaiting={stopWaiting}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function InboxPhase0Screen() {
  return (
    <AppShell header={null} contentClassName="px-0 pb-0">
      {/* The design-repo bar reads the query string, so it needs a boundary. */}
      <Suspense fallback={null}>
        <InboxPhase0 />
      </Suspense>
    </AppShell>
  )
}
