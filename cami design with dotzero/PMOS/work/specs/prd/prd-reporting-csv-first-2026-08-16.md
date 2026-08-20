# PRD: Reporting, CSV-first

**ID:** PRD-REPORTING-CSV · **Owner:** Michelle You · **Date:** 2026-08-16 · **Status:** ⏳ Draft
**Serves objective:** OBJ-P4 (ship the Reports module CSV-first) → OBJ-B1
**Law cited:** INV-P7, INV-P9, INV-P10, INV-A1, INV-A2, INV-01, INV-03, INV-08, INV-M1, INV-M2, INV-M3, INV-M5 · ADR-013, ADR-024 · 06 §4, §7
**Use cases:** cites `RP-A1`, `RP-A2`, `RP-A3`, `RP-B1`, `RP-B2`, `RP-C1` in [know-how/reports.md](../../../cami-feature-docs/feature-mappings/know-how/reports.md). **Mints `RP-A4`, `RP-B3`, `RP-D1`,** which that guide inherits.
**Related:** [Reporting BRD](../brd/reporting-brd.md) (R2, R3, R5, R6, R10, R11) · [jtbd-know-how](../../discovery/outputs/jtbd-know-how-2026-08-16.md) · [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md) · [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md)

---

## TL;DR

1. **Ship five CSV reports, not three.** ADR-024's set is sales log detailed, payments log, and tips collected. **A day does not reconcile without a refund and void log and a VAT summary.** Those two are not additions, they are the rows the primary job needs.
2. **Why now:** a finance and compliance export is a Tier 2 buying requirement. SOTA is churning off a platform that has one.
3. **What could kill it:** `RP-B2` is **Broken** on `main`. Tip and tax are blended and there is no taxable-gross pair. **Every export built on that is a wrong VAT return distributed as a file.**

⚠️ **Evidence:** build state is engineering-verified on `main` (11 Aug). Demand is inferred from Fresha's live SOTA surfaces. **No owner, receptionist, or Account Manager has been interviewed about reporting.**

---

## Context

| What changed | When | So what |
|---|---|---|
| ADR-024 set CSV-first sequencing, dashboards as v2 | 29 Jul 2026 | Two approvals, no objections. The sequencing is settled; the contents of the first slice are not |
| `RP-B2` verified **Broken** | 11 Aug 2026 | No taxable-gross pair on reports, and the till blends tip and tax. This is `06 §4` unmet |
| `RP-C1` verified **Missing** | 11 Aug 2026 | No captured-versus-booked path exists, which is the number the commercial model runs on |
| Fresha's account summary read on the live SOTA login | 16 Aug 2026 | Their reconciliation screen shows two different figures both labeled as the balance, because payouts are absent. A defect worth not copying |
| Reporting architecture unfinalized | Aug 2026 | Anum is holding backend integration until Faisal signs off. Maaz says ship the existing screens. Both cannot hold |

---

## Problem

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Omar** | `JOB-OWN-KNOW3` close the month so the accountant does not rebuild it | Monthly | He pays someone to reconstruct what the platform already knows |
| **Omar** | `JOB-OWN-KNOW5` VAT separated from what the customer paid | Every filing | A tip inside a tax base is a wrong return, on a VAT-registered entity (INV-P9) |
| **Omar** | `JOB-OWN-KNOW4` see the money that did not run on Cami | Continuous | A report that looks complete covers a fraction of the business (EC-19). Satisfaction scores 1 out of 10 |
| **Layla** | `JOB-RCP-KNOW1` close the shift against the drawer and the machine | Every shift | 🔴 Unevidenced. This is the one job here with no source |
| **Dana** | `JOB-AMG-OPS1`, `OPS2` know whether an account is capturing | Continuous | She is measured on captured volume and cannot see it |

---

## Jobs served

| Job ID | Persona | Job (short) | Opp | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-OWN-KNOW5` | Omar | VAT stated separately from amount paid | 18 | [jtbd-know-how](../../discovery/outputs/jtbd-know-how-2026-08-16.md) | Fixing `RP-B2` first, then the VAT summary (`RP-B3`, minted) |
| `JOB-OWN-KNOW3` | Omar | Month close that ties to the bank | 16 | jtbd-know-how | The five-file set. Payouts line deferred to settlement |
| `JOB-OWN-KNOW4` | Omar | See the uncaptured gap | 17 | jtbd-know-how | 🔴 **Not in this slice.** `RP-C1` stays Missing. Named as the highest-value deferral |
| `JOB-OWN-KNOW1` | Omar | End-of-day revenue view | 13 | `personas.md` | `RP-A1` corrected to a completed-that-day match |
| `JOB-RCP-KNOW1` | Layla | Shift close against the drawer | 11 | jtbd-know-how | 🔴 **Blocked.** Reception's permitted depth is an open decision |
| `JOB-AMG-OPS1` | Dana | Know what Cami earns per Partner | 17 | [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md) | Only by architecture. The fact tables serve both audiences (BRD R9) |

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| No taxable-gross pair on reports; the till blends tip and tax | ✅ Validated | `RP-B2` **Broken** on `main`, 11 Aug |
| Deposit liability is not split from earned revenue | ✅ Validated | `RP-B1` Partial |
| The day view is not a pure completed-that-day match | ✅ Validated | `RP-A1` Partial |
| The export exists with a tip row and is not VAT-clean | ✅ Validated | `RP-A2` Partial |
| Staff are blocked in the UI and on GET, and the **export API policy leaks** | ✅ Validated | `RP-A3` Partial |
| No captured-versus-booked path exists | ✅ Validated | `RP-C1` **Missing** |
| Two line items for the same product in one sale break the idempotency key | ✅ Validated | Anum, 3 Aug. EC-36 |
| The in-process event emitter can drop an event before the reporting queue | ✅ Validated | Faisal review, 3 Aug. EC-37 |
| Tip is outside the VAT base; storage basis is VAT-inclusive and derived | ✅ Validated as law | INV-M5, INV-M2, 06 §4 |
| A reconciliation without a payouts line does not close to the bank | ⚠️ Inferred | Fresha's own screen fails exactly this way |
| Merchants want dashboards at all | ⚠️ Assumed | Sham's proposed SOTA A/B has not run |
| What Reception needs the day's number for | 🔴 Unknown | Nobody has asked |
| What a reporting "period" is, and whether a booking counts on booked or appointment date | 🔴 Unknown | Sham raised it in Jul, unanswered |

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| CSV and Excel first, analytics dashboards as v2 | Maaz + Michelle, 29 Jul 2026 | ADR-024, two approvals in #reports | Compliance tally is the hard requirement, dashboards are the nice-to-have. Reopening it costs the Tier 2 gate |
| Tip is **not** taxed | — | INV-M5, 06 §4 | A blended tip and tax figure in a report is a defect, not a preference |
| Deposit is deferred revenue until render | — | INV-P10, ADR-013 | Recognizing at capture misstates books and VAT |
| Service staff cannot see money reports | — | INV-A2 | Role law, not a report setting |
| Storage basis is VAT-inclusive, derived not appended, rounded once per line | — | 06 §4, §7, INV-M2 | Settles EC-32's **storage** half. Only the display toggle is open |
| Scope is POS and booking analytics, not full accounting | — | `product.md` | Opex belongs in QuickBooks or Xero |
| Reports read, they do not recompute | — | 06 §10 | A report that recalculates money is a second source of truth |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| 06 §4 | Amount due and taxable gross are two figures, always. This is the whole of `RP-B2` |
| INV-M1, INV-M2, INV-M5 | Taxable gross is derived from lines, VAT from gross, tip outside the base |
| INV-P9 | Invoices are VAT-compliant, so exports built from them must be too |
| INV-P10, ADR-013 | Deposit is a liability until render |
| INV-A2, INV-A1 | Staff out of money, roles define the rest |
| INV-01, INV-03 | Financial records are append-only, balances are derived. A report never reads a stored balance |
| INV-08 | Void and refund rows carry the actor and the reason |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| ADR-024 | Ship 3 to 4 must-have CSV reports now | Ship **five**: add the refund and void log and the VAT summary | ⚠️ **Amend ADR-024.** Michelle's condition 2 already says this; the record's own table still says 3 to 4 |
| EC-32 | Storage basis settled, display toggle unspecified | A tax inclusive versus exclusive **display** toggle is required for local accounting | 🔴 **Needs an ADR before the VAT summary is built** |
| EC-30 | Cancellation fees not tracked as income | Decide: non-refundable income, or refund liability | 🔴 **Needs an ADR.** It changes the revenue formula |

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Merchants closing a month without support intervention | 🔴 no merchant has closed a month on Cami | Every live account, unaided | First month end after ship |
| Accountant queries returned per export | 🔴 unmeasured | Zero for VAT structure. Content questions are fine | First filing |
| Reports named as a blocker in a Tier 2 sales conversation | Currently a named gap | Zero | Next Tier 2 pitch |

**Leading** (pre-launch signals)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| One real day reconciles from the five files | Take a pilot day, hand it to GNK, ask them to tally it | They tally it without asking for a sixth file |
| `RP-B2` fix verified | Produce a day with tips and compare the VAT figure against a hand calculation | They match to the fils |
| Formula sign-off on EC-30 and EC-32 | GNK confirms in writing | Confirmed. **Until then the word "compliance" is not used** |
| Dashboard A/B | Show SOTA both the CSV set and the dashboard prototype | Tells us whether v2 is worth building, before Anum builds it |

---

## Proposed solution

### How it works

- Money and booking events land in **event-grain fact tables**, one row per sale line or appointment, never as pre-aggregated totals.
- Reports read those facts. They never recompute money, and they never read a stored balance (INV-03).
- Five downloadable files make up the first slice, locked to the Michelle and Linear designs.
- Two figures appear wherever a tip can exist: **taxable gross** and **amount due**. No screen and no file carries a bare "total".
- Existing dashboard screens ship as basics only if the architecture decision allows, otherwise they wait. This is Open Question 3.

### The five files

| File | Answers | Why it is in the set |
|---|---|---|
| **Sales log, detailed** | What was sold, line by line | ADR-024 must-have |
| **Payments log** | How it was paid, by tender and rail | ADR-024 must-have |
| **Tips collected** | Tips, separated from the taxable bill | ADR-024 must-have, and the visible half of `RP-B2` |
| **Refund and void log** | What was reversed, by whom, and why | 🔴 **Added.** A day with a refund does not reconcile without it (INV-08, INV-04) |
| **VAT summary** | Output tax for the period, derived per line | 🔴 **Added.** The compliance claim rests entirely on this file |

### User stories (the feature-level use cases)

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `RP-A1` | `JOB-OWN-KNOW1` | Owner | today's take | I know the day without calling anyone | The figure equals the sum of that day's **completed** sales, not a rolling view | Read-only |
| `RP-A2` | `JOB-OWN-KNOW3` | Owner | an export my accountant accepts | they do not rebuild it | A VAT-clean file where tip and tax are never blended | Read-only |
| `RP-A3` | — | Manager | staff blocked from money | a stylist cannot read the shop's revenue | Blocked in the UI, on GET, **and on the export API** | Read-only |
| **`RP-A4`** *(minted)* | `JOB-OWN-KNOW3` | Owner | a refund and void log | a day with a reversal still reconciles | Every reversal appears with actor, reason, and original sale | Read-only |
| `RP-B1` | `JOB-OWN-KNOW3` | Owner | deposits shown as liability | I do not book money I have not earned | Deposits are split from recognized revenue until render | Read-only |
| `RP-B2` | `JOB-OWN-KNOW5` | Owner | tip separate from the taxable bill | my VAT return is correct | Two figures on receipts, exports, and summaries whenever a tip exists | Read-only |
| **`RP-B3`** *(minted)* | `JOB-OWN-KNOW5` | Owner | a VAT summary for a period | I can file from it | Output tax derived per line at `gross × 5 / 105`, rounded once, summing to the period figure | Read-only |
| **`RP-D1`** *(minted)* | — | Cami | no reportable event lost or double-counted | the numbers are the numbers | A deliberate outage replays with zero missing and zero duplicate rows, including two lines of one product in one sale | Read-only |
| `RP-C1` | `JOB-OWN-KNOW4` | Owner | captured versus booked | I know what share of my business this covers | 🔴 **Deferred from this slice.** Named, not built | — |

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Reports list | Default | Five downloadable files, with the period selector | ADR-024 as amended |
| Any money figure | Always | A label naming its scope: point-in-time or period, gross or net, of what | 06 §4, and the Fresha two-balances defect |
| Export, tip present | Always | Taxable gross and amount due as separate columns | INV-M3, INV-M5 |
| Reports, staff account | Blocked | Nothing, in the UI and from the API | INV-A2 |
| Reports, reception account | ? | 🔴 Undecided. Open Question 4 | INV-A1 |
| Any file, pre-sign-off | Labeled | Not described as compliance-ready until EC-30 and EC-32 land | ADR-024 conditions |

---

## Money composition

This PRD **reads** money, it never composes it. The rules it must not break:

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Taxable gross | Derived | 7 | INV-M1. Sum of `line_gross_final`, never stored independently |
| VAT | Derived | 6 | INV-M2. Per line, `gross × 5 / 105`, rounded once (06 §7) |
| Tip | Invoice | 8 | INV-M5. Outside the tax base. **Never inside a single total** |
| Amount due | Derived | 9 | INV-M3. Reported separately from taxable gross at all times |
| Deposit | Payment | 10 | INV-P10. Liability until render |

**EC-39 is this PRD's central failure mode:** a single "total" field on a receipt or export. It is currently unverified across the CSV set, which is why `RP-B2` is upstream of every file here.

---

## Permissions and roles

| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|
| View today's take | Block | ? | Allow | Allow | No |
| View money reports | Block | Block | Allow | Allow | No |
| Download an export | Block | Block | ? | Allow | **Yes.** An export leaves the building |
| View the VAT summary | Block | Block | Allow | Allow | No |
| View captured versus booked | Block | Block | Allow | Allow | No |

🔴 **Two "?" rows, both open since the guide was written.** Reception's depth cannot be answered without knowing what Reception needs the number for, which is `JOB-RCP-KNOW1`, which has no source. **Ask Queenie, then fill the row.**

⚠️ **Export attribution is proposed here, not existing.** A downloaded file is the one report action with an outside-the-building consequence.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| EC-39 | A single "total" field produces a wrong return | ✅ Two figures everywhere, `RP-B2` and `RP-B3` | — |
| EC-32 | Tax inclusive versus exclusive | ⚠️ Storage settled. **Display toggle blocked on an ADR** | New ADR |
| EC-30 | Cancellation fee as revenue or liability | 🔴 **Blocked.** No rule exists, and it changes the formula | New ADR |
| EC-36 | Duplicate line items break the idempotency key | ✅ `RP-D1` | — |
| EC-37 | Event loss between commit and queue | ✅ `RP-D1`, outbox pattern | — |
| EC-19 | Captured versus booked | 🔴 **Deferred.** `RP-C1` stays Missing | Next slice |
| EC-31 | Gift card breakage | 🔴 Deferred. An income gap, not a day-close blocker | Post-CSV |
| EC-33 | Commissions and payroll | 🔴 Out of scope. Accounting territory | QuickBooks or Xero |
| EC-34 | Card tips versus cash tips | ⚠️ Tips file should split them. Not currently distinguished | Named in the file spec |
| EC-35 | COGS and product margin | 🔴 Out of scope for this slice | Phase 2 inventory |
| EC-40 | Pro-rata cart discount fils residue | ✅ Inherited. Reports read what the Composition Order produced (06 §7) | — |

---

## Reporting and data

The whole PRD is this section, so it names the **ingestion** requirements rather than restating the files:

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `sale.line.completed` with `line_gross_final`, discounts, and package redemption flag | Per line | Sales log, VAT summary | Existing data, new fact table |
| `taxable_gross` and `amount_due` as separate persisted fields | Per sale | VAT summary, tips file. **Blocks `RP-B2`** | New |
| `payment.captured` with tender, rail, provider, and the rate stored on the transaction | Per capture | Payments log, HQ Partner Dashboard | Rate field new |
| `refund.issued` and `sale.voided` with actor, reason, and original sale id | Per reversal | Refund and void log | New |
| `deposit.captured` flagged as liability, and `deposit.recognized` at render | Per deposit | `RP-B1` | New |
| Booked value against captured value | Per account per period | `RP-C1`, deferred, but **the fields must land now** | New |
| Transactional outbox with replay, backfill, idempotency, and dead-letter | Infrastructure | All of them | New. EC-37 |

**The captured-versus-booked fields land in this slice even though the report does not.** Retrofitting them later means backfilling history that was never written.

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Analytics dashboards | ADR-024 calls them v2 | Next slice, with a real trigger |
| AI Reporting | Separate register initiative | September |
| The CamiHQ Partner Dashboard itself | Same facts, different surface and audience | BRD R8, next slice. The **pipeline** requirement is in this one |
| The wallet and float view | Neither CSV nor dashboard, and it reads settlement data | [Merchant settlement PRD](./prd-merchant-settlement-2026-08-16.md) |
| Multi-location report scoping | Blocked by INV-B4 | v0.3 |
| Full accounting, commissions, payroll, opex | Out of scope by decision | QuickBooks or Xero |
| Recomputing money | Reports read | 06 Composition Order |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| **Checkout tip persistence** (`EC-38`, Scope Rule) | 🔴 Live defect | `RP-B2` and `RP-B3`. A tip that never reached the invoice cannot be reported correctly |
| CamiPay rate stored on the transaction | 🔴 Not built | The HQ side of the fact table |
| Transactional outbox | 🔴 Designed, not built | `RP-D1`, and the trustworthiness of every file |
| Settlement payout events | 🔴 Separate initiative | The payouts line in `JOB-OWN-KNOW3`. **This slice cannot close a month to the bank without it** |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| OS Team | Fact tables, ingestion, outbox, the five files | Faisal |
| Product and design | File specs locked to the Michelle and Linear designs | Michelle + Anum |
| Finance | Formula sign-off on EC-30 and EC-32 | GNK |
| Commercial | The SOTA dashboard A/B | Sham + Maaz |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| **GNK (accountant)** | Written confirmation on tax display and cancellation-fee treatment | 🔴 Unscheduled | Ship the four non-VAT files and hold the VAT summary. Do not ship a guessed VAT figure |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | Fix `RP-B2` at source, taxable gross and amount due as separate persisted fields | Everything downstream inherits this. Nothing else should start first |
| 2 | GNK formula sign-off (EC-30, EC-32) | Gate to building the VAT summary at all |
| 3 | Fact tables and outbox | Gate to any file being trustworthy |
| 4 | The five files | Gate to calling OBJ-P4 met |
| 5 | Captured-versus-booked **fields** written, report deferred | Avoids a backfill later |

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Existing dashboard screens on mock data | 🔴 **Open Question 3.** They either ship on this pipeline or wait | Depends on the answer |
| Historical sales predating the fact tables | Backfilled where the source data supports it, and the gap is stated in the UI | Customer Success, once |
| Exports already downloaded with blended tip and tax | Superseded. **Operators who filed from them should be told** | Michelle, directly. This is a correctness issue, not a release note |
| Staff accounts hitting the export API | Blocked on deploy. The current leak closes | Nobody. It should never have worked |

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| A wrong VAT export is filed by a real merchant | **B** | 🔴 **High while `RP-B2` is Broken** | Regulatory exposure for the merchant, and the end of the compliance pitch | Fix `RP-B2` first. Do not ship a VAT summary before GNK signs off | Faisal + Michelle |
| Dashboards ship on a pipeline that then gets replaced | **F** | Medium | Anum's work is thrown away, and the architecture decision is made under sunk-cost pressure | Resolve Open Question 3 **before** any dashboard integration starts | Faisal + Maaz |
| The five files still do not close a day, because payouts belong to settlement | **B** | High | The primary job fails on the first month end, in front of the operator | Name the seam now. Sequence settlement's payout events alongside this | Michelle |
| Nobody wants the dashboards | **V** | Medium | v2 is built for nobody | Run Sham's SOTA A/B before building, not after | Sham |
| Reception's permission is guessed | **U** | Medium | Either she cannot close her shift, or she can read the owner's revenue | Ask Queenie. It is one question in a session already scheduled | Michelle |
| The captured-versus-booked fields are deferred along with the report | **F** | Medium | A backfill over history that was never written | Land the fields in this slice. Explicit in the data table | Faisal |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | **Tax inclusive versus exclusive display toggle** (EC-32) | The VAT summary, and the word compliance | Michelle + GNK | Before file specs are locked |
| 2 | **Is a cancellation fee revenue or a refund liability?** (EC-30) | The revenue formula in the sales log | Michelle + GNK | Same |
| 3 | **Ship the existing dashboard screens now, or hold until the architecture signs off?** Maaz says ship, Anum is holding | Whether current dashboard work is throwaway | Maaz + Anum + Faisal | This week |
| 4 | How much money detail may Reception see, and is export Manager or Owner? | Two rows of the permissions table | Michelle | Before build |
| 5 | What is a reporting "period", and does a booking count on booked or appointment date? | Every file's boundary | Michelle + Sham | Before file specs |
| 6 | What is a returning client? | The metric is named in the glossary and undefined | Michelle + Sham | Dashboard v2, not this slice |
| 7 | Does ADR-024 get amended to five files, or does this PRD overrule it in practice? | Nothing technically. It blocks the record staying honest | Michelle | Before sign-off |

---

## Before finalizing

- [ ] ADR-024 amended to the five-file set, or a note recording that this PRD supersedes its count (Question 7)
- [ ] GNK sign-off obtained on EC-30 and EC-32, or the VAT summary is explicitly held back (Questions 1, 2)
- [ ] Open Question 3 answered, so dashboard work is not started twice
- [ ] Permissions table has zero "?" rows (Question 4)
- [ ] `RP-A4`, `RP-B3`, `RP-D1` added to `feature-mappings/know-how/reports.md`
- [ ] The word "compliance-ready" appears nowhere in sales material until 1 and 2 close
- [ ] Engineer audit confirming `RP-B2`'s fix scope, since this PRD asserts no build state of its own

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | 2026-08-16 | ⏳ Draft |
| Engineering | Faisal | — | Pending, and gating on architecture |
| Design | Anum | — | Pending |
| Commercial | Maaz | — | Pending |
| Finance | GNK | — | **Pending, and gating the VAT summary** |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Cites `RP-A1` to `A3`, `B1`, `B2`, `C1`; mints `RP-A4` (refund and void log), `RP-B3` (VAT summary), `RP-D1` (no event lost or double-counted). **Promotes ADR-024's three conditions into the spec: five files not three, `RP-B2` fixed first, and the dashboard pipeline question resolved before any integration. Defers `RP-C1` while requiring its fields to land now, to avoid a backfill** |
