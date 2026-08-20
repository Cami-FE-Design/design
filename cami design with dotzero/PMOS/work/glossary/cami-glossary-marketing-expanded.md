# Cami Glossary: Marketing (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Marketing domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> **This is the MOAT.** WhatsApp inbox, two-way intelligence, auto-reminders, and smart marketing are the CRM-and-AI features that prevent churn. Two Cami divergences shape everything here:
> 1. **WhatsApp is the primary channel, gated on META verification.** SMS (Twilio) and email are interim. Template approval runs through META, not a Fresha-style moderation queue.
> 2. **Reminders are status-update only, no URLs** (spoof risk). Managed links come later. This is a deliberate policy divergence from Fresha, whose reminders carry price display and links.

---

## Confusable cluster: Broadcast vs Automation

| Term | Trigger | Audience | Cadence |
|---|---|---|---|
| **WhatsApp broadcast** (Fresha "blast campaign") | You press send once | A segment you pick | One-off |
| **Automation** | A client hits an event or milestone | Whoever meets the trigger | Always on, configured once |

Both consume the messaging balance for paid channels. High-risk collision, keep them clearly separated in the UI.

---

## Entries

### WhatsApp broadcast (Fresha "blast campaign")

- **What it is.** A manually created, one-off marketing send to a chosen client segment.
- **Cami mechanics.** Segmented send, channels WhatsApp / SMS / email. Audience comes from **client segments**. **Template approval runs through META** (not a Fresha-style internal moderation queue), so WhatsApp sends are gated on approved templates plus **marketing consent and opt-outs**. Duplicable and retargetable. Text/WhatsApp sends draw the **messaging balance**. Drives rebookings.
- **Reversible.** No once sent. Editable or cancellable only in the pre-send window.
- **Where you see it.** ⚠︎ Marketing, Broadcasts.
- **Don't confuse with.** Automation (trigger-based, recurring), the "total sales" collision in campaign performance.
- **Status.** In build (v0.2), gated on META. Part of the MOAT.

### Automation / Messaging automation

- **What it is.** Trigger-based messages sent automatically on appointment events or client milestones.
- **Cami mechanics.** Reminders and updates via WhatsApp / SMS / email. Cami's live families: **appointment reminders**, **appointment updates**, and **rebook reminders**. Cost model: email free, WhatsApp/SMS drawn from the messaging balance. ⚠︎ Loyalty-reward and birthday automations are parked (loyalty parked); win-back is optional (see cut table).
- **Reversible.** Yes. Each toggles off; sent messages cannot be recalled.
- **Where you see it.** ⚠︎ Marketing, Automations; message history.
- **Don't confuse with.** WhatsApp broadcast (manual, one-off).
- **Status.** Live for SMS/email; WhatsApp gated on META.

### Appointment reminders

- **What it is.** Automated pre-appointment messages that reduce no-shows.
- **Cami mechanics.** Cami's default set: **auto-confirm 24h before, a 1h reminder with a location pin, and a no-show rebook follow-up.** Channels: **SMS (Twilio) and email today, WhatsApp gated on META.** ⚠︎ And/Or delivery logic (try WhatsApp first, SMS fallback) to confirm. **Policy divergence: reminders are status-update only, no URLs** (spoof risk); managed links come later. **High no-show reduction, so high payment-capture impact** (no-shows are the core pain, ~AED 22.5K/mo leak on a 20-appointment business). ⚠︎ Open: per-merchant sender IDs vs Cami-as-sender, and the 160-character SMS limit.
- **Reversible.** Yes. Disable or edit; sent messages cannot be recalled.
- **Where you see it.** ⚠︎ Marketing, Automations, Reminders.
- **Don't confuse with.** Appointment updates (event-driven), rebook reminder (post-visit).
- **Status.** Live (SMS/email). WhatsApp reminders gated on META. UAE SMS needs business verification (in progress).

### Appointment updates

- **What it is.** Automated event-driven messages triggered by appointment changes.
- **Cami mechanics.** Types Cami needs: new-appointment confirmation, **rescheduled** (fires the client-notify half of Layla's reschedule flow), cancelled, did-not-show, and a post-visit thank-you. ⚠︎ **Cami divergence:** no review-link message (no marketplace reviews). Same channels and delivery logic as reminders, same no-URL policy.
- **Reversible.** Yes. Enable/disable/edit each.
- **Where you see it.** ⚠︎ Marketing, Automations, Appointment updates.
- **Don't confuse with.** Appointment reminders, the per-action notify checkbox on a no-show.
- **Status.** Live (SMS/email); WhatsApp gated on META.

### Reminder to rebook

- **What it is.** An automation prompting a client to book their next visit after a set gap.
- **Cami mechanics.** Fires after an appointment is **completed** (not for cancellations or no-shows) and is suppressed if the client already has an upcoming appointment. Timing customizable by service. Also covers the **no-show rebook follow-up** path. Drives the rebooking and next-visit goal (AI next-visit recommendation feeds this).
- **Reversible.** Yes. Disable or edit.
- **Where you see it.** ⚠︎ Marketing, Automations.
- **Don't confuse with.** Appointment reminder (pre-visit), win-back (lapsed, cut/gap), the Rebooked report metric.
- **Status.** ⚠︎ Confirm; core to the rebooking motion.

### Campaign performance (Delivered / Opened / Clicked / Total appointments / Total sales)

- **What it is.** The engagement and attribution metrics on a broadcast.
- **Cami mechanics.** Delivered (received, minus bounces), Opened, Clicked, and attributed Total appointments / Total sales. ⚠︎ **Naming collision to avoid:** "Total sales" here is campaign-attributed, not the workspace-wide reporting metric. Resolve as part of the sales-metric definitions (gap 4). ⚠︎ Attribution window to define (Fresha never states one).
- **Reversible.** Not applicable. Reporting.
- **Where you see it.** ⚠︎ Marketing, Broadcasts, performance.
- **Don't confuse with.** The Reports domain's gross/net/total sales.
- **Status.** ⚠︎ Confirm which metrics ship.

### Text / messaging balance

- **What it is.** The prepaid allowance consumed by outbound SMS and WhatsApp.
- **Cami mechanics.** Email free; **SMS and WhatsApp are metered** and drawn from the balance. Ties directly to Cami's **add-on pricing: WhatsApp and reminder monetization layer on top of the processing margin** (gap 11). A consumed message is not refundable.
- **Reversible.** No.
- **Where you see it.** ⚠︎ Marketing / billing.
- **Don't confuse with.** The processing margin (Cami's core revenue). This is add-on revenue.
- **Status.** Live concept (SMS metered via Twilio); WhatsApp metering with META.

---

## Cut from this domain (do not port)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Deal** (umbrella), **Promotion**, **Flash sale**, **Last-minute offer**, **Smart pricing** | Promotions/dynamic-pricing engine is not core at v1. Goals: not doing CRM depth beyond the core | When the marketing engine deepens (Sept-Dec MOAT work) |
| **Client review** | No consumer marketplace, so no review collection or display surface | If Cami builds a reputation surface |
| **Loyalty reward automation** | Loyalty is parked | Post Tier-2 |
| **Birthday offer** | Needs a discount/promo engine; parked with deals | With the promo engine |
| **Waitlist updates** | Waitlist is unbuilt (gap 7) | With waitlist |
| **Win back lapsed clients** | ⚠︎ Achievable via a manual broadcast to a lapsed segment now; the dedicated automation is a later add | When automations deepen |

---

## Product decisions surfaced by this domain

| Decision | Why |
|---|---|
| **SMS sender identity and the 160-char limit** | Open: per-merchant sender IDs vs Cami-as-sender. Affects deliverability and spoof risk. Blocks clean UAE SMS |
| **Reminder link policy** | Status-update-only, no URLs today. Define when and how "managed links" arrive so reminders can carry a pay/confirm link safely |
| **Campaign "total sales" naming** | Collides with the reporting metric. Fold into the gap-4 sales-metric definitions |
| **Add-on pricing vocabulary** | WhatsApp and reminder monetization need named units (message pack, reminder add-on). No Fresha equivalent to port (gap 11) |
