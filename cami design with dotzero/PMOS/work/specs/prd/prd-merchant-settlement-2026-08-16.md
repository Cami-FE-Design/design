# PRD: Merchant settlement

**Status:** ⛔ **Superseded** by [prd-merchant-settlement-2026-08-20](./prd-merchant-settlement-2026-08-20.md), 2026-08-20. Kept for history. Do not cite this version.
**Owner:** Michelle (Product)
**Last Updated:** 2026-08-16
**Target Release:** Not scheduled. Blocked, see Critical Path
**Availability:** All merchants
**Rationale:** No tiers. The OS is free and revenue is processing margin (INV-P4, ADR-001), so settlement is not a feature anyone upgrades to. It is how the business model functions.

**Requirement detail lives in** [`work/specs/brd/merchant-settlement-brd.md`](../brd/merchant-settlement-brd.md) (40 `SET-` IDs, QA edge cases, written for BA/QA/eng). This document is the problem, evidence, and risk case for stakeholders. The two are deliberately not duplicated.

---

## Context

*What I found in your files:*

- **Roadmap:** **Not on it.** `product.md` has a payments track, but settlement appears only as PRO-737's explicit out-of-scope line: "Full settlement config: gateway credentials, payout accounts, batch timing. Separate surface, separate spec." That spec was never written.
- **Persona pain:** Omar's three payments-led jobs were added to `personas.md` today and all three land here. Dana (Account Manager) was added today and her journey ends low precisely at settlement.
- **Strategic fit:** `company.md` says "The checkout is the business" and revenue is margin on captured payments. Settlement is the machinery that makes captured payments into Cami revenue. Without it there is no revenue model, only a free OS.
- **Competitive:** Fresha's settlement surfaces are mature and observed working (wallet, payout schedule, itemized fees, verification-gated bank change). **This is table stakes, not a differentiator.** Cami is behind.

---

## Problem

**A merchant captures money through Cami and there is no defined way for it to reach their bank, and no defined way for Cami to get paid.**

Three people feel it:

| Who | When | What breaks |
|---|---|---|
| **Omar** (Owner) | Continuously, sharply at month end | Cannot tell held money from paid money. Cannot close a month or file VAT from what Cami shows |
| **Dana** (Account Manager) | After she finishes onboarding an account | Configuration is supported; the operating life of the account is not. She finds out a payout failed when the merchant calls |
| **Cami finance** | Every month | No view of float, no revenue at the rate actually charged, no month close across partners |

The problem sharpened on 2026-08-16 when custody was decided as **split by rail**: terminal money is held by the gateway and paid to the merchant directly, online money is held by Cami and paid out by Cami. That decision is correct for regulatory exposure and it creates the specific problem this PRD exists to solve, **including one unanswered question that blocks the revenue model** (see Open Questions Q1).

---

## Evidence

### ✅ Validated (real numbers, from a live account)

Read directly off SOTA's Fresha account summary, 16 days of August 2026. SOTA is Cami's Tier 2 anchor and is churning off Fresha.

| Line | Figure | What it proves |
|---|---|---|
| Sales | **nil** | Every balance is collected off-platform |
| Deposits | 100% of on-rail inflow | Deposits are the only thing on-rail |
| Deposits as share of GMV | **~8%** | ~92% of the money is invisible to the platform |
| Fresha subscription (16 days) | ~58% of Fresha's total take | Fresha's own settlement statement, itemized |
| Two figures both called "balance" | ~9x apart | A mature competitor still gets this wrong |

**The two-balances defect, verbatim from the observation:** Fresha's wallet header shows one figure while its account summary shows a "Current balance" roughly 9x larger in the same session. They never reconcile because **payouts are absent from the breakdown**. Source: [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md).

### ✅ Validated (internal, from specs)

- PRO-737 names settlement as deferred scope, in its own words: *"Full settlement config: gateway credentials, payout accounts, batch timing. Separate surface, separate spec."*
- Gateway refunds for CamiPay-captured payments are **not built** and are recorded as a pilot blocker (ADR-014, camipay rule 6).
- Terminal Phase 1 **trusts a device report** with no server-side gateway confirm (ADR-014, PRO-982).

### ⚠️ Assumed, flagged for validation

- **No merchant has been interviewed about settlement.** Omar's three jobs are inferred from reading a competitor's build decisions, not from anyone's words. `personas.md` marks them accordingly.
- **No Account Manager has been interviewed.** Dana is a hypothesis reconstructed from PRO-737 and from absent surfaces.
- That the gateway can report terminal payouts back to Cami at all. Confirm with NeoPay.
- That the ~8% capture ratio holds beyond a 16-day window.

**Honest summary:** the *mechanics* are well grounded in Cami's own law and specs. The *human* evidence is competitor-artifact inference. Nobody has been asked.

---

## Success Criteria

### Lagging Indicators (post-launch outcomes)

| Metric | Current | Target | Timeframe |
|---|---|---|---|
| Captured volume as share of merchant GMV | ~8% (SOTA, on Fresha) | 40%+ | 6 months post-terminal |
| Cami revenue per Tier 2 partner | nil (not settling) | ~1.3% of partner GMV, to match Fresha on SOTA | 6 months |
| Month close possible from Cami alone | No | Yes, ties to bank | At GA |
| Payout failure rate | `[PLACEHOLDER — no baseline, nothing runs yet]` | <1% | 3 months |
| Support tickets asking "where is my payout" | `[PLACEHOLDER — needs support tagging first]` | Near zero | 3 months |

**Note on the first two:** ~51% capture is what it takes to match Fresha's total extraction from SOTA at a 2.5% blend. 40% is set below that deliberately, as a first target that still proves the model.

### Leading Indicators (pre-launch signals)

| Metric | Current | Target | What this predicts |
|---|---|---|---|
| Time from signed to settle-ready | `[PLACEHOLDER — untracked]` | <5 business days | Onboarding scale, and therefore the 36-partner goal |
| Partners settle-ready but not yet capturing | 0 | Trending to 0 | Whether config actually turns into money |
| Dogfood: can finance close a month on test data | No | Yes, before beta | Reconciliation quality |
| Payout destination changes that reach both custody sides | n/a | 100% in test | Whether SET-B3 is safe to ship |
| Daily Cami-vs-gateway reconciliation differences | n/a | 0 unexplained | Terminal Phase 1 exposure is contained |

💡 The fourth row is the one to watch. If it is not 100% in test, do not launch.

---

## Proposed Solution

### How it works

Five stages, following the money.

| Stage | What happens |
|---|---|
| **1 Get settle-ready** | Legal entity, verified bank account, gateway onboarding. A merchant cannot be paid until all three exist |
| **2 Configure** | Payout destination and schedule. Destination must reach **both** Cami and the gateway, because custody is split |
| **3 Run** | Cami pays out online money on schedule, deducting Cami's take at the rate stored on each transaction. Gateway pays terminal money directly |
| **4 Show** | One clear story for the merchant: what is held, when it lands, what was inside each payout, and a reconciliation that ties to the bank and carries VAT |
| **5 Reverse** | Refunds follow the money back. Online refunds come out of Cami float, terminal refunds go through the gateway |

**The load-bearing constraint:** custody is split by rail, so a merchant receives **two payouts from two senders on two schedules** for the same week's work. Nobody has told them that. Making it legible is a design problem, not just an engineering one.

### User stories

**Story 1**
- **As** Omar, the Owner
- **I want to** see what is being held and exactly when it leaves
- **So that** I can plan cash flow without calling anyone

> Verbatim from `personas.md`: *"When money has come in but has not reached my bank yet, I want to see what is being held and exactly when it leaves, so I can plan cash flow without calling anyone."*

**Story 2**
- **As** Dana, the Account Manager
- **I want to** answer "where is my payout" from one screen
- **So that** I stop asking engineering and stop hearing about failures from the merchant

> Verbatim from `personas.md`: *"When a Partner asks where their payout is, I want to answer from one screen instead of asking engineering."*

**Story 3**
- **As** Omar
- **I want** my payout destination to be hard for anyone to change, including my own staff
- **So that** I am not exposed to a mistake or to fraud

> Verbatim from `personas.md`: *"When my payout destination changes, I want it to be hard for anyone to redirect my money, including my own staff, so I am not exposed to a mistake or to fraud."*

**Story 4, the one engineering should read first**
- **As** Omar
- **I want** my bank account change to reach every place my money comes from
- **So that** half of it does not go to a closed account

> Not from a persona. From the split-custody model. Two custody locations means two payout destinations, and a partial update sends half the money to the old account, failing days later at the gateway where support cannot see why. This is `SET-B3`, the highest-severity requirement in the spec.

---

## Non-Goals

- **Subscription or add-on billing.** The OS stays free (INV-P4). Collecting for add-on usage is a real unsolved problem and it is not this PRD.
- **Cami holding terminal money.** Custody is decided. Terminal stays with the gateway.
- **Per-location payouts.** Multi-location is the next priority but the data-model question is called out, not answered here (ADR-009).
- **Merchant-facing revenue analytics.** Reports own that (ADR-024). This owns payouts and reconciliation.
- **Replacing the gateway's payout schedule on terminal.** Cami displays it, does not control it.
- **Chargeback handling.** Separate problem, separate spec.

---

## Dependencies

### Feature dependencies

| Needs | Why | Status |
|---|---|---|
| Rate stored on each transaction at capture | Payouts deduct the take at the rate that was live, not today's | PRO-737 specced, **backend not built** |
| Gateway refunds | `SET-E2` cannot ship without them | 🔴 Not built, **already a pilot blocker** |
| Terminal server-side confirm (Phase 2) | Phase 1 trusts a device report on the rail where Cami never sees the money | 🔴 Planned direction, **no ticket** |
| Audit spine | Destination changes and payout actions must be attributable (INV-08) | ⚠️ Partial, PRO-737 known gap |

### Team dependencies

| Team | What we need | Timeline |
|---|---|---|
| Finance | Answer float custody liability and negative-float policy | Before build |
| Legal / compliance | Whether holding online float needs a UAE licence | Before build |
| Design | Make two payouts from two senders legible | Before UI |
| Ops | Define what verifies a payout destination | Before beta |

### External dependencies

| Third party | What we need | Risk if delayed |
|---|---|---|
| **NeoPay** | Agreement on how Cami's fee is collected on terminal | **Blocks the revenue model on the majority rail** |
| NeoPay | Ability to report terminal payouts back to Cami | Merchant reconciliation stays incomplete |
| Banking partner | Payout rails for online float | Cami cannot pay out at all |

### Critical Path

**NeoPay fee remittance on terminal (Open Question Q1).**

It is a commercial negotiation with lead time, not a build task, and every other dependency can proceed in parallel. If it lands late, Cami ships settlement that pays merchants correctly and does not collect its own revenue on the rail carrying most of the volume.

**Start this conversation now.**

---

## Risks

*V=Value, U=Usability, F=Feasibility, B=Business Viability. Impact: H/M/L*

| Risk | Type | Impact | Mitigation |
|---|---|---|---|
| Cami cannot collect its fee on terminal, the majority rail | **B** | **H** | Q1. Recommended path is gateway deducts and remits. Start the NeoPay conversation immediately |
| Bank account change reaches one custody side only, half the money goes to a closed account | F | **H** | `SET-B3` as one atomic operation. Rollback on partial failure. Explicit QA case |
| Merchant confused by two payouts from two senders | **U** | **H** | Label by source, show both in one history, explain once in onboarding |
| Holding online float needs a licence Cami does not have | **B** | **H** | Q4 to legal before build. If it lands badly, custody moves fully to the gateway and the PRD shrinks |
| Reconciliation omits terminal and cash, so it looks complete while covering a fraction | U | **H** | `SET-D7`. Either include off-rail money or state plainly it is excluded. This is Fresha's exact mistake |
| Terminal Phase 1 trusts an unconfirmed report on a rail Cami never sees settle | F | **H** | Daily Cami-vs-gateway reconciliation (`SET-C10`). Ticket Phase 2 |
| Negative float when a merchant refunds more online than they hold | B | M | Q2. No card on file (INV-P6), so there is no collection mechanism today |
| Payouts recompute revenue from the current rate card, silently re-rating history | F | M | `SET-C2`. Read the stored rate. Assert in tests |
| Merchants do not care and keep using their own bank machine | **V** | M | Real risk and unmeasured. Settlement alone does not move capture; the terminal does. Validate with SOTA |
| Archived merchant left with float and no defined outcome | B | L | `SET-X11`. Currently unspecified, raised rather than left to production |

**Value risk is genuinely low here and worth naming.** Settlement is not something merchants opt into, it is the condition of being paid at all. The real value question is whether it *moves capture*, and the honest answer is that settlement is necessary but not sufficient. The terminal is what moves capture.

### Cagan risk status

| Risk type | Question | Status |
|---|---|---|
| **Value** | Will merchants want this? | ✅ Table stakes. Fresha has it and merchants use it |
| **Usability** | Can they figure it out? | ⬜ Two payouts from two senders is untested with anyone |
| **Feasibility** | Can we build it? | ⬜ Four dependencies unbuilt, one with no ticket |
| **Viability** | Does it work for the business? | ⬜ **Q1 unanswered. This is the blocker** |

---

## Open Questions

| # | Question | Assumption | How to validate | Timeline |
|---|---|---|---|---|
| **Q1** | **How does Cami collect its take on terminal?** Cami never holds the money | Gateway can deduct and remit | Commercial conversation with NeoPay. Ask directly whether they support fee remittance to a platform | **Before any build** |
| Q2 | Can online float go negative? | It must not, but blocking a refund is worse | Finance decision. Model it against real SOTA refund rates | Before build |
| Q3 | What verifies a payout destination? | Documents plus gateway verification, like Fresha | Ask what NeoPay already does. Do not build what the gateway provides | Before beta |
| Q4 | Does holding online float need a UAE licence? | It does not, at this volume | Legal review | **Before build. May remove online custody entirely** |
| Q5 | One payout destination per merchant, or per location? | Per merchant at v1 | Ask Chaps & Co how they bank across 9 locations | Before multi-location |
| Q6 | Blended view or two clearly separate rails? | Separate and labeled | Prototype both, show the SOTA owner | Before UI build |
| Q7 | Do merchants actually open a wallet screen? | Yes, daily | Ask the SOTA owner what he opens and when. Cheapest validation on this list | This week |

**Q7 is a one-conversation question** and it de-risks the whole of stage 4. Ask it before anything is designed.

---

## Before Finalizing

- [x] **Does `competitors.md` show competitors have this?** Yes. Fresha's settlement surfaces are mature and observed working. **Table stakes.** Cami is behind, not innovating
- [ ] **Any recent feedback contradicting this approach?** Unknown. No merchant has been asked about settlement. Q7 is the fastest way to close this

---

## Sign-off

| Role | Name | Approved |
|---|---|---|
| Product | Michelle | ⬜ |
| Engineering | Faisal | ⬜ |
| Design | Anum | ⬜ |
| Commercial | Maaz | ⬜ (owns Q1) |
| Finance | | ⬜ (owns Q2, Q4) |

**Do not move this past Problem Review until Q1 and Q4 have owners with dates.** Q1 decides whether the revenue model works on the majority rail. Q4 decides whether half this PRD exists at all.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First draft. Built on the 2026-08-16 discovery set. Split custody decided the same day |
| 2026-08-20 | ⛔ Superseded by [prd-merchant-settlement-2026-08-20](./prd-merchant-settlement-2026-08-20.md), rebuilt against the 2026-08-20 PRD template |
