# JTBD: Omar (Owner), money visibility and payout
**Date:** 2026-08-16 · **Persona:** Omar (Owner). Secondary: Layla, Cami finance. **Source:** Fresha Payments / Wallet / Billing screens from the **live SOTA account** (Sota Hair and Beauty L.L.C, AED, RAK Bank).

---

## TL;DR
1. **Fresha is sold to SOTA as a subscription, not a free payments-led OS.** Over 16 days, subscription was 2.6x card fees. `competitors.md` says the opposite. Correct it, and treat Cami's free OS as a real differentiator rather than a copied model.
2. **Winning SOTA's money means the terminal.** Deposits are ~8% of their GMV. Matching Fresha's revenue needs ~51% captured. No deposit policy closes that gap. ADR-003 treats the terminal as "later".
3. **Fresha's reconciliation screen has a naming defect worth learning from.** Two different figures are both presented as the balance, because payouts are missing from the breakdown. Same trap as EC-39.
4. **Three Omar jobs are missing from** `personas.md`**:** float visibility, fee legibility, payout-destination integrity.

⚠️ **Evidence type:** competitor UI, not user research. Nobody was interviewed. Job existence is high-confidence (Fresha built it because operators need it). Scores are a hypothesis. Validate with the SOTA owner before using to prioritize.

---

## The numbers
SOTA account summary, **month to date on 16 Aug, so 16 days**.

<table class="companion-table" style="min-width: 100px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Card payments</p></th><th colspan="1" rowspan="1"><p></p></th><th colspan="1" rowspan="1"><p>Deductions</p></th><th colspan="1" rowspan="1"><p></p></th></tr><tr><td colspan="1" rowspan="1"><p>Sales</p></td><td colspan="1" rowspan="1"><p><strong>nil</strong></p></td><td colspan="1" rowspan="1"><p>Card payment fees</p></td><td colspan="1" rowspan="1"><p>~22%</p></td></tr><tr><td colspan="1" rowspan="1"><p>Client tips</p></td><td colspan="1" rowspan="1"><p><strong>nil</strong></p></td><td colspan="1" rowspan="1"><p>New Fresha client fees</p></td><td colspan="1" rowspan="1"><p>~15%</p></td></tr><tr><td colspan="1" rowspan="1"><p>Deposits</p></td><td colspan="1" rowspan="1"><p>100% of inflow</p></td><td colspan="1" rowspan="1"><p>Message credits</p></td><td colspan="1" rowspan="1"><p>~5%</p></td></tr><tr><td colspan="1" rowspan="1"><p>Refunds</p></td><td colspan="1" rowspan="1"><p>~0.5% of deposits</p></td><td colspan="1" rowspan="1"><p><strong>Subscription &amp; add-ons</strong></p></td><td colspan="1" rowspan="1"><p><strong>~58%</strong></p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>Total</strong></p></td><td colspan="1" rowspan="1"><p><strong>~99.5% of deposits</strong></p></td><td colspan="1" rowspan="1"><p>No-show protection / terminal / booking fees</p></td><td colspan="1" rowspan="1"><p>nil</p></td></tr><tr><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p></p></td><td colspan="1" rowspan="1"><p><strong>Total</strong></p></td><td colspan="1" rowspan="1"><p><strong>100%</strong></p></td></tr></tbody></table>

Inflow and deduction columns are each expressed as shares of their own total. Arithmetic ties to the account-summary balance. Monthly run-rate ×1.94.

<table class="companion-table" style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Derived</p></th><th colspan="1" rowspan="1"><p>Figure</p></th></tr><tr><td colspan="1" rowspan="1"><p>GMV basis (deck, EC-18)</p></td><td colspan="1" rowspan="1"><p>~2x the Tier 2 GMV floor</p></td></tr><tr><td colspan="1" rowspan="1"><p>Deposits as share of GMV</p></td><td colspan="1" rowspan="1"><p><strong>~8%</strong></p></td></tr><tr><td colspan="1" rowspan="1"><p>Fresha revenue from SOTA</p></td><td colspan="1" rowspan="1"><p>~1.3% of GMV</p></td></tr><tr><td colspan="1" rowspan="1"><p>Volume Cami must capture at 2.5% to match</p></td><td colspan="1" rowspan="1"><p><strong>~51% of GMV</strong></p></td></tr></tbody></table>

Nil sales and nil terminal purchase mean SOTA captures deposits only. Balances run on their own bank machine. That is what Cami's terminal displaces, not a Fresha device.

---

## Jobs
Scored against Fresha-today. Opportunity = Importance + (Importance − Satisfaction).

### Functional
<table class="companion-table" style="min-width: 100px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Job</p></th><th colspan="1" rowspan="1"><p>Imp</p></th><th colspan="1" rowspan="1"><p>Sat</p></th><th colspan="1" rowspan="1"><p>Opp</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>F1</strong> When money is held but not yet in my bank, see the balance and when it leaves, so I can plan cash flow.</p></td><td colspan="1" rowspan="1"><p>9</p></td><td colspan="1" rowspan="1"><p>6</p></td><td colspan="1" rowspan="1"><p>12</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F2</strong> When I see a charge I do not recognize, trace it to the appointment and client in one click.</p></td><td colspan="1" rowspan="1"><p>9</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>10</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F3</strong> When I close the month, reconcile card payments, refunds, fees, and payouts to my balance, so my accountant does not rebuild it.</p></td><td colspan="1" rowspan="1"><p>10</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>12</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F4</strong> Filter the ledger by transaction type and date, so I isolate one question without exporting.</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>8</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F5</strong> Get platform fees itemized and downloadable per billing period, so I can verify and expense them.</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>8</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F6</strong> Hold my legal entity, VAT number, and address once, stamped on every document.</p></td><td colspan="1" rowspan="1"><p>9</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>10</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>F7</strong> Change my payout destination without breaking anything, and make it hard for anyone else to.</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>7</p></td><td colspan="1" rowspan="1"><p>9</p></td></tr></tbody></table>

### Emotional and social
<table class="companion-table" style="min-width: 100px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Job</p></th><th colspan="1" rowspan="1"><p>Imp</p></th><th colspan="1" rowspan="1"><p>Sat</p></th><th colspan="1" rowspan="1"><p>Opp</p></th></tr><tr><td colspan="1" rowspan="1"><p><strong>E1</strong> Feel the money is accounted for to the fils, so I stop carrying a running total in my head.</p></td><td colspan="1" rowspan="1"><p>10</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>12</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>E2</strong> Feel confident the file I hand my accountant will not come back with questions.</p></td><td colspan="1" rowspan="1"><p>9</p></td><td colspan="1" rowspan="1"><p>7</p></td><td colspan="1" rowspan="1"><p>11</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>E3</strong> Feel it is difficult for anyone to redirect my money, including my own staff.</p></td><td colspan="1" rowspan="1"><p>9</p></td><td colspan="1" rowspan="1"><p>7</p></td><td colspan="1" rowspan="1"><p>11</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>E4</strong> Feel the fee was disclosed, not discovered.</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>6</p></td><td colspan="1" rowspan="1"><p>10</p></td></tr><tr><td colspan="1" rowspan="1"><p><strong>S1</strong> Be the owner who produces records immediately, seen as running a real company.</p></td><td colspan="1" rowspan="1"><p>8</p></td><td colspan="1" rowspan="1"><p>7</p></td><td colspan="1" rowspan="1"><p>9</p></td></tr></tbody></table>

**Evidence, by pattern:** persistent wallet balance + one-sentence payout rule (F1) · clickable appointment reference and client name on every transaction (F2) · account summary with details breakdown (F3, E2) · 10 transaction types + custom date range (F4) · monthly XLS fee activity + PDF invoice (F5, S1) · legal entity with VAT TRN held once (F6, S1) · "Replace bank account" gated behind documents and verification (F7, E3) · daily subtotals and every fee paired to its deposit, nothing summarized away (E1) · "3.00% + AED 0.75" stated in settings (E4).

---

## What this changes
### 1\. Reconciliation is the real reports destination (F3 + E1)
Fresha's summary is well built, sums correctly, and reflects **~8% of the business**. A reconciliation that silently omits the uncaptured majority still looks complete. Cami's version needs:

- Deposit, balance, tip, refund, and fee for one appointment on one line, summing to what hit the bank.
- A **payouts line**, so it closes to the wallet.
- **VAT**, and amount due separated from taxable gross (INV-P9, 06 §4). Fresha carries no VAT figure anywhere in the breakdown.
- An answer to EC-19: show the owner the money that did *not* come through Cami.

Sharpens ADR-024 condition #2. Refund/void log and VAT summary are not additions to the must-have set, they are rows without which this screen cannot exist.

### 2\. Two figures both called the balance
<table class="companion-table" style="min-width: 75px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody><tr><th colspan="1" rowspan="1"><p>Surface</p></th><th colspan="1" rowspan="1"><p>Label</p></th><th colspan="1" rowspan="1"><p>Figure</p></th></tr><tr><td colspan="1" rowspan="1"><p>Wallet header</p></td><td colspan="1" rowspan="1"><p><em>(the balance)</em></p></td><td colspan="1" rowspan="1"><p>baseline (1x)</p></td></tr><tr><td colspan="1" rowspan="1"><p>Account summary</p></td><td colspan="1" rowspan="1"><p><strong>Current balance</strong></p></td><td colspan="1" rowspan="1"><p><strong>~9x the header figure</strong></p></td></tr></tbody></table>

Same session, same account, no reconciliation between them, because **payouts are absent from the breakdown**. The figure labeled "current balance" is a period net.

**Rule for Cami's reporting spec:** every money figure names its own scope. Point-in-time or period, gross or net, and of what. No bare "balance", no bare "total". Generalizes 06 §4.

### 3\. Ship a wallet before a dashboard (F1 + E1)
Not in ADR-024's sequencing, and it is neither CSV nor dashboard. Balance, payout rule in one sentence, feed with daily subtotals, fee adjacent to the transaction that caused it. Reads from the same event-grain fact tables as reports, so it costs one query shape. Cheapest thing that makes a free OS feel like a financial institution.

### 4\. Publish the take rate in-product (E4)
Fresha states "3.00% + AED 0.75" in settings and attaches every fee to an appointment. Cami's 1.8 to 3.5% lives in a contract. On a free OS the fee **is** the commercial relationship; if the operator reconstructs it from a bank statement, "free" reads as bait. Risk to weigh: it also arms operators at the 3.5% end to compare. Make that a decision, not an accident.

---

## Against `personas.md`
**Confirms:** VAT-ready books without a scramble. And "an Owner report's real job is emotional" — Fresha never summarizes the day away, the itemized feed always sits under the number.

**Expands, three new jobs:** float visibility (F1), fee legibility as trust (E4), payout-destination integrity (F7, E3). All payments-led jobs a booking-tool persona would not have.

**Complicates:**

- Omar is framed around cross-branch visibility. Everything here is one location. But the Billing nav has a **Locations** link and the wallet URL is `/wallet/all/accounts`, so Fresha likely has a multi-wallet model these screens do not show. **SOTA is single-location; Fresha's model is unobserved.** Cami's question stands either way: one wallet or nine is a fact-table decision, needed before the multi-location build (ADR-009, Chaps & Co at 9 locations).
- The marketplace fee (~15% of what Fresha extracts) is a **switching cost**. Leaving Fresha loses that acquisition channel. Cami has no marketplace and no answer. Expect it in the room.
- No-show protection line is nil: SOTA does not buy it. Mild support for ADR-018 and ADR-015.

---

## Next steps
- Confirm the ~8% deposit-to-GMV ratio against real booking volume. Also bears on EC-18, there is now a hard ratio to triangulate the ~2x vs ~3x Tier-2-floor discrepancy against
- Put the 51% figure in front of whoever owns ADR-003 sequencing
- Anonymize client name, IBAN, and VAT TRN before this circulates outside product (INV-A4)
