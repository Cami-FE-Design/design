# JTBD: Noor (the Payer), paying for a booking

**Date:** 2026-08-16 · **Persona:** Noor, the Payer (end customer). Secondary: Layla, who absorbs every failure.
**Node:** 2 (Job) in [the chain](../../_templates/chain.md). Feeds the [CamiPay capture BRD](../../specs/brd/camipay-capture-brd.md), [CamiPay Online PRD](../../specs/prd/prd-camipay-online-2026-08-16.md), [CamiPay Terminal PRD](../../specs/prd/prd-camipay-terminal-2026-08-16.md).
**Source:** `03-state-machines.md` §8 and §9, `05-edge-case-catalog.md` EC-20 to EC-28, [journey-map-payer](./journey-map-payer-2026-08-16.md), [journey-map-payment-lifecycle](./journey-map-payment-lifecycle-2026-08-16.md), `personas.md` Noor.
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **Nine jobs, all minted here, none validated by a person.** Noor is the persona closest to revenue and the only one with zero research.
2. **The online rail has four failure points, the terminal has one.** That asymmetry is a payer-conversion argument for pulling the terminal forward, not only a merchant-cost argument.
3. **The highest-opportunity job is the cheapest to serve:** `JOB-CLI-PAY2`, know within seconds that the payment landed. It costs a webhook budget, not a feature.
4. **`JOB-CLI-PAY1` (one tap, method already on the phone) is gating launch on a belief.** EC-26 asserts nobody adds a card by hand. Nothing measures it.

🔴 **Evidence:** derived entirely from Cami's own state machines and edge-case catalog. **No customer has been observed paying.** Job existence is defensible because the failure modes are documented in the product; every score, emotion, and abandonment claim below is a hypothesis. Half a day at a pilot site closes most of it.

---

## ID scheme

`JOB-CLI-<MOMENT>#`, per the single-stage exception in [chain.md](../../_templates/chain.md). Noor lives entirely in the PAY operator stage, so the group slot uses their own lifecycle instead: **BOOK** (asked for money before anything happened), **PAY** (the ninety seconds), **AFTER** (receipt, refund, dispute).

`CLI` not `PAY` for the role code, so role never collides with stage. House terminology, Client not Customer.

**Never renumber.** The PRDs below cite these IDs.

---

## Jobs

Scored against **what Noor experiences today**: a NeoPay-hosted page reached from a WhatsApp thread, or a card machine at a counter. Opportunity = Importance + (Importance − Satisfaction).

### BOOK · Before anything has happened

| ID | Job | Imp | Sat | Opp | Evidence |
|----|-----|-----|-----|-----|----------|
| **JOB-CLI-BOOK1** | "When I am asked to pay before the service happens, I want to understand what the money is holding, so it does not feel like I am being distrusted." | 8 | 4 | 12 | ⚠️ Assumed |
| **JOB-CLI-BOOK2** | "When I cannot pay right now, I want the hold to survive long enough for me to come back, so asking a question does not cost me the slot." | 7 | 5 | 9 | ⚠️ Inferred (INV-B1 5-minute hold vs INV-P12 12-hour link) |

**BOOK1 is the least-designed money moment in the product.** The deposit is the first time Cami asks a stranger for money, and no surface explains what it holds or what happens on cancellation. INV-B2 makes capture automatic, which removes Layla's failure mode (EC-13) and leaves Noor's unaddressed.

**BOOK2 names a real seam.** The online booker holds a slot for 5 minutes (INV-B1). The payment link lives 12 hours (INV-P12). A payer who opens the link an hour later is paying for a slot the hold released. Nothing in `03 §7` or `§8` reconciles the two windows.

### PAY · The ninety seconds

| ID | Job | Imp | Sat | Opp | Evidence |
|----|-----|-----|-----|-----|----------|
| **JOB-CLI-PAY1** | "When I pay, I want it done in one tap with the method already on my phone, so I do not have to go find my card." | 10 | 3 | 17 | ⚠️ Assumed, load-bearing (EC-26) |
| **JOB-CLI-PAY2** | "When I have paid, I want to know straight away that it worked, so I am not left wondering whether to pay again." | 10 | 4 | 16 | ⚠️ Inferred (EC-23, webhook 1 to 2 min in test) |
| **JOB-CLI-PAY3** | "When my bank interrupts with a code, I want to have been told it was coming, so it does not read as a failure." | 7 | 3 | 11 | ⚠️ Inferred (EC-24) |
| **JOB-CLI-PAY4** | "When I open a link that no longer works, I want to be told what to do next, so I do not conclude the business is broken." | 8 | 2 | 14 | ⚠️ Inferred (EC-20, expired link renders blank) |
| **JOB-CLI-PAY5** | "When I pay at the counter, I want it to be over in one tap on a machine I recognize, so I am not the reason a queue forms." | 9 | 8 | 10 | ⚠️ Assumed |

**PAY1 has the highest opportunity score on the board and the weakest evidence.** EC-26 is currently a launch blocker on the strength of one sentence: no one adds a card by hand. That may well be right. It is not measured, and it is deciding sequencing.

**PAY5 scores high on satisfaction because a person is standing there.** The terminal's real advantage for Noor is not speed, it is that any failure is fixed by a human in front of them. Online must replace that reassurance with copy and latency, which is why PAY2 and PAY4 are where the online rail is won or lost.

### AFTER · Receipt, refund, dispute

| ID | Job | Imp | Sat | Opp | Evidence |
|----|-----|-----|-----|-----|----------|
| **JOB-CLI-AFTER1** | "When I need proof I paid, I want to find the receipt in the thread I already use, so I am not searching an inbox." | 7 | 6 | 8 | ⚠️ Inferred (INV-C4) |
| **JOB-CLI-AFTER2** | "When something goes wrong with my money, I want to reach a person at the business, not a system." | 9 | 5 | 13 | ✅ Validated as product intent (ADR-018 mandates the Call/WhatsApp button) |

**AFTER2 is the one job the product has explicitly decided in Noor's favor.** ADR-018 keeps Cami out of disputes and routes the customer to the merchant, with a required disclaimer and call button. The job is served by a decision, not yet by a screen.

---

## The asymmetry worth acting on

| Rail | Failure points Noor can hit | Who fixes it |
|---|---|---|
| **Online link** | Manual card entry (PAY1) · silence after paying (PAY2) · unexplained OTP (PAY3) · dead link (PAY4) | Nobody. Noor is alone with a hosted page |
| **Terminal** | Card declined (PAY5) | The person holding the machine |

Cami's case for the terminal is currently written as a merchant-economics argument: cheaper rail (~1.9% vs ~2.5%), matches reception habit, carries the majority of volume, and is the only route to the ~34% capture that replaces Fresha's revenue on SOTA. **This table is the second argument.** The rail that is cheaper for the merchant is also the one where the payer cannot get stranded. Both point the same way, which is unusual and worth saying out loud in the sequencing debate.

---

## What this changes

### 1. INV-C4 is strained, not held

INV-C4 says the customer never has to leave the WhatsApp thread to book, pay, or rebook. Today Noor leaves the thread for a **provider-branded hosted page** that looks like neither Cami nor the business (resolved 2026-08-06: NeoPay-hosted is acceptable for the NeoPay rail).

That is a real exception to a 🔒 permanent invariant, and it is currently silent. Either INV-C4 is scoped to mean "no app download and no second onboarding", or the exception needs a decision record. A permanent invariant with an undocumented exception is how the invariant stops being load-bearing.

### 2. Payer conversion is a revenue metric, not a UX nicety

On a processing-margin model, Noor's friction costs a transaction rather than an hour. Nothing is instrumented: there is no drop-off number for opened → method chosen → OTP → confirmed. Until that exists, PAY1 through PAY4 are ranked by argument.

**Cheapest next step:** instrument the hosted-page funnel by step. It converts EC-26 from a belief into a number and settles the Apple Pay sequencing question with data.

### 3. Every failure screen protects the merchant, not Cami

Noor does not know Cami exists. An expired link, a slow webhook, and a surprise OTP all read as *this business is disorganized*. Copy on those screens is reputation management on the merchant's behalf, which is the reason it belongs in the PRD rather than in a polish pass.

---

## Against `personas.md`

**Confirms:** the four-versus-one failure count, the ninety-second window, the blame-lands-on-the-business dynamic, and the observation that a person at the counter fixes anything instantly.

**Adds, two jobs the persona page does not carry:** `JOB-CLI-BOOK2` (hold window versus link window) and `JOB-CLI-PAY4` (the dead link as a trust event rather than an error state).

**Contradicts nothing.** Which is itself a warning: this document and the persona page draw on the same two sources, so agreement between them is not corroboration.

---

## Evidence and confidence

- ✅ **Validated:** the mechanics, states, and failure modes exist as described (03 §8, §9; EC-20, EC-23, EC-24, EC-26).
- ✅ **Validated as intent:** ADR-018 routes money problems to the merchant with a required call button.
- ⚠️ **Inferred:** every job derived from a documented failure mode. The failure is real, the felt experience is reasoned.
- ⚠️ **Assumed:** all Imp and Sat scores. No payer has been asked.
- 🔴 **Unknown:** actual drop-off by step. Nothing is instrumented.
- 🔴 **Unknown:** whether manual card entry actually kills conversion in the UAE, which is the belief gating launch.

---

## Collection backlog

| Item | Owner | Status |
|---|---|---|
| Watch 5 real payments, 3 online link and 2 terminal, including one OTP and one no-fast-click case | Michelle / Maaz at a pilot site | 🔴 |
| Instrument the hosted page for drop-off by step | Engineering, on request from Product | 🔴 |
| Ask 3 payers what they thought the deposit was holding (BOOK1) | Michelle at a pilot site | 🔴 |
| Confirm what a payer sees when a link expires today (EC-20 screen is NeoPay-owned and unproven) | Michelle | 🔴 |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Minted `JOB-CLI-BOOK1-2`, `PAY1-5`, `AFTER1-2`. Named the four-versus-one rail asymmetry as a payer-side argument for the terminal, and flagged INV-C4's undocumented hosted-page exception |
