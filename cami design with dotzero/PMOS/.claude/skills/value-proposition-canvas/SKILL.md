---
name: value-proposition-canvas
description: 'Creates a Value Proposition Canvas mapping customer needs to product value Use when: value proposition canvas, value prop canvas, customer jobs, jobs pains gains, value map.'
disable-model-invocation: true
category: strategy
---

# Value Proposition Canvas

Creates a Value Proposition Canvas mapping customer needs to product value using Strategyzer's framework.

## Output
Write the file to exactly this path:

  work/strategy/outputs/value-prop-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- New product development
- Product-market fit diagnosis
- Feature prioritization
- Customer research synthesis
- Pivot evaluation

## The Problem

Teams build features without understanding customer jobs. Products end up solving problems nobody has, or missing the pains that actually matter.

## What You'll Need

**Critical inputs (ask if not provided):**
- Target customer segment
- Customer research data (interviews, feedback, surveys)

**Nice-to-have inputs:**
- Existing value prop to validate/update
- Competitor positioning
- Recent customer feedback

## What You'll Get

- Complete Value Proposition Canvas
- Customer Profile (jobs, pains, gains)
- Value Map (products, pain relievers, gain creators)
- Fit analysis (strong fit, gaps)
- Strategic implications

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/personas.md` — Existing persona definitions, jobs, pains, gains
- `context/product.md` — Current features, value prop, positioning
- `context/competitors.md` — How competitors position their value

**Tell the user what you found.** For example:
> "I found your Jordan persona in personas.md — a PM at a 50-person agency. Their job is 'allocate team resources without spreadsheet chaos' and key pain is 'no visibility into who's overloaded.' I'll build the canvas around Jordan and validate if your current features address these jobs and pains."

### Step 2: Gather Canvas Context
If you don't have enough context, ask:
> "Before I build this Value Proposition Canvas, I need:
> 1. Which customer segment are we mapping? (I found [personas] in personas.md)
> 2. Do you have customer research to ground this in?
>
> I can pull existing value prop from product.md and competitor positioning from competitors.md."

### Step 3: Map Customer Jobs
Identify what customers are trying to accomplish:
- **Functional jobs:** Tasks they want to complete
- **Social jobs:** How they want to be perceived
- **Emotional jobs:** How they want to feel

### Step 4: Identify Customer Pains
What makes jobs difficult or prevents completion:
- Obstacles and risks
- Undesired outcomes
- Frustrations with current solutions
Rank by severity (extreme, moderate, minor).

### Step 5: Identify Customer Gains
What outcomes customers desire:
- Required gains (expected outcomes)
- Expected gains (standard outcomes)
- Desired gains (beyond expectations)
- Unexpected gains (delightful surprises)
Rank by desirability.

### Step 6: Map Your Products/Services
List what you offer:
- Products
- Services
- Features
- Support

### Step 7: Show Pain Relievers
How your products address pains:
- Which pains does each product relieve?
- How significantly?

### Step 8: Show Gain Creators
How your products create gains:
- Which gains does each product create?
- How significantly?

### Step 9: Analyze Fit and Gaps
Evaluate alignment:
- Strong fit: Pain relievers match severe pains
- Gaps: Pains not addressed, gains not created
- Over-delivery: Features with no matching job

## Output Template

```markdown
# Value Proposition Canvas: [Product/Segment]

**Date:** [Date]
**Segment:** [Customer segment analyzed]
**Prepared for:** [Audience]

## Context
*What I found in your files:*
- **Persona:** [From personas.md — who we're mapping]
- **Known jobs/pains:** [From personas.md — existing research]
- **Current value prop:** [From product.md — how we position today]
- **Competitor positioning:** [From competitors.md — how they position]

## Executive Summary

[2-3 sentence summary of fit assessment and key gaps]

## Customer Profile

### Customer Jobs

| Job Type | Job | Priority | Evidence |
|----------|-----|----------|----------|
| Functional | [Job description] | High/Med/Low | [Source] |
| Functional | [Job description] | High/Med/Low | [Source] |
| Social | [Job description] | High/Med/Low | [Source] |
| Emotional | [Job description] | High/Med/Low | [Source] |

### Customer Pains

| Pain | Severity | Frequency | Evidence |
|------|----------|-----------|----------|
| [Pain description] | Extreme/Moderate/Minor | Daily/Weekly/Monthly | [Source] |
| [Pain description] | Extreme/Moderate/Minor | Daily/Weekly/Monthly | [Source] |

### Customer Gains

| Gain | Type | Desirability | Evidence |
|------|------|--------------|----------|
| [Gain description] | Required/Expected/Desired/Unexpected | High/Med/Low | [Source] |
| [Gain description] | Required/Expected/Desired/Unexpected | High/Med/Low | [Source] |

## Value Map

### Products & Services

| Product/Feature | Description | Target Job |
|-----------------|-------------|------------|
| [Product 1] | [Description] | [Which job it addresses] |
| [Product 2] | [Description] | [Which job it addresses] |

### Pain Relievers

| Pain Reliever | Pain Addressed | Relief Level |
|---------------|----------------|--------------|
| [Feature/capability] | [Pain from above] | Full/Partial/Minimal |
| [Feature/capability] | [Pain from above] | Full/Partial/Minimal |

### Gain Creators

| Gain Creator | Gain Enabled | Creation Level |
|--------------|--------------|----------------|
| [Feature/capability] | [Gain from above] | Full/Partial/Minimal |
| [Feature/capability] | [Gain from above] | Full/Partial/Minimal |

## Fit Analysis

### Strong Fit (Pains Relieved + Gains Created)

| Customer Need | Our Solution | Fit Strength |
|---------------|--------------|--------------|
| [Pain/Gain] | [Product/Feature] | Strong |
| [Pain/Gain] | [Product/Feature] | Strong |

### Gaps (Unaddressed Pains/Gains)

| Customer Need | Gap Type | Priority to Address |
|---------------|----------|---------------------|
| [Pain not relieved] | Pain gap | High/Med/Low |
| [Gain not created] | Gain gap | High/Med/Low |

### Over-Delivery (Features Without Clear Need)

| Product/Feature | Issue |
|-----------------|-------|
| [Feature] | No matching pain or gain |

## Fit Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Jobs addressed | [X]/[Y] | [Context] |
| Pains relieved (severe) | [X]/[Y] | [Context] |
| Pains relieved (moderate) | [X]/[Y] | [Context] |
| Gains created (high desire) | [X]/[Y] | [Context] |
| **Overall Fit** | **Strong/Moderate/Weak** | |

## Strategic Implications

### What's Working
- [Strength 1 and evidence]
- [Strength 2 and evidence]

### What Needs Improvement
- [Gap 1 and recommended action]
- [Gap 2 and recommended action]

### Feature Prioritization Implications

| Priority | Feature/Investment | Rationale |
|----------|-------------------|-----------|
| 1 | [Feature] | Addresses severe pain [X] |
| 2 | [Feature] | Creates high-desire gain [Y] |
| 3 | [Feature] | [Rationale] |

### What to Stop/Reduce

| Feature | Rationale |
|---------|-----------|
| [Feature] | No clear pain/gain match; low usage |

## Next Steps

1. [Action 1] — Owner: [Name]
2. [Action 2] — Owner: [Name]
3. [Action 3] — Owner: [Name]

## Research Sources

| Source | Type | Key Insights |
|--------|------|--------------|
| [Source 1] | Interviews/Survey/Feedback | [Summary] |
| [Source 2] | Interviews/Survey/Feedback | [Summary] |
```

## Framework Reference

**Strategyzer Value Proposition Canvas**

The canvas has two sides:
1. **Customer Profile:** Understanding what customers need
   - Jobs: What they're trying to do
   - Pains: What makes it hard
   - Gains: What they want to achieve

2. **Value Map:** How you create value
   - Products/Services: What you offer
   - Pain Relievers: How you reduce pains
   - Gain Creators: How you enable gains

**Fit = Pain Relievers match Pains + Gain Creators match Gains**

**Types of Fit:**
- **Problem-Solution Fit:** Evidence that your solution addresses real pains/gains
- **Product-Market Fit:** Evidence that customers will pay and stay

## Tips for Best Results
1. **Use your context files** — I'll pull existing persona research and product positioning
2. **Use real research data** — Don't assume jobs/pains/gains; validate with customers
3. **Prioritize ruthlessly** — Not all pains are equal; focus on severe ones
4. **One segment at a time** — Different segments have different canvases
5. **Evidence everything** — Link each element to research source
6. **Update regularly** — Customer needs evolve; canvas should too

## Suggested Updates
After building the canvas:
- [ ] Update `personas.md` with new jobs, pains, and gains discovered
- [ ] Update `product.md` with value proposition refinements
- [ ] Document gaps as potential roadmap items
