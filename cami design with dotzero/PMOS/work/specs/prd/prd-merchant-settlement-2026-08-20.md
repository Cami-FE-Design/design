# PRD: Merchant settlement

**ID:** PRD-SETTLEMENT · **Owner:** Michelle (Product) · **Date:** 2026-08-20 · **Status:** ⏳ Draft, Problem Review
**Serves objective:** [OBJ-P5](../../../context/goals.md) (Complete the money path). Upstream of OBJ-P6, which multiplies whatever this does, including its failures
**Law cited:** INV-P2, INV-P3, INV-P4, INV-P6, INV-P9, INV-P10, INV-01, INV-03, INV-05, INV-06, INV-08, INV-10, INV-12, INV-A1, INV-A3, INV-A4, INV-M3, INV-M4 · [03](../../../context/knowledge/03-state-machines.md) §2, §10, §14 · [04](../../../context/knowledge/04-decision-records.md) ADR-001, ADR-002, ADR-009, ADR-014, ADR-024 · [06](../../../context/knowledge/06-money-composition-contract.md) §3, §4, §7
**Use cases minted:** none. Cites the existing `SET-` namespace in the [BRD](../brd/merchant-settlement-brd.md), 40 IDs across groups A to E
**Related:** [BRD](../brd/merchant-settlement-brd.md) · [UI ticket pack, 2026-08-20](../tickets-merchant-money-surfaces-2026-08-20.md) · [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md) · [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md) · [Jul 31 roadmap meeting](../../meetings/2026-07-31-roadmap-settlement-reporting-team.md) · PRO-737
**Supersedes:** [prd-merchant-settlement-2026-08-16](./prd-merchant-settlement-2026-08-16.md)

**Requirement detail lives in the BRD.** That document owns the `SET-` IDs, the QA edge cases, and the language for BA and engineering. This document owns the problem, the evidence, the law, and the risk case. The two are deliberately not duplicated.

---

## TL;DR

1. Cami captures money on two rails and has no product that moves it to the merchant. Settlement runs today as a **manual payout by Crescent Enterprise**, and about **8% of a target merchant's GMV** currently reaches Cami's rails at all.
2. Why now: OBJ-P5 gates every other objective, and multi-location (OBJ-P6, Sep to Nov) multiplies a manual process by the number of sites.
3. What could kill it: **Cami has no agreed way to collect its own fee on terminal**, which is the majority rail. Q1 below. Unanswered, this ships a product that pays merchants correctly and earns nothing on most of the volume.

⚠️ **Evidence:** the mechanics are grounded in Cami's own law, in PRO-737, and in one live competitor account. The **human** evidence is competitor-artifact inference. No merchant and no Account Manager has been interviewed about settlement. This supports building the machinery. It does not yet support the merchant-facing shape in group D.

---

## Context

| What changed | When | So what |
|---|---|---|
| Custody decided as **split by rail**: terminal held by the gateway, online held by Cami | 2026-08-16, Michelle | One merchant now receives two payouts from two senders on two schedules. It is the fact every requirement follows from |
| OBJ-P5 opened, giving settlement an owner at the goal layer | 2026-08-16 | Settlement had a BRD and a PRD and no product goal above it. That orphan is closed |
| Live settlement path documented: NeoPay settles same-day to **Crescent Enterprise** at D+1, Crescent pays each merchant **manually** | 2026-07-31, Maaz | There is a running process to migrate off, not a greenfield build. Rollout is a real section, not a formality |
| Fresha's settlement surfaces read off SOTA's live account | 2026-08-20, 8 screenshots | The merchant-facing shape has a benchmark, including the defect not to copy |
| UI ticket pack cut for five merchant money screens | 2026-08-20 | Design can start on group D before Q1 and Q3 resolve |
| PRO-737 shipped rails, gateways, and an append-only rate card as UI on mock data | 2026-08-16 | The rate this deducts exists as a model. Its backend does not |

---

## Problem

**A merchant captures money through Cami, and there is no defined product that moves it to their bank or that pays Cami.**

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Omar** (Owner) | Cannot separate held money from paid money, cannot close a month or file VAT from what Cami shows | Daily glance, sharply at month end | Keeps a running total in his head, rebuilds the month with his accountant, and cannot plan cash flow without calling someone |
| **Dana** (Account Manager) | Cannot answer "where is my payout" without asking engineering | Every payout cycle per account | Learns a payout failed when the merchant calls. Onboarding is supported, the operating life of the account is not |
| **Cami finance** (Veal) | No view of float, no revenue at the rate actually charged, no month close across partners | Monthly, and continuously for the liability | Float sits off the balance sheet. Revenue is reconstructed by hand from a manual Crescent process |

- The problem sharpened when custody was decided as split by rail. That decision is right for regulatory exposure, and it creates the specific problem this PRD exists to solve.
- It also created one unanswered question that blocks the revenue model on the majority rail. See Q1.

---

## Jobs served

| Job ID | Persona | Job (short) | Opportunity | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-OWN-PAY1` | Omar | Float visibility, see what is held and when it leaves | 12 | [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md) F1 | `SET-D1`, `SET-D2`, `SET-B6` |
| `JOB-OWN-PAY2` | Omar | Fee legibility, disclosed rather than discovered | 10 | jtbd-owner E4 | `SET-D8`, `SET-D9`, `SET-C4` |
| `JOB-OWN-PAY3` | Omar | Payout-destination integrity, hard for anyone to redirect | 11 | jtbd-owner F7, E3 | `SET-B3`, `SET-B4`, `SET-B5`, `SET-A3` |
| `JOB-OWN-KNOW3` | Omar | Month close reconciles to the bank | 16 | personas.md | `SET-D5`, `SET-D6`, `SET-D7` |
| `JOB-OWN-KNOW5` | Omar | VAT stated separately from what the customer paid | 18 | personas.md, law | `SET-D6` |
| `JOB-AMG-RES1` | Dana | Answer "where is my payout" from one screen | 16 (OP1) | [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md) | `SET-C8` |
| `JOB-AMG-ONB1` | Dana | Know a signed Partner is settle-ready before the first payout is due | 15 | jtbd-camihq | `SET-A4`, `SET-A7` |
| `JOB-AMG-NEG1` | Dana | Renegotiate a rate forward-only, never re-pricing history | 10 | ✅ Maz verbatim, PRO-737 | `SET-C2`, `SET-X5` |
| `FI1` | Cami finance | Know total float held across all partners | 19 | jtbd-camihq | `SET-C3`, and the float ledger behind it |
| `FI2` | Cami finance | Recognize revenue at the rate actually charged | 17 | jtbd-camihq | `SET-C2` |
| `FI3` | Cami finance | Close a month across all partners | 18 | jtbd-camihq | `SET-C8`, `SET-C10` |

- ⚠️ **Every row except `JOB-AMG-NEG1` is inferred or assumed.** The IDs make them citable, not validated. Q7 is the cheapest way to convert the Omar rows into evidence.
- Cami finance jobs are cited by their jtbd-camihq IDs. They have no `JOB-` namespace in `personas.md` because Cami finance is not a persona there. That gap is worth closing.

---

## Applicability

| Axis | This PRD covers | Explicitly not | Why |
|---|---|---|---|
| **Business type** | Both, with-pets and without-pets | Nothing excluded | Settlement is vertical-agnostic. Money moves the same way for a groomer and a salon |
| **Tier** | All tiers, T1 to T3 | No tier gating | The OS is free and revenue is processing margin (INV-P4, ADR-001). Settlement is not a feature anyone upgrades to, it is how the business model functions |
| **Location scope** | **Business-shared** at v1. One payout destination and one schedule per business | Per-location payouts and per-location destinations | INV-B4 and ADR-009 hold single-location at v1. Q5 decides the data model before OBJ-P6 lands, and getting it wrong is a migration, not a setting |
| **Surface** | **CamiHQ** (settle-ready state, payout run, reconciliation) and **Business** (float, payout history, fee statements, bank account) | Public, Staff | A client never sees settlement. Staff are scoped out of pricing and money by INV-A2 |

- "All tiers" here is a decision, not a default. It follows from INV-P4 and is stated so nobody re-derives a pricing gate later.

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| Online money settles NeoPay to Crescent Enterprise same-day, lands D+1, and Crescent pays each merchant **manually** | ✅ Validated | [Jul 31 meeting](../../meetings/2026-07-31-roadmap-settlement-reporting-team.md), Maaz |
| Merchants are told to expect money in roughly 5 days, or weekly | ✅ Validated | Jul 31 meeting |
| The Crescent manual process is an interim to protect launch time and needs to change | ✅ Validated | Jul 31 meeting, Maaz |
| Terminal money comes from NeoPay directly, a simpler path | ✅ Validated | Jul 31 meeting |
| Noon Payments is the next provider, roughly 3 to 4 weeks, with no change to the current online path meanwhile | ✅ Validated | Jul 31 meeting |
| SOTA's on-rail capture is about **8% of GMV**. Sales line nil, deposits are 100% of on-rail inflow | ✅ Validated | SOTA Fresha account summary, 16 days of Aug 2026, via jtbd-owner |
| Fresha's subscription plus add-ons is about **58% of their total take** from SOTA | ✅ Validated | Same account summary |
| Fresha shows **two figures both called a balance, roughly 9x apart**, because payouts are absent from the breakdown | ✅ Validated | Observed in one session, jtbd-owner |
| PRO-737 explicitly deferred settlement: "gateway credentials, payout accounts, batch timing. Separate surface, separate spec" | ✅ Validated | PRO-737 spec, verbatim |
| Gateway refunds for CamiPay-captured payments are not built and are a pilot blocker | ✅ Validated | ADR-014, camipay rule 6 |
| Terminal Phase 1 trusts a device report with no server-side gateway confirm | ✅ Validated | ADR-014, PRO-982. A time-boxed exception to INV-P3, not a repeal |
| Custody is split by rail | ✅ Validated | Michelle, 2026-08-16 |
| The merchant-facing shape in group D | ⚠️ Inferred | Read off Fresha's live surfaces, not from an owner's words |
| Omar's three payments jobs | ⚠️ Inferred | Derived from a competitor's build decisions. `personas.md` marks them so |
| Dana's jobs | ⚠️ Assumed | Reconstructed from PRO-737 and from the surfaces conspicuously absent around it. No Account Manager interviewed |
| The gateway can report terminal payouts back to Cami at all (`SET-C9`, `SET-C10`) | ⚠️ Assumed | Confirm with NeoPay before committing those rows |
| The 8% capture ratio holds beyond a 16-day window | ⚠️ Assumed | One window, one account |
| Whether merchants open a wallet screen, and how often | 🔴 Unknown | Nobody asked. Q7 |
| Whether holding online float needs a UAE license | 🔴 Unknown | Q4, legal |

**Honest summary.** The machinery is well grounded. The human evidence is not. Build the ledger, validate the screens.

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| **Custody is split by rail.** Terminal at the gateway, online at Cami | Michelle, 2026-08-16 | BRD custody model | Reopening changes every requirement in groups B to E. If Q4 lands badly it is superseded by a new ADR, not by a review comment |
| **The OS stays free. No subscription line ever appears in a merchant deduction** | ADR-001, INV-P4 | goals.md, company.md | The free OS is the sales asset against Fresha, whose subscription is 58% of their take from SOTA |
| **Cami's take is read from the rate stored on the transaction at capture** | PRO-737, INV-12, `JOB-AMG-NEG1` (Maz verbatim) | PRO-737 spec | Recomputing from the current rate card silently re-prices every payout in history the moment anyone edits a rate |
| **Cami owns the commercial record on both rails. The gateway only moves money** | INV-P2 | 01 | A gateway paying the merchant directly does not make the gateway the source of truth for the invoice |
| **Financial records are append-only. A failed payout stays visible and a retry is a new row** | INV-01, `SET-C6` | 01 | Editing a failed payout in place destroys the audit trail on the exact record most likely to be disputed |
| **Reports own merchant revenue analytics. This owns payouts and reconciliation** | ADR-024 | 04 | Two surfaces answering the same question is how they disagree |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-P2 | Cami owns the commercial record on both rails, including the one the gateway pays out |
| INV-P3 | Provider stays swappable per rail. Noon lands next, so no requirement may name NeoPay in a schema |
| INV-P4 | No subscription line in any deduction breakdown |
| INV-P6 | No card on file, so there is no mechanism to collect a negative float or an unpaid fee invoice. Constrains Q1 option B and Q2 |
| INV-P9 | Payout documents and Cami's own fee invoice are VAT-compliant |
| INV-P10 | A deposit is a liability until service render. Float composition must not treat deposit capture as recognized revenue |
| INV-01 | Payouts, fees, and refunds are append-only. Corrections are new rows |
| INV-03 | Float is derived from an append-only event ledger, never a stored mutable integer |
| INV-05 | Refunds return to the tender they came from, which is what splits `SET-E1` from `SET-E2` |
| INV-06 | One reversal gives back once |
| INV-08 | Destination changes, verifications, and payout actions are attributable |
| INV-10 | Every setting declares its inheritance level. Payout destination and schedule declare Business |
| INV-12 | Schedule and destination changes apply forward only. An in-flight run keeps the settings it started with |
| INV-A1 | Four roles, read and write granularity |
| INV-A3 | KSA does not go live before a Saudi-resident data stack exists. Bank details are in scope |
| INV-A4 | PII is anonymized before any ingest into analysis |
| INV-M3, INV-M4 | Amount due includes tip and a sale cannot settle over- or under-tendered. The take base is the captured amount, not taxable gross |
| ADR-014 | Terminal Phase 1 trusts a device report, and gateway refunds are a pilot blocker |
| ADR-024 | Reporting ships CSV-first, so the reconciliation export defers to that set |
| 06 §3, §4, §7 | Scope Rule, two totals reported separately, rounding and negative-amount rendering |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| **03 State Machines** | No payout lifecycle exists. §8 is the payment link, §9 is the terminal session | Add a **payout lifecycle**: `Pending → Batched → Sent → Cleared`, and `Sent → Failed → Retried`. It is the contract engineering builds the run against | 🔴 Not written. Blocks `SET-C1` to `SET-C6` |
| **06 Money Composition Contract** | §Scope says settlement and payout are explicitly **out of scope** of the contract | Either extend 06 with a settlement section, or state in 06 that the take base is the **captured amount** (payment-scoped) and that settlement owns it. Today a ticket computing a take has no citable unit | 🔴 Not written. `SET-C2` currently cites PRO-737, which is a design spec, not law |
| **INV-P3** | Provider abstraction, no flow hard-coupled to one provider | Q1 option A (gateway deducts and remits Cami's fee) is gateway-specific commercial plumbing. It does not repeal INV-P3, but it needs recording as a scoped exception the way terminal Phase 1 was | 🔴 Needed if Q1 resolves to A |
| **New ADR: how Cami earns on terminal** | Undefined | Q1 / BRD D1. The single decision that gates build | 🔴 Not started |
| **New ADR: negative float policy** | Undefined | Q2 / BRD D2 | 🔴 Not started |
| **New ADR: payout destination verification** | Undefined | Q3 / BRD D3 | 🔴 Not started |
| **ADR-009 follow-up** | Single location at v1 | Q5, one payout destination per business or per location. Decide before OBJ-P6 builds, because it is a migration afterward | 🔴 Not started |

- A PRD that quietly changes law is how INV-11 breaks. Four of these are new ADRs and two are additions to existing law. None may be assumed during build.

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Captured volume as share of merchant GMV | ~8% (SOTA on Fresha) | 40%+ | 6 months post-terminal |
| Cami revenue per Tier 2 partner | nil, not settling | ~1.3% of partner GMV, matching Fresha's extraction from SOTA | 6 months |
| Month close possible from Cami alone, tying to the bank | No | Yes | At GA |
| Merchants paid by the automated run rather than by Crescent manually | 0% | 100% of online-rail merchants | At GA |
| Payout failure rate | 🔴 No baseline, nothing runs yet | <1% | 3 months |
| Support contacts asking "where is my payout" | 🔴 Needs support tagging first | Near zero | 3 months |

- 40% is set deliberately below the ~51% that would match Fresha's total extraction from SOTA at a 2.5% blend. It is a first target that still proves the model.
- Two rows carry no baseline. Instrument them before GA or they cannot be claimed afterward.

**Leading** (pre-launch signals)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| **Destination change reaches both custody sides** | Test harness, gateway write forced to fail mid-change | **100%, no partial state.** Below this, do not launch |
| Daily Cami-versus-gateway reconciliation differences | Dry-run `SET-C10` against live terminal traffic | 0 unexplained |
| Finance can close a month on test data | Dogfood with Veal before beta | Yes |
| Payout run is idempotent | Run twice for one period in staging | Paid once, every time |
| Time from signed to settle-ready | Instrument onboarding | <5 business days |
| Partners settle-ready but not yet capturing | HQ settle-readiness view | Trending to 0 |
| Omar opens a wallet surface, and how often | Q7, one conversation with the SOTA owner | Any answer. Asking is the threshold |

- 💡 The first row is the gate. It is the highest-severity requirement in the spec and the cheapest to test.

---

## Proposed solution

### How it works

- Five stages, following the money: **get settle-ready → configure → run → show → reverse**. The BRD's groups A to E map one to one.
- **Get settle-ready.** Legal entity, verified payout destination, gateway onboarding. A merchant cannot be paid until all three exist, and an unready merchant is **skipped with a visible reason, not failed**.
- **Configure.** One payout destination, pushed to both custodians. Online schedule set by Cami, terminal schedule read from the gateway and displayed read-only.
- **Run.** Cami pays online float on schedule, deducting the take at the rate stored on each transaction. The gateway pays terminal money directly and Cami records it.
- **Show.** One story for the merchant: what is held, when it lands, what was inside each payout, what Cami charged, and a reconciliation that ties to the bank and carries VAT.
- **Reverse.** Online refunds come out of Cami float, terminal refunds go back through the gateway.

**The load-bearing constraint.** Custody is split, so a merchant receives two payouts from two senders on two schedules for the same week's work. Nobody has told them that. Making it legible is a design problem before it is an engineering one.

### User stories (the feature-level use cases)

IDs cite the existing `SET-` namespace in the BRD. Nothing is minted here and nothing is renumbered.

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `SET-A3` | `JOB-OWN-PAY3` | Cami ops | to verify a payout destination before any money is sent to it | money never moves to an unchecked account | Verified state recorded with who verified it and when (INV-08) | Destination `Verified` |
| `SET-A4` | `JOB-AMG-ONB1` | Dana | to see settle-readiness on the partner record | I know before the first payout is due, not after | HQ shows at a glance whether this partner can be paid and what is missing | Merchant `Settle-ready` or `Blocked`, with a reason |
| `SET-A5` | `JOB-AMG-ONB1` | Cami ops | the run to skip an unverified destination | onboarding-in-progress does not read as a failure | Merchant is skipped with a visible reason, not failed | Payout not created, reason recorded |
| `SET-B3` | `JOB-OWN-PAY3` | Omar | my bank change to reach every place my money comes from | half of it does not go to a closed account | Change commits at Cami and at the gateway, or rolls back with an explicit error. **No partial state** | Destination `Unverified` at both, payouts paused |
| `SET-B4` | `JOB-OWN-PAY3` | Omar | payouts to pause after a change, never fall back | money never lands in the account I just replaced | New account unverified, payouts paused, banner shown | Payouts `Paused` |
| `SET-B6` | `JOB-OWN-PAY1` | Omar | a payout schedule and a minimum amount | I can plan cash flow against a rule, not a guess | Online payouts follow the schedule and skip below the minimum | Float `Pending` until the next qualifying run |
| `SET-C1` | `FI3` | Cami finance | the run to pay every settle-ready merchant with float above the minimum | payouts stop depending on a person remembering | Payouts created, amounts correct, unready merchants skipped | Payout `Batched` |
| `SET-C2` | `JOB-AMG-NEG1`, `FI2` | Cami finance | the take deducted at the rate stored on each transaction | a rate change never re-prices history | Payout equals captured money minus take, take matches the rate at capture | Payout `Batched`, take line written |
| `SET-C3` | `FI1` | Cami finance | the run never to pay out more than a merchant's float | a run cannot overdraw | Blocked with an alert if it would | Run halted, alert raised |
| `SET-C5` | `JOB-AMG-RES1` | Dana | a failed payout to return money to float and tell someone | I hear it from the system, not the merchant | Float restored, reason recorded, notification sent | Payout `Failed`, float `Pending` |
| `SET-C6` | `FI3` | Cami finance | a retry to be a new payout, never an edit | the failed row stays visible forever (INV-01) | Retry is a separate row with its own path | New payout `Pending` |
| `SET-C7` | `FI3` | Cami finance | the run to be safe to re-run | running twice for a period does not pay twice | Idempotent by run ID | Unchanged on the second run |
| `SET-C8` | `JOB-AMG-RES1` | Dana | one screen showing who was paid, skipped, and failed and why | I answer "where is my payout" without asking engineering | One HQ screen answers it for any partner | No state change, read surface |
| `SET-D1` | `JOB-OWN-PAY1` | Omar | one figure of held money and one sentence of when it leaves | I can plan cash flow without calling anyone | One headline figure, scoped in words. **No second figure also called a balance** | No state change, read surface |
| `SET-D3` | `JOB-OWN-PAY1` | Omar | payout history for both rails, labeled by sender | I understand why there are two deposits in my bank | History shows "from Cami" and "from NeoPay" with the gateway schedule read-only | No state change, read surface |
| `SET-D4` | `JOB-OWN-PAY2` | Omar | to open a payout and see what is inside it | I can trace any figure to its transactions | Transactions listed, take shown, arrives at the payout amount | No state change, read surface |
| `SET-D5` | `JOB-OWN-KNOW3` | Omar | a reconciliation with a payouts line | it ties to my bank | Breakdown arrives at the headline figure, payouts included | No state change, read surface |
| `SET-D6` | `JOB-OWN-KNOW5` | Omar | VAT on the reconciliation | I can file from it | VAT stated separately from amount due (06 §4) | No state change, read surface |
| `SET-D7` | `JOB-OWN-KNOW3` | Omar | off-rail money included, or the omission stated | a partial view never reads as complete | Scope of the figure is stated in words | No state change, read surface |
| `SET-D9` | `JOB-OWN-PAY2` | Omar | the take rate stated in-product | I do not reconstruct Cami's fee from a bank statement | Rate in force rendered on the screen, not only in a download | No state change, read surface |
| `SET-E1` | `JOB-OWN-PAY2` | Omar | an online refund to come out of float and back to the original card | the money returns the way it arrived (INV-05) | Float reduces, refund returns to the original tender | Sale `Refund`, float reduced |
| `SET-E2` | `JOB-OWN-PAY2` | Omar | a terminal refund to go through the gateway | Cami never held it, so Cami cannot return it | Gateway refund executed and recorded | Sale `Refund`. **Blocked until gateway refunds exist** |

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Business, account summary | Healthy | One headline figure, scoped in words, with a breakdown that arrives at it | `SET-D1`, `SET-D5`, G1, G2 |
| Business, account summary | Payouts paused | Banner explaining the destination is unverified, and that money is held not lost | `SET-B4` |
| Business, account summary | Not settle-ready | What is missing, in the merchant's words. Copy must not read as an error | `SET-A5`. Skipped is not failed |
| Business, account summary | Below minimum for several periods | Money rolls forward and the merchant can see why nothing came | `SET-X9` |
| Business, account summary | Terminal-only / online-only | A complete screen, not an empty broken one | `SET-X7`, `SET-X8` |
| Business, bank account | Gateway write failed | Nothing changed anywhere, explicit error | `SET-B3`, `SET-X1` |
| Business, bank account | Read-only for non-permitted roles | Masked account, no edit affordance | `SET-B9`, INV-A1 |
| Business, activity feed | Reported-not-confirmed terminal row | Gateway-reported payment marked as reported, not confirmed | `SET-C9`, ADR-014 |
| Business, activity feed | Failed payout | Permanent row with its reason, retry as a **separate** row | `SET-C5`, `SET-C6`, INV-01 |
| Business, invoices and fees | Pending current period | The date the document becomes available | `SET-D8` |
| CamiHQ, payout run | Run detail | Paid, skipped, failed, each with a reason | `SET-C8` |
| CamiHQ, partner record | Settle-readiness | Ready, or what is missing | `SET-A4`, `SET-A7` |

- Pixel and interaction detail belongs to the [UI ticket pack](../tickets-merchant-money-surfaces-2026-08-20.md) and to `docs/specs/DSG-*`. This table states screen **intent** and the rule each state carries.

### Operational workflows

| Flow | Actors in order | Trigger | Handoff point | State machine | Manual step remaining |
|---|---|---|---|---|---|
| **Online payout** | Scheduler → Cami float ledger → bank → merchant | Schedule due and float above minimum | Instruction leaves Cami for the bank | Payout lifecycle (**to be written**, see Law touched) | None at GA. Today this is Crescent, entirely manual |
| **Terminal payout** | Gateway → merchant, Cami records only | Gateway's own schedule | Gateway pays merchant directly, reports back to Cami | Not Cami's machine. Cami records the reported event | Reconciliation review of differences (`SET-C10`) |
| **Destination change** | Omar → Cami → gateway → verification → payouts resume | Merchant edits bank account | Gateway write. **Both commit or neither does** | Destination: `Verified → Unverified → Pending → Verified` | Verification method itself, pending Q3 |
| **Failed payout** | Bank → Cami → Dana → merchant | Bank or gateway rejects | Notification to Dana before the merchant calls | `Sent → Failed → Retried` | Deciding whether to retry or fix the destination |
| **Refund after settlement** | Merchant → Cami or gateway → client | Refund requested on settled money | Rail determines custodian (INV-05) | 03 §14 reversal decision | Terminal refunds blocked until gateway refunds exist |

---

## Money composition

| Object | Scope (invoice / payment) | Composition Order step | Invariant |
|---|---|---|---|
| **Captured amount** (the take base) | Payment | Step 10, tender applied against amount due | INV-M4. The take is computed on what was actually captured, not on the sale total and not on what was tendered |
| **Cami take** | Neither. It is a deduction from the merchant's float, not a line on the client's invoice | Outside the Composition Order | INV-P2, INV-P4. It never touches taxable gross or the client's VAT |
| **Tip** | Invoice | Step 8, outside the tax base | INV-M3, INV-M5. Included in amount due, therefore in the captured amount, therefore in the take base **unless Q8 says otherwise** |
| **Deposit** | Payment | Tender record | INV-P10. A captured deposit is float and a liability. It is not recognized revenue until service render |
| **VAT on the client's sale** | Derived from taxable gross | Step 6 | INV-M2, INV-P9. Settlement reports it, never recomputes it |
| **VAT on Cami's own fee invoice** | A separate tax invoice Cami issues to the merchant | Not the client's invoice | INV-P9. Cami charges a UAE business, so Cami's fee document is itself a tax invoice |

- **Two totals are always reported separately.** Amount due and taxable gross differ whenever a tip exists (06 §4, EC-39). A reconciliation with a single "total" field produces an incorrect return.
- **06 explicitly excludes settlement from its scope.** That is the gap recorded in Law touched. Until it closes, `SET-C2` has no citable unit for the take base, which is why the row above states it plainly rather than linking to 06 and hoping.
- ⚠️ **Q8, new.** Does Cami's take apply to the tip? A tip is invoice-scoped and inside amount due, so it is inside the captured amount by default. Charging a platform fee on staff gratuity is a commercial and reputational decision nobody has made.

---

## Automation and messaging rules

| Trigger | Audience | Channel | Template ID | Opt-out honored | Quiet hours | Dedupe rule | Law |
|---|---|---|---|---|---|---|---|
| Payout sent | Omar (Owner) | In-product, plus email | `SET-N1` (to mint) | Yes, per-merchant setting | Not applied. Money movement is transactional, not marketing | One per payout ID | INV-C1, status-only, no URLs |
| Payout failed | Dana first, then Omar if unresolved in 24h | In-product plus email to Dana, in-product to Omar | `SET-N2` | **No.** Operational, cannot be opted out of | Not applied | One per payout ID, not per retry attempt | INV-08 |
| Destination changed | Omar, and the previous email on file | Email to both | `SET-N3` | **No.** Security notification | Not applied | One per change event | `SET-B5`, INV-08 |
| Payouts paused, destination unverified | Omar | In-product banner, persistent | `SET-N4` | No | n/a, it is a banner not a message | Banner state, not a send | `SET-B4` |
| Fee statement available | Omar | In-product, plus email | `SET-N5` | Yes | Yes, if it lands out of hours | One per period per merchant | `SET-D8` |
| Reconciliation difference found | Cami finance and ops only | Internal | `SET-N6` | No | No | One per daily run, batched | `SET-C10`, ADR-014 |

- **No merchant notification ever contains a URL to a money action.** INV-C1 is written for client reminders, and the same spoof and phishing reasoning applies with more force to a payout notification. Status only, the merchant opens the app.
- 🔴 **Gap in law.** INV-C1 and INV-C3 govern **client** comms. There is no written rule for **operator** notifications. Every row above extends client law by analogy. That needs recording rather than assuming, and it is Q9.
- Template copy belongs to the design spec. Whether a message fires, to whom, and whether it can be silenced is a product decision and lives here.

---

## Permissions and roles

| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|
| View float and payout history | No | No | Read | Yes | No, read |
| View fee statements and take rate | No | No | Read | Yes | No, read |
| Export the reconciliation | No | No | Yes | Yes | Yes |
| Edit payout schedule and minimum | No | No | No | Yes | Yes |
| **Change payout destination** | No | No | No | **Owner only** | **Yes, permanent, from-and-to recorded** |
| Verify a payout destination | No | No | No | No | Cami ops only, in HQ |
| Run or re-run a payout batch | No | No | No | No | Cami finance only, in HQ |

- **Settlement gets its own permission codes**, following PRO-737's per-control pattern: `billing.settlement.view`, `billing.settlement.config.edit`, `billing.settlement.destination.edit`. HQ-side adds `billing.settlement.run` and `billing.settlement.destination.verify`.
- **Destination edit is Owner-only and separate from every other billing code.** `JOB-OWN-PAY3` is a security job wearing a settings-screen costume, and EC-4 already records staff revenue-integrity risk. A Manager who can edit a schedule must not be able to redirect the money.
- Service staff are scoped out entirely by INV-A2.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| `SET-X1` | Bank change, gateway update fails | ✅ `SET-B3`, both-or-neither commit | — |
| `SET-X2` | Payout run executes twice for one period | ✅ `SET-C7`, idempotent by run ID | — |
| `SET-X3` | Merchant has float but is not settle-ready | ✅ `SET-A5`, skipped with a reason | — |
| `SET-X4` | Refund larger than current float | ⚠️ Requirement exists (`SET-E3`), **behavior undecided** | Q2 |
| `SET-X5` | Rate card changed after capture, before payout | ✅ `SET-C2`, rate at capture | — |
| `SET-X6` | Payout fails at the bank | ✅ `SET-C5`, money returns to float | — |
| `SET-X7` | Terminal-only merchant | ✅ Screen state drawn, no Cami payouts | — |
| `SET-X8` | Online-only merchant | ✅ Screen state drawn, no gateway payouts | — |
| `SET-X9` | Float below minimum for several runs | ✅ Rolls forward, visible reason | — |
| `SET-X10` | Gateway reports a terminal payment Cami has no record of | ✅ `SET-C10`, surfaced as a difference | — |
| `SET-X11` | **Merchant archived or suspended with float remaining** | 🔴 **No requirement covers this.** Money is still owed | **Needs a requirement before GA.** Raised, not solved |
| `SET-X12` | Two concurrent refunds on one sale | ✅ `SET-E4`, INV-06 | — |
| `EC-19` | Captured versus booked volume gap | ⚠️ `SET-D7` states the scope of the figure. The gap is not flagged | `reporting`, `JOB-OWN-KNOW4` |
| `EC-39` | Single "total" field on a receipt or export | ✅ `SET-D2`, `SET-D6`, two totals always separate | — |
| `EC-4` | Staff revenue-integrity risk | ✅ Destination edit is Owner-only and attributed | — |

- New IDs proposed here land in `05-edge-case-catalog.md`, not inline. `SET-X11` is the one with no requirement above it and it is the reason this table exists.

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `payout.created` / `batched` / `sent` / `cleared` / `failed` | Per payout | Payout history, HQ run view, month close | **New** |
| Payout-to-transaction membership | Per transaction per payout | `SET-C4`, `SET-D4`, payout detail | **New** |
| Take amount and **stored rate** per transaction | Per transaction | Fee statement, revenue recognition (`FI2`) | **New**. The rate exists in PRO-737's model, unbuilt in backend |
| Float balance | Per merchant, point-in-time, derived from the ledger | `FI1` total float, merchant headline figure | **New**, derived not stored (INV-03) |
| Gateway-reported terminal payout | Per reported payout | `SET-C9`, merchant payout history | **New** |
| Reconciliation difference | Per daily run | `SET-C10`, finance alerting | **New** |
| VAT on the reconciliation | Per period per merchant | `SET-D6`, merchant VAT return | Existing figure, new surface |
| Cami fee invoice | Per period per merchant | `SET-D8`, merchant expensing | **New document** |
| Captured versus booked volume | Per merchant per period | `EC-19`, `JOB-AMG-OPS2`, `JOB-OWN-KNOW4` | Existing gap, no flag |

- The reconciliation export defers to the reporting CSV set (ADR-024). This PRD specifies what must be **in** it, not its format.
- ⚠️ Every payout event is new. If the reporting pipeline is architected before these land, they get retrofitted. Faisal's data architecture work from the Jul 31 meeting is the place to raise it.

---

## Non-functional requirements

| Requirement (stated as an outcome) | Type | Applies to | Law cited |
|---|---|---|---|
| A payout destination is never rendered in full. Holder name, bank, last 4 only | privacy | Every surface and every export | `SET-A2` |
| Every destination change, verification, and payout action names its actor and time, permanently | attribution | Groups A, B, C | INV-08 |
| Financial records are never edited in place. Corrections are new rows, retained indefinitely | retention | Payouts, fees, refunds | INV-01 |
| Float is reconstructable at any point in time from the event ledger | correctness | Float | INV-03 |
| Bank details and payout records for a KSA merchant do not exist before a Saudi-resident data stack does | residency | Whole feature | INV-A3 |
| No client PII enters settlement analysis or model training un-anonymized | privacy | Reconciliation, BI layer | INV-A4 |
| A merchant's settlement data is reachable only by that merchant's permitted roles and Cami staff with a billing code | security | Both surfaces | INV-A1 |
| The payout run completes within its schedule window at 36 active businesses, and the design states the ceiling at which it does not | scale | Payout run | OBJ-B2 target of 36 by EOY |
| A destination change is atomic across two systems, or it does not happen | correctness | `SET-B3` | Highest-severity requirement |

- Outcomes only. How each is met, encryption choice, schema, retry policy, is the engineer's call.
- Availability and latency are absent deliberately. Neither is a product promise here. A payout that is one hour late is not a defect. A payout that is wrong is.

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Subscription or add-on billing | The OS stays free (INV-P4, ADR-001). Collecting for add-on usage is a real unsolved problem, and no card is stored (INV-P6) | Its own PRD. Not this one |
| Cami holding terminal money | Custody is decided. Terminal stays with the gateway | Locked. Superseding needs an ADR |
| Per-location payouts and destinations | INV-B4 and ADR-009 hold single-location at v1 | Q5, then OBJ-P6 |
| Merchant-facing revenue analytics | Reports own it (ADR-024) | `reporting`, OBJ-P4 |
| Replacing the gateway's terminal payout schedule | Cami displays it, does not control it | `SET-B7`, read-only |
| Chargeback handling | Separate problem with its own evidence and its own law | Its own spec. Not deferred inside this one |
| Flagging the captured-versus-booked gap | `SET-D7` states the scope of the figure. Turning the gap into an alert is a reporting job | `EC-19`, `JOB-AMG-OPS2` |
| Migrating off Crescent as a finance project | This PRD builds the product that makes the manual process unnecessary. Winding down the arrangement is finance's | Veal, with the Rollout table below |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| Rate stored on each transaction at capture | ⚠️ PRO-737 specced, **backend not built** | `SET-C2`, and therefore every payout amount |
| Gateway refunds for CamiPay-captured payments | 🔴 Not built, **already a pilot blocker** (ADR-014) | `SET-E2`. Cannot ship without it |
| Terminal server-side confirm (Phase 2) | 🔴 Planned direction, **no ticket** | Nothing blocks, but it is why `SET-C10` is mandatory rather than nice |
| Audit spine for attributable changes | ⚠️ Partial, PRO-737 known gap | `SET-B5`, `SET-A3`, INV-08 across the feature |
| Payout lifecycle in 03 | 🔴 Not written | `SET-C1` to `SET-C6` |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| Finance | Float custody liability, negative-float policy, and the Crescent wind-down | Veal |
| Legal / compliance | Whether holding online float needs a UAE license | Veal, with counsel |
| Design | Make two payouts from two senders legible. D6, blended or separate, decided at design review with both drawn | Anum |
| Ops | Define what verifies a payout destination | Ops + compliance |
| Engineering | Payout lifecycle, float ledger, both-or-neither destination write | Faisal |
| UI | The five merchant money screens already scoped | Husain, per the ticket pack |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| **NeoPay** | Agreement on how Cami's fee is collected on terminal | 🔴 Not started | Q1 option B, invoice the merchant. Weak: no card on file (INV-P6), so it creates receivables and chasing on a free-OS product |
| NeoPay | Ability to report terminal payouts back to Cami | Unconfirmed | Merchant reconciliation stays incomplete, and `SET-C9` / `SET-C10` are cut |
| NeoPay | **Written documentation**, not phone calls | Raised 2026-07-31, unresolved | A critical integration on ad-hoc calls is the Fresha/Francis experience repeating |
| Banking partner | Payout rails for online float | Unknown | Cami cannot pay out at all. Crescent manual process continues |
| Crescent Enterprise | Continuity of manual payouts until the run is live | Running today | This is the current state, not a risk. It is what rollout replaces |
| Noon Payments | Next provider after the current online setup | ~3 to 4 weeks from 2026-07-31 | No requirement here may name NeoPay in a schema (INV-P3) |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | **Q1, NeoPay fee remittance on terminal** | It is a commercial negotiation with lead time, not a build task. Everything else can proceed in parallel, and nothing else determines whether the revenue model works on the majority rail |
| 2 | Q4, legal answer on holding float | If it lands badly, online custody moves to the gateway and half this PRD is superseded |
| 3 | Payout lifecycle written into 03, plus the take-base unit into 06 | Engineering cannot build the run against undocumented law |
| 4 | Rate-at-capture backend from PRO-737 | Every payout amount depends on it |
| 5 | Payout run, then group D surfaces | The screens describe what the run produces |

- **Start the NeoPay conversation now.** It is first because of lead time, not because of build order.

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| **Live merchants paid manually by Crescent at roughly D+5 or weekly** | Nothing changes on day one. The run goes live in shadow mode, computing payouts without sending, reconciled against what Crescent actually paid | Nobody yet. Shadow mode is invisible by design |
| Shadow run agrees with Crescent for a full cycle | First merchant moves to the automated run. Crescent continues for everyone else | Dana, per account, before the first automated payout |
| Merchant moved to the automated run | Their payout timing changes, and they now receive **two** payouts instead of a single reconciled one | Dana, with the "two senders" explanation. This is the moment the split-custody model becomes the merchant's problem |
| Merchant is live but not settle-ready | Skipped with a visible reason. They stay on the manual process | Dana. Skipped is not failed, and the copy must not read as an error |
| Merchant has float mid-migration | Float is carried, never recomputed. The cutover point is recorded on the merchant record | Automatic, plus Dana |
| Historical payouts made by Crescent | Imported as read-only rows so payout history does not start empty | Not announced. It should simply be there |
| **Merchant archived or suspended with float** | 🔴 Undefined. `SET-X11` | Nobody, and that is the problem |

- **Shadow mode is the whole migration strategy.** A payout engine that has never agreed with a known-correct manual process should not send its first real transfer to a live merchant.
- Historical import matters more than it looks. A merchant who moves to the new surface and sees an empty payout history will conclude the money is gone.

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| Cami cannot collect its fee on terminal, the majority rail | **B** | Medium | The revenue model does not work on most of the volume. Cami pays merchants correctly and earns nothing | Q1. Recommended path is gateway deducts and remits. **Start the NeoPay conversation now** | Maaz |
| Holding online float needs a license Cami does not have | **B** | Unknown | Online custody moves to the gateway and half this PRD is superseded | Q4 to legal **before build**, not before launch | Veal |
| Bank change reaches one custody side only | **F** | Low, high impact | Half a merchant's money goes to a closed account and fails days later where support cannot see why | `SET-B3` as one atomic operation, rollback on partial failure, forced-failure test in the leading indicators | Faisal |
| Merchant confused by two payouts from two senders | **U** | **High** | Support load on every account, and the trust cost lands on the money surface | Label by custodian, one history, explain once in onboarding. D6 decided at design review with both layouts drawn | Anum |
| Reconciliation omits terminal and cash and looks complete | **U** | Medium | Exactly Fresha's mistake. The merchant files from a fraction of their business | `SET-D5` and `SET-D7`. Either include off-rail money or state the scope plainly | Anum |
| Terminal Phase 1 trusts an unconfirmed report on a rail Cami never sees settle | **F** | Medium | Cami's record and the gateway's diverge, discovered by the merchant | Daily reconciliation (`SET-C10`), and ticket Phase 2 | Faisal |
| Negative float when a merchant refunds more online than they hold | **B** | Medium | No collection mechanism exists. No card on file (INV-P6) | Q2. Model against real SOTA refund rates | Veal |
| Payout recomputes revenue from the current rate card | **F** | Low | Silently re-rates history the moment anyone edits a rate | `SET-C2`. Read the stored rate, assert it in tests | Faisal |
| Merchants keep using their own bank machine | **V** | Medium | Settlement is built and capture does not move | Real and unmeasured. Settlement is necessary, not sufficient. The **terminal** is what moves capture. Validate with SOTA | Maaz |
| Shadow run never agrees with Crescent | F | Low | Migration stalls and the manual process continues indefinitely | It is the gate, not a surprise. Disagreement is information, and finding it in shadow is the point | Veal |
| Archived merchant left with float and no defined outcome | B | Low | Money owed with no process. A legal exposure, not just a bug | `SET-X11`. Needs a requirement before GA | Michelle |

**Cagan risk status**

| Risk | The question | Status |
|---|---|---|
| **Value** | Will merchants want it? | ✅ Table stakes. Fresha has it, merchants use it, and it is the condition of being paid at all. The honest value question is whether it **moves capture**, and the answer is that the terminal does that, not settlement |
| **Usability** | Can they figure it out? | ⬜ **Untested.** Two payouts from two senders has never been shown to anyone. Q7 and D6 |
| **Feasibility** | Can we build it? | ⬜ Five dependencies unbuilt, one with no ticket, and two pieces of law unwritten |
| **Business viability** | Does it work for the business? | ⬜ **Q1 and Q4 unanswered. This is the blocker** |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| **Q1** | **How does Cami collect its take on terminal?** Cami never holds the money, so there is nothing to deduct from. Recommended: gateway deducts and remits | Group C and the revenue model | **Maaz**, needs NeoPay | **Before any build** |
| **Q4** | Does holding online float need a UAE license? | Whether online custody is viable at all | **Veal** + legal | **Before build. May remove half this PRD** |
| Q2 | Can online float go negative, or is the refund blocked? | Group E, `SET-E3`, `SET-X4` | Veal | Before build |
| Q3 | What verifies a payout destination? Documents, micro-deposit, or gateway verification. Do not build what the gateway already provides | Group A, and ticket 2's copy | Ops + compliance | Before beta |
| Q5 | One payout destination per merchant, or per location? | Groups A and B, and the data model | Product | **Before OBJ-P6 builds.** It is a migration afterward |
| Q6 | Blended view or two clearly separate rails? | Group D layout | Product + design | Design review, both drawn |
| Q7 | **Do merchants actually open a wallet screen, and when?** | Validates the whole of group D | Michelle | **This week.** One conversation with the SOTA owner |
| **Q8** | **Does Cami's take apply to the tip?** A tip is inside amount due, therefore inside the captured amount by default | `SET-C2` take base, and Cami's reputation with staff | Maaz + finance | Before build |
| **Q9** | What law governs **operator** notifications? INV-C1 and INV-C3 are written for clients | Automation table, all six rows | Product | Before the notification build |
| Q10 | Who owns `SET-X11`, archived or suspended merchant with float? | GA | Michelle + Veal | Before GA |

- **Q7 is one conversation and it de-risks an entire section.** Ask it before anything in group D is designed.
- Q8, Q9, and Q10 are new in this revision. Q8 in particular is a decision that looks technical and is not.

---

## Before finalizing

*(gates the document leaving draft)*

- [x] Competitors checked. Fresha's settlement surfaces are mature and observed working. **Table stakes, Cami is behind, not innovating**
- [x] Jobs traced by ID to discovery outputs, with opportunity scores
- [x] Law split into depends-on and changes, with four new ADRs named
- [x] Current-state process documented (Crescent, D+1, manual) rather than treated as greenfield
- [ ] **Q1 has an owner with a date.** Maaz owns it. No date
- [ ] **Q4 has an owner with a date.** Veal owns it. No date
- [ ] Q7 asked. One conversation, not yet had
- [ ] Q8 raised with Maaz. New in this revision, not yet put to anyone
- [ ] Payout lifecycle drafted into 03, and the take base into 06. Engineering cannot build against law that is not written
- [ ] `SET-X11` has a requirement above it, or an explicit decision to defer with a named risk owner

**Do not move this past Problem Review until Q1 and Q4 have owners with dates.** Q1 decides whether the revenue model works on the majority rail. Q4 decides whether half this document exists.

---

## Release criteria

*(gates the feature reaching an operator. The test plan is the engineer's, this table says what passing means)*

| # | Must be true to ship | Keys to | Proven by | Blocking |
|---|---|---|---|---|
| 1 | A destination change commits at both custodians or at neither, with a forced gateway failure producing no partial state | `SET-B3`, `SET-X1` | Forced-failure test, 100% pass | **Yes** |
| 2 | A payout deducts the take at the rate stored on the transaction, not the current rate card | `SET-C2`, `SET-X5`, INV-12 | Rate changed after capture, payout unchanged | **Yes** |
| 3 | The run is idempotent. Two runs for one period pay once | `SET-C7`, `SET-X2` | Double-run in staging | **Yes** |
| 4 | A failed payout returns money to float, stays visible permanently, and its retry is a separate row | `SET-C5`, `SET-C6`, INV-01 | Induced failure, ledger inspected | **Yes** |
| 5 | The run never overdraws a merchant's float | `SET-C3`, INV-03 | Attempted overdraw is blocked and alerted | **Yes** |
| 6 | The account summary breakdown arrives at the headline figure, payouts included | `SET-D5`, G2 | Arithmetic check across seeded states | **Yes** |
| 7 | No surface shows two figures that could both be read as the balance | `SET-D1`, `SET-D2`, observed Fresha defect | Design review against all screen states | **Yes** |
| 8 | VAT appears on the reconciliation and on Cami's own fee invoice, separate from amount due | `SET-D6`, INV-P9, EC-39 | Accountant reads a month close without asking a question | **Yes** |
| 9 | Terminal-only and online-only merchants both render complete screens | `SET-X7`, `SET-X8` | Both seeded and reviewed | **Yes** |
| 10 | An unready merchant is skipped with a visible reason and no failure state | `SET-A5`, `SET-X3` | Seeded not-settle-ready merchant | **Yes** |
| 11 | Every destination change and payout action names its actor and time | INV-08, `SET-B5` | Audit rows present for every action | **Yes** |
| 12 | Shadow run agrees with Crescent's manual payouts for one full cycle | Rollout | Reconciliation report, zero unexplained differences | **Yes** |
| 13 | Payout history is populated with imported historical payouts at cutover | Rollout | First merchant's history is not empty | No, but expected |
| 14 | Terminal refunds execute through the gateway | `SET-E2`, ADR-014 | Gateway refund path exists | **Yes for terminal merchants.** Online-only can ship without it |
| 15 | Daily Cami-versus-gateway reconciliation runs and surfaces differences | `SET-C10`, `SET-X10` | Dry run against live terminal traffic | Should, not must, at first release |

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle | | ⬜ |
| Engineering | Faisal | | ⬜ |
| Design | Anum | | ⬜ |
| Commercial | Maaz | | ⬜ Owns Q1, Q8 |
| Finance | Veal | | ⬜ Owns Q2, Q4, Q10 |
| UI | Husain | | ⬜ Ticket pack scoped 2026-08-20 |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First draft. Built on the 2026-08-16 discovery set. Split custody decided the same day |
| 2026-08-20 | Rebuilt against the [PRD template](../../_templates/prd.md) as finalized 2026-08-20. Added the eight sections the first draft predated: header block with PRD and objective IDs, TL;DR, Applicability, Decisions locked, Law touched split into depends-on and changes, Money composition, Automation and messaging rules, Permissions and roles, Edge cases by ID, Reporting and data, Non-functional requirements, Rollout and migration, and Release criteria as a ship gate separate from Before finalizing. Jobs served now cites `JOB-` IDs with opportunity scores instead of quoting persona prose |
| 2026-08-20 | Added the current-state evidence from the [Jul 31 roadmap meeting](../../meetings/2026-07-31-roadmap-settlement-reporting-team.md), absent from the first draft: NeoPay settles same-day to Crescent Enterprise at D+1, Crescent pays merchants manually, merchants expect money in roughly 5 days or weekly, and Noon is the next provider. This turns Rollout from a formality into a shadow-mode migration off a running manual process |
| 2026-08-20 | Recorded two pieces of **unwritten law** as blockers rather than assumptions: there is no payout lifecycle in `03-state-machines.md`, and `06` explicitly excludes settlement, so the take base has no citable unit |
| 2026-08-20 | Raised three new open questions: **Q8** does the take apply to the tip, **Q9** what law governs operator notifications, **Q10** who owns `SET-X11` |
