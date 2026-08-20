---
name: competitive-profile-builder
description: 'Build a strategic competitor profile analyzing what they do well, their moats, and where you can win. Use when: analyze competitor, competitive profile, competitor analysis, dhm analysis, competitive intel.'
category: competitive
---

# Competitive Profile Builder

Build a strategic competitor profile analyzing what they do well (Delight), their competitive moats (Hard-to-Copy), their business sustainability (Margin), and where you can win against them.

## Output
Write the file to exactly this path:

  work/strategy/outputs/competitive-profile-[company]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Deep-dive on a competitor that keeps coming up in deals
- Preparing for competitive positioning discussions
- Onboarding sales team on key competitors

## What You'll Get

I'll generate a comprehensive competitive profile with:
- **DHM Analysis** — What delights their customers, their competitive moats, and business sustainability
- **SWOT comparison** — Their strengths/weaknesses vs. opportunities/threats for you
- **Head-to-head positioning** — Where you win, where they win, and why
- **Sales battlecard** — Quick-reference talking points for competitive conversations
- **Strategic recommendations** — How to compete, what to watch, where to focus

## What You'll Need
- Competitor name
- Any known info (website, product, pricing, positioning) — I'll ask if I need more
- Your product context (for comparison)

## Process

### Step 1: Review Your Existing Intel

I'll start by checking your context files to see what you already know:
- **competitors.md** — Do you have existing info on this competitor?
- **product.md** — What's your positioning for comparison?
- **company.md** — What's your strategic focus?

I'll also look for research files like win/loss interviews, sales notes, or support tickets that mention competitors.

I'll share what I find. For example:
> "I found Monday.com in your competitors.md — you've noted they're a primary competitor with $600M+ ARR. Win themes: 'agency-specific fit' and 'AI features.' Loss themes: 'brand recognition' and 'price.' I'll build on this existing intel."

Or if it's new:
> "I don't have Monday.com in your competitors.md yet. I'll create a profile and you can add it to your context files when we're done."

### Step 2: Ask Only What's Missing

Based on what's in your context files, I'll identify gaps:

**If you have existing intel, I'll ask:**
> "Your competitors.md has good baseline info on Monday.com. What triggered this analysis? Are you:
> - Preparing for a specific deal?
> - Updating sales materials?
> - Doing a strategic review?
>
> This helps me focus on what's most useful."

**If context is thin, I'll suggest:**
> "To build a strong competitive profile, it helps to have real data. Do you have any of these?
> - Win/loss interview notes
> - Sales call recordings or notes
> - G2/Capterra review excerpts
> - Pricing pages or feature comparisons
>
> You can drop files in your context/ folder or paste them here."

### Step 3: Gather Basic Intelligence

I'll collect foundational information (pulling from your context where available):
- Company overview (size, stage, funding)
- Product description
- Target audience
- Pricing model
- Recent news or announcements

I'll build on what's already in your files rather than duplicating. For example:
> "Your competitors.md notes Monday.com pricing at $9-19/seat. Their website now shows $10-24/seat — looks like they raised prices. I'll update the profile."

### Step 4: Analyze with DHM Framework

I'll evaluate their competitive position using Gibson Biddle's DHM model:

#### Delight — What customers love about them
- Key differentiators
- Unique value propositions
- What users say in reviews
- Why customers choose them

#### Hard-to-Copy — Their competitive moats
- Network effects
- Brand strength
- Technology/patents
- Data advantages
- Switching costs
- Economies of scale

#### Margin — Business sustainability
- Business model
- Pricing power
- Unit economics (if known)
- Funding/runway
- Path to profitability

### Step 5: Map Strengths and Weaknesses

I'll create a SWOT analysis comparing them to you:

**Their Strengths and Weaknesses** (what they do well vs. poorly)

**Opportunities and Threats for You** (where you can attack vs. where they're dangerous)

### Step 6: Compare Head-to-Head

I'll pull your positioning from product.md and company.md to show:

- **Key dimensions** — How you differ on important factors
- **Win/loss scenarios** — When you win deals vs. when they do (citing your win/loss data if available)
- **Sales battlecard** — Quick talking points for competitive conversations

## Output Template

```markdown
# Competitive Profile: [Competitor Name]

**Updated:** [Date]
**Website:** [URL]

## Context
*What I found in your files:*
- **Existing intel:** [From competitors.md, or "New competitor — not in your files yet"]
- **Our positioning:** [From product.md/company.md]
- **Win/loss data:** [From research files, or "None available — consider gathering"]

## Overview
- **One-Line:** [What they do]
- **Stage:** [Startup/Growth/Enterprise]
- **Funding:** [Amount/Stage — cite source]
- **Target:** [Who they serve]

## DHM Analysis

### Delight
*What customers love about them*
- [Point 1]
- [Point 2]

**Source:** [G2 reviews, customer interviews, etc. — or "⚠️ Inferred, needs validation"]

### Hard-to-Copy
*Their competitive moats*
- [Moat 1]
- [Moat 2]

**Assessment:** [How durable are these moats?]

### Margin
*Business model sustainability*
- **Revenue model:** [Description]
- **Pricing:** [Tiers — note if updated from your files]
- **Sustainability:** [Assessment]

## SWOT

**Their Strengths and Weaknesses:**

| Strengths (what they do well) | Weaknesses (where they fall short) |
|-------------------------------|-------------------------------------|
| [S1] | [W1] |
| [S2] | [W2] |

**Your Opportunities and Threats:**

| Opportunities (where you can win) | Threats (where they're dangerous) |
|-----------------------------------|-----------------------------------|
| [O1] | [T1] |
| [O2] | [T2] |

## vs. Us

| Dimension | [Competitor] | [Our Product] | Advantage |
|-----------|--------------|---------------|-----------|
| [Dimension] | [Their approach] | [Our approach] | Them/Us/Tie |

**We win when:** [Scenario — cite win/loss data if available]
**They win when:** [Scenario — cite win/loss data if available]

## Battlecard Summary
*Quick reference for sales conversations*

> **Positioning:** "[One-sentence positioning against this competitor]"
>
> **Key differentiators:**
> 1. [Differentiator 1]
> 2. [Differentiator 2]
>
> **Handle their strengths:**
> - If they say "[strength]" → Respond with "[counter]"

## Recommendations
1. **How to compete:** [Strategic recommendation]
2. **What to watch:** [Trends or threats to monitor]
3. **Opportunities:** [Where we can win]

## Sources & Confidence
- **Data sources:** [List: internal win/loss, G2 reviews, website, etc.]
- **Last verified:** [Date]
- **Confidence level:** [High/Medium/Low — based on data quality]

**Data gaps to fill:**
- [ ] [Missing data — e.g., "Need recent win/loss interviews"]
- [ ] [Missing data]

---
⚠️ **Note:** Verify key claims (funding, pricing, features) before using in sales situations. Competitive intel gets stale quickly.

**Next step:** Add this profile to your `context/competitors.md` to keep it current.
```

## Framework Reference

This skill uses **Gibson Biddle's DHM Model** (Delight, Hard-to-Copy, Margin):

The DHM framework helps evaluate product strategy by asking:
1. Does this **delight** customers in hard-to-copy, margin-enhancing ways?
2. Is the source of delight **hard-to-copy**?
3. Does it improve **margins** (directly or indirectly)?

Great competitive moats score high on all three dimensions.

## Tips for Best Results

1. **Keep competitors.md updated** — I'll build on what you already have instead of starting from scratch
2. **Share win/loss data** — Real customer feedback makes this 10x more valuable than guessing
3. **Focus on "why" not just "what"** — Feature lists aren't strategic insights
4. **Be honest about their strengths** — I won't sugarcoat; underestimating competitors is how you lose
5. **Update regularly** — Competitors change fast; I'll note what needs refreshing

## Related Workflows

Building a full competitive picture? `/competitive-intel-pack` generates landscape map, multiple profiles, feature matrix, and pricing comparison. *(available in the full PM OS)*
