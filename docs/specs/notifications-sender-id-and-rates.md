# Notification configuration — Sender ID, channel controls, rates

> **Built.** All six surfaces ship. Merchant: `components/blocks/notifications-settings-panel.tsx`
> (Business Settings › Notifications) and notification events in
> `components/blocks/appointment-detail-sheet.tsx`. Cami HQ: the Notifications tab
> in `components/blocks/business-detail-dialog.tsx`, the Sender ID field in
> `components/blocks/new-business-sheet.tsx`, the rates panel in
> `components/blocks/admin-settings-dialog.tsx`, and the new `/admin/billing`
> route. Model in `lib/notifications/types.ts`, merchant provider in
> `lib/notifications/store.tsx`, platform rate list in
> `lib/notifications/hq-store.tsx`, per-partner config on
> `AdminBusiness.notifications`.
> Reviewable from `/screens` under "Pet Business, notifications" and "Cami HQ,
> notification control plane". Known gaps are marked in place below.

Follow-on to the Notifications & Reminders sign-off. Everything here was
**explicitly excluded** from that sign-off (Ahsan, standup) but the backend is
largely built, so the UI is the blocker for frontend integration.

Covers three questions raised in the thread that the shipped reminder work
doesn't answer:

1. Where do notification messages live, and how does a merchant trace one back
   to an appointment?
2. Where does a merchant turn SMS/Email on and off, and where does the Sender ID
   get set?
3. Where does Cami HQ set rates per merchant, and where does the merchant see
   what they've consumed?

Split across two portals: three merchant surfaces, three HQ surfaces.

## Problem

Reminders send, but nothing around them is configurable or inspectable.

1. **The Sender ID has no home.** UAE SMS requires a registered Sender ID per
   merchant, and registration is a slow external process with no committed ETA.
   Every merchant currently sends under whatever the backend defaults to, with
   no way to enter their own and no way to see where their registration stands.
2. **Sent messages are invisible.** A merchant who is billed per SMS cannot see
   what was sent, to whom, or whether it was delivered. Consumption is billed
   monthly against a number nobody can audit.
3. **HQ has no per-merchant control plane.** Rates are global-by-omission, and
   HQ cannot disable a channel for one merchant — which matters most when that
   merchant's Sender ID is rejected and their SMS would send under the wrong
   brand.

## Scope

| | Merchant (Cami Business) | Cami HQ |
| --- | --- | --- |
| Sender ID | Set / update, see registration state | Approve / reject, capture at onboarding |
| Channel toggles | Per-event × per-channel | Per-merchant master kill switch |
| Rates | See own rate, read-only | Set global + per-merchant override |
| Consumption | Own usage, own log | Per-merchant, billing view |

Out of scope for this pass, flagged so the omission is deliberate:

- **Message template editing.** Merchants toggle *whether* an event sends, not
  *what it says*. Templates are a separate editor with variable interpolation,
  per-locale copy, and a preview — a different ticket. This spec's Reminders
  card degrades gracefully into a row of template links when that lands.
- **Invoice rendering.** Maaz confirmed an invoice is generated at month end;
  its layout belongs with the rest of Cami Pay billing, not here. This spec
  stops at the consumption table the invoice is computed from.
- **Onboarding flow redesign.** Sender ID capture is one required field added to
  the existing new-business flow. Maaz: "let's add this in the Business
  Settings, we can come back to Onboarding screens later."
- **WhatsApp templates and opt-in.** WhatsApp appears as a channel column
  throughout, because maaz named all three and rates are quoted for all three.
  Its Meta-side template approval is its own integration ("Reminders, Payments
  and META are 3 third party integrations required per merchant") and isn't
  modelled here.

## The two-speed Sender ID

The thread's short/mid/long-term framing is not three designs — it's one design
whose state machine happens to have a slow transition in the middle.

| Registration | What sends | Merchant sees |
| --- | --- | --- |
| `not-submitted` | `CAMI` | Field is empty and editable. Notice: messages send as **CAMI** until you add one. |
| `submitted` | `CAMI` | Field shows their value, locked, `Pending` pill. Notice explains registration is with the carrier. |
| `approved` | their Sender ID | Field shows their value, `Approved` pill, Edit re-opens the cycle. |
| `rejected` | `CAMI` | Field editable again, `Rejected` pill, notice carries HQ's reason. |

Consequences worth stating:

- **`CAMI` is the fallback in three of four states**, so it is not an error
  state to design around — it's the default the product ships on. Maaz's
  short-term ask ("just enable SMS in UAE") is satisfied by
  `not-submitted` working properly, not by a separate interim screen.
- The merchant can **always see which name their customers will see**, which is
  the only question this card really has to answer.
- Registration is decided in HQ, so `submitted → approved | rejected` is an HQ
  action. The merchant cannot self-approve, and the field is locked while
  pending so a merchant cannot quietly change the value under a live
  registration.

Validation runs at input time, per GNK: 3–11 characters, alphanumeric, no
spaces, and not a reserved word. Validated against the merchant on submit, not
inferred from their business name — "rather than inferring branding preferences,
we should request the sender ID directly from the merchant."

## Model

```ts
type NotificationChannel = "email" | "sms" | "whatsapp"

type ReminderEvent =
  | "booking-confirmed"
  | "reminder-24h"
  | "reminder-2h"
  | "cancelled"
  | "no-show"
  | "review-request"
  | "receipt"

type SenderId = {
  value: string | null                  // null → sends as CAMI
  status: "not-submitted" | "submitted" | "approved" | "rejected"
  rejectionReason?: string              // HQ-authored, shown to the merchant
  submittedAt?: string
}

type NotificationSettings = {
  senderId: SenderId
  // merchant intent, per event per channel
  events: Record<ReminderEvent, Record<NotificationChannel, boolean>>
}

// HQ-owned, read by the merchant UI to lock rows
type ChannelGrant = Record<NotificationChannel, boolean>

type NotificationRate = {
  channel: NotificationChannel
  country: string                       // UAE SMS is the reason this is per-country
  amount: number                        // AED per message
}

type NotificationEvent = {
  id: string
  channel: NotificationChannel
  event: ReminderEvent
  appointmentId: string | null           // null for non-appointment sends
  recipient: string                      // phone or email, as sent
  body: string
  sentAt: string
  status: "queued" | "sent" | "delivered" | "failed"
  failureReason?: string
  cost: number                           // AED, rate at send time
}
```

Two decisions in that shape:

**Merchant intent and HQ grant are separate fields, never merged.** A merged
boolean would lose the difference between "the merchant turned this off" and
"HQ disabled the channel", and re-enabling at HQ would silently resurrect events
the merchant had deliberately switched off. Effective state is
`events[event][channel] && grant[channel]`, computed at render.

**`cost` is stamped on the event, not derived from the current rate.** A rate
change must not retroactively rewrite last month's consumption, or the
merchant's log stops reconciling against their invoice.

## Merchant — Settings › Notifications

New group in the settings rail in `components/blocks/app-settings-dialog.tsx`,
between **Payments** and **Forms**. `BellIcon`. Description: *"Sender ID,
reminder channels, and your message usage."*

The panel follows the shared `w-146` settings-card footprint and the
`SettingsRow` 16rem grid. Two tabs — **Settings** and **Log** — because the log
is a scanning surface with filters and doesn't belong stacked under three
configuration cards.

### Settings tab

**Card 1 — Sender ID.** One `max-w-md` field, status pill in the card header,
one `Edit` per card per convention. Under the field, a tinted notice
(`rounded-xl bg-cami-{color}-2 p-3`, no accent border — copy the
terminal-pairing-panel blocks) carrying the state's explanation from the table
above. Colour tracks state: neutral for `not-submitted`, yellow for `submitted`,
green for `approved`, red for `rejected`.

**Card 2 — Reminders.** A matrix, events down, channels across:

```
┌──────────────────────────────────────────────────────────────┐
│ Reminders                                          [Edit]    │
│ Which messages go out, and how.                              │
│                                                              │
│                              Email      SMS     WhatsApp     │
│ Booking confirmed             [on]      [on]      [off]      │
│ Reminder — 24h before         [on]      [on]      [off]      │
│ Reminder — 2h before          [on]     [off]      [off]      │
│ Cancelled                     [on]     [off]      [off]      │
│ No-show                       [on]     [off]      [off]      │
│ Review request                [on]     [off]      [off]      │
│ Receipt                       [on]     [off]      [off]      │
│                                                              │
│  ⓘ  WhatsApp isn't enabled for your business. Contact        │
│     support to turn it on.                                   │
└──────────────────────────────────────────────────────────────┘
```

A column HQ has not granted renders **off, disabled, and dimmed**, with one
notice under the matrix naming the ungranted channels. Not a hidden column: a
merchant who has been told Cami supports WhatsApp needs to see it exists and
that the block is on Cami's side, otherwise the absence reads as a missing
feature and generates a support ticket. The notice is the only place the word
"support" appears, because it's the only action available.

**Below `sm` the matrix stacks.** The column layout needs ~300px of fixed width
(label column + 3×88px + gaps) and a phone leaves ~272px inside the dialog and
card padding, so it overflowed. Each event becomes a block — title, then its
three switches with their own labels — via one tree, not two: the channel
wrapper is `sm:contents`, so at `sm` and up its children promote into the row's
grid cells and the table reappears unchanged.

Deliberately not an `overflow-x` container. A horizontally scrolling settings
table is the wrong answer on the device maaz prioritised ("mobile-optimised
journey on Appointment to Checkout" comes before this spec). The mobile-only
switch labels matter for the same reason as the visible ungranted column: three
unlabelled switches with one disabled reads as broken rather than as WhatsApp
being off.

Rate per channel sits as muted helper text under each column header
(`AED 0.12 / msg`) — read-only. Stacked, the rates collapse to one summary line
under the list rather than repeating on all seven rows. The merchant sees their rate here and their
spend in Card 3; they never set either.

**Card 3 — Usage this month.** Counts per channel and the running AED total,
plus the billing period and a line stating the invoice is issued at month end.
A `View log` link crosses to the Log tab. Read-only; this is a receipt, not a
control. A granted channel with nothing sent reads "Nothing sent yet" and its
price rather than `0 sent at AED 0.09 each`, which is arithmetic nobody asked
for; an ungranted channel is absent, because there is nothing to bill.

**The totals do not come from the log.** `periodUsage` is its own aggregate.
A real month is hundreds of sends and the log is paginated, so summing whatever
rows happen to be loaded under-reports the invoice by an order of magnitude —
the first build did exactly that and showed AED 0.49 for a month that cost
AED 42.92. The demo numbers match Shampooch's `usage` in
`lib/admin-businesses.ts`, so the merchant's "Total so far" and that partner's
row on `/admin/billing` agree to the fils.

### Log tab

The business-wide answer to "did today's reminders actually go out?", which the
per-appointment timeline structurally cannot give.

Filterable list: date, channel, event, recipient, status, cost. Filters on
channel and status. Failed rows carry `failureReason` inline rather than behind a
tooltip — a failure is the one row type someone is actively hunting for.

The footer says "your most recent sends", not "every message this period".
Claiming completeness next to a Usage card whose totals are deliberately larger
would make the two surfaces look like they disagree.

No send exists on an ungranted channel — the demo log carries no WhatsApp row
while WhatsApp is ungranted, because the grant model can't produce one. The
`queued` example sits on SMS instead.

## Merchant — appointment activity timeline

Notification sends become events in the existing `ActivityPanel`
(`components/blocks/appointment-detail-sheet.tsx`). No new route and no new
component: the panel already models `{ id, title, timestamp, body }` and already
opens from the detail sheet via a `mode` swap.

**Where this actually lives.** `AppointmentDetailSheet` is reached from
`/sales/appointments-list` (also the reports tables and global search), *not* from
the `/appointments` calendar — that opens `NewAppointmentSheet`, which has no
activity panel. Worth stating because the two sheets look alike and the calendar
is the obvious place to go looking.

## Deep links

Every surface in this spec opens from a URL. "Open X, then click Y" is not a
link — a reviewer following one shouldn't have to hunt, and three of these
needed new params to make that true:

| Link | Opens |
| --- | --- |
| `?settings=notifications` | Merchant settings |
| `?settings=notifications&nt=sender` | Sender ID dialog |
| `?settings=notifications&nt=log` | Log tab |
| `?settings=notifications&nr=hidden` | Prices withheld (see open questions) |
| `/sales/appointments-list?ref=b-002&view=activity` | **New.** The activity timeline itself, not the sheet it hides behind |
| `/admin/businesses?business=<slug>&section=notifications` | **New.** The partner's Notifications tab. `section`, not `tab` — the roster already owns `tab` |
| `/admin/businesses?new=1` | **New.** The create sheet, where the onboarding Sender ID field lives |
| `/admin/businesses?settings=notification-rates` | Platform rates |
| `/admin/billing` | Consumption and amounts due |

This is the direct answer to *"Are they visible / linked to the appointment
activity screen? We need to be able to track this."*

`ActivityEvent` gains an optional notification shape — channel icon on the
timeline dot, recipient and delivery status in the meta line, message body as
the event body (truncated, expandable). A failed send is the only activity event
that renders in a warning tint, because it's the only one that implies the
customer never heard from the merchant.

Ordering, dashed connector, and the "last 12 months" footer are unchanged.

## HQ — Sender ID at onboarding

One required field in `app/admin/businesses/new/page.tsx`, defaulting to `CAMI`,
sharing the validator with the merchant card so a merchant cannot be created in
a state the settings panel would reject. Per GNK's recommendation, adopted by
maaz: "Collect during onboarding (mandatory), with the ability to update in
settings later. Default to CAMI if not provided."

Captured here means `status: "submitted"` from day one for merchants who supply
their own, so the registration clock starts at account creation rather than
whenever someone remembers to open settings.

## HQ — per-merchant notification controls

New **Notifications** tab on `components/blocks/business-detail-dialog.tsx`,
after **Activity**, before **Manage**. Three sections:

1. **Channels** — Email / SMS / WhatsApp master switches. This is the
   `ChannelGrant` the merchant matrix reads. Turning one off locks that column
   for the merchant; it does not clear their intent, so turning it back on
   restores exactly what they had.
2. **Sender ID** — the merchant's value, current status, and the
   approve/reject actions that drive `submitted → approved | rejected`. Reject
   requires a reason, because that reason renders in the merchant's notice.
3. **Rates** — this merchant's per-channel rate, showing the inherited global
   value with an override control. An override displays as an override
   (`AED 0.14 — overridden, global is AED 0.12`) so nobody debugs a billing
   discrepancy by guessing.

Suspended and archived businesses follow the existing tab convention — the
`disabled` prop already threaded through the other sections.

### Every change is on the audit trail

A merchant asking "why did our reminders stop" needs an answer with a name and a
time, so each mutation here appends an `AuditEvent` to the partner and shows up
on their Activity tab: channel toggles, Sender ID approve/reject, and rate edits.

Three details:

- **Rate edits audit on blur, not on change.** The input writes per keystroke, so
  auditing there would file `0`, `0.`, `0.1`, `0.14` as four decisions. The value
  at focus is compared on blur, and one deliberate edit is one entry.
- **A rejection's reason is stored on the audit entry too**, not only in the
  merchant's notice. The merchant's copy is overwritten the moment they submit a
  new Sender ID; the decision should outlive it.
- **The actor is a prop, not `useAuth()`.** `AuthProvider` only exists under
  `/admin`, and this section also renders in the playground. The page passes the
  HQ user down; the component keeps working without an auth scope.

Note this is *ahead* of the surrounding code: suspend and archive don't write
audit events either. Notification changes do, because they silently alter what a
merchant's customers receive.

## HQ — rates and billing

Two pieces, and the second is a new route.

**Global rates** live in the HQ settings dialog
(`components/blocks/admin-settings-dialog.tsx`, category `notification-rates`):
a table of channel × country × AED per message. Per-country because UAE SMS
pricing is the entire reason this thread exists; a single global SMS rate would
be wrong on the first row. Only the UAE row carries values — inventing numbers
for unpriced markets would read as real pricing.

Edits persist and propagate. `lib/notifications/hq-store.tsx` holds the live
list, and every helper that prices a message takes the rates as an argument
(falling back to `PLATFORM_DEFAULT_RATES`), so changing SMS here moves the
partner record's "global is …" line, the `/admin/billing` amounts, and the rate
a merchant reads in their own Reminders card. A per-merchant override still wins.

The merchant store holds **no rates of its own.** It did at first, which meant
one price with two sources — and the merchant's copy was the one that would
silently go stale, since they can't edit it anyway.

**`/admin/billing` did not exist** — it was in `lib/admin-menu.ts` pointing at
nothing. GNK's third point (*"billing tire screen for every merchant where we can
see consumption of sms and email with rates"*) is now that route. Per-partner
rows: sends per channel with the rate that applies, total sends, and amount due,
over per-channel totals and the period's grand total. A row links to the partner
record, where the same numbers sit next to the controls that produced them.

Two details that carry the model's decisions into the table:

- A cell reads **`Off`** when the channel isn't granted and **`0`** when it is
  granted but nothing was sent. A blank cell would mean both.
- An overridden rate is **labelled as an override** on the cell, so an invoice
  discrepancy is legible rather than something to guess at.

Scoped to messaging. Cami Pay's subscription and transaction fees are a separate
ledger, and the page says so rather than implying it's every charge a partner
sees.

## Sequencing

Maaz gated the whole spec behind other work: *"I would prioritise this once you
have completed the mobile-optimised journey on Appointment to Checkout and
Sales > Add New Sales journeys."* It was built in three passes, in this order,
and each is independently reviewable:

1. **Merchant Notifications panel + activity events.** Unblocks Ahsan's frontend
   integration, which is the actual ask in the thread. WhatsApp ships ungranted
   by default, so the locked-column state is the first thing a reviewer sees
   rather than something a toggle has to reach.
2. **HQ per-merchant tab + onboarding field.** Makes the grant and the Sender ID
   states real, and gives the merchant panel something to read.
3. **Rates + `/admin/billing`.** Net-new route, biggest surface, no downstream
   blocker.

### Where the two portals still don't meet

**Rates now do meet.** Both portals read `HqNotificationsProvider`, so an HQ rate
edit moves the merchant's Reminders card and the billing table together. That is
the one piece of HQ state that isn't per-merchant, which is exactly why it could
be shared without inventing an identity.

**Grants and Sender ID still don't.** The merchant panel reads
`NotificationsProvider` (localStorage, one demo business); HQ reads
`AdminBusiness.notifications` (the mock array, five partners). So flipping
WhatsApp off in HQ does not lock the column in the merchant portal at runtime —
each side demonstrates the contract against its own state, and the merchant panel
carries a demo toggle standing in for the HQ decision.

Wiring them together means one source keyed by business, which is a real store
rather than a mock. Worth doing when the API lands; not worth faking before then,
because a fake link would have to pick a business and the merchant portal has no
concept of which one it is.

## Open questions

- **Sender ID registration ETA.** Asked of Michelle, unanswered. Doesn't block
  the UI — the `submitted` state is designed for an unknown wait — but it does
  decide whether `submitted` needs a "typically 5–7 days" line under the pill.
- ~~**WhatsApp in this pass, or Email/SMS only?**~~ **Settled by the thread.**
  GNK's 4:41 list named two channels; maaz's 6:02 alignment, written after it,
  names three twice — "toggle on/off for Reminders (Email/SMS/Whatsapp)" and
  "options to add SMS, Email & Whatsapp communication rates" — and his 10:16
  message treats META as one of the three per-merchant integrations. Three
  channels, WhatsApp shipping ungranted so enabling it is a switch, not a build.
  No further decision needed.
- **Who sees rates?** Still open, but no longer a rebuild — it's one constant,
  `MERCHANT_SEES_RATES` in `lib/notifications/types.ts`, and both states are
  reviewable (`?settings=notifications&nr=hidden`).

  Defaults to visible. Nothing in the thread forbids showing a merchant their own
  price, and withholding it is hostile when the month-end invoice reveals it
  anyway. But rates are negotiated per merchant — Pawhaus runs AED 0.14 against a
  global AED 0.12 — so if Cami doesn't want merchants comparing prices, this
  flips. Off, per-channel costs go with the rates (412 sends for AED 8.24 is the
  rate with one division) and the merchant keeps counts, failures, and the period
  total.
- **Sender ID reserved words.** Only `CAMI` is rejected today. Carriers maintain
  longer reserved lists; if one exists for the UAE, it belongs in
  `validateSenderId` so a merchant fails at input time rather than days later.
