---
name: north-star-finder
description: 'Identify the ONE metric that best captures the core value your product delivers to customers. Use when: north star metric, primary metric, key metric, success metric.'
disable-model-invocation: true
category: strategy
---

# North Star Metric Finder

Identify the ONE metric that best captures the core value your product delivers to customers.

## Output
Write the file to exactly this path:

  work/analytics/outputs/north-star-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Early-stage products defining their first metrics
- Established products whose North Star no longer fits
- Aligning teams around a common definition of success

## What You'll Need

**Critical inputs (ask if not provided):**
- What product are you defining a North Star for?
- What value does your product deliver to users?

**Nice-to-have inputs:**
- Current metrics you're tracking
- Business model context (subscription, transactional, etc.)

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Value proposition, current metrics, key features
- `context/personas.md` — Who receives value? What's their "aha moment"?
- `context/company.md` — Business model, revenue goals, strategic priorities

**Tell the user what you found.** For example:
> "I found your value prop is 'AI-powered project planning that saves agencies 10+ hours/week' (product.md). Your Jordan persona's aha moment is 'seeing team workload at a glance.' I'll evaluate candidate North Stars against this value delivery."

### Step 2: Gather Product Context
If you don't have enough context, ask:
> "Before I help find your North Star metric, I need:
> 1. What's your product's core value proposition? (I found [X] in product.md — does that capture it?)
> 2. What metrics are you tracking today?
>
> I can pull persona insights from personas.md and business context from company.md."

**Do NOT recommend a North Star without understanding the value your product delivers.**

### Step 3: Define Core Value
What is the primary value your product delivers to users?
- What "aha moment" do successful users experience?
- What would users miss most if you disappeared?

### Step 2: Generate Candidates
Brainstorm metrics that might capture this value:
- Usage metrics (DAU, sessions, actions)
- Outcome metrics (tasks completed, goals achieved)
- Value metrics (time saved, revenue generated)

### Step 3: Evaluate Against Criteria
Score each candidate (1-5) on these criteria:

1. **Expresses value:** Does it measure customer value received, not vanity?
   - 5: Directly measures value (e.g., "problems solved")
   - 3: Proxy for value (e.g., "sessions")
   - 1: Vanity metric (e.g., "signups")

2. **Leading indicator:** Does it predict future success?
   - 5: Changes precede revenue/retention by weeks
   - 3: Moves alongside outcomes
   - 1: Lagging (only moves after outcomes)

3. **Actionable:** Can teams influence it directly?
   - 5: Product/growth/CS can all move it
   - 3: Only some teams can influence
   - 1: External factors dominate

4. **Simple:** Can everyone understand and track it?
   - 5: One sentence definition, dashboard-ready
   - 3: Requires explanation
   - 1: Complex calculation, disputed definition

5. **Not gameable:** Hard to inflate without real value?
   - 5: Can only grow through genuine value delivery
   - 3: Some gaming risk
   - 1: Easy to manipulate

### Step 4: Map Input Metrics
What activities drive the North Star?

### Step 5: Define Counter-Metrics
What shouldn't suffer while optimizing the North Star?

## Output Template

```markdown
# North Star Metric Analysis

**Product:** [Name]
**Core Value:** [What value you deliver]
**Data Sources:** [List data used for this analysis]

## Context
*What I found in your files:*
- **Value proposition:** [From product.md]
- **Target persona:** [From personas.md]
- **Aha moment:** [From personas.md — when users get value]
- **Business model:** [From company.md]
- **Current metrics:** [From product.md if documented]

## Candidate Metrics

| Metric | Expresses Value | Leading | Actionable | Simple | Score |
|--------|----------------|---------|------------|--------|-------|
| [Metric A] | ✅ | ✅ | ⚠️ | ✅ | 4/5 |
| [Metric B] | ⚠️ | ✅ | ✅ | ✅ | 3.5/5 |

## Recommended North Star

**Metric:** [Name]
**Definition:** [Exactly how it's calculated]
**Why This One:** [Rationale]

## Input Metrics (What Drives It)
- [Input 1] → [How it affects North Star]
- [Input 2] → [How it affects North Star]

## Counter-Metrics (What to Protect)
- [Counter 1] — Why: [Reason]
- [Counter 2] — Why: [Reason]

## Implementation
- **Data Source:** [Where it comes from]
- **Update Frequency:** [How often]
- **Owner:** [Who's responsible]

## Review Triggers
Reconsider this North Star if:
- [Condition 1]
- [Condition 2]
```

## Framework Reference
**North Star Framework** (Sean Ellis/Amplitude):
- One metric that captures core value
- Aligns teams across functions
- Input metrics drive it; counter-metrics protect from gaming

## Tips for Best Results

1. **Use your context files** — I'll ground the analysis in your actual value prop and personas
2. **Value over vanity** — The best North Stars measure value received, not activity
3. **Leading over lagging** — Revenue is an outcome, not a driver
4. **Simple over complex** — If you can't explain it in one sentence, simplify
5. **Test for gaming** — Can teams inflate it without delivering real value?

## Suggested Updates
After selecting your North Star:
- [ ] Add North Star definition to `product.md`
- [ ] Update OKRs in `company.md` to align with North Star
- [ ] Set up dashboard tracking North Star + input metrics
