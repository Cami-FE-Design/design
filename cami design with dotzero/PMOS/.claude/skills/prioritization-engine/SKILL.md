---
name: prioritization-engine
description: 'Defend your roadmap with scoring frameworks that show stakeholders exactly why features ranked the way they did. Use when: prioritize features, rice scoring, ice scoring, feature prioritization, rank features, what should we build.'
category: strategy
---

# Prioritization Engine

Defend your roadmap with scoring frameworks that show stakeholders exactly why features ranked the way they did.

## Output
Write the file to exactly this path:

  work/strategy/outputs/prioritization-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
Use this skill when you need to:
- Rank 3+ competing features or initiatives for a roadmap
- Defend prioritization decisions to stakeholders with scoring
- Get alignment on "what's next" with transparent reasoning
- Justify why something ISN'T being built (data-driven no's)

## What You'll Get
- RICE scores and rankings table for all items
- Detailed breakdown with reasoning and sources for each score
- Value/Effort 2×2 matrix (visual quadrant)
- Sensitivity analysis (what would change the ranking)
- Explicit recommendations (Do Now, Do Next, Quick Wins, Defer, Deprioritize)
- Flagged assumptions that need validation

## What You'll Need

**Required:**
- List of opportunities, features, or initiatives to prioritize (3+ items)

**Helpful (improves scoring accuracy):**
- Customer request counts or votes → More accurate Reach scores
- Lost deal data (which features were cited) → Validates Impact scores
- Revenue impact estimates → Helps justify strategic overrides
- Rough effort estimates from engineering → More confident Effort scores

Drop these files in your `context/` folder or paste them in the chat when prompted. If you don't have estimates, I'll help you develop them.

## Process

### Step 1: Gathering Context
I'll automatically read your context files to pull in relevant data:
- `context/goals.md` — Current quarter's goals, revenue targets, key dates, biggest risks
- `context/product.md` — Current roadmap, metrics, known priorities
- `context/company.md` — Strategic priorities, business drivers
- `context/personas.md` — Which users care about which features
- `context/competitors.md` — Competitive pressure, table stakes

**Goals are the scoring anchor.** Before scoring anything, I'll identify the active goals and revenue targets from `goals.md`. Features that directly advance a current goal get an Impact boost. Features that don't connect to any active goal get flagged — they may still be worth doing, but you should know when you're spending effort off-strategy.

I'll also check for research files (feedback data, feature requests, interview notes, win/loss data, support tickets).

Then I'll tell you what I found so you can validate it. For example:
> "Your Q1 goals focus on closing 2 services deals ($30K) and launching the Maven course ($32K). I'll weight features that advance these goals higher in Impact scoring, and flag items that don't map to any active goal."

### Step 2: Validate the List
If the list has fewer than 3 items, ask for more — prioritization needs comparison.

**If items are just names without context:**
> "I see 'Workload Balancer' on your list. Based on your product.md, this is an AI feature for flagging overloaded team members. Is that right, or is there more context?"

**If context is thin, prompt for uploads:**
> "To score these accurately, it helps to have data on reach and impact. Do you have any of these?
> - Customer feedback or request counts
> - Lost deal notes (features that came up)
> - Usage analytics
> - Effort estimates from engineering
>
> You can drop files in your `context/` folder or paste them here."

### Step 3: Choosing a Framework
I'll score features using one of three proven frameworks:

- **RICE (Intercom):** Reach × Impact × Confidence / Effort
  Best for rigorous comparison with transparent math. Most comprehensive.

- **ICE (Sean Ellis):** Impact × Confidence × Ease
  Simpler scoring for quick decisions. Ease = inverted effort.

- **Value/Effort Matrix:** 2×2 quadrant (High/Low Value × High/Low Effort)
  Visual, great for stakeholder workshops.

I'll default to RICE unless you prefer another framework.

> **Why This Beats a Spreadsheet:** Pure RICE scoring misses strategic factors (revenue-blocking features, competitive table stakes, technical debt). I'll note when these apply and recommend overrides — so your roadmap reflects both data AND judgment.

### Step 4: Scoring Each Dimension
I'll score each feature across RICE dimensions, pulling from your context files and any data you provide:

- **Reach:** How many users affected per quarter? (I'll use metrics from product.md if available)
- **Impact:** How much will it move the needle? (0.25× minimal → 3× massive, based on persona pain points AND alignment to active goals from goals.md)
- **Confidence:** How sure are we? (20% speculation → 100% validated data)
- **Effort:** Person-weeks to complete (I'll flag when eng estimates are needed)

I'll show my reasoning for each score so you can validate or adjust. For example:
> "Reach: 340 customers (from your company.md — all paying agencies would benefit)"
> "Impact: 2× — Jordan persona says resource conflicts are a top pain point"
> "Confidence: 60% — mentioned in feedback but limited validation"
> "Effort: 4 weeks — [PLACEHOLDER — need eng estimate]"

### Step 5: Calculate & Rank
RICE Score = (Reach × Impact × Confidence) / Effort

**Important adjustments (note explicitly when applied):**
- **Goal alignment:** Items that directly advance an active goal from `goals.md` get priority weight. Items that don't connect to any current goal are flagged with ⚠️ "Off-strategy" — not automatically deprioritized, but the PM should consciously decide
- Revenue-blocking items may warrant priority override
- Competitive table stakes may score low on RICE but high on strategic necessity
- Quick wins (low effort, medium impact) are often worth doing even if not top-ranked
- **Key date proximity:** If a goal has a deadline (e.g., "Maven launch Feb 23"), features enabling that goal get urgency weight

### Step 6: Sensitivity Check
For top items, identify what would change the ranking.

## Output Template

```markdown
# Prioritization: [Context]

**Framework:** RICE
**Date:** [Date]

## Context
*What I pulled from your files:*
- **Active goals:** [From goals.md — revenue targets, key initiatives, deadlines]
- **Initiatives considered:** [From product.md or user-provided]
- **Strategic priorities:** [From company.md]
- **User evidence:** [From personas, feedback, research]
- **Competitive factors:** [From competitors.md]

## Rankings

| Rank | Item | RICE Score | R | I | C | E |
|------|------|------------|---|---|---|---|
| 1 | [Item A] | 450 | 1000 | 2 | 80% | 4 |
| 2 | [Item B] | 320 | 500 | 3 | 60% | 3 |

## Detailed Breakdown

### #1: [Item A] (Score: N)
- **Reach:** [N] users/quarter — [Source: product.md, feedback data, or estimate]
- **Impact:** [X]× — [Why this level — cite persona pain or evidence]
- **Confidence:** [X]% — [What drives confidence up/down]
- **Effort:** [N] weeks — [Source: eng estimate or PLACEHOLDER]
- **RICE Score:** [Calculation shown]
- **Goal alignment:** [Which goal(s) this advances, or ⚠️ Off-strategy]

> [Strategic factors not captured in pure RICE — cite context files]

### #2: [Item B]
[Same structure]

## Value/Effort Matrix

```
High Value │ Quick Wins    │ Big Bets
           │ [Items]       │ [Items]
-----------│---------------│-----------
Low Value  │ Fill-Ins      │ Avoid
           │ [Items]       │ [Items]
           └───────────────┴───────────
             Low Effort      High Effort
```

## Sensitivity Analysis

| If this changes... | Then ranking shifts... |
|-------------------|------------------------|
| [Assumption change] | [New ranking] |

## Recommendations
1. **Do Now:** [Top priority with rationale]
2. **Do Next:** [Second priority]
3. **Quick Win:** [Low-effort items worth doing]
4. **Defer:** [Items needing more discovery]
5. **Deprioritize:** [Items to explicitly say no to]

## Assumptions to Validate
*Things I estimated that you should confirm:*
- ⚠️ [Assumption 1 — e.g., "Effort estimates need eng input"]
- ⚠️ [Assumption 2]

## Data Gaps
*What would improve this prioritization:*
- [ ] [Missing data — e.g., "Actual usage metrics for reach"]
- [ ] [Missing data]
```

## Framework Reference

**RICE** (Intercom): Most comprehensive, accounts for confidence and effort
**ICE** (Sean Ellis): Simpler, Impact × Confidence × Ease (inverted effort)
**Value/Effort Matrix:** Visual quadrant, good for stakeholder workshops

## When RICE Isn't Enough

RICE is a starting point, not gospel. Adjust for:
- **Revenue blocking:** If a feature is blocking closed deals, it may warrant priority override
- **Competitive table stakes:** Features competitors have that you must match
- **Strategic bets:** Long-term positioning that won't score well on near-term RICE
- **Technical debt:** Doesn't have "reach" but enables future velocity

Always note when you're overriding pure RICE scoring and why.

## Tips for Best Results

1. **Provide effort estimates upfront if you have them** — I'll flag when I need eng input, but real estimates make scores instantly useful
2. **Don't skip the sensitivity analysis** — Stakeholders will ask "what if effort doubles?" — the answer is already there
3. **Use the Value/Effort matrix for workshops** — Easier for non-PMs to grasp than RICE scores
4. **Override RICE when strategic factors apply** — I'll note when revenue-blocking or competitive pressure justifies breaking pure scoring
5. **Export the detailed breakdown** — Stakeholders trust scoring when they see the math and sources
