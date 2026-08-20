# Goals

**Last updated:** 2026-08-16

**Source:** /welcome quick setup, enriched via /enhance-context, deepened via /set-goals (Tech Roadmap Aug-Dec 2026; Investment Committee update, 1 July 2026)

---

## Strategic Narrative

> Our vision is to be the operating system every appointment-based service business in the UAE and KSA runs on, with booking, payments, and client relationships living inside the WhatsApp thread where the work already happens.
> Currently we are live (since July 1, 2026) and monetizing from month 1, with the first operators (roughly $250K total monthly transaction value) onboarding on NeoPay.
> By the end of 2026, we will win Tier 2 and grow to 36 active businesses.

> ⚠️ **Updated 2026-08-16.** The 17 Aug priorities deck says SOTA is **"waitlisted in Cami pipeline until key features built"**. The 10 August go-live did not happen. Tier 2 currently has no dated anchor account. **Confirm whether this is a slip or a decision**, and name which features unblock them.
> This drives the business by growing captured GMV and processing-margin revenue to $94.6K over 12 months while holding burn to $389K.
> This will empower customers to run their entire front desk from one WhatsApp thread, book, remind, and get paid, instead of juggling four disconnected tools.

### The H2 arc: capture, defend, expand

**Added 2026-08-16.** Derived upstream from the 17 Aug priorities, so every product goal below sits in one of three phases. Full version: [strategic-narrative-2026-08-16](../work/strategy/outputs/strategic-narrative-2026-08-16.md).

| Phase | Window | Goals | The one-line case |
|---|---|---|---|
| **1. Capture** | August | **OBJ-P5**, OBJ-P4 | We sell a free OS and earn on payments, and today money reaches the merchant by hand. Nothing else compounds until this closes |
| **2. Open the queues** | September | OBJ-P2, **OBJ-P1** | Stop selling one logo at a time. Boarding (6 named operators) and Migration (frictionless exit from Fresha) are the only demand we can name, and the CRM/AI layer is what stops the account leaving again |
| **3. Expand** | Q4 (v0.3) | **OBJ-P6**, OBJ-P3 | Multi-location multiplies captured volume per account by the number of sites. It is Tier 1's only gate, and Tier 1 is where the GMV that makes processing margin work actually lives |

**Why this order and not another.** Each phase multiplies the one before it. Expand before capture multiplies a manual payout across nine locations. Selling into queues before the checkout works retains accounts we cannot bill properly. The sequence is a dependency chain, not a ranking of value.

**Why the MOAT is built during the META gate, not after it.** INV-C2 gates *shipping* WhatsApp two-way comms, not *building* them. The Agentic AI Platform (August) and the CRM/AI features (September) are built ahead of the gate so they switch on the day the three-stage chain clears, rather than starting then. A deferral would turn an external delay into an internal one.

⚠️ **OBJ-P3 (self-serve onboarding) is placed in phase 3 here but appears on neither roadmap.** Either it returns or it is retired. ⚠️ **Boarding calendar now has a September slot and still has no product goal, no BRD, and no PRD.** See Open Questions.

---

## Current Focus (H2 2026)

> 🔑 **The IDs below are load-bearing. Do not renumber them, and do not strip them when regenerating this file.** BRDs, PRDs, and the [initiative register](../nodes/initiatives.md) cite `OBJ-*` by ID. A renumber silently unlinks every artifact that traces to an objective. Add new objectives at the end of the series; retire one by marking it, never by reusing its number.

### Business Objectives

| ID | Objective | Measured by | Target |
|----|-----------|-------------|--------|
| **OBJ-B1** | **Land Tier 2** | Tier 2 operators signed | 3 to 5 by year-end |
| **OBJ-B2** | **Scale the active base** | Active businesses at period end | 36 by EOY 2026 (up from 12, 3x) |
| **OBJ-B3** | **Hit reforecast economics** | 12-month cumulative revenue and burn | $94.6K revenue (up 17%), burn held to $389K (from $411K) |

- **OBJ-B1 note:** first win was SOTA; **SOTA is waitlisted as of the 17 Aug deck and the target has no dated anchor**. A replacement anchor or a SOTA date is needed.

### Product Goals (How We Drive Business)

| ID | Product goal | Drives | Key results |
|----|--------------|--------|-------------|
| **OBJ-P1** | **Ship WhatsApp Unibox + two-way comms** (v0.2, Aug to Sep, gated on META) | OBJ-B1 | Unibox live once META unblocks, two-way comms activated, no-show-reducing reminders in-thread |
| **OBJ-P2** | **Make the Core OS feature-rich for a 30-staff Tier 2 operator** | OBJ-B1, OBJ-B2 | Permission sets for 30-staff roles, vouchers/gift cards, online booking + client/pet profiles, SMS/email notifications, inventory stock adjustments, CamiPay online + offline on NeoPay |
| **OBJ-P3** | **Stand up self-serve onboarding + data migration tooling** | OBJ-B2 (low CAC, Tier 3 volume) | Self-serve onboarding flow live, migration tooling in the onboarding path, SDR pipeline feeding it |
| **OBJ-P4** | **Ship the Reports module CSV-first** | OBJ-B1 (finance/compliance is a Tier 2 buying requirement), lays the CamiHQ BI foundation | 3-4 must-have CSV/Excel reports live now (sales log detailed, payments log, tips collected); analytics-dashboard views as v2; pipeline architected for both merchant-facing and CamiHQ cross-merchant BI from day one, not retrofitted. Scope is POS + booking analytics, not full accounting (opex stays in QuickBooks/Xero) |
| **OBJ-P5** | **Complete the money path** (CamiPay Online, POS Terminal, Settlements, HQ Rate Card) | OBJ-B3, and gates every other objective. Revenue is processing margin, and margin that never reaches a merchant's bank is not revenue | Terminal live (the rail carrying majority volume and the only route to the ~34% capture that replaces Fresha); settlement automated end to end, retiring the Crescent manual payout; a payout view a merchant and an Account Manager can both read; Cami's take collectible on **both** rails, including terminal |
| **OBJ-P6** | **Ship multi-location** (v0.3, Sep to Nov 2026) | OBJ-B1. It is the named and only gate on Tier 1 | Location is the operating scope for time, money, and inventory; identity and stored value stay business-shared; per-location ledger with shared tax identity and per-location receipt prefix; role × location grants. **Tier 1 go-live Q4 2026** |

> ✅ **Opened 2026-08-16, closing the two goal-layer orphans** found when the [initiative register](../nodes/initiatives.md) was built. Merchant settlement and multi-location each had a BRD and a PRD and no product goal above them. OBJ-P5 and OBJ-P6 give both an owner at the goal layer.
>
> **OBJ-P5 is the sequencing argument in one line:** it is not more valuable than OBJ-P6, it is *upstream* of it. Multi-location multiplies captured volume per account by the number of sites, so it multiplies whatever the money path does, including its failures. Settlement is still a manual hand-off through Crescent today. Multiplying that by nine locations is the risk OBJ-P5 exists to remove first.
>
> **Still unowned at the goal layer:** boarding calendar (6 named pipeline operators, best demand evidence on the board) and Dynamic Pricing (no objective, no persona job, no decision record). See the register's gap table.

### What We're NOT Doing

- CRM depth beyond the core. Foundation first, without the core OS in place Cami cannot capture the Cami Pay percentage.
- Tier 1 advanced integrations (multi-location, expense management, AI-reporting) before Q4. Parked until the Tier 2 foundation is solid.
- Offline / storefront POS for pure walk-in retail. Phase 2.
- Full Arabic UI localization. RTL-ready, not RTL-shipped at v1; the AI still replies in Arabic when messaged in Arabic.
- Deep non-pet vertical build before Sept to Dec. Beauty, clinics, and spas come online in the scale phase.
- Vets. Full clinical / practice management is ezyVet territory and not winnable now; do not spend pipeline on vet accounts. Tier 2 pet is boarding businesses (need a boarding calendar), not clinical vets.

**Post-SOTA sequencing:** once the core OS is bulletproofed on SOTA, priority moves to multi-location, then group bookings, then boarding calendar. This is the adoption driver that unlocks new categories (pilates, group-booking, boarding) and the path to enterprise (for example Chaps & Co's 9 locations).

> ✅ **Resolved 2026-08-16 (Michelle).** The 17 Aug deck moved multi-location, group bookings, and boarding calendar to "Later" with no dates while keeping Tier 1 in Q4, and its own legend still said Multi-Location "Unlocks Tier 1 Operators". Both could not hold.
>
> **Decision: multi-location gets a date and Tier 1 stays Q4.** Multi-location ships **v0.3, Sep to Nov 2026**, Tier 1 go-live **Q4 2026**. This restores the target already written in the [multi-location PRD](../work/specs/prd/prd-multi-location-2026-08-16.md) and in `product.md`'s version track; the deck's "Later" placement is superseded. Now carried by **OBJ-P6**.
>
> **Knock-on for ADR-009.** It defers multi-location "to post-SOTA". SOTA is waitlisted, so post-SOTA is not a date. The trigger is now v0.3, not a SOTA event. ADR-009 should be superseded by a record that says so, and **INV-B4 lifts on v0.3 ship, not before.**
>
> ⚠️ **Still open: boarding calendar.** The deck says **6 pet-boarding operators are in the pipeline waiting on it**. That is the strongest demand evidence on the board and it remains undated with no product goal above it. Smaller build than multi-location, one calendar type, opens a Tier 2 pet segment. Decide: give it a slot, or tell those 6 operators it is not coming.

### Success Metrics

| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| Active businesses | **7 signed, 2 live** (17 Aug deck; was "4 onboarding") | 36 | EOY 2026 |
| Tier 2 operators signed | 0 | 3 to 5 | Aug to Q4 2026 |
| 12-month cumulative revenue | reforecast baseline | $94.6K | 12 months |
| 12-month burn | $411K | $389K or better | 12 months |
| WhatsApp Unibox | build ready, blocked on META | live | ⚠️ Aug 2026 at risk, verification restarted 8 Aug |
| Avg transaction value | $75 | $50 (revised assumption) | ongoing |

---

## Open Questions

- [ ] META verification timeline for WhatsApp Unibox. **Updated 2026-08-08 (Maaz):** the WABA restriction is lifted, but Cami is back to **step 1 of three** (Business Verification → WhatsApp Verification → Tech Provider verification). No ETA. **The "Unibox live, Aug 2026" target below is not credible and needs rebasing**; Product Goal 1 and the August 90-day phase both assume it.
- [ ] **New:** run **Coexistence** as the interim comms bridge, yes or no? Phone-app WhatsApp on the live number needs no Business Manager verification, so a UAE team member could hold real conversations now and hand history to the API at cut-over. Costs a staffed manual inbox and does not unblock Unibox or the AI Receptionist. Needs an owner, a staffing decision, and a call on whether pilot operators are told. See product.md META state.
- [ ] When and how to internalize the tech team (outsourced to in-house) without slowing delivery.
- [ ] Non-pet sequencing in Q4: beauty vs clinics first.
- [ ] Take-rate stability across operators (spread is 1.8% to 3.5% today).
- [ ] Tip and commission margin handling: pass-through vs margin applied.
- [x] ~~Reconcile SOTA's stated GMV~~ **Closed 2026-08-16 at ~3x the Tier 2 GMV floor.** The 17 Aug deck (p16), the Jul 31 internal call, and the deck's market slide all agree on the higher figure, superseding the investor deck's ~2x-the-floor number. Knock-on: deposits are ~5.4% of SOTA's GMV (not ~8%), and capture needed to match Fresha's revenue is ~34% (not ~51%). Correct any doc still on the ~2x basis.
- [ ] **New, and now the single highest-value question:** is SOTA waitlisted by decision or by slip, and **which specific features unblock them**? OBJ-B1 has no dated anchor until this is answered. If the answer is settlement and terminal, it is also the strongest evidence for the OBJ-P5-first sequencing.
- [x] ~~does multi-location stay in "Later" while Tier 1 stays a Q4 target?~~ **Closed 2026-08-16.** Multi-location dated v0.3 (Sep to Nov), Tier 1 holds Q4. Now OBJ-P6.
- [x] ~~add OBJ-P5 and OBJ-P6, or state that both run without a product goal?~~ **Closed 2026-08-16.** Both added.
- [x] ~~promote the boarding calendar or tell the 6 pipeline operators it is not coming~~ **Closed 2026-08-16.** Promoted to **September** on the newer roadmap. **But it now carries the opposite risk:** it is scheduled with no product goal, no BRD, no PRD, and no use-case IDs, which makes it the nearest-term delivery risk on the board. Write the BRD or move it back.
- [ ] **New:** self-serve onboarding (OBJ-P3) is absent from the 17 Aug deck. Still a goal, or dropped? It is the low-CAC engine behind OBJ-B2's 36 partners, so dropping it silently changes the odds on a business objective.
- [ ] **New:** **Dynamic Pricing** (deck, September) traces to no objective, no persona job, and no decision record. Cut it or sponsor it.
- [ ] **New:** supersede **ADR-009**. It defers multi-location "to post-SOTA", but SOTA is waitlisted, so that is not a date. The trigger is v0.3. INV-B4 lifts on v0.3 ship.
- [ ] **New:** the deck lists Vet Workflows and maps multi-chain vet operators as a Tier 1 segment. ADR-006 says do not chase clinical vets. Reopened deliberately, or an accident?
- [ ] NeoPay terminal (POS): settlement and terminal-app decisions pending on NeoPay's side, blocking the majority-volume payment path.
- [ ] Reporting architecture not finalized (Aug 2026): Option 2 chosen, but strategic calls open, embedded reporting vs Power BI/BI-platform boundary, independent scaling from day one vs phased, AWS data lake now vs later, and non-functional targets (retention, SLA, RTO/RPO, freshness). ETAs held until Faisal signs off the architecture.
