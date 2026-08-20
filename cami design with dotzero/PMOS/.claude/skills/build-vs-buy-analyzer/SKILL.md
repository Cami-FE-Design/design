---
name: build-vs-buy-analyzer
description: 'Analyzes whether to build internally or buy an existing solution Use when: analyze build vs. buy, build vs. buy, build or buy, make vs buy, vendor evaluation.'
disable-model-invocation: true
category: strategy
---

# Build vs. Buy Analyzer

Analyzes whether to build internally or buy an existing solution with structured decision framework.

## Output
Write the file to exactly this path:

  work/strategy/outputs/build-vs-buy-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- New capability decisions
- Vendor evaluations
- Architecture decisions
- Make vs. buy trade-offs

## The Problem

Engineering wants to build, finance wants to buy, leadership wants a recommendation by Friday. Without structured analysis, the decision becomes political.

## What You'll Need

**Critical inputs (ask if not provided):**
- What capability are you evaluating?
- Key requirements (must-have vs nice-to-have)

**Nice-to-have inputs:**
- Vendor options being considered
- Engineering capacity and cost data
- Timeline constraints

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Related features, technical constraints, roadmap
- `context/company.md` — Team capacity, strategic priorities, budget
- `context/competitors.md` — What competitors use (build vs vendor)

**Tell the user what you found.** For example:
> "I found your Engineering team has 25 people (company.md). Your Q2 priorities include 'Resource Planning v2' and 'Enterprise Security.' If you build this capability, you'll need to trade off against those priorities. I'll factor opportunity cost into the analysis."

### Step 2: Gather Requirements
If you don't have enough context, ask:
> "Before I analyze build vs buy, I need:
> 1. What capability are you evaluating?
> 2. What are the must-have requirements?
> 3. Are there vendor options you're considering?
>
> I can pull team capacity from company.md and strategic context from product.md."

## What You'll Get

- Requirements list (must-have vs. nice-to-have)
- Build option analysis (cost, timeline, risks)
- Buy option analysis (per vendor)
- Comparison matrix with weighted scores
- Clear recommendation with rationale
- When to reconsider triggers

## Process (continued)

### Step 3: Gather Requirements
Distinguish between:
- **Must-haves:** Non-negotiable requirements
- **Nice-to-haves:** Would improve solution but not blocking
- **Out-of-scope:** Explicitly excluded

### Step 4: Analyze Build Option
Assess internal development:
- Engineering cost (headcount, time)
- Timeline to MVP, to feature parity
- Ongoing maintenance burden
- Technical risks
- Opportunity cost

### Step 5: Analyze Buy Options
For each vendor:
- Cost (license, implementation, ongoing)
- Feature coverage vs. requirements
- Integration complexity
- Vendor risk (stability, roadmap alignment)
- Support and SLAs

### Step 6: Create Weighted Comparison
Score each option against criteria:
- Weight criteria by importance
- Score objectively where possible
- Document assumptions

### Step 7: Make Clear Recommendation
Provide decisive guidance:
- Clear recommendation (build or buy which vendor)
- Rationale with key factors
- Risks and mitigations
- Triggers to reconsider

## Output Template

```markdown
# Build vs. Buy Analysis: [Capability]

**Date:** [Date]
**Decision Needed By:** [Date]
**Prepared for:** [Stakeholders]

## Context
*What I found in your files:*
- **Team capacity:** [From company.md]
- **Current priorities:** [From company.md/product.md — what competes for resources]
- **Strategic fit:** [From company.md — is this core or context?]

## Executive Summary

**Recommendation:** [Build / Buy (Vendor Name)]
**Rationale:** [2-3 sentence summary]
**Confidence:** High / Medium / Low

## Requirements

### Must-Haves

| # | Requirement | Weight | Notes |
|---|-------------|--------|-------|
| 1 | [Requirement] | Critical | [Context] |
| 2 | [Requirement] | Critical | [Context] |

### Nice-to-Haves

| # | Requirement | Weight | Notes |
|---|-------------|--------|-------|
| 1 | [Requirement] | High | [Context] |
| 2 | [Requirement] | Medium | [Context] |

## Build Option Analysis

### Cost Estimate

| Component | Estimate | Assumptions |
|-----------|----------|-------------|
| Engineering hours | [X] hours | [Assumptions] |
| Engineering cost | $[X] | $[Y]/hr fully loaded |
| Timeline to MVP | [X] months | [Assumptions] |
| Timeline to parity | [X] months | [Assumptions] |
| Annual maintenance | $[X] | [X]% of build cost |
| **3-Year TCO** | **$[X]** | |

### Pros
- [Pro 1]
- [Pro 2]
- [Pro 3]

### Cons
- [Con 1]
- [Con 2]
- [Con 3]

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | H/M/L | H/M/L | [Mitigation] |

## Buy Option Analysis

### Vendor A: [Name]

| Dimension | Assessment |
|-----------|------------|
| Cost (3-year) | $[X] |
| Must-haves met | [X]/[Y] |
| Nice-to-haves met | [X]/[Y] |
| Integration effort | [Low/Medium/High] |
| Vendor stability | [Strong/Moderate/Weak] |

**Pros:** [List]
**Cons:** [List]
**Risks:** [List]

### Vendor B: [Name]

[Same structure]

## Comparison Matrix

| Criteria | Weight | Build | Vendor A | Vendor B |
|----------|--------|-------|----------|----------|
| [Criteria 1] | [X]% | [Score 1-5] | [Score] | [Score] |
| [Criteria 2] | [X]% | [Score 1-5] | [Score] | [Score] |
| [Criteria 3] | [X]% | [Score 1-5] | [Score] | [Score] |
| [Criteria 4] | [X]% | [Score 1-5] | [Score] | [Score] |
| **Weighted Total** | 100% | **[X.X]** | **[X.X]** | **[X.X]** |

## Recommendation

### Primary Recommendation: [Build / Buy Vendor X]

**Key Factors:**
1. [Factor 1 and why it matters]
2. [Factor 2 and why it matters]
3. [Factor 3 and why it matters]

**What We're Giving Up:**
- [Trade-off 1]
- [Trade-off 2]

### Implementation Path

| Phase | Timeline | Key Activities |
|-------|----------|----------------|
| Decision | [Date] | Stakeholder alignment |
| [Phase 2] | [Dates] | [Activities] |
| [Phase 3] | [Dates] | [Activities] |

### Triggers to Reconsider

Revisit this decision if:
- [Trigger 1] (e.g., vendor acquired, pricing changes)
- [Trigger 2] (e.g., requirements change significantly)
- [Trigger 3] (e.g., engineering capacity changes)

## Appendix

### Assumptions Log

| Assumption | Value | Source | Impact if Wrong |
|------------|-------|--------|-----------------|
| [Assumption] | [Value] | [Source] | [Impact] |

### Stakeholder Input

| Stakeholder | Position | Key Concern |
|-------------|----------|-------------|
| [Name/Role] | Build/Buy | [Concern] |
```

## Framework Reference

**Build vs. Buy Decision Framework**

Key dimensions to evaluate:
- **Core vs. Context:** Is this capability core to your competitive advantage?
- **Time to Value:** How fast do you need it?
- **Total Cost of Ownership:** Include maintenance, not just build cost
- **Opportunity Cost:** What else could engineering work on?
- **Vendor Risk:** Dependency on third party

**General Heuristics:**
- Build if: Core differentiator, unique requirements, long-term strategic
- Buy if: Commodity capability, faster time-to-market, proven solutions exist

## Tips for Best Results
1. **Use your context files** — I'll factor in team capacity and strategic priorities
2. **Include maintenance in build cost** — Initial build is often 30% of 3-year cost
3. **Don't underestimate integration** — "Just an API call" is rarely true
4. **Consider opportunity cost** — What else could engineers build?
5. **Document assumptions** — They're often wrong; make them explicit
6. **Set reconsider triggers** — Markets change; decisions should too

## Suggested Updates
After decision:
- [ ] Document decision in `product.md`
- [ ] Update roadmap if building
- [ ] Track vendor relationship if buying
