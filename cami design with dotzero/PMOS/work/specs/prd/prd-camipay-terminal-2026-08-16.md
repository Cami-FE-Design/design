# PRD: CamiPay POS Terminal

**ID:** PRD-CAMIPAY-TERMINAL · **Owner:** Michelle You · **Date:** 2026-08-16 · **Status:** ⏳ Draft
**Serves objective:** OBJ-P5 (complete the money path) → OBJ-B3, OBJ-B1
**Law cited:** INV-P1, INV-P2, INV-P3 (**Phase 1 is a declared, time-boxed exception**), INV-P5, INV-P6, INV-B5, INV-M4, INV-08, INV-A1 · ADR-003, ADR-014, ADR-022 · 06 §8
**Use cases:** cites `CP-B1` to `CP-B4`, `CP-C2`, `CP-C3` in [get-paid/camipay.md](../../../cami-feature-docs/feature-mappings/get-paid/camipay.md). **Mints `CP-B5`,** which that guide inherits.
**Related:** [CamiPay capture BRD](../brd/camipay-capture-brd.md) (R4, R5, R6, R10, R11) · [jtbd-payer](../../discovery/outputs/jtbd-payer-2026-08-16.md) · [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) · `docs/specs/DSG-62-terminal-registration.md` (canonical) · Linear PRO-982, PRO-983

---

## TL;DR

1. **Ship the rail that carries the volume.** Deposits are roughly 5.4% of SOTA's GMV. Matching what Fresha extracts from them needs roughly **34% captured**. Only the terminal reaches that, and only the terminal displaces the merchant's own bank machine.
2. **Why now:** SOTA is waitlisted "until key features are built" and the terminal is the leading candidate. Tier 2 has no dated anchor until this question is answered.
3. **What could kill it:** two things outside the code. NeoPay's settlement and terminal-app approval, and the fact that **Cami has no mechanism to collect its take on terminal volume it never holds.**

⚠️ **Evidence:** backend Phase 1 is engineering-verified on `feature/camipay` (11 Aug): per-device auth, pending-sales list, and the trusted settlement callback all pass. **The front end is a mock, no device has been used in a shop, and no merchant has been observed taking a terminal payment.**

---

## Context

| What changed | When | So what |
|---|---|---|
| Terminal held in architecture, gated on NeoPay | 31 Jul 2026 | ADR-003 made online the interim path. Interim has now run six weeks |
| Per-device PIN ruled as law, superseding the merchant-wide model | 6 Aug 2026 | ADR-022. Engineering Phase 1 shipped merchant-wide and must migrate |
| Settlement custody split by rail | 31 Jul 2026 | Online settles through Crescent. **Terminal money goes NeoPay to merchant directly**, so Cami never touches it |
| SOTA's Fresha account read on a live login | 16 Aug 2026 | SOTA runs balances on its own bank machine, not a Fresha device. That machine is what the terminal displaces |
| SOTA waitlisted | 17 Aug deck | Tier 2 has no dated anchor. Naming which features unblock them is now the highest-value open question in goals.md |

---

## Problem

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Layla** | `JOB-RCP-PAY1` take the money at the counter in one motion | Every completed visit | She hands over a bank machine that Cami cannot see. The sale closes off-platform |
| **Noor** | `JOB-CLI-PAY5` pay at the counter in one tap on a familiar machine | Every in-person balance | The terminal has one failure point and a human next to it. Online has four and nobody |
| **Omar** | `JOB-OWN-KNOW4` see the money that did not run on Cami | Continuous | Most of his money never touches the platform, so a complete-looking report covers a fraction (EC-19) |
| **Cami** | Earn on the rail carrying the majority of volume | Every terminal sale | 🔴 **No mechanism exists.** BRD R11 |

---

## Jobs served

| Job ID | Persona | Job (short) | Opp | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-RCP-PAY1` | Layla | Take money at the counter in one motion | 13 | [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) | Pending-sales list plus tap to charge (`CP-B2`) |
| `JOB-CLI-PAY5` | Noor | One tap on a machine I recognize | 10 | [jtbd-payer](../../discovery/outputs/jtbd-payer-2026-08-16.md) | Provider's on-device pay screens, no link, no OTP detour |
| `JOB-OWN-PAY2` | Omar | Fee legibility | 10 | [jtbd-owner](../../discovery/outputs/jtbd-owner-2026-08-16.md) | The cheaper rail, stated. Roughly 1.9% against roughly 2.5% online |
| `JOB-OWN-KNOW4` | Omar | See the uncaptured gap | 17 | [jtbd-know-how](../../discovery/outputs/jtbd-know-how-2026-08-16.md) | Closing the gap rather than reporting it. The terminal is the fix, not the metric |

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| Backend per-device auth passes; the front-end registry is a mock and unwired | ✅ Validated | `CP-B1` Partial, 11 Aug |
| Backend pending-sales list and payment report pass; no intent tile in the business app | ✅ Validated | `CP-B2` Partial, PRO-983 |
| The terminal never takes a normal deposit | ✅ Validated | `CP-B4` Works. Deposit is a link purpose (EC-21, INV-B5) |
| Phase 1 trusts the device report. The provider charges on its own screens, and the backend does not confirm server-side | ✅ Validated | `CP-C2` Partial, PRO-982 |
| Terminal is absent from the checkout method grid | ✅ Validated | `CP-B3` Partial |
| Gateway refunds for terminal captures are unproven | ✅ Validated | `CP-C3` Partial. **Pilot blocker** since 6 Aug |
| The terminal is roughly 1.9% against roughly 2.5% online | ⚠️ Inferred | Jul 23 meeting. Rates vary by operator, 1.8 to 3% card |
| Roughly 34% of GMV must be captured to match Fresha's extraction on SOTA | ⚠️ Inferred | At a 2.5% blend on the ~3x-the-floor GMV basis closed 16 Aug |
| Reception prefers handing over a machine | ⚠️ Assumed | Nobody has been observed doing it on a Cami device |
| Whether NeoPay approves the terminal app, and when | 🔴 Unknown | External |

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| **Per-device terminal auth.** Immutable pairing code binds the hardware, a readable regenerable sign-in PIN opens a 24h revocable session | Michelle, 6 Aug 2026 | ADR-022, `DSG-62-terminal-registration.md` | A merchant-wide PIN cannot revoke one lost device without signing out every terminal at every branch. Email and password was rejected as adoption-killing |
| The terminal charges from a **pending-sales list**, sales tagged `intended_payment_method = terminal` | PRO-983 | 03 §9, EC-28 | Diverged deliberately from the meeting's signal-only proposal. Staff pick a client, not a sale number |
| The terminal **never takes a normal deposit**. Upfront package payment is the exception | Jul 23 meeting | INV-B5, EC-21, ADR-017 | Deposits belong to the booking and link path |
| Both rails are offered for a balance, **terminal preferred** | Jul 23 meeting | ADR-014 | Cheaper for the merchant, matches reception habit |
| The sale is **fully locked** while a terminal charge is in progress, matching the payment-link lock | Michelle, 6 Aug 2026 | 03 §9 | Other tenders return only after cancel |
| Phase 1 trusts the device report. Server-side confirm is a **planned direction, not a committed ticket** | PRO-982 | 03 §9, INV-P3 note | Stating it as committed would misrepresent the pilot risk |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-P1, INV-P2 | Cami owns the commercial record. The device reports, Cami settles |
| INV-P6 | No stored card, so no recapture from the terminal either |
| INV-B5 | Deposits are appointment-scoped, which is why the terminal does not take them |
| INV-M4 | `Σ tender = amount_due` at settle. The device report feeds this |
| INV-08, INV-A1 | Who may pair, sign in, regenerate a PIN, and refund |
| 06 §8 | Idempotency. Terminal disconnect mid-capture is the expected failure mode, not an edge case |
| 03 §9 | The terminal session state machine is the contract |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| INV-P3 | No flow is hard-coupled to a single provider. Both rails route through the abstraction | Phase 1 **bypasses** it: the backend trusts a device report rather than confirming with the provider | ⚠️ **Already declared** in 01 as a known, time-boxed exception. It needs a **time box**, which it does not have. Not a repeal, but currently open-ended |
| ADR-003 | Online-first, terminal later, gated on NeoPay | If the terminal is what unblocks SOTA, this sequencing is superseded in practice | 🔴 **Needs a superseding ADR** once the SOTA question is answered |

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Captured volume as a share of GMV, per live account | ~5.4% (deposits only, SOTA proxy) | **Toward 34%**, the level that displaces Fresha's extraction | 90 days after first device in a shop |
| Share of balances taken on terminal versus link | 0% | Majority on terminal | 60 days |
| Terminal sales that reconcile without manual intervention | 🔴 unmeasured | 100%. A trusted report that diverges is a books problem | Continuous from day one |

**Leading** (pre-launch signals)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| One device charges one real sale end to end in a shop | Supervised pilot at one Tier 3 site | It works once, with a witness |
| A gateway refund of a terminal capture credits a real card | Same visit, same card | It works once. **This is the pilot blocker** |
| Report divergence under a forced disconnect | Kill the network mid-charge, then reconcile | Zero divergence, or a divergence Cami detects itself rather than the merchant finding it |
| NeoPay approval submitted and acknowledged | Maaz confirms | Submitted. Approval is theirs, submission is ours |

---

## Proposed solution

### How it works

- A device is registered in the business app and issued an **immutable pairing code** (`TRM-7Q4K2M`). Entering it once binds the hardware.
- Staff open the device with **that terminal's own sign-in PIN** (`482915`), opening a 24 hour revocable session. Regenerating one device's PIN revokes only that device's sessions.
- In the business app, staff set `intended_payment_method = terminal` on a sale. It stays unpaid and appears in that device's pending-sales list.
- Staff pick the sale on the device and take payment on the **provider's on-device pay screens**. The card is charged by the provider, for real.
- The app posts a payment report. Phase 1: the backend validates the amount against the outstanding balance, deduplicates by transaction id, writes a `terminal` payment, and runs the same settle engine as every other tender.
- A decline logs and the sale stays unpaid.

### User stories (the feature-level use cases)

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `CP-B1` | `JOB-RCP-PAY1` | Reception | to sign in to this terminal | I am not locked out mid-shift, and a lost device can be killed alone | Per-device PIN opens a 24h session, and regenerating it revokes that device only | Device `SignedIn` (03 §9) |
| `CP-B2` | `JOB-RCP-PAY1` | Reception | the device to show me the sale I mean | I do not hunt a number with a client waiting | The sale appears in the pending list and charging it updates that sale | `Idle` → `SaleSelected` → `Approved` |
| `CP-B3` | `JOB-OWN-PAY2` | Reception | the terminal offered first for a balance | the cheaper rail is the default, not the effort | Terminal appears in the method grid, link still available | Sale `BalanceDue` |
| `CP-B4` | — | Reception | the terminal not to take a normal deposit | deposits stay on the booking path | A deposit cannot be selected on the device, except an upfront package payment | Unchanged |
| **`CP-B5`** *(minted)* | `JOB-RCP-PAY1` | Reception | the sale locked while a charge is running | a second person cannot alter or double-tender it | Amount and method are both locked, and other tenders return only after cancel | Sale locked, mirroring 03 §8 |
| `CP-C2` | `JOB-CLI-PAY5` | Payer | the payment to register once, even if the network drops | I am never charged twice | Idempotent by transaction id, and a partial application is not permitted (06 §8) | Sale `Sale`, or unpaid on decline |
| `CP-C3` | `JOB-CLI-AFTER2` | Manager | to refund a terminal capture | the client gets their money back | Money returns through the gateway to the original card | Refund document issued |

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Business app, payment settings | Device registry | Each terminal with its pairing code, its PIN, and a regenerate action | ADR-022 |
| Device | Locked | Repeated wrong PINs lock **that device only** | 03 §9 |
| Device | Idle | The pending-sales list, forced to terminal-routed sales | PRO-983 |
| Device | Charging | The provider's own pay screens. Not a Cami screen | INV-P3 Phase 1 |
| Business app, checkout | Charge in progress | Fully locked, mirroring `PaymentLinkLockScreen`. Only action is cancel | 03 §9, PRO-909 shape |
| Business app | Report received | Sale settles on the same engine as any tender | INV-M4 |

---

## Money composition

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Tip | **Invoice** | 8 | INV-M3. Must be on the invoice before the device is handed over. A tip added on the device is a Scope Rule violation |
| Amount due | Derived | 9 | INV-M3 |
| Terminal capture | Payment | 10 | INV-M4. `0 < paidAmount ≤ outstanding` |
| Split tender | Payment | 10 | Terminal may be one of several tenders on one sale |
| Package upfront payment | Payment | 10 | The one deposit-shaped thing the terminal may take (ADR-017) |

**The tip question is sharper here than on the link.** On a card machine the natural place to ask for a tip is the device, and the device runs the **provider's** screens, not Cami's. A tip entered there never reaches the invoice, so taxable gross and amount due both go wrong (INV-M3, EC-38). **The tip is taken in the business app before the charge, or it is not taken.**

---

## Permissions and roles

| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|
| Sign in to a terminal | Block | Allow | Allow | Allow | 🔴 **Session is device-attributed, not person-attributed.** Open |
| Charge a sale on the terminal | Block | Allow | Allow | Allow | Via the sale, not the person |
| Regenerate a terminal PIN | Block | Block | Allow | Allow | Yes |
| Pair a new device | Block | Block | Allow | Allow | Yes |
| Refund a terminal capture | Block | ? | Allow | Allow | Yes |

🔴 **The attribution row is a real gap.** A 24 hour device session that is not person-attributable means a terminal sale can be traced to a device and a time, not to a person. Against EC-4, staff discounting and comping, that is the weaker half of a revenue-integrity story. Marlon's anti-theft review should see this table.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| EC-27 | Terminal login persistence and lockout | ✅ ADR-022, per-device PIN and 24h session | Lockout trigger, PIN or code, still open |
| EC-28 | Finding the right sale on the device | ✅ `CP-B2`, pending-sales list | — |
| EC-21 | Deposit link unpaid, customer pays in store | ✅ Full amount on the terminal, old link expired | — |
| EC-43 | Retry after disconnect mid-capture | ✅ `CP-C2`, idempotency key, no partial application | Reconciliation reads by key, never amount plus timestamp |
| EC-38 | Tip not persisted before capture | ✅ Tip taken in the app before the device | The `/payments` fix is checkout's |
| EC-4 | Staff discount to zero, comp friends | ⚠️ Named, not solved. Device sessions are not person-attributed | Permissions card, PRO-404 |
| EC-19 | Captured versus booked gap | ⚠️ The terminal shrinks the gap. Surfacing it is reporting's | [Reporting PRD](./prd-reporting-csv-first-2026-08-16.md) |
| **New** | A trusted device report is wrong, delayed, or lost, and the books diverge from the provider until reconciled | ⚠️ Named as the Phase 1 pilot risk. **Propose as a new EC** | `05-edge-case-catalog.md` |

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `payment.captured` with `method=terminal`, device id, and transaction id | Per capture | Payments log, reconciliation | Existing shape, terminal fields new |
| **The rate stored on the transaction**, per rail | Per capture | HQ Partner Dashboard, and Cami's own billing | New. Blocks BRD R11 |
| Device report received-at versus provider timestamp | Per capture | Divergence detection. Phase 1 has no other guard | New |
| `terminal.session.opened / revoked` | Per session | Audit. Currently device-attributed only | New |
| Split of captured volume by rail | Per account per period | Captured versus booked, `RP-C1` | New |

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Server-side gateway confirm | Phase 1 trusts the device report. Phase 2 is a direction, no ticket | 03 §9. Needs a time box |
| Where terminal money settles | It goes NeoPay to merchant directly. Cami is not in the flow | [Merchant settlement PRD](./prd-merchant-settlement-2026-08-16.md) |
| **How Cami collects its take on terminal volume** | Genuinely unsolved. Named, not solved here | BRD R11, needs an ADR and an owner |
| Taking a deposit on the device | INV-B5, EC-21 | Booking and link path |
| Offline or storefront POS for pure retail | Phase 2 | Post-v1 |
| Tipping on the device | The device runs provider screens. A tip there never reaches the invoice | Checkout, before the charge |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| Front-end terminal registry (currently a mock) | ⚠️ Unwired | `CP-B1` |
| Checkout method grid including terminal | 🔴 Absent | `CP-B3` |
| Migration from the merchant-wide PIN Phase 1 shipped | 🔴 Not started | `CP-B1`, and ADR-022 compliance |
| Checkout tip persistence | 🔴 Live defect (EC-38) | Every terminal sale with a tip |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| OS Team | Per-device migration, front-end wiring, method grid, lock behavior | Faisal |
| Design | Device registry surface, in-app charge lock state | Anum |
| Commercial | NeoPay approval submission and settlement decisions | Maaz |
| Security | Anti-theft and security review, including session attribution | Marlon |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| **NeoPay** | Terminal-app approval, settlement decisions, on-device pay screen behavior | 🔴 Unknown. The whole rail waits on it | None. This is the initiative's single point of failure |
| **Marlon** | Security and anti-theft review sign-off | 🔴 Unscheduled | Do not put a device in a shop without it |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | Answer which features unblock SOTA. If it is this one, ADR-003 is superseded | Sets whether this is an August item or a September one |
| 2 | NeoPay approval submitted | Nothing physical happens before it |
| 3 | Migrate to per-device PIN | ADR-022 is not met until this lands |
| 4 | Gateway refund proven on a real terminal capture | **Pilot blocker** |
| 5 | Marlon's review | Gate to a device leaving the office |
| 6 | One supervised device in one shop | Gate to any rollout |

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Phase 1 merchant-wide PIN in `feature/camipay` | Migrates to per-device. Every device re-pairs once | Customer Success, with the new codes in hand |
| Accounts taking balances on their own bank machine | No forced change. The terminal is offered, and the case is that it is cheaper | Account Manager, at the rate conversation |
| Sales already tagged for terminal | Surface in the pending list on first sign-in | — |
| A provider swap later | Per-rail abstraction means the link path is untouched (INV-P3) | Not in this release |

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| **Cami cannot collect its take on terminal volume** | **B** | 🔴 **Certain today.** No mechanism exists | The majority rail generates GMV and no revenue. The business model does not work on its own main path | Solve it before scale, not before pilot. It needs an ADR and an owner this month | Maaz + Faisal |
| A trusted device report is wrong or lost, and books diverge | **F** | Medium | The merchant finds a discrepancy before Cami does, on their first month with us | Divergence detection on timestamps, and a time box on the Phase 1 exception | Faisal |
| NeoPay approval does not land | **F** | Medium | The whole rail idles and online stays the only path indefinitely | Escalate through the Noon conversation. A second terminal provider is the only real hedge | Maaz |
| Device sessions are not person-attributable, so a terminal sale cannot be pinned to a person | **B** | High, by design today | Weakens the revenue-integrity story exactly where EC-4 lives | Raise in Marlon's review. Decide device or person before rollout | Michelle |
| Reception does not switch from their own bank machine | **U** | Medium | Captured volume stays near deposit-only and the 34% case never materializes | Make the terminal the default in the method grid (`CP-B3`), and let the Account Manager carry the rate argument | Maaz |
| Tips get taken on the provider's screens and never reach the invoice | **F** | Medium | Taxable gross and VAT both wrong, silently | Tip before the charge, in the app. State it in training | Faisal |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | **How does Cami collect its take on terminal volume it never holds?** | The revenue model on the majority rail | Maaz + Faisal | This month. It is the largest open item in the initiative |
| 2 | Is SOTA waitlisted on this feature specifically? | Sequencing, and whether ADR-003 is superseded | Maaz | This week |
| 3 | What is the **time box** on the INV-P3 Phase 1 exception? | The exception is declared and open-ended | Faisal | Before pilot |
| 4 | Is a terminal session attributed to a device or to a person? | The permissions table, and Marlon's review | Michelle + Marlon | Before rollout |
| 5 | PIN readability, lockout trigger, 24h fixed or configurable | `CP-B1` detail. Not blocking | Michelle | Before build |
| 6 | May Reception refund a terminal capture? | The permissions table | Michelle | Before build |

---

## Before finalizing

- [ ] Question 1 has a named owner and a date, even if it does not yet have an answer
- [ ] NeoPay submission confirmed sent, with a date
- [ ] Marlon's review scheduled
- [ ] The Phase 1 exception has a stated time box (Question 3)
- [ ] `CP-B5` added to `feature-mappings/get-paid/camipay.md`
- [ ] The trusted-report divergence case is added to `05-edge-case-catalog.md` with an EC number
- [ ] Engineer audit of the per-device migration state, since this PRD asserts no build state of its own

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | 2026-08-16 | ⏳ Draft |
| Engineering | Faisal | — | Pending |
| Commercial | Maaz | — | Pending |
| Security | Marlon | — | Pending, and gating |
| Design | Anum | — | Pending |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Cites `CP-B1` to `B4`, `C2`, `C3`; mints `CP-B5` (sale locked during charge). **Names two things nothing else holds: Cami has no mechanism to collect its take on terminal volume, and the INV-P3 Phase 1 exception has no time box.** Flags that a tip entered on the provider's device screens never reaches the invoice |
