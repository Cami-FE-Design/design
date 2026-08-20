# Template: PRD

**Use for:** any feature or capability going to engineering (`work/specs/outputs/prd-*.md`).
**Do not use for:** reference law (`context/knowledge/01-06`), design specs (`docs/specs/DSG-*`, `PRO-*`), or strategy memos. A PRD cites law, it does not create it.
**Adapted from:** `table-first.md` (shape and label sets), plus the section set proven in `prd-multi-location-2026-08-16.md` and `prd-merchant-settlement-2026-08-16.md`.
**Position in the chain:** link 4 of 10. See `chain.md` for what a PRD must cite upward and what hangs off it downward.
**Last updated:** 2026-08-20

---

## Scope boundary (read first)

| A PRD owns | Belongs elsewhere |
|---|---|
| The problem, evidence, and who has it | Discovery outputs (`work/discovery/`) |
| Requirements: what must be true when done | Implementation: how it is built (engineer) |
| Which jobs this serves, cited by ID | The jobs themselves and their scoring (`personas.md`, `work/discovery/outputs/jtbd-*`) |
| Sequencing intent (what must land before what) | Estimates, sprint dates, capacity (engineer) |
| Which law this depends on and which it changes | The law itself (`context/knowledge/01-06`) |
| Screen intent and states that carry a rule | Pixel and interaction spec (`docs/specs/DSG-*`) |
| Named build-state gaps as questions | Build-state audit of `main` (engineer) |
| Non-functional requirements stated as outcomes (retention, residency, consent, rate ceilings) | How they are met (schema, infra, encryption choice) |
| Which automations fire, to whom, on what trigger | Queue design, retry policy, webhook payloads |
| Release criteria keyed to use-case IDs | The test plan and its coverage (engineer) |

Do not assert what is already built, pre-pick an architecture, or price the work. State the requirement and let the engineer own the rest.

**Deliberately excluded, even when a vendor template has them:** data model, API specification, webhook payload schemas, test plan, delivery dates. Those are chain links 6, 8, 9, and 10, and they go stale inside two weeks. A PRD that carries them competes with the artifact that owns them.

---

## The shape

Required sections in order. A section with nothing in it is deleted, not left with "N/A", except **Open questions**, which stays even when empty so the reader knows it was checked.

| # | Section | Question it answers | Required | Fails as |
|---|---|---|---|---|
| 0 | **Header block** | Owner, date, status, version, law cited | Yes | Undated PRD nobody can supersede |
| 1 | **TL;DR** | If I read nothing else, what is being asked for and why now | Yes | Reader reconstructs the ask from the solution |
| 2 | **Context** | What changed that makes this live now | Yes | Reads as a wishlist item |
| 3 | **Problem** | Whose problem, how often, what it costs | Yes | Solution in search of a problem |
| 3b | **Jobs served** | Which existing JTBD this advances, cited by ID | Yes | Feature traces to no job, nobody notices |
| 3c | **Applicability** | Which business types, tiers, and surfaces this is for | Yes | Built pet-first, breaks on a salon |
| 4 | **Evidence** | How much of this is real, labeled | Yes | Assumption ships as fact |
| 5 | **Decisions locked** | What is already settled and must not be relitigated | Yes | Same argument reopens in every review |
| 6 | **Law touched** | Which invariants, ADRs, and contract rules apply, and which change | Yes | Spec quietly violates an invariant |
| 7 | **Success criteria** | How we know it worked, leading and lagging | Yes | Unfalsifiable ship |
| 8 | **Proposed solution** | How it works, user stories, states, workflows | Yes | Engineer invents the product |
| 9 | **Money composition** | What this does to amount due, VAT, tender | If it touches money | `PAYMENT_EXCEEDS_BALANCE` class defect |
| 9b | **Automation and messaging rules** | What fires automatically, to whom, on what trigger | If it sends or auto-acts | An automation nobody specified messages a client at 3am |
| 10 | **Permissions and roles** | Who can do each new action | If it adds an action | Staff can do the owner's job |
| 11 | **Edge cases** | Which EC IDs this handles, which it defers | Yes | Known failure ships as a surprise |
| 12 | **Reporting and data** | What new events or fields reports need | If it creates money or booking events | Reporting retrofit later |
| 12b | **Non-functional requirements** | Privacy, security, residency, retention, scale ceilings, as outcomes | Yes | Compliance discovered at launch |
| 13 | **Non-goals** | What this explicitly does not do | Yes | Scope creep with no owner |
| 14 | **Dependencies** | Feature, team, external, and the critical path | Yes | Blocked on week three |
| 15 | **Rollout and migration** | What happens to accounts already live | If anything exists in production | Pilot operator breaks on deploy |
| 16 | **Risks** | Value, usability, feasibility, business viability | Yes | Only feasibility gets discussed |
| 17 | **Open questions** | What is unresolved, who owes the answer, what it blocks | Yes | Unknowns read as oversights |
| 18 | **Before finalizing** | What must be true before this leaves **draft** | Yes | Draft ships as final by accident |
| 18b | **Release criteria** | What must be true before this **ships to an operator** | Yes | "Done" means merged, not usable |
| 19 | **Sign-off** | Who agreed, on what date | Yes | Nobody agreed |
| 20 | **Change log** | What changed and when | Yes | Two versions in circulation |

---

## Section rules

| Section | Rule |
|---|---|
| TL;DR | Three lines max, with the number in it. State the ask, the reason it is now, and the one thing that could kill it |
| Problem | Name the persona by name (Omar, Layla, Sami, Noor, Dana). "Users" is not a persona |
| Jobs served | Cite the job by ID and link its source. Do not restate the job statement or re-score it here, the discovery output owns both. **An empty table is a stop signal, not a formatting gap:** the feature traces to no known job, so either the job exists and was not written down, or the feature has no demand case yet |
| Applicability | Answer four axes: business type (with-pets / without-pets), tier (T1 to T3), location scope (single, per-location, business-shared), and surface in the persona model (Public / CamiHQ / Business / Staff). "All" is a valid answer only when it is a decision, not a default |
| Use cases | There is no separate use-case section, and no separate functional-requirements list. The user stories below are the feature-level use cases and the functional requirements. Persona-level use scenarios stay in `personas.md`. Two lists of the same thing means QA reads whichever one it finds |
| Operational workflows | Only when a flow crosses two or more actors (client, AI, reception, staff, HQ). One row per flow, actors in order, and the manual step that remains. Cite the state machine, do not redraw it |
| Evidence | Every claim carries a label from the closed set below. A claim with no label is deleted or relabeled 🔴 Unknown |
| Decisions locked | Cite the ADR or the person and date. "We agreed" with no source is not locked |
| Law touched | Two tables: **depends on** (cite ID, do not restate) and **changes** (needs a new ADR before build) |
| Success criteria | Leading indicators are pre-launch signals you can actually observe. If the only metric is post-launch revenue, the PRD cannot be de-risked |
| Proposed solution | User stories in the house form. Each story names the state it leaves the object in, referencing `03-state-machines.md` |
| Money composition | Cite the Composition Order step, the Scope Rule, or an INV-M ID. A bare link to `06` does not satisfy INV-11 |
| Automation and messaging rules | One row per automatic action. Every row states the opt-out path and the quiet-hours behavior, because "we never specified it" is how a client gets messaged at 3am. Cite INV-C1 (status-only, no URLs) and INV-C3 (autonomous after hours, drafts during) rather than restating them. Content of a template belongs in the design spec; whether it fires belongs here |
| Non-functional requirements | State the outcome, never the mechanism. "Client PII is anonymized before any ingest" (INV-A4) is a requirement; "hash with SHA-256 in the ingest worker" is the engineer's call. Cover privacy and consent, data residency (INV-A3), retention, attribution (INV-08), and any known scale ceiling (for example the ~20 msg/sec Coexistence cap, EC-44). Availability and latency go here only when a number is a product promise |
| Edge cases | Cite existing EC IDs. New ones get proposed here and land in `05-edge-case-catalog.md`, not invented inline |
| Non-goals | Each non-goal says where it goes instead, or that it is dropped |
| Dependencies | External dependencies name the counterparty and the thing being waited on (META stage, NeoPay decision, Crescent payout) |
| Risks | Score all four Cagan risks. Every unscored risk is the one that lands |
| Open questions | Every row has an owner and a "blocks what". A question with no owner is not tracked, it is decoration |
| Before finalizing vs Release criteria | Two different gates, never merged. Before finalizing gates the **document** leaving draft. Release criteria gate the **feature** reaching an operator, and every row keys to a use-case ID or an invariant so QA knows what to prove. The test plan itself is the engineer's, this table only says what passing means |
| All | No em dashes. American spelling. Tables over prose. Prose only as short bullets under a table |

---

## Labels (closed sets, shared with `table-first.md`)

**Evidence**

| Label | Means |
|---|---|
| ✅ Validated | Someone real said or did this |
| ⚠️ Inferred | Derived from an artifact (a competitor's build, a spec, code) |
| ⚠️ Assumed | Reasoned, unverified. Say so plainly |
| 🔴 Unknown | Named gap, no basis yet |

**Status**

| Marker | Means |
|---|---|
| ✅ | Settled, shipped, holds today |
| ⚠️ | Partial, planned, or gated on an external unblock |
| 🔴 | Known gap, no current handling |

**Cagan risk**

| Risk | The question | Answered by |
|---|---|---|
| Value | Will anyone use or buy it | Evidence, success criteria |
| Usability | Can they figure it out | Design spec, user stories |
| Feasibility | Can we build it | Engineer, not this doc |
| Business viability | Does it work for sales, finance, legal, support | Non-goals, dependencies, rollout |

---

## Skeleton

```markdown
# PRD: [Name]

**ID:** PRD-[SLUG] · **Owner:** [name] · **Date:** YYYY-MM-DD · **Status:** ⏳ Draft | ✅ Approved | ⛔ Superseded
**Serves objective:** [OBJ-x]
**Law cited:** [INV-x, ADR-x, 06 §x]
**Use cases minted:** [IDs, or "cites existing" with the feature guide path]
**Related:** [BRD, discovery outputs, design specs, Linear project]

## TL;DR
1. [The ask, with the number in it]
2. [Why now]
3. [The one thing that could kill it]

⚠️ **Evidence:** [what kind, and what it cannot support]

## Context
| What changed | When | So what |
|---|---|---|

## Problem
| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|

## Jobs served
| Job ID | Persona | Job (short) | Opportunity score | Source | This PRD advances it by |
|---|---|---|---|---|---|

- 🔴 Empty table means no job traces to this feature. Resolve before leaving draft: either write the job up in discovery, or say plainly that demand is unevidenced.

## Applicability
| Axis | This PRD covers | Explicitly not | Why |
|---|---|---|---|
| Business type | [with-pets / without-pets / both] | | |
| Tier | [T1 / T2 / T3] | | |
| Location scope | [single / per-location / business-shared] | | |
| Surface | [Public / CamiHQ / Business / Staff] | | |

## Evidence
| Claim | Label | Source |
|---|---|---|

## Decisions locked
| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|

## Law touched
**Depends on** (cite, do not restate)
| ID | Why it applies |
|---|---|

**Changes** (needs an ADR before build)
| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|

## Success criteria
**Lagging** (post-launch outcomes)
| Metric | Baseline | Target | By when |
|---|---|---|---|

**Leading** (pre-launch signals)
| Signal | How we observe it | Threshold to proceed |
|---|---|---|

## Proposed solution
### How it works
- [Short bullets, mechanism first]

### User stories (the feature-level use cases)
IDs come from the existing feature namespace, `FeatureLetter-GroupLetter#` (for example `C-B1`, `CAL-D1`). Cite the ID if the feature guide already has it; mint the group and IDs here if the feature is new, and the guide inherits them. Never invent a parallel scheme, and never renumber: design specs, Linear tickets, and validations all key off this string.

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|

### States and screens
| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|

### Operational workflows
*(only when a flow crosses two or more actors)*
| Flow | Actors in order | Trigger | Handoff point | State machine | Manual step remaining |
|---|---|---|---|---|---|

## Money composition
*(delete if this touches no money)*
| Object | Scope (invoice / payment) | Composition Order step | Invariant |
|---|---|---|---|

## Automation and messaging rules
*(delete if nothing fires without a human)*
| Trigger | Audience | Channel | Template ID | Opt-out honored | Quiet hours | Dedupe rule | Law |
|---|---|---|---|---|---|---|---|

## Permissions and roles
| Action | Staff | Reception | Manager | Owner | Attributed (INV-08) |
|---|---|---|---|---|---|

## Edge cases
| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|

## Reporting and data
| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|

## Non-functional requirements
| Requirement (stated as an outcome) | Type | Applies to | Law cited |
|---|---|---|---|
| | privacy / security / residency / retention / attribution / scale / availability | | |

## Non-goals
| Not doing | Why | Where it goes instead |
|---|---|---|

## Dependencies
**Feature**
| Depends on | Status | Blocks what here |
|---|---|---|

**Team**
| Team | What is needed | Owner |
|---|---|---|

**External**
| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|

**Critical path**
| Order | Item | Gate to the next |
|---|---|---|

## Rollout and migration
| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|

## Risks
| Risk | Type (V/U/F/B) | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|

## Open questions
| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|

## Before finalizing
*(gates the document leaving draft)*
- [ ] [Thing that must be true before this leaves draft]

## Release criteria
*(gates the feature reaching an operator. Every row keys to a use-case ID or an invariant. The test plan is the engineer's)*
| # | Must be true to ship | Keys to | Proven by | Blocking |
|---|---|---|---|---|

## Sign-off
| Role | Name | Date | Status |
|---|---|---|---|

## Change log
| Date | Change |
|---|---|
```

---

## Things worth keeping deliberately

**Decisions locked, separate from Open questions.** Without it every review reopens the same three arguments. With it, reopening one requires superseding a named record.

**Law touched, split into depends-on and changes.** The split is the whole point: depending on an invariant is free, changing one needs an ADR first. A PRD that quietly changes law is how INV-11 breaks.

**Jobs served, cited by ID, with an empty table as a stop signal.** A feature that advances no written job is either missing its discovery or missing its demand case. The table makes the difference visible at draft time instead of at review.

**Leading indicators, not just lagging.** A PRD whose only metric is post-launch revenue cannot be de-risked before build. The leading table is where the cheap test gets named.

**Automation rules as product law, not engine config.** Whether a message fires, to whom, and whether an opt-out is honored is a product decision with a legal edge. Only the payload and retry policy are the engine's.

**Two gates, not one.** Before finalizing releases the document. Release criteria release the feature. Merging them is how "done" comes to mean merged.

---

## What this template refuses to become

A vendor module PRD (executive summary, data model, API spec, webhooks, test plan, delivery dates in one file) is a build spec wearing a PRD label. It goes stale the week engineering starts, and it carries no evidence labels, no job IDs, no locked decisions, and no law citations, which is the entire reason this chain exists.

| Section a vendor template carries | Where it lives here | Chain link |
|---|---|---|
| Functional requirements | User stories, same table, same IDs | 4 (this doc) |
| Screen specifications | Screen **intent** here, pixels in `docs/specs/DSG-*` | 8 |
| Data model, API specification | Engineer, not a product artifact | 9 |
| Webhook payloads, retry policy | Engineer. Only the **rule** that fires lives here | 9 |
| Test plan | Engineer. Only the **pass condition** lives here, as Release criteria | 10 |
| Delivery roadmap with dates | Dependencies and critical path here, estimates from the engineer | 9 |
| Feature epics | The BRD, then one PRD per capability | 3 |

If a module is too big for one PRD (the CRM Inbox and WhatsApp module is), split it by capability and let the BRD hold the epic list. Do not grow this template to hold a module.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Section set derived from the multi-location and merchant-settlement PRDs; added Law touched, Money composition, Permissions, Edge cases, Reporting, Rollout, which neither had |
| 2026-08-16 | Added Jobs served (JTBD cited by ID, empty table is a stop signal). Ruled out a separate use-case section: user stories are the feature-level use cases, with stable IDs the feature guides and Linear cite |
| 2026-08-16 | Wired into `chain.md` as link 4. Header carries PRD ID, objective ID, and minted use-case IDs. User story IDs now explicitly come from the `FeatureLetter-GroupLetter#` namespace rather than being invented per PRD |
| 2026-08-20 | Diffed against a vendor module PRD (CRM Inbox and WhatsApp, 17 sections). Added four sections and split one: **3c Applicability** (business type, tier, location scope, surface), **8 Operational workflows** as a subsection (multi-actor flows only), **9b Automation and messaging rules** (trigger, audience, opt-out, quiet hours, dedupe), **12b Non-functional requirements** (outcomes only, never mechanism), and split **18 Before finalizing** into a document gate plus **18b Release criteria** as a ship gate. Ruled out, with the reasoning recorded in "What this template refuses to become": a separate functional-requirements list (duplicates user stories), data model, API spec, webhook payloads, test plan, delivery dates, and a feature-epic section |
