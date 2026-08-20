# JTBD: Layla (the Receptionist), working the inbox

**Date:** 2026-08-16 · **Persona:** Layla, the Receptionist (champion user). Secondary: Sami, who gets told late.
**Node:** 2 (Job) in [the chain](../../_templates/chain.md). Feeds the [Agentic AI Platform BRD](../../specs/brd/agentic-ai-platform-brd.md) and [PRD](../../specs/prd/prd-agentic-ai-platform-2026-08-16.md), and the terminal checkout jobs in the [CamiPay capture BRD](../../specs/brd/camipay-capture-brd.md).
**Source:** [interview-snapshot-queenie](./interview-snapshot-queenie-2026-08-02.md) (real SOTA front-desk operator, Jul 2026), [journey-map-layla](./journey-map-layla-2026-08-02.md), lead-scoring study (~1,000 UAE pet businesses, Mar 2026), `personas.md` Layla, EC-1 to EC-14.
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **Ten jobs. Six carry a real operator's words behind them,** which makes this the best-evidenced persona in the workspace after Omar.
2. **The dominant job is not booking, it is managing change.** `JOB-RCP-BOOK2` (reschedule) and `JOB-RCP-BOOK3` (duplicate-catching) are most of Queenie's day. The AI Receptionist is scoped around inbound booking, which is the smaller half.
3. **Highest opportunity is `JOB-RCP-BOOK1`, handle every conversation without dropping one.** It is the only job that is *physically impossible* today, and it is the one the whole acquisition pitch rests on.
4. **Two jobs are blocked by a decision, not a build.** BOOK1 and BOOK6 need META (INV-C2), which restarted at stage 1 of three on 8 Aug.

⚠️ **Evidence:** the reschedule, duplicate, consult-gating, and squeeze patterns are ✅ validated by one real operator in **beauty**. They are ⚠️ assumed for pet, clinics, and fitness. One interview is enough to trust a pattern and not enough to size it.

---

## ID scheme

`JOB-RCP-<STAGE>#`, standard form. Stage axis is the operator stage from `feature-mappings/MAP.md`, so a job group maps onto a feature group mechanically.

**Assigned to the stage where the job is done, not where it is felt.** Omar feels the dropped booking; Layla does the work, so it homes here.

**Never renumber.** The PRDs below cite these IDs.

---

## Jobs

Scored against **Layla's day today**: WhatsApp on a phone, a paper diary or Fresha, prices in her head, Instagram handled by someone else. Opportunity = Importance + (Importance − Satisfaction).

### BOOK · Get booked

| ID | Job | Imp | Sat | Opp | Evidence |
|----|-----|-----|-----|-----|----------|
| **JOB-RCP-BOOK1** | "Handle every client conversation without dropping any, even at 11pm." | 10 | 2 | 18 | ✅ Validated (verbatim, PRD) |
| **JOB-RCP-BOOK2** | "When a client wants to move an appointment, I want to rebook in the thread and notify both the client and the stylist, so I do not lose the slot or the booking." | 10 | 3 | 17 | ✅ Validated (Queenie: "rescheduling shifting is mostly happening") |
| **JOB-RCP-BOOK3** | "When someone books, I want to know if they already have an appointment, so I do not double-book them." | 9 | 2 | 16 | ✅ Validated (Queenie: duplicates "happens a lot, many times") |
| **JOB-RCP-BOOK4** | "When a valuable client asks last-minute, I want to squeeze them in by reshuffling or asking staff to extend, so I never say no." | 9 | 4 | 14 | ✅ Validated (verbatim: "I don't want to say no") |
| **JOB-RCP-BOOK5** | "When a service has no fixed price, I want to route the client to a consultation, so I do not over-promise a price." | 7 | 4 | 10 | ✅ Validated (Queenie, extensions and color) |
| **JOB-RCP-BOOK6** | "When I cover for a colleague, I want the thread they were working, so the client does not have to repeat themselves." | 8 | 2 | 14 | ✅ Validated (Queenie, day-off handover) |
| **JOB-RCP-BOOK7** | "When a message arrives in Arabic or as a voice note, I want a usable reply path, so language is not the reason a booking is lost." | 7 | 5 | 9 | ⚠️ Inferred (EC-12, ADR-010) |

**BOOK1 is the acquisition pitch in one sentence, and it is impossible today.** 70% of booking inquiries arrive on WhatsApp, 40% of those after hours. A human front desk closes at 6pm. This is the job INV-C3 exists to serve, and the only one where autonomy is not a convenience but the entire mechanism.

**BOOK2 and BOOK3 together are the larger workload and the smaller investment.** The AI Receptionist is scoped around converting an inbound inquiry into a booking. Queenie's day is dominated by moving bookings that already exist and catching the same client booked twice across WhatsApp, Instagram, and direct-to-stylist. An AI that books beautifully and cannot reschedule serves the minority of her time.

**BOOK4 is where the AI must be able to decline to act.** A squeeze is a judgment call about which client is worth reshuffling for. INV-B7 lets staff force an overlap and gives the online booker no such power; an autonomous agent sits in neither category and needs an explicit rule.

**BOOK6 is the retention argument for the Unibox that nobody makes.** It is not about speed. It is that a covering person walks into a conversation cold, which is EC-14, and the thread is the only fix.

### PAY · Get paid

| ID | Job | Imp | Sat | Opp | Evidence |
|----|-----|-----|-----|-----|----------|
| **JOB-RCP-PAY1** | "When the visit ends, I want to take the money at the counter in one motion, so the next client is not waiting." | 9 | 5 | 13 | ⚠️ Inferred (ADR-014, terminal matches reception habit) |
| **JOB-RCP-PAY2** | "When I book, I want the deposit to be taken without me remembering to send anything, so an interruption does not become a no-show on Thursday." | 9 | 3 | 15 | ✅ Validated (EC-13, INV-B2 exists to fix exactly this) |
| **JOB-RCP-PAY3** | "When a deposit rule does not fit this client, I want a waiver I am allowed to use, so a VIP is not made to pay to hold a slot." | 7 | 4 | 10 | ✅ Validated (Queenie: hair/nails 25%, facials/makeup/SPMU 50%, VIPs waived) |

**PAY2 is the highest-value payments job on this page and it is already law.** INV-B2 makes deposit capture automatic on booking rather than a separate step. The job is written down so the invariant does not lose its reason: it exists because a walk-in interrupts, the link is never sent, and the slot no-shows.

**PAY3 has an unowned decision inside it.** EC-3 asks who authorizes a VIP waiver and nobody has answered. Shipping the waiver without the answer hands every staff member a discount-to-zero control, which is EC-4.

---

## What this changes

### 1. The AI Receptionist is scoped to the wrong half of her day

| What the AI is scoped to do | Share of Queenie's conversation volume |
|---|---|
| Convert an inbound inquiry into a booking (BOOK1) | The smaller half, but the one that is impossible after hours |
| Move an existing booking and tell the stylist (BOOK2) | "Mostly happening", her words |
| Catch a duplicate before it clashes (BOOK3) | "A lot, many times" |

Neither reschedule nor duplicate detection appears in the MVP AI capability list (`product.md`: conversational scheduling, reschedule *auto-suggestion*, next-visit recommendation, consent prefill, campaign segmentation). Auto-suggestion is not the reschedule loop; the loop's hard step is the **staff notify**, which is manual today and is why Queenie walks upstairs (EC-7).

**This is a scoping finding, not a build request.** Either the AI's first release owns change as well as creation, or the PRD says plainly that the smaller half ships first and why.

### 2. Duplicate detection is a cross-channel problem, so it is not an AI feature

Duplicates are born because the same client books on WhatsApp, on Instagram (a different person handles it), and directly with the stylist. An AI Receptionist that only sees WhatsApp cannot catch them. What catches them is a future-appointments view on the client record plus a duplicate check at booking, which is EC-1 and is 🔴 today.

Putting duplicate-catching inside the AI scope would hide a data problem inside a model. Keep it in the OS layer.

### 3. Layla is the reason the Unibox is a retention feature

Her adoption is load-bearing for retention: if she does not adopt, the owner's spend evaporates. Every job above except BOOK7 and PAY3 gets materially better with a shared inbox, and BOOK6 is impossible without one. That is the churn argument for OBJ-P1 stated in jobs rather than in strategy.

---

## Against `personas.md`

**Confirms:** every job on the persona page, now with IDs.

**Adds, three the persona page implies but does not state as jobs:** BOOK6 (covering-staff context, currently only a frustration), BOOK7 (Arabic and voice notes, currently only an edge case), PAY2 (deposit-without-remembering, currently only a product implication under INV-B2).

**Correction carried forward:** the persona page already records Queenie's central correction, that her core job is managing change rather than first-time booking. This document acts on it by ranking BOOK2 and BOOK3 above BOOK5 and by naming the AI scoping gap.

---

## Evidence and confidence

- ✅ **Validated (Jul 2026, Queenie, SOTA front desk):** reschedule dominance, cross-channel duplicates, squeeze behavior, consult-gated pricing, per-service deposit percentages with VIP waiver, day-off context loss.
- ✅ **Validated (lead-scoring study, ~1,000 UAE pet businesses, Mar 2026):** 70% of inquiries on WhatsApp, 40% after hours.
- ⚠️ **Inferred:** PAY1 and BOOK7, from ADR-014 and EC-12 rather than from Queenie.
- ⚠️ **Assumed:** all Imp and Sat scores. Queenie described her day; she did not rate these jobs.
- ⚠️ **Assumed:** that the role shape holds outside beauty. Validated in beauty only. Pet, clinics, and fitness are untested.
- 🔴 **Unknown:** how often duplicates actually occur per week and how many no-shows they cause. EC-1 asks this and nobody has counted.

---

## Collection backlog

| Item | Owner | Status |
|---|---|---|
| Have Queenie read this page and correct the scores, particularly BOOK4 and PAY3 | Michelle, weekly Tue co-design session | 🟡 Sessions agreed |
| Count duplicates and their no-shows over 2 weeks at one pilot site (EC-1) | Michelle / Maaz | 🔴 |
| Interview one front desk outside beauty, ideally pet boarding, to test cross-vertical generalization | Michelle | 🔴 |
| Answer EC-3: who authorizes a VIP deposit waiver | Michelle + operator | 🔴 Blocks PAY3 |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Minted `JOB-RCP-BOOK1-7` and `PAY1-3`. Named the AI-scoping finding: the MVP capability list covers inquiry-to-booking, while the validated dominant workload is reschedule and duplicate-catching |
