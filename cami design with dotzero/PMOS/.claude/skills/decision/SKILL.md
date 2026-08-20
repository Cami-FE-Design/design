---
name: decision
description: 'Make, document, and review product decisions. Three modes: /decision make (structure a new decision), /decision ship (go/no-go on a feature), /decision review (revisit past decisions). Use when: make a decision, should we ship, go no-go, decision log, document decision, review decisions, decision framework, compare options, trade-off analysis.'
disable-model-invocation: true
---

# Decision

Make, document, and review product decisions — then close the loop by revisiting them later.

## Modes

This skill has three modes. If no mode is specified, infer from context or ask.

| Mode | When to Use | Output |
|------|------------|--------|
| `make` | Structuring a new product decision (pricing, scope, prioritization, positioning, process) | `decisions/PDR-NNNN-[topic].md` |
| `ship` | Go/no-go on shipping a feature | `decisions/PDR-NNNN-ship-[feature].md` |
| `review` | Revisiting past decisions — close the loop on outcomes | Updates to existing files in `decisions/` |

## Output Location

All decisions go in `decisions/`. Auto-increment the PDR number by counting existing files:
1. List all files matching `PDR-*.md` in `decisions/`
2. Find the highest number
3. Use the next number

---

## Mode: `make`

Structure and make a product decision using the right framework for the situation.

### What You'll Need

**Critical (ask if not provided):**
- What decision do you need to make?
- What are the options you're considering? (at least 2)

**Helpful:**
- Constraints (timeline, budget, headcount, technical)
- Who needs to agree or be informed
- What you've already tried or ruled out

### Process

**Step 1: Check Context**
Read context files to ground the decision:
- `context/product.md` — Current priorities, roadmap, commitments
- `context/company.md` — Strategic goals, constraints
- `context/personas.md` — Who's affected?
- `context/competitors.md` — What are competitors doing?
- `decisions/` — Any related past decisions?

Tell the user what you found.

**Step 2: Classify the Decision**

| Type | Characteristics | Approach |
|------|----------------|----------|
| **One-way door** | Hard to reverse, high stakes (pricing, architecture, public API) | Full analysis, stakeholder buy-in |
| **Two-way door** | Easy to reverse, low stakes (UI copy, feature flag, process) | Decide fast, learn, adjust |
| **Cascading** | Unlocks or blocks other decisions | Decide first, unblock the chain |
| **Deadline-driven** | External forcing function | Optimize for the constraint |

If it's a two-way door, recommend deciding immediately.

**Step 3: Select Framework**

- **"Which option is best?"** -> Weighted Scorecard (3+ options, multiple criteria)
- **"Should we do X or Y?"** -> Pro/Con with Constraints (2 options, surface hidden downsides)
- **"What should we prioritize?"** -> Effort/Impact Matrix (limited resources)
- **"Build, buy, or partner?"** -> Build/Buy/Partner Analysis
- **"Is this worth doing?"** -> First Principles (questioning assumptions)

**Step 4: Apply the Framework**

Run the selected framework. Show your work — the analysis is the value, not just the answer.

**Step 5: Stress-Test**

Before finalizing, pressure-test:
- **Pre-mortem:** "6 months later, this failed. What went wrong?"
- **Reversibility:** "If wrong, what does the undo look like?"
- **Opportunity cost:** "What are we NOT doing by choosing this?"
- **Stakeholder test:** "Who would disagree? What would they say?"

**Step 6: Document**

Generate the PDR using the output template below.

---

## Mode: `ship`

Decide whether to ship, iterate, or kill a feature.

### What You'll Need

**Critical (ask if not provided):**
- What feature/product are you deciding on?
- What's the current state? (beta, internal, soft launch, etc.)

**Helpful:**
- Usage data, bug reports, user feedback
- Timeline or external pressure
- What's been iterated on already

### Process

**Step 1: Check Context** (same as `make` mode)

**Step 2: Reversibility Check**
- **Two-way door:** Bias toward shipping. You'll learn more from real users than another sprint of polish.
- **One-way door:** Be thorough.

**Step 3: Gather Evidence Across Four Dimensions**

| Dimension | Strong Ship | Acceptable | Needs Work |
|-----------|------------|------------|------------|
| **Quality** | No P0/P1 bugs, edge cases handled | Minor P2 bugs, workarounds exist | P0/P1 open, data issues |
| **User** | Positive feedback, high completion | Mixed feedback, usable but rough | Confused users, low completion |
| **Business** | Clear deadline or competitive need | Nice to have, no urgency | No clear business case |
| **Team** | High confidence across eng + design | Some concerns, manageable | Low confidence, "shipping to ship" |

**Step 4: Evaluate Three Options**
- **Ship Now** — minimum bar met? Known issues documented? Rollback plan? Monitoring plan?
- **Iterate (time-boxed)** — what specific gaps? How long (max 2 weeks)? Exit criteria?
- **Kill / Shelf** — problem still worth solving? What did you learn?

**Step 5: Generate Recommendation**

One of: Ship (with monitoring plan), Iterate (with time-box and exit criteria), or Kill (with learnings).

---

## Mode: `review`

Revisit past decisions. Close the feedback loop.

### Process

**Step 1: Read all files in `decisions/`**

**Step 2: Surface decisions needing review:**
- Review trigger dates that have passed
- Status = "Decided" older than 90 days with no `## Outcome` section
- Status = "Proposed" that never got resolved

**Step 3: For each decision needing review, present:**
- The original decision and rationale (1-2 sentences)
- The review trigger that fired
- What's changed since the decision was made (check context files, git history)
- Prompt: "Were you right? What actually happened?"

**Step 4: Help the user write the Outcome section:**

```markdown
## Outcome

_Reviewed: [Date]_

**Were we right?** [Yes / No / Partially] — [1-2 sentences]

**What we learned:**
- [Key learning 1]
- [Key learning 2]

**Status: [Active / Superseded by PDR-NNNN / Reversed]**
```

**Step 5: Update the decision file** with the Outcome section.

**Step 6: Summary**
After reviewing all flagged decisions, provide a summary:
- Decisions reviewed: [count]
- Right calls: [count]
- Wrong calls: [count] — with patterns if any
- Decisions still unresolved: [count]

---

## Output Template (for `make` and `ship` modes)

```markdown
# PDR-NNNN: [Decision Title]

**Status:** Proposed | Decided | Revisited | Reversed
**Date:** [YYYY-MM-DD]
**Decider:** [Name, Role]
**Category:** Prioritization | Pricing | Scope | Positioning | Go/No-Go | Kill | Process

## Context

*What I found in your files:*
- **Strategic priorities:** [From company.md]
- **Product state:** [From product.md]
- **User impact:** [From personas.md]
- **Competitive context:** [From competitors.md]
- **Related decisions:** [Any relevant past PDRs]

[What situation prompted this decision? What data do we have?]

## Options Considered

| Option | Evidence For | Evidence Against |
|--------|-------------|-----------------|
| [Option A] | [Why it could work] | [Why it might not] |
| [Option B] | [Why it could work] | [Why it might not] |

### Option A: [Name]
[Detail, pros, cons, effort, risk]

### Option B: [Name]
[Detail, pros, cons, effort, risk]

## Decision

[What we decided and why. One clear paragraph.]

## What We Gave Up

[What we explicitly chose NOT to do, and why. This is critical — it answers the future question "why didn't we do X?"]

## Stress Test

| Test | Finding |
|------|---------|
| **Pre-mortem** | If this fails, it's because... |
| **Reversibility** | To undo, we would need to... |
| **Opportunity cost** | By choosing this, we're NOT doing... |
| **Dissenting view** | [Who] might argue that... |

## Expected Outcome

[What we expect to happen. Specific enough to evaluate later.]

## Next Steps

- [ ] [Action 1] — Owner: [Name] — By: [Date]
- [ ] [Action 2] — Owner: [Name] — By: [Date]

## Review Trigger

[When should we revisit? e.g., "After 50 users", "Q3 2026", "If NPS < 30"]

## Outcome

_To be filled when the review trigger fires._
```

---

## Framework Reference

- **One-Way / Two-Way Doors** (Jeff Bezos) — Match analysis depth to reversibility
- **Weighted Decision Matrix** — Multi-criteria decision analysis
- **Pre-mortem** (Gary Klein) — Imagine failure to surface blind spots
- **First Principles** — Question assumptions, don't reason by analogy
- **Build/Buy/Partner** — Classic capability acquisition framework
- **Ship Decision Matrix** — Quality/user/business/team signal assessment
- **Decision Logs** (Kevin Yien, Coda) — The review loop builds product sense

**Key insight:** The biggest decision mistake isn't choosing wrong — it's not deciding, or deciding and never checking if you were right. Document the decision. Set a review trigger. Close the loop.

## Tips

1. **Most decisions are two-way doors.** If reversible in a sprint, decide now.
2. **3-5 criteria max.** More dilutes signal.
3. **Document "What We Gave Up"** — Future you will be asked "why didn't we do X?"
4. **Set concrete review triggers** — not "revisit later" but "after 50 users" or "Q3 2026"
5. **Run `/decision review` monthly** — the feedback loop is where product sense compounds.
