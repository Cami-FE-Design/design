---
name: bcg-matrix-analyzer
description: 'Analyzes your product portfolio using the BCG Growth-Share Matrix Use when: analyze bcg matrix, bcg matrix, portfolio analysis, product portfolio.'
disable-model-invocation: true
category: strategy
---

# BCG Matrix Analyzer

Analyzes your product portfolio using the BCG Growth-Share Matrix for strategic resource allocation.

## Output
Write the file to exactly this path:

  work/strategy/outputs/bcg-matrix-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Portfolio reviews
- Investment decisions
- Sunset planning
- M&A analysis
- Resource allocation across products

## The Problem

Portfolio decisions get made on gut feel or politics. Which products deserve investment? Which should be sunset? Without a framework, resource allocation becomes a power struggle.

## What You'll Need

**Critical inputs (ask if not provided):**
- List of products/features/business units to analyze
- Revenue and growth data for each

**Nice-to-have inputs:**
- Market share or competitive position data
- Market growth rates by segment
- Historical trends

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Product lines, features, revenue data, metrics
- `context/company.md` — Business units, strategic priorities
- `context/competitors.md` — Market share context, competitive landscape

**Tell the user what you found.** For example:
> "I found your product lines in product.md: Core Project Management, Resource Planning, and Time Tracking. Your company.md shows Resource Planning as a 'growth bet' and Time Tracking as 'mature.' I'll use this to inform the BCG placement."

### Step 2: Gather Portfolio Data
If you don't have enough data, ask:
> "Before I create this BCG analysis, I need:
> 1. Which products/features to analyze? (I found [list] in product.md)
> 2. Revenue or usage data for each
> 3. Growth rates or market context
>
> I can pull competitive context from competitors.md."

**Do NOT place products on the matrix without growth and share data. Get the numbers first.**

## What You'll Get

- BCG matrix with all products placed
- Strategic recommendations per quadrant
- Investment allocation guidance
- Sunset recommendations for Dogs
- Decision framework for Question Marks

## Process (continued)

### Step 3: List Products/Business Units
Identify what to analyze:
- Products
- Product lines
- Features (if analyzing within a product)
- Business units

### Step 4: Assess Market Growth Rate
For each item, determine:
- Is the market growing fast or slow?
- Threshold: Typically 10% = high growth
- Sources: Industry reports, analyst data

### Step 5: Assess Relative Market Share
For each item, determine:
- Are you the leader or follower?
- Relative share = Your share / Largest competitor's share
- Threshold: 1.0 = you're the leader

### Step 6: Place in Quadrant
Map each item based on growth + share:
- **Stars:** High growth, high share
- **Cash Cows:** Low growth, high share
- **Question Marks:** High growth, low share
- **Dogs:** Low growth, low share

### Step 7: Recommend Investment Strategy
Apply standard BCG guidance:
- **Stars:** Invest to maintain/grow position
- **Cash Cows:** Harvest cash, invest minimally
- **Question Marks:** Invest selectively or divest
- **Dogs:** Divest, sunset, or minimize investment

## Output Template

```markdown
# BCG Portfolio Analysis: [Company/Product Line]

**Date:** [Date]
**Units Analyzed:** [Count]
**Prepared for:** [Audience]

## Context
*What I found in your files:*
- **Product portfolio:** [From product.md]
- **Strategic priorities:** [From company.md]
- **Competitive landscape:** [From competitors.md — market context]

## Executive Summary

[2-3 sentence summary of portfolio health and recommended actions]

## BCG Matrix

```
High Growth
        |
   ★ STARS          ❓ QUESTION MARKS
   [List items]      [List items]
        |
--------|-----------------------------
        |
   💰 CASH COWS      🐕 DOGS
   [List items]      [List items]
        |
Low  ---+---------------------------- Low
     High Share                    Share
```

## Detailed Placement

### ★ Stars (High Growth, High Share)

| Product | Growth Rate | Rel. Share | Revenue | Recommendation |
|---------|-------------|------------|---------|----------------|
| [Name] | [X]% | [X.X] | $[X]M | Invest to grow |

**Strategic Implication:** [What having Stars means for portfolio]

### 💰 Cash Cows (Low Growth, High Share)

| Product | Growth Rate | Rel. Share | Revenue | Recommendation |
|---------|-------------|------------|---------|----------------|
| [Name] | [X]% | [X.X] | $[X]M | Harvest cash |

**Strategic Implication:** [What having Cash Cows means for portfolio]

### ❓ Question Marks (High Growth, Low Share)

| Product | Growth Rate | Rel. Share | Revenue | Decision |
|---------|-------------|------------|---------|----------|
| [Name] | [X]% | [X.X] | $[X]M | Invest / Divest? |

**Decision Criteria for Each:**
- [Product 1]: [Why invest or divest]
- [Product 2]: [Why invest or divest]

### 🐕 Dogs (Low Growth, Low Share)

| Product | Growth Rate | Rel. Share | Revenue | Recommendation |
|---------|-------------|------------|---------|----------------|
| [Name] | [X]% | [X.X] | $[X]M | Sunset / Divest |

**Sunset Considerations:** [Timing, dependencies, customer migration]

## Investment Allocation

### Current Allocation vs. Recommended

| Quadrant | Current % | Recommended % | Delta |
|----------|-----------|---------------|-------|
| Stars | [X]% | [X]% | [+/-X]% |
| Cash Cows | [X]% | [X]% | [+/-X]% |
| Question Marks | [X]% | [X]% | [+/-X]% |
| Dogs | [X]% | [X]% | [+/-X]% |

### Reallocation Recommendations
1. [Shift from X to Y because...]
2. [Increase investment in Z because...]

## Portfolio Health Assessment

| Metric | Status | Notes |
|--------|--------|-------|
| Cash generation | ✅/⚠️/❌ | [Cows sufficient to fund Stars?] |
| Future growth | ✅/⚠️/❌ | [Stars pipeline healthy?] |
| Resource drain | ✅/⚠️/❌ | [Dogs consuming disproportionate resources?] |
| Strategic bets | ✅/⚠️/❌ | [Question Marks have clear decisions?] |

## Risks and Considerations

### BCG Limitations
- Assumes market share = competitive strength (not always true)
- Ignores synergies between products
- Static snapshot (markets change)

### Specific Risks
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]

## Action Plan

| Priority | Action | Owner | Timeline |
|----------|--------|-------|----------|
| 1 | [Action] | [Name] | [Date] |
| 2 | [Action] | [Name] | [Date] |
| 3 | [Action] | [Name] | [Date] |
```

## Framework Reference

**BCG Growth-Share Matrix (Boston Consulting Group, 1970)**

The matrix classifies products based on two dimensions:
- **Market Growth Rate:** Proxy for market attractiveness and cash needs
- **Relative Market Share:** Proxy for competitive strength and cash generation

| Quadrant | Growth | Share | Strategy |
|----------|--------|-------|----------|
| **Stars** | High | High | Invest heavily; future Cash Cows |
| **Cash Cows** | Low | High | Harvest; fund Stars and Question Marks |
| **Question Marks** | High | Low | Selective investment or divest |
| **Dogs** | Low | Low | Divest, sunset, or manage for cash |

**Key Insight:** Cash flows from Cows to fund Stars; Question Marks need decisive action; Dogs drain resources.

## Tips for Best Results
1. **Use your context files** — I'll ground the analysis in your actual product portfolio and strategy
2. **Use relative share, not absolute** — 20% share in a fragmented market differs from 20% against a dominant leader
3. **Define thresholds clearly** — "High growth" depends on industry; tech vs. utilities differ
4. **Don't ignore Dogs completely** — Some provide defensive value or synergies
5. **Question Marks need decisions** — The worst outcome is perpetual underinvestment
6. **Update regularly** — Markets shift; annual review minimum

## Suggested Updates
After analysis:
- [ ] Update `product.md` with investment recommendations
- [ ] Update `company.md` with strategic priorities based on analysis
- [ ] Schedule annual BCG review
