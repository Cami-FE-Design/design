---
name: win-loss-analysis
description: 'Analyze win/loss patterns to understand why you''re winning and losing deals and what changes would improve win rates. Use when: win/loss analysis, why we win, why we lose.'
disable-model-invocation: true
category: competitive
---

# Win/Loss Analyzer

Analyze win/loss patterns to understand why you're winning and losing deals, and what product/positioning changes would improve win rates.

## Output
Write the file to exactly this path:

  work/strategy/outputs/win-loss-analysis-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Quarterly business reviews
- Competitive strategy planning
- Prioritizing product roadmap based on deal impact
- Training sales on positioning

## What You'll Need

**Critical inputs (ask if not provided):**
- Deal data (won and lost deals with outcomes)
- For each deal: deal size, competitor (if any), stated reason

**Nice-to-have inputs:**
- Customer quotes from lost deals
- Segment data (company size, industry)
- Lost deal follow-up interviews

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/competitors.md` — Known competitors, competitive positioning
- `context/product.md` — Current feature gaps, pricing, known objections
- `context/personas.md` — Buyer types, what they care about

**Tell the user what you found.** For example:
> "I found Monday.com and Teamwork as your main competitors in competitors.md. Your product.md mentions 'Advanced Reporting' as a known gap. I'll specifically look for whether reporting came up in lost deals."

### Step 2: Get Deal Data
**CRITICAL:** If the user hasn't provided deal data, ask:

> "I need deal data to analyze. Please share:
> 1. Won and lost deals (paste notes, or point me to the file)
> 2. For each deal: outcome (won/lost), deal size, competitor (if any), stated reason
>
> Customer quotes are especially valuable for surfacing real reasons vs. polite objections."

Do NOT generate placeholder analysis if deal data is missing.

### Step 3: Categorize Deals
Parse each deal and extract:
- **Outcome:** Won or Lost
- **Deal size:** ACV or revenue value
- **Competitor:** Who we competed against (or greenfield)
- **Stated reason:** What the prospect/sales said
- **True reason:** Inferred from quotes and context

### Step 4: Identify Win Themes
Group winning deals by reason:
- What features/capabilities won us the deal?
- What positioning resonated?
- What buyer type loves us?

### Step 5: Identify Loss Themes
Group lost deals by reason:
- Was it product (missing feature), pricing, trust, or something else?
- What competitor took the deal?
- Was this deal winnable with changes?

### Step 6: Segment Analysis
Break down patterns by:
- Company size (SMB vs. Enterprise)
- Competitor (vs. Monday, vs. Teamwork, etc.)
- Deal size (small vs. large ACV)
- Buyer role (IT vs. business vs. end-user)

### Step 7: Calculate Impact
Quantify:
- Lost ARR by reason
- Win rate by competitor
- Pattern in deal size (do we win small, lose big?)

## Output Template

```markdown
# Win/Loss Analysis: [Period]

**Deals Analyzed:** [Won: N] | [Lost: N]
**Win Rate:** [X%]
**Total ARR in Analysis:** Won: $[X] | Lost: $[Y]

## Context
*What I found in your files:*
- **Known competitors:** [From competitors.md]
- **Known product gaps:** [From product.md]
- **Target buyer:** [From personas.md]

---

## Executive Summary
[2-3 sentences: What's the pattern? What should we do about it?]

---

## Why We Win

### Win Reason #1: [Reason] — [N] deals, $[X] ARR
**What happened:**
[Brief description of the pattern]

**Representative quotes:**
> "[Quote from won deal]" — [Customer context]
> "[Quote from won deal]" — [Customer context]

**Buyer profile:** [Who loves this about us]

### Win Reason #2: [Reason] — [N] deals, $[X] ARR
[Same structure]

### Win Reason #3: [Reason] — [N] deals, $[X] ARR
[Same structure]

---

## Why We Lose

### Loss Reason #1: [Reason] — [N] deals, $[X] lost ARR
**What happened:**
[Brief description of the pattern]

**Representative quotes:**
> "[Quote from lost deal]" — [Customer context]
> "[Quote from lost deal]" — [Customer context]

**Was this winnable?** [Yes/No — what would have changed the outcome]

### Loss Reason #2: [Reason] — [N] deals, $[X] lost ARR
[Same structure]

### Loss Reason #3: [Reason] — [N] deals, $[X] lost ARR
[Same structure]

---

## Competitive Breakdown

| Competitor | Deals | Win Rate | Lost ARR | Primary Loss Reason |
|------------|-------|----------|----------|---------------------|
| [Competitor 1] | [N] | [X%] | $[Y] | [Reason] |
| [Competitor 2] | [N] | [X%] | $[Y] | [Reason] |
| [Greenfield] | [N] | [X%] | $[Y] | [Reason] |

### vs. [Competitor 1]
**How we win:** [What works against them]
**How we lose:** [Where they beat us]
**Recommendation:** [Positioning or product change]

### vs. [Competitor 2]
[Same structure]

---

## Segment Analysis

### By Company Size
| Size | Deals | Win Rate | Notes |
|------|-------|----------|-------|
| SMB (<50) | [N] | [X%] | [Pattern] |
| Mid-market (50-500) | [N] | [X%] | [Pattern] |
| Enterprise (500+) | [N] | [X%] | [Pattern] |

### By Deal Size
| ACV Range | Deals | Win Rate | Notes |
|-----------|-------|----------|-------|
| <$10K | [N] | [X%] | [Pattern] |
| $10K-$30K | [N] | [X%] | [Pattern] |
| $30K+ | [N] | [X%] | [Pattern] |

---

## Revenue Impact

**Total Lost ARR by Reason:**
| Loss Reason | Lost ARR | % of Total Lost | Winnable? |
|-------------|----------|-----------------|-----------|
| [Reason 1] | $[X] | [Y%] | [Yes/No] |
| [Reason 2] | $[X] | [Y%] | [Yes/No] |
| [Reason 3] | $[X] | [Y%] | [Yes/No] |

**If we fixed [Reason 1], estimated ARR recovery:** $[X] ([N] deals × [average ACV])

---

## Recommendations

### For Product
1. **Build [Feature]** — Would have saved $[X] ARR in [N] deals
2. **Improve [Area]** — [Rationale from loss patterns]

### For Sales/Positioning
1. **Lead with [Value prop]** — This resonates with [buyer type]
2. **Handle [Objection] by** — [Recommended response based on wins]

### For Pricing/Packaging
1. **[Recommendation]** — [Rationale from patterns]

---

## Data Quality Notes
- [Any caveats: small sample, missing context, etc.]
```

## Framework Reference

**Win/Loss Analysis Best Practices:**
- Stated reasons often differ from true reasons — quotes reveal the truth
- Segment by competitor to find positioning opportunities
- "Price" is often a proxy for "didn't see the value" — dig deeper
- Revenue impact prioritizes where to focus

## Tips for Best Results

1. **Use your context files** — I'll check losses against known product gaps and competitors
2. **Include lost deal quotes** — Polite rejections hide real objections
3. **Note the competitor** — Patterns differ by who you lost to
4. **Capture deal size** — Losing 5 small deals ≠ losing 1 big deal
5. **Separate winnable from unwinnable** — Some deals were never yours
6. **Interview churned customers** — Post-decision honesty is higher

## Suggested Updates
After analysis:
- [ ] Update `competitors.md` with competitive insights
- [ ] Add lost deal features to backlog in `product.md`
- [ ] Update sales enablement based on win themes
