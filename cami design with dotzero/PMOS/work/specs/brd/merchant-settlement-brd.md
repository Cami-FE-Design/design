# BRD: Merchant settlement

**One question:** How does a merchant get their money, and how does Cami get paid?
**Audience:** BA, QA, engineers. Plain language on purpose.
**Companion PRD:** [prd-merchant-settlement-2026-08-20](../prd/prd-merchant-settlement-2026-08-20.md) — problem, evidence, risks, and the stakeholder case. Deliberately not duplicated: requirements and `SET-` IDs live here, the argument lives there.
**Law:** [01](../../../context/knowledge/01-product-invariants.md) INV-P2, INV-P3, INV-P9, INV-P10, INV-01, INV-03, INV-05, INV-08, INV-12 · [02](../../../context/knowledge/02-glossary.md) · [03](../../../context/knowledge/03-state-machines.md) §8, §9, §10, §14 · [04](../../../context/knowledge/04-decision-records.md) ADR-002, ADR-014 · [06](../../../context/knowledge/06-money-composition-contract.md) §6, §8
**Fills:** the gap PRO-737 named and deferred, "gateway credentials, payout accounts, batch timing. Separate surface, separate spec."
**Status:** Draft for review. **One blocker must be answered before build**, see Open decisions D1.
**Date:** 2026-08-16

---

## TL;DR

1. **Custody is split by rail.** Terminal money is held by the gateway and paid straight to the merchant. Online money is held by Cami and paid out by Cami. This is decided, and it shapes everything below.
2. **One merchant now gets two payouts** from two senders on two schedules. Our reconciliation has to show both, including the money we never held, or it repeats Fresha's mistake of reconciling a fraction of the business and looking complete.
3. **Blocker:** on terminal, Cami never touches the money, so there is nothing to deduct our fee from. Terminal is the majority of volume. **How Cami gets paid on terminal is unanswered and blocks build.**
4. **A bank account change must reach both places.** If it updates at Cami but not the gateway, half the merchant's money goes to the old account. Highest-severity bug in this spec.
5. Scope is the full lifecycle: get ready to be paid → configure → run the payout → show it → handle refunds.

---

## Words that matter

| Say this | Means |
|---|---|
| **Settlement** | The whole process of getting money to the merchant's bank |
| **Payout** | One transfer of money to the merchant's bank account |
| **Payout run** | The scheduled job that creates and sends payouts for all merchants due |
| **Float** | Money Cami is holding that belongs to a merchant. Online only |
| **Custody** | Who is actually holding the money right now. Split by rail here |
| **Settle-ready** | The merchant has everything needed to be paid. Verified bank account, legal entity, gateway onboarding done |
| **Payout destination** | The bank account the money goes to |
| **Take** | Cami's fee. The percentage from the rate card (PRO-737) |
| **Cleared** | The bank confirmed the money arrived |

Not to be confused: **Balance** already has two meanings in the glossary (remainder after a deposit; gift-card stored value). This spec adds no third meaning. Use **float** for money Cami holds and **payout amount** for money being sent.

---

## Owns / not this

| This spec owns | Point elsewhere |
|---|---|
| Getting a merchant settle-ready | **PRO-737** — rails on/off, gateway per rail, rate card |
| Where payouts go and on what schedule | **Checkout / CamiPay** — taking the money in the first place |
| Running the payout and handling failures | **Reports** — merchant-facing revenue analytics |
| Showing the merchant what they were paid | **03 §14** — whether a refund is a void or a refund |
| Refunds that touch already-settled money | **06** — how the invoice amount was calculated |

---

## The custody model

This is the fact everything else follows from.

| | **Terminal** | **Online** |
|---|---|---|
| Who holds the money | Gateway (NeoPay today) | **Cami** |
| Who pays the merchant | Gateway, direct to their bank | **Cami** |
| Cami float | None | Yes, a liability on Cami's books |
| Payout schedule set by | Gateway | **Cami** |
| Who explains a failed payout | Gateway, via Cami support | **Cami** |
| How Cami collects its take | 🔴 **Open, see D1** | Deducted before payout |
| Refund comes out of | Gateway | Cami float |

**Why this matters to the merchant:** they get two deposits from two senders, possibly on different days, for the same week's work. Nobody told them that. Our job is to make it obvious rather than confusing.

**Why this matters to engineering:** two payout paths, two failure models, two reconciliation sources. Do not build one and assume the other is a config flag.

**What does not change:** Cami still owns the commercial record on both rails (INV-P2). The gateway moves money; it does not own the invoice. Provider stays swappable per rail (INV-P3).

---

## Map of groups

| Group | Job | Start here if… |
|---|---|---|
| **A · Get settle-ready** | Merchant can legally and technically be paid | A new merchant is signed but not receiving money |
| **B · Configure payouts** | Where money goes, how often | Money is going to the wrong place or at the wrong time |
| **C · Run the payout** | Money actually moves | A payout is late, missing, or failed |
| **D · Show the merchant** | They can see and reconcile what they got | "I don't understand this deposit" |
| **E · Refunds after settlement** | Money goes back after it has already been paid out | A refund is requested on money that already left |

Requirement IDs are `SET-` + group letter + number. Priority: **Must** = pilot blocker, **Should** = needed for GA, **Later** = post-v1.

---

## A · Get settle-ready

*A merchant cannot be paid until this is done. Today there is no surface for it at all.*

| ID | What must happen | Done when | Law | Priority |
|---|---|---|---|---|
| SET-A1 | Hold the merchant's legal entity, VAT number, and address in one record | The record exists and stamps every invoice and payout document | INV-P9 | Must |
| SET-A2 | Capture a payout destination (bank account, IBAN, holder name) per merchant | Account is stored and shown masked (last 4 only) | — | Must |
| SET-A3 | Verify a payout destination before any money is sent to it | Verified state is recorded with who verified it and when | INV-08 | Must |
| SET-A4 | Show a settle-readiness state on the merchant record | Anyone in HQ can see at a glance whether this merchant can be paid, and what is missing | — | Must |
| SET-A5 | Block the payout run from paying an unverified destination | An unverified merchant is skipped, not failed, and the reason is visible | — | Must |
| SET-A6 | Record gateway onboarding state per rail | HQ can see the merchant is live with the gateway on that rail | ADR-002 | Should |
| SET-A7 | Warn when a rail is on but the merchant is not settle-ready | Same shape as PRO-737's "on but unrouted" amber warning | — | Should |

**Settle-ready means all of:** legal entity present, payout destination verified, gateway onboarding complete for at least one enabled rail.

**Note for BA:** SET-A5 says *skip*, not *fail*. A merchant who is not ready has not done anything wrong, and a failure state would generate noise for a condition that is expected during onboarding.

---

## B · Configure payouts

*Where the money goes and how often. Split by rail, because custody is split.*

| ID | What must happen | Done when | Law | Priority |
|---|---|---|---|---|
| SET-B1 | Set the payout destination for online payouts | Cami sends online money to this account | — | Must |
| SET-B2 | Push the same destination to the gateway for terminal payouts | Gateway has the same account on file, confirmed | — | Must |
| SET-B3 | **When the destination changes, both places update or neither does** | Change is applied at Cami and at the gateway, or rolled back with an error | — | **Must** |
| SET-B4 | Changing the destination requires verification again | New account is unverified until re-verified. Payouts pause, they do not go to the old account | INV-08 | Must |
| SET-B5 | Record who changed a destination, when, and from what to what | Full audit row, permanently | INV-08 | Must |
| SET-B6 | Set a payout schedule for online (daily / weekly) and a minimum amount | Online payouts follow the schedule and skip below the minimum | — | Must |
| SET-B7 | Show the gateway's terminal payout schedule read-only | Merchant can see when terminal money arrives, even though Cami does not control it | — | Should |
| SET-B8 | Schedule and destination changes apply forward only | An in-flight payout run keeps the settings it started with | INV-12 | Must |
| SET-B9 | Changing settlement config needs its own permission | Separate from rails and rates, same pattern as PRO-737 | INV-A1 | Must |

### SET-B3 is the highest-severity requirement in this spec

If a merchant changes their bank account and only one side updates, **half their money goes to the closed account**. It will not bounce visibly, it will fail days later at the gateway, and support will not know why.

**Required behavior:** the change is one operation across both systems. If the gateway update fails, the Cami-side change does not commit and the user sees an error. Do not write a partial state and reconcile later.

**QA:** this needs a test where the gateway call fails mid-change. Expected result is no change anywhere plus a clear error, not a partial update.

---

## C · Run the payout

*Online only. Terminal payouts are the gateway's job; Cami records and displays them.*

### Payout states

`Pending → Batched → Sent → Cleared`, or `Sent → Failed → Retried`.

| State | Means | Money moved? |
|---|---|---|
| Pending | Money is in float, waiting for the next run | No |
| Batched | Included in a run, amount locked | No |
| Sent | Instruction sent to the bank | Yes, in flight |
| Cleared | Bank confirmed arrival | Yes, done |
| Failed | Bank or gateway rejected it | No, money returns to float |
| Retried | A new payout created after a failure | Follows its own path |

| ID | What must happen | Done when | Law | Priority |
|---|---|---|---|---|
| SET-C1 | Run on schedule and pay every settle-ready merchant with float above the minimum | Payouts created, amounts correct, unready merchants skipped with a reason | — | Must |
| SET-C2 | Deduct Cami's take before paying out, using the rate stored on each transaction | Payout equals captured money minus take, and the take matches the rate at capture, never today's rate card | PRO-737 | Must |
| SET-C3 | Never pay out more than the merchant's float | A run cannot overdraw. Blocked with an alert if it would | INV-03 | Must |
| SET-C4 | Every payout is one row that lists the transactions it contains | Merchant and HQ can open a payout and see exactly what is inside it | INV-01 | Must |
| SET-C5 | A failed payout returns the money to float and does not silently retry | Float is restored, failure reason recorded, someone is told | — | Must |
| SET-C6 | Retry is a new payout, never an edit to the failed one | Failed row stays visible forever, retry is a separate row | INV-01 | Must |
| SET-C7 | The run is safe to re-run | Running twice for the same period does not pay twice. Idempotent by run ID | 06 §8 | Must |
| SET-C8 | HQ can see a run: who was paid, who was skipped, what failed and why | One screen answers "where is my payout" without asking engineering | — | Must |
| SET-C9 | Record terminal payouts made by the gateway | Cami stores them so the merchant sees one complete picture | — | Should |
| SET-C10 | Reconcile Cami's record against the gateway daily | Differences are surfaced, not discovered at month end | ADR-014 | Should |

**SET-C2 is the one engineers most commonly get wrong.** The take must come from the rate stored on the transaction when it was captured. Do not look up the merchant's current rate. If you do, editing a rate card silently re-prices every payout in history. PRO-737 says this and it applies here.

**SET-C10 matters more than it looks.** Terminal Phase 1 trusts a report from the device without confirming with the gateway (ADR-014). Now the gateway is also paying the merchant directly on that rail. So on terminal, Cami's record is unconfirmed **and** Cami never sees the money move. A daily reconciliation is the only thing that catches a divergence before the merchant does.

---

## D · Show the merchant

*The Omar jobs. Two payouts from two senders has to read as one clear story.*

| ID | What must happen | Done when | Law | Priority |
|---|---|---|---|---|
| SET-D1 | Show current float, and say plainly when it will be paid out | One figure, one sentence of schedule. No second figure also called a balance | — | Must |
| SET-D2 | Every money figure names its scope | Never a bare "balance" or "total". Say what it is and over what period | 06 §4 | Must |
| SET-D3 | Show payout history, both rails, labeled by source | Merchant sees "from Cami" and "from NeoPay" and understands why there are two | — | Must |
| SET-D4 | Open a payout and see what is inside it | Transactions listed, take shown, arrives at the payout amount | — | Must |
| SET-D5 | Reconciliation view includes a payouts line | The view ties to the bank. Without payouts it cannot | — | Must |
| SET-D6 | Show VAT on the reconciliation | A VAT-registered merchant can file from it | INV-P9, 06 §4 | Must |
| SET-D7 | Show money captured off Cami rails, or state clearly that it is not included | The merchant is never misled into thinking a partial view is complete | EC-19 | Should |
| SET-D8 | Itemize Cami's fees per period, downloadable | Merchant can verify and expense them | — | Should |
| SET-D9 | State the take rate in-product | Merchant does not reconstruct our fee from a bank statement | — | Should |

**SET-D2 exists because of an observed defect**, not a hypothetical. Fresha shows two different numbers both presented as the balance, because payouts are missing from their breakdown. Do not repeat it.

**SET-D5 and D7 together are the point of this group.** A reconciliation that omits payouts does not tie to the bank. A reconciliation that silently omits terminal or cash money looks complete while covering a fraction of the business.

---

## E · Refunds after settlement

*Refunding money that has already left is different from refunding money we still hold.*

| ID | What must happen | Done when | Law | Priority |
|---|---|---|---|---|
| SET-E1 | Refund on online money comes out of float | Float reduces, refund goes back to the original card | INV-05 | Must |
| SET-E2 | Refund on terminal money goes through the gateway | Cami never held it, so Cami cannot return it | INV-05, ADR-014 | Must |
| SET-E3 | If float is not enough to cover a refund, do not fail silently | Float can go negative or the refund is blocked. **Decide which, see D2** | — | Must |
| SET-E4 | A refund never returns more to a tender than that tender paid | Enforced, tested | 06 §6 | Must |
| SET-E5 | One reversal gives back once | Cash returned or entitlement restored, never both | INV-06 | Must |
| SET-E6 | Refunds are visible on the payout that carried the original money | Merchant can trace a deduction to its cause | — | Should |

**Known dependency:** gateway refunds for CamiPay-captured payments **are not built** and are already recorded as a pilot blocker (ADR-014). SET-E2 cannot ship until they exist. Flagging it here so it is not discovered late.

---

## Open decisions

**These block build. Each needs an owner and a date.**

| # | Decision | Blocks | Owner | Where it resolves |
|---|---|---|---|---|
| **D1** | **How does Cami get paid on terminal?** Cami never holds the money, so there is nothing to deduct from. Terminal is the majority of volume | C, and the revenue model | Maaz + finance, needs NeoPay | New ADR |
| **D2** | Can online float go negative? If a merchant refunds more than they hold, block the refund or allow negative and collect later | E | Finance | New ADR |
| **D3** | Who verifies a payout destination, and against what? Documents, a micro-deposit, or gateway verification | A | Ops + compliance | New ADR |
| **D4** | Is float a Cami balance-sheet liability, and does holding it need a UAE licence? | Whether online custody is viable at all | Finance + legal | Outside product |
| **D5** | One payout destination per merchant, or one per location? Multi-location is the next priority and this decides the data model | A, B | Product | ADR-009 follow-up |
| **D6** | Does the merchant see one blended view or two clearly separate rails? | D | Product + design | Design review |

### D1 in full, because it is the blocker

Options:

| Option | How it works | Risk |
|---|---|---|
| **A. Gateway deducts and remits** (recommended) | NeoPay takes Cami's fee out of terminal settlement and pays it to Cami | Needs a NeoPay commercial and technical agreement. Not in our control, and gateway-specific, which strains INV-P3 |
| B. Invoice the merchant | Cami bills monthly for terminal fees | No card on file (INV-P6), so no way to collect. Creates receivables and chasing on a free-OS product |
| C. Net it off online float | Deduct terminal fees from the merchant's online money | **Breaks on terminal-heavy merchants**, exactly our target profile. Small online float drains to zero, then negative. Do not choose this without solving D2 first |

**Recommendation: A, with B as fallback.** Only A scales with terminal volume. Start the NeoPay conversation now, because it is a commercial dependency with a lead time, not a build task.

---

## Edge cases for QA

| ID | Case | Expected |
|---|---|---|
| SET-X1 | Bank account changed, gateway update fails | Nothing changes anywhere. Clear error. **No partial state** |
| SET-X2 | Payout run executes twice for the same period | Paid once. Idempotent by run ID |
| SET-X3 | Merchant has float but is not settle-ready | Skipped with a visible reason, not failed |
| SET-X4 | Refund larger than current float | Per D2. Must not silently succeed or silently fail |
| SET-X5 | Rate card changed after capture, before payout | Payout uses the rate at capture, not the new one |
| SET-X6 | Payout fails at the bank | Money returns to float, failure recorded, someone notified |
| SET-X7 | Merchant on terminal only | No Cami payouts at all. Screens must not show an empty broken state |
| SET-X8 | Merchant on online only | No gateway payouts. Same |
| SET-X9 | Float below the minimum for several runs | Rolls forward, does not disappear, merchant can see why nothing came |
| SET-X10 | Gateway reports a terminal payment Cami has no record of | Surfaced as a difference, not silently ignored (ADR-014) |
| SET-X11 | Merchant archived or suspended with float remaining | Money is still owed. Define what happens. **Currently unspecified** |
| SET-X12 | Two refunds on the same sale at the same time | Refunded total never exceeds the original |

SET-X11 has no requirement above it. Raising it here rather than leaving it to be found in production.

---

## Dependencies

| Needs | Status |
|---|---|
| Rate stored on each transaction at capture | PRO-737 specced, backend not built |
| Gateway refunds | 🔴 Not built, pilot blocker (ADR-014) |
| Terminal server-side confirm (Phase 2) | 🔴 Planned direction only, no ticket |
| NeoPay agreement on fee remittance | 🔴 Not started, blocks D1 |
| Audit spine for attributable changes | ⚠️ Partial, PRO-737 known gap |

---

## Evidence & confidence

- ✅ **Decided:** split custody by rail, terminal at the gateway and online at Cami (Michelle, 2026-08-16)
- ✅ **Grounded:** requirements trace to existing law (01, 03, 06) and to PRO-737's deferred scope
- ⚠️ **Inferred:** the merchant-facing shape in group D comes from reading Fresha's live surfaces, not from interviewing an owner
- ⚠️ **Assumed:** that the gateway can report terminal payouts back to Cami (SET-C9, SET-C10). **Confirm with NeoPay before committing to those rows**
- 🔴 **Unknown:** everything in Open decisions

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First draft. Split custody confirmed. D1, how Cami earns on terminal, raised as the build blocker |
| 2026-08-20 | Companion PRD repointed to the rebuilt `prd-merchant-settlement-2026-08-20`. Mirror refreshed |
