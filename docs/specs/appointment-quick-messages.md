# Appointment Quick Messages — Design Spec

**Linear**: _TBD_ (fill issue link)
**Milestone**: E4 — Appointment Management · **Project**: v0 Web OS for a single branch
**Branch**: `feature/appointments/messages` (off latest `main`)
**Inherits from**: `PRO-68-appointment-foundations.md` (booking entity, status vocab), `PRO-83-appointment-popover.md` (appointment detail surfaces)

## Status

First-pass spec. Source of truth for the Messages section + send dialog. Code follows this.

---

## Problem

Businesses already store a few WhatsApp message templates (confirmation, reminder, etc.). Today there is no way to fire one at a client from the appointment context. Operator has to leave the app, open WhatsApp, retype. Slow and off-brand.

## What ships

A **Messages section** inside the appointment detail drawer, plus a **nested send dialog** that previews → edits → sends a chosen template.

| Piece | Where | Purpose |
|---|---|---|
| Messages section | Appointment sheet body, directly **after Payment policy** (`new-appointment-sheet.tsx:797`), last section before footer | Lists the business's WhatsApp templates as quick-send buttons |
| Send dialog | Nested `Dialog` over the drawer | Single dialog, two states: **Edit** (preview + editable text) → **Sent** (success confirmation in place) |

WhatsApp only for v0 (matches notification-channels rule: WhatsApp + Email; this surface is WhatsApp-first since templates are WhatsApp).

---

## Messages section (in drawer)

Same section shell as the others: `<section className="flex flex-col gap-3">` with an `h2` "Messages" header (`text-lg font-semibold leading-7`).

Body = card (`rounded-2xl border border-border/60 bg-card p-4`) holding the template list:

- One row per template. Each row: template **name** (e.g. "Booking confirmation") + one-line **preview** of resolved body (muted, truncated).
- Trailing **Send** affordance per row — a `Button variant="outline" size="sm" radius="full"` labelled "Quick message" (or a paper-plane icon button). Tapping opens the send dialog pre-loaded with that template.
- Always-present last row: **Write custom message** — opens the send dialog with a **blank** editable textarea (no template). Not gated by status.
- If no template matches the current status (and no zero-template case): show only the **Write custom message** row.

### Status-gated list (manual sends only)

This surface is **manual sends only**. Automated trigger timing (6h-after-booking ladders, auto-cancel) is **out of scope here** — it lives in a future Settings spec. The operator just picks the right template for the booking's current status.

Each template declares which statuses it's relevant to. The list **filters to the current booking's status**:

```ts
statuses: BookingStatus[]   // template shows only when booking.status ∈ this set
```

Gating axis is **status + deposit**, not status alone — deposit is orthogonal to lifecycle (`PRO-68`: `depositStatus: 'none' | 'required' | 'paid' | 'waived'`). The deposit ladder only applies to a `booked` appointment that actually owes a deposit.

| Booking state | Templates shown |
|---|---|
| `booked` + `depositStatus: required` (unpaid) | Deposit Reminder · Final Confirmation · Deposit Not Received |
| `confirmed` + `depositStatus: paid` | Deposit Confirmation |
| `cancelled` | Appointment Cancelled |
| `checked-in`, `ready-for-pickup`, `completed`, `no-show`, or no match | (no templates → **Write custom message** only) |

These five are the SOTA-approved set (source CSV). The `[Payment Link]` token in Deposit Reminder / Final Confirmation resolves to the **CamiPay deposit checkout** (`PRO-396`, deposit mode); the `[Booking Link]` in Deposit Not Received / Appointment Cancelled resolves to the public rebook URL.

Templates render in stored order within the matched set. No category grouping in v0.

### Template data (mock)

No template store exists yet. Add a mock:

```ts
// app/appointments/mock.ts
export type WhatsAppTemplate = {
  id: string
  name: string             // "Deposit reminder"
  body: string             // with {{tokens}}: "Hi {{client}}, your {{service}} on {{date}} is confirmed."
  statuses: BookingStatus[] // which booking statuses this template shows for
  requiresDeposit?: boolean // extra gate: only show when depositStatus owes/has a deposit
}
export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [ ... ]
```

Tokens (`{{client}}`, `{{service}}`, `{{date}}`, `{{time}}`, `{{business}}`, `{{paymentLink}}`, `{{bookingLink}}`) get resolved from the current `MockBooking` before preview. Resolution is a pure helper, not stored. `{{paymentLink}}` → CamiPay deposit checkout; `{{bookingLink}}` → public rebook URL.

Filter helper: `templatesForBooking(booking)` returns templates whose `statuses` includes `booking.status` and (if `requiresDeposit`) whose deposit gate matches. Empty result → render the **Write custom message** row only.

---

## Send dialog (nested)

A `Dialog` opened from a template row, layered over the drawer (drawer stays mounted behind it). One dialog component, two internal states driven by local `state: "edit" | "sending" | "sent"`.

### State: edit (default on open)

- **Header**: template name as title (or "Custom message" when opened from the Write-custom row), recipient line below — client name + masked phone (e.g. "Millie Cassidy · +971 50 ••• 1234").
- **Body**: a `Textarea` pre-filled with the resolved template text — **blank** when custom. Fully editable. This is the message that sends.
- **Channel chip**: small WhatsApp pill, non-interactive in v0 (no channel switch).
- **Footer**: `Cancel` (outline) + `Send` (primary, paper-plane icon). Send disabled if textarea empty.

### State: sending

- `Send` button shows spinner + "Sending…", disabled. Cancel hidden/disabled. Mock: 800ms timeout then → sent.

### State: sent (same dialog, in place)

- Body swaps to a success confirmation: centered check/success mark, "Message sent", and the sent text shown read-only below (muted, in a quoted block) so operator sees what went out.
- **Footer**: single `Done` button → closes dialog back to the drawer.
- No timeline/activity entry written in v0 (deferred; note below).

The dialog never navigates away from the appointment. Cancel from edit closes straight back to the drawer with nothing sent.

---

## Interaction flow

```
Drawer › Messages section
  └─ tap "Quick message" on a template row
       → Send dialog opens [edit]  (resolved text, editable)
            ├─ Cancel → close, nothing sent
            └─ Send   → [sending] (spinner ~800ms)
                          → [sent] (same dialog: success + read-only sent text)
                               └─ Done → close back to drawer
```

## Out of scope (v0)

- Email channel for this surface (WhatsApp only).
- Persisting a sent record / appointment activity-log entry. Hook point noted; wire when activity log lands (PRO-83 sub-view).
- Template management (create/edit templates) — lives in business settings, separate work.
- **Automated trigger timing / send scheduling** (6h ladders, auto-cancel, immediate-on-event) — Settings spec, later. This surface is manual-send only.
- Two-way thread / replies.

## Open questions

- Phone masking format for UAE numbers — confirm with directory pattern.
- Should `Send` also bump appointment status (e.g. booked → confirmed) when a confirmation template fires? Default: no, sending ≠ status change. Flag for product.
- Missing-state templates (`checked-in`, `ready-for-pickup`, `completed`, `no-show`) — SOTA CSV only covers the deposit ladder. Custom-message fallback covers the gap for now; author proper templates as those surfaces mature.
