---
name: swot-analysis-generator
description: 'Creates a structured SWOT analysis with strategic implications Use when: generate swot analysis, create swot analysis, swot analysis, swot, strategic analysis.'
disable-model-invocation: true
category: strategy
---

# SWOT Analysis Generator

Creates a structured SWOT analysis with strategic implications using the TOWS matrix.

## Output
Write the file to exactly this path:

  work/strategy/outputs/swot-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Strategic planning
- Competitive response
- New market entry
- Annual planning
- Major product decisions

## The Problem

Most SWOT analyses are brainstorm dumps — long lists in four boxes with no prioritization or strategic implications. They get created, presented once, and forgotten.

## What You'll Need
- Company/product context
- Focus area (what decision or question this SWOT informs)
- Recent developments (market changes, competitor moves)

## What You'll Get

- Prioritized SWOT matrix (top 3 in each quadrant)
- Evidence for each item
- TOWS strategic actions (SO, WO, ST, WT strategies)
- Prioritized action plan with owners
- Risk and opportunity assessment

## Process

### Step 1: Check Your Context
First, read the user's context files to gather intelligence:
- `context/company.md` — Strategic priorities, strengths, business model
- `context/product.md` — Product strengths/weaknesses, metrics, known issues
- `context/competitors.md` — Competitive threats and opportunities
- `context/personas.md` — Customer insights that reveal opportunities

**Tell the user what you found.** For example:
> "I pulled context from your files:
> - Strengths: AI capabilities, agency-specific features (from company.md)
> - Weaknesses: 'Reporting is too basic' is a known issue (product.md)
> - Threats: Monday.com brand recognition, Float's resource planning (competitors.md)
> - Opportunities: Agency vertical is underserved (company.md strategy)
>
> I'll build the SWOT around this. What's the specific focus or decision this SWOT should inform?"

### Step 2: Define Focus Area
Clarify what this SWOT is for:
> "A SWOT is most useful when it's focused. What decision or question should this inform?
> - Product decision?
> - Market entry?
> - Annual strategy?
> - Competitive response?"

### Step 3: Identify Internal Factors (Strengths/Weaknesses)
Analyze what you control — pull from context files:
- **Strengths:** Competitive advantages, resources, capabilities
- **Weaknesses:** Gaps, limitations, areas of underperformance

### Step 4: Identify External Factors (Opportunities/Threats)
Analyze what you don't control — pull from context files:
- **Opportunities:** Market trends, competitor gaps, customer needs
- **Threats:** Competitive moves, market shifts, risks

### Step 5: Prioritize Top 3 in Each Quadrant
Rank by:
- Impact (how much it matters)
- Certainty (how confident we are)
- Actionability (can we do something about it)

### Step 6: Map TOWS Strategies
Combine quadrants into strategic actions:
- **SO (Strengths + Opportunities):** Use strengths to capture opportunities
- **WO (Weaknesses + Opportunities):** Address weaknesses to capture opportunities
- **ST (Strengths + Threats):** Use strengths to mitigate threats
- **WT (Weaknesses + Threats):** Avoid worst-case scenarios

## Output Template

```markdown
# SWOT Analysis: [Subject]

**Date:** [Date]
**Focus:** [What decision/question this informs]
**Prepared for:** [Audience]

## Context
*What I found in your files:*
- **Company context:** [From company.md]
- **Product state:** [From product.md — metrics, known issues]
- **Competitive landscape:** [From competitors.md]
- **Customer insights:** [From personas.md]

## Executive Summary

[2-3 sentence summary of key findings and recommended actions]

## SWOT Matrix

### Strengths (Internal, Positive)

| Rank | Strength | Evidence | Impact | Source |
|------|----------|----------|--------|--------|
| 1 | [Strength] | [Data] | High | [company.md/product.md] |
| 2 | [Strength] | [Data] | High | [Source] |
| 3 | [Strength] | [Data] | Medium | [Source] |

### Weaknesses (Internal, Negative)

| Rank | Weakness | Evidence | Impact | Source |
|------|----------|----------|--------|--------|
| 1 | [Weakness] | [Data] | High | [product.md known issues] |
| 2 | [Weakness] | [Data] | Medium | [Source] |
| 3 | [Weakness] | [Data] | Medium | [Source] |

### Opportunities (External, Positive)

| Rank | Opportunity | Evidence | Timeframe | Source |
|------|-------------|----------|-----------|--------|
| 1 | [Opportunity] | [Data] | Near | [company.md strategy] |
| 2 | [Opportunity] | [Data] | Mid | [competitors.md gaps] |
| 3 | [Opportunity] | [Data] | Long | [Source] |

### Threats (External, Negative)

| Rank | Threat | Evidence | Likelihood | Source |
|------|--------|----------|------------|--------|
| 1 | [Threat] | [Data] | High | [competitors.md] |
| 2 | [Threat] | [Data] | Medium | [Source] |
| 3 | [Threat] | [Data] | Low | [Source] |

## TOWS Strategic Actions

### SO Strategies (Use Strengths to Capture Opportunities)

| Strategy | Strength Used | Opportunity Addressed | Priority |
|----------|---------------|----------------------|----------|
| [Action] | S1 | O1 | High |
| [Action] | S2 | O2 | Medium |

### WO Strategies (Address Weaknesses to Capture Opportunities)

| Strategy | Weakness Addressed | Opportunity Enabled | Priority |
|----------|-------------------|---------------------|----------|
| [Action] | W1 | O1 | High |

### ST Strategies (Use Strengths to Mitigate Threats)

| Strategy | Strength Used | Threat Mitigated | Priority |
|----------|---------------|------------------|----------|
| [Action] | S1 | T1 | High |

### WT Strategies (Avoid Worst-Case Scenarios)

| Strategy | Weakness + Threat | Risk Level | Priority |
|----------|-------------------|------------|----------|
| [Action] | W1 + T1 | High | High |

## Prioritized Action Plan

| Rank | Action | Type | Owner | Timeline | Success Metric |
|------|--------|------|-------|----------|----------------|
| 1 | [Action] | SO/WO/ST/WT | [Name] | [Date] | [Metric] |
| 2 | [Action] | SO/WO/ST/WT | [Name] | [Date] | [Metric] |

## Connection to Strategic Priorities

| Action | Supports Priority | From |
|--------|-------------------|------|
| [Action] | [Priority from company.md] | company.md |

## Assumptions to Validate
- ⚠️ [Assumption needing verification]

## Review Schedule

- **Next review:** [Date]
- **Trigger for early review:** [What would prompt reassessment]

## Suggested Updates to Context Files
- [ ] Add new competitive threats to `competitors.md`
- [ ] Update known issues in `product.md`
```

## Framework Reference

**SWOT + TOWS Framework:**
- **SWOT:** Strengths, Weaknesses, Opportunities, Threats — categorize factors
- **TOWS:** Strategic matrix combining quadrants into actionable strategies
  - SO: Maxi-Maxi (leverage and expand)
  - WO: Mini-Maxi (improve and pursue)
  - ST: Maxi-Mini (leverage and defend)
  - WT: Mini-Mini (avoid and exit)

## Tips for Best Results
1. **Keep context files updated** — I'll pull strengths, weaknesses, threats from your files
2. **Be specific with evidence** — "Good brand" is weak; "42 NPS, 85% unaided awareness" is strong
3. **Focus on top 3** — Long lists dilute focus; prioritize ruthlessly
4. **Make it actionable** — Every item should connect to a potential action
5. **Use TOWS** — The magic is in combining quadrants, not listing them
