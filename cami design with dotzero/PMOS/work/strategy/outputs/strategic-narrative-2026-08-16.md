# Strategic Narrative: The August reprioritization

**Audience:** Exec team (CEO, Maaz, Faisal). Adaptation notes for board, engineering, and operators at the end.
**Narrative Type:** Change. "Here is what shifted and how we respond."
**Framework:** Sparkline (Duarte). Alternates what is against what could be. Fits a priorities deck, where the audience already knows the facts and needs the *shape* of the change argued.
**Date:** 2026-08-16
**Owner:** Michelle

> **Roadmap reconciled 2026-08-16.** Three sources disagreed. The **newer roadmap image** wins on bucket placement over `Cami_Priorities_August.pptx.pdf`, with two owner overrides: **multi-location is Q4** (both sources were wrong, one said Later, one said September) and **the MOAT holds August/September** (the image had pushed it to Later). Row-by-row resolution is in [product.md](../../../context/product.md).

---

## TL;DR

1. **The wedge is switched off and the roadmap has responded correctly.** META restarted at stage 1 of 3 on 8 Aug. Payments and the money loop moved left.
2. **But the moat is not deferred, and that is the sharpest thing in this story.** META gates *shipping* WhatsApp comms, not *building* them (INV-C2). So we build through the gate and switch on the day it clears, instead of starting then.
3. **The strongest argument in the room is not the vision, it is a queue.** 6 boarding operators are waiting on one feature. That is the only dated, named demand Cami has.
4. **Multi-location is now dated: v0.3, Tier 1 live Q4.** It is third because it is a multiplier, not because it is worth less.
5. **Two things are not credible as drawn.** Settlements sits in August with a live blocker (we cannot take our fee on terminal). Boarding Calendar sits in September with no BRD, no PRD, and no IDs.

---

## Your Context

*Pulled from the files, not assumed:*

| Layer | What it says |
|---|---|
| **Strategic position** | Payments-led, OS free, revenue is processing margin (ADR-001, INV-P4). UAE live, KSA gated on data sovereignty (INV-A3) |
| **Product state** | 7 signed, 2 Tier-3 live. SOTA waitlisted "until key features built." Unibox build-ready, blocked on META stage 1 of 3 |
| **User reality** | Owner buys on the receptionist's pain. Owner's money jobs (`JOB-OWN-PAY1/2/3`) are inferred, no owner interviewed. 6 boarding operators in pipeline |
| **Competitive** | Fresha on SOTA's real account: 58% subscription, 2.6x its processing revenue, roughly 1.3% of GMV extracted all in |
| **Objectives** | OBJ-B1 to B3 unchanged. **OBJ-P5 (money path) and OBJ-P6 (multi-location) opened 2026-08-16**, closing both goal-layer orphans |

---

## The Narrative

### 1. Shared Reality

Cami has been live and monetizing since 1 July. Seven operators signed, two live, roughly $35K combined GMV. The plan everyone agreed to was clear: WhatsApp-native AI scheduling wins the deal, the OS underneath stops the churn, and the checkout pays for all of it.

Everyone in this room can still recite that sentence. The first clause is currently unshippable.

### 2. The Shift

Three things changed, and only one of them was ours.

**META reset the clock.** On 8 August the WABA was unrestricted, which sounded like progress and was not. Cami went back to stage 1 of a three-stage chain with no ETA. The Unibox and the AI Receptionist are built. They are not shippable. That is an external gate (INV-C2), and Coexistence does not lift it.

**Fresha turned out to be a subscription business.** Read off SOTA's live account for 16 days of August: 58% of what Fresha takes is subscription, 2.6 times its card processing. All in, Fresha extracts about 1.3% of that operator's GMV. To match that on a 2.5% blend, Cami has to capture roughly a third of their GMV. Deposits alone are about 5%. **The payment link cannot get there. Only the terminal can.**

**The Tier 2 anchor stopped being a date.** SOTA is waitlisted until features land. So the question changed from "how do we land this account" to "which features unlock a queue of accounts."

### 3. The Possibility

Stop selling one logo at a time. Sell into two named queues, and stop treating the Meta gate as a reason to wait.

**Boarding operators.** Six of them, already in the pipeline, waiting on one feature. Not a segment estimate. Six.

**Chains.** Chaps & Co runs nine locations. Multi-location is the only thing between Cami and every Tier 1 conversation, and Tier 1 is $250K+ GMV at $500 to $3,000 of Cami revenue per account.

**And the moat gets built during the gate, not after it.** This is the part that is easy to get wrong. META blocks us from *sending*, not from *building*. If we defer the Agentic AI Platform and the CRM layer until verification clears, we convert an external delay into an internal one and start from zero on the day we are finally allowed to ship. Instead, August builds the substrate and September builds the features, so the switch is thrown the week the chain clears, on top of real transaction history.

Underneath all of it, an August that closes the money loop end to end: online links, the terminal, settlements, the rate card, and reports a finance person can tally a day with. When that is done Cami is not a booking tool waiting on a Meta queue. It is the checkout, and the checkout is the business.

### 4. The Stakes

**If we act.** August closes the money loop, so every captured dirham has a rail, a rate, and a payout. September opens a category with named demand and makes leaving Fresha frictionless rather than heroic, while the moat finishes building behind the gate. Q4 takes Tier 1 live on a rail that already works. Cami enters Q4 with demand in two verticals instead of one waitlisted logo.

**If we do not.** Revenue stays gated on a verification queue nobody in this company controls. Cami holds at 2 live accounts against a target of 36 by year end and a $94.6K revenue reforecast. The six boarding operators are in someone's pipeline. They will not stay in ours.

### 5. The Path

| When | What ships | What it unlocks |
|---|---|---|
| **August** | CamiPay Online, POS Terminal, **Settlements**, Reporting, HQ Rate Card, **Agentic AI Platform** | The money loop: capture, take rate, payout, and a report that reconciles. Terminal is the rail that moves volume. The AI substrate starts now so September is not a standing start |
| **September** | **Boarding Calendar**, **Migration**, Inbox and CRM, Smart Marketing, Two-Way Intelligence, AI Reporting | One category with six named operators, frictionless switching off Fresha, and the moat finished and waiting on the gate |
| **Q4 (v0.3, Sep to Nov)** | **Multi-Location** → Tier 1 go-live | Chains. The largest per-account revenue unlock on the roadmap, landing on a checkout that already works |
| **Later** | Group Bookings, Loyalty, Custom Branding, Mobile App, Finance Integration, Vet Workflows, GA tracking, CamiPay EU/APAC | Backlog. None of these has an objective above it yet |

**The one sentence that holds it together:** we are shipping the half of the product that is not waiting on Meta, and pre-building the half that is.

**Why multi-location is third and not second.** It multiplies captured volume per account by the number of sites, which means it multiplies whatever the money path is doing. Today that path ends in a person at Crescent paying merchants by hand. Nine locations onto that is nine times the manual work, arriving at the first payout, which is exactly where Dana's job says the relationship is won or lost. Multipliers go after the thing they multiply.

### 6. The Proof

| Evidence Type | Detail | Source |
|---|---|---|
| Data | Fresha takes ~1.3% of SOTA's GMV all in, 58% of it subscription, 2.6x its processing line. Cami must capture ~34% of GMV to match on a 2.5% blend | competitors.md, read off SOTA's live account, 16 days of Aug 2026. **One account** |
| Data | Deposits are ~5.4% of SOTA's GMV. The link alone cannot close the gap to 34% | goals.md, closed 2026-08-16 at ~3x the Tier 2 floor |
| Data | Tier 1 is $250K+/mo GMV at $500 to $3,000 Cami revenue per account, versus $50 to $100 at Tier 3 | Deck p15/p16, personas.md tier table (bands updated 2026-08-16) |
| Customer signal | **6 pet boarding operators in the pipeline** waiting on the Boarding Calendar | 17 Aug priorities deck, roadmap annotation |
| Customer signal | Chaps & Co, 9 locations, gated entirely on multi-location | personas.md tier table, ADR-009 |
| Customer signal | SOTA "waitlisted in Cami pipeline until key features built" | 17 Aug deck. ⚠️ **Which features is still unanswered.** Open question in goals.md |
| Precedent | Fresha monetizes subscription plus processing plus marketplace. Cami's free OS is a real differentiator against Fresha as actually sold | competitors.md, corrected 2026-08-16 |
| Early results | Terminal converts better for the payer too: online has four failure points, the counter has one | personas.md, Noor. ⚠️ **Inferred from the edge-case catalog, zero payers observed** |
| Early results | 🔴 **No data on capture rate at any live account.** The central claim of this narrative, that the terminal closes the gap, is unmeasured | Nothing instrumented. EC-19 has no flag, node 12 does not exist |
| Business case | 🔴 **No revenue model for the September items.** What does one boarding operator pay per month | Not in any file read |
| Requirements | 🔴 **Boarding Calendar has no BRD, no PRD, no use-case IDs**, and it is a September item | [initiative register](../../../nodes/initiatives.md) |

---

## Narrative Stress Test

### Weak points

| Test | Finding | How to address |
|---|---|---|
| **So What?** | Urgency is real but only one number carries it: 6 boarding operators. Everything else is a target date, not a demand signal | Name the six. If they cannot be named, the number is not evidence and the argument thins to a plan |
| **Why Not?** | **Boarding Calendar is the nearest-term delivery risk and it is the thing you are leading with.** It went from best-evidenced-unscheduled to worst-specified-scheduled in one move: a September slot with no goal, no BRD, no PRD, no IDs | Do not let someone else find this. Say it: the demand is named, the spec is not, and the BRD lands this week or the date moves. Leading with an unspecified feature is how a queue becomes a broken promise |
| **Why Now?** | **Settlements is in August with a live blocker.** On terminal, Cami never holds the money, so there is nothing to deduct our fee from, and terminal is the majority of volume. No Linear project either | Split the scope in the room: what ships in August (payment log, payout visibility per merchant and date) versus what is a Q4 commitment (automated payout, the Noon migration). Or answer the terminal-take question this week |
| **Why You?** | Weakest of the four. The stated unfair advantage is WhatsApp-native, and it is currently switched off | Do not claim the wedge you cannot ship. Claim the one that is real today: Cami is the only vendor in the room with the operator, on local rails, able to change the product this month, and with a free OS against a competitor billing a subscription |
| **Why Now?** (multi-location) | Q4 is right, but **no chain operator has ever been interviewed.** The requirements are derived from Fresha's model and the shipped spine | Own it as scoping-grade, not workflow-grade. One chain-operator conversation before v0.3 build starts either confirms Omar's SET1/SET2 jobs or kills them. Also confirm whether Chaps & Co is one legal entity or nine, because if it is nine the container is workspaces, not locations |

### The four that will actually be asked

1. **"Multi-location was Later last week, then September, now Q4. Which is it?"**
   Q4, and the reason it moved is not multi-location. SOTA stopped being a date, so the plan cannot rest on one account. Multi-location and boarding are the two features with a *named queue* behind them. Boarding is small and goes in September. Multi-location is twelve modules and a multiplier, so it goes after the checkout it multiplies, with Tier 1 live in Q4.

2. **"If Meta is blocked, why are we building AI in August?"**
   Because Meta blocks sending, not building. If we wait for verification to start, we start from zero on the day we are finally allowed to ship, and the gate has no ETA. Building through it means we switch on that week, on top of real transaction history. The only thing deferring buys us is capacity, and we are spending that capacity on the money loop instead.

3. **"CamiPay Settlements is in August. Is it?"**
   Not as drawn. It has a BRD, a PRD, and 40 requirements. It also has an unanswered blocker: on terminal, Cami never holds the money, so there is nothing to deduct our fee from, and terminal is the majority of volume. Either that gets answered this week or Settlements is a partial August item and the rest is Q4.

4. **"Inbox and CRM was on the Completed list. Now it is September."**
   It has been shown externally as done. Have the reason ready before this deck goes out again.

---

## Key Phrases

**Hallway version (30 sec):**
> "Meta reset our clock, so we stopped waiting. August closes the checkout. September opens boarding, where six operators are already queued, and finishes the AI layer so it switches on the day Meta clears. Q4 takes chains live."

**Elevator version (2 min):**
> "We planned for AI scheduling to win the deals and the OS to hold them. On 8 August Meta put that half back to stage one of three with no ETA. At the same time we read a real Fresha invoice and learned they extract about 1.3% of an operator's GMV, mostly as subscription. To match that we need to capture about a third of GMV, and the payment link cannot do it. The terminal can. So August closes the money loop: terminal, settlements, rate card, reports. September opens the one category with an actual queue, six boarding operators, makes switching off Fresha frictionless, and finishes the AI layer behind the gate so it ships the week Meta clears rather than starting then. Q4 is multi-location and Tier 1, because multiplying revenue across nine sites only makes sense once one site works end to end."

**Email subject line:**
> "August closes the checkout, September opens the queue, Q4 takes chains live"

**Repeatable sound bite:**
> "We are shipping the half of the product that is not waiting on Meta, and pre-building the half that is."

**The one for the pricing conversation:**
> "Fresha's biggest line item on that account is not the card fee. It is the subscription. Ours is zero."

**The one for the sequencing question:**
> "Multi-location multiplies the money path. Multiply it before it works and you multiply the failures."

---

## Audience Adaptation Notes

| Audience | Lead with | Emphasize | De-emphasize |
|---|---|---|---|
| **Board / investors** | The Fresha extraction number and what capture rate is needed to match it | The reforecast (OBJ-B3), the terminal as the volume rail, named pipeline over logos, Tier 1 dated for Q4 | The Meta timeline. State it as an external gate with a mitigation, do not spend the meeting on it |
| **Exec team** (this version) | The shift, then the trade-off made explicit | That the moat is being built *through* the gate, and that boarding is scheduled ahead of its spec | The August list. It is mostly in flight already |
| **Engineering** | The operator problem: six businesses cannot use Cami because the calendar does not do boarding | Multi-location as a structural change (location as an operating dimension), not a UI switcher. INV-01: location cannot be retro-added to append-only rows. The two cheap moves available now | Business metrics. Give them the queue, not the reforecast |
| **Pilot operators** | Their own pain, then dates | What lands when, and that switching from Fresha is being made frictionless (Migration) | Internal sequencing, the Meta gate, and anything about the moat |

---

## What this narrative obligates you to fix

Not part of the pitch. Consequences of writing it.

| Item | Why |
|---|---|
| **Answer the terminal-take question** | The load-bearing claim of the whole story. The terminal is the rail that closes the Fresha gap, and we cannot currently take our fee on it |
| **Name the 6 boarding operators** | The single strongest number in the narrative. Unattributed, it is a rumor |
| **Write the Boarding Calendar BRD** | It is a September commitment with no requirement behind it. This is now a nearer-term risk than anything in multi-location |
| **Confirm Chaps & Co: one entity or nine** | A phone call, and it gates the whole v0.3 scope. Nine entities means workspaces, not locations |
| **Supersede ADR-009** | Its trigger was "post-SOTA", which can no longer fire. The trigger is v0.3, and INV-B4 lifts on v0.3 ship |
| **Instrument capture rate** | The narrative asserts the terminal fixes capture. Nothing measures capture. EC-19, node 12 |
| **Confirm Dynamic Pricing is dropped** | In the PDF's September, absent from the newer image, traces to no objective either way |

---

## Chain

**Slug:** n/a, strategy output · **This node:** upstream of 4 BRD, feeds 1 Objective · **Last checked:** 2026-08-16

| Dir | Node | Artifact | State |
|---|---|---|---|
| ↑ | 1 Objective | [goals.md](../../../context/goals.md) OBJ-B1, OBJ-B3 | ✅ **OBJ-P5 and OBJ-P6 opened 2026-08-16**, closing the two goal-layer orphans this narrative depended on |
| ↑ | 3 Evidence | competitors.md Fresha correction · 17 Aug deck · newer roadmap image | ⚠️ one Fresha account, zero payers observed, no chain operator, capture unmeasured |
| ↔ | A Law | ADR-001, ADR-009, INV-C2, INV-P4, INV-A3, INV-B4, INV-01 | ⚠️ ADR-009 needs superseding |
| ↓ | — Initiatives | [initiative register](../../../nodes/initiatives.md) | ⚠️ 12 of 14 traced |
| ↓ | 4 BRD | [multi-location](../../specs/brd/multi-location-brd.md) · [merchant-settlement](../../specs/brd/merchant-settlement-brd.md) | ✅ both exist |
| ↓ | 4 BRD | Boarding calendar | 🔴 **September commitment with no BRD, no PRD, no IDs** |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Built on the updated roadmap image; the PDF deck could not be read on that machine. Change narrative, exec-team default audience |
| 2026-08-16 | Roadmap reconciled across the PDF, the newer image, and two owner decisions: **multi-location dated Q4** (not September, not Later) and **the MOAT holds Aug/Sept** (not deferred). Reframed the moat from a deferral-with-a-trigger to build-through-the-gate. Replaced the "moat retreat" weak point with the boarding-calendar specification gap, which is now the nearer risk. Added OBJ-P5 / OBJ-P6 and the initiative register to the chain |
