# Messages — Inbox — Design Spec

**Linear**: _TBD_ (Messages module · Inbox)
**Milestone**: Messages · **Project**: v0 Web OS for a single branch
**Branch**: `feature/messages-inbox` (off latest `main`)
**Inherits from**: `appointment-quick-messages.md` (WhatsApp templates + `{{token}}` resolver — reused here), cami avatar / status-pill / client-detail patterns

## Status

First-pass spec from two references. Source of truth for the Inbox surface. Code follows this.

---

## References

| Ref | App | Role |
|---|---|---|
| Image 1 | cami AI-forward concept | **Primary target.** WhatsApp inbox with SLA timers, escalation, AI draft reply, AI-parsed booking-request cards, funnel status. Build this layout + aesthetic. |
| Image 2 | Moego | **Baseline layer.** Informs the right client panel: appointment accordion, per-pet note tabs, lifetime stat grid, tags. |

Channel scope: **WhatsApp only** in v0. No Email/SMS toggle. Channel marker still rendered (a WhatsApp glyph) so multi-channel can layer in later without restructuring.

---

## Layout

Three vertical panes filling the AppShell content area, full height, no page header. Built inside `AppShell` (existing sidebar + topbar stay).

```
┌──────────────┬─────────────────────────────┬──────────────────┐
│ Conversation │ Conversation thread         │ Client panel     │
│ list (~320)  │ (flex-1)                    │ (~320, toggle)   │
└──────────────┴─────────────────────────────┴──────────────────┘
```

- **Left — conversation list**: fixed ~320px, own scroll.
- **Center — thread**: flex-1, header (sticky) + scrolling message area + sticky composer.
- **Right — client panel**: ~320px, own scroll. Toggled by the **Details** button in the thread header (default open on desktop ≥1280px, closed below).
- Below ~1024px the three panes collapse to one at a time (list → thread → client) with back navigation. Mobile polish is a later pass; v0 targets desktop.

---

## Pane 1 — Conversation list

**Header**: title "Inbox", subcount "23 conversations", search input "Search conversations…" (filters by client name / preview / pet).

**Row** (per conversation): 
- Avatar (person → character-face per cami avatar rule; hashed pastel bg).
- Name (semibold) + relative time (right, muted: `30m`, `1m`, `2h`).
- Preview line — last message, truncated. `@mention` rendered subtly when a teammate is addressed (e.g. "@Sarah Hassan can you take this one?").
- **Pill row**: funnel/lifecycle pills + SLA timer + assignment. See pill vocab below.
- **Unread dot**: violet dot, right edge, when unread.
- Selected row: violet-tinted background (`bg-cami-violet-3`-ish), matches Image 1.

**Pill vocabulary** (left list + thread header share tokens):

| Group | Values | Meaning |
|---|---|---|
| Funnel status | `New Inquiry` · `Engaged` · `Quoted` · `Scheduled` · `Closed` | Where the lead sits in the booking funnel. Color-keyed. |
| Routing | `Escalated` (amber, ⚠) · `Unassigned` · `<Staff name>` (assignee chip w/ avatar) | Who owns the conversation. |
| SLA | `23h` / `23h 57m remaining` (clock icon) | Time left to respond before the WhatsApp 24h service window closes. Amber < 4h, red < 1h. |
| State | `Open` · `Closed` | Conversation open/resolved. |

Pills are **display + filter** in v0. Changing them is wired in the thread header / client panel, not the list.

---

## Pane 2 — Conversation thread

### Header (sticky)
- Left: avatar, client name, `Open` state badge, SLA `23h 57m remaining` chip, funnel pill (`Engaged`). Sub-line: WhatsApp glyph · phone · linked pet names ("Max, Luna").
- Right cluster: **Auto-confirm** toggle (`Off`/`On`), **Escalate to <staff>** button (amber), help (?), kebab (⋯), **Details** toggle (opens/closes right pane).

### Message area
Scrolling, grouped by **date separators** (`FRIDAY, JUN 19`, `YESTERDAY`, `TODAY`).

Message types:
1. **Inbound bubble** — left-aligned, neutral surface (`bg-card`/gray), client text, timestamp below.
2. **Outbound bubble** — right-aligned, brand-tinted (reuse the sage WhatsApp bubble from the send dialog), timestamp + delivered ticks.
3. **Booking-request card** — AI-parsed structured card inside the thread. Header "BOOKING REQUEST" + time, sparkle icon. Body: pet · breed, service, requested date/time. Actions: **Confirm** (primary) / **Reject** (outline). **Confirm → opens the new-appointment sheet (`NewAppointmentSheet`) pre-filled** with the parsed client, pet, service, and requested date/time; on save the card flips to a confirmed state and a system line records it. Reject → card flips to rejected + system line.
4. **System line** — centered, muted, pill-ish: "Reminder sent: Max · Full Grooming · Tomorrow", "Conversation escalated to Kristine", etc. Non-interactive.

### Composer (sticky bottom)
- Multiline textarea "Type a message…". `⌘/Ctrl + Enter` to send (hint shown top-right of composer).
- Footer row: **Templates** (opens the WhatsApp template list from `appointment-quick-messages` — reuse `MOCK_WHATSAPP_TEMPLATES` + `resolveTemplate`; picking one fills the composer), **attach** (paperclip), **AI draft reply** (sparkle, violet) , **Send** (primary, paper-plane).
- Send appends an outbound bubble (mock), clears composer.

---

## Pane 3 — Client panel (Details)

Reuses cami client-detail content, inline (not a dialog). Sections top→bottom:

- **Identity**: large avatar, name, phone, email, `WhatsApp preferred` badge.
- **Funnel status**: dropdown (`New Inquiry`/`Engaged`/`Quoted`/`Scheduled`/`Closed`) — the one place funnel status is edited; updates the list pill + thread header.
- **Client type**: `Repeat` / `New` pill + "since Mar 2025".
- **Activity** (stat grid, Moego baseline): Last visit, Visits, Avg ticket, Lifetime (AED).
- **Pets (N)**: per-pet card — species icon, name, breed, **care note** (e.g. "Friendly, loves treats. Mild hip dysplasia — no jumping."). Pet ⇄ client is many-to-many per cami model.
- **Tags**: removable chips (`VIP ×`, `Grooming ×`) + `+ Add tag`.
- **Internal notes**: free-text, team-only. Empty state "No notes yet".

The Moego per-pet **note tabs** + **Appointments accordion** (Next / Last appointment) are folded into the Pets and Activity sections respectively.

---

## Data model (mock)

New mock module `app/messages/mock.ts` (or `lib/messages-mock.ts`). Reuses `WhatsAppTemplate` from appointments.

```ts
type FunnelStatus = "new-inquiry" | "engaged" | "quoted" | "scheduled" | "closed"
type ConversationState = "open" | "closed"

type Conversation = {
  id: string
  client: ClientContext        // identity + funnel + activity + pets + tags + notes
  preview: string
  lastAt: string               // relative label seed
  unread: boolean
  state: ConversationState
  funnel: FunnelStatus
  escalatedTo?: string         // staff name
  assignee?: string            // staff name; undefined = Unassigned
  slaRemainingMin: number      // drives the SLA chip + color
  messages: ThreadItem[]
}

type ThreadItem =
  | { kind: "message"; dir: "in" | "out"; body: string; at: string }
  | { kind: "booking-request"; petName: string; petBreed: string; service: string; requestedAt: string; status: "pending" | "confirmed" | "rejected"; at: string }
  | { kind: "system"; body: string; at: string }
```

~10 seeded conversations covering each funnel status, escalated/unassigned/assigned, varied SLA colors, at least one with a pending booking-request card, multi-pet clients.

---

## Routing + nav

- Page at `app/messages/inbox/page.tsx` → `/messages/inbox`.
- Wire `lib/app-menu.ts` Messages children hrefs: `Inbox → /messages/inbox` (others stubbed or left hrefless until built).
- Resolves the `appointment-quick-messages` follow-up: the **Message center** link now lands somewhere real.

---

## v0 scope

**Functional (mocked data, real interaction):**
- Browse + search conversation list, select a conversation.
- Read threaded messages with date grouping, all four item types.
- Type + Send → appends outbound bubble.
- Templates picker fills composer (reuses existing templates).
- Confirm / Reject a booking-request card → updates card + system line.
- Toggle the Details (client) pane.
- Edit funnel status from the client panel → reflects in list + header.
- Add / remove tags, edit internal notes (local state).

**Visual stub (no real automation — per "don't worry about automation yet"):**
- **AI draft reply** — button present; v0 fills the composer with a canned suggestion, no model call.
- **Auto-confirm** toggle — visual only.
- **Escalate to <staff>** — appends a system line + sets the routing pill; no real assignment engine.
- **SLA timers** — static seeded values, not live-counting.

## Out of scope (v0)
- Email / SMS channels (WhatsApp only).
- Outbound / Reminder Log / Photos / Campaigns tabs (siblings; separate work).
- Real WhatsApp Business API send/receive, delivery webhooks.
- Mass text / broadcast (Moego's "Mass Text").
- Mobile-optimized single-pane flow (desktop-first v0).
- Real AI parsing / drafting / routing.

## Decisions locked
- **Booking-request Confirm** → opens `NewAppointmentSheet` pre-filled (client, pet, service, date/time). Card confirms on save.
- **SLA timer** = WhatsApp **24h customer-service window**. After a client's inbound message, free-form replies allowed for 24h; afterward only approved templates. Timer counts that window down. Amber < 4h, red < 1h. (Seeded static in v0, not live-ticking.)
- **Assignment** = single owner per conversation (`assignee`, or `Unassigned`) + optional **escalation** target (senior staff). No multi-owner.

## Open questions
1. **Linear issue / PRO number** — assign so the spec + branch can reference it. (Left TBD for now.)
