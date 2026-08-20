---
name: risk-register-builder
description: 'Identify and track product risks using Value/Usability/Feasibility/Viability framework with mitigation plans Use when: risk register, risk assessment, project risks, risk mitigation, what could go wrong.'
disable-model-invocation: true
category: strategy
---

# Risk Register Builder

Identify and track product risks using Marty Cagan's V/U/F/V (Value, Usability, Feasibility, Viability) framework with severity scoring and mitigation plans.

## Output
Write the file to exactly this path:

  work/specs/outputs/risk-register-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- Before kicking off a new initiative (proactive risk identification)
- Midway through a project to reassess
- When presenting to leadership with risk transparency
- After a near-miss or incident to capture learnings

## What You'll Get

- Complete risk register with V/U/F/V categorization
- Risk scores (likelihood × impact) with HIGH/MEDIUM/LOW prioritization
- Mitigation plans with owners and due dates
- Risk matrix visualization
- Review history for tracking changes over time

## What You'll Need

**Critical inputs (ask if not provided):**
- What initiative or project are you assessing?
- Basic scope and timeline

**Nice-to-have inputs:**
- Known constraints (timeline, budget, dependencies)
- Technical considerations
- Market or competitive context

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand constraints and dependencies:
- `context/product.md` — Related features, past incidents, known technical debt
- `context/company.md` — Strategic priorities, team capacity, dependencies
- `context/personas.md` — User impact if risks materialize
- `context/competitors.md` — Competitive risks, market timing

I'll summarize what I found. For example:
> "I found 'Resource Planning v2' in your product.md as a Q2 priority. Your company.md shows you have 25 engineers and a Q2 deadline. Your competitors.md mentions Monday.com has this feature. I'll assess risks across value (do users want this?), feasibility (can you build it in time?), and viability (competitive timing)."

### Step 2: Gather Initiative Details
If you don't have enough context, ask:
> "Before I build this risk register, I need:
> 1. What initiative? (I found [X] in product.md — is that it?)
> 2. What's the timeline and scope?
> 3. Any known constraints or dependencies?
>
> I can pull competitive context from competitors.md and user context from personas.md."

### Step 3: Describe the Initiative
What are you building? Who is it for? What's the timeline?

### Step 4: Identify Risks by Category
I'll use the V/U/F/V framework to surface risks:
- **Value Risk:** Will users actually want this?
- **Usability Risk:** Can users figure it out?
- **Feasibility Risk:** Can we build it with our team, tech, and timeline?
- **Viability Risk:** Does it work for the business (legal, financial, strategic)?

### Step 5: Score Each Risk
I'll assess each risk:
- **Likelihood:** How likely is this to happen? (1-5)
- **Impact:** How bad if it does? (1-5)
- **Risk Score:** Likelihood × Impact (1-25)

**Scoring guide:**
- 15-25: HIGH — Needs immediate attention and active mitigation
- 6-14: MEDIUM — Monitor closely, have contingency plan
- 1-5: LOW — Accept or monitor passively

### Step 6: Plan Mitigations
For HIGH and MEDIUM risks, I'll identify:
- What can we do to reduce likelihood?
- What can we do to reduce impact if it happens?
- Who owns this mitigation?
- When will we take action?

### Step 7: Set Review Cadence
I'll recommend how often to reassess (weekly for high-risk initiatives, bi-weekly otherwise).

## Output Template

I'll generate this risk register for you:

```markdown
# Risk Register: [Initiative Name]

**Date:** [Date]
**Owner:** [PM Name]
**Review Cadence:** [Weekly/Bi-weekly]

## Context
*What I found in your files:*
- **Initiative status:** [From product.md]
- **Strategic priority:** [From company.md]
- **Target persona:** [From personas.md — who's affected]
- **Competitive context:** [From competitors.md — market timing]
- **Team capacity:** [From company.md]

---

## Risk Summary

| Category | High | Medium | Low |
|----------|------|--------|-----|
| Value | [N] | [N] | [N] |
| Usability | [N] | [N] | [N] |
| Feasibility | [N] | [N] | [N] |
| Viability | [N] | [N] | [N] |

**Overall Risk Level:** High / Medium / Low

---

## Top Risks Requiring Attention

| # | Risk | Category | Score | Status |
|---|------|----------|-------|--------|
| R1 | [Risk name] | [Category] | [Score] | [Open/Mitigating] |
| R2 | [Risk name] | [Category] | [Score] | [Open/Mitigating] |
| R3 | [Risk name] | [Category] | [Score] | [Open/Mitigating] |

---

## Detailed Risks

### R1: [Risk Name] — HIGH
**Category:** Value / Usability / Feasibility / Viability
**Description:** [What could go wrong]

**Likelihood:** [X]/5 — [Why this rating]
**Impact:** [X]/5 — [Why this rating]
**Risk Score:** [L × I]

**Mitigation Plan:**
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| [Specific action to reduce likelihood or impact] | [Name] | [Date] | Not Started / In Progress / Done |
| [Specific action] | [Name] | [Date] | Status |

**Status:** Open / Actively Mitigating / Mitigated / Accepted / Closed

---

### R2: [Risk Name] — MEDIUM
**Category:** [Category]
**Description:** [What could go wrong]

**Likelihood:** [X]/5 — [Rationale]
**Impact:** [X]/5 — [Rationale]
**Risk Score:** [Score]

**Mitigation Plan:**
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| [Action] | [Name] | [Date] | [Status] |

**Status:** [Status]

---

### R3: [Risk Name] — LOW
**Category:** [Category]
**Description:** [What could go wrong]

**Likelihood:** [X]/5 — [Rationale]
**Impact:** [X]/5 — [Rationale]
**Risk Score:** [Score]

**Mitigation:** [Accept / Monitor / Brief action if any]

**Status:** Accepted / Monitoring

---

## Risk Matrix Visualization

```
            │ Low Impact    │ High Impact
────────────│───────────────│─────────────────
High        │ MEDIUM        │ HIGH
Likelihood  │ (Monitor)     │ (Act Now)
            │               │
────────────│───────────────│─────────────────
Low         │ LOW           │ MEDIUM
Likelihood  │ (Accept)      │ (Contingency)
            │               │
```

**Risk placement:**
- HIGH quadrant: [R1, R2]
- MEDIUM quadrant: [R3]
- LOW quadrant: [R4, R5]

---

## Review History

| Date | Changes Made | New Risks | Closed Risks |
|------|--------------|-----------|--------------|
| [Date] | Initial assessment | [N] | 0 |
| [Date] | [Summary of changes] | [N] | [N] |

---

## Next Review: [Date]

**Focus areas for next review:**
- [Risk to watch]
- [Mitigation to verify]
```

## Framework Reference

**Marty Cagan's V/U/F/V Risk Framework** (from *Inspired* and *Empowered*):

| Risk Type | Core Question | Examples |
|-----------|---------------|----------|
| **Value** | Will users want this? | No demand, wrong problem, wrong solution |
| **Usability** | Can users figure it out? | Confusing UX, high learning curve, accessibility issues |
| **Feasibility** | Can we build it? | Tech complexity, skills gap, timeline, dependencies |
| **Viability** | Should we build it? | Legal risk, cost, strategy misalignment, competitive response |

The framework ensures you consider all dimensions of product risk, not just technical feasibility.

**Scoring principles:**
- Be honest about likelihood — optimism bias kills projects
- Consider second-order impacts — what happens downstream if this risk materializes?
- Mitigations should be concrete actions, not "be careful"

## Tips for Best Results

1. **Use your context files** — I'll identify risks based on your real constraints and competitive context
2. **Brainstorm before scoring** — List all risks first, then score. Scoring during brainstorming kills creativity.
3. **Get diverse perspectives** — Engineering sees feasibility, design sees usability, business sees viability
4. **Update regularly** — Risks change. A risk register that's never updated is useless.
5. **Be honest about HIGH risks** — Leadership needs to know. Sugar-coating doesn't help.
6. **Focus mitigations** — You can't mitigate everything. Focus on HIGH risks.
7. **Celebrate closed risks** — When mitigations work, note it. Builds risk management muscle.

## Suggested Next Steps

After reviewing this risk register, you can:
- Add key risks to the initiative section in `product.md`
- Share HIGH risks with leadership
- Set calendar reminder for review cadence
