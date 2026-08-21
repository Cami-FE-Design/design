---
name: market-sizing
description: 'Calculate TAM/SAM/SOM using both top-down and bottom-up approaches with clear assumption tracking. Use when: market size, tam sam som, market opportunity, addressable market.'
disable-model-invocation: true
category: competitive
---

# Market Sizing Calculator

Calculate TAM/SAM/SOM using both top-down and bottom-up approaches with clear assumption tracking.

## Output
Write the file to exactly this path:

  work/strategy/outputs/market-sizing-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- New product business cases
- Expansion into new markets or segments
- Investor/board presentations

## What You'll Need
- Clear definition of your market boundaries
- Industry data or reports (for top-down)
- Unit economics inputs (for bottom-up)

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/company.md` — What market do you play in? What's your ARR? Who do you serve?
- `context/product.md` — What's your average deal size? Pricing?
- `context/personas.md` — Who are your target customers? What segments?
- `context/competitors.md` — Market size signals from competitor data?

**Tell the user what you found.** For example:
> "I found relevant context for market sizing:
> - You serve creative/marketing agencies (company.md)
> - Pricing is $29-59/seat with avg 12 seats/customer (product.md)
> - Target is agencies 10-50 people (personas.md)
>
> I'll use this to build bottom-up estimates. Do you have industry reports for top-down validation?"

### Step 2: Define Market Boundaries
If not clear from context, ask:
> "I need to define the market boundaries:
> 1. Geography: Where do you sell? (US only? Global?)
> 2. Customer Segment: Who do you serve? (I see 'agencies 10-50 people' — is that right?)
> 3. Use Case: What problem do you solve?
>
> Being specific here makes the market size credible."

### Step 3: Top-Down Analysis
Start with total market and narrow down:
- Industry reports (Gartner, Forrester, etc.)
- Government data
- Public company filings

**If user doesn't have reports:**
> "For top-down analysis, industry reports help. Do you have access to any market research? If not, I can:
> - Use public data and competitor filings
> - Flag estimates as lower confidence
> - Focus more heavily on bottom-up approach"

### Step 4: Bottom-Up Analysis
Build up from unit economics — pull from context files:
- Number of potential customers
- Average deal size (from product.md)
- Purchase frequency

### Step 5: Triangulate
Compare approaches:
- If they align: High confidence
- If they differ: Investigate why

### Step 6: Document Assumptions
Every number should have a source or explicit assumption marked.

## Output Template

```markdown
# Market Sizing: [Market Name]

**Date:** [Date]
**Confidence:** High/Medium/Low

## Context
*What I found in your files:*
- **Target market:** [From company.md]
- **Pricing/deal size:** [From product.md]
- **Target segments:** [From personas.md]
- **Competitor signals:** [From competitors.md]

## Definitions

- **TAM (Total Addressable Market):** [Definition for your case]
- **SAM (Serviceable Addressable Market):** [Definition]
- **SOM (Serviceable Obtainable Market):** [Definition]

## Summary

| Metric | Value | Confidence | Method |
|--------|-------|------------|--------|
| TAM | $[X]B | Medium | Top-down + Bottom-up |
| SAM | $[X]M | Medium | Filtered |
| SOM (Year 1) | $[X]M | Low | Capture rate |
| SOM (Year 3) | $[X]M | Low | Growth model |

## Top-Down Analysis

### TAM Calculation
- [Industry] market size: $[X]B — Source: [Report/Filing]
- Relevant segment: [X]% = $[X]B
- **TAM: $[X]B**

### SAM Calculation
- TAM: $[X]B
- Geography filter: [X]% — Rationale: [Why]
- Segment filter: [X]% — Rationale: [Why]
- **SAM: $[X]M**

## Bottom-Up Analysis

### TAM Calculation
- Total potential customers: [N] — Source: [Census/Industry data]
- Average annual spend: $[X] — Source: [product.md pricing × avg seats]
- **TAM: $[X]B**

### SAM Calculation
- Addressable customers: [N] — Filter: [What makes them addressable]
- Average deal size: $[X] — Source: [product.md]
- **SAM: $[X]M**

### SOM Calculation
- Current ARR: $[X]M — Source: [company.md]
- Current customers: [N]
- Market capture rate: [X]%
- Year 1 realistic capture: [N] new customers × $[X] = $[X]M
- **Year 1 SOM: $[X]M**

## Triangulation

| Approach | TAM | SAM | SOM |
|----------|-----|-----|-----|
| Top-Down | $[X]B | $[X]M | — |
| Bottom-Up | $[X]B | $[X]M | $[X]M |
| Delta | [X]% | [X]% | — |

**Reconciliation:** [Explain any differences and which estimate is more reliable]

## Assumptions Log

| Assumption | Value | Source | Confidence |
|------------|-------|--------|------------|
| [Assumption 1] | [Value] | [product.md / report / estimate] | High/Med/Low |
| [Assumption 2] | [Value] | [Source] | High/Med/Low |

## Sensitivity Analysis

| If [Assumption] changes... | TAM Impact | SAM Impact |
|---------------------------|------------|------------|
| [Assumption] +20% | +$[X]M | +$[X]M |
| [Assumption] -20% | -$[X]M | -$[X]M |

## Key Risks to Estimate
1. [Risk 1 — what could make this wrong]
2. [Risk 2]

## Suggested Updates to Context Files
- [ ] Add market size to `company.md` for future reference
- [ ] Note assumptions for future validation
```

## Framework Reference

**TAM-SAM-SOM** with dual methodology:
- Top-down: Market reports → narrow to segment
- Bottom-up: Unit economics → multiply out
- Triangulation increases confidence

## Tips for Best Results
1. **Keep context files updated** — Pricing and customer data make bottom-up more accurate
2. **Be conservative** — Optimistic estimates lose credibility
3. **Show your work** — Transparent assumptions > black box
4. **Multiple approaches** — If they diverge, you're missing something

## Related Workflows

Preparing for a board deck? `/market-sizing-analyzer` triangulates 5 methodologies into one defensible estimate. *(available in the full PM OS)*
