# Communication templates — merchant-editable email and WhatsApp copy

> **Built.** Merchant panel: `components/blocks/comms-templates-panel.tsx`
> (Business Settings › Communication templates). Model in `lib/comms/templates.ts`,
> token vocabulary in `lib/comms/tokens.ts`, provider in `lib/comms/store.tsx`.
> The Reminders card in `components/blocks/notifications-settings-panel.tsx` now
> links each event label into its editor.
> Reviewable from `/screens` under "Pet Business, notifications and templates".
> Open items are marked in place below.

Ticket: [DSG-83](https://linear.app/getcami/issue/DSG-83/communication-templates) —
"Add a workplace-settings area for merchants to view and edit email and WhatsApp
templates. Cover appointment events, reminders, and creation notifications."

Follow-on to DSG-71. That spec excluded template editing by name and handed it
here:

> **Message template editing.** Merchants toggle *whether* an event sends, not
> *what it says*. Templates are a separate editor with variable interpolation,
> per-locale copy, and a preview — a different ticket. This spec's Reminders card
> degrades gracefully into a row of template links when that lands.

## Problem

Every automated message the product sends is hardcoded. `MOCK_WHATSAPP_TEMPLATES`
in `app/appointments/mock.ts` holds real merchant-authored copy (Aziz's Pet Loft
sheet, via ENG-58) that no merchant can reach — and the comment on its
"Appointment created" entry has been promising a home for it since:

> Fires immediately on booking. Never hand-sent → hidden from the drawer,
> **configured in Settings**.

There was no Settings. So: a merchant can decide that a 24h reminder goes out
over email, and cannot decide what it says.

## Scope

| | In | Out |
| --- | --- | --- |
| Channels | Email, WhatsApp | **SMS** — the ticket names two channels. SMS is a column in the Reminders matrix, so the gap is real; the panel says so rather than hiding it. Adding it is one channel entry plus a 160-char segment counter, because the WhatsApp editor is already plain-text. |
| Events | The 7 `ReminderEvent`s the Reminders matrix toggles | **Manual templates** — the deposit ladder, running late, ready-for-pickup. See "The other half" below. |
| Editing | Subject (email), body, `{{placeholder}}` chips, live preview | Rich text, images, layout blocks. Per-locale copy (DSG-71 named it; nothing in this ticket asks for it yet). |

## The two decisions worth reading

### 1. Keyed on `ReminderEvent`, not on an id of its own

There were already two non-matching template taxonomies in the repo:

| `REMINDER_EVENTS` (`lib/notifications/types.ts`) | `MOCK_WHATSAPP_TEMPLATES` (`app/appointments/mock.ts`) |
| --- | --- |
| `booking-confirmed` | `appointment-created` (`automation: "automated"`) |
| `reminder-24h`, `reminder-2h` | `appointment-reminder` |
| `cancelled` | `appointment-cancelled` |
| `no-show`, `review-request`, `receipt` | — |
| — | `deposit-reminder`, `final-confirmation`, `deposit-not-received`, `deposit-confirmation`, `running-late`, `ready-for-pickup` |

These are two axes, not a duplication to collapse. **Automated** fires on an
event and is toggled by the Reminders matrix. **Manual** is the quick-message
drawer in `new-appointment-sheet.tsx`, sent by hand — which is why
`templatesForBooking()` filters `automation: "automated"` out of the drawer.

DSG-83's scope is the automated set, so templates are keyed on `ReminderEvent`
and **no third event list was introduced**. If templates had their own ids, the
Reminders matrix and the templates panel could disagree about which messages this
product sends, and there would be no way to tell which one was right.

### 2. Overrides are stored, not full copies

State holds only what the merchant changed. Consequences, all of them the point:

- **Reset is a delete**, not a re-seed from a snapshot.
- **An improved default reaches every merchant who never touched that template.**
  Storing a copy of all 14 defaults at first render would freeze today's copy
  forever, and the design team's next pass at the wording would reach nobody.
- **Editing back to the original clears the override** rather than pinning the
  merchant to a snapshot that happens to match. Otherwise "is this customised?"
  answers yes for a template identical to the default.

## Behaviour

- **No send toggle here.** Whether a message sends is the Reminders matrix. Two
  switches for one fact drift apart, and the matrix is where the per-channel cost
  is shown, which is the context that decision needs.
- **A row whose channel is off dims and says why**, distinguishing "ungranted by
  Cami HQ" from "you switched it off under Reminders" — the same
  intent-vs-grant split DSG-71 established. It stays editable: preparing copy for
  a channel you're about to enable is reasonable, pretending it will send is not.
- **An unrecognised `{{token}}` sends as written**, and the editor warns. Silently
  blanking a typo means the message ships with a hole nobody noticed; the merchant
  needs to see `{{discout}}` in the preview, not in a customer's inbox.
- **Placeholders have readable fallbacks**, not blanks — `Hi there` beats `Hi ,`.
  `TOKENS` in `lib/comms/tokens.ts` is the single source for the chip list, the
  preview's sample values, and the runtime fallbacks, so a token cannot exist in
  the editor and be unresolvable at send time.
- **WhatsApp edits carry a Meta-approval notice.** Template approval is its own
  integration (DSG-71 flagged this under "WhatsApp templates and opt-in"), so the
  editor states that changes take days rather than implying instant publication.

## Open items

1. **Ahsan's minimum-UI requirements.** Michelle asked us to liaise with
   @ahsan.raza for "minimum UI requirements for fast integration"; no reply yet.
   Built on assumptions, deliberately cheap to change: the backend contract here
   is two strings and a token list per event × channel. A different event
   taxonomy from the backend is a rename, not a rebuild.
2. **Per-locale copy.** DSG-71 named it as part of a template editor. Nothing in
   DSG-83 asks for it and no merchant has, so it isn't modelled. It would be a
   third key on `templateKey()`.
3. **Preview accuracy.** The email preview uses an email-client frame that borrows
   `confirmation-email.tsx`'s visual language, not that component — which
   composes its own booking content and would render the merchant's copy nowhere.
   If real sends later go through a shared email shell, the preview should render
   that shell instead.

## The other half — PRO-865

[PRO-865](https://linear.app/getcami/issue/PRO-865/in-calendar-whatsapp-messaging-configurable-template-library)
("In-calendar WhatsApp messaging + configurable template library", Michelle →
Ahsan, backlog) asks for a **configurable template library** for the *manual*
sends: inquiry reply, deposit reminder, last-minute reminder, pre-service
message. Same design partner note: "Christine already maintains these templates
(today in ChatGPT)."

That is the manual axis of the same library. Once this editor exists, pointing
`MOCK_WHATSAPP_TEMPLATES` at the same store makes the drawer's quick messages
editable too, retiring the hardcoded bodies and redeeming the `mock.ts` comment.
Deliberately **not** done here — it isn't in DSG-83's text, and the two tickets
sit with different assignees on different teams. Flagged so PRO-865 doesn't build
a second library beside this one.

PRO-865 also asks for two things DSG-83 has no model for, worth naming so they
aren't assumed covered: personalisation from prior visit history ("last
appointment was about six weeks ago"), and attaching the price list.
