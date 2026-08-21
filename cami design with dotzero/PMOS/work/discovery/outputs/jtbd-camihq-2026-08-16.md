# JTBD: CamiHQ, the platform side of the money

**Date:** 2026-08-16 · **Companion to:** [jtbd-owner-2026-08-16.md](jtbd-owner-2026-08-16.md)
**Method:** every merchant-facing money surface in Fresha inverted into the platform surface that must exist behind it.
**Personas:** Account Manager, Ops, Cami finance. Per PRO-737, "only Cami staff (Account Managers, ops) touch it". None of the three are in `personas.md`.

---

## TL;DR

1. **One ledger, two signs.** Every fee row in the merchant's wallet is a revenue row in HQ. Same event. If HQ builds a separate revenue pipeline from merchant reports, they diverge and one is wrong. Both must read the **rate snapshotted on the transaction** (PRO-737's load-bearing rule).
2. **Float is a liability nobody owns.** The merchant wallet is money Cami holds and owes. Summed across partners it is a balance-sheet number, and there is no surface for it.
3. **EC-19 is an HQ job, not a merchant one.** The merchant does not care that ~92% of their volume is off-rail. Cami cares enormously, because that gap *is* the revenue model. `personas.md` calls it "the signal to watch"; the watching has to happen here.
4. **Rails and rate card are built (PRO-737, UI only, mock data). The rest of the mirror is not:** payout run, payout-destination verification, billing run, float view, revenue reporting, and how Cami collects when a partner owes Cami.
5. **"Revenue" needs a scope rule before anyone builds a dashboard.** It has four possible meanings in HQ. Same defect class as the two-balances problem in the merchant doc.

⚠️ Same evidence caveat as the companion doc: derived from competitor UI and existing Cami specs, not from interviews with Cami staff. Ask an AM and Sham before prioritizing.

---

## The inversion

| Merchant sees (Fresha/SOTA) | CamiHQ must have | State |
|---|---|---|
| Wallet balance, a live float figure | **Float held across all partners.** What Cami owes, and whether Cami holds it | 🔴 none |
| Payout schedule, daily above a stated threshold | **Payout run.** Who is due, how much, did the batch clear, what failed | 🔴 none. PRO-737 puts batch timing explicitly out of scope |
| Bank account on file, "Replace" gated behind documents | **Payout-destination verification queue.** The merchant's friction is an HQ review task | 🔴 none. Highest-risk write in the system |
| Card payment fee charged per appointment | **The mirrored revenue line**, at the rate stored on that transaction | 🔴 none |
| "3.00% + AED 0.75" in payment settings | **Rate card**, append-only, per rail, effective-dated | ✅ PRO-737 |
| Included methods, Active | **Rail on/off + gateway per rail** | ✅ PRO-737 |
| Billing details: legal name, VAT TRN, address | **KYC record + settle-readiness.** Who verified, when, is it enough to pay out | 🔴 none |
| Monthly invoice PDF + fee activity XLS, "next invoice Sep 3" | **Billing run.** Cami generates these, on a cycle, with a pending state | 🔴 none |
| Message credits, auto top-up from card on file | **Collection when a partner owes Cami.** Free OS, revenue netted from processing. What happens when add-on usage exceeds captured volume? | 🔴 none, and unspecced as a model |
| Subscription & add-ons | Not applicable by design (INV-P4). **Add-on pricing** is real though, and PRO-737 defers it | 🟡 deferred |
| Account summary, one merchant | **Partner Dashboard**, cross-merchant portfolio (product.md, Fresha's Periscope analog) | 🟡 in design |

---

## Jobs

### Account Manager

| Job | Imp | Sat | Opp |
|---|---|---|---|
| **AM1** When I open a partner, see what Cami earns from them and whether it is growing, so I know if the account is working. | 10 | 2 | 18 |
| **AM2** When a partner's captured volume is far below their booking volume, get flagged, so I can go win the balance back onto our rails. | 10 | 1 | 19 |
| **AM3** When I renegotiate a rate, change it without re-pricing history, and show the partner exactly when it starts. | 9 | 8 | 10 |
| **AM4** See my whole portfolio ranked by captured volume and by gap, so I know where to spend the week. | 8 | 1 | 15 |

### Ops and support

| Job | Imp | Sat | Opp |
|---|---|---|---|
| **OP1** When a partner asks "where is my payout", answer from one screen without asking engineering. | 9 | 2 | 16 |
| **OP2** When a payout fails, see which partner, why, and what to do, before they call. | 9 | 1 | 17 |
| **OP3** When a partner changes their payout destination, review it before money moves. | 10 | 1 | 19 |
| **OP4** Turn a partner's rails on and off as onboarding completes, without a deploy. | 8 | 8 | 8 |

### Cami finance

| Job | Imp | Sat | Opp |
|---|---|---|---|
| **FI1** Know total float held across all partners, so the liability is on the balance sheet and covered. | 10 | 1 | 19 |
| **FI2** Recognize revenue at the rate actually charged per transaction, not recomputed from today's card. | 10 | 3 | 17 |
| **FI3** Close a month across all partners: processed, earned, paid out, owed. | 10 | 2 | 18 |

Scores are unvalidated. The uniformly low satisfaction reflects that most of this surface does not exist yet, not a measured judgment.

---

## What this changes

### 1. Build revenue reporting on the snapshotted rate, or not at all

PRO-737 already states the rule and the reason:

> The rate Cami earns is snapshotted onto each transaction at capture time and stored on the sale/payment record. Reports and settlement read that stored rate. They must **never** recompute revenue from the Partner's current rate.

That rule currently protects a mock-data UI. It has to survive into the reporting pipeline, which per goals.md Product Goal 4 is being architected for merchant reports and CamiHQ BI **on the same fact tables from day one**. Concretely: the fact table needs a `rate_at_capture` column, and the Partner Dashboard reads it. Retrofitting this later silently re-rates every historical month the first time an AM edits a rate card.

### 2. Give "revenue" a scope rule now

In HQ the word means at least four different things:

| Meaning | Roughly |
|---|---|
| Gross volume processed | ~51% of GMV for a SOTA-sized partner |
| Cami's take at the stored rate | ~1.3% of that partner's GMV |
| Take net of gateway cost | less |
| Recognized revenue | less again, and deposits are deferred until service render (INV-P10) |

The merchant doc found Fresha shipping two figures both labeled "balance". HQ's version is worse because there are four. Apply the same rule before a dashboard exists: **every money figure names its scope**, and INV-P10 means a deposit-heavy partner's processed volume and recognized revenue are structurally different numbers.

### 3. The captured-vs-booked flag belongs here (AM2, EC-19)

`personas.md` says the gap between booking volume and captured volume "is the signal to watch". EC-19 has no automated flag and is marked 🔴. SOTA on Fresha is the worked example: deposits ~8% of GMV, the rest invisible.

This is the **single highest-opportunity job in the doc** and it is cheap, because both numbers already exist in Cami's own data. Appointments booked with a value, payments captured. Ratio per partner, trended, sorted. It tells an AM exactly which account to work and exactly what the conversation is, and it is the leading indicator of the processing-margin model working or not.

### 4. Payout-destination change is the fraud surface (OP3)

Fresha gates it: "you will need to provide additional information and documents for Fresha to verify any new bank account." That friction is deliberate, and it implies a review queue on their side.

Cami has no equivalent. It is the highest-risk write in the system: one field change redirects every future payout. Pair it with the merchant-side job (E3, "feel it is difficult for anyone to redirect my money") and the answer is a two-sided control, a real gate for the merchant and a review step for HQ. Related: EC-4, staff revenue-integrity risk, currently 🔴.

### 5. PRO-737 is the pattern for the rest of HQ money config

Four refusals worth copying verbatim into every surface above: no editable field on the money value, the only write appends a row, past rows have no affordance, backdating blocked at the input. Plus a separate permission for the commercial act (`billing.camipay.rates.edit`) distinct from the operational one (`billing.camipay.rails.edit`).

Apply the same shape to payout config, add-on pricing, and any credit or adjustment tool.

---

## Gaps and open questions

- **Everything above is unbuilt except rails and rate card, and even those are UI-only with mock data and no backend.** Do not read the ✅ rows as shipped capability.
- **How does Cami collect when a partner owes Cami more than Cami is holding?** Free OS, no subscription floor, revenue netted from processing. Fresha's answer is a wallet plus auto top-up from a card on file. Cami has no answer and no card on file (INV-P6). This blocks add-on monetization, which product.md counts in the reforecast.
- **One wallet or nine.** Same multi-location question as the merchant doc, from the platform side. PRO-737 declares rates at Business level and defers per-location. Payouts, float, and the billing run need the same declaration before multi-location builds.
- **Float custody.** Whose account does merchant money sit in between capture and payout, Cami's or the gateway's? Determines whether float is a Cami balance-sheet liability or a passthrough. INV-P2 says Cami owns the commercial record, not the money. Needs a finance answer, not a product one.
- **Rail toggles are not attributed** (PRO-737 known gap). Rate rows record `createdBy`, rail and gateway changes do not, and both move money. INV-08.

## Next steps

- [ ] Ask an AM and Sham which of these they do today in a spreadsheet. The spreadsheets are the spec
- [ ] Spec the captured-vs-booked flag (AM2). Highest opportunity, lowest cost, data already exists
- [ ] Get `rate_at_capture` into the reporting fact-table design before Faisal signs off the architecture
- [ ] Answer float custody with finance before specing the float view (FI1)
- [ ] Decide the collection model for add-on overage, or drop add-on revenue from the forecast
- [ ] Add Account Manager, Ops, and Finance to `personas.md`, or record deliberately that HQ personas live elsewhere
