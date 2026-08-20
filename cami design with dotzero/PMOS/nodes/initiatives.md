# Initiative Register

**One question:** for every thing we are building, what objective does it serve and what artifact proves it?
**Node:** sits between node 1 (Objective) and node 4 (BRD) in [the chain](../work/_templates/chain.md). Referenced by [goals.md](../context/goals.md).
**Built from:** the **newer roadmap image** (supersedes the 17 Aug PDF on bucket placement), `Cami_Priorities_August.pptx.pdf`, [roadmap-2026-08-16](../work/strategy/outputs/roadmap-2026-08-16.md), the BRD and PRD sets, and Michelle's 16 Aug decisions (multi-location dated Q4; MOAT holds Aug/Sept).
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **Fourteen initiatives.** Twelve now trace to a product goal, up from eight, after adding OBJ-P5 (money path) and OBJ-P6 (multi-location).
2. **Multi-location is dated Q4.** v0.3, Sep to Nov, Tier 1 go-live Q4. Both the PDF ("Later") and the newer image ("September") are superseded by the decision.
3. **Boarding calendar and Migration moved into September** on the newer image. Boarding is now the only scheduled item with **named** demand, and it still has no goal, no BRD, and no PRD.
4. **The MOAT holds August and September.** The META gate is on shipping, not building (INV-C2), so the substrate is built ahead of the gate.
5. **Two problems remain, opposite shapes.** Dynamic Pricing is an initiative with no objective, job, or decision record. Self-serve onboarding (OBJ-P3) is a goal with no initiative on either roadmap.
6. **The whole August slot now has upstream artifacts.** Three BRDs, five PRDs, three JTBD outputs, written 16 Aug. August is the first slot where every initiative traces the full chain from objective to use-case ID.

---

## The register

**Legend:** ✅ traced · ⚠️ partial · 🔴 missing

| # | Initiative | Serves | Product goal | Slot | BRD | PRD | Linear | Trace |
|---|---|---|---|---|---|---|---|---|
| 1 | **CamiPay Online** | OBJ-B3 | **OBJ-P5** | August | ✅ [shared](../work/specs/brd/camipay-capture-brd.md) | ✅ [PRD](../work/specs/prd/prd-camipay-online-2026-08-16.md) | — | ✅ `CP-A*`, `CP-C*`, `CP-D1` |
| 2 | **CamiPay POS Terminal** | OBJ-B1, OBJ-B3 | **OBJ-P5** | August | ✅ [shared](../work/specs/brd/camipay-capture-brd.md) | ✅ [PRD](../work/specs/prd/prd-camipay-terminal-2026-08-16.md) | PRO-982, PRO-983 | ✅ `CP-B*`, `CP-C2` |
| 3 | **CamiPay Settlements** | OBJ-B3 | **OBJ-P5** | August | ✅ | ✅ | ✅ [project](https://linear.app/getcami/project/merchant-settlement-fa73a29bdf06), DSG-73 to DSG-78, PRD-56 | ⚠️ **live blocker: no mechanism for Cami's take on terminal** |
| 4 | **Reporting (CSV-first)** | OBJ-B1 | OBJ-P4 | August | ✅ [BRD](../work/specs/brd/reporting-brd.md) | ✅ [PRD](../work/specs/prd/prd-reporting-csv-first-2026-08-16.md) | — | ✅ `RP-A*`, `RP-B*`, `RP-C1` |
| 5 | **Agentic AI Platform** | OBJ-B1 | OBJ-P1 | August | ✅ [BRD](../work/specs/brd/agentic-ai-platform-brd.md) | ✅ [PRD](../work/specs/prd/prd-agentic-ai-platform-2026-08-16.md) | Tech 9.x | ⚠️ `IX-*` cited, `AI-*` minted and **needs a feature guide** |
| 6 | **Cami-HQ Rate Card** | OBJ-B3 | **OBJ-P5** | August | n/a, single feature | ✅ [PRD](../work/specs/prd/prd-camihq-rate-card-2026-08-16.md) | PRO-737 **UI only, no backend** | ⚠️ `HQ-E*` minted. **`HQ-E5` capture-time rate snapshot is not built** |
| 7 | **Boarding Calendar** | OBJ-B1 (**6 named pipeline operators**) | 🔴 **none** | **September** | 🔴 | 🔴 | — | 🔴 **scheduled with no goal and no spec** |
| 8 | **Migration (off Fresha)** | OBJ-B1, OBJ-B2 | 🔴 **none** | **September** | 🔴 | 🔴 | — | ⚠️ switching cost is the Fresha counter-move |
| 9 | **Inbox, CRM** | OBJ-B1 | OBJ-P1 | **September** | 🔴 | 🔴 | — | ⚠️ **moved out of Completed**, externally shown as done |
| 10 | **Smart Marketing** | OBJ-B1, OBJ-B2 | OBJ-P1 | September | 🔴 | 🔴 | — | ⚠️ named the MOAT feature |
| 11 | **Two-Way Intelligence** | OBJ-B1 | OBJ-P1 | September | 🔴 | 🔴 | — | ⚠️ gated on META (INV-C2) |
| 12 | **AI Reporting** | OBJ-B1 | OBJ-P4 | September | 🔴 | 🔴 | — | ⚠️ ADR-024 calls it v2 |
| 13 | **Multi-Location** | OBJ-B1 (gates Tier 1) | **OBJ-P6** | **v0.3, Sep to Nov. Tier 1 go-live Q4** | ✅ | ✅ | PRD-43, PRO-71 | ✅ |
| 14 | **Self-serve onboarding** | OBJ-B2 | OBJ-P3 | 🔴 **on neither roadmap** | 🔴 | 🔴 | — | 🔴 **goal with no initiative** |
| — | **Dynamic Pricing** | 🔴 **none** | 🔴 **none** | PDF September, absent from the newer image | 🔴 | 🔴 | — | 🔴 **untraceable, and possibly already dropped** |

In Later with no objective attached: Group Bookings, Loyalty/Memberships, Custom Branding, Custom Mobile App, Finance Integration, Vet Workflows, GA tracking, CamiPay EU/APAC. Backlog, not initiatives, until one gets a goal.

---

## What changed on 2026-08-16

| Change | Effect |
|---|---|
| **Newer roadmap image adopted** over the 17 Aug PDF | Boarding Calendar and Migration move Later → September. Inbox/CRM moves Completed → September |
| **Multi-location dated Q4** (Michelle) | Overrides both sources (PDF said Later, image said September). Resolves the deck's self-contradiction: its legend said Multi-Location "unlocks Tier 1 operators" while the plan listed it as Later and kept Tier 1 in Q4. Tier 1 holds Q4, multi-location ships v0.3 |
| **MOAT holds Aug/Sept** (Michelle) | Overrides the newer image, which pushed Agentic AI, Two-Way Intelligence, and AI Reporting to Later. Rationale: META gates *shipping*, not *building* (INV-C2), so the substrate is built ahead of the gate |
| **OBJ-P5 opened** (money path) | Four initiatives had no product goal above them. Settlement in particular carried a BRD, a PRD, 40 requirements, and a build blocker with nothing holding it accountable |
| **OBJ-P6 opened** (multi-location) | The initiative had a BRD, a PRD, and a Linear project, and still no goal |
| **ADR-009 now has a trigger** | It said "deferred to post-SOTA". SOTA is waitlisted, so post-SOTA is not a date. v0.3 is |
| **Upstream artifacts written for the whole August slot** | Initiatives 1, 2, 4, 5, and 6 now carry nodes 2 through 5. **Three new BRDs** (CamiPay capture, Reporting, Agentic AI), **five new PRDs**, and **three new JTBD outputs** minting `JOB-CLI-*`, `JOB-RCP-*`, and `JOB-OWN-KNOW3` to `KNOW5`. August is the first slot where every initiative traces objective → job → evidence → BRD → PRD → use-case ID |

**What writing them surfaced.** Five findings that had no artifact holding them before:

| # | Finding | Where it lives now |
|---|---|---|
| 1 | **Cami has no mechanism to collect its take on terminal volume.** Terminal money goes NeoPay to merchant directly. The revenue model has no collection point on the rail carrying the majority of volume | [CamiPay capture BRD](../work/specs/brd/camipay-capture-brd.md) R11. Already gap 2 below, now with an R-number |
| 2 | **The agent has no written boundary of unsupervised action.** Overlap, deposit waiver, and price quoting are all undefined for an AI, and three of them are undefined for humans too | [Agentic AI BRD](../work/specs/brd/agentic-ai-platform-brd.md) R7, drafted as a permissions table in its [PRD](../work/specs/prd/prd-agentic-ai-platform-2026-08-16.md) |
| 3 | **The AI is scoped to the smaller half of the front desk's day.** The MVP capability list covers inquiry-to-booking. The validated dominant workload is reschedule and duplicate-catching | [jtbd-receptionist](../work/discovery/outputs/jtbd-receptionist-2026-08-16.md) |
| 4 | **`RP-B2` is law, is Broken on `main`, and is upstream of every reporting export.** ADR-024's ship-now set is also two files short of closing a day | [Reporting BRD](../work/specs/brd/reporting-brd.md) R2, R5 |
| 5 | **The rate card looks finished and its actual requirement is not built.** `HQ-E5`, snapshotting the rate onto each transaction at capture, is what the whole refusal-model UI exists to protect | [Rate card PRD](../work/specs/prd/prd-camihq-rate-card-2026-08-16.md) |

---

## The five gaps, ranked

| # | Gap | Shape | First step |
|---|---|---|---|
| 1 | **Boarding calendar is scheduled with nothing under it** | September slot, 6 named operators, **no goal, no BRD, no PRD, no use-case IDs** | It went from best-evidenced-unscheduled to worst-specified-scheduled in one move. It is now the nearest-term delivery risk on the board. Write the BRD, or move it back |
| 2 | **Settlement's terminal blocker** | Cami never holds terminal money, so there is nothing to deduct the take from, and terminal is majority volume | Answer it this week or Settlements is not an August item. ✅ 2026-08-20: the [Linear project](https://linear.app/getcami/project/merchant-settlement-fa73a29bdf06) now exists, with milestones mirroring BRD groups A to E. **Only group D has tickets. The payout run itself (group C) is unticketed** |
| 3 | **Dynamic Pricing** | Initiative with no objective, no persona job, no ADR, and now absent from the newer image | Confirm it is dropped. If it is not, sponsor it with a decision record |
| 4 | **Self-serve onboarding** | Goal (OBJ-P3), no initiative on either roadmap | The low-CAC engine for OBJ-B2's 36 partners. Either it returns or OBJ-P3 is retired explicitly. Silently dropping it is the failure mode |
| 5 | **Inbox/CRM left Completed** | Was shown externally as done, now September | Have the reason ready before the deck is shown again |

---

## Trace rule

An initiative belongs on this register when it has an objective above it. If it cannot cite one, it is a backlog item, not an initiative. See [chain.md](../work/_templates/chain.md), "What each link must cite".

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Created to resolve the dangling reference in `goals.md`. Records the multi-location dating decision, opens OBJ-P5 and OBJ-P6, and names the four remaining traceability gaps |
| 2026-08-16 | **August slot fully traced.** Flipped BRD and PRD columns for initiatives 1, 2, 4, 5, and 6. Downgraded the Cami-HQ Rate Card trace from ✅ to ⚠️: the Linear work shipped a UI on mock data, and the requirement it exists to serve (`HQ-E5`) is not built. Recorded the five findings the artifacts surfaced |
