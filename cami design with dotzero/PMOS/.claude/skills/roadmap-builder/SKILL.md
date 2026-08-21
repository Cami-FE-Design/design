---
name: roadmap-builder
description: 'Generate a structured roadmap in 15 minutes that links every initiative to business objectives and measurable outcomes. Use when: build roadmap, roadmap, create roadmap, quarterly roadmap, product roadmap.'
category: planning
---

# Roadmap Builder

Generate a structured roadmap in 15 minutes that links every initiative to business objectives and measurable outcomes.

## Output
Write the file to exactly this path:

  work/strategy/outputs/roadmap-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Quarterly or annual planning cycles
- Executive or board alignment meetings
- New PM onboarding to existing roadmap
- Strategic reprioritization after major changes

## The Problem

Building roadmaps from scratch takes days of spreadsheet wrangling, stakeholder alignment, and trying to connect random feature requests to business goals. Most PMs end up with feature lists that executives question: "Why are we building this again?"

This skill generates a structured roadmap in 15 minutes that explicitly links every initiative to business objectives and measurable product outcomes — giving you the "why" built in.

## What You'll Get

A complete roadmap with:
- Business goals linked to every initiative (so executives see the "why")
- Now/Next/Later buckets showing what's happening when
- Product outcomes you'll measure (not just features you'll ship)
- Dependencies and risks flagged upfront
- Parking lot for ideas you're explicitly deferring

## What You'll Need

**Required:**
- Planning horizon (quarter, half, year)
- Key initiatives to consider

**Helpful (from context files or provided):**
- Strategic priorities and goals
- Team capacity and constraints
- Known dependencies or blockers
- Business drivers (revenue, deals, competitive pressure)

## Process

### Step 1: Check for a Strategic Review
First, I'll look for output from the strategic roadmap review skill. If you've done a strategic review, it contains:
- Business objectives with metrics and targets
- Leading product outcomes aligned to objectives
- Strategic initiatives with rationale
- A "not doing" list (deferred and declined items)
- Business and product health assessments that inform prioritization
- Customer & discovery learnings

**If a strategic review exists:** I'll use it as the primary input. The business objectives, product outcomes, and initiatives become the starting point — I won't re-ask questions the review already answered. I'll focus on organizing them into Now/Next/Later with dependencies, owners, and timelines. The health assessments and customer learnings will inform how I prioritize.

**If no strategic review exists:** I'll proceed with the standard flow below.

> **Tip:** Running the strategic roadmap review first produces a much stronger roadmap because the strategic thinking is already done. This skill then handles the tactical planning.

### Step 2: I'll Read Your Context
I'll check your context files for:
- **product.md** — Your current roadmap, metrics, known issues
- **company.md** — Strategic priorities and business goals
- **personas.md** — User pain points that should drive prioritization
- **competitors.md** — Competitive pressure or table stakes features

I'll tell you what I found so you know what I'm working with. For example:
> "I pulled your strategic priorities from company.md: 'Win the Agency Vertical' and 'Expand AI Capabilities.' Your Q2 roadmap includes Resource Planning v2, Adobe integration, and SSO. I'll map these to business objectives and product outcomes."

*You don't need to do anything here — I'll read the files automatically.*

### Step 3: I'll Ask Only What's Missing
Based on what I find in your context files (or strategic review), I'll ask for:
- **Planning horizon** — Q2, H1, full year?
- **New initiatives** — Anything to add beyond what's already captured?
- **Strategic context** — If I don't have enough to prioritize, I'll ask you to share OKRs, exec priorities, or team capacity info

If I have enough from your files, I'll say:
> "Based on your product and company docs, I have what I need to draft a Q2 roadmap. I'll flag any assumptions about capacity or timing."

*Tip: The more context you keep in your files, the less I'll need to ask.*

### Step 4: Map Business Objectives → Product Outcomes
Before organizing initiatives, I'll establish the chain that connects business goals to product work:

1. **Business Objectives:** What the company needs to achieve (from company.md priorities)
2. **Product Outcomes:** The measurable product changes that will drive those objectives

Product outcomes are "leading" because they happen BEFORE the business outcome — they're the product lever you pull to move the business metric.

For example:
> Business Objective: "Increase NRR to 120%"
> → Product Outcome: "Reduce time-to-value for new agencies from 14 days to 3 days"
> → Product Outcome: "Increase feature adoption in first 30 days from 40% to 70%"

Improving these product metrics (time-to-value, adoption) *leads* to the business outcome (NRR).

### Step 5: Organize Initiatives into Now/Next/Later
Map each initiative to its product outcome:
- **Now:** Highest priority, starting immediately, clear ownership
- **Next:** Starts after Now completes, dependencies identified
- **Later:** Important but deferred, with clear rationale

Use what you know from context files to justify placement. For example:
> "Resource Planning v2 is 'Now' because it directly supports the outcome 'Reduce PM admin time by 50%' which drives NRR. Jordan (PM persona) cited resource conflicts as a top pain point."

### Step 6: Identify Constraints and Drivers
Look for or ask about:
- Team capacity (engineering, product, design)
- Hard deadlines (deals blocked, regulatory, events)
- CEO/exec priorities
- Competitive pressure

**Don't invent constraints.** If capacity isn't in your files, ask:
> "What's your team capacity for Q2? Or should I flag this as TBD?"

### Step 7: Add Dependencies and Risks
For each major initiative, identify:
- What must happen first
- What could go wrong
- Who owns mitigation

### Step 8: Define Success Metrics
For the planning period, specify:
- What metric will move
- From what baseline to what target
- How you'll measure it

**Important:** Pull actual metrics from `product.md` when available. If you don't have baselines, mark as `[PLACEHOLDER — need baseline]` rather than making up numbers.

## Output Template

**I'll generate all of this for you.** You just provide the inputs — I'll fill in the structure, map initiatives to outcomes, and flag assumptions.

Here's what you'll get:

```markdown
# [Company] [Period] Product Roadmap

## Context
*What I pulled from your files:*
- **Strategic priorities:** [From company.md]
- **Current roadmap:** [What's already planned from product.md]
- **Key user pain points:** [From personas.md]
- **Competitive factors:** [From competitors.md]

## Planning Context
**Planning Period:** [Quarter/Half/Year]
**Team Capacity:** [From company.md or ask — mark TBD if unknown]

---

## Business Objectives
*What the company needs to achieve this period*

| Objective | Source | Key Metric |
|-----------|--------|------------|
| [What the company needs to achieve] | [Where this came from — e.g., company.md, CEO priority, board deck] | [How we'll measure success] |

*The "Source" column shows where each objective came from so stakeholders can trace priorities back to strategic docs.*

---

## Leading Product Outcomes
*The product changes that will drive business objectives*

| Outcome | Drives Objective | Current | Target |
|---------|------------------|---------|--------|
| [Outcome 1] | [Objective it supports] | [Baseline or PLACEHOLDER] | [Target] |
| [Outcome 2] | [Objective] | [Baseline] | [Target] |

---

## Now
*Starting immediately — highest priority*

| Initiative | Drives Outcome | Owner | Dependencies |
|------------|----------------|-------|--------------|
| [Initiative] | [Which outcome] | [Team/Person] | [Deps] |

**Why Now:** [Rationale — reference context if applicable]

## Next
*Starts after Now completes*

| Initiative | Drives Outcome | Owner | Dependencies |
|------------|----------------|-------|--------------|
| [Initiative] | [Which outcome] | [Team/Person] | [Deps] |

**Why Next:** [Rationale — what needs to happen first]

## Later
*Important but deferred*

| Initiative | Drives Outcome | Reason for Deferral |
|------------|----------------|---------------------|
| [Initiative] | [Which outcome] | [Why it can wait] |

---

## Dependencies & Risks
| Risk | Impact | Mitigation | Owner |
|------|--------|-----------|-------|
| [Risk] | H/M/L | [How to address] | [Who] |

## Not This Period
*Items considered but not prioritized — from strategic review "not doing" list or surfaced during planning:*

| Item | Why Not Now | Revisit When |
|------|------------|--------------|
| [Item] | [Rationale] | [Trigger or timeframe] |

## Assumptions to Validate
*Things I inferred that you should confirm:*
- ⚠️ [Assumption 1]
- ⚠️ [Assumption 2]
```

## How This Works

This skill uses two proven roadmapping approaches:

**1. Objective → Outcome → Initiative Chain**
Every initiative on your roadmap connects to a measurable product outcome (like "reduce churn by 10%"), which connects to a business goal (like "increase revenue"). This gives you the "why" behind every feature.

**2. Now/Next/Later (Janna Bastow, ProdPad)**
Instead of fixed dates, you organize work by priority and time horizons. This makes roadmaps easier to maintain when plans change.

## Tips for Best Results

1. **Add strategic context to your files** — If you have OKRs, exec priorities, or quarterly goals, put them in `company.md`. The more I know, the better I can prioritize.
2. **Share your current roadmap** — If you have an existing roadmap (even a messy one), I can refine it instead of starting from scratch.
3. **Review the assumptions section** — I'll flag anything I'm guessing about so you can confirm or correct.
4. **Iterate on outcomes** — If the product outcomes I suggest don't feel right, tweak them. The initiatives flow from the outcomes.
