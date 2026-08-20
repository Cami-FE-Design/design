# JTBD: Know how you did, the reporting jobs

**Date:** 2026-08-16 · **Personas:** Omar (Owner), Layla (Reception), Dana (Account Manager, cited not re-minted).
**Node:** 2 (Job) in [the chain](../../_templates/chain.md). Feeds the [Reporting BRD](../../specs/brd/reporting-brd.md) and [Reporting CSV-first PRD](../../specs/prd/prd-reporting-csv-first-2026-08-16.md).
**Source:** [jtbd-owner](./jtbd-owner-2026-08-16.md) (Fresha screens on the live SOTA account), [jtbd-camihq](./jtbd-camihq-2026-08-16.md), #reports channel (Sham, Anum, Faisal, Maaz, Jul to Aug 2026), ADR-024, EC-30 to EC-37, `06 §4`.
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **Seven jobs across three personas, four minted here.** Three already exist and are cited, not restated: `JOB-OWN-KNOW1`, `JOB-AMG-OPS1`, `JOB-AMG-OPS2`.
2. **The highest-opportunity job is `JOB-OWN-KNOW3`, close the month without the accountant rebuilding it.** It is also the one ADR-024's ship-now set cannot serve, because sales log plus payments log plus tips does not reconcile a day.
3. **`JOB-OWN-KNOW4` is the job nobody is building.** Show the owner the money that did **not** come through Cami. It is EC-19, it is the metric Dana is measured on, and it has no surface on either side.
4. **Two audiences, one pipeline.** Merchant-facing reports and the CamiHQ cross-merchant BI view read the same event-grain facts. That is an architecture consequence of the job list, not a preference.

⚠️ **Evidence:** Omar's jobs are ⚠️ inferred from a competitor's live money surfaces, not from any owner's words. Layla's reporting job is 🔴 unknown, it is the one row here with no source at all. Dana's are ⚠️ assumed. **No one has been interviewed about reporting.**

---

## Jobs

Opportunity = Importance + (Importance − Satisfaction). Scored against what each persona can see today.

### Omar, the Owner · KNOW stage

| ID | Job | Imp | Sat | Opp | Status | Evidence |
|----|-----|-----|-----|-----|--------|----------|
| `JOB-OWN-KNOW1` | "When I check on the business, I want an end-of-day revenue view per branch, so I can see what is working without calling each location." | 9 | 5 | 13 | Exists, cited | ✅ Validated |
| **JOB-OWN-KNOW3** | "When I close the month, I want card payments, refunds, fees, and payouts to reconcile to my bank balance, so my accountant does not rebuild it from scratch." | 10 | 4 | 16 | **Minted here** | ⚠️ Inferred (Fresha F3, E2) |
| **JOB-OWN-KNOW4** | "When most of my money does not run on Cami, I want to see that gap, so a report that looks complete is not covering a fraction of my business." | 9 | 1 | 17 | **Minted here** | ⚠️ Inferred (EC-19) |
| **JOB-OWN-KNOW5** | "When I hand a figure to the tax authority, I want VAT stated separately from the amount the customer paid, so a tip does not corrupt my return." | 10 | 2 | 18 | **Minted here** | ✅ Validated as law (INV-P9, INV-M5, 06 §4) |

**KNOW3 sets the real bar for the reports module.** Reconciliation, not a dashboard, is what an owner opens at month end. It needs one line per appointment carrying deposit, balance, tip, refund, and fee that sums to what hit the bank, **plus a payouts line**, or it does not close. Fresha's version omits payouts, which is why two different figures on their screen are both labeled as the balance.

**KNOW4 has the highest satisfaction gap in the workspace: 1 out of 10.** Nothing shows it, on either the merchant side or in HQ. It is the same number twice: for Omar it is "is my reporting lying to me by omission", for Dana it is "is this account capturing". One fact table serves both.

**KNOW5 is scored 18 because it is already law and still Broken.** RP-B2 is **Broken** today: no taxable-gross pair on reports, blended tip and tax at the till. `06 §4` requires both figures on receipts, exports, settlement reports, and returns. This is not a new requirement, it is an unmet one.

### Layla, the Receptionist · KNOW stage

| ID | Job | Imp | Sat | Opp | Status | Evidence |
|----|-----|-----|-----|-----|--------|----------|
| **JOB-RCP-KNOW1** | "When I close the shift, I want the day's take to match what is in the drawer and on the machine, so I can hand over without a discrepancy to explain." | 8 | 5 | 11 | **Minted here** | 🔴 Unknown |

🔴 **This row has no source.** It is the only job here derived from neither an interview nor a competitor screen. It exists because RP-A3 and the reports guide both hold an open question, *how much money detail may Reception see*, and that question cannot be answered without knowing what Reception needs the number for. **Ask Queenie before building against it.**

### Dana, the Account Manager · HQ

| ID | Job | Opp | Status |
|----|-----|-----|--------|
| `JOB-AMG-OPS1` | "When I open a Partner, I want to see what Cami earns from them and whether it is growing." | — | Exists, cited |
| `JOB-AMG-OPS2` | "When a Partner's captured volume falls far below their booking volume, I want to be told." | — | Exists, cited |

Cited, not re-minted, and not re-scored. [jtbd-camihq](./jtbd-camihq-2026-08-16.md) owns both. They appear here only because **OPS2 and `JOB-OWN-KNOW4` are the same query with two audiences**, which is the whole architecture argument below.

---

## What this changes

### 1. ADR-024's ship-now set does not close a day

ADR-024 ships three CSV reports now: sales log detailed, payments log, tips collected. Against the jobs above:

| Job | Served by the ship-now set? |
|---|---|
| KNOW3 month close | 🔴 No. A day cannot reconcile without a refund and void log and a payouts line |
| KNOW5 VAT separated | 🔴 No. No VAT summary in the set, and RP-B2 is Broken at source |
| KNOW1 daily take | ⚠️ Partial. RP-A1 shows a day view, not a completed-that-day match |
| KNOW4 leakage | 🔴 No. RP-C1 is Missing |

This is Michelle's ADR-024 condition 2 restated as demand rather than as a caveat: **refund/void log and VAT summary are not additions to the must-have set, they are rows without which the primary job fails.** The sequencing decision in ADR-024 is right; the contents of the first slice are one report short of useful and one report short of compliant.

### 2. Reporting cannot ship compliance-grade before the formula decisions land

Two open formula questions sit under KNOW5 and KNOW3:

| Open | Job it blocks | Where |
|---|---|---|
| Tax inclusive vs exclusive display toggle | KNOW5 | EC-32. Storage basis settled by 06 §4; the display toggle is not |
| Cancellation fee as revenue or refund liability | KNOW3 | EC-30. No rule exists |

A wrong VAT export is worse than no VAT export, because it breaks the compliance pitch that is a Tier 2 buying requirement (INV-P9). These block the label "compliance-ready", not the ship.

### 3. One pipeline, two audiences, decided by the job list rather than by taste

`JOB-OWN-KNOW4` and `JOB-AMG-OPS2` are captured-versus-booked, read once by a merchant for their own shop and once by an Account Manager across a portfolio. `JOB-OWN-KNOW1` and `JOB-AMG-OPS1` are the same pair for revenue.

If the merchant reports and the HQ Partner Dashboard are built on separate pipelines, those two numbers will disagree, and the disagreement will surface in a renegotiation conversation with an operator. **Architecting both on the same event-grain fact tables from day one is a correctness requirement, not an efficiency one.**

### 4. The wallet is missing from the sequence

`JOB-OWN-PAY1` (float visibility) is the daily-open job, and it is neither CSV nor dashboard. ADR-024's two-tier sequencing has no slot for it. It reads from the same fact tables, so it costs one query shape, and it is the cheapest thing that makes a free OS feel like a financial institution. Flagged here, sized in the [merchant settlement PRD](../../specs/prd/prd-merchant-settlement-2026-08-16.md), not in the reporting PRD.

---

## Scope boundary the jobs draw

| Inside | Outside |
|---|---|
| POS and booking analytics: sales, payments, tips, refunds, VAT, occupancy, returning clients | Full accounting. Opex, rent, utilities live in QuickBooks or Xero |
| Captured versus booked (KNOW4) | Staff commissions, wages, payroll (EC-33) |
| Gift card liability outstanding | Gift card breakage on expiry (EC-31, an income gap, not in the ship-now set) |
| Merchant-facing plus CamiHQ portfolio BI | Cami's own P&L and revenue recognition. That is Cami Finance's, and **the persona is not written** |

🔴 **Cami Finance and Ops/Support are named in the CamiHQ JTBD with jobs scoring 17 to 19, and neither persona exists.** Their jobs are deliberately **not** minted here. Writing them from the same secondhand sources that produced Dana would launder a second hypothesis into an ID. Interview first.

---

## Evidence and confidence

- ✅ **Validated as law:** VAT and tip must be reported as two figures (INV-P9, INV-M5, 06 §4). RP-B2 Broken is engineering-verified on `main`.
- ✅ **Validated:** ADR-024's sequencing decision (Maaz and Michelle synced, 29 Jul, 2 approvals, no objections).
- ⚠️ **Inferred:** KNOW3 and KNOW4, from Fresha's live money surfaces on the SOTA account. Nobody asked an owner.
- ⚠️ **Assumed:** every Imp and Sat score.
- 🔴 **Unknown:** `JOB-RCP-KNOW1` entirely. No source.
- 🔴 **Unknown:** what a "period" is for a report, timeslot or open-to-close, and whether a booking counts on booked date or appointment date. Sham raised it, nobody answered.
- 🔴 **Unknown:** the definition of a returning client, which is a metric already named in the glossary.

---

## Collection backlog

| Item | Owner | Status |
|---|---|---|
| Ask the SOTA owner which money screens they open, and when. Validates KNOW3 and KNOW4 | Michelle | 🔴 |
| Ask Queenie what she does with the day's take at close. Sole source for KNOW1 (Layla) | Michelle, Tue session | 🔴 |
| Interview one Account Manager, correcting the Dana entry | Michelle | 🔴 |
| Interview Cami Finance and Ops/Support, then write both personas | Michelle | 🔴 Blocks minting their jobs |
| Settle the reporting period definition and returning-client definition | Michelle + Sham | 🔴 |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Minted `JOB-OWN-KNOW3-5` and `JOB-RCP-KNOW1`. Cited `JOB-OWN-KNOW1` and `JOB-AMG-OPS1/OPS2` without re-scoring. Finding: ADR-024's ship-now set serves none of the four highest-opportunity jobs in full, and KNOW4 has a satisfaction score of 1 |
