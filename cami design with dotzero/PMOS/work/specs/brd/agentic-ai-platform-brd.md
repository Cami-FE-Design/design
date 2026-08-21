# BRD: Agentic AI Platform

**One question:** What must be true for an AI to act on a real customer's behalf inside a real business, safely enough that Cami is willing to let it?
**Serves objective:** **OBJ-P1** ship WhatsApp Unibox and two-way comms. Which serves OBJ-B1, and is the defend phase of the H2 arc: booking does not hold an account, the CRM and AI layer is what makes leaving expensive.
**Unlocks:** The moat. The AI Receptionist is named core IP, not a phase-2 add, and it is the one capability no competitor in the landscape has.
**Companion PRD:** [Agentic AI Platform](../prd/prd-agentic-ai-platform-2026-08-16.md). Problem, evidence, risks, dependencies, and sign-off live there.
**Law:** INV-C1, INV-C2, INV-C3, INV-C4, INV-A1, INV-A2, INV-A4, INV-B1, INV-B2, INV-B7, INV-08, INV-X2, INV-X3 · ADR-004, ADR-010, ADR-018, ADR-023, ADR-025
**Law repo:** [cami-feature-docs/business-rules](../../../cami-feature-docs/business-rules/) · use case IDs in [feature-mappings/keep-coming/inbox-whatsapp.md](../../../cami-feature-docs/feature-mappings/keep-coming/inbox-whatsapp.md)
**Jobs:** [jtbd-receptionist](../../discovery/outputs/jtbd-receptionist-2026-08-16.md) `JOB-RCP-BOOK1-7`, `JOB-RCP-PAY2`
**Owner:** Michelle You
**Last checked:** 2026-08-16

---

## TL;DR

1. **14 requirements. 9 Must, 3 Should, 2 Later.** Five trace to existing `IX-*` IDs, all of them **Needs check** or **Partial**. Nine have no IDs, because the platform layer has no feature guide.
2. **Hardest: R7, the AI must be able to refuse.** An agent that can book, move, and take money needs a bounded set of actions it may take unsupervised, and today no such boundary is written anywhere.
3. **The whole initiative is gated on something Cami does not control.** META restarted at stage 1 of three on 8 Aug (INV-C2). The build is not the blocker and never was.
4. **Scope finding, carried up from the jobs:** the MVP AI capability list covers converting an inbound inquiry into a booking. The validated dominant front-desk workload is **reschedule and duplicate-catching**. The AI is currently scoped to the smaller half of Layla's day.

⚠️ **Evidence:** the jobs behind this are the best-evidenced in the workspace, from a real operator (Queenie, SOTA, Jul 2026) and a ~1,000-business lead-scoring study. **The platform requirements themselves are inferred from the jobs plus the law, not from a working agent.** Nothing here has been tested against real inbound.

---

## Why it is worth doing

| | |
|---|---|
| **Unlocks** | Retention. Scheduling wins the account, the OS keeps it, and the AI layer is what makes the OS worth staying on |
| **Costs us if we do not** | 40% of inbound arrives after hours and goes unanswered until morning. That is the pitch and the leak in the same number |
| **Trigger to start** | Started. The v0.2 build is done. The trigger for **going live** is META stage 3 |
| **Trigger to stop** | If META verification fails outright, or if evaluation shows the agent cannot hold a booking conversation at an acceptable error rate. Both need a stated threshold before build, which is R11 |

---

## Words that matter

| Say this | Means |
|---|---|
| **Agent** | The AI acting in a thread. One actor, many tools |
| **Tool** | A named, permissioned capability the agent may invoke: check availability, hold a slot, send a deposit request |
| **Autonomous** | The agent acts and the message sends. After hours only (INV-C3) |
| **Drafted** | The agent composes and a human approves before send. Business hours (INV-C3) |
| **Policy engine** | The layer deciding whether this agent, in this thread, at this hour, may invoke this tool |
| **Eval** | A repeatable scored test of agent behavior against fixed cases. Not a demo |
| **Coexistence** | The phone-app bridge sharing one number with the API. **Not** the Unibox being live (ADR-025) |

"The AI is live" is banned while a human is doing the work manually on the Coexistence bridge.

---

## Owns / not this

| This initiative owns | Point elsewhere |
|---|---|
| The agent, its tool registry, its policy engine, memory, and evals | **The Unibox surface itself** → inbox and WhatsApp feature guide, `IX-*` |
| Which actions an agent may take, and under whose supervision | **Role definitions for humans** → INV-A1 |
| Audit of every agent action (INV-08) | **Sending one-way reminders** → reminders, INV-C1, ADR-004 |
| Retrieval over business and client context | **The client record itself** → clients and pets |
| Anonymization before any training or analysis ingest (INV-A4) | **META verification** → external, Maaz |
| Arabic reply capability (INV-X3) | **RTL UI localization** → out of scope at v1, ADR-010 |

---

## Requirements

### Map of groups

| Group | What it covers | Requirements |
|---|---|---|
| **A · The agent can act** | Tools, orchestration, and the actions themselves | R1, R2, R3, R4 |
| **B · The agent is bounded** | Policy, supervision, refusal, and audit | R5, R6, R7, R8 |
| **C · The agent knows things** | Retrieval, memory, and thread continuity | R9, R10 |
| **D · We can tell if it works** | Evaluation, measurement, and the go-live gate | R11, R12 |
| **E · It survives the gate** | Operating while META is unresolved | R13, R14 |

Priority: **Must** the initiative fails without it · **Should** ships if Musts land early · **Later** deferred with a trigger.
Traced: ✅ IDs exist · ⚠️ partial, gaps named · 🔴 prose only.

### A · The agent can act

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R1 | The agent holds a **registry of named tools**, each with its own permission, and can invoke no capability that is not registered | Must | Adding a new agent action means registering a tool, never editing a prompt | — | 🔴 Platform layer, no guide exists |
| R2 | The agent can **complete a booking end to end** in-thread: understand the request, find a slot, hold it, capture the deposit, and confirm (INV-B1, INV-B2) | Must | An after-hours inquiry becomes a held, deposit-requested booking with no human touch | IX-D1, WB-* | ⚠️ **Partial.** IX-D1 gated on META |
| R3 | The agent can **move an existing booking** and notify both the client and the assigned staff member | Must | A reschedule closes the loop without anyone walking upstairs (EC-7) | — | 🔴 **No IDs, and not in the MVP capability list.** See the scope finding |
| R4 | The agent recognizes a **client who already has a booking** and does not create a second one | Should | A client who booked on Instagram and then messages WhatsApp is matched, not duplicated (EC-1) | — | 🔴 Needs the future-appointments view, which is an OS-layer gap |

**R3 and R4 are the scope finding made concrete.** `product.md` lists reschedule *auto-suggestion*, which is not the reschedule loop. The loop's hard step is the staff notify. R4 is not really an AI requirement at all: duplicates are born across WhatsApp, Instagram, and direct-to-stylist, so an agent that sees only WhatsApp cannot catch them. **Keep duplicate detection in the OS layer and let the agent read it,** or the initiative hides a data problem inside a model.

### B · The agent is bounded

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R5 | The agent runs **autonomously after hours and drafts for approval during business hours** (INV-C3) | Must | Nothing sends unapproved at 2pm, and nothing waits for a human at 2am | IX-B2, IX-B3 | ⚠️ **Partial.** Approval path exists, gated on META |
| R6 | **Every agent action is attributed and auditable**: what it did, on whose behalf, under which supervision mode, and who approved it (INV-08) | Must | A disputed booking can be traced to the agent turn that created it | — | 🔴 No IDs |
| R7 | The agent has a **declared boundary of actions it may not take unsupervised**, and a defined behavior at the boundary: hand to a human, do not improvise | Must | The agent never discounts, never waives a deposit, never forces an overlap, and says so rather than failing silently | — | 🔴 **No IDs and no written boundary anywhere.** The hardest requirement here |
| R8 | Client PII is **anonymized before any ingest** into analysis, evaluation, or model training (INV-A4) | Must | The SOTA WhatsApp history mining runs on anonymized data or does not run | — | 🔴 Law exists, no implementation requirement written |

**R7 is where this initiative is most likely to hurt someone.** Three live decisions sit inside it and none has an owner:

| Action | Human rule today | Agent rule |
|---|---|---|
| Force an overlapping appointment | Staff may, ungated and trust-based (INV-B7, ADR-023). Online booker may not | 🔴 Undefined. The agent is neither |
| Waive a deposit for a VIP | Varies by service, who authorizes is unknown (EC-3) | 🔴 Undefined, and the human rule is also undefined |
| Quote a price for a consult-gated service | Reception sends a padded range and books a consult (EC-2) | 🔴 Undefined. An agent that invents a price creates a commitment |

### C · The agent knows things

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R9 | The agent retrieves **business context** at answer time: services, prices, hours, staff, policies, so the answer reflects the merchant rather than a generic model | Must | Changing a price in the catalog changes the next answer with no redeploy | — | 🔴 No IDs |
| R10 | The agent carries **thread history and client context** across turns, sessions, and the human handover in both directions | Should | A human takes over mid-conversation and the client repeats nothing (EC-14, `JOB-RCP-BOOK6`) | IX-A1, IX-B3 | ⚠️ **Partial and Needs check** |

**R10 is the one requirement Coexistence materially affects.** If manual conversations are held on the phone app before the API clears, the question is whether the Unibox inherits them or every thread starts blank on day one (EC-45). Cami has not verified Meta's history-sync behavior. **Assumed, not tested,** and it is a one-way door at cut-over.

### D · We can tell if it works

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R11 | A **repeatable evaluation set** scores agent behavior on fixed real-shaped cases, with a stated pass threshold that gates autonomous mode | Must | An agent change is accepted or rejected on a score, not on a demo | — | 🔴 No IDs. **Without this there is no defensible go-live decision** |
| R12 | **Book-to-confirm rate** is measured for AI-handled threads against human-handled threads | Should | The moat claim carries a number instead of a story | — | 🔴 The metric is named in the glossary and instrumented nowhere |

**R11 is the requirement that converts this from a feature to a platform.** Everything else is buildable without it and none of it is shippable without it, because "the agent is good enough to talk to customers unsupervised" is otherwise an opinion.

### E · It survives the gate

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R13 | The platform is **buildable and evaluable while META is unresolved**, against recorded and synthetic conversations rather than live traffic | Must | R1 through R11 progress with zero dependency on verification stage | — | 🔴 Prose only |
| R14 | If the Coexistence bridge runs, it is **described internally and to operators as manual human work**, never as the Unibox being live (ADR-025, INV-C2) | Later | No deck, no operator conversation, and no status update claims the Unibox is live while a person is typing | — | 🔴 **Trigger:** a decision to adopt Coexistence. Currently proposed, not decided |

**R13 is the sequencing insurance.** The build was declared ready in August and the gate reset to stage 1 of three. If the platform can only be exercised against live traffic, the whole initiative idles at zero progress for an unknown number of weeks.

---

## Out of scope

| Not in this initiative | Why | Revisit when |
|---|---|---|
| META verification itself | External, three stages, owned by Maaz. No engineering step shortens it | Never. It is a dependency, not a requirement |
| The Unibox surface: assign, tag, inline appointment card | Inbox feature, `IX-*`. This initiative is the agent behind it | Never merges |
| WhatsApp reminders and one-way status pings | Reminders, INV-C1, ADR-004. Status-only, no URLs | Managed links, later |
| Smart Marketing and campaign segmentation | Separate register initiative, September | After the platform is live |
| AI Reporting | ADR-024 calls it v2, and it depends on the reporting fact tables | Reporting CSV set is live |
| Full Arabic UI localization | RTL-ready not RTL-shipped (INV-X3, ADR-010). The **agent** still replies in Arabic | Post-v1 |
| Taking payment autonomously beyond a deposit request | Money actions by an unsupervised agent need R7 settled first | R7 has an owner and an answer |

---

## Success criteria

Targets live in the PRD. The BRD holds the pass/fail gates:

| Gate | Fails if |
|---|---|
| The agent goes autonomous | Before an eval score exists and clears a stated threshold |
| The agent acts | Any action is unattributable, or any tool is invocable outside the registry |
| Business hours behavior | Anything sends without human approval |
| Client data | Any PII reaches analysis or training un-anonymized |
| Language | An Arabic message gets an English-only reply path |
| Honesty of status | The Unibox is described as live while a human is doing it manually |

---

## Open decisions

| Decision | Blocks which requirement | Owner | Where it resolves |
|---|---|---|---|
| **What may the agent do unsupervised?** Overlap, deposit waiver, price quoting on consult-gated services | R7, and everything downstream of it | Michelle | New ADR. Nothing holds it today |
| **Is the AI scoped to inbound booking only, or does it own reschedule and duplicates?** The validated dominant workload is the second | R3, R4, and the initiative's value case | Michelle + Maaz | This BRD's companion PRD, then `product.md` |
| Adopt Coexistence, yes or no? Who staffs the inbox, in which hours, and are pilot operators told the human is manual? | R14, and R10 through history continuity | Maaz + Michelle | ADR-025, proposed since 8 Aug |
| Has anyone verified Meta's Coexistence history-sync behavior, or is it assumed? | R10, EC-45. A one-way door at cut-over | Maaz | Test before committing |
| What is the eval pass threshold for autonomous mode, and who signs it? | R11, the go-live gate | Michelle + Faisal | New ADR, before build completes |
| Who authorizes a VIP deposit waiver, for humans and for the agent? | R7, and EC-3 for humans | Michelle + operator | Unanswered since Jul |

---

## Evidence and confidence

- ✅ **Validated (Queenie, SOTA front desk, Jul 2026):** the reschedule loop dominates the front desk, duplicates occur across channels frequently, squeeze requests are constant, and covering staff lose thread context.
- ✅ **Validated (lead-scoring study, ~1,000 UAE pet businesses, Mar 2026):** 70% of inquiries arrive on WhatsApp, 40% of those after hours.
- ✅ **Validated as law:** autonomous after hours, drafted during hours (INV-C3); PII anonymized before ingest (INV-A4); the META gate is on the API rail and is three stages (INV-C2, 8 Aug).
- ⚠️ **Inferred:** every platform-layer requirement. Derived from the jobs plus the law, not from a working agent.
- ⚠️ **Assumed:** that Coexistence preserves history into the API. Untested by Cami, and load-bearing for R10.
- 🔴 **Unknown:** how the agent performs on real inbound. No eval set exists, so there is no number.
- 🔴 **Unknown:** the META timeline. Restarted at stage 1 on 8 Aug, no ETA.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First write. 14 R-numbers across 5 groups. **Two findings: R7, the agent's boundary of unsupervised action, is undefined and is the highest-risk gap; and the MVP capability list is scoped to inbound booking while the validated dominant workload is reschedule and duplicate-catching.** Added group E so the initiative can progress while INV-C2 holds |
