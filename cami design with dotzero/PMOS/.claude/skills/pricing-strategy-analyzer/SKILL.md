---
name: pricing-strategy-analyzer
description: 'Analyze pricing strategy with competitive positioning, packaging, and revenue modeling. Use when: analyze pricing strategy, pricing strategy, analyze pricing, pricing analysis, evaluate pricing.'
disable-model-invocation: true
category: strategy
---

# Pricing Strategy Analyzer

Analyze pricing strategy with competitive positioning, packaging, and revenue modeling.

## Output
Write the file to exactly this path:

  work/strategy/outputs/pricing-analysis-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Current pricing isn't working (losing deals or leaving money on table)
- Launching new pricing tiers
- Considering pricing changes
- Annual pricing review
- Transitioning to usage-based or outcome-based pricing
- AI product pricing strategy (seat-based vs. usage-based vs. outcome-based)

## The Problem

Pricing decisions are often made on gut feel or by copying competitors. Without structured analysis, you either leave money on the table (priced too low) or lose deals you should win (priced too high).

## What You'll Need
- Current pricing structure
- Competitive pricing data
- Customer/deal win/loss data (if available)
- Target customer segments

## What You'll Get

- Competitive pricing comparison
- Pricing position assessment
- Value metric evaluation and recommendation
- Pricing model analysis (subscription, usage-based, outcome-based, hybrid)
- Packaging recommendations (tier structure, feature gating)
- AI pricing considerations (if applicable)
- Price sensitivity and willingness to pay assessment
- Revenue impact modeling with scenarios
- Migration strategy (if changing prices)

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — What's your current pricing? What tiers exist?
- `context/competitors.md` — What do competitors charge?
- `context/company.md` — What's your business model? ARR? Strategic priorities?
- `context/personas.md` — What do different segments value? What's their budget?

**Tell the user what you found.** For example:
> "I found your pricing in product.md: Pro at $29/seat, Business at $59/seat. Your competitors.md shows Monday.com at $9-19/seat and Teamwork at $10-18/seat — you're positioned premium. I'll analyze whether this positioning is sustainable."

### Step 2: Document Current Pricing
If not in product.md, ask:
> "I need your current pricing structure:
> 1. What tiers do you have?
> 2. What's the pricing model? (per seat, usage, flat fee)
> 3. What's the average deal size?
>
> Or point me to pricing docs I can reference."

Map your current structure:
- Tiers and features per tier
- Pricing model (per seat, per usage, flat fee)
- Discounting patterns
- Average deal size by segment

### Step 3: Analyze Competitive Pricing
Pull from competitors.md or ask for competitive intel:
- Direct competitor pricing
- Feature-price mapping
- Positioning (premium vs. value)
- Packaging differences

### Step 4: Evaluate Pricing Model and Value Metric

**Assess current pricing model:**
| Model | When It Works | When It Doesn't |
|-------|---------------|-----------------|
| **Seat-based** | Value scales with users | AI reduces seats needed |
| **Usage-based** | Value and cost scale with usage | Unpredictable customer costs |
| **Outcome-based** | Clear, measurable outcomes | Subjective outcomes, attribution issues |
| **Hybrid** | Need predictability + scalability | Complexity confuses customers |

**Evaluate your value metric:**
- Does it align with customer value? (Patrick Campbell: value metrics beat feature-based)
- Does it scale with customer success?
- Is it predictable for customers? (65% of IT leaders report surprise AI charges)
- Is it easy to measure?
- For AI products: Does it reflect AI's value delivery, not just infrastructure?

**Red flags:**
- Seat-based pricing for AI agents that replace human work
- Pure usage-based pricing with high cost volatility
- Outcome-based pricing where success is subjective

### Step 5: Assess Willingness to Pay
Look for signals in your context or ask:
- Win/loss by price point (from competitors.md win themes)
- Discount frequency and depth
- Upgrade/downgrade patterns
- Customer feedback on pricing

**If data is thin:**
> "To assess willingness to pay, it helps to have:
> - Win/loss data with pricing notes
> - Discount frequency (how often do you discount?)
> - Customer feedback on pricing
>
> I can work with assumptions, but I'll flag them."

**Grounding rule:** Before recommending pricing changes, extract specific data points: actual competitor prices, real win/loss quotes about pricing, and concrete deal data. Every number in the analysis must cite its source. If a data point would be invented, write "⚠️ Estimate — validate with [specific data source]" instead.

### Step 6: Analyze Packaging Strategy

**Current packaging assessment:**
- How many tiers? (Good-Better-Best is standard)
- Feature gating logic — what's in each tier and why?
- Upgrade triggers — what drives customers to higher tiers?
- Packaging for expansion — does packaging encourage growth?

**Packaging red flags:**
- Too many tiers (analysis paralysis)
- Too few tiers (leaving money on table)
- Unclear differentiation between tiers
- Key features buried in highest tier (blocks adoption)
- No clear upgrade path

**Packaging opportunities:**
- Move high-value features to lower tiers (drive adoption)
- Add premium tier for high-usage customers
- Simplify tier names and descriptions
- Align packaging with customer segments from personas.md

### Step 7: Model Revenue Impact
Scenario analysis with retention consideration:
- Current trajectory (baseline)
- Price increase scenarios (+10%, +20%, impact on churn)
- Packaging changes (new tier, feature moves)
- New tier introduction
- Model switch (e.g., seat-based → usage-based)
- Hybrid model adoption (base + usage)

### Step 8: Plan Migration
If recommending changes (follow Marcos Rivera's "Street Pricing" approach):
- Grandfather existing customers?
- Timeline for rollout (phased vs. big bang)
- Prototype with beta customers first (validate before full rollout)
- Communication plan (transparency reduces churn)
- Sales enablement (how will team sell new pricing?)
- Risk mitigation

## Output Template

```markdown
# Pricing Strategy Analysis: [Product Name]

**Date:** [Date]
**Current ARR:** [From company.md or ask]
**Analysis Focus:** [What triggered this analysis]

## Context
*What I found in your files:*
- **Current pricing:** [From product.md]
- **Competitor pricing:** [From competitors.md]
- **Business model:** [From company.md]
- **Target segments:** [From personas.md]

## Executive Summary

[2-3 sentence summary of findings and recommendation]

## Current Pricing Structure

| Tier | Price | Key Features | Target Customer |
|------|-------|--------------|-----------------|
| [Tier 1] | $[X]/mo | [Features] | [Persona from personas.md] |
| [Tier 2] | $[X]/mo | [Features] | [Persona] |

**Value Metric:** [What you charge for — seats, usage, etc.]
**Average Deal Size:** $[X]/year — Source: [company.md or provided]
**Discounting:** [Patterns observed]

## Competitive Pricing Comparison

| Competitor | Comparable Tier | Price | Diff vs. Us | Source |
|------------|-----------------|-------|-------------|--------|
| [Comp A] | [Tier name] | $[X]/mo | [+/-X%] | [competitors.md] |
| [Comp B] | [Tier name] | $[X]/mo | [+/-X%] | [competitors.md] |

**Your Positioning:** [Premium / Market / Value relative to competitors]
**Strategic fit:** [Does positioning match company.md strategy?]

### Feature-Price Analysis

| Feature | Us | Comp A | Comp B |
|---------|-----|--------|--------|
| [Feature 1] | ✅ $X tier | ✅ $Y tier | ❌ |
| [Feature 2] | ✅ $X tier | ✅ Free | ✅ $Y tier |

## Pricing Model Assessment

**Current Model:** [Seat-based / Usage-based / Outcome-based / Hybrid]
**Current Value Metric:** [e.g., per seat, per API call, per resolution]

| Model Type | Fit for Your Product | Rationale |
|------------|---------------------|-----------|
| Seat-based | ✅/⚠️/❌ | [Does value scale with seats?] |
| Usage-based | ✅/⚠️/❌ | [Do value and cost both scale with usage?] |
| Outcome-based | ✅/⚠️/❌ | [Clear, measurable outcome available?] |
| Hybrid (base + usage) | ✅/⚠️/❌ | [Best of both worlds?] |

### Value Metric Evaluation

| Criteria | Rating | Notes |
|----------|--------|-------|
| Aligns with customer value | ✅/⚠️/❌ | [Patrick Campbell: value metrics beat feature-based] |
| Scales with customer success | ✅/⚠️/❌ | [Kyle Poyar: usage-based drives 170%+ NDR when done right] |
| Predictable for customer | ✅/⚠️/❌ | [65% of IT leaders report surprise charges with AI pricing] |
| Easy to measure | ✅/⚠️/❌ | [Single source of truth for both you and customer?] |

**AI Product Consideration:**
- [ ] If AI product: Does metric reflect AI value, not just seats replaced?
- [ ] Does pricing align your success with customer success?

**Verdict:** [Keep current metric / Transition to [new metric]]

## Willingness to Pay Signals

| Signal | Data | Implication | Source |
|--------|------|-------------|--------|
| Win rate by price point | [Data] | [Insight] | [competitors.md / provided] |
| Price-related losses | [Data] | [Insight] | [competitors.md] |
| Discount frequency | [X]% of deals | [Insight] | [Provided or assumed] |

## Packaging Analysis

### Current Packaging Structure

| Tier | Features | Target Segment | Upgrade Trigger |
|------|----------|----------------|-----------------|
| [Tier 1] | [Key features] | [From personas.md] | [What drives upgrade?] |
| [Tier 2] | [Key features] | [Segment] | [Trigger] |

**Packaging assessment:**
- Number of tiers: [X] — ✅ Good-Better-Best / ⚠️ Too many / ❌ Too few
- Feature gating logic: [Clear / Unclear]
- Upgrade path: [Natural / Forced / Blocked]
- Expansion revenue potential: [High / Medium / Low]

### Packaging Issues Identified
1. [Issue 1] — Impact: [Revenue / Conversion / Adoption]
2. [Issue 2] — Impact: [...]

### Recommended Packaging Changes
1. **[Change 1]**
   - Rationale: [Cite framework — Good-Better-Best, Elena Verna PLG principles, etc.]
   - Expected impact: [Quantify if possible]
   - Risk: [What could go wrong]

2. **[Change 2]**
   - Rationale: [...]
   - Expected impact: [...]
   - Risk: [...]

## Revenue Impact Scenarios

### Scenario 1: Status Quo
- Year 1: $[X]M ARR
- Assumptions: [Key assumptions]

### Scenario 2: [Proposed Change]
- Year 1: $[X]M ARR (+[X]%)
- Key changes: [What's different]
- Risks: [What could go wrong]

## Recommendation

**Recommended Action:** [Clear recommendation]

**Rationale:**
1. [Reason 1 — cite context]
2. [Reason 2]
3. [Reason 3]

**Expected Impact:** [Quantified if possible]

## Migration Plan (if applicable)

| Phase | Timeline | Actions |
|-------|----------|---------|
| Preparation | [Dates] | [Actions] |
| Communication | [Dates] | [Actions] |
| Rollout | [Dates] | [Actions] |

**Existing Customer Treatment:** [Grandfather / Transition / Immediate]

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | H/M/L | H/M/L | [Action] |

## Assumptions to Validate
- ⚠️ [Assumption needing verification]

## Suggested Updates to Context Files
- [ ] Update pricing in `product.md`
- [ ] Add pricing insights to `competitors.md`
```

## Framework Reference

**Pricing Strategy Frameworks Used:**

### Core Pricing Principles
- **Value-based pricing** (Patrick Campbell/ProfitWell): Price based on customer value delivered, not cost. 7.5x more powerful than acquisition as a growth lever.
- **Value metric selection** (Patrick Campbell): Choose pricing unit that correlates with customer value. Value metrics reduce churn 75%, increase expansion 30%+.
- **Van Westendorp Price Sensitivity Meter**: Survey technique for willingness to pay analysis.

### Pricing Models (2026 Best Practices)
- **Usage-based pricing** (Kyle Poyar/OpenView): Aligns revenue with customer usage. Companies with usage-based pricing achieve higher NDR (Snowflake: 170% at IPO). 39% of SaaS companies now use this model.
- **Outcome-based pricing** (Intercom Fin, Zendesk): Charge for results achieved (e.g., $0.99 per support ticket resolved). Works when outcomes are clear, measurable, and agreed upon.
- **Hybrid pricing models** (2026 industry standard): Combine base subscription with usage tiers. Balances predictability for customers with scalability for growth. Share of companies using hybrid jumped from 27% to 41% in one year.

### Packaging Strategy
- **Good-Better-Best**: Three-tier packaging strategy for maximum conversion and expansion.
- **Feature gating**: Strategic placement of features across tiers to drive upgrades.
- **Packaging for expansion** (Marcos Rivera/Pricing I/O): Tier structures that reflect customer value and encourage upgrade paths.

### AI Pricing Considerations
- **Seat-based model breakdown**: AI breaks the correlation between seats and value (AI agent = 5 junior employees, charging per seat punishes efficiency).
- **Cost transparency**: 65% of IT leaders report surprise charges with AI/usage pricing. Provide usage meters, alerts, spend caps.
- **Outcome-based AI** (Gartner): 40% of enterprise SaaS will include outcome-based elements by 2026, up from 15% two years prior.

### Pricing Change Methodology
- **Street Pricing** (Marcos Rivera): Discover (value drivers) → Design (test models with prototypes) → Defend (execute with confidence, train teams).
- **PLG Monetization** (Elena Verna): Activation-driven retention, product-led conversion, growth loops for sustainable engines.

## Tips for Best Results
1. **Keep context files updated** — Competitor pricing and win/loss data make this analysis sharper
2. **Use real data** — Gut feel on pricing is usually wrong. Patrick Campbell: pricing is 7.5x more powerful than acquisition, but only when data-driven.
3. **Don't just copy competitors** — Your value prop is different. Focus on YOUR value metric.
4. **Prototype before full rollout** — Test pricing changes with beta customers (Marcos Rivera: Discover → Design → Defend)
5. **Plan the migration** — Existing customer treatment can make or break a change. Transparency reduces churn.
6. **For AI products:** Consider if seat-based pricing still makes sense. AI breaks the seats-to-value correlation.
7. **Think retention, not just acquisition** — Elena Verna: value-based pricing that aligns with customer outcomes drives retention.
8. **One pricing initiative per quarter** — Patrick Campbell: Focus on one change (localization, packaging, value metric) to boost ARPU systematically.
