---
name: prd-generator
description: 'Transform messy ideas into structured PRDs that get stakeholder alignment before engineering starts building. Use when: write prd, product requirements, requirements document, feature spec.'
category: specs
---

# PRD Generator

Transform messy ideas into structured PRDs that get stakeholder alignment before engineering starts building.

## Canonical shape (read this first)

`work/_templates/prd.md` is the source of truth for section set, section rules, label sets, and the skeleton. Read it before writing, and copy its skeleton rather than the generic one at the bottom of this file. Where the two disagree, the template wins and this file is stale.

The template also states what a PRD refuses to carry: data model, API specification, webhook payloads, test plan, delivery dates, and a separate functional-requirements list. Do not add them because a source document has them.

## Output
Write the file to exactly this path:

  work/specs/outputs/prd-[feature]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Starting a new feature from scratch
- Formalizing something you've been discussing verbally
- Getting alignment before engineering starts work

## What You'll Need
- Clear description of the problem you're trying to solve
- Evidence that this problem is real (research, data, feedback)
- Initial thoughts on approach (optional)

## Process

### Step 1: Check Your Context
First, read the user's context files to understand what you already know (`context/product.md`, `personas.md`, etc.). If they just downloaded Second, these might be empty — that's fine, I'll ask for what I need.

What to look for:
- `work/_templates/prd.md` — the canonical section set and skeleton. Read before drafting
- `work/_templates/chain.md` — what this PRD must cite upward (objective, job, evidence, law) and what hangs off it
- `context/knowledge/01-06` — the law: invariants, glossary, state machines, decision records, edge cases, money composition
- `context/product.md` — Is this feature already on the roadmap? What's the current state?
- `context/personas.md` — Who experiences this problem? What do we know about their pain?
- `context/company.md` — Does this align with strategic priorities?
- `context/competitors.md` — Do competitors have this? Is it table stakes?

**Tell the user what you found.** For example:
> "I found 'Workload Balancer' in your product roadmap — it's marked as Planned for Q2. Your PM persona (Jordan) mentions finding out about overloaded team members only when deadlines slip. Let me use this context for the PRD."

This helps users understand that Second is reading their files and getting smarter over time.

### Step 2: Problem Clarification
With context in hand, ask only what's missing. Don't re-ask things you already know.

**Critical inputs (ask if missing):**
1. What problem are you trying to solve?
2. Who experiences this problem?

**Grounding rule:** The Evidence section must use verbatim quotes or specific data from provided sources. Extract exact customer language, support ticket counts, or usage metrics BEFORE writing the problem statement. Never invent quotes or fabricate data — use "⚠️ Assumed" markers instead.

**JTBD verbatim rule:** When the Personas section references a persona's Job To Be Done and `personas.md` contains a direct JTBD statement for that persona, quote it verbatim. Paraphrase only when citing multiple passages or when no direct statement exists. Paraphrased JTBDs read vaguer than the real thing the user wrote — always prefer the real words.

**Nice-to-have (generate with assumptions if missing):**
3. How do you know it's a real problem? (evidence)
4. Why is it important to solve now?

**If context is thin, prompt for uploads:**
When you don't have enough context to write a solid PRD, offer to help the user add more:
> "I don't have much context about your users. Do you have any of these I could look at?
> - User research or interview notes
> - Support tickets or feedback
> - Analytics or usage data
>
> You can drop files in your `context/` folder or paste them here."

This teaches users how to make Second smarter over time.

If you have enough from context files, say so:
> "Based on your personas and product docs, I have enough to draft this PRD. I'll flag any assumptions."

### Step 3: Success Criteria
Define what success looks like with BOTH lagging and leading indicators:

**Lagging Indicators** (post-launch outcomes):
- What behavior or metric should change?
- How will you measure if this worked?
- What's the target and timeframe?

**Leading Indicators** (pre-launch signals):
- What early signals predict success before launch?
- Examples: Internal dogfooding usage → predicts adoption, Beta support tickets → predicts quality, Time-to-value in onboarding → predicts retention

**Important:** If you don't have actual metrics, don't make them up. Instead:
- Mark them as `[PLACEHOLDER — need actual baseline]`
- Or ask: "What metric would tell you this worked? Do you have a current baseline?"

### Step 3b: Applicability
Runs on the problem, not the solution, so answer it as soon as the problem is clear. Four axes, and "all" counts only when it is a decision:
- **Business type:** with-pets, without-pets, or both
- **Tier:** T1, T2, T3
- **Location scope:** single, per-location, or business-shared
- **Surface:** Public, CamiHQ, Business, Staff

A feature designed against one business type and shipped to both is the most common silent scope break.

### Step 4: Dependencies Check
Before diving into solution, identify what this feature depends on:
- **Feature dependencies** — Does this require other features/systems to exist first?
- **Team dependencies** — Do we need work from other teams (design, eng, legal)?
- **External dependencies** — Third-party APIs, vendor integrations, compliance?

Flag the **critical path** — which dependency would block launch if delayed?

### Step 5: Solution Exploration
Once the problem is clear:
- What's your proposed approach?
- Include 2-3 concrete user stories to illustrate the solution
- What's explicitly OUT of scope?
- What are the key risks or assumptions?

### Step 5b: Automation, workflows, and non-functional requirements
Three checks that only get asked if you ask them:

| Check | Ask | Skip when |
|---|---|---|
| **Operational workflows** | Does any flow cross two or more actors (client, AI, reception, staff, HQ)? Name the handoff and the manual step that remains | Single-actor feature |
| **Automation and messaging** | Does anything fire without a human? Then state trigger, audience, channel, opt-out path, quiet hours, and dedupe rule. Cite INV-C1 and INV-C3 | Nothing sends or auto-acts |
| **Non-functional** | Privacy and consent, data residency (INV-A3), PII handling (INV-A4), retention, attribution (INV-08), known scale ceilings. State the outcome, never the mechanism | Never skipped |

Non-functional rule: "Client PII is anonymized before any ingest" is a requirement. "Hash with SHA-256 in the ingest worker" is the engineer's call and does not belong in a PRD.

### Step 6: Risk Assessment (Value/Usability/Feasibility/Viability)
Evaluate risks across four dimensions (check ✅ when validated, leave ⬜ if still uncertain):

| Risk Type | Question | Status |
|-----------|----------|--------|
| **Value** | Will users want this? | ⬜ |
| **Usability** | Can users figure it out? | ⬜ |
| **Feasibility** | Can we build it? | ⬜ |
| **Viability** | Does it work for the business? | ⬜ |

### Step 7: Generate PRD
Use the skeleton in `work/_templates/prd.md` verbatim. Its order:

Header · TL;DR · Context · Problem · Jobs served · **Applicability** · Evidence · Decisions locked · Law touched · Success criteria · Proposed solution (how it works, user stories, states and screens, **operational workflows**) · Money composition · **Automation and messaging rules** · Permissions and roles · Edge cases · Reporting and data · **Non-functional requirements** · Non-goals · Dependencies · Rollout and migration · Risks · Open questions · Before finalizing · **Release criteria** · Sign-off · Change log

Delete any section with nothing in it, except Open questions, which stays even when empty so the reader knows it was checked.

Two gates, never merged: **Before finalizing** releases the document from draft; **Release criteria** release the feature to an operator, and every row keys to a use-case ID or an invariant.

## Output Template (generic fallback)

Only for a workspace with no `work/_templates/prd.md`. If that file exists, use it instead and ignore everything below.

```markdown
# PRD: [Feature Name]

**Status:** Draft | Problem Review | Solution Review | Approved
**Owner:** [PM Name]
**Last Updated:** [Date]
**Target Release:** [Date/Quarter]
**Availability:** [All users | Business tier | Pro tier | Enterprise only]
**Rationale:** [Why this tier?]

## Context
*What I found in your files:*
- **Roadmap:** [Feature status from product.md, or "Not currently on roadmap"]
- **Persona pain:** [Relevant quote or insight from personas.md]
- **Strategic fit:** [How this aligns with priorities from company.md]
- **Competitive:** [Do competitors have this? From competitors.md]

## Problem
[What problem? Who has it? In what situation?]

## Evidence
[User research, support tickets, data, quotes]

*Mark assumptions clearly:*
- ✅ **Validated:** [Evidence you have]
- ⚠️ **Assumed:** [Things you're inferring — flag for validation]

## Success Criteria

### Lagging Indicators (post-launch outcomes)
| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| [Metric 1] | [Value or PLACEHOLDER] | [Value] | [When] |
| [Metric 2] | [Value or PLACEHOLDER] | [Value] | [When] |

### Leading Indicators (pre-launch signals)
| Metric | Current | Target | What This Predicts |
|--------|---------|--------|-------------------|
| [Metric 1] | [Value or PLACEHOLDER] | [Value] | [e.g., predicts adoption] |
| [Metric 2] | [Value or PLACEHOLDER] | [Value] | [e.g., predicts quality] |
| [Metric 3] | [Value or PLACEHOLDER] | [Value] | [e.g., predicts retention] |

💡 **Leading indicators help you course-correct before launch.**

## Proposed Solution

### How It Works
[High-level description of the approach]

### User Stories (Examples)
*Include 2-3 concrete user stories to illustrate the solution and help engineering understand edge cases and scope boundaries.*

**Story 1:**
- **As a** [persona]
- **I want to** [action]
- **So that** [benefit]

**Story 2:**
- **As a** [persona]
- **I want to** [action]
- **So that** [benefit]

**Story 3 (if needed):**
- **As a** [persona]
- **I want to** [action]
- **So that** [benefit]

## Non-Goals
- [What we're explicitly NOT doing]

## Dependencies

### Feature Dependencies
- **[Feature/System]**: [Why we need it] — [Status/Timeline]
- **[Feature/System]**: [Why we need it] — [Status/Timeline]

### Team Dependencies
- **[Team]**: [What we need from them] — [Timeline]

### External Dependencies
- **[Third-party/API]**: [What we need] — [Risk if delayed]

**Critical Path:** [Which dependency blocks launch if delayed?]

💡 **Flag dependencies early to avoid last-minute surprises.**

## Risks
*Risk types: V=Value, U=Usability, F=Feasibility, B=Business Viability. Impact: H=High, M=Medium, L=Low*

| Risk | Type | Impact | Mitigation |
|------|------|--------|------------|
| [Risk] | V/U/F/B | H/M/L | [Plan] |

## Open Questions
*For each unknown, suggest a validation approach to turn assumptions into testable hypotheses.*

| Question | Assumption | How to Validate | Timeline |
|----------|-----------|-----------------|----------|
| [Question 1] | [What we're assuming] | [Experiment to run] | [When we need answer] |
| [Question 2] | [What we're assuming] | [Experiment to run] | [When we need answer] |

**Example:**
| Do agencies want automated balancing or manual control? | Automated preferred | 5 user interviews + prototype test | Before sprint 1 |

## Before Finalizing
Before you ship this PRD, double-check:
- [ ] Does `competitors.md` show competitors have this? (table stakes check)
- [ ] Did you miss any recent user feedback that contradicts this approach?

## Sign-off
| Role | Name | Approved |
|------|------|----------|
| Product | | ⬜ |
| Engineering | | ⬜ |
| Design | | ⬜ |
```

## Framework Reference

This skill uses **Marty Cagan's V/U/F/V Risk Framework** from *Inspired* and *Empowered*:

- **Value Risk:** Will customers buy/use this?
- **Usability Risk:** Can users figure out how to use it?
- **Feasibility Risk:** Can engineering build it with current resources?
- **Viability Risk:** Does it work for sales, legal, finance, etc.?

The goal is to address the biggest risks BEFORE building, not after.

## Tips for Best Results

1. **Keep your context files updated** — The more I know about your product, the better this PRD will be
2. **Be honest about evidence** — "I think" is fine, just label it as assumption
3. **Non-goals are as important as goals** — They prevent scope creep
4. **Update the PRD as you learn** — It's a living document, not a contract

## Related Workflows

Have raw research and a problem statement? `/problem-to-prd` runs the full pipeline — JTBD extraction, framing, PRD, and multi-perspective review. *(available in the full PM OS)*
