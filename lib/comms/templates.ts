// Communication templates — what each automated message actually says, per
// channel. DSG-83. Pure types, defaults, and helpers; the React provider lives
// alongside in store.tsx (same split as lib/notifications and lib/payment-policy).
//
// Two structural decisions worth reading here.
//
// 1. Templates are keyed on `ReminderEvent` from lib/notifications/types.ts
//    rather than on an id of their own. The Reminders matrix (DSG-71) decides
//    *whether* an event sends; this file decides *what it says*. A second event
//    list would let the two drift, and then "which messages does this product
//    send" has two answers — the exact failure the notifications spec avoided by
//    keeping merchant intent and the HQ grant as separate fields.
//
// 2. Overrides are stored, not full copies. State holds only what the merchant
//    changed, so a default the design team improves later reaches every merchant
//    who never touched that template. Storing a copy of every default at first
//    render would freeze today's copy forever and make "reset" meaningless.
//
// SMS is deliberately absent. DSG-83 says email and WhatsApp; SMS is a column in
// the Reminders matrix, so its absence here is a real gap rather than an
// oversight — it is called out on /screens. The WhatsApp editor is plain-text,
// so adding SMS later is one channel entry and a segment counter.

import { REMINDER_EVENTS, type ReminderEvent } from "@/lib/notifications/types"

export type CommsChannel = "email" | "whatsapp"

export const COMMS_CHANNELS: CommsChannel[] = ["email", "whatsapp"]

export const COMMS_CHANNEL_LABEL: Record<CommsChannel, string> = {
  email: "Email",
  whatsapp: "WhatsApp",
}

/**
 * One editable message. `subject` is null on WhatsApp, which has no subject
 * line — modelled as null rather than an empty string so "WhatsApp has no
 * subject" and "the merchant cleared the subject" stay distinguishable.
 */
export type CommsTemplate = {
  event: ReminderEvent
  channel: CommsChannel
  subject: string | null
  body: string
}

/** What the merchant changed. Absent key → that template is still at its default. */
export type CommsOverrides = Partial<Record<string, Pick<CommsTemplate, "subject" | "body">>>

/** Stable composite key. Kept in one function so the store and the UI can't disagree. */
export function templateKey(event: ReminderEvent, channel: CommsChannel): string {
  return `${event}:${channel}`
}

// ── Defaults ─────────────────────────────────────────────────────────────────
//
// WhatsApp copy for booking-confirmed, reminder-24h and cancelled is lifted
// verbatim from MOCK_WHATSAPP_TEMPLATES (app/appointments/mock.ts), which came
// from Aziz's Pet Loft template sheet via ENG-58. It is real merchant-authored
// copy in the product's voice — rewriting it here would replace something a
// design partner actually wrote with something invented.
//
// Email copy is new. It runs longer than WhatsApp because email is where the
// full booking detail belongs; WhatsApp is a glance on a phone.

const DEFAULT_WHATSAPP: Record<ReminderEvent, string> = {
  "booking-confirmed": `Hi {{client}}! 🤍

Your appointment is booked — we can't wait to see you!

📅 {{date}} at {{time}}
🐾 {{service}} with {{staff}}

Team {{business}} x`,

  "reminder-24h": `Hi {{client}}! 🤍

Just a reminder — {{pet}}'s appointment is tomorrow at {{time}}.

📍 {{location}}

If anything's come up, please let us know right away.

Team {{business}} x`,

  "reminder-2h": `Hi {{client}}! 🤍

You're almost here — {{pet}}'s appointment is today at {{time}}.

📍 {{location}}

We can't wait to see you!

Team {{business}} x`,

  cancelled: `Hi {{client}},

Your appointment on {{date}} at {{time}} has been cancelled. 🤍

If a deposit was paid, please allow up to 14 business days for the refund to appear in your account.

We'd love to welcome you back whenever you're ready:
👉 {{bookingLink}}

Thank you,
Team {{business}} x`,

  "no-show": `Hi {{client}},

We missed you today for {{pet}}'s {{time}} appointment. 🤍

We hope everything's okay. Whenever you're ready, you can rebook here:
👉 {{bookingLink}}

Team {{business}} x`,

  "review-request": `Hi {{client}}! 🤍

Thank you for bringing {{pet}} in for {{service}} — it was lovely to see you both.

If you have a moment, we'd really appreciate a quick review. It helps other pet parents find us.

Team {{business}} x`,

  receipt: `Hi {{client}}! 🤍

Thank you — your payment for {{service}} is confirmed. Your receipt is attached.

We hope to see you and {{pet}} again soon!

Team {{business}} x`,
}

const DEFAULT_EMAIL_SUBJECT: Record<ReminderEvent, string> = {
  "booking-confirmed": "Your appointment at {{business}} is confirmed",
  "reminder-24h": "Tomorrow: {{pet}}'s appointment at {{business}}",
  "reminder-2h": "Today at {{time}}: {{pet}}'s appointment",
  cancelled: "Your appointment at {{business}} has been cancelled",
  "no-show": "We missed you today at {{business}}",
  "review-request": "How was your visit to {{business}}?",
  receipt: "Your receipt from {{business}}",
}

const DEFAULT_EMAIL_BODY: Record<ReminderEvent, string> = {
  "booking-confirmed": `Hi {{client}},

Your appointment at {{business}} is confirmed. Here are the details:

Service: {{service}}
Pet: {{pet}}
With: {{staff}}
When: {{date}} at {{time}}
Where: {{location}}

Need to make a change? You can reschedule or cancel from your booking page:
{{bookingLink}}

We look forward to seeing you both.

{{business}}`,

  "reminder-24h": `Hi {{client}},

A quick reminder that {{pet}} has an appointment at {{business}} tomorrow.

Service: {{service}}
With: {{staff}}
When: {{date}} at {{time}}
Where: {{location}}

If anything has come up, please let us know as soon as you can so we can offer the slot to someone else.

{{bookingLink}}

{{business}}`,

  "reminder-2h": `Hi {{client}},

{{pet}}'s appointment at {{business}} is today at {{time}}.

Where: {{location}}

See you shortly.

{{business}}`,

  cancelled: `Hi {{client}},

Your appointment on {{date}} at {{time}} has been cancelled.

If a deposit was paid, please allow up to 14 business days for the refund to appear in your account.

We would love to welcome you back whenever you are ready:
{{bookingLink}}

Thank you,
{{business}}`,

  "no-show": `Hi {{client}},

We missed you today for {{pet}}'s appointment at {{time}}.

We hope everything is okay. Whenever you are ready, you can book again here:
{{bookingLink}}

{{business}}`,

  "review-request": `Hi {{client}},

Thank you for bringing {{pet}} in for {{service}} — it was lovely to see you both.

If you have a moment, we would really appreciate a short review. It helps other pet parents find us.

{{bookingLink}}

{{business}}`,

  receipt: `Hi {{client}},

Thank you for your payment. Your receipt for {{service}} is attached.

Pet: {{pet}}
When: {{date}} at {{time}}

We hope to see you both again soon.

{{business}}`,
}

/** The shipped template for one event and channel, before any merchant edit. */
export function defaultTemplate(event: ReminderEvent, channel: CommsChannel): CommsTemplate {
  return channel === "email"
    ? {
        event,
        channel,
        subject: DEFAULT_EMAIL_SUBJECT[event],
        body: DEFAULT_EMAIL_BODY[event],
      }
    : { event, channel, subject: null, body: DEFAULT_WHATSAPP[event] }
}

/** The effective template: the merchant's override if there is one, else the default. */
export function resolveStoredTemplate(
  overrides: CommsOverrides,
  event: ReminderEvent,
  channel: CommsChannel,
): CommsTemplate {
  const base = defaultTemplate(event, channel)
  const override = overrides[templateKey(event, channel)]
  if (!override) return base
  // Subject is spread from the override only for email; a stored subject on a
  // WhatsApp template would otherwise resurrect a field that channel has no
  // slot for.
  return {
    ...base,
    body: override.body,
    subject: channel === "email" ? override.subject : null,
  }
}

/** Whether the merchant has edited this template away from its default. */
export function isCustomised(
  overrides: CommsOverrides,
  event: ReminderEvent,
  channel: CommsChannel,
): boolean {
  return templateKey(event, channel) in overrides
}

/**
 * Events in the order the Reminders matrix shows them, so the two surfaces read
 * top-to-bottom the same way. Derived from REMINDER_EVENTS rather than restated.
 */
export const COMMS_EVENTS = REMINDER_EVENTS

/** One-line excerpt for the list rows. Collapses the newlines a body is full of. */
export function excerpt(body: string, max = 80): string {
  const flat = body.replace(/\s+/g, " ").trim()
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`
}

/**
 * The part of a body worth showing in a list row.
 *
 * Nearly every template opens with the same greeting — "Hi {{client}}! 🤍" —
 * so in a list of seven the first ~18 characters are identical and the excerpt's
 * opening third carries no information at all. Drop a leading greeting so the
 * row starts at the first line that actually distinguishes this template.
 *
 * Only a *leading* greeting, and only when something follows it: a template that
 * is nothing but a greeting keeps it rather than rendering an empty row.
 *
 * Two things the pattern has to get right, both learned the hard way:
 *
 * - The punctuation is not the end of the line. "Hi {{client}}! 🤍" ends in an
 *   emoji, so anchoring at `[,!.]$` stripped only the one greeting written with
 *   a comma and left the other six in place. `[^\p{L}]*$` lets trailing emoji
 *   and spaces through while still refusing anything with a letter in it.
 * - The middle is capped at 25 characters so a real content line that happens to
 *   open with a greeting word — "Hi there's a change to your booking." — is not
 *   silently swallowed. Long enough for "Hello {{client}} and {{pet}},", short
 *   enough to exclude a sentence.
 */
export function previewLine(body: string): string {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) return ""
  const isGreeting = /^(hi|hello|hey)\b[^.!?]{0,25}[,!.][^\p{L}]*$/iu.test(lines[0])
  return (isGreeting && lines.length > 1 ? lines.slice(1) : lines).join(" ")
}
