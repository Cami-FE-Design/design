---
name: funnel-analyzer
description: 'Analyze conversion funnels to identify drop-off points and optimization opportunities. Use when: funnel analysis, conversion funnel, drop-off analysis, funnel optimization.'
disable-model-invocation: true
category: data
---

# Funnel Analyzer

Analyze conversion funnels to identify drop-off points and optimization opportunities.

## Output
Write the file to exactly this path:

  work/analytics/outputs/funnel-analysis-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Diagnosing a conversion problem
- Prioritizing funnel optimization efforts
- Preparing growth reviews with data

## What You'll Need

**Critical inputs (ask if not provided):**
- What funnel are you analyzing? (onboarding, purchase, activation, etc.)
- Funnel data: stages, user counts, conversion rates

**Nice-to-have inputs:**
- Segment breakdowns (traffic source, device, user type)
- Time period comparison (this month vs last month)
- Historical benchmarks

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Known conversion issues, current metrics, funnel benchmarks
- `context/personas.md` — Who's in this funnel? What are their friction points?
- `context/company.md` — Growth priorities, conversion targets

**Tell the user what you found.** For example:
> "I found 'onboarding completion at 45%' flagged as a known issue in product.md. Your Jordan persona struggles with 'too many steps to see value.' I'll look for where Jordan-type users are dropping off."

### Step 2: Gather Funnel Data
If you don't have the data, ask:
> "Before I analyze this funnel, I need the actual data:
> 1. What funnel? (I found [X] mentioned in product.md)
> 2. Stage-by-stage numbers (users entering each stage, not just percentages)
> 3. Time period
>
> Can you paste the data from your analytics tool?"

**Do NOT generate a funnel analysis without real data. I need actual numbers to size impact.**

### Step 3: Define the Funnel
Map each stage from entry to goal:
- What action defines each stage?
- What's the time window?

### Step 2: Calculate Drop-offs
For each step:
- How many enter?
- How many proceed?
- What's the conversion rate?
- What's the absolute drop-off?

### Step 3: Segment Analysis
Compare conversion by:
- Traffic source
- Device type
- User type (new vs. returning)
- Geography

### Step 4: Generate Hypotheses
Why are users dropping off at each stage?

### Step 5: Prioritize Improvements
Which fixes would have the most impact?

## Output Template

```markdown
# Funnel Analysis: [Funnel Name]

**Period:** [Date range]
**Total Entries:** [N]
**Completion Rate:** [X]%
**Data Sources:** [Analytics tool, dashboard name]

## Context
*What I found in your files:*
- **Known issues:** [From product.md — related conversion problems]
- **Target persona:** [From personas.md — who's in this funnel]
- **Persona friction points:** [From personas.md — where they struggle]
- **Conversion targets:** [From company.md or product.md]

## Funnel Overview

| Stage | Users | Conv. Rate | Drop-off | Lost |
|-------|-------|------------|----------|------|
| [Stage 1] | 10,000 | 100% | - | - |
| [Stage 2] | 6,000 | 60% | 40% | 4,000 |
| [Stage 3] | 3,000 | 50% | 50% | 3,000 |
| [Stage 4] | 1,500 | 50% | 50% | 1,500 |
| [Goal] | 750 | 50% | 50% | 750 |

**Overall Conversion:** 7.5%

## Drop-off Analysis

### Biggest Drop: Stage 1 → Stage 2 (40% drop)
**Lost Users:** 4,000
**Hypotheses:**
- [Hypothesis 1]
- [Hypothesis 2]

**Recommended Tests:**
- [ ] [Test idea 1]
- [ ] [Test idea 2]

### Second Drop: Stage 2 → Stage 3 (50% drop)
[Same structure]

## Segment Comparison

| Segment | Stage 1→2 | Stage 2→3 | Overall |
|---------|-----------|-----------|---------|
| Mobile | 55% | 45% | 5.2% |
| Desktop | 68% | 58% | 9.8% |
| New Users | 52% | 42% | 4.5% |
| Returning | 75% | 65% | 12.1% |

**Insights:**
- [What segments reveal]

## Impact Projection

| Improvement | Current | Target | Impact |
|-------------|---------|--------|--------|
| Stage 1→2: +10% | 60% | 70% | +1,000 completions |
| Stage 2→3: +10% | 50% | 60% | +600 completions |

## Recommendations
1. **Focus First:** [Which stage and why]
2. **Test:** [Specific experiments]
3. **Monitor:** [What to track]
```

## Framework Reference
**Funnel analysis**:
- Absolute numbers reveal real impact
- Segments reveal who's struggling
- Fix the biggest leaks first

## Tips for Best Results

1. **Use your context files** — I'll connect drop-offs to known persona friction points
2. **Absolute numbers matter** — "50% drop" means nothing without knowing 50 users vs 50,000
3. **Segment to find insights** — Overall numbers hide who's struggling
4. **Size the opportunity** — Focus on fixes with the biggest absolute impact
5. **Generate hypotheses** — Data shows where, not why. Test hypotheses.

## Suggested Updates
After analysis:
- [ ] Update `product.md` with conversion benchmarks
- [ ] Add top hypotheses to your experiment backlog
- [ ] Schedule tests for biggest drop-off points
