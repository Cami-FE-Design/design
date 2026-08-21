---
name: ab-test-designer
description: 'Design statistically sound experiments with clear hypotheses and sample size calculations. Use when: design ab test, create experiment, ab test plan, hypothesis testing.'
disable-model-invocation: true
category: data
---

# A/B Test Designer

Design statistically sound experiments with clear hypotheses and sample size calculations.

## Output
Write the file to exactly this path:

  work/analytics/outputs/ab-test-design-[name]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Before launching any A/B test
- Getting alignment on what you're testing and why
- Avoiding underpowered experiments that waste time

## What You'll Need

**Critical inputs (ask if not provided):**
- What are you testing? (change, hypothesis)
- Baseline conversion rate or metric value

**Nice-to-have inputs:**
- Expected effect size (minimum detectable effect)
- Traffic volume to estimate duration
- Related prior experiments

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Current metrics, known conversion issues, past experiments
- `context/personas.md` — Who's affected by this test? What's their behavior?
- `context/company.md` — Growth priorities, experimentation culture

**Tell the user what you found.** For example:
> "I found your onboarding conversion is 45% (product.md) and improving it is a Q2 priority (company.md). Your Jordan persona struggles with 'too many steps.' I'll design the test with Jordan's workflow in mind."

### Step 2: Gather Test Details
If you don't have enough context, ask:
> "Before I design this A/B test, I need:
> 1. What are you testing? (change + hypothesis)
> 2. What's the baseline metric? (I found [X] in product.md — is that the right baseline?)
> 3. What's the minimum improvement worth detecting?
>
> I can pull related context from product.md and personas.md."

**Do NOT design a test without knowing the baseline metric. Sample size depends on it.**

### Step 3: Define Hypothesis
Structure as: "If we [change], then [metric] will [improve] because [reason]."

### Step 2: Design Variants
- **Control:** Current experience
- **Treatment:** Changed experience
- Keep variants minimal and testable

### Step 3: Calculate Sample Size
Use a sample size calculator (Evan Miller's, Optimizely's, or your experimentation platform).
Inputs needed:
- Baseline conversion rate
- Minimum detectable effect (MDE) — smallest improvement worth detecting
- Statistical significance (typically 95%)
- Statistical power (typically 80%)

### Step 4: Define Metrics
- **Primary:** The ONE metric that determines success
- **Secondary:** Supporting metrics to watch
- **Guardrails:** Metrics that shouldn't get worse

### Step 5: Create Decision Framework
Before you start: what will you do with each outcome?

## Output Template

```markdown
# A/B Test Plan: [Test Name]

**Owner:** [Name]
**Start Date:** [Date]
**Duration:** [X] weeks

## Context
*What I found in your files:*
- **Baseline metric:** [From product.md]
- **Related priority:** [From company.md — why this matters]
- **Target persona:** [From personas.md — who this affects]
- **Persona insight:** [From personas.md — relevant behavior/friction]

## Hypothesis
**If we** [change],  
**then** [metric] will [direction] by [amount],  
**because** [reasoning].

## Variants

### Control (A)
[Current experience description]

### Treatment (B)
[Changed experience description]

## Sample Size Calculation
- **Baseline Rate:** [X]%
- **Minimum Detectable Effect:** [Y]% relative ([Z]% absolute)
- **Significance Level:** 95%
- **Power:** 80%
- **Required Sample:** [N] per variant
- **Estimated Duration:** [X] weeks at [Y] traffic/day

## Metrics

### Primary Metric
**Metric:** [Name]
**Current:** [X]%
**Target:** [Y]% (+[Z]% relative)

### Secondary Metrics
| Metric | Current | Watch For |
|--------|---------|-----------|
| [Metric 1] | [X] | [Direction] |
| [Metric 2] | [X] | [Direction] |

### Guardrail Metrics
| Metric | Floor | Action if Breached |
|--------|-------|-------------------|
| [Metric] | [X] | [Action] |

## Segmentation Plan
- [ ] New vs. returning users
- [ ] Mobile vs. desktop
- [ ] [Other relevant segments]

## Decision Framework

| Outcome | Action |
|---------|--------|
| Primary ↑, Guardrails OK | Ship to 100% |
| Primary flat, Guardrails OK | Iterate or kill |
| Primary ↑, Guardrails ↓ | Investigate tradeoff |
| Primary ↓ | Kill and learn |

## Risks & Mitigations
- [Risk 1] — Mitigation: [Plan]

## Pre-Launch Checklist
- [ ] Analytics events configured for all metrics
- [ ] A/B split configured in experimentation platform
- [ ] Dashboard created for monitoring
- [ ] Guardrail alerts set up
- [ ] Team aligned on decision framework
```

## Framework Reference
**Hypothesis-driven experimentation**:
- Clear, falsifiable hypotheses
- Adequate sample size to detect real effects
- Pre-registered decision criteria

## Tips for Best Results

1. **Use your context files** — I'll ground hypotheses in persona insights and known issues
2. **Calculate sample size first** — Underpowered tests waste time
3. **Pre-register decisions** — Decide what you'll do with each outcome before you start
4. **One primary metric** — Multiple primaries = p-hacking risk
5. **Set guardrails** — Define what shouldn't get worse while you optimize

## Suggested Updates
After the test concludes:
- [ ] Update `product.md` with new baseline if treatment wins
- [ ] Log learnings for future experiments
- [ ] Add to experiment history
