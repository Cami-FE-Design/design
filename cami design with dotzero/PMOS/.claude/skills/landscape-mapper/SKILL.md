---
name: landscape-mapper
description: 'Map multiple competitors into a unified landscape with positioning matrices and feature comparisons. Use when: competitive landscape, market map, competitor matrix, landscape analysis.'
disable-model-invocation: true
category: competitive
---

# Competitive Landscape Mapper

Map multiple competitors into a unified landscape with positioning matrices and feature comparisons.

## Output
Write the file to exactly this path:

  work/strategy/outputs/landscape-map-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Annual strategic planning
- Investor or board presentations on market position
- Identifying acquisition targets or partnership opportunities

## What You'll Need
- List of competitors (or let the skill suggest based on your market)
- Your product positioning for comparison
- Key dimensions you compete on

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/competitors.md` — What competitors do you already track?
- `context/product.md` — What's your product positioning?
- `context/company.md` — What market do you play in? What's your strategy?

**Tell the user what you found.** For example:
> "I found 3 competitors in your competitors.md (Monday.com, Teamwork, Float) with win/loss themes. I'll build the landscape around these plus any others you want to add. Your strategic priority is 'Win the Agency Vertical' — I'll assess positioning relative to that goal."

### Step 2: Identify Competitors
If competitors.md exists, start there. Otherwise ask:
> "I need to know who to map. Which competitors should I include?
> - Direct competitors (same solution, same customer)
> - Indirect competitors (different solution, same problem)
> - Potential entrants (could enter your market)
>
> Or I can suggest competitors based on your market if you tell me more about it."

### Step 3: Define Positioning Axes
Choose two dimensions that matter most. Suggest based on context:
> "Based on your company.md, you compete on 'agency-specific features' and 'AI capabilities.' Should I use those as positioning axes? Or would you prefer:
> - Price vs. Features
> - Ease of Use vs. Power
> - SMB vs. Enterprise
> - Horizontal vs. Vertical"

### Step 4: Build Comparison Matrix
Compare all players on key dimensions — pull from competitors.md when available:
- Features
- Pricing
- Target market
- Go-to-market approach

### Step 5: Identify Patterns
- **Strategic Groups:** Who clusters together?
- **Market Gaps:** Where is whitespace?
- **Crowded Zones:** Where is competition fierce?

### Step 6: Recommend Positioning
Based on analysis, where should you play?

## Output Template

```markdown
# Competitive Landscape: [Market]

**Date:** [Date]
**Competitors Analyzed:** [N]

## Context
*What I found in your files:*
- **Tracked competitors:** [From competitors.md]
- **Your positioning:** [From product.md/company.md]
- **Strategic priorities:** [From company.md]
- **Win/loss themes:** [From competitors.md]

## 2x2 Positioning Map

```
High [Axis 2]
    |
    |    [Competitor A]
    |
    |         [Us]    [Competitor B]
    |
    |    [Competitor C]
    |
Low +---------------------------- High [Axis 1]
```

**Axis 1:** [What it represents — e.g., "Agency-specific features"]
**Axis 2:** [What it represents — e.g., "AI capabilities"]

**Why these axes:** [How they relate to your strategic priorities]

## Strategic Groups

### Group 1: [Name]
- **Players:** [A, B, C]
- **Characteristics:** [What defines this group]
- **Our overlap:** [How we compete with them]
- **Win theme vs. this group:** [From competitors.md or inferred]

### Group 2: [Name]
[Same structure]

## Feature Comparison

| Feature | Us | Comp A | Comp B | Comp C | Source |
|---------|-----|--------|--------|--------|--------|
| [Feature 1] | ✅ | ✅ | ❌ | ✅ | [competitors.md / research] |
| [Feature 2] | ✅ | ❌ | ✅ | ❌ | [Source] |
| [Pricing] | $X | $Y | $Z | $W | [Source] |

## Market Gaps

### Gap 1: [Description]
- **Opportunity:** [What's missing in the market]
- **Why exists:** [Why no one plays here yet]
- **Our ability to fill:** High/Medium/Low
- **Strategic fit:** [Does this align with your priorities?]

### Gap 2: [Description]
[Same structure]

## Positioning Recommendations

1. **Current Position:** [Where we are on the map]
2. **Recommended Move:** [Where we should go]
3. **Key Differentiators to Emphasize:** [Based on win themes]
4. **Avoid:** [Where not to compete and why]

**Supports strategy:** [How this connects to company.md priorities]

## Watch List
- [Competitor to monitor] — Why: [Reason]
- [Market shift to track] — Why: [Reason]

## Assumptions to Validate
*Things I inferred that need verification:*
- ⚠️ [Assumption — e.g., "Competitor pricing based on public website, may have enterprise deals"]

## Suggested Updates to Context Files
- [ ] Add new competitors to `competitors.md`
- [ ] Update competitive positioning in `product.md`
```

## Framework Reference

**Strategic group mapping** and **positioning analysis**:
- 2x2 matrices reveal market structure
- Gaps indicate opportunity
- Clusters indicate competitive intensity

## Tips for Best Results
1. **Keep competitors.md updated** — I'll build on your existing competitive intel
2. **Include indirect competitors** — They often become direct
3. **Update quarterly** — Markets shift fast
4. **Validate with customers** — They see competitors you don't
