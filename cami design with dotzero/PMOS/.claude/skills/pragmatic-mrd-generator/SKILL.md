---
name: pragmatic-mrd-generator
description: 'Create a market-focused Market Requirements Document using the Pragmatic Institute framework. Use when: create mrd, market requirements document, pragmatic mrd, market requirements.'
disable-model-invocation: true
category: specs
---

# Pragmatic MRD Generator

Create a market-focused Market Requirements Document (MRD) using the Pragmatic Institute framework.

## Output
Write the file to exactly this path:

  work/specs/outputs/mrd-[feature]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Documenting market problems before building solutions
- Prioritizing which problems to solve based on market evidence
- Aligning stakeholders on WHY you're building (not WHAT/HOW)
- Transitioning from market research to product planning

## What You'll Need
- Market research (customer interviews, competitive analysis, market data)
- Problem statements or pain points identified
- Target personas or customer segments
- Business context (company goals, market position)

## Critical Input Distinction

**MRD vs PRD:**
- **MRD = Market-focused** (the "WHY") — Problems, needs, market opportunities
- **PRD = Product-focused** (the "WHAT/HOW") — Features, specs, implementation

An MRD answers: "What problems exist in the market and which should we solve?"
A PRD answers: "What exactly are we building and how will it work?"

**Before generating:**
If you don't have clear market problems or target personas, ask:
> "To create a market-focused MRD, I need to understand:
> 1. What market problems have you identified? (from research, customer feedback, or competitive gaps)
> 2. Who experiences these problems? (target personas or segments)
>
> Once I have this, I can create the MRD with prioritized problems and use scenarios."

## Process

### Step 1: Check Your Context
Read the user's context files:
- `context/company.md` — Market position, business goals
- `context/product.md` — Current product state
- `context/personas.md` — Target users and buyers
- `context/competitors.md` — Competitive landscape
- Research files — Interview data, market analysis

**Tell the user what you found** and whether you have enough to proceed.

### Step 2: Gather Market Evidence
If context is thin, ask for:
- Customer interview insights (what problems came up repeatedly?)
- Competitive gaps (what do competitors fail to address?)
- Market trends (what's changing in the market?)
- Win/loss analysis (why do you win or lose deals?)

### Step 3: Identify Market Problems
Extract the core problems:
- What job are customers trying to do?
- What prevents them from doing it well today?
- What's the impact of this problem?
- How prevalent is this problem?

### Step 4: Define Use Scenarios
For each major problem, create use scenarios:
- **Persona:** Who experiences this?
- **Goal:** What are they trying to accomplish?
- **Problem:** What gets in their way?
- **Frequency:** How often does this occur?

### Step 5: Prioritize Problems
Assess each problem:
- **Market Evidence:** How strong is the signal?
- **Market Size:** How many people have this problem?
- **Urgency:** How painful is it?
- **Alignment:** Does it fit our strategy?

### Step 6: Generate MRD
Create the market requirements document with prioritized problems and evidence.

## Output Template

```markdown
# Market Requirements Document: [Market Opportunity Name]

**Author:** [Name]
**Date:** [Date]
**Status:** Draft | Review | Approved

---

## Executive Summary

[2-3 paragraphs summarizing the market opportunity, target personas, and prioritized problems]

---

## Market Context

### Market Overview
| Attribute | Value |
|-----------|-------|
| Market Size | [TAM/SAM/SOM if known] |
| Growth Rate | [Market growth trends] |
| Key Trends | [What's changing in this market] |

### Target Personas

**Primary Persona:** [Name]
- **Role:** [Job title/description]
- **Segment:** [Company size, industry]
- **Buying Power:** Economic buyer | Functional buyer | User | Influencer

**Secondary Persona:** [Name]
- [Same structure]

### Competitive Landscape
- **Current Solutions:** [What do customers use today?]
- **Gaps:** [What problems remain unsolved?]
- **Trends:** [Where is the market moving?]

---

## Market Problems

### Problem 1: [Problem Name]

**Problem Statement:**
[Clear, concise statement of the market problem]

**Use Scenarios:**

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| [Name] | [What they're trying to do] | [What prevents them] | [How often] |
| [Name] | [Goal] | [Problem] | [Frequency] |

**Market Evidence:**
- ✅ **Customer Interviews:** [Quote or insight from research]
- ✅ **Win/Loss Data:** [Evidence from sales]
- ✅ **Competitive Analysis:** [What competitors miss]
- ✅ **Usage Data:** [Behavioral evidence if available]

**Impact:**
- **Business Impact:** [Revenue loss, churn risk, etc.]
- **User Impact:** [Time wasted, frustration, workarounds]

**Market Size:**
- **Who:** [Which segments experience this]
- **How Many:** [Estimated market size]
- **Addressable:** [How many we could realistically reach]

---

### Problem 2: [Problem Name]

[Same structure as Problem 1]

---

### Problem 3: [Problem Name]

[Same structure as Problem 1]

---

## Problem Prioritization

| Problem | Market Evidence | Market Size | Urgency | Strategic Fit | Priority |
|---------|----------------|-------------|---------|---------------|----------|
| [Problem 1] | Strong | Large | High | High | P0 |
| [Problem 2] | Moderate | Medium | Medium | High | P1 |
| [Problem 3] | Weak | Small | Low | Medium | P2 |

**Priority Definitions:**
- **P0:** Must solve — strong evidence, large market, high urgency
- **P1:** Should solve — good evidence, meaningful market
- **P2:** Could solve — validate further before committing

---

## Success Metrics

**Market Validation Metrics:**
- [How will we know we're solving the right problems?]
- [What customer behavior would validate this?]
- [What market signals would confirm demand?]

**Business Metrics:**
- [Revenue impact]
- [Customer acquisition]
- [Retention/expansion]

---

## Next Steps

- [ ] Validate assumptions with additional research
- [ ] Socialize MRD with stakeholders for alignment
- [ ] Create PRD for P0 problems (solution definition)
- [ ] Define go-to-market strategy for target personas

---

## Appendix

### Research Sources
- [List customer interviews, surveys, competitive research]

### Assumptions & Risks
- ⚠️ **Assumed:** [What needs validation]
- ⚠️ **Risk:** [What could invalidate this MRD]

```

## Framework Reference

This skill follows the **Pragmatic Institute Market Requirements Document** framework:
- **Market-focused, not product-focused** — MRDs define problems, not solutions
- **Use scenarios** — Persona + Goal + Problem + Frequency format
- **Evidence-based prioritization** — Ground decisions in market data
- **Separates market requirements (MRD) from product specs (PRD)**

**Source:** [Pragmatic Institute - Writing the Market Requirements Document](https://www.pragmaticinstitute.com/resources/articles/product/writing-the-market-requirements-document/)

## Tips for Best Results

1. **Strong context = better MRD** — The more market research in your context files, the more grounded the output
2. **MRD before PRD** — Use this to align on WHY before defining WHAT
3. **Personas are critical** — If your personas are thin, enhance them first with the persona-generator skill
4. **Market evidence beats opinions** — Every problem should link to research, not guesses
5. **Save to context/** — Once approved, save key sections to `context/product.md` or create `context/market-problems.md`
