# PRD: CamiPay Online (payment link)

**ID:** PRD-CAMIPAY-ONLINE · **Owner:** Michelle You · **Date:** 2026-08-16 · **Status:** ⏳ Draft
**Serves objective:** OBJ-P5 (complete the money path) → OBJ-B3
**Law cited:** INV-P1, INV-P2, INV-P3, INV-P5, INV-P6, INV-P11, INV-P12, INV-P13, INV-B2, INV-B5, INV-M3, INV-M4, INV-08, INV-C4 · ADR-002, ADR-012, ADR-014, ADR-015, ADR-016, ADR-018 · 06 §3, §8
**Use cases:** cites `CP-A1` to `CP-A5`, `CP-C1`, `CP-C3`, `CP-D1` in [get-paid/camipay.md](../../../cami-feature-docs/feature-mappings/get-paid/camipay.md). **Mints `CP-A6`, `CP-D2`,** which that guide inherits.
**Related:** [CamiPay capture BRD](../brd/camipay-capture-brd.md) (R1, R2, R3, R7, R8, R9, R10) · [jtbd-payer](../../discovery/outputs/jtbd-payer-2026-08-16.md) · [journey-map-payer](../../discovery/outputs/journey-map-payer-2026-08-16.md) · `docs/specs/PRO-909-payment-link-locked-cart.md`

---

## TL;DR

1. **Close the four ways an online payment fails for a payer with nobody to ask:** manual card entry, silence after paying, a dead link, and a surprise bank code. Two of the four are pilot blockers today.
2. **Why now:** online is the go-live rail while the terminal waits on NeoPay. Every deposit taken between now and the terminal shipping runs through this path.
3. **What could kill it:** Apple Pay enablement is not a build task. It needs a Cami Apple merchant account, domain registration, and a certificate on the provider's hosted page. That is procurement, and it is on the critical path.

⚠️ **Evidence:** build state is engineering-verified on `feature/camipay` (11 Aug). Payer behavior is entirely inferred. **No customer has been observed paying, and nothing is instrumented.**

---

## Context

| What changed | When | So what |
|---|---|---|
| Online links built and in QA, terminal still in architecture | 31 Jul 2026 | Online is the only live capture rail. It carries 100% of captured volume until the terminal ships |
| Gateway refunds reversed from deferred to **pilot blocker** | 6 Aug 2026 | A rail that takes money and cannot give it back is not shippable to a pilot |
| SOTA's Fresha account read on a live login | 16 Aug 2026 | SOTA captures deposits only, roughly 5.4% of GMV. Online alone cannot displace Fresha, which sets this PRD's ceiling honestly |
| CP-A5 verified **Broken** | 11 Aug 2026 | The link fingerprint covers amount and currency only, so a service or description change leaves a stale link live. This is ADR-016 not being met |

---

## Problem

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Noor** (payer) | `JOB-CLI-PAY1` pay in one tap with the method already on the phone | Every online payment | A typed card number on a phone. The belief in EC-26 is that most people abandon here |
| **Noor** | `JOB-CLI-PAY2` know within seconds that it worked | Every online payment | Webhook took 1 to 2 minutes in test. Silence invites a second payment or a message to the business |
| **Noor** | `JOB-CLI-PAY4` be told what to do when a link no longer works | Every link opened after 12h | A blank page reads as the business being broken, not the link expiring |
| **Layla** | `JOB-RCP-PAY2` deposit taken without her remembering | Every booking | A walk-in interrupts, the link is never sent, the slot no-shows on Thursday (EC-13) |
| **Omar** | `JOB-OWN-PAY2` fee legibility | Continuous | The take rate lives in a contract, not in the product. On a free OS the fee is the commercial relationship |

---

## Jobs served

| Job ID | Persona | Job (short) | Opp | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-CLI-PAY1` | Noor | One tap, method already on the phone | 17 | [jtbd-payer](../../discovery/outputs/jtbd-payer-2026-08-16.md) | Fast-click on the hosted page (`CP-D1`) |
| `JOB-CLI-PAY2` | Noor | Know straight away it worked | 16 | jtbd-payer | A stated confirmation budget in seconds (`CP-C1`) |
| `JOB-CLI-PAY4` | Noor | Told what to do when the link is dead | 14 | jtbd-payer | An expired screen with a regenerate path (`CP-A3`) |
| `JOB-CLI-PAY3` | Noor | Not blindsided by a bank code | 11 | jtbd-payer | Pre-warning copy before the OTP step (`CP-D2`, minted) |
| `JOB-CLI-BOOK1` | Noor | Understand what the deposit holds | 12 | jtbd-payer | One line in-thread on what it holds and cancellation terms (`CP-A6`, minted) |
| `JOB-RCP-PAY2` | Layla | Deposit without remembering | 15 | [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) | Automatic capture at booking (`CP-A6`, INV-B2) |

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| One link per sale, reused on reminders, cart locked on generate | ✅ Validated | `CP-A1`, `CP-A2` Works on `feature/camipay`, 11 Aug |
| A config change does not always invalidate the old link | ✅ Validated | `CP-A5` **Broken**. Fingerprint is amount plus currency only |
| Cancel keeps the draft sale and unlocks the cart, but resumes on Payment not Tip | ✅ Validated | `CP-A4` Partial |
| Webhook confirmation took 1 to 2 minutes in test | ✅ Validated | Jul 23 CamiPay meeting, EC-23 |
| Apple Pay is absent, and enablement is a procurement chain, not code | ✅ Validated | `CP-D1` **Missing**, EC-26 |
| Link gateway refund exists; terminal and live refunds unproven | ✅ Validated | `CP-C3` Partial |
| Manual card entry kills adoption | ⚠️ **Assumed, and load-bearing** | EC-26. Gating launch, measured nowhere |
| The OTP surprises payers and reads as a failure | ⚠️ Inferred | EC-24. Bank behavior is real, the payer reaction is reasoned |
| The expired-link screen is NeoPay-owned and may be blank | ⚠️ Inferred | `CP-A3` Partial, screen unproven |
| Payer drop-off by step | 🔴 Unknown | Nothing instrumented |

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| Links are immutable and single-active. Create, delete, expire. Never update | Jul 20 meeting | ADR-016, INV-P11 | NeoPay has no update-in-place. Editing spawns duplicate or stale-amount links |
| Link lifetime is 12 hours, or until paid or cancelled | Jul 20 meeting | INV-P12 | Matches Fresha. Tunable, not open |
| Cancel invalidates the link only, keeps the draft sale, resumes at Tip. Anyone who can take a sale may cancel, and the actor is recorded | PRO-909 | 03 §8, EC-25 | Settled UI and permission shape. The real permission gate is parked to PRO-404 |
| The payer pays on the **provider's hosted page**. NeoPay-hosted is acceptable for this rail | 6 Aug 2026 | 03 §8 | A Cami-hosted `/[slug]/pay/[token]` page is a design alternative, not required |
| Cami never auto-charges no-show or cancellation fees | Jul 23 meeting | ADR-018, INV-P13 | Keeps Cami out of disputes. The screen shows the policy plus a Call/WhatsApp button |
| No authorize-and-capture, no card-on-file | Jul 23 meeting | ADR-015, INV-P6 | No card is stored on the current rail |
| Deposits apply to appointments only. Mixed carts charge the remaining sum | Jul 23 meeting | INV-B5, EC-22 | Prevents two deposit links in one cart |
| Reports CSV-first is a separate initiative | ADR-024 | — | This PRD emits events, it does not build reports |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-P1, INV-P2 | Every in-platform appointment checkout runs through CamiPay, and Cami owns the commercial record |
| INV-P11, INV-P12 | Link immutability and lifetime are the whole of the link state machine |
| INV-P6, INV-P13 | No stored card, therefore no auto-fee and no recapture |
| INV-B2, INV-B5 | Deposit is automatic at booking, and appointment-scoped only |
| INV-M3, INV-M4, 06 §3 | The tip is invoice-scoped and must be persisted before any payment request. `EC-38` is exactly this defect |
| INV-08 | Cancel records the actor |
| 03 §8 | The link lifecycle is the contract this PRD builds against |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| INV-C4 | The customer never has to leave the WhatsApp thread to book, pay, or rebook | Payers **do** leave the thread for a provider-branded hosted page. This is a live, undocumented exception to a 🔒 invariant | 🔴 **No ADR.** Either scope INV-C4 to mean no app download and no second onboarding, or record the exception |
| ADR-016 | A config change invalidates and regenerates the link | No change to the rule. The **implementation** does not meet it (`CP-A5`) | Not an ADR question. A defect |

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Online deposit capture rate, links sent to links paid | 🔴 unmeasured | Set after two weeks of instrumented baseline | 4 weeks post-instrumentation |
| Payer-reported payment failures routed to the merchant | 🔴 unmeasured | Trending down | Ongoing |
| Captured volume on the online rail per live account | ~5.4% of GMV (SOTA proxy) | Held, while the terminal takes the balance share | Terminal go-live |

🔴 **Every lagging target here has no baseline, because nothing is instrumented.** Setting a number now would be inventing one. The first leading indicator below exists to fix that.

**Leading** (pre-launch signals)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| Hosted-page funnel by step: opened → method chosen → OTP → confirmed | Instrument the page before the fast-click work starts | Data exists at all. That alone settles EC-26 |
| Webhook confirmation latency, p95 | Measure in staging against a real NeoPay sandbox | Under the agreed seconds budget, whatever it is set to |
| Apple Pay renders on a UAE iPhone | One manual test on a live account | It renders. Binary |
| Expired link renders a readable screen | Open a 13-hour-old link | Not blank. Binary |

---

## Proposed solution

### How it works

- Reception or the online booker creates a sale. Generating a link creates a **draft sale** and locks the cart to amount and method (03 §8).
- The link is single-active. Repeat clicks and reminders return the same URL. Any change to amount, description, or service kills the old link and issues a new one.
- The payer opens the link from the WhatsApp thread and lands on the provider's hosted page, with fast-click methods first and manual card entry as the fallback.
- The bank may interrupt with an OTP. The payer is warned before that step, not after.
- The provider webhook confirms, the sale settles, and the receipt goes back to the thread.
- If the link expires unpaid, the sale stays in draft and the payer sees an expired screen with a way to ask for a new link.

### User stories (the feature-level use cases)

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `CP-A1` | `JOB-RCP-PAY2` | Reception | to send a payment link | the client can pay from the thread | One link, draft sale created, cart locked | Link `Draft` → `Active` (03 §8) |
| `CP-A2` | `JOB-RCP-PAY2` | Reception | to resend a reminder | I do not create a second link | The same URL is returned | Link stays `Active` |
| `CP-A3` | `JOB-CLI-PAY4` | Payer | to open a link after it expired | I know what to do next | A readable expired screen with a regenerate prompt, never blank | Link `Expired`, sale stays draft |
| `CP-A4` | `JOB-RCP-PAY2` | Reception | to fix a wrong amount after sending | the client is not charged the wrong figure | Cancel invalidates the link, keeps the draft, and checkout resumes at the **Tip** step | Link `Cancelled` → `DraftSale` |
| `CP-A5` | `JOB-RCP-PAY2` | Reception | any change to the sale to kill the old link | the client cannot pay a stale amount | A **service or description** change regenerates, not only amount and currency | Old link `Cancelled`, new link `Active` |
| **`CP-A6`** *(minted)* | `JOB-RCP-PAY2`, `JOB-CLI-BOOK1` | Reception | the deposit request to go out automatically at booking | an interruption cannot cost me the deposit | The booking is created and the request is out with no separate human step, carrying one line on what it holds | Booking `Booked`, deposit `Required` → `Captured` |
| `CP-C1` | `JOB-CLI-PAY2` | Payer | to know immediately the payment worked | I am not left wondering whether to pay again | Confirmed within the stated seconds budget, and the sale settles on it | Sale `Sale` (03 §2) |
| `CP-C3` | `JOB-CLI-AFTER2` | Reception | to refund a card capture | the client gets their money back | The refund goes through the gateway to the original tender | Refund document issued (03 §10) |
| `CP-D1` | `JOB-CLI-PAY1` | Payer | to pay with the wallet on my phone | I do not have to find my card | Apple Pay renders and completes on a UAE iPhone, live account | Sale `Sale` |
| **`CP-D2`** *(minted)* | `JOB-CLI-PAY3` | Payer | to be told a bank code may be coming | the interruption does not read as a failure | Copy appears before the OTP step, not after it | Unchanged. A copy requirement |

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Checkout drawer | Link active | Full-panel `PaymentLinkLockScreen`, not a dismissable dialog. No expiry countdown. Only action is Cancel | PRO-909, INV-P11 |
| Hosted page | Methods | Fast-click first, manual entry as fallback. Blackberry Pay removed | EC-26 |
| Hosted page | OTP pending | Bank-branded, preceded by Cami-authored warning copy | EC-24 |
| Hosted page | Expired | Readable expired state with a regenerate prompt. **Never blank** | EC-20 |
| Hosted page | Paid | Immediate confirmation, then the receipt in the thread | EC-23, INV-C4 |
| Outside the refundable window | Policy note | Policy text plus a Call and WhatsApp button to the business | ADR-018 |

---

## Money composition

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Line price | Invoice | 1 | INV-M1 |
| Line and cart discount | Invoice | 2, 4, 5 | INV-M7 |
| **Tip** | **Invoice** | 8 | **INV-M3.** Must be persisted before the payment request. `EC-38` is the live defect |
| VAT | Derived | 6 | INV-M2, `gross × 5 / 105`, rounded once per line |
| Amount due | Derived | 9 | INV-M3, `taxable_gross + tip` |
| Deposit | Payment | 10 | INV-P10. Deferred revenue, not recognized. Tax invoice at render |
| Card capture | Payment | 10 | INV-M4, `Σ tender = amount_due` at settle |

**The cart locks on link generation, which makes the Scope Rule non-negotiable here.** If the tip is not on the invoice before the link is created, the link carries the wrong amount and there is no way to edit it (INV-P11). Cancel and rebuild is the only path, which is `CP-A4`.

---

## Permissions and roles

| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|
| Send a payment link | Block | Allow | Allow | Allow | No |
| Cancel an active link | Block | Allow | Allow | Allow | **Yes.** Records the actor. Real gate parked to PRO-404 |
| Refund a card capture | Block | ? | Allow | Allow | **Yes** |
| Waive a deposit | Block | ? | ? | Allow | **Yes.** EC-3, unowned |
| Change payment settings | Block | Block | Block | Allow | Yes |

🔴 **Two "?" rows are unanswered decisions, not formatting.** Refund authority and waiver authority both let a person move money out, and neither has a written rule.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| EC-20 | Expired link opens blank | ✅ `CP-A3`, expired screen required | — |
| EC-21 | Deposit link unpaid, customer pays in store | ✅ Expire the old link, take the full amount | — |
| EC-22 | Mixed cart, appointment plus product plus gift card | ✅ No second deposit link. Cart charges the remaining sum (INV-B5) | — |
| EC-23 | Webhook confirmation latency | ⚠️ Budget stated, server choice open | Engineering |
| EC-24 | OTP surprise | ✅ `CP-D2` pre-warning copy, plus reception training | Thresholds per bank remain unknown |
| EC-25 | Mistake after the link is sent | ✅ `CP-A4`, cancel and rebuild | Front-end resume step is a defect |
| EC-26 | Apple Pay and fast-click missing | ✅ `CP-D1`, launch blocker | Procurement chain, see Dependencies |
| EC-38 | Tip not persisted before capture | ✅ Named as the Scope Rule requirement | The `/payments` fix is checkout's |
| EC-43 | Retry after disconnect mid-capture | ⚠️ Idempotency key required (06 §8) | Terminal PRD carries the harder case |
| EC-13 | Forgotten deposit link under interruption | ✅ `CP-A6`, automatic capture | — |

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `payment_link.created / sent / cancelled / expired` | Per link | Payments log, and the funnel | New |
| `payment.captured` with rail, provider, and **the rate stored on the transaction** | Per capture | Payments log, HQ Partner Dashboard | Existing capture, **new rate field** |
| `taxable_gross` and `amount_due` as separate fields | Per sale | VAT summary. `RP-B2` is Broken without it | New |
| Deposit flagged as liability until render | Per deposit | Deposit versus earned revenue, `RP-B1` | New |
| Hosted-page funnel step events | Per session | Not a merchant report. Product instrumentation | New |
| `refund.issued` with tender and reason | Per refund | Refund and void log | New |

**The rate stored on the transaction is a hard requirement, not a nice-to-have.** A renegotiation must not re-price history, which is the rule PRO-737 exists to enforce.

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Terminal capture | Different rail, different provider decisions | [Terminal PRD](./prd-camipay-terminal-2026-08-16.md) |
| Where the money settles afterward | Separate initiative | [Merchant settlement PRD](./prd-merchant-settlement-2026-08-16.md) |
| Card-on-file, recurring, auto no-show fees | INV-P6, INV-P13, ADR-015, ADR-018 | Revisit on a card-storing rail |
| A Cami-hosted checkout page | Provider-hosted is acceptable for the NeoPay rail | Design alternative, revisit on a provider swap |
| Setting the take rate per Partner | Rate card | [Rate card PRD](./prd-camihq-rate-card-2026-08-16.md) |
| Cash and off-rail card | No gateway involved | Checkout |
| Building the reports themselves | This PRD emits events | [Reporting PRD](./prd-reporting-csv-first-2026-08-16.md) |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| Checkout tip persistence (Scope Rule, `EC-38`) | 🔴 Live defect | `CP-A6` and every link with a tip on it |
| Payment policy: deposit percentages and the waiver | ⚠️ Partial | `CP-A6` |
| Reporting fact tables | 🔴 Architecture unfinalized | The funnel instrumentation lands somewhere temporary otherwise |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| OS Team | Link lifecycle fix (`CP-A5`), cancel resume step (`CP-A4`) | Faisal |
| Design | Expired screen, OTP pre-warning copy, deposit explainer line | Anum |
| Commercial | Apple merchant account and domain registration | Maaz |
| Security | Marlon's review, already in scope for the terminal, extends to the hosted page | Marlon |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| **Apple** | Merchant account, domain registration, certificate | 🔴 Unknown, not started as a tracked item | None. `CP-D1` cannot ship without it |
| **NeoPay** | Fast-click enablement in test mode, expired-screen behavior, webhook latency in production | 🔴 Unknown | Instrument and measure what we get |
| **Noon** | Next provider, roughly 3 to 4 weeks | ~mid-Sep | Stay on NeoPay. **Do not change the online path meanwhile** |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | Instrument the hosted-page funnel | Produces the baseline every target below needs |
| 2 | Start the Apple merchant account chain | Longest external lead time. Start it before the code work |
| 3 | Fix `CP-A5` link fingerprint | ADR-016 is not met until this lands |
| 4 | Gateway refunds proven on a live account | **Pilot blocker.** Nothing ships to a pilot without it |
| 5 | Expired screen and OTP copy | Cheap, and they close two payer failure modes |
| 6 | Fast-click live | Depends entirely on step 2 |

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Live links outstanding at deploy | Honored to their 12h expiry under the old fingerprint rule. No retroactive invalidation | Nobody needs to. Invisible |
| Pilot operators on deposits only | No behavior change until fast-click lands, then their payers see new methods | Customer Success, one message |
| Sales in draft from cancelled links | Unaffected. They resume from Sales > Drafts | — |
| A provider swap later (Noon) | Per-rail abstraction means the terminal path is untouched (INV-P3) | Not in this release |

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| Fast-click does not materially lift conversion, and the launch blocker was wrong | **V** | Medium | Weeks spent on procurement for a non-problem, and the terminal slipped behind it | Instrument first. The funnel settles it in two weeks and costs almost nothing | Michelle |
| Apple merchant account takes months | **B** | Medium | `CP-D1` blocks launch indefinitely | Start the chain now, in parallel with code. Decide a ship-without-it threshold | Maaz |
| Webhook latency stays in minutes in production | **F** | Medium | `JOB-CLI-PAY2` fails, and payers double-pay or message the business | Measure p95 in staging against a real sandbox before go-live | Faisal |
| Payers blame the merchant for platform failures | **B** | High | Pilot operators lose trust in Cami over a NeoPay screen | Every failure screen is written to protect the merchant's relationship, not Cami's | Anum |
| Provider-hosted page silently breaks INV-C4 | **B** | High, already happening | A 🔒 invariant with an undocumented exception stops being load-bearing | Write the ADR. Either scope INV-C4 or record the exception | Michelle |
| Reception cannot explain the OTP | **U** | High | The payer abandons at the bank step | Reception training plus `CP-D2` copy. Thresholds still unknown per bank | Customer Success |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | What is the confirmation latency budget in seconds, and which server meets it? | `CP-C1`, and the go-live gate | Faisal | Before QA sign-off |
| 2 | Has the Apple merchant account chain been started, and by whom? | `CP-D1`, the longest lead time on the path | Maaz | This week |
| 3 | Does INV-C4 get scoped, or does the hosted page get a recorded exception? | Nothing technically. It blocks the law staying honest | Michelle | Before the next law edit |
| 4 | May Reception refund? May Reception waive a deposit, and who authorizes (EC-3)? | The permissions table, two rows | Michelle | Before build |
| 5 | What exactly does a payer see today when a link expires? The screen is NeoPay-owned and unproven | `CP-A3` scope. It may be a copy task or a whole page | Anum | Before design |
| 6 | Do we publish the take rate in-product (`JOB-OWN-PAY2`)? It builds trust and it arms the 3.5% accounts to compare | Nothing here. It is a commercial decision worth making deliberately | Maaz | Not blocking |

---

## Before finalizing

- [ ] Funnel instrumentation is specified, so the lagging targets can carry real numbers instead of blanks
- [ ] Latency budget agreed in seconds (Question 1)
- [ ] Apple chain confirmed started, with a named owner and a date (Question 2)
- [ ] Permissions table has zero "?" rows (Question 4)
- [ ] `CP-A6` and `CP-D2` are added to `feature-mappings/get-paid/camipay.md`, so the guide inherits the IDs this PRD minted
- [ ] Engineer audit of `feature/camipay` against R1 to R3 and R7 to R10, since this PRD asserts no build state of its own

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | 2026-08-16 | ⏳ Draft |
| Engineering | Faisal | — | Pending |
| Commercial | Maaz | — | Pending |
| Design | Anum | — | Pending |
| Security | Marlon | — | Pending |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Cites `CP-A1` to `A5`, `C1`, `C3`, `D1`; mints `CP-A6` (automatic deposit at booking) and `CP-D2` (OTP pre-warning). **Flags INV-C4's undocumented hosted-page exception as law that needs an ADR, and names funnel instrumentation as the first item on the critical path because every lagging target is currently blank** |
