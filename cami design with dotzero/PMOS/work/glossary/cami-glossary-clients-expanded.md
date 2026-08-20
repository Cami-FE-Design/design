# Cami Glossary: Clients / CRM (full entries)

**Last updated:** 2026-08-03
**Scope:** Full 6-field entries for the Clients domain, expanded from [cami-glossary.md](cami-glossary.md).
**Fields:** What it is / Cami mechanics / Reversible / Where you see it / Don't confuse with / Status.
**Legend:** ⚠︎ = mechanic or UI path not confirmed from context, needs product sign-off.

> **This is the horizontal CRM layer.** The WhatsApp inbox, client record, and follow-ups are horizontal by nature and serve every vertical unchanged. The vocabulary here should stay vertical-neutral, with one Cami addition Fresha does not have: a **pet (or bookable subject) sub-record** under the client (see the addition note at the end).

---

## Entries

### Client profile

- **What it is.** The record holding a client's details, history, documents, and stored balance.
- **Cami mechanics.** Minimum viable record: name, email, phone. **Phone is the primary identity** since the relationship lives in WhatsApp; email and phone drive notifications and **duplicate detection**. A new profile gets a "New" label that clears on first visit or transaction. ⚠︎ **Cami divergence:** no Fresha-side marketplace client account to sync from. ⚠︎ **Cami addition:** in pet, the profile carries **pet sub-records** (the pet, not the parent, carries the relationship). First-class client profiles are a live feature.
- **Reversible.** Partially. Field edits reversible; deletion not self-serve reversible.
- **Where you see it.** ⚠︎ Clients list; Add client from the appointment flow.
- **Don't confuse with.** The pet sub-record; the WhatsApp contact (identity source, not the profile).
- **Status.** Live.

### Appointment / marketing notifications (consent)

- **What it is.** Per-client consent settings controlling which messages the client receives.
- **Cami mechanics.** Two independent switches (appointment vs marketing), by channel. Marketing consent is the **eligibility gate for broadcasts**: a segment count is an estimate, and the actual broadcast reaches fewer, only clients with valid contact details and accepted marketing preferences. ⚠︎ Channel set: WhatsApp (gated on META), SMS, email.
- **Reversible.** Yes. Editable.
- **Where you see it.** ⚠︎ Client, edit details.
- **Don't confuse with.** Client segments (audience, not consent).
- **Status.** Live for SMS/email consent; WhatsApp gated on META.

### Client tags

- **What it is.** Labels you create and assign to group clients, for example VIP, Senior.
- **Cami mechanics.** Internal only, invisible to clients. Function as filters and combine with other filters. Maps to **lead tagging in the unibox**. Multiple tags per client. ⚠︎ Per-workspace cap to confirm (Fresha caps at 20).
- **Reversible.** Yes. Assign and unassign, individually or in bulk.
- **Where you see it.** ⚠︎ Settings, Clients; assign on the profile; filter in the list.
- **Don't confuse with.** Client segments (rule-based, automatic), client source.
- **Status.** ⚠︎ Confirm.

### Client note

- **What it is.** A private internal note on a profile, for example color formulas or style preferences.
- **Cami mechanics.** Persists across all future appointments. Private to the team; clients cannot see it. This is the **context the service staff (Sami) needs** ("the doodle with the allergy, or the one that bites"). ⚠︎ Optional file attach to confirm.
- **Reversible.** No once deleted. Editing is fine.
- **Where you see it.** ⚠︎ Client profile, Notes.
- **Don't confuse with.** Staff alert (prominent, two places), client files.
- **Status.** ⚠︎ Confirm.

### Staff alert

- **What it is.** A prominent, persistent warning the team sees before the appointment.
- **Cami mechanics.** Shows on the profile **and** the appointment view, so the team sees it before starting. For medical conditions, service restrictions, special instructions ("the one that bites"). Two-place display is the difference from a note.
- **Reversible.** Yes. Edit covers update and removal.
- **Where you see it.** ⚠︎ Client profile, Actions.
- **Don't confuse with.** Client note (profile-only, less prominent), allergy (structured), appointment note (one-time).
- **Status.** ⚠︎ Confirm.

### Allergy (structured intake)

- **What it is.** A structured record of a client's (or pet's) allergy on the profile.
- **Cami mechanics.** Classified with reaction type, severity, optional note. Visible on the profile and the appointment view. Can be collected via **consultation forms**. ⚠︎ Does not block booking (no prevention mechanism in Fresha; confirm Cami stance). Generalize across verticals: pet allergy, salon sensitivity, clinic intake.
- **Reversible.** ⚠︎ Not documented in Fresha; confirm edit/remove for Cami.
- **Where you see it.** ⚠︎ Profile or appointment view, Actions.
- **Don't confuse with.** Staff alert (free text), patch test.
- **Status.** ⚠︎ Confirm; part of the consent/intake feature.

### Patch test (gated pre-service check)

- **What it is.** A recorded skin-sensitivity (or equivalent pre-service) test result.
- **Cami mechanics.** Fields: title, tested date, team member, status (Pending/Passed/Failed), description. ⚠︎ **Vertical-specific** (beauty color, some clinical). Does not gate bookability in Fresha; reminders help complete it in time. History under Documents. ⚠︎ Fresha fixes expiry at 6 months, non-configurable; decide Cami's rule.
- **Reversible.** ⚠︎ Not documented.
- **Where you see it.** ⚠︎ Profile, Add patch test; history under Documents.
- **Don't confuse with.** Allergy, consultation forms.
- **Status.** ⚠︎ Confirm need per vertical; not core to pet.

### Client files

- **What it is.** Documents and images stored on a profile, for example before/after photos.
- **Cami mechanics.** Secure, private to the team. ⚠︎ Supported formats to confirm.
- **Reversible.** No once deleted.
- **Where you see it.** ⚠︎ Client profile, Documents / Files.
- **Don't confuse with.** Note attachments, completed forms (Forms tab).
- **Status.** ⚠︎ Confirm.

### Client form / Consultation form

- **What it is.** A customizable questionnaire to collect client info before or during an appointment.
- **Cami mechanics.** **Digital capture e-signed over WhatsApp, stored on the record.** Two delivery modes: **Automatic** (attached to specific services, sent when booked) and **Manual** (added to any appointment or profile). **Templates configurable per business type: Cami ships defaults, the business overrides.** Template statuses Active / Inactive. Completed forms saved on the client profile.
- **Reversible.** Yes. Deactivate/Activate a template without deleting.
- **Where you see it.** ⚠︎ Settings, Forms.
- **Don't confuse with.** Client files, notes, staff alert.
- **Status.** Live (consent + intake feature).

### Form template

- **What it is.** The reusable definition of a form, built from sections and questions.
- **Cami mechanics.** Organized into sections. Question types include short/long answer, single answer, **single checkbox (the consent primitive)**, multiple choice, drop-down, yes/no, description text. Questions can be marked required. ⚠︎ Cami ships vertical default templates (pet intake, salon consultation), business overrides.
- **Reversible.** Yes. Edit freely, deactivate rather than delete.
- **Where you see it.** ⚠︎ Settings, Forms, template editor.
- **Don't confuse with.** A completed form instance (lives on the profile).
- **Status.** ⚠︎ Confirm question-type set.

### Signature (on a form)

- **What it is.** The client's captured signature confirming a completed form.
- **Cami mechanics.** **E-signed over WhatsApp** (draw or type). States: draft, completed, incomplete. Completed forms attach to the profile.
- **Reversible.** ⚠︎ Not documented.
- **Where you see it.** ⚠︎ Appointment or profile, the form, Sign.
- **Don't confuse with.** Marketing consent (a separate profile-level setting).
- **Status.** Live (e-sign over WhatsApp).

### Client source

- **What it is.** A record of how a client discovered the business.
- **Cami mechanics.** ⚠︎ **Cami channels differ from Fresha:** WhatsApp, Instagram, direct-to-stylist, ads, AI Receptionist, online booker (no "Marketplace"). Feeds channel reporting. ⚠︎ This is entangled with the **multi-channel duplicate problem**: the same client arriving via three channels is where double-bookings and duplicate profiles are born.
- **Reversible.** Yes for manual sources.
- **Where you see it.** ⚠︎ Settings, Clients; on the profile.
- **Don't confuse with.** Referred by (person-level), tags, segments.
- **Status.** ⚠︎ Confirm the Cami channel list.

### Referred by

- **What it is.** The existing client who referred this client.
- **Cami mechanics.** Manual attribution, no reward mechanics. Shows on the profile and in reporting.
- **Reversible.** Yes. Remove clears it.
- **Where you see it.** ⚠︎ Profile, edit details.
- **Don't confuse with.** Client source, loyalty referrals (cut).
- **Status.** ⚠︎ Confirm, low priority.

### Client segments

- **What it is.** Groups that automatically organize clients by conditions.
- **Cami mechanics.** Standard (prebuilt: new, returning, high-value, lapsed) and Custom (advanced conditions). Consumed as the **audience for WhatsApp broadcasts**. Example from the AI capabilities: **active in the last 60 days** (AI-assisted segmentation). Counting caveat: the segment count is an estimate; the broadcast reaches fewer (valid contacts + marketing consent).
- **Reversible.** Yes. Standard segments restore to defaults.
- **Where you see it.** ⚠︎ Clients, Segments; broadcast audience picker.
- **Don't confuse with.** Client tags (manual, filter-only).
- **Status.** ⚠︎ Confirm; AI segmentation is an MVP AI capability.

### Delete client

- **What it is.** Removing a client profile from the list.
- **Cami mechanics.** Removed from the list, but past sales, appointments, and records stay, so reporting is not altered. ⚠︎ Bulk delete to confirm.
- **Reversible.** No via the UI.
- **Where you see it.** ⚠︎ Client, Actions, Delete.
- **Don't confuse with.** Block client (gap), archive (does not exist for clients).
- **Status.** ⚠︎ Confirm.

### Merge profiles / Merge duplicates

- **What it is.** Combining duplicate client records into one profile.
- **Cami mechanics.** ⚠︎ **High-value for Cami and bigger than Fresha's version.** Fresha matches duplicates on **email or phone**. Cami's duplicate problem is **cross-channel** (same client via WhatsApp, Instagram, direct-to-stylist), so matching on phone/email alone will miss cases, this needs to pair with **duplicate detection + a future-appointments view + alerts at booking**. During merge, pick which name/phone/email survives; all history combines.
- **Reversible.** No. Merges are permanent.
- **Where you see it.** ⚠︎ Client, Actions, Merge profiles.
- **Don't confuse with.** Delete client, importing a list (where duplicates originate).
- **Status.** ⚠︎ Build need. Directly tied to the validated double-book pain.

### Client wallet ⚠︎ gap

- **What it is.** The area of a profile holding stored balance and payment details.
- **Cami mechanics.** ⚠︎ Would hold **voucher balances** and **upfront payments (prepaid deposits)**. **No saved cards** (no card-on-file on NeoPay). Available balance = redeemable voucher + upfront amounts.
- **Reversible.** Not applicable. A derived balance.
- **Where you see it.** ⚠︎ Client profile, Wallet.
- **Don't confuse with.** The provider-side wallet (NeoPay), memberships (entitlements, not money).
- **Status.** ⚠︎ Define scope; no saved-card component.

---

## Cut from this domain (do not port)

| Fresha term | Why cut | Revisit |
|---|---|---|
| **Client Loyalty** (umbrella) | Loyalty is parked in the Cami roadmap | Post Tier-2 |
| **Loyalty points** | Same | Post Tier-2 |
| **Loyalty tier** | Same | Post Tier-2 |
| **Reward** | Same | Post Tier-2 |
| **Loyalty referrals** | Same. Note: "Referred by" (manual attribution) is kept | Post Tier-2 |
| **Block client** | ⚠︎ Not confirmed at v1; keep as a gap, not a port | Tier 2 |

---

## Cami addition Fresha does not have

| Term | Why it exists |
|---|---|
| **Pet sub-record (bookable subject)** | Cami started in pet; the **pet, not the parent, carries the relationship**. The client profile holds one or more pet records (multi-pet households: "which Bella?"). Generalizes to any "bookable subject" a vertical needs. This is the vertical OS layer expressed in the client record. Product context lists **client/pet profiles** as a live surface. Define its fields (name, breed/type, notes, allergy, consent) as a first-class sub-record, not a free-text note |

---

## Product decisions surfaced by this domain

| Decision | Why |
|---|---|
| **Cross-channel duplicate matching** | Phone/email matching (Fresha's model) misses WhatsApp-vs-Instagram-vs-direct-to-stylist duplicates. Needs a richer match + booking-time alerts. The single biggest CRM build beyond a straight port |
| **Pet / bookable-subject sub-record schema** | First-class, not a note. Fields and how it attaches to bookings |
| **Cami channel list for client source** | Replace Fresha's marketplace/walk-in/book-now with Cami's real channels |
| **Patch test / allergy gating** | Decide whether either blocks booking, and the expiry rule, per vertical |
