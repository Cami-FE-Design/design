# Ticket pack: merchant money surfaces (UI)

**Assignee:** Husain (UI) · **DRI:** Michelle (Product)
**Date:** 2026-08-20
**Parent epic:** Merchant settlement, group D (Show the merchant) plus the group A/B config surfaces
**Requirements source:** [merchant-settlement BRD](brd/merchant-settlement-brd.md) (`SET-` IDs) · [PRD](prd/prd-merchant-settlement-2026-08-16.md)
**Benchmark:** 8 Fresha screenshots from SOTA's live account, 20 Aug 2026 (attach to Linear, see Assets)
**Law:** INV-P2, INV-P4, INV-P9, INV-01, INV-03, INV-08, INV-12 · [06 Money Composition Contract](../../context/knowledge/06-money-composition-contract.md) §4 · ADR-001, ADR-002, ADR-014

---

## TL;DR

| | |
|---|---|
| **What** | Five merchant-facing money screens: billing details, bank account, invoices and fees, account summary, transaction activity |
| **Why** | Cami captures money and has no surface telling a merchant where it is, when it lands, or what Cami charged. Settlement is currently a manual Crescent payout with no product around it |
| **Who feels it** | Omar (Owner) `JOB-OWN-PAY1`, `JOB-OWN-PAY2`, `JOB-OWN-PAY3`, `JOB-OWN-KNOW3` |
| **The one thing Fresha gets wrong** | Two different figures both presented as "balance", roughly 9x apart in the same session, because **payouts are absent from the breakdown**. Do not copy the shape without fixing this (`SET-D2`, `SET-D5`) |
| **The one thing Cami has that Fresha does not** | **Split custody.** Terminal money is paid to the merchant by the gateway; online money is held and paid by Cami. One merchant, two payouts, two senders, two schedules. Fresha has one wallet. Every screen below must survive that |
| **Not in this pack** | CamiHQ-side payout run view (`SET-C8`), payout engine, gateway integration, subscription or add-on billing (the OS is free, INV-P4) |
| **Design can start now** | Yes. Blockers D1 and D3 change values and one card's copy, not the information architecture. Design against the states, mark the two unknown cells |

---

## The Cami-vs-Fresha delta (read before drawing anything)

| Fresha does | Cami must do | Why |
|---|---|---|
| One wallet, one balance | **Two rails, labeled by who is paying** ("from Cami", "from NeoPay") | Split custody, decided 2026-08-16 |
| Deductions include Subscription and add-ons (~58% of their take) | **No subscription line.** Deductions are Cami's take plus messaging or add-on usage only | INV-P4, ADR-001, the free OS is the sales asset |
| Marketplace "New Fresha client fees" | No equivalent. Do not design a slot for it | Cami has no marketplace |
| No VAT anywhere in the money view | **VAT stated on the reconciliation and on Cami's own fee invoice** | INV-P9, `SET-D6`, `JOB-OWN-KNOW5` |
| Breakdown with no payouts line | **Payouts line is mandatory.** The view must tie to the bank | `SET-D5`. Their omission is the root of the two-balance defect |
| Silent about off-platform money | **State the scope of the figure**, or say plainly what is not included | `SET-D7`, EC-19. ~92% of SOTA's money is currently off-rail |
| Take rate discoverable only from a statement | **State the take rate in-product** | `SET-D9`, `JOB-OWN-PAY2` |
| Bank account edit is a single-system write | **Both-or-neither write across Cami and the gateway**, then re-verify | `SET-B3`, `SET-B4`. Highest-severity requirement in the spec |

---

## Global rules (apply to all five tickets)

| # | Rule | Source |
|---|---|---|
| G1 | **No bare "Balance" or "Total".** Every money figure names what it is and over what period. "Held by Cami, arriving Thu 22 Aug", not "Balance" | `SET-D2`, 06 §4 |
| G2 | **One headline figure per screen.** Two figures on one surface that could both be read as the balance is a defect, not a layout choice | `SET-D1`, observed Fresha defect |
| G3 | **Every rail-scoped figure is labeled by custodian.** Cami-held vs gateway-held is never inferred from context | Split custody |
| G4 | **Amount due and taxable gross are different numbers whenever a tip exists.** Never collapse them into one field | 06 §4, EC-39 |
| G5 | **Nothing is editable in place on a money record.** Corrections are new rows | INV-01 |
| G6 | Any state change on a money setting shows actor and timestamp | INV-08 |
| G7 | Amounts AED, 2dp, thousands separator. Negative amounts render as `- AED 1,464.09`, never parenthesized | 06 §7 |
| G8 | Terminology: **Client**, **Sales**, **Payout**, **Fee**. Never Customer, Invoice (for a sale), Settlement (merchant-facing) | Glossary |

**Merchant-facing vocabulary.** The BRD uses `float` and `settle-ready` for engineering. Merchants never see either word. Copy candidates for review: float → "On the way to your bank"; settle-ready → "Ready to get paid"; take → "Cami fee".

---

## User journey: Omar's money day

Five screens, one story. If any step forces him to call someone, the pack has failed.

| # | Moment | Screen | What he needs | Requirement |
|---|---|---|---|---|
| 1 | **Morning glance.** "Did yesterday land?" | Account summary | One figure of held money, one sentence saying when it leaves | `SET-D1` |
| 2 | "What is that made of?" | Account summary → details breakdown | Card payments in, deductions out, **payouts out**, arrives at the figure above | `SET-D5` |
| 3 | "Why are there two deposits in my bank?" | Account summary + payout history | Two rails, labeled by sender, with the gateway schedule shown read-only | `SET-D3`, `SET-B7` |
| 4 | "What was in Tuesday's payout?" | Payout detail → transaction activity | Transactions listed, fee per transaction, arrives at the payout amount | `SET-C4`, `SET-D4` |
| 5 | "What did Cami charge me?" | Invoices and fees | Per-period itemized fee statement, downloadable, with the rate stated | `SET-D8`, `SET-D9` |
| 6 | **Month close.** "Give this to my accountant" | Account summary + fee download | Reconciliation with a payouts line and a VAT figure. Ties to the bank | `SET-D5`, `SET-D6`, `JOB-OWN-KNOW3` |
| 7 | **Rare and high stakes.** "I changed bank" | Bank account | Change is hard, verified, attributable, and reaches both custodians or neither | `SET-B3`, `SET-B4`, `SET-B5`, `JOB-OWN-PAY3` |

**Entry points.** Steps 1 to 4 must be reachable from the topbar wallet in two clicks or fewer. Step 7 lives in Settings and should be slow on purpose.

---

## Ticket 1 · Settings > Billing details

**Goal:** hold the merchant's legal identity once, so every invoice, fee statement, and payout document is stamped correctly.

⚠️ **Check for duplicate before creating.** DSG-72 defers "Settings screen for TRN/address" to PRD-9. If PRD-9 already owns this screen, this ticket becomes a design pass on PRD-9's surface, not a new one.

| ID | Requirement | Done when |
|---|---|---|
| T1-1 | Company details card: business type, legal name, TRN (VAT number), registered address | All four render, empty states are explicit, not blank |
| T1-2 | Edit opens the standard takeover dialog, not an inline form | Matches `FullScreenEditDialog` pattern |
| T1-3 | TRN and legal name changes are attributable | Actor and timestamp recorded (INV-08) |
| T1-4 | Screen states plainly that these values appear on tax invoices | One line of copy, no help-center hop |
| T1-5 | Changes apply forward only. Already-issued documents keep their stamped values | INV-01, INV-12. Show this as a note in the edit dialog |

**States:** complete · missing TRN (blocks a compliant tax invoice, show why) · pending verification (if D3 lands on document verification).

**Out of scope:** invoice document rendering (DSG-72), numbering, QR payload.

---

## Ticket 2 · Settings > Bank account (payout destination)

**Goal:** the merchant's money goes where they said, and nobody else can quietly redirect it.

**This is the highest-risk screen in the pack.** `SET-B3`: if Cami updates and the gateway does not, half the merchant's money goes to a closed account and fails days later where support cannot see it.

| ID | Requirement | Done when |
|---|---|---|
| T2-1 | Show the payout destination masked: holder name, bank, last 4 only | `SET-A2` |
| T2-2 | Show a **verification state** on the account: verified, unverified, verification pending | `SET-A3` |
| T2-3 | Show which rails this account receives, and that the gateway holds a copy | `SET-B1`, `SET-B2`. Merchant understands two senders pay into one account |
| T2-4 | Change flow is a deliberate multi-step confirm, not an inline edit | `JOB-OWN-PAY3`. Friction is the feature |
| T2-5 | **Both-or-neither commit.** Gateway write fails → nothing changes anywhere, explicit error, no partial state | `SET-B3`, QA `SET-X1` |
| T2-6 | New account is unverified. **Payouts pause; they never fall back to the old account** | `SET-B4`. Needs a paused-payouts banner on the account summary too |
| T2-7 | Change history: who, when, from what to what, permanent | `SET-B5`, INV-08 |
| T2-8 | Screen is gated by its own permission, separate from rails and rates | `SET-B9`, INV-A1. Non-permitted roles see the masked account read-only |
| T2-9 | Payout schedule block: online schedule (Cami-controlled, editable) and terminal schedule (gateway-controlled, **read-only**) side by side | `SET-B6`, `SET-B7` |
| T2-10 | Minimum payout amount is visible, with what happens below it | `SET-B6`, QA `SET-X9` |

**States to draw:** verified · unverified, payouts paused · verification pending · gateway write failed (error, nothing changed) · read-only for non-permitted roles · terminal-only merchant (no Cami schedule to show, `SET-X7`) · online-only merchant (`SET-X8`).

**Open, blocks final copy:** D3, what actually verifies a destination (documents, micro-deposit, or gateway verification). Design the state, leave the method as a labeled placeholder.

---

## Ticket 3 · Invoices and fees

**Goal:** the merchant can see, verify, and expense what Cami charged them, without reconstructing it from a bank statement.

**Cami's version is a different document from Fresha's.** Fresha bills subscription plus fees. Cami's fee statement carries processing margin (and later, messaging or add-on usage) only. Cami charges a UAE business, so **Cami's own fee invoice is a tax invoice and shows VAT**.

| ID | Requirement | Done when |
|---|---|---|
| T3-1 | Period-grouped list (month headings), newest first, with a period filter | Matches the Fresha shape, which works |
| T3-2 | Two document types per period: **fee activity** (itemized, CSV/XLSX) and **Cami tax invoice** (PDF) | `SET-D8` |
| T3-3 | Pending state for the current period, with the date the document becomes available | Fresha does this well, copy it |
| T3-4 | Fee activity itemizes **every fee line to its appointment or sale reference** | `SET-D8`, `JOB-OWN-PAY2`. A fee with no traceable cause reads as skimming |
| T3-5 | The **take rate in force is stated on the screen**, not only inside the download | `SET-D9` |
| T3-6 | Fee lines use the rate **stored on the transaction at capture**, never the current rate card | `SET-C2`, QA `SET-X5`. Display consequence: a historical statement never changes after a renegotiation |
| T3-7 | Terminal fees appear here too, or the screen states explicitly that they do not | Depends on D1. Draw both variants |
| T3-8 | VAT stated on Cami's fee invoice | INV-P9 |

**States:** populated · first period (no history yet) · pending current period · terminal-only merchant (per D1 outcome).

**Open, changes one card:** D1, how Cami collects its take on terminal. Option A (gateway deducts and remits) means terminal fees appear here as a reported line. Option B (invoice the merchant) means they appear as a payable. **Design both, ship the one D1 picks.**

---

## Ticket 4 · Account summary

**Goal:** one screen that answers "what is mine, where is it, and when does it arrive", and that an accountant can close a month from.

**This is the screen where Fresha's defect lives.** Their wallet header and their account summary disagree by roughly 9x because payouts are missing from the breakdown. Cami's version is not correct until the breakdown arrives at the headline figure.

| ID | Requirement | Done when |
|---|---|---|
| T4-1 | Period selector (month to date, last month, custom), applied to everything below | Fresha shape |
| T4-2 | **One headline figure**, scoped in words: what it is, who holds it, when it leaves | `SET-D1`, `SET-D2`, G1, G2 |
| T4-3 | Summary tiles: money in, deductions, **payouts**, adjustments | `SET-D5`. Payouts is the tile Fresha omits |
| T4-4 | Details breakdown reconciles top to bottom and **arrives at the headline figure** | The arithmetic is visible, not implied |
| T4-5 | Deductions itemized: Cami fee, messaging or add-on usage, refunds. **No subscription line** | INV-P4 |
| T4-6 | **Rail split is legible.** Cami-held and gateway-paid money are distinguishable, with the gateway's schedule shown | `SET-D3`, `SET-B7`. Exact form pending D6 |
| T4-7 | **VAT figure on the reconciliation** | `SET-D6`, INV-P9 |
| T4-8 | Scope statement: what this view does and does not include (cash and off-rail money) | `SET-D7`, EC-19 |
| T4-9 | Banner when payouts are paused (unverified destination) or the merchant is not ready to be paid | `SET-A4`, `SET-A5`, `SET-B4`. Skipped is not failed, copy must not read as an error |
| T4-10 | Export the reconciliation for the accountant | `JOB-OWN-KNOW3`. Format defers to the reporting CSV set (ADR-024) |

**States:** healthy · payouts paused · not settle-ready · below minimum for several periods (`SET-X9`, money rolls forward and the merchant can see why nothing came) · terminal-only (`SET-X7`) · online-only (`SET-X8`) · zero activity.

**Open, changes the layout:** D6, one blended view or two clearly separate rails. **Draw both, take to design review.** Recommendation to test: one headline for money Cami holds (the only figure Cami controls the timing of), with gateway money as a labeled secondary section, because blending two custodians into one number recreates the two-balance defect from the other direction.

---

## Ticket 5 · Transaction activity and transaction detail

**Goal:** the itemized feed under the number. Omar's report has an emotional job, proving the chaos is gone, so never summarize the day away.

| ID | Requirement | Done when |
|---|---|---|
| T5-1 | Reverse-chronological feed grouped by day, **with a daily subtotal** | Fresha shape, works |
| T5-2 | Every row: type, counterparty or reference, amount with direction, time | Money in and money out are distinguishable without reading the sign |
| T5-3 | Row types cover: deposit, balance capture, refund, Cami fee, payout, adjustment, messaging or add-on charge | Fee and its originating payment are visibly paired |
| T5-4 | Row opens a **transaction detail** panel: date, appointment or sale reference (linked), channel, location, payment method, period, from, to | Fresha's detail modal is the right field set. Keep the linked reference |
| T5-5 | Detail states **which rail and which custodian** | Split custody, G3 |
| T5-6 | Filter by type, rail, date range, location | Location filter is forward-compatible with multi-location (OBJ-P6) |
| T5-7 | **Payout rows open the payout**, listing every transaction inside it and arriving at the payout amount | `SET-C4`, `SET-D4` |
| T5-8 | A refund is visible on the payout that carried the original money | `SET-E6` |
| T5-9 | Failed payout renders as a permanent row with its reason, and the retry is a **separate row** | `SET-C5`, `SET-C6`, INV-01. Never an edited row |
| T5-10 | Gateway-reported terminal payments appear in the feed, marked as reported rather than confirmed | `SET-C9`, ADR-014. Terminal Phase 1 trusts a device report |

**States:** populated · empty (new merchant) · loading and pagination · failed payout · reported-not-confirmed terminal row · filtered-to-zero.

---

## Sequencing for Husain

| Order | Ticket | Why this order |
|---|---|---|
| 1 | **Ticket 4, account summary** | It is the screen the whole model has to survive. Get the rail split and the payouts line right and the rest follows |
| 2 | **Ticket 5, activity and detail** | Same data model, drills out of ticket 4 |
| 3 | **Ticket 2, bank account** | Highest severity, but self-contained, and its states depend on D3 |
| 4 | **Ticket 3, invoices and fees** | Blocked on D1 for the terminal variant |
| 5 | **Ticket 1, billing details** | Smallest, and may already belong to PRD-9 |

---

## Open decisions that touch this pack

| # | Decision | Which ticket | Owner | Effect if unanswered |
|---|---|---|---|---|
| **D1** | How Cami collects its take on terminal | 3, 4 | Maaz + finance, needs NeoPay | Ticket 3 ships one of two variants. Terminal is the majority rail |
| **D3** | What verifies a payout destination | 2 | Ops + compliance | Ticket 2's verification copy is a placeholder |
| **D6** | Blended view or two separate rails | 4 | Product + design | Ticket 4's layout. **Decide at design review, both drawn** |
| **D5** | One payout destination per merchant or per location | 2 | Product | Ticket 2's data shape once multi-location lands (OBJ-P6) |
| — | Does the merchant-facing wallet live in the topbar, in Settings, or both | all | Design | Entry points for journey steps 1 to 4 |

---

## Acceptance criteria (pack level)

1. A merchant can answer "what is held, when does it land, what was in it, what did Cami charge" without leaving these five screens.
2. The account summary breakdown **arrives at the headline figure**, payouts included.
3. No screen shows two figures that could both be read as the balance.
4. Every money figure is scoped in words.
5. Two rails are distinguishable everywhere money is shown.
6. A VAT figure appears on the reconciliation and on Cami's fee invoice.
7. The bank-account change flow has a drawn state for "gateway write failed, nothing changed".
8. Terminal-only and online-only merchants both have complete, non-broken screens.

---

## Assets to attach in Linear

Eight Fresha screenshots from SOTA's live account, 20 Aug 2026. Save to `docs/specs/assets/` with these names:

| File | Shows |
|---|---|
| `fresha-invoices-and-fees.png` | Period-grouped fee activity and invoice list, pending state |
| `fresha-bank-account.png` | Masked payout destination |
| `fresha-billing-details.png` | Legal entity, VAT, address |
| `fresha-account-summary-top.png` | Headline balance, three tiles, breakdown start |
| `fresha-account-summary-bottom.png` | Full deductions and adjustments breakdown, total |
| `fresha-wallet-activity.png` | Wallet drawer, activity feed with daily subtotal |
| `fresha-transaction-detail-fee.png` | Fee transaction detail modal |
| `fresha-transaction-detail-deposit.png` | Deposit transaction detail modal, linked client |

⚠️ **Redact before sharing beyond the team.** These are a live SOTA account: real amounts, client name (Shauna Marah), bank last-4, and VAT number.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-20 | First draft. Five tickets scoped from the Fresha benchmark against the merchant-settlement BRD |
