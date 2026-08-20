---
name: ab-test-analyzer
description: 'Interpret experiment results with statistical rigor and clear ship/no-ship recommendations. Use when: analyze ab test, ab test results, experiment analysis, statistical significance.'
disable-model-invocation: true
category: data
---

# A/B Test Analyzer

Interpret experiment results with statistical rigor and clear ship/no-ship recommendations.

## Output
Write the file to exactly this path:

  work/analytics/outputs/ab-test-results-[name]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Interpreting completed A/B tests
- Preparing experiment results for stakeholder review
- Learning statistical analysis through practice

## What You'll Need

**Critical inputs (ask if not provided):**
- Test results (control and treatment metrics)
- Sample sizes for each variant
- Original hypothesis

**Nice-to-have inputs:**
- Success criteria and decision framework
- Segment breakdowns
- Guardrail metric data

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Baseline metrics, related experiments, current conversion rates
- `context/personas.md` — Who was in this test? How do different personas behave?
- `context/company.md` — Decision-making thresholds, experimentation culture

**Tell the user what you found.** For example:
> "I found your baseline conversion rate is 4.2% (product.md). Your Jordan persona typically converts higher than average. If the test affected Jordan-type users differently, I'll flag that in segment analysis."

### Step 2: Get Test Results
If you don't have the data, ask:
> "Before I analyze this A/B test, I need:
> 1. Control and treatment results (users, conversions, rates)
> 2. Sample sizes for each variant
> 3. What was the original hypothesis?
>
> I can pull baseline context from product.md for comparison."

**Do NOT analyze without actual test data. I need real numbers.**

### Step 3: Data Quality Checks
Before analysis, verify data is trustworthy:
- **Sample Ratio Mismatch (SRM):** Are groups ~50/50? If >2% off, something is wrong with randomization.
- **Novelty/Primacy effects:** Compare Week 1 vs Week 3+ behavior. Effects should stabilize.
- **Data integrity:** Check for logging gaps, duplicate events, or missing data.

### Step 4: Statistical Analysis
- Calculate lift (relative and absolute)
- Confidence intervals
- P-value / statistical significance

### Step 5: Segment Analysis
Break down by key segments to find hidden patterns:
- New vs. returning users — Does treatment help one more?
- Device type — Mobile vs desktop behavior differences?
- User segments — Power users vs casual behave differently?

**Action guide:** If a segment shows much bigger lift, consider targeting rollout. If a segment shows negative impact, investigate before shipping.

### Step 6: Interpret Results
- Is the effect real or noise?
- Is the effect meaningful (not just significant)?
- What do segments tell us?

### Step 7: Make Recommendation
Ship / Kill / Iterate — with clear reasoning.

## Output Template

```markdown
# A/B Test Results: [Test Name]

**Test Duration:** [Start] - [End]
**Owner:** [Name]
**Data Sources:** [Experimentation platform, analytics dashboard]

## Context
*What I found in your files:*
- **Baseline metric:** [From product.md]
- **Target persona:** [From personas.md — who was most affected]
- **Related experiments:** [From product.md if documented]

## Summary
**Recommendation:** 🚀 Ship / ⚠️ Iterate / ❌ Kill
**Confidence:** High / Medium / Low

## Data Quality Checks

| Check | Status | Notes |
|-------|--------|-------|
| Sample Ratio | ✅ / ⚠️ / ❌ | [X]% control, [Y]% treatment |
| Novelty Effects | ✅ / ⚠️ / ❌ | [Notes] |
| Data Integrity | ✅ / ⚠️ / ❌ | [Notes] |

## Primary Metric Results

| Variant | Users | Conversions | Rate | 
|---------|-------|-------------|------|
| Control | [N] | [N] | [X]% |
| Treatment | [N] | [N] | [Y]% |

**Lift:** +[X]% relative (+[Y]% absolute)
**95% CI:** [[X]%, [Y]%]
**P-Value:** [X]
**Statistically Significant:** Yes / No

## Secondary Metrics

| Metric | Control | Treatment | Lift | Significant? |
|--------|---------|-----------|------|--------------|
| [Metric 1] | [X] | [Y] | [Z]% | Yes/No |
| [Metric 2] | [X] | [Y] | [Z]% | Yes/No |

## Guardrail Metrics

| Metric | Control | Treatment | Status |
|--------|---------|-----------|--------|
| [Metric] | [X] | [Y] | ✅ OK / ⚠️ Watch / ❌ Breach |

## Segment Analysis

| Segment | Control | Treatment | Lift | Notes |
|---------|---------|-----------|------|-------|
| New Users | [X]% | [Y]% | [Z]% | [Insight] |
| Returning | [X]% | [Y]% | [Z]% | [Insight] |
| Mobile | [X]% | [Y]% | [Z]% | [Insight] |
| Desktop | [X]% | [Y]% | [Z]% | [Insight] |

## Interpretation
[What do these results mean? Why did we see this?]

## Recommendation
**Decision:** [Ship / Kill / Iterate]
**Reasoning:** [Why]
**Next Steps:**
1. [Step 1]
2. [Step 2]
```

## Framework Reference
**Statistical hypothesis testing**:
- P < 0.05 = significant (95% confidence)
- Check practical significance, not just statistical
- Segments can reveal hidden patterns

## Tips for Best Results

1. **Use your context files** — I'll compare results against baseline metrics
2. **Check data quality first** — SRM and novelty effects can invalidate results
3. **Practical > statistical** — A 0.1% lift isn't worth shipping even if significant
4. **Segment analysis reveals insights** — Overall flat can hide segment wins/losses
5. **Document the decision** — Future you will want to know why you shipped or killed

## Suggested Updates
After analysis:
- [ ] Update `product.md` with new baseline if treatment ships
- [ ] Log experiment learnings for institutional memory
- [ ] Remove feature flag after rollout complete
