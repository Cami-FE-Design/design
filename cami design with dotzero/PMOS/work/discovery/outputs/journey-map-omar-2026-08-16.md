# Journey Map: the Owner

**One question:** Does the money the business earned arrive, tie out, and close the month?
**Persona:** Omar, the Owner (buyer). Light daily, heavy at month end. `personas.md`.
**Scope:** Service delivered → month closed and VAT filed.
**Date:** 2026-08-16

## Context

| Source | What it gave this map |
|---|---|
| `personas.md` (Omar) | EOD revenue per branch, "no booking or payment slips through", VAT-ready books. And: an Owner report's real job is **emotional**, proving the chaos is gone |
| [jtbd-owner-2026-08-16.md](jtbd-owner-2026-08-16.md) | 12 scored jobs, the two-balances defect, the deposits-to-GMV ratio |
| Fresha/SOTA account | The only real observation of an operator's money surfaces. **Merchant side only** |
| `01` INV-P7, INV-P9, INV-P10, INV-B2 | Auto-reconciliation, VAT-compliant invoices, deposit is deferred revenue, auto deposit |
| `05` EC-19, EC-39 · `06 §4` | Captured-vs-booked gap, single-total defect, VAT derivation basis |
| `04` ADR-003, ADR-024 | Terminal sequenced later; reports CSV-first with three open conditions |

**Confidence: Medium.** Stages and pain are grounded in a live competitor account and Cami's own invariants. **No owner has been interviewed.** Everything emotional below is ⚠️ Assumed.

---

## Owns / not this

| This map owns | Point elsewhere |
|---|---|
| The merchant getting paid and closing books | **journey-map-payer** — the client handing over money |
| Where Omar loses trust in the numbers | **journey-map-payment-lifecycle** — where the ledgers diverge |
| Owner-facing money surfaces | **journey-map-account-manager** — the CamiHQ side of the same money |
| What a month close needs | **jtbd-owner** — the scored job list behind these stages |

---

## The reconciliation looks complete and covers a twentieth of the business

The finding that matters most. It is not a missing feature, it is a misleading one.

| | Figure | Source |
|---|---|---|
| SOTA deposits, per month | derived from a 16-day window ×1.94 | Fresha account summary |
| SOTA GMV | ~3x the Tier 2 GMV floor | goals.md, EC-18 closed 2026-08-16 |
| **Captured today, as share of GMV** | **~5.4%** | derived |
| Fresha revenue from SOTA | ~0.85% of GMV per month | Fresha account summary |
| **Capture needed at 2.5% to match Fresha** | **~34% of GMV** | derived |

**Consequence.** Two things follow, and they point the same way.
- A report that sums correctly over 5.4% of the business still presents as a complete picture. That is worse than showing nothing, because it invites false confidence at exactly the moment Omar is deciding whether to trust the platform.
- No deposit policy closes a 5.4% → 34% gap. Only the terminal does. ADR-003 treats the terminal as later.

> ⚠️ **Numbers corrected 2026-08-16.** Earlier versions of this map, and [jtbd-owner](jtbd-owner-2026-08-16.md), use ~8% and ~51% off the superseded ~2x-the-Tier-2-floor SOTA GMV. goals.md closed that at ~3x the floor. The conclusion is unchanged and the gap is still unbridgeable by deposits alone; jtbd-owner needs the same correction.

---

## Map of stages

| Group | Job | Start here if… |
|---|---|---|
| **A · Money comes in** | Get paid for work delivered | Captured volume is low against booking volume |
| **B · Money is held** | Know what is held and when it lands | "Is that mine yet?" · payout questions |
| **C · Books close** | Reconcile and file | Month end takes days · accountant sends it back |

---

## A · Money comes in

| # | Stage | Emotion | Pain | Law |
|---|---|---|---|---|
| A1 | Appointment completes, staff closes out | 😊 | None. Omar is usually not present | — |
| A2 | Deposit already auto-captured at booking | 😐 | The only money reliably on Cami rails | INV-B2, INV-P10 |
| A3 | Balance taken at the counter, own bank machine or cash | 😐 | **The balance leaves the platform**, and nothing flags it | EC-19 🔴 |

**A3 is the revenue leak.** Over 16 days, SOTA's account summary reads nil sales, with deposits as 100% of on-rail inflow. From Omar's seat this is not a problem, it is efficient: *"Card machine's right here, why would I send a link?"* Nothing in the product tells him otherwise, and on a processing-margin model his convenience is Cami's revenue.

**Opportunity:** the terminal is the whole fix. Same gesture he already makes, on Cami rails. See jtbd-owner §"What this changes" item 1.

---

## B · Money is held

| # | Stage | Emotion | Pain | Law |
|---|---|---|---|---|
| B1 | Checks a balance figure, wonders when it lands | 😐→😤 | **Two figures both called the balance** | EC-39 🔴 |
| B2 | Payout batch lands in the bank | 😊 | Net of fees, ties back to no screen | INV-P7 ⚠️ |

**B1, the two balances.** Fresha shows one figure in the wallet header and a figure roughly 9x larger as "Current balance" in the account summary, same session. They never reconcile, because payouts are missing from the breakdown. Fresha does one thing well here worth copying: a plain-language payout rule, "before midnight → next business day if the balance is above AED 1,000."

**B2 matters more than its emotion suggests.** Relief undercut by mild doubt is still the moment trust is established or not. There is no payout detail view to check against.

**Opportunity:** a wallet surface. One balance, the payout rule in one sentence, a feed with daily subtotals, and payout detail itemizing what each batch contained and what was deducted. Cheapest trust win available.

---

## C · Books close ← where the platform is judged

| # | Stage | Emotion | Pain | Law |
|---|---|---|---|---|
| C1 | Pulls exports, bank settlement, cash log, diary | 😤 | Multiple systems, no single truth | — |
| C2 | Reconciles, or hands the pile to an accountant | 😤 | No refund/void log, no payouts line | ADR-024 ⚠️ |
| C3 | Hands the accountant something filable | 😤 | **No VAT figure in the reconciliation at all** | INV-P9 🔴 |
| C4 | Waits to see if it comes back with questions | 😤→😊 | Rework lands here, a month after the fact | — |

**C3 is a defect, not a gap.** Amount due and taxable gross are different numbers whenever a tip exists (06 §4). One "total" column produces a wrong return. The storage basis is already settled, VAT-inclusive and derived at `gross × 5 / 105`; what is missing is exposing both figures on exports.

**C2 against ADR-024.** Sales log, payments log, and tips do not close a day. Michelle's condition #2 (refund/void log plus VAT summary added to the must-have set) is still open.

**Opportunity:** one reconciliation view. Deposit, balance, tip, refund, and fee per appointment on one line, plus a payouts line, summing to what hit the bank. Plus an honest marker for money that did not come through Cami (EC-19), so the 5.4% does not masquerade as the whole.

---

## Emotional journey

```
High  | ●
      |    ●        ●
      |       ●                    ●
Low   |             ●     ●   ●
      +----------------------------
       A1  A2  A3  B1  B2  C1-3 C4
      Deliver Deposit Balance Held Payout Close Filed
```

Starts fine, dips at Held, recovers briefly at Payout, then falls through the whole of C. The recovery at B2 matters: the pain is **not continuous, it is concentrated at month end**, which is exactly when Omar is paying attention and exactly when he decides whether the platform is worth it.

---

## Moments of truth

| Moment | Stage | Impact | State | Evidence |
|---|---|---|---|---|
| **First month close on Cami** | C | Decides whether Omar believes the platform. This report's job is emotional | 🔴 Not built to close a month | ADR-024 conditions |
| Balance taken at the counter | A3 | Every off-rail balance is revenue Cami never earns | 🔴 Terminal not shipped | Fresha summary, nil sales |
| Two balances that never tie | B1 | A money figure without a scope reads as a defect | 🔴 Payouts absent from the breakdown | EC-39 |
| First payout lands | B2 | Establishes that money moves on schedule | ⚠️ No payout detail view | Inferred |
| VAT filed without rework | C3, C4 | Converts Omar from user to advocate | 🔴 No VAT in reconciliation | INV-P9, 06 §4 |

---

## Priority opportunities

| Opportunity | Stage | Impact | Effort | Evidence |
|---|---|---|---|---|
| Reconciliation view that closes a month, with payouts and VAT lines | C | **High** | High | Fresha gap, ADR-024 |
| Terminal on Cami rails | A3 | **High** | High | 5.4% captured, ~34% needed |
| Wallet: one balance, payout rule, daily subtotals | B1 | Medium-high | **Low** | Fresha pattern, EC-39 |
| Payout detail tying the batch to its contents | B2 | Medium | **Low** | Inferred |
| Captured-vs-booked visible to the owner | A3, C | Medium | **Low** | EC-19 |

The wallet is the outlier: real emotional return for low effort, and it is absent from ADR-024's sequencing because it is neither a CSV report nor a dashboard.

---

## Connection to roadmap

| Finding | Initiative | Status |
|---|---|---|
| Balance leaves the platform | CamiPay POS Terminal (August) | ⏳ ADR-003, gated on NeoPay, treated as later |
| Month close needs refund/void + VAT | Reporting (August), CSV-first | ⏳ ADR-024, Michelle's condition #2 open |
| Deposit is not recognized revenue | INV-P10 | ✅ Settled, must show in reporting |
| Captured-vs-booked gap | — | 🔴 EC-19, no automated flag |
| Wallet surface | — | 🔴 Not on any roadmap |
| Payout visibility | CamiPay Settlements (August) | ⚠️ Merchant-facing view not specced |

---

## Assumptions to validate

- ⚠️ **Every emotion in this map.** No owner interview exists.
- ⚠️ That Omar personally does month close rather than handing it straight to an accountant. Changes which stage to design for.
- ⚠️ That he checks the wallet at all today. If he does not, the B1 pain is theoretical.
- ⚠️ That the deposits-to-GMV ratio holds for SOTA generally and is not an artifact of a 16-day window.
- ⚠️ That Fresha's subscription-heavy pricing on this account is representative, since the ~34% capture target is derived from it.

## Next steps

1. **Walk A3 through C with the SOTA owner.** Ask what he opens, in what order, at month end. Half a day closes most ⚠️ rows above.
2. **Ask his accountant what comes back with questions.** That is the real spec for C3.
3. **Put the ~34% figure to whoever owns ADR-003 sequencing.** Deposits cannot bridge it; only the terminal can.
4. **Correct jtbd-owner's 8% / 51% figures** to the closed ~3x-the-Tier-2-floor GMV basis.
5. **Spec the wallet.** Low effort, covers B1 and half of B2.
