# Journey Map: Layla Handles an Inbound WhatsApp Booking

**Persona:** Layla, the Receptionist (Champion User), from personas.md
**Scenario:** A client messages the business WhatsApp to book or change an appointment. Layla takes it from first message through a paid, confirmed appointment, and through the constant reschedule/modify churn that dominates her day.
**Scope:** Inbound message arrives → identify → quote/scope → find slot → book and capture deposit → confirm and remind → reschedule/duplicate loop → service-day closeout and rebook

## Context

*What I found in your files:*

- **Persona details:** Layla is the front-desk operator, often solo. Verbatim JTBD: "handle every client conversation without dropping any, even at 11pm." Adoption is load-bearing for retention (personas.md, validated 2026).
- **Now validated against a real operator:** This map is upgraded with the **Queenie interview** (SOTA Salon, Tier 2, 2026-07-28). Queenie is a real-world Layla. Her session both confirmed the persona and corrected it: the dominant workload is **reschedule and duplicate management, not first-time booking**. See [interview-snapshot-queenie-2026-08-02.md](work/discovery/outputs/interview-snapshot-queenie-2026-08-02.md) and [source transcript](work/discovery/inputs/ai-inbox-design-queenie-2026-07-28.md).
- **Known issues (product.md):** WhatsApp copy-paste, deposit-on-booking, no-show reduction, AI Receptionist, multi-service booking, reminders. All map to v0.2 / v1.
- **Roadmap state:** WhatsApp Unibox + two-way comms + AI Receptionist are **v0.2, Aug–Sep 2026, in build**, META-gated. Deposits, reminders, CamiPay (NeoPay) live or landing in v0.1/v1. Journey below is the **current lived experience**; opportunities map to scoped or newly-surfaced work.

**Data Sources:** Queenie interview (SOTA front desk, primary), personas.md, product.md, company.md, goals.md.
**Confidence:** **Medium-High for SOTA / beauty** (grounded in a real Tier 2 operator). Cross-vertical (pet, clinics, fitness) still inferred.

## Journey Overview

| Stage | Actions | Emotions | Pain Points |
|-------|---------|----------|-------------|
| 1. Inbound arrives | Message lands on WhatsApp (also Instagram, direct-to-stylist), often after hours | 😐 → 😤 | 40% after-hours; multi-channel; morning backlog of 20–30 |
| 2. Identify and triage | Link unknown number to profile, read history + "usual staff" | 😐 | Copy-paste ~1.5–2.5 min/booking; context scattered |
| 3. Quote and scope | Quote service + price; route consult-gated services | 😤 | Extensions/color have no fixed price; padded quote is "an art" |
| 4. Find slot / close gap | Suggest slot, sequence multi-service, squeeze VIPs | 😤 | Service (not stylist) dictates order; parallel vs sequential; squeeze asks |
| 5. Book and capture deposit | Book, fire deposit link | 😤 | Deposit % varies by service; VIP waivers; link forgotten under interruption |
| 6. Confirm and remind | Confirm, remind 24h/1h | 😐 | Manual, inconsistent, no safety net |
| 7. Reschedule + duplicate loop | Reshuffle staff/slots, notify client + staff, catch dupes | 😤😤 | **The dominant workload.** Walks to stylist; duplicates "many times"; covering staff lack context |
| 8. Service day + rebook | Deliver, closeout, rebook recurring | 😊 → 😐 | Cash leakage; recurring "book me till December" unmodeled |

## Stage Details

### Stage 1: Inbound Arrives

**User Actions:**
- Opens WhatsApp to 20–30 morning messages to clear; also fields Instagram (separate handler) and direct-to-stylist bookings.

**Thoughts:** "Fourteen overnight, and I haven't unlocked the till." / "This one came in at 11:20pm, did we lose them?"

**Emotional State:** Neutral → Negative. Standing debt that never clears.

**Touchpoints:** WhatsApp thread (primary), Instagram, phone, direct-to-stylist.

**Pain Points:**
- 40% of inquiries after-hours, no one answering, Evidence: lead-scoring study (personas.md).
- **Multi-channel intake** creates parallel booking streams that collide, Evidence: Queenie ("a different lady handling our Instagram... they are also booking it").

**Opportunities:**
- AI Receptionist answers after-hours autonomously (v0.2).
- Unibox as one assignable inbox; **reconcile Instagram + direct-to-stylist channels**, not just WhatsApp (net-new, raised by Queenie).

### Stage 2: Identify and Triage

**User Actions:**
- Links an unknown number to an existing Cami profile in one click; reads last 3 appointments, notes, and "usual staff."

**Thoughts:** "Which Bella?" / "Who does she usually see?"

**Emotional State:** Neutral (this is where the AI Inbox already helps most).

**Touchpoints:** Inbox link-to-profile, client record.

**Pain Points:**
- Copy-paste tax of ~1.5 to 2.5 min per booking between Fresha/notebook/WhatsApp, Evidence: Queenie + Cami time-cost estimate.
- "Usual staff" logic must stay simple and short to read.

**Opportunities:**
- Link-to-profile + history surfaced in-thread (v0.2, validated as the part Queenie loved).
- "Usual staff" = **count of appointments with same staff, most recent wins**; transfers only when regular is on vacation (Queenie's rule, keep it simple).

### Stage 3: Quote and Scope

**User Actions:**
- Quotes standard services fast; for extensions/hair color, sends price list + padded range + pushes a **consultation**.

**Thoughts:** "I can't give exact, it depends on the hair director." / "Say 4,500 to be safe so the client is happy paying less."

**Emotional State:** Negative, pricing these is genuinely hard.

**Touchpoints:** Pasted templates from notes, price list.

**Pain Points:**
- **Consultation-gated services can't be booked clean**, no fixed price (extensions ~1250–1550 AED/pack + fitting + color), Evidence: Queenie, net-new.

**Opportunities:**
- A **"book consultation / send range" path** distinct from fixed-price booking (net-new OS-layer requirement, product.md vertical OS layer).

### Stage 4: Find Slot / Close the Gap

**User Actions:**
- AI suggests a gap-closing slot + preferred staff + alternatives. For multi-service (hair + nails + facial), sequences the visit. Squeezes VIPs by asking staff to extend or reshuffling.

**Thoughts:** "Hair first, 15 min before nails." / "She's a big spender, let's make it work." / "I don't want to say no, could you stay?"

**Emotional State:** Negative under load, this is judgment-heavy.

**Touchpoints:** Calendar, staff (often in person), WhatsApp.

**Pain Points:**
- **Service, not stylist, dictates order**; hair primary (15 min color before nails); parallel vs sequential, prototype showed only one start time, Evidence: Queenie, UI gap.
- **Squeeze/last-minute** requires asking staff to extend hours; hard every evening, Evidence: Queenie.

**Opportunities:**
- Real-time multi-venue calendar with slot hold (product.md, core).
- **Service-driven multi-service sequencing in the UI** (parallel + sequential), more cards to pick from (Cami's stated direction).
- Surface **previously-bundled services** as a one-tap rebook ("reorder the same order you love").

### Stage 5: Book and Capture Deposit (make-or-break)

**User Actions:**
- Books; fires deposit link as the confirmation step. Applies per-service deposit rules; waives for VIPs.

**Thoughts:** "Hair/nails 25%, facials/makeup/SPMU 50%." / "She's VIP, don't force a deposit." / "I'll send the link after this walk-in" (then forgets).

**Emotional State:** Negative in hindsight, the invisible revenue leak is born here.

**Touchpoints:** Deposit link, CamiPay/NeoPay, invoice.

**Pain Points:**
- Deposit link forgotten under interruption → Thursday no-show, noticed at month-end, Evidence: personas.md, validated dynamic.
- **Deposit % varies by service; VIPs waived**, Evidence: Queenie (net-new rule set).

**Opportunities:**
- Deposit capture automatic on booking (product.md design implication).
- **Per-service deposit % rules + VIP waiver** (extends product.md deposit feature).

### Stage 6: Confirm and Remind

**User Actions:** Manually confirms and reminds when she can.

**Emotional State:** Neutral, trusts memory, no safety net.

**Pain Points:** No systematic 24h/1h reminder → 15–25% UAE no-show rate (personas.md).

**Opportunities:** WhatsApp auto-reminders (24h/1h + no-show rebook), product.md, targets ~30% no-show reduction.

### Stage 7: Reschedule + Duplicate Loop (the real dominant workload)

**User Actions:**
- Handles constant change requests: reshuffles staff and slots, messages the client ("okay to move?"), waits for yes, then moves, then coordinates the stylist, often by **physically walking upstairs** because staff don't reply fast on WhatsApp.
- Catches duplicate bookings by eye across WhatsApp / Instagram / direct-to-stylist.

**Thoughts:** "You already booked next week, want me to reschedule instead?" / "Why did she book twice today?" / "If it's urgent I go up, if it's next week I forward the message."

**Emotional State:** Very Negative, highest-friction, most-frequent, least-supported part of the job.

**Touchpoints:** WhatsApp, in-person staff coordination, memory, month-end review.

**Pain Points:**
- **Reschedule/modify is most of the conversation volume, not new booking**, Evidence: Queenie ("rescheduling shifting is mostly happening"). Not modeled in the original map.
- **Duplicates happen "many times"** across channels; clients don't mention existing bookings, Evidence: Queenie.
- **Covering staff lack the original conversation context** on her day off, Evidence: Queenie.

**Opportunities:**
- **Reschedule from the conversation**, with a client-notify template + internal staff-notify chain (net-new, top workload).
- **Duplicate detection + future-appointments tab + alerts** ("this person seems to have two appointments today") (net-new, not on current roadmap).
- Shared thread context so any covering operator sees the history.

### Stage 8: Service Day, Closeout and Rebook

**User Actions:** Greets client, hands to Sami, takes payment, rebooks recurring clients.

**Thoughts:** "Cash again, reconcile later." / "She's nails every 3 weeks." / "Book me until December."

**Emotional State:** Positive at greeting → Neutral at manual, cash-heavy checkout.

**Pain Points:**
- Cash leakage reduces captured volume (the revenue model), Evidence: company.md, personas.md tier heuristics.
- **Recurring/standing bookings unmodeled** (weekly blow-dry, 3–4 week nails, months-ahead standing slots), Evidence: Queenie.

**Opportunities:**
- Integrated CamiPay closeout + auto-reconciliation (v1).
- **Recurring appointment series** + cadence-based rebook suggestion (e.g. 3-week nails) (net-new).
- AI next-visit recommendation + segmented rebook campaigns (product.md AI MVP).

## Emotional Journey

```
High  | 😊                                        😊
      |                                        (greeting)
Mid   |         😐   😐                 😐
      |
Low   |    😤            😤   😤   😤(deposit)    😤😤        😤
      +--------------------------------------------------------
        1    2    3    4    5    6         7           8
      Arrive ID  Quote Slot Book Remind  Reschedule  Closeout
                                          (deepest)
```

Three troughs: **Stage 4 (multi-service squeeze)**, **Stage 5 (forgotten deposit)**, and the new **Stage 7 (reschedule + duplicate loop)**, now the deepest, because it is the most frequent and least supported.

## Moments of Truth

| Moment | Stage | Impact | Current State | Evidence |
|--------|-------|--------|---------------|----------|
| After-hours message that never gets answered | 1 | Cold inquiry = lost booking + lost GMV | ❌ Manual, next-morning | Research |
| Duplicate caught vs booked twice | 7 | Double-book damages client + wastes a slot | ❌ Caught by eye only | Queenie (validated) |
| Reschedule confirmed with client + staff | 7 | Most-frequent flow; failure = drop or clash | ❌ Manual, walks upstairs | Queenie |
| Deposit link remembered vs forgotten | 5 | Decides whether the slot holds + margin captured | ❌ Depends on memory | Validated dynamic |
| Consultation routed vs price over-promised | 3 | Wrong quote loses trust or money | ⚠️ Manual padded range | Queenie |
| Payment on Cami rails vs cash | 8 | Captured volume is the entire revenue model | ⚠️ Cash-heavy | company.md |

## Priority Opportunities

*Ranked by impact and evidence strength*

| Opportunity | Stage | Impact | Effort | Evidence |
|-------------|-------|--------|--------|----------|
| Reschedule from conversation + client/staff notify | 7 | High | Medium | Queenie (dominant workload) |
| Duplicate detection + future-appointments tab + alerts | 1,7 | High | Medium | Queenie (net-new) |
| AI Receptionist after-hours + Unibox (multi-channel) | 1,2 | High | Medium (v0.2, META-gated) | product.md + Queenie |
| Service-driven multi-service sequencing (UI) | 4 | High | Medium | Queenie |
| Deposit auto-capture + per-service % + VIP waiver | 5 | High | Low–Medium | Queenie + product.md |
| Consultation-booking path for gated services | 3 | Medium | Medium | Queenie (net-new) |
| WhatsApp auto-reminders (24h/1h/no-show) | 6 | High | Low (live/landing) | product.md |
| Recurring appointment series + cadence rebook | 8 | Medium | Medium | Queenie |
| Staff price/discount/comp permission guardrails | 4,5 | Medium | Medium | Queenie (revenue integrity) |

## Connection to Product Roadmap

| Finding | Related Initiative | Status |
|---------|-------------------|--------|
| After-hours + multi-channel intake (1) | AI Receptionist + Unibox (v0.2) | Planned, META-gated |
| Link profile + usual staff (2) | AI Inbox link-to-profile | In build, validated by Queenie |
| Consultation-gated pricing (3) | Vertical OS layer (service semantics) | **Net-new, not scoped** |
| Multi-service sequencing (4) | Multi-venue calendar / booking UI | Core, UI gap flagged |
| Deposit %/VIP + auto-capture (5) | Deposits + CamiPay | Landing v1, needs per-service rules |
| Reminders (6) | WhatsApp auto-reminders | Live / v0.1 |
| Reschedule loop + duplicates (7) |, | **Net-new, top workload, not scoped** |
| Cash leakage + recurring (8) | CamiPay POS; recurring series | v1 / **recurring net-new** |

Three **net-new, unscoped** needs surfaced from Queenie: **reschedule-from-conversation**, **duplicate/multi-channel detection**, and **recurring series + consultation booking**. These are the gaps between the current roadmap and a real Tier 2 front desk. Binding constraint for the scoped items remains **META verification**.

## Assumptions to Validate

- ⚠️ Cross-vertical: journey now grounded in beauty (SOTA); pet, clinics, fitness still assumed to follow the same 8 stages.
- ⚠️ Frequency unquantified: how many reschedules and duplicates per week, and how much no-show they cause (size Stage 7).
- ⚠️ Multi-service mix: what share of bookings are 2+ services, parallel vs sequential (size Stage 4).
- ⚠️ Captured-vs-booked gap at Stage 8: how much volume leaves Cami rails (cash) at live accounts.

## Next Steps

1. Quantify Stage 7: measure reschedule + duplicate frequency from the SOTA WhatsApp export (anonymized) to size the top workload.
2. Scope the three net-new needs (reschedule-from-conversation, duplicate detection, recurring/consultation booking) and run through `/prioritization-engine` against current v0.2/v1 roadmap.
3. Weekly Tuesday co-design with Queenie; shadow live reschedule + squeeze flows.
4. Update personas.md Layla with the reschedule-loop, multi-channel duplicate, and consultation-gating insights; mark the Collection-backlog validation item in progress.
5. Re-map for a pet Tier 2 (boarding) account to test cross-vertical generalization of Stages 3, 4, 7.
