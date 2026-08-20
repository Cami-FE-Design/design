---
name: opportunity-solution-tree
description: 'Create Opportunity Solution Trees mapping business outcomes to user opportunities to testable solutions. Use when: opportunity tree, solution tree, teresa torres, ost, continuous discovery.'
category: strategy
---

# Opportunity Solution Tree Builder

Create visual Opportunity Solution Trees that map business outcomes to user opportunities to testable solutions.

## Output
Write the file to exactly this path:

  work/strategy/outputs/ost-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Starting a new product initiative and need to explore the space
- Quarterly planning to map user needs to business goals
- Getting stakeholder alignment on why you're building what you're building
- Avoiding premature commitment to a single solution

## What You'll Need

**Critical inputs (ask if not provided):**
- A clear, measurable business outcome you're trying to move

**Nice-to-have inputs:**
- Research insights about user needs/opportunities
- Evidence for each opportunity (interviews, feedback, data)
- Initial solution ideas (will generate more)

If research insights aren't provided, the skill will ask for them or help generate hypotheses to validate.

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Current metrics, goals, what outcomes matter
- `context/personas.md` — User types, their jobs, pains, and gains
- `context/company.md` — Business priorities, what "success" means

**Tell the user what you found.** For example:
> "I found your North Star metric in product.md: 'Weekly Active Projects.' Your Jordan persona struggles with 'manual workload tracking' — that's an opportunity to explore. Your company.md shows Q1 priority is retention over acquisition, so I'll focus the tree on retention-driving outcomes."

### Step 2: Gather Outcome Context
If you don't have enough context, ask:
> "Before I build this Opportunity Solution Tree, I need:
> 1. What measurable business outcome are we targeting?
> 2. What user research or insights do you have about why users aren't achieving this outcome?
>
> I can pull user needs from personas.md and current metrics from product.md."

### Step 3: Validate the Outcome
Ensure the outcome is:
- Measurable (has a number)
- Achievable (within team's influence)
- Specific (not "improve product")

Good: "Increase trial-to-paid conversion from 12% to 18%"
Bad: "Improve the product" (too vague)

If outcome is vague, ask: "What metric would move if this initiative succeeds?"

### Step 4: Map Opportunities
List user opportunities that could drive this outcome:
- Frame as user needs, NOT solutions
- Ground each in research evidence
- Prioritize by impact potential

Good: "PMs struggle to see who's overloaded"
Bad: "Build a workload dashboard" (that's a solution)

If no research is provided, ask: "What do you know about why users aren't achieving [outcome]?"

### Step 5: Brainstorm Solutions
For each opportunity, generate multiple solutions:
- Aim for 3+ solutions per opportunity
- Include both big bets and small experiments
- Don't filter yet — quantity over quality
- Avoid fixating on the "obvious" solution

### Step 6: Identify Assumptions
For each solution, list what must be true for it to work:
- **Value:** Will users want this?
- **Usability:** Can users figure it out?
- **Feasibility:** Can we build it?
- **Viability:** Does it work for the business?

### Step 7: Prioritize Experiments
Design small tests to validate assumptions before building:
- Prioritize by: risk (high risk = test first) and effort (low effort = test first)
- One experiment can test multiple assumptions

## Output Template

```markdown
# Opportunity Solution Tree

**Outcome:** [Your measurable business outcome]
**Owner:** [PM Name]
**Date:** [Date]

## Context
*What I found in your files:*
- **Current metrics:** [From product.md — baseline for outcome]
- **Target personas:** [From personas.md — whose opportunities we're mapping]
- **Known pains:** [From personas.md — starting point for opportunities]
- **Company priorities:** [From company.md — alignment check]

## Tree Structure

```
OUTCOME: [Measurable goal]
├── OPPORTUNITY 1: [User need — not a solution]
│   ├── Solution A: [Idea]
│   │   └── Assumption: [What must be true]
│   ├── Solution B: [Idea]
│   └── Solution C: [Idea]
├── OPPORTUNITY 2: [User need]
│   ├── Solution A: [Idea]
│   └── Solution B: [Idea]
└── OPPORTUNITY 3: [User need]
    └── Solution A: [Idea]
```

## Opportunity Details

### Opportunity 1: [Name]
**Evidence:** [Research that supports this — quotes, data, observations]
**Impact Potential:** High/Medium/Low

**Solutions:**

| Solution | Assumptions | Test Idea |
|----------|-------------|-----------|
| [A] | [What must be true] | [Small experiment] |
| [B] | [What must be true] | [Small experiment] |
| [C] | [What must be true] | [Small experiment] |

---

### Opportunity 2: [Name]
[Same structure]

---

## Prioritized Experiments

| Experiment | Tests | Effort | Run First? |
|------------|-------|--------|------------|
| [Test 1] | [Assumption] | Low | ✅ |
| [Test 2] | [Assumption] | Medium | |

## Next Steps
1. [Immediate action — this week]
2. [This sprint]
3. [Later]
```

## Framework Reference

**Teresa Torres' Opportunity Solution Tree** from *Continuous Discovery Habits*:

```
         [OUTCOME]           ← What the business needs
              |
    ┌─────────┼─────────┐
[OPP 1]   [OPP 2]   [OPP 3]  ← What users need (opportunities)
    |         |         |
[Sol A]   [Sol A]   [Sol A]  ← What we might build (solutions)
[Sol B]   [Sol B]
[Sol C]
```

**Key principles:**
- Start with ONE outcome (multiple outcomes = multiple trees)
- Opportunities are user needs, not solutions
- Always have multiple solutions per opportunity
- Test assumptions before building
- It's a living document, not a one-time exercise

## Tips for Best Results

1. **Use your context files** — I'll ground opportunities in persona research
2. **One outcome at a time** — Multiple outcomes = multiple trees
3. **Frame opportunities as needs** — "Need faster checkout" not "Add Apple Pay"
4. **Multiple solutions per opportunity** — Avoid premature commitment
5. **Ground in evidence** — Cite research for each opportunity
6. **Test before building** — Small experiments prevent big waste
7. **Revisit weekly** — OSTs evolve as you learn

## Suggested Updates
After building the tree:
- [ ] Update `personas.md` with new opportunities discovered
- [ ] Add validated solutions to `product.md` roadmap
- [ ] Document experiment results to inform future trees
