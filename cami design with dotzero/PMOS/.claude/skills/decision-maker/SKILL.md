---
name: decision-maker
description: 'Structure and make product decisions using the right framework for the situation. Use when: make a decision, decision framework, should we, compare options, trade-off analysis, one-way door, two-way door.'
disable-model-invocation: true
category: strategy
---

# Decision Maker

Structure and make product decisions using the right framework for the situation — then document the decision so your future self (and your team) knows why.

## Output
Write the file to exactly this path:

  work/strategy/outputs/decision-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- You're stuck between two or more options and can't decide
- A decision keeps getting revisited because it was never properly documented
- You need to align stakeholders on a contentious call
- You want to make a decision quickly but rigorously

## What You'll Need

**Critical inputs (ask if not provided):**
- What decision do you need to make?
- What are the options you're considering? (at least 2)

**Helpful (improves analysis):**
- Constraints (timeline, budget, headcount, technical)
- Who needs to agree or be informed
- What you've already tried or ruled out

## Process

### Step 1: Check Your Context
Read the user's context files to ground the decision in reality:
- `context/product.md` — Current priorities, roadmap, what's already committed
- `context/company.md` — Strategic goals, constraints, team structure
- `context/personas.md` — Who's affected by this decision?
- `context/competitors.md` — What are competitors doing in this space?

**Tell the user what you found.** For example:
> "I found your Q1 priorities focus on retention. Your eng team is 4 people with no spare capacity. Competitor X just launched a similar feature. This context will shape which option I recommend."

### Step 2: Classify the Decision
Not all decisions need the same rigor. Classify first:

| Type | Characteristics | Approach |
|------|----------------|----------|
| **One-way door** | Hard to reverse, high stakes (pricing, architecture, public API) | Full analysis, get stakeholder buy-in |
| **Two-way door** | Easy to reverse, low stakes (UI copy, feature flag, internal process) | Decide fast, learn, adjust |
| **Cascading** | Unlocks or blocks other decisions | Decide first, unblock the chain |
| **Deadline-driven** | External forcing function (launch date, contract, compliance) | Optimize for the constraint |

**Ask the user if unclear:**
> "Is this reversible? If we pick wrong, can we change course in a sprint — or are we locked in for 6+ months?"

**If it's a two-way door:** Recommend deciding immediately. Don't over-analyze reversible decisions.

### Step 3: Select the Right Framework
Match the decision type to a framework:

**For "Which option is best?" → Weighted Scorecard**
Best when: 3+ options, multiple criteria, need stakeholder alignment on trade-offs.

**For "Should we do X or Y?" → Pro/Con with Constraints**
Best when: 2 clear options, need to surface hidden downsides.

**For "What should we prioritize?" → Effort/Impact Matrix**
Best when: Multiple items competing for limited resources.

**For "Should we build, buy, or partner?" → Build/Buy/Partner Analysis**
Best when: Capability gap, need to evaluate make vs. buy trade-offs.

**For "Is this worth doing at all?" → First Principles**
Best when: Questioning assumptions, novel problem space, no obvious precedent.

I'll select the framework based on the decision and explain why. If you prefer a specific framework, tell me.

### Step 4: Apply the Framework

**Weighted Scorecard (default for complex decisions):**
1. Define criteria (3-5 max — more dilutes signal)
2. Weight each criterion (must total 100%)
3. Score each option per criterion (1-5 scale)
4. Calculate weighted scores
5. Check: does the winner feel right? If not, your criteria are wrong.

**Pro/Con with Constraints:**
1. List pros and cons for each option
2. Mark which pros/cons are reversible vs. permanent
3. Identify dealbreakers (any single con that kills the option)
4. Apply constraints as filters (budget, timeline, headcount)

**Effort/Impact Matrix:**
1. Estimate effort (team-weeks, not story points)
2. Estimate impact (on the metric that matters most)
3. Plot: high impact + low effort = do first
4. Flag: high effort items need PRD-level validation before committing

**Build/Buy/Partner:**
1. Define the capability gap
2. Evaluate: time-to-value, total cost (3-year), control, maintenance burden
3. Check strategic fit: is this core to your product or a commodity?
4. Rule: build core, buy commodity

**First Principles:**
1. State the assumption you're questioning
2. Break it into fundamental truths
3. Rebuild from the ground up — what would you do if starting from zero?
4. Compare with current approach

### Step 5: Stress-Test the Recommendation
Before finalizing, pressure-test:

- **Pre-mortem:** "It's 6 months later and this decision failed. What went wrong?"
- **Reversibility check:** "If this is wrong, what does the undo look like?"
- **Opportunity cost:** "What are we NOT doing by choosing this?"
- **Stakeholder test:** "Who would disagree? What would they say?"

### Step 6: Document the Decision
Every decision worth making is worth documenting. Generate a decision record that your future self will thank you for.

## Output Template

```markdown
# Decision: [Short Decision Title]

**Status:** Proposed / Decided / Superseded
**Date:** [Date]
**Owner:** [PM Name]
**Stakeholders:** [Who was consulted]

## Context
*What I found in your files:*
- **Strategic priorities:** [From company.md]
- **Product state:** [From product.md — what's already committed]
- **User impact:** [From personas.md — who's affected]
- **Competitive context:** [From competitors.md]

## Decision
[One sentence: what we decided]

## Classification
- **Reversibility:** One-way door / Two-way door
- **Type:** Strategic / Tactical / Operational
- **Urgency:** Deadline-driven / Cascading / Can wait
- **Framework used:** [Which framework and why]

## Options Considered

### Option A: [Name]
**Summary:** [1-2 sentences]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Effort:** [Low / Medium / High — with detail]
**Risk:** [What could go wrong]

### Option B: [Name]
[Same structure]

### Option C: [Name] (if applicable)
[Same structure]

## Analysis

### [Framework Name] Results

[Framework-specific output — scorecard table, effort/impact plot, build/buy comparison, etc.]

### Stress Test
| Test | Finding |
|------|---------|
| **Pre-mortem** | If this fails, it's because... |
| **Reversibility** | To undo this, we would need to... |
| **Opportunity cost** | By choosing this, we're NOT doing... |
| **Dissenting view** | [Stakeholder] might argue that... |

## Recommendation: Option [X]

**Why:** [2-3 sentences — the core reasoning]

**Key factor:** [The single most important consideration]

**What we're accepting:** [Trade-offs we're consciously making]

## Next Steps
- [ ] [Action item 1] — Owner: [Name] — By: [Date]
- [ ] [Action item 2] — Owner: [Name] — By: [Date]
- [ ] [Action item 3] — Owner: [Name] — By: [Date]

## Review Date
[When to revisit this decision — especially for two-way doors]
```

## Framework Reference

This skill draws from several decision-making methodologies:

- **One-Way / Two-Way Doors** (Jeff Bezos) — Match analysis depth to reversibility
- **Weighted Decision Matrix** — Standard multi-criteria decision analysis
- **Pre-mortem** (Gary Klein) — Imagine failure before it happens to surface blind spots
- **First Principles Thinking** — Question assumptions rather than reasoning by analogy
- **Build/Buy/Partner** — Classic technology acquisition framework

**Key insight:** The biggest decision-making mistake PMs make isn't choosing wrong — it's not deciding at all. Indecision has a cost. A documented "wrong" decision you can reverse is better than an undocumented non-decision that drags on for months.

## Tips for Best Results

1. **Don't over-classify** — Most decisions are two-way doors. If you can reverse it in a sprint, decide now and move on.
2. **3-5 criteria max** — More criteria means less signal. If everything matters equally, nothing matters.
3. **Document the "why" not just the "what"** — Future you will forget why you chose Option B. Write it down.
4. **Name the trade-offs** — Every decision has a cost. The best decisions explicitly acknowledge what you're giving up.
5. **Set a review date** — Decisions aren't permanent. Schedule a check-in to see if the context has changed.
