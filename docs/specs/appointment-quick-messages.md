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
- If business has zero templates: centered light line-icon empty state (per empty-state rule), copy "No message templates yet", no card-in-card wrapper.

Templates render in the business's stored order. No category grouping in v0.

### Template data (mock)

No template store exists yet. Add a mock:

```ts
// app/appointments/mock.ts
export type WhatsAppTemplate = {
  id: string
  name: string        // "Booking confirmation"
  body: string        // with {{tokens}}: "Hi {{client}}, your {{service}} on {{date}} is confirmed."
}
export const MOCK_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [ ... ]
```

Tokens (`{{client}}`, `{{service}}`, `{{date}}`, `{{time}}`, `{{business}}`) get resolved from the current `MockBooking` before preview. Resolution is a pure helper, not stored.

---

## Send dialog (nested)

A `Dialog` opened from a template row, layered over the drawer (drawer stays mounted behind it). One dialog component, two internal states driven by local `state: "edit" | "sending" | "sent"`.

### State: edit (default on open)

- **Header**: template name as title, recipient line below — client name + masked phone (e.g. "Millie Cassidy · +971 50 ••• 1234").
- **Body**: a `Textarea` pre-filled with the resolved template text. Fully editable. This is the message that sends.
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
- Free-form (non-template) messages.
- Two-way thread / replies.

## Open questions

- Phone masking format for UAE numbers — confirm with directory pattern.
- Should `Send` also bump appointment status (e.g. booked → confirmed) when a confirmation template fires? Default: no, sending ≠ status change. Flag for product.
