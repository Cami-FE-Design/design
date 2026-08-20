# BRD: Reporting

**One question:** What must the business be able to prove about its own money, and what must Cami be able to see across every business?
**Serves objective:** **OBJ-P4** ship the Reports module CSV-first. Which serves OBJ-B1, because finance and compliance is a Tier 2 buying requirement, and lays the CamiHQ BI foundation.
**Unlocks:** Tier 2. An operator churning off Fresha cannot switch to a platform that cannot produce their VAT position.
**Companion PRD:** [Reporting CSV-first](../prd/prd-reporting-csv-first-2026-08-16.md). Problem, evidence, risks, dependencies, and sign-off live there.
**Law:** INV-P7, INV-P9, INV-P10, INV-A2, INV-01, INV-03, INV-08, INV-M1, INV-M2, INV-M3, INV-M5 · ADR-001, ADR-012, ADR-013, ADR-024 · 06 §4, §7
**Law repo:** [cami-feature-docs/business-rules](../../../cami-feature-docs/business-rules/) · use case IDs in [feature-mappings/know-how/reports.md](../../../cami-feature-docs/feature-mappings/know-how/reports.md)
**Jobs:** [jtbd-know-how](../../discovery/outputs/jtbd-know-how-2026-08-16.md) `JOB-OWN-KNOW1/3/4/5`, `JOB-RCP-KNOW1` · [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md) `JOB-AMG-OPS1/OPS2`
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **12 requirements. 8 Must, 3 Should, 1 Later.** Six trace to existing `RP-*` IDs. The other six have no IDs because the reports they describe do not exist in any guide.
2. **Hardest: R4, one number that ties to the bank.** Reconciliation needs a payouts line, and payouts are owned by the settlement initiative. This is the only requirement here that cannot be finished inside this initiative.
3. **R2 is already law and already Broken.** `06 §4` requires taxable gross and amount due as two figures. RP-B2 is **Broken** on `main`: no taxable-gross pair on reports, blended tip and tax at the till. Every VAT export built on top of that inherits the defect.
4. **Blocked until this ships:** the compliance half of the Tier 2 pitch, and Dana's entire operating view of an account. Both read the same facts.

⚠️ **Evidence:** requirements derived from Fresha's live money surfaces on the SOTA account, the #reports channel (Jul to Aug 2026), and engineering verification of RP-A through RP-C on `main` (11 Aug). **No owner, no receptionist, and no Account Manager has been interviewed about reporting.** The build state is verified. The demand is inferred.

---

## Why it is worth doing

| | |
|---|---|
| **Unlocks** | Tier 2. A finance and compliance export is a buying requirement, not a nice-to-have |
| **Costs us if we do not** | Two failures at once. Merchants cannot close a month, and Cami cannot see which accounts are capturing, which is the number the commercial model runs on (EC-19) |
| **Trigger to start** | Started. ADR-024 set the sequencing on 29 Jul. Formula sign-off is the gate on calling any of it compliance-grade |
| **Trigger to stop** | None for the merchant CSV set. The **dashboard** half stops if the SOTA A/B shows operators do not open it |

---

## Words that matter

| Say this | Means |
|---|---|
| **Table-format report** | A downloadable CSV or Excel file locked to the Michelle and Linear designs. The ship-now tier |
| **Analytics dashboard** | A visual view with flexible datapoints. v2, Fresha-derived |
| **Partner Dashboard** | The cross-merchant, portfolio-level view for CamiHQ. Not a merchant surface |
| **Event-grain** | One row per event, a sale line or an appointment. Not a pre-aggregated total |
| **Fact table** | The persisted event-grain store reports read from. Distinct from the OLTP source tables |
| **Captured volume** | What ran on Cami rails. **Not** GMV, and the difference is the point |
| **Leakage** | Booked a lot, captured little. Cash or off-platform steering |

"Balance" and "total" are banned as bare labels. Every money figure names its scope: point-in-time or period, gross or net, and of what.

---

## Owns / not this

| This initiative owns | Point elsewhere |
|---|---|
| The reporting fact tables and the ingestion path into them | **The money maths itself** → 06 Composition Order. Reports read, they do not recompute |
| Merchant-facing table reports and dashboards | **Building or taking the sale** → checkout |
| The CamiHQ Partner Dashboard, cross-merchant | **Moving card money** → CamiPay capture |
| Captured-versus-booked as a surfaced signal | **The wallet and float view** → [merchant settlement](./merchant-settlement-brd.md). It reads these facts, it is not a report |
| Who may see which money detail | **Role definitions themselves** → INV-A1, INV-A2 |
| | **Who changed a sale** → audit trail, INV-08 |

---

## Requirements

### Map of groups

| Group | What it covers | Requirements |
|---|---|---|
| **A · The numbers are right** | Correctness before presentation. Everything else inherits this | R1, R2, R3 |
| **B · A day closes** | The merchant can reconcile, file, and hand over | R4, R5, R6, R7 |
| **C · Cami can see the portfolio** | The internal BI view, on the same facts | R8, R9 |
| **D · It keeps working** | Reliability, access, and shape over time | R10, R11, R12 |

Priority: **Must** the initiative fails without it · **Should** ships if Musts land early · **Later** deferred with a trigger.
Traced: ✅ IDs exist · ⚠️ partial, gaps named · 🔴 prose only.

### A · The numbers are right

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R1 | Every report reads from **event-grain fact tables**, never from a pre-aggregated stored total, so a formula can be corrected over history without a schema change | Must | A changed VAT formula recalculates last quarter without a migration | — | 🔴 Architecture requirement, no use case IDs by nature |
| R2 | **Taxable gross and amount due are reported as two figures** wherever a tip can exist: receipts, exports, settlement reports, and the VAT summary (06 §4, INV-M5, INV-P9) | Must | A day with tips produces a VAT figure that ties, and no screen shows a single blended "total" | RP-B2 | ⚠️ **Broken.** No taxable-gross pair on reports; till blends tip and tax |
| R3 | A **deposit is reported as a liability**, not as revenue, until the service is rendered (INV-P10, ADR-013) | Must | A month with heavy deposits does not overstate recognized revenue | RP-B1 | ⚠️ **Partial.** Gift card deferred handling is right; deposit liability is not split |

**R2 is not a new requirement.** It is law from `06 §4`, it is a validated defect on `main`, and it is upstream of everything in group B. A CSV export built before R2 lands is a wrong VAT return distributed as a file, which is worse than no export, because it breaks the compliance pitch that justifies the whole initiative.

### B · A day closes

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R4 | A merchant can **reconcile a period to their bank**: deposits, balances, tips, refunds, fees, and **payouts** on one statement that sums to what landed | Must | An owner closes a month without the accountant rebuilding it, and the closing figure matches the bank | — | 🔴 No IDs. The payouts line is owned by settlement |
| R5 | The ship-now set produces **a day that reconciles**: sales log detailed, payments log, tips collected, **refund and void log**, and **VAT summary** | Must | A finance person tallies one day from the five files with no follow-up questions | RP-A2 | ⚠️ **Partial.** Export exists with a tip row, not VAT-clean. Three of the five files are undefined |
| R6 | An operator sees **today's take** matching completed sales for that day, at a glance, without an export | Must | The daily figure equals the sum of that day's completed sales, not a rolling view | RP-A1 | ⚠️ **Partial.** Day view works; not a pure completed-that-day match |
| R7 | A merchant sees **the money that did not run on Cami**, captured against booked (EC-19) | Should | An owner reads one figure and knows what share of their business the report covers | RP-C1 | 🔴 **Missing.** No captured-versus-booked path on `main` |

**R4 is the job the module actually exists for** (`JOB-OWN-KNOW3`, opportunity 16). It is also the only requirement here that cannot be completed inside this initiative, because the payouts line comes from settlement. **Two initiatives, one screen.** Name the seam now rather than discovering it at integration.

**R7 is the highest-opportunity job in the workspace with the lowest satisfaction, 1 out of 10** (`JOB-OWN-KNOW4`). It is marked Should rather than Must because a day still closes without it. It is the requirement most worth promoting if capacity appears.

### C · Cami can see the portfolio

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R8 | A **cross-merchant Partner Dashboard** shows, per Partner, captured volume, Cami revenue, and the trend | Must | An Account Manager opens one Partner and answers "is this account working" without asking engineering | — | 🔴 No IDs. Serves `JOB-AMG-OPS1` |
| R9 | The Partner Dashboard is built on the **same fact tables** as merchant reports, not a parallel pipeline | Must | The captured-volume figure a merchant sees and the one an Account Manager sees are the same number, by construction | — | 🔴 Architecture requirement |

**R9 is a correctness requirement, not an efficiency one.** `JOB-OWN-KNOW4` and `JOB-AMG-OPS2` are the same query with two audiences. Two pipelines means two answers, and the disagreement surfaces during a rate renegotiation with an operator holding their own number.

### D · It keeps working

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R10 | **No reportable event is lost** between the transactional commit and the reporting store, and a duplicate line item within one sale does not double-count | Must | A deliberate queue outage is replayed with zero missing rows and zero duplicates | — | 🔴 EC-36, EC-37. Fix planned in the ingestion redesign, not built |
| R11 | **Service staff cannot reach money reports**, and Reception's depth is an explicit, configured answer rather than an accident (INV-A2, INV-A1) | Must | A staff account gets nothing from the UI **and** nothing from the export API | RP-A3 | ⚠️ **Partial.** UI and GET block Staff; the export API policy leaks |
| R12 | Reports resolve **per location** once multi-location ships, with a roll-up that breaks down by site | Later | An owner reads branch X's day and the group's day from the same screen | — | 🔴 **Trigger:** multi-location v0.3. Currently blocked by INV-B4 |

**R11 has a live leak.** The UI blocks Staff and the export API does not. A permission that holds in one surface and not another is not a permission.

---

## Out of scope

| Not in this initiative | Why | Revisit when |
|---|---|---|
| Full accounting. Opex, rent, utilities, supplier POs | POS and booking analytics only. Opex lives in QuickBooks or Xero | Never. It is a different product |
| Staff commissions, wages, tip bands, payroll | Accounting territory (EC-33), though core to salon reporting elsewhere | A Tier 2 operator makes it a condition of signing |
| Gift card breakage as recognized revenue | An income gap, not a day-close blocker (EC-31) | After R5 lands |
| COGS and product margin | Supply price is captured, the margin calculation is not built (EC-35) | Inventory deduction ships in Phase 2 |
| AI Reporting | ADR-024 calls it v2. Separate register initiative | The CSV set is live and the fact tables are stable |
| Cami's own P&L and revenue recognition | Cami Finance's need, and **the persona is not written** | Someone interviews them |

---

## Success criteria

Targets and baselines live in the PRD. The BRD holds the pass/fail gates:

| Gate | Fails if |
|---|---|
| A VAT figure can be filed from a Cami export | Tip is inside any tax base anywhere in the file |
| A day reconciles from the ship-now set | Any of the five files is missing and the day does not close |
| A merchant and an Account Manager read the same captured volume | The two figures can differ by construction |
| Service staff cannot see money | Any surface, including an API, returns it |
| A report survives a queue outage | Any event is silently lost or double-counted |
| The word compliance is used | Before the EC-30 and EC-32 formula decisions are signed off |

---

## Open decisions

| Decision | Blocks which requirement | Owner | Where it resolves |
|---|---|---|---|
| **Tax inclusive versus exclusive display toggle** (EC-32). Storage basis is settled by 06 §4; display is not | R2, R5, and the word "compliance-ready" | Michelle + Sham + GNK | New ADR, before the VAT summary is built |
| **Is a cancellation fee revenue or a refund liability?** (EC-30) | R4, R5 | Michelle + GNK | New ADR |
| Reporting architecture: embedded versus a BI platform, independent scaling from day one or phased, data lake now or later | R1, R8, R9, and every ETA | Faisal | Held pending Faisal's sign-off. Named in goals.md |
| **Ship the existing dashboard screens now, or hold backend integration until the architecture signs off?** Maaz says ship, Anum is holding | R8, and whether current dashboard work is throwaway | Maaz + Anum + Faisal | ADR-024 needs an amendment either way |
| How much money detail may Reception see, and is export Manager or Owner? | R11 | Michelle | reports.md open decisions, both marked "?" |
| What is a reporting "period", and does a booking count on booked date or appointment date? | R5, R6 | Michelle + Sham | Unanswered since Jul |
| Definition of a returning client | R8 | Michelle + Sham | Glossary. The metric is named and undefined |

---

## Evidence and confidence

- ✅ **Validated (engineering, `main`, 11 Aug):** RP-A1, A2, A3, B1 Partial · RP-B2 **Broken** · RP-C1 **Missing**. The traced column is verified, not asserted.
- ✅ **Validated as law:** taxable gross and amount due are two figures (06 §4, INV-M5); deposit is deferred revenue (INV-P10); staff are out of money reports (INV-A2).
- ✅ **Validated as decision:** ADR-024's CSV-first sequencing, Maaz and Michelle synced 29 Jul, two approvals, no objections.
- ⚠️ **Inferred:** R4's shape, from Fresha's account summary on the live SOTA account, including the defect worth avoiding, where two different figures are both labeled as the balance because payouts are missing.
- ⚠️ **Assumed:** that merchants want dashboards at all. Sham's proposed SOTA A/B has not run.
- 🔴 **Unknown:** every demand claim. No owner, receptionist, or Account Manager has been asked about reporting.
- 🔴 **Unknown:** whether the current dashboard screens will survive the architecture decision, which is the throwaway-work risk in the open decisions above.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. 12 R-numbers across 4 groups. Promoted ADR-024's three conditions from caveats into requirements (R2 formula correctness, R5 the five-file set, R9 one pipeline). **Finding: R2 is law, is Broken on `main`, and is upstream of every export in group B** |
