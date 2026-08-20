# BRD: CamiPay Capture (payment link + POS terminal)

**One question:** What must the business be able to do to take a customer's money on card rails and keep its margin on it?
**Serves objective:** **OBJ-P5** complete the money path. Which gates OBJ-B3 (reforecast economics) and, through it, every other objective. Revenue is processing margin, and margin on volume we never capture does not exist.
**Unlocks:** Tier 3 economics today, Tier 2 at all. SOTA is waitlisted pending "key features"; both rails are the leading candidates.
**Companion PRDs:** [CamiPay Online](../prd/prd-camipay-online-2026-08-16.md) · [CamiPay POS Terminal](../prd/prd-camipay-terminal-2026-08-16.md). Problem, evidence, risks, dependencies, and sign-off live there.
**Law:** INV-P1, INV-P2, INV-P3 (terminal Phase 1 is a declared exception), INV-P5, INV-P6, INV-P11, INV-P12, INV-P13, INV-B2, INV-B5, INV-M3, INV-M4, INV-08, INV-A1 · ADR-002, ADR-003, ADR-012, ADR-014, ADR-015, ADR-016, ADR-018, ADR-022 · 06 §3, §8
**Law repo:** [cami-feature-docs/business-rules](../../../cami-feature-docs/business-rules/) · use case IDs in [feature-mappings/get-paid/camipay.md](../../../cami-feature-docs/feature-mappings/get-paid/camipay.md)
**Jobs:** [jtbd-payer](../../discovery/outputs/jtbd-payer-2026-08-16.md) `JOB-CLI-*` · [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) `JOB-RCP-PAY*` · [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md) `JOB-OWN-PAY2`
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

> ⚠️ **This BRD covers two register initiatives, #1 CamiPay Online and #2 CamiPay POS Terminal.** They are merged because they share one provider abstraction, one law set, one commercial record, and one objective, and because seven of the thirteen requirements below apply to both rails. Splitting them duplicates the law block and hides the requirements that only make sense across rails (R11 take collection, R12 rail steering). **Two PRDs, because they ship separately.** Split this BRD if the rails ever get different owners.

---

## TL;DR

1. **13 requirements. 9 Must, 3 Should, 1 Later.** 11 trace to existing `CP-*` IDs, which makes this the best-traced initiative in the workspace.
2. **Hardest: R11, collecting Cami's take on the terminal rail.** Terminal money goes NeoPay to merchant directly. Cami never holds it, so there is no point at which margin can be deducted. The revenue model has no mechanism on the rail carrying the majority of volume.
3. **Two pilot blockers, both known, both unfixed:** R8 Apple Pay and fast-click (CP-D1 **Missing**, EC-26) and R10 gateway refunds for card captures (ADR-014, reversed from deferred to blocking on 2026-08-06).
4. **Blocked until this ships:** Tier 2 revenue at a level that displaces Fresha. Matching Fresha's extraction on SOTA needs roughly **34% of GMV captured**. Deposits alone run about 5.4%. That gap is the terminal.

⚠️ **Evidence:** requirements derived from shipped code verified on `feature/camipay` (11 Aug), the Jul 20 and Jul 23 CamiPay meetings, and Fresha's live SOTA account. **No customer has been observed paying, and no merchant has been observed taking a terminal payment.** Sufficient to scope. Not sufficient to claim any of it converts.

---

## Why it is worth doing

| | |
|---|---|
| **Unlocks** | The only revenue line the company has. On a free OS (INV-P4), capture is the business |
| **Costs us if we do not** | Every operator stays on their own bank machine for balances, as SOTA does today. Cami captures deposits, roughly 5.4% of GMV, and calls it a payments company |
| **Trigger to start** | Started. Online is pre-QA, terminal is in architecture pending NeoPay decisions |
| **Trigger to stop** | None credible. Stopping this is stopping the company. The real decision is rail order, not whether |

---

## Words that matter

| Say this | Means |
|---|---|
| **Rail** | One route money travels: payment link, or terminal. Each picks its own provider (INV-P3) |
| **Capture** | Payment confirmed and entitlements commit (INV-07). Not "charge", not "process" |
| **Captured volume** | The share of an operator's GMV that ran on Cami rails. The number the model is priced on |
| **Trust device report** | Terminal Phase 1: the provider charges on its own screens, Cami's backend trusts the app's paid report rather than confirming server-side |
| **Take** | Cami's processing margin on a capture. 1.8 to 3% card, 3 to 3.5% online |
| **Fast-click** | One-tap wallet methods on the hosted page: Apple Pay, Google Pay, Mastercard |

`gateway`, `MPGS`, and `retrieveOrder` are provider words. They never reach a user.

---

## Owns / not this

| This initiative owns | Point elsewhere |
|---|---|
| Generating, reusing, cancelling, and expiring a payment link | **Bill and tip maths before the link** → checkout, and 06 Composition Order |
| Terminal pairing, sign-in, pending sales, charge, and settle | **Deposit policy, who owes what and when** → payment policy, INV-P5 |
| Gateway confirm and card refunds on both rails | **Where the money lands afterward** → [merchant settlement BRD](./merchant-settlement-brd.md) |
| Which rails a Partner may use, and the rate stored on each transaction | **Setting the rate per Partner** → [Cami-HQ rate card PRD](../prd/prd-camihq-rate-card-2026-08-16.md) |
| Payer-facing failure states on the hosted page | **Cash and off-rail card** → checkout. Recorded to the ledger, no gateway |

---

## Requirements

### Map of groups

| Group | What it covers | Requirements |
|---|---|---|
| **A · Ask for the money** | A correct, single, unambiguous request reaches the payer | R1, R2, R3 |
| **B · Take it in the shop** | A device in the shop can charge the right sale | R4, R5, R6 |
| **C · Confirm and reverse it** | The money is provably settled, and can be given back | R7, R8, R9, R10 |
| **D · Keep the margin** | Cami earns on what it moves, on both rails | R11, R12, R13 |

Priority: **Must** the initiative fails without it · **Should** ships if Musts land early · **Later** deferred with a trigger.
Traced: ✅ IDs exist · ⚠️ partial, gaps named · 🔴 prose only.

### A · Ask for the money

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R1 | A sale produces **exactly one active payment link**, immutable, reused by every reminder, and invalidated on any change to amount, description, or service (INV-P11, ADR-016) | Must | Reception clicks send five times and the customer receives one link with one amount. Changing the amount kills the old link and issues a new one | CP-A1, CP-A2, CP-A5 | ⚠️ **CP-A5 Broken.** Fingerprint covers amount and currency only, so a description or service change does not regenerate |
| R2 | A deposit is **captured automatically at booking**, per service percentage, with an authorized waiver path, and never as a step reception must remember (INV-B2, INV-B3) | Must | A booking taken during a walk-in interruption still has its deposit request out, with no human action | CP-B4 | ⚠️ Deposit-as-link-purpose exists. No ID for automatic capture at booking, or for the waiver |
| R3 | Cancelling a link **invalidates the link only**, keeps the draft sale, unlocks the cart, and resumes checkout at the Tip step. Anyone who can take a sale may cancel, and the actor is recorded (INV-08, PRO-909) | Must | A wrong amount is corrected by cancel and rebuild in under a minute, and the log names who cancelled | CP-A4 | ⚠️ **Partial.** Cancel works; the front end resumes on Payment rather than Tip |

**R2 carries the deposit-versus-product boundary (INV-B5).** Deposits apply to appointments only. A standalone product or gift card sale takes the full amount, and a mixed cart charges the remaining sum with no second deposit link.

### B · Take it in the shop

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R4 | A terminal is bound to one business by an **immutable pairing code**, and opened by **that device's own regenerable sign-in PIN**, holding a 24 hour revocable session (ADR-022) | Must | Regenerating one branch device's PIN signs out that device and no other. Reception does not sign in daily | CP-B1 | ⚠️ **Partial.** Backend per-device passes; the front-end registry is a mock and unwired |
| R5 | A terminal reaches **only the sales routed to it**, from a pending-sales list, and charging one updates that sale | Must | Staff pick a client from a short list on the device rather than hunting a sale number | CP-B2 | ⚠️ **Partial.** Backend pending list and report pass; no intent tile in the business app |
| R6 | The terminal is the **default rail for a balance**, and the link stays available as the alternative (ADR-014) | Should | The method grid shows terminal first, and reception can still send a link without leaving the screen | CP-B3 | ⚠️ **Partial.** Link is offered; terminal is absent from the method grid |

**R6 is a pricing requirement wearing a UI costume.** The terminal is roughly 1.9% against roughly 2.5% online. Steering the balance to the cheaper rail is worth more to the merchant than to Cami, which is the honest version of the argument and the one that sells.

### C · Confirm and reverse it

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R7 | A link payment is **confirmed to the payer within seconds**, not minutes, and the sale settles on that confirmation | Must | The payer sees a paid state before they put the phone down. Measured, with a stated budget | CP-C1 | ⚠️ Settle is coded. **EC-23 seconds is unproven**, 1 to 2 minutes observed in test |
| R8 | The payer can complete the payment **without typing a card number**, using the wallet already on their phone | Must | Apple Pay appears on the hosted page for a UAE iPhone on a live account | CP-D1 | 🔴 **Missing.** EC-26. Needs a Cami Apple merchant account, domain registration, and a certificate on the hosted page |
| R9 | A link that can no longer be paid shows **why, and what to do next**, never a blank page (EC-20) | Must | An expired link opens on a Cami-recognizable screen with a way to ask for a new one | CP-A3 | ⚠️ 12 hour TTL exists. The screen is NeoPay-owned and unproven |
| R10 | Any CamiPay card capture can be **refunded through the gateway**, on both rails, with the money returning to the tender it came from (INV-05, ADR-014) | Must | A terminal capture is refunded from the business app and the customer's card is credited | CP-C3 | ⚠️ **Partial and a pilot blocker.** Link gateway refund exists; terminal and live are unproven |

**R7, R8, and R9 are the three ways an online payment fails for a payer who has nobody to ask.** They are the whole of `JOB-CLI-PAY1`, `PAY2`, and `PAY4`. The terminal has one failure point and a human standing next to it, which is a payer-conversion argument for the terminal that sits alongside the cost argument.

**R10 was deferred, then reversed to blocking on 2026-08-06.** Do not re-defer it without superseding that ruling.

### D · Keep the margin

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R11 | Cami's take is **collectible on both rails**, including the terminal, where the money never passes through Cami | Must | Cami can state, per Partner per month, what it earned on terminal volume, and collect it | — | 🔴 **No mechanism, no IDs.** The single largest hole in the revenue model |
| R12 | The rate applied to a transaction is **the rate stored on that transaction**, never recomputed from the current card, and rails are enabled per Partner | Must | A renegotiation changes tomorrow's take and not last month's invoice | HQ-E1, HQ-E2 (minted in the rate card PRD) | ⚠️ Shipped as UI on mock data (PRO-737). No backend |
| R13 | A second provider can be added **per rail** without touching flows, so link and terminal may run different providers (INV-P3) | Later | Noon is added on the online rail with no change to the terminal path | — | 🔴 Prose only. **Trigger:** the Noon integration, roughly 3 to 4 weeks out |

**R11 is the requirement most likely to be discovered late.** Every other row here is about moving a customer's money. This one is about Cami getting paid, and on the terminal rail there is currently no point in the flow where that can happen. Online settles through Crescent, where a deduction is at least possible. Terminal settles NeoPay to merchant directly.

---

## Out of scope

Full list in each PRD's Non-Goals. BRD-level boundary:

| Not in this initiative | Why | Revisit when |
|---|---|---|
| Where the captured money goes afterward | Settlement is its own initiative with its own BRD and PRD | Never merges. They meet at R11 only |
| Card-on-file, recurring capture, automatic no-show fees | No card is stored (INV-P6), and Cami never auto-charges (INV-P13, ADR-018) | A card-storing rail is added |
| Authorize-and-capture (capture-card-details policy) | Cut for MVP (ADR-015) | Same trigger as above |
| Cash and off-rail card | Recorded to the ledger by checkout, no gateway. CamiPay owns rails, not all tenders | Never |
| Offline or storefront POS for pure walk-in retail | Phase 2 | Post-v1 |
| Setting the take rate per Partner | Rate card, its own PRD | Now, in parallel |

---

## Success criteria

Targets and baselines live in the PRDs. The BRD holds the pass/fail gates:

| Gate | Fails if |
|---|---|
| A payer completes online payment without typing a card number | Manual entry is the only path on any live account |
| A payer knows the payment worked before leaving the screen | Confirmation takes longer than the stated seconds budget |
| A merchant can give money back on either rail | Any CamiPay capture is unrefundable from the product |
| One sale, one link, one amount | Two live links, or a link paid at a stale amount, ever occurs |
| One device is revocable alone | Signing out a lost terminal signs out any other device |
| Cami earns on what it moves | Any rail carries volume Cami cannot bill for |

---

## Open decisions

| Decision | Blocks which requirement | Owner | Where it resolves |
|---|---|---|---|
| **How does Cami collect its take on terminal volume it never holds?** | R11, and the revenue model on the majority rail | Maaz + Faisal | New ADR. Nothing currently holds it |
| Phase 1 trusts the device report. When does server-side confirm ship, and what is the pilot exposure until then? | R7, R10 | Faisal | 03 §9. Phase 2 is a direction, not a ticket |
| Terminal PIN readability, session attribution (device or person), lockout trigger, 24h fixed or configurable | R4 | Michelle | ADR-022 open notes. Not blocking |
| Is the hosted page provider-branded permanently, and does that need an INV-C4 exception recorded? | R8, R9 | Michelle | New ADR. Currently a silent exception to a 🔒 invariant |
| Rail order: does the terminal move ahead of online polish, given it carries the volume that displaces Fresha? | Sequencing of B against C | Maaz + Michelle | goals.md, and the SOTA waitlist question |

---

## Evidence and confidence

- ✅ **Validated (engineering, `feature/camipay`, 11 Aug):** CP-A1 and A2 Works · A3, A4, B1, B2, B3, C1, C2, C3 Partial · A5 Broken · B4 Works · D1 Missing. This BRD's traced column is engineering-verified, not asserted.
- ✅ **Validated (Fresha, live SOTA account, 16 Aug):** SOTA captures deposits only, runs balances on its own bank machine, and Fresha extracts roughly 1.3% of GMV all in.
- ⚠️ **Inferred:** the roughly 34% capture figure needed to match that extraction, at a 2.5% blend and the ~3x-the-floor GMV basis closed on 2026-08-16.
- ⚠️ **Assumed:** that fast-click materially lifts conversion in the UAE (EC-26). It is gating launch and it is unmeasured.
- 🔴 **Unknown:** actual payer drop-off by step on the hosted page. Nothing is instrumented.
- 🔴 **Unknown:** whether NeoPay will approve the terminal app, and on what timeline. External, and the whole of group B depends on it.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Merged register initiatives #1 and #2 into one requirements register, 13 R-numbers across 4 groups, 11 traced to engineering-verified `CP-*` IDs. **Finding: R11, Cami's take on terminal volume, has no mechanism and no owner, on the rail carrying the majority of volume** |
