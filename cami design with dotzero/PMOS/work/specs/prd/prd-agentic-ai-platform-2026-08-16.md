# PRD: Agentic AI Platform

**ID:** PRD-AGENTIC-AI · **Owner:** Michelle You · **Date:** 2026-08-16 · **Status:** ⏳ Draft
**Serves objective:** OBJ-P1 (ship WhatsApp Unibox and two-way comms) → OBJ-B1
**Law cited:** INV-C1, INV-C2, INV-C3, INV-C4, INV-A1, INV-A2, INV-A4, INV-B1, INV-B2, INV-B7, INV-08, INV-X2, INV-X3 · ADR-004, ADR-010, ADR-018, ADR-023, ADR-025
**Use cases:** cites `IX-A1`, `IX-A2`, `IX-B2`, `IX-B3`, `IX-D1`, `IX-D2` in [keep-coming/inbox-whatsapp.md](../../../cami-feature-docs/feature-mappings/keep-coming/inbox-whatsapp.md). **Mints an `AI-*` group** (`AI-A1` to `AI-D2`), which needs a new feature guide.
**Related:** [Agentic AI Platform BRD](../brd/agentic-ai-platform-brd.md) (R1 to R14) · [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) · [journey-map-layla](../../discovery/outputs/journey-map-layla-2026-08-02.md) · [interview-snapshot-queenie](../../discovery/outputs/interview-snapshot-queenie-2026-08-02.md)

---

## TL;DR

1. **Build the platform that can be built while the gate is shut.** Tool registry, policy engine, retrieval, memory, audit, and evals need no live WhatsApp traffic. The conversational surface does.
2. **Why now:** META restarted at stage 1 of three on 8 Aug with no ETA. If the platform can only be exercised on live traffic, this initiative idles at zero for an unknown number of weeks.
3. **What could kill it:** the agent has **no written boundary of actions it may take unsupervised.** An agent that can book, move, and request money without one is not shippable at any verification stage.

⚠️ **Evidence:** the jobs behind this are the best-evidenced in the workspace, from a real operator and a ~1,000-business study. **The agent's behavior is entirely unmeasured. No eval set exists, so "good enough to talk to customers" is currently an opinion.**

---

## Context

| What changed | When | So what |
|---|---|---|
| Cami's WABA unrestricted, verification restarted at stage 1 of 3 | 8 Aug 2026 | The August "Unibox live" date is not credible. INV-C2 holds on the API rail |
| Coexistence proposed as an interim bridge | 8 Aug 2026 | ADR-025. It buys human continuity and thread history. **It does not lift INV-C2** |
| Queenie interview validated the front-desk workload | Jul 2026 | The dominant job is managing change, not first-time booking. The AI is scoped to the smaller half |
| v0.2 build declared ready | Aug 2026 | The block is external and always was. That makes group E of the BRD the sequencing insurance |

---

## Problem

| Persona | Job blocked today | Frequency | Cost of the gap |
|---|---|---|---|
| **Layla** | `JOB-RCP-BOOK1` handle every conversation, including at 11pm | Continuous | 40% of inbound arrives after hours. A human desk closes at 6pm. This is physically impossible today |
| **Layla** | `JOB-RCP-BOOK2` reschedule and notify both sides | Most of her day | She walks upstairs because staff do not reply on WhatsApp (EC-7) |
| **Layla** | `JOB-RCP-BOOK3` catch a duplicate before it clashes | "A lot, many times" | Caught by eye. No dedup, no future-appointments view (EC-1) |
| **Layla** | `JOB-RCP-BOOK6` cover a colleague with their thread | Every day off | The covering person starts cold and the client repeats themselves (EC-14) |
| **Noor** | Get an answer at 11pm | 40% of inquiries | The inquiry goes cold, or to whoever answered first |

---

## Jobs served

| Job ID | Persona | Job (short) | Opp | Source | This PRD advances it by |
|---|---|---|---|---|---|
| `JOB-RCP-BOOK1` | Layla | Drop no conversation, ever | 18 | [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) | Autonomous after-hours handling (INV-C3), gated on META |
| `JOB-RCP-BOOK2` | Layla | Reschedule with both sides notified | 17 | jtbd-receptionist | `AI-A3`. **Not in the current MVP capability list.** See Non-goals |
| `JOB-RCP-BOOK3` | Layla | Do not double-book a client | 16 | jtbd-receptionist | Only by reading an OS-layer dedup view. Not an agent capability |
| `JOB-RCP-BOOK6` | Layla | Cover a colleague with their thread | 14 | jtbd-receptionist | `AI-C2`, thread continuity across the human handover |
| `JOB-RCP-BOOK4` | Layla | Squeeze a valuable client in | 14 | jtbd-receptionist | 🔴 **Explicitly out.** The agent hands to a human. See `AI-B3` |
| `JOB-RCP-BOOK7` | Layla | Reply usefully in Arabic | 9 | jtbd-receptionist | `IX-D2`. The agent replies in Arabic while the UI stays LTR (INV-X3) |

---

## Evidence

| Claim | Label | Source |
|---|---|---|
| 70% of inquiries on WhatsApp, 40% after hours | ✅ Validated | Lead-scoring study, ~1,000 UAE pet businesses, Mar 2026 |
| Reschedule is the dominant front-desk workload | ✅ Validated | Queenie, SOTA, Jul 2026 |
| Duplicates arrive across WhatsApp, Instagram, and direct-to-stylist | ✅ Validated | Queenie |
| Covering staff lack the original thread | ✅ Validated | Queenie, EC-14 |
| Autonomous after hours, drafted during hours | ✅ Validated as law | INV-C3 |
| PII must be anonymized before any ingest | ✅ Validated as law | INV-A4 |
| META is a three-stage chain, restarted at stage 1 | ✅ Validated | Maaz, Slack, 8 Aug 2026 |
| Coexistence caps at ~20 messages per second, manual only | ✅ Validated | Maaz, 8 Aug. EC-44 |
| Coexistence preserves thread history into the API | ⚠️ **Assumed, and load-bearing** | EC-45. Untested by Cami. A one-way door at cut-over |
| The agent can hold a booking conversation acceptably | 🔴 Unknown | **No eval set exists** |
| What the agent may do unsupervised | 🔴 Unknown | Written nowhere |

---

## Decisions locked

| Decision | Who, when | Source | Do not reopen because |
|---|---|---|---|
| Autonomous after hours, drafts for human approval during business hours | — | INV-C3 | 40% of inbound is after hours. The front desk cannot be the bottleneck at 11pm |
| The AI Receptionist is core IP, not a phase-2 add | — | `product.md` | It is the moat, and no competitor in the landscape has it |
| Reminders are status-only and carry no URLs | — | INV-C1, ADR-004 | Spoof risk. The agent does not get to send links either |
| PII anonymized before analysis or training | — | INV-A4 | Applies to SOTA WhatsApp history mining and all discovery |
| The agent replies in Arabic; the UI is RTL-ready, not RTL-shipped | — | INV-X3, ADR-010 | Full localization is post-v1 |
| The CRM layer is horizontal and serves every vertical unchanged | — | INV-X2 | Verticalization lives in the OS layer, not in the agent |
| Coexistence, if adopted, is **manual human work** and is never described as the Unibox being live | Maaz proposal, 8 Aug | ADR-025, INV-C2 scope note | Saying otherwise misleads operators and the board about the same fact |

---

## Law touched

**Depends on** (cite, do not restate)

| ID | Why it applies |
|---|---|
| INV-C2 | The gate. Everything conversational waits on it |
| INV-C3 | The supervision model, and the single most load-bearing rule here |
| INV-C4 | The thread is the interface. The agent never asks the client to go elsewhere |
| INV-B1, INV-B2 | If the agent holds a slot it holds it for 5 minutes, and the deposit is automatic |
| INV-A4 | Anonymize before ingest, including for evals built from real threads |
| INV-A2 | The agent must not surface money detail to a Staff-level human |
| INV-08 | Every agent action is attributable |
| ADR-018 | The agent never charges a no-show or cancellation fee. Route to the merchant |

**Changes** (needs an ADR before build)

| ID | Current rule | Proposed change | ADR status |
|---|---|---|---|
| INV-B7 / ADR-023 | Overlap allowed **only when staff book from Cami Business**. The online booker offers only non-conflicting slots | The agent is neither a staff member nor the online booker. **Its overlap rule is undefined** | 🔴 **Needs an ADR.** This is the sharpest instance of the R7 boundary problem |
| INV-A1 | Four human roles with read and write granularity | An agent is a fifth actor with its own permission set, not a human role | 🔴 **Needs an ADR.** Otherwise the agent inherits whichever role invoked it |
| EC-3 | Who authorizes a VIP deposit waiver is unknown **for humans** | The agent needs an answer even if humans keep operating on judgment | 🔴 Needs the human answer first |

---

## Success criteria

**Lagging** (post-launch outcomes)

| Metric | Baseline | Target | By when |
|---|---|---|---|
| After-hours inquiries answered within minutes | ~0% (nobody is awake) | Majority, autonomously | 30 days after META clears |
| Book-to-confirm rate, AI-handled threads against human-handled | Human baseline: ~82% book-to-confirm, SOTA sample | Not worse than human | 60 days after go-live |
| Threads escalated to a human that should not have been | 🔴 unmeasured | Trending down, from a measured start | Continuous |

**Leading** (pre-launch signals, and these are the point of this PRD)

| Signal | How we observe it | Threshold to proceed |
|---|---|---|
| **Eval set exists and the agent scores on it** | Fixed cases built from anonymized real threads, scored repeatably | A score exists at all. Today there is none |
| Eval score for autonomous mode | Same harness, autonomous cases only | Clears a threshold **agreed in advance**, not chosen after seeing the number |
| The agent refuses correctly | Boundary cases in the eval set: overlap, waiver, price quote | It hands to a human every time, and never improvises |
| Retrieval reflects the merchant | Change a price in the catalog, ask again | The next answer changes with no redeploy |
| Coexistence history-sync behavior | Test it on a real number before committing | Verified, not assumed. **It is a one-way door** |

---

## Proposed solution

### How it works

- The agent is one actor with a **registry of named tools**. It can invoke nothing that is not registered, and every tool carries its own permission.
- A **policy engine** answers one question per turn: may this agent, in this thread, at this hour, invoke this tool? Business hours means draft and wait. After hours means act.
- **Retrieval** reads live business context at answer time: services, prices, hours, staff, policies. A catalog change changes the next answer with no redeploy.
- **Memory** carries thread history and client context across turns, sessions, and the handover in both directions.
- **Audit** records every turn: what the agent did, under which supervision mode, and who approved it.
- **Evals** score behavior on fixed anonymized cases. The eval score, not a demo, gates autonomous mode.

### User stories (the feature-level use cases)

`AI-*` is a new namespace. There is no agent feature guide today, so this PRD mints the groups and the guide inherits them.

| Use-case ID | Serves job | As a | I want | So that | Done when | State after |
|---|---|---|---|---|---|---|
| `AI-A1` | all | Cami | the agent to invoke only registered tools | a new capability is a registration, not a prompt edit | An unregistered capability is unreachable, and adding one is a config change | — |
| `AI-A2` | `JOB-RCP-BOOK1` | Client | to get a slot booked at 11pm | my inquiry does not go cold | The agent understands the request, holds a slot (INV-B1), triggers the deposit (INV-B2), and confirms | Booking `SlotHeld` → `Booked` |
| `AI-A3` | `JOB-RCP-BOOK2` | Client | to move my appointment in the thread | I do not wait for the desk to open | The slot moves, the client is confirmed, **and the assigned staff member is notified** | Booking `Rescheduled` → `Confirmed` |
| `AI-A4` | `JOB-RCP-BOOK3` | Layla | the agent to notice I already have a booking | I am not double-booked | The agent reads the future-appointments view and says so | Booking unchanged, flagged |
| `AI-B1` | `JOB-RCP-BOOK1` | Layla | drafts during business hours | nothing goes out in the shop's voice without me | Nothing sends unapproved between opening and closing (INV-C3) | Draft pending approval |
| `AI-B2` | — | Cami | every agent turn attributed | a disputed booking traces to the turn that made it | Actor, supervision mode, tools invoked, and approver are all recorded (INV-08) | — |
| `AI-B3` | `JOB-RCP-BOOK4` | Layla | the agent to hand a squeeze to a human | it never forces an overlap or invents a price | On a boundary case it stops, says it is checking with the team, and escalates | Thread assigned to a human |
| `AI-C1` | — | Client | answers that match this business | I am not quoted a generic price | A catalog price change changes the next answer, no redeploy | — |
| `AI-C2` | `JOB-RCP-BOOK6` | Layla | the thread to survive the handover | the client repeats nothing | A human takes over mid-conversation with full history, and back again | Thread assigned, context intact |
| `AI-D1` | — | Cami | a repeatable eval score | go-live is a decision, not a vibe | The same cases run on every change and produce a comparable number | — |
| `AI-D2` | — | Cami | book-to-confirm measured per handler | the moat claim carries a number | AI-handled and human-handled threads are comparable in the same report | — |

### States and screens

| Surface | State | What the user sees | Rule it carries |
|---|---|---|---|
| Unibox | Business hours | Agent draft, with edit and approve. Nothing sends alone | INV-C3, `IX-B2` |
| Unibox | After hours | Agent messages sent, marked as AI-handled | INV-C3, `IX-D1` |
| Unibox | Boundary hit | Thread flagged and assigned to a human, with the reason | `AI-B3` |
| Unibox | Handover | Full history visible to whoever holds it now | `IX-B3`, EC-14 |
| Thread | Arabic inbound | Agent replies in Arabic. UI stays LTR | INV-X3, `IX-D2` |
| Admin | Audit | Every turn: tools, mode, approver | INV-08 |
| Any surface | Coexistence bridge running | Labeled as a human, never as the Unibox being live | ADR-025 |

---

## Money composition

The agent touches money in exactly one place: it triggers a **deposit request** at booking.

| Object | Scope | Composition Order step | Invariant |
|---|---|---|---|
| Deposit | Payment | 10 | INV-P10. Liability until render. The agent requests, it does not compose |
| Line price | Invoice | 1 | The agent quotes the catalog price. **It never computes one** |

🔴 **The agent must not invent a price.** Consult-gated services (EC-2) have no fixed price, and reception handles them by sending a padded range and booking a consult. An agent that produces a number creates a commitment the business must honor. This is `AI-B3` and it is a boundary case, not a feature gap.

---

## Permissions and roles

The agent is a **fifth actor**, not a human role. This table proposes its permission set:

| Action | Agent, after hours | Agent, business hours | Attributed (INV-08) |
|---|---|---|---|
| Answer a question from the catalog | Allow | Draft | Yes |
| Hold a slot and create a booking | Allow | Draft | Yes |
| Trigger a deposit request | Allow | Draft | Yes |
| Move an existing booking | Allow | Draft | Yes |
| **Force an overlapping appointment** | **Block** | **Block** | 🔴 Undefined in law. INV-B7 covers staff and the online booker, not an agent |
| **Waive a deposit** | **Block** | **Block** | 🔴 The human rule is also undefined (EC-3) |
| **Quote a consult-gated price** | **Block** | **Block** | Send the range, book the consult (EC-2) |
| Apply a discount or comp | **Block** | **Block** | EC-4 |
| Charge a no-show or cancellation fee | **Block** | **Block** | ADR-018, INV-P13 |
| Surface money detail to a Staff-level human | **Block** | **Block** | INV-A2 |

**The five Block rows are the R7 boundary, written down for the first time.** They are proposed here and need an ADR, because three of them (overlap, waiver, price) have no settled human rule to inherit from.

---

## Edge cases

| ID | Case | Handled in this PRD | Deferred to |
|---|---|---|---|
| EC-11 | After-hours inbound, 40% | ✅ `AI-A2`, gated on META | — |
| EC-12 | Arabic message or voice note | ⚠️ Text via `IX-D2`. **Voice notes are not scoped** | Named as a gap below |
| EC-14 | Covering staff lacks thread context | ✅ `AI-C2` | — |
| EC-1 | Cross-channel duplicates | ⚠️ `AI-A4` reads the view. **The view does not exist** | OS layer, clients and pets |
| EC-2 | Consult-gated pricing | ✅ `AI-B3`, the agent refuses to quote | — |
| EC-7 | Reschedule staff-notify chain is manual | ✅ `AI-A3` includes the internal notify | — |
| EC-3 | Who authorizes a VIP waiver | 🔴 **Blocked.** Undefined for humans, so undefined for the agent | Needs an owner |
| EC-29 | Staff overlap booking, ungated and unaudited | 🔴 **Blocked.** The agent's rule is undefined (ADR-023 gap) | Needs an ADR |
| EC-44 | Coexistence capacity, ~20 msg/sec, manual only | ⚠️ Named. A 30-staff operator's inbound exceeds one manual operator | ADR-025 decision |
| EC-45 | Thread history at API cut-over | ⚠️ **Assumed to work. Untested.** A one-way door | Test before committing |

---

## Reporting and data

| Event or field | Grain | Which report needs it | New or existing |
|---|---|---|---|
| `agent.turn` with tools invoked, supervision mode, approver | Per turn | Audit, and eval regression | New |
| `agent.escalated` with the boundary reason | Per escalation | Boundary tuning. Which refusals were right | New |
| Thread handler: AI or human | Per thread | `AI-D2`, book-to-confirm by handler | New |
| Booking source: agent, staff, or online booker | Per booking | Attribution, and the moat claim | New |
| Eval run: case set version, score, agent version | Per run | The go-live gate | New |

⚠️ **Anonymization is an ingestion requirement, not a policy note.** Eval cases built from real SOTA threads must be anonymized at ingest (INV-A4), not at review.

---

## Non-goals

| Not doing | Why | Where it goes instead |
|---|---|---|
| **Duplicate detection itself** | Duplicates are born across three channels. An agent seeing only WhatsApp cannot catch them. Putting it here hides a data problem inside a model | OS layer: future-appointments view on the client record (EC-1) |
| META verification | External, three stages, no engineering step shortens it | Maaz |
| The Unibox surface: assign, tag, inline appointment card | This initiative is the agent behind it | `IX-*` |
| Smart Marketing and campaign segmentation | Separate register initiative | September |
| AI Reporting | Depends on the reporting fact tables | ADR-024 v2 |
| Voice note handling | ⚠️ EC-12 names it, nothing scopes it. **Flagged rather than assumed** | Needs a decision |
| Autonomous money actions beyond a deposit request | The boundary must be settled first | After the R7 ADR |
| Full Arabic UI | RTL-ready, not RTL-shipped | Post-v1 |

---

## Dependencies

**Feature**

| Depends on | Status | Blocks what here |
|---|---|---|
| Unibox surface | ⚠️ Partial, META-gated | `AI-B1`, `AI-C2` |
| Future-appointments view on the client record | 🔴 Missing (EC-1) | `AI-A4` |
| Staff notification channel for reschedules | 🔴 Manual today (EC-7) | `AI-A3`'s hard half |
| Reporting fact tables | 🔴 Architecture unfinalized | `AI-D2` |
| Catalog and payment policy as retrievable data | ⚠️ Exists, retrieval layer does not | `AI-C1` |

**Team**

| Team | What is needed | Owner |
|---|---|---|
| MOAT Team | Orchestrator, tool registry, policy engine, retrieval, memory, audit, evals | Faisal |
| Product | The R7 boundary decision, written as law | Michelle |
| Commercial | META verification, and the Coexistence staffing call | Maaz |
| Operations | If Coexistence runs, a UAE-based person on the live number, in named hours | 🔴 Unassigned |

**External**

| Counterparty | What we are waiting on | ETA | Fallback if it slips |
|---|---|---|---|
| **META** | Business Verification → WhatsApp Verification → Tech Provider verification | 🔴 No ETA, restarted 8 Aug | Coexistence bridge (ADR-025), which buys continuity, not automation |

**Critical path**

| Order | Item | Gate to the next |
|---|---|---|
| 1 | **The R7 boundary ADR.** What may the agent do unsupervised | Nothing autonomous ships without it, at any verification stage |
| 2 | Eval harness and case set, built from anonymized threads | Gate to any claim about agent quality |
| 3 | Tool registry, policy engine, retrieval, memory, audit | All buildable with the gate shut. This is BRD R13 |
| 4 | Coexistence decision, and the history-sync test | A one-way door at cut-over. Test before, not after |
| 5 | META stage 3 | Gate to live conversational traffic. Not ours to schedule |
| 6 | Autonomous mode enabled per account | Gated on the eval threshold from step 2 |

---

## Rollout and migration

| Existing state | What happens on deploy | Who tells the operator |
|---|---|---|
| Pilot operators with no conversational channel | Nothing changes until META clears | Nobody. Do not pre-announce a date that is not ours |
| Threads held manually on the Coexistence bridge | ⚠️ **Assumed** to be inherited by the API at cut-over. Untested | Depends on the test |
| First account enabled for autonomous mode | Drafted mode first, then autonomous once the eval clears for that account's shape | Customer Success, with the supervision model explained |
| An operator told "the Unibox is live" while a human is typing | Must not happen | Michelle. This is a statement discipline, not a release step |

---

## Risks

| Risk | Type | Likelihood | If it lands | Mitigation | Owner |
|---|---|---|---|---|---|
| **The agent acts outside a boundary nobody wrote** | **B** | 🔴 High, because the boundary does not exist | It comps a service, forces an overlap, or quotes a price the business must honor | Write the R7 ADR before build completes. The permissions table above is the draft | Michelle |
| The agent ships without an eval, on a demo | **V** | Medium | A quality claim with no number, and no way to detect a regression | `AI-D1` is on the critical path ahead of go-live, not after it | Faisal |
| META slips again and the initiative idles | **F** | High | A quarter of the defend phase lost | BRD group E. Build and evaluate against recorded traffic | Faisal |
| Coexistence does not carry history, discovered at cut-over | **F** | Medium | Every thread starts blank on day one, and `AI-C2` and EC-14 both fail | Test on a real number before committing. It is a one-way door | Maaz |
| The AI is built for inbound booking while the real workload is change | **V** | 🔴 High. It is the current scope | A moat feature that impresses in a demo and does not relieve Layla's day | `AI-A3` and `AI-A4` in scope, and the trade stated if they are cut | Michelle |
| "Unibox live" is said while a human is doing it | **B** | Medium | Operators and the board are misled about the same fact | ADR-025's own condition. Enforce it in decks and status updates | Michelle |
| Real threads reach evals with PII intact | **B** | Medium | INV-A4 breach on customer data | Anonymize at ingest, not at review | Faisal |

---

## Open questions

| # | Question | Blocks what | Owner | Needed by |
|---|---|---|---|---|
| 1 | **What may the agent do unsupervised?** Overlap, waiver, price quoting | Everything autonomous. The critical path starts here | Michelle | Before build completes |
| 2 | Is the AI scoped to inbound booking, or does it own reschedule and duplicates? | `AI-A3`, `AI-A4`, and the initiative's value case | Michelle + Maaz | Before build |
| 3 | What is the eval pass threshold for autonomous mode, and who signs it? | `AI-D1`, the go-live gate | Michelle + Faisal | Before go-live, agreed **in advance** |
| 4 | Adopt Coexistence? Who staffs it, in which hours, and are operators told it is manual? | ADR-025, and `AI-C2` through history | Maaz + Michelle | Proposed since 8 Aug. Overdue |
| 5 | Has Meta's history-sync behavior been verified, or is it assumed? | EC-45. A one-way door | Maaz | Before any Coexistence commitment |
| 6 | Are voice notes in scope? EC-12 names them and nothing scopes them | A real inbound channel with no plan | Michelle | Before build |
| 7 | Does the agent get its own permission set, or inherit a human role? | The permissions table, and INV-A1 | Michelle | With Question 1 |

---

## Before finalizing

- [ ] The R7 boundary ADR exists, covering overlap, waiver, and price quoting (Questions 1, 7)
- [ ] Eval pass threshold agreed and written **before** any score is seen (Question 3)
- [ ] The Coexistence decision is made, or explicitly deferred with a date (Question 4)
- [ ] History-sync tested rather than assumed (Question 5)
- [ ] Voice notes are in scope or out, in writing (Question 6)
- [ ] A new `feature-mappings` guide exists for the `AI-*` namespace, so the IDs this PRD mints have a home
- [ ] Engineer audit of what the v0.2 build actually covers, since this PRD asserts no build state of its own

---

## Sign-off

| Role | Name | Date | Status |
|---|---|---|---|
| Product | Michelle You | 2026-08-16 | ⏳ Draft |
| Engineering | Faisal | — | Pending |
| Commercial | Maaz | — | Pending, and holding the META and Coexistence calls |
| Design | Anum | — | Pending |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. Cites `IX-A1`, `A2`, `B2`, `B3`, `D1`, `D2`; mints the `AI-*` namespace, `AI-A1` to `AI-D2`. **Writes the agent's unsupervised-action boundary down for the first time as a permissions table with five Block rows, three of which have no settled human rule to inherit. Scopes the platform so it can be built and evaluated while INV-C2 holds** |
