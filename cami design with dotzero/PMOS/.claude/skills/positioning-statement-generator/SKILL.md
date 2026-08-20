---
name: positioning-statement-generator
description: 'Creates positioning using April Dunford''s Obviously Awesome framework Use when: generate positioning statement, create positioning statement, positioning statement, create positioning, obviously awesome.'
disable-model-invocation: true
category: strategy
---

# Positioning Statement Generator

Creates positioning using April Dunford's Obviously Awesome framework.

## Output
Write the file to exactly this path:

  work/strategy/outputs/positioning-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- New product launch
- Pivot or rebrand
- Sales enablement
- Homepage rewrite

## The Problem

Most positioning is vague ("we're the leading solution for...") or copied from competitors. Without clear positioning, marketing struggles, sales pitches vary, and the product feels generic.

## What You'll Need
- Understanding of your product/service
- Knowledge of your target customers
- Competitive landscape awareness

## What You'll Get

- Complete positioning statement
- Tagline options (3 variations)
- Elevator pitch (30 seconds)
- Competitive frame
- Supporting messaging elements

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — What does your product do? What's the current positioning?
- `context/personas.md` — Who are your target customers? What do they care about?
- `context/competitors.md` — What are the competitive alternatives?
- `context/company.md` — What's your strategic focus?

**Tell the user what you found.** For example:
> "I found your product positioning in product.md ('AI-powered project management for agencies') and 3 competitors with win/loss themes. I also have 2 personas (Jordan the PM, Alex the Owner). I'll use this as the foundation for positioning."

### Step 2: Identify Competitive Alternatives
What would customers do if your product didn't exist? Pull from competitors.md if available:
- Direct competitors
- Indirect alternatives (spreadsheets, manual processes)
- Status quo (doing nothing)

**If competitors.md is thin:**
> "I don't have enough information about your competitive alternatives to create strong positioning. Positioning built on assumptions about competitors falls apart in the first sales call. Can you share win/loss data, competitive intel, or customer feedback on alternatives?"

### Step 3: Define Unique Attributes
What do you have that alternatives lack? Pull from product.md:
- Features
- Capabilities
- Approach
- Focus

### Step 4: Map Attributes to Customer Value
Why do those attributes matter to customers? Connect to personas.md:
- Time saved
- Money saved
- Risk reduced
- Outcome improved

### Step 5: Identify Best-Fit Customers
Who cares most about this value? Reference personas.md:
- Characteristics
- Context
- Triggers that make them care

### Step 6: Determine Market Category
What category helps customers understand your value quickly?
- Existing category (new player)
- Subcategory (specialized version)
- New category (category creator)

### Step 7: Synthesize Positioning Statement

**Grounding rule:** Each positioning element must trace back to a specific source. Before synthesizing, verify you have evidence for each canvas row. If an element has no source, mark it "⚠️ Assumed — validate with [customer interviews / competitive research]."

Combine all elements into a clear statement.

## Output Template

```markdown
# Positioning: [Product Name]

**Date:** [Date]
**Framework:** April Dunford's Obviously Awesome

## Context
*What I found in your files:*
- **Current positioning:** [From product.md]
- **Target personas:** [From personas.md]
- **Key competitors:** [From competitors.md]
- **Win themes:** [From competitors.md]

## Positioning Canvas

| Element | Your Positioning | Source |
|---------|------------------|--------|
| **Competitive Alternatives** | [What customers do today] | [competitors.md / provided] |
| **Unique Attributes** | [What you have that they lack] | [product.md / provided] |
| **Value for Customer** | [Why attributes matter] | [personas.md / provided] |
| **Best-Fit Customers** | [Who cares most] | [personas.md / provided] |
| **Market Category** | [How to frame offering] | [Recommended] |

⚠️ Any row where Source says "Recommended" or "Assumed" needs validation before using in external materials.

## Positioning Statement

**For** [best-fit customers from personas.md]
**who** [have this need/problem]
**[Product Name] is a** [market category]
**that** [key benefit/value].
**Unlike** [competitive alternatives from competitors.md],
**we** [unique differentiator].

## Tagline Options

1. **Benefit-Led:** [Tagline focusing on outcome]
2. **Category-Led:** [Tagline positioning in market]
3. **Differentiator-Led:** [Tagline emphasizing uniqueness]

**Recommendation:** [Which tagline and why, based on strategic priorities]

## Elevator Pitch (30 Seconds)

[2-3 sentence pitch that could be delivered in 30 seconds]

## Competitive Frame

When compared to [alternative from competitors.md], we win because:
- [Differentiator 1] — Supports: [Win theme]
- [Differentiator 2]
- [Differentiator 3]

## Messaging by Persona

| Persona | Lead Message | Supporting Proof | Source |
|---------|--------------|------------------|--------|
| [Persona from personas.md] | [Primary message] | [Evidence/benefit] | [Research] |
| [Persona 2] | [Primary message] | [Evidence/benefit] | [Research] |

## Usage Guide

| Context | Use This |
|---------|----------|
| Homepage headline | Tagline Option [X] |
| Sales deck intro | Elevator Pitch |
| Competitive deals | Competitive Frame |
| Investor pitch | Positioning Statement |

## Assumptions to Validate
*Things inferred that need customer validation:*
- ⚠️ [Assumption]

## Suggested Updates to Context Files
- [ ] Update positioning in `product.md`
- [ ] Add tagline options to marketing materials
```

## Framework Reference

**April Dunford's Obviously Awesome (2019)**
- Positioning is not messaging — it's the strategic context that makes messaging clear
- Start with competitive alternatives, not features
- Best-fit customers validate positioning; don't try to be everything to everyone
- Market category is a shortcut to understanding

## Tips for Best Results
1. **Keep your context files updated** — I'll build positioning on your personas, product, and competitors
2. **Be specific about alternatives** — Generic competitors = generic positioning
3. **Test with best-fit customers** — If they don't get it, iterate
4. **One positioning, multiple messages** — Positioning is stable; messaging adapts
