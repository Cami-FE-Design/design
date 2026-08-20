# PRD: Cami-HQ Rate Card and Rail Config

**ID:** PRD-HQ-RATE-CARD · **Owner:** Michelle You · **Date:** 2026-08-16 · **Status:** ⏳ Draft, **ratified after ship**
**Serves objective:** OBJ-P5 (complete the money path) → OBJ-B3
**Law cited:** INV-P1, INV-P2, INV-P3, INV-01, INV-08, INV-10, INV-12 · ADR-001, ADR-002, ADR-012
**Use cases:** **mints `HQ-E1` to `HQ-E5`**, a new group E on [cami-hq/cami-hq-console.md](../../../cami-feature-docs/feature-mappings/cami-hq/cami-hq-console.md), which currently has groups A to D only.
**Related:** [CamiPay capture BRD](../brd/camipay-capture-brd.md) (R12, R11) · [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md) · [journey-map-account-manager](../../discovery/outputs/journey-map-account-manager-2026-08-16.md) · `docs/specs/PRO-737-cami-hq-camipay-config.md` (canonical design spec)

---

> ⚠️ **This PRD is written after the UI shipped.** PRO-737 is live on `/admin/businesses` on mock data, with no backend. The PRD exists because the initiative register had an artifact chain that started at the design spec, so nothing recorded which objective, job, or requirement the screen served. **It documents intent, it does not re-decide the design.** Where it disagrees with `PRO-737-cami-hq-camipay-config.md`, that spec wins on shape and this one wins on requirement.
>
> **No BRD.** Single feature, per `brd.md`: initiative-scale work only, otherwise objective straight to PRD.

---

## TL;DR

1. **Record the one decision that shipped correctly, and name the two that did not ship at all:** the backend, and rail-toggle attribution.
2. **Why now:** the rate stored on each transaction is a dependency of the payments log, the HQ Partner Dashboard, settlement, and Cami's own billing. A UI on mock data satisfies none of them.
3. **What could kill it:** nothing kills the feature. What kills its value is capture-time snapshotting never being built, at which point every downstream report re-rates history from a mutable current number.

⚠️ **Evidence:** the rate-change rule is ✅ validated by Maz verbatim. Everything about how an Account Manager actually works is ⚠️ assumed. **No Account Manager has been interviewed.**

---

## Context

| What changed | When | So what |
|---|---|---|
| Cami charges a different take rate per Partner, per rail, and renegotiates | Ongoing | There was nowhere in HQ to see or set it |
| PRO-737 shipped as UI on mock data | Aug 2026 | The refusal model is built. The persistence is not |
| Settlement custody split by rail | 31 Jul 2026 | Terminal money never passes through Cami, so R11 has no mechanism and the rate card cannot solve it alone |
| The initiative register was built | 16 Aug 2026 | Rate card traced ✅ on Linear and 🔴 on both BRD and PRD. This document closes the PRD half |

---

## Problem

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Dana** (Account Manager) | `JOB-AMG-NEG1` renegotiate without re-pricing history | Occasional, high stakes | A single mutable rate silently re-prices every transaction the Partner already took. **The bug this feature exists to prevent** |
| **Dana** | `JOB-AMG-ONB1` know a Partner is settle-ready before money moves | Per new account | Rails can be on for a Partner who has not finished settlement onboarding |
| **Dana** | `JOB-AMG-OPS1` know what Cami earns per Partner | Continuous | The rate is configurable and the revenue it produces is invisible |
| **Cami finance** | Bill a Partner from the rate that applied | Monthly | 🔴 Persona not written. Named here because the requirement is theirs |
| **Omar** | `JOB-OWN-PAY2` fee legibility | Continuous | The Partner never sees this screen. The rate reaches them through a contract |

---

## Jobs served

| Job ID | Persona | Job (short) | Opp | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-AMG-NEG1` | Dana | Forward-only rate change | — | [jtbd-camihq](../../discovery/outputs/jtbd-camihq-2026-08-16.md). ✅ **Validated**, Maz verbatim | `HQ-E3`, append-only rows with an effective date |
| `JOB-AMG-ONB1` | Dana | Settle-readiness before first payout | — | jtbd-camihq, ⚠️ assumed | `HQ-E1`, rails off until a Partner is ready |
| `JOB-AMG-OPS1` | Dana | Know what Cami earns per Partner | — | jtbd-camihq, ⚠️ assumed | Only through `HQ-E5`, the stored rate that a revenue view would read |

⚠️ **Two of three jobs are assumed.** The one validated job is the one the screen was built around, which is a good sign about the screen and a bad sign about the persona page.

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| A rate change applies forward only, and prior transactions keep their rate | ✅ **Validated** | Maz, verbatim, in PRO-737 |
| The UI offers no editable rate field, no past-row affordance, and blocks backdating at the input | ✅ Validated | PRO-737 as built |
| The store exposes `setRailEnabled`, `setRailGateway`, `addRate`, and deliberately has no `updateRate` or `removeRate` | ✅ Validated | `lib/hq-camipay/store.tsx` |
| Rails and gateways are independent per rail | ✅ Validated | PRO-737, and INV-P3 |
| Only NeoPay routes today. The others carry an Onboarding badge | ✅ Validated | PRO-737 |
| There is no backend. State is React context plus localStorage | ✅ Validated | PRO-737, stated as out of scope |
| Rail toggles are not attributed | ✅ Validated as a gap | INV-08 gap named in `personas.md` |
| Account Managers work the way this screen assumes | ⚠️ **Assumed** | Nobody interviewed |
| Onboarding and account management are one role rather than a handoff | ⚠️ Assumed | If they split, this screen serves two people |

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| **Rates are date-locked and forward-only.** A change appends a row, never updates one | Maz, in PRO-737 | INV-12, INV-01 | Editing one number retroactively re-prices every processed transaction. This is the whole feature |
| `effectiveFrom` and `createdAt` are separate fields | PRO-737 | — | When a rate was agreed is not when it starts applying |
| Backdating is blocked at the date input | PRO-737 | — | A backdated rate reaches payments already captured |
| The rate is **snapshotted onto the transaction at capture** and read from there by reports and settlement | PRO-737 | INV-01 | Recomputing from the current card re-rates history the moment anyone edits it |
| Rails are independent, including their gateway | PRO-737 | INV-P3 | Links may sit on one provider and terminals on another |
| Turning a rail off removes it from **checkout only**. Cash and off-rail card still record to the ledger | PRO-737 footnote | INV-P1, INV-P2 | "Turn off CamiPay" reads like "stop recording their money", and it does not |
| Rates are set at **Business** level. Per-location overrides are declared and not built | PRO-737 | INV-10 | The inheritance level is declared before shipping, per INV-10 |
| An enabled rail with no gateway warns, it does not block | PRO-737 | — | The two settings are set by different people at different times |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-12 | Config applies forward-only. This screen is the clearest instance of it in the product |
| INV-01 | Catalogue objects are mutable, financial records append-only. **A processed transaction's rate is a financial fact** |
| INV-10 | Every setting declares its Business or Location inheritance level before shipping |
| INV-P3 | Per-rail provider abstraction, which is why gateway is a per-rail field |
| INV-P1, INV-P2 | Disabling a rail turns off a tender path, not Cami's ownership of the commercial record |
| INV-08 | Every state change is attributable. `addRate` carries `createdBy`. **Rail toggles do not** |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| INV-08 | Every state change is attributable | Rail and gateway toggles are **not** attributed today. Turning money on for a Partner leaves no record of who did it | 🔴 **Gap, not a change.** Fix it rather than record an exception |
| INV-10 | Settings declare their inheritance level | Business level is declared. Multi-location will force the question of whether a chain can hold per-location rates | ⚠️ Revisit at v0.3, not now |

---

## Success criteria

**Lagging**

| Metric | Baseline | Target | By when |
|---|---|---|---|
| Transactions billed at a rate that was not in force when they happened | 🔴 unmeasurable, no backend | **Zero, and provably zero** | First month after persistence ships |
| Rate disputes with a Partner | 0 known | 0 | Ongoing |
| Time for an Account Manager to answer "what do we earn here" | Asks engineering | One screen | After the revenue view, not in this slice |

**Leading**

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| A capture stores its rate | Take one payment and read the record | The rate is on the payment row, not looked up later |
| `effectiveRate(..., pastDate)` returns the historical rate | Unit test over a rate history | Correct for a date before, on, and after each change |
| Scheduled rows do not affect today | Add a future-dated rate and read the current one | Unchanged |
| A rail toggle names its actor | Read the audit log | The actor is there. It is not today |

---

## Proposed solution

### How it works

- Per Partner, on the Settings tab of the Partner detail dialog: turn CamiPay rails on and off, assign a gateway per rail, and hold a rate card.
- The rate card is an **append-only list** of `(rail, rate, effectiveFrom)` rows with `createdBy` and `createdAt`.
- The rate in force on a date is the newest row whose `effectiveFrom` is on or before it. Rows dated later are **scheduled**, rendered distinctly, and do not affect the current rate.
- The same resolution runs at capture, to **snapshot the rate onto the transaction**.
- The UI enforces the rule by refusing: no editable rate field, no affordance on past rows, backdating disabled at the input, and the consequence stated in plain language before saving.

### User stories (the feature-level use cases)

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| **`HQ-E1`** | `JOB-AMG-ONB1` | Account Manager | to turn a CamiPay rail on or off per Partner | a Partner who is not settle-ready does not see CamiPay at checkout | The toggle takes effect at the Partner's checkout with no redeploy, and **the actor is recorded** | Rail config updated |
| **`HQ-E2`** | — | Account Manager | to assign a gateway per rail | links and terminals can run different providers (INV-P3) | Each rail carries its own gateway, and an unrouted enabled rail warns rather than blocks | Rail config updated |
| **`HQ-E3`** | `JOB-AMG-NEG1` | Account Manager | to change a rate from a future date | I never re-price what a Partner has already been billed | A new row appends with rate, effective date, and actor. **No path exists to edit or delete a past row** | New `RateRow` appended |
| **`HQ-E4`** | `JOB-AMG-NEG1` | Account Manager | to see the rate history | I can answer what applied in March | Read-only history showing both when it was agreed and when it started | Read-only |
| **`HQ-E5`** | `JOB-AMG-OPS1` | Cami | the rate stored on each transaction at capture | reports and settlement never recompute from the current card | Every capture carries its rate, and reading it for a past date returns the historical figure | Payment record carries the rate |

**`HQ-E5` is the requirement, and it is the one that has not shipped.** `HQ-E1` to `HQ-E4` are a UI on mock data. Without capture-time snapshotting, the whole refusal model in the interface protects nothing, because there is no persisted history for it to protect.

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Partner detail, Settings tab | Rails card | Terminal first, then online. Icon tile is the fastest on-off read | PRO-737 |
| Rails card | Rail on, no gateway | Amber line: on but nothing will route. Warning, not a block | PRO-737 |
| Rails card | Always | Footnote: turning a rail off removes it from checkout, nothing more | INV-P1 |
| Rate card | Header | Right-aligned hint, "Set at Business level" | INV-10, inheritance declared visibly |
| Rate card | Current rate | **Plain text.** Not a disabled field, not a field behind a pencil | INV-12 |
| Rate card | Change dialog | Rate, effective date with `disableBefore={today}`, plus the consequence in plain language | INV-12 |
| Rate card | History | Read-only list. No menu, no edit, no delete | INV-01 |
| Rate card | Future-dated row | Rendered as scheduled, distinct from effective | — |

---

## Money composition

This feature composes no money. It sets **the rate Cami earns**, which is not part of the customer's amount due.

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Take rate | Neither invoice nor payment. **Cami's own revenue** | Outside the Composition Order entirely | INV-01, snapshotted at capture |

⚠️ **Worth stating because it is easy to get wrong:** Cami's margin is not a line on the merchant's invoice, does not affect taxable gross, and never reduces what the merchant is owed on the sale document. It is deducted in settlement, on the online rail, and on the terminal rail there is currently **no mechanism at all** (BRD R11).

---

## Permissions and roles

CamiHQ roles, not merchant roles. HQ permission depth beyond `hq_admin` and `super_admin` is unsettled.

| Action | hq_admin | super_admin | Merchant roles | Attributed (INV-08) |
|---|---|---|---|---|
| View rails and rate card | Allow | Allow | **Block.** No HQ access | No |
| Toggle a rail on or off | ? | Allow | Block | 🔴 **No. Live gap** |
| Assign a gateway | ? | Allow | Block | 🔴 **No. Live gap** |
| Append a rate row | ? | Allow | Block | ✅ Yes, `createdBy` |
| Edit or delete a past rate | **Block** | **Block** | Block | The action does not exist |

**Keep `rates.edit` separate from `rails.edit`.** They are different acts: one is commercial and one is operational, and the same person does not necessarily do both. The `?` rows are the unsettled HQ permission depth, already an open decision on the console guide.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| **New** | A rate is changed while a payment link is live at the old rate | ⚠️ Resolution is by capture date, so the link captures at whatever is in force then. **Propose as a new EC** | `05-edge-case-catalog.md` |
| **New** | A rail is disabled while a link is outstanding | ⚠️ Undefined. Does the link still pay? **Propose as a new EC** | Same |
| **New** | Two rate rows share one `effectiveFrom` | ⚠️ Resolution says newest wins, which makes `createdAt` the tiebreak. Should be explicit | Same |
| EC-19 | Captured versus booked gap | ⚠️ The rate card prices what is captured. It cannot see what is not | [Reporting PRD](./prd-reporting-csv-first-2026-08-16.md) |

🔴 **Three proposed edge cases, none currently in the catalog.** The first two are live-money cases in a feature that shipped.

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `rate` on the payment record, snapshotted at capture | Per capture | Payments log, HQ Partner Dashboard, settlement, Cami billing | 🔴 **New, and the load-bearing one** |
| `RateRow` history with `createdBy` and `createdAt` | Per change | Audit, and answering "what applied in March" | 🔴 New, no backend |
| `rail.toggled` with actor and timestamp | Per toggle | Audit. **Missing today** | 🔴 New |
| Cami revenue per Partner per period, derived from stored rates | Per Partner per period | `JOB-AMG-OPS1` | 🔴 New. Not in this slice |

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| Full settlement config: gateway credentials, payout accounts, batch timing | Separate surface, separate spec | [Merchant settlement PRD](./prd-merchant-settlement-2026-08-16.md) |
| Business-app changes | The Partner only sees which rails appear at checkout | — |
| Per-location rates | Level declared, overrides not built (INV-10) | Multi-location, v0.3 |
| Reminder pricing, add-on pay-as-you-go, method re-ordering | Later sections of the same Settings tab | Future HQ passes |
| **How Cami collects its take on terminal volume** | The rate card says what the rate is. It cannot make money move that never passes through Cami | BRD R11. Unowned |
| A revenue view per Partner | Reads these rates. Different surface | Reporting BRD R8 |
| Showing the Partner their own rate | `JOB-OWN-PAY2` is real and this is not the surface for it | A commercial decision, then a Business-app surface |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| A backend for HQ CamiPay config | 🔴 Does not exist. localStorage today | `HQ-E1` to `HQ-E4` being real |
| Capture-time rate snapshotting in CamiPay | 🔴 Not built | `HQ-E5`, which is the whole point |
| HQ audit log covering config toggles | ⚠️ Auth events audited, config toggles not | The two attribution gaps |
| Reporting fact tables | 🔴 Architecture unfinalized | The revenue view, deferred |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| OS Team | Persistence, capture-time snapshot, toggle attribution | Faisal |
| Commercial | Which rates are actually in force per Partner today, so the data is not seeded from memory | Maaz |
| Product | Interview an Account Manager and correct the Dana persona | Michelle |

**External:** none. This is an internal surface.

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | Capture-time rate snapshotting (`HQ-E5`) | Everything downstream reads it. **The UI protects nothing without it** |
| 2 | Persistence behind the existing store shape | The store's missing actions are the API contract. Keep them missing |
| 3 | Attribution on rail and gateway toggles | Closes the INV-08 gap |
| 4 | Seed real rates per Partner | Gate to billing from this rather than from a spreadsheet |
| 5 | Revenue view per Partner | Not this slice. Reporting BRD R8 |

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Mock data in localStorage | Discarded. Real rates are seeded from the commercial record, not migrated from mock | Nobody. Internal surface |
| Partners currently billed from a spreadsheet | Seeded with an `effectiveFrom` on or before their first transaction, so history resolves | Maaz, once, to confirm each figure |
| Transactions already captured with no stored rate | 🔴 **Cannot be retro-rated correctly.** State the gap and the date the stored rate begins | Michelle, to finance |
| Rails currently on for everyone by default | Audited once against settle-readiness before the toggle becomes meaningful | Dana, per account |

⚠️ **Row three is the migration risk.** Every capture before snapshotting ships has no rate on it, so any historical revenue figure is a reconstruction. Name the cutover date and treat everything before it as estimated.

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| **Capture-time snapshotting is never built, and reports read the current rate** | **B** | 🔴 High. It is not built today | Every rate change silently re-rates history, which is the exact bug this feature exists to prevent | Put `HQ-E5` first on the critical path, ahead of persisting the UI | Faisal |
| The shipped UI reads as done, so the backend is deprioritized | **B** | 🔴 High. It looks finished | The register says trace ✅ while nothing persists | This PRD. The register row now reads "UI only" | Michelle |
| Rail toggles stay unattributed | **B** | Medium | Nobody can say who turned money on for a Partner | One field. Fix with persistence, not later | Faisal |
| The screen serves two roles that were assumed to be one | **U** | Medium | Onboarding and account management may be a handoff, and the surface fits neither | Interview an Account Manager. It is one conversation | Michelle |
| Rates are seeded from memory | **B** | Medium | The system of record starts wrong, permanently, because rows are append-only | Maaz confirms each Partner's figure in writing before seeding | Maaz |
| A rate change lands mid-link and surprises someone | **F** | Low | A capture at an unexpected rate | Make the tiebreak and the mid-link behavior explicit, as new edge cases | Faisal |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | **When does capture-time rate snapshotting ship?** | `HQ-E5`, and every downstream money report | Faisal | Before any revenue is billed from the product |
| 2 | Does `hq_admin` get `rails.edit` and `rates.edit`, or only `super_admin`? | Two rows of the permissions table | Michelle | Before persistence |
| 3 | What is the cutover date before which historical rates are estimated? | The finance story on any pre-cutover revenue figure | Michelle + Maaz | With Question 1 |
| 4 | Does a live payment link still pay when its rail is disabled? | A live-money edge case in a shipped feature | Faisal | Before persistence |
| 5 | Are onboarding and account management one role or two? | Whether this surface fits its user at all | Michelle | Not blocking, but it invalidates the persona if wrong |
| 6 | Do we ever show the Partner their own rate (`JOB-OWN-PAY2`)? | Nothing here. A commercial decision worth making deliberately | Maaz | Not blocking |

---

## Before finalizing

- [ ] `HQ-E1` to `HQ-E5` added to `feature-mappings/cami-hq/cami-hq-console.md` as a new group E
- [ ] The three proposed edge cases are added to `05-edge-case-catalog.md` with EC numbers
- [ ] The register row for Cami-HQ Rate Card reads "UI only, no backend" rather than trace ✅
- [ ] Question 1 has a date
- [ ] Permissions table has zero "?" rows (Question 2)
- [ ] An Account Manager has been interviewed, or the Dana citations here are relabeled 🔴 (Question 5)

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | 2026-08-16 | ⏳ Draft |
| Engineering | Faisal | — | Pending |
| Commercial | Maaz | — | Pending, and owns seeding the real rates |
| Design | Anum | — | ✅ Shipped as PRO-737. No new design work in this PRD |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write, **after ship**. Mints `HQ-E1` to `HQ-E5` for the console guide's missing group E. **Names the two gaps behind a screen that looks finished: capture-time rate snapshotting (`HQ-E5`) is the actual requirement and is not built, and rail toggles are unattributed against INV-08.** Proposes three new edge cases, all live-money |
