---
name: metric-framework-builder
description: 'Design a metrics framework showing what to measure, why it matters, and how metrics connect to value. Use when: metrics framework, kpi framework, success metrics, measurement plan.'
disable-model-invocation: true
category: data
---

# Metric Framework Builder

Design a metrics framework showing what to measure, why it matters, and how metrics connect to value — using proven frameworks like AARRR (full funnel), HEART (UX quality), and North Star (single focus metric).

## Output
Write the file to exactly this path:

  work/analytics/outputs/metric-framework-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Designing metrics for a new product or feature
- Cleaning up a messy metrics landscape
- Aligning teams on what to measure and why

## What You'll Get

I'll generate a complete measurement system with:
- **North Star Metric** — The one metric that captures your core value
- **Input metrics hierarchy** — 3-5 leading indicators that drive the North Star
- **Guardrail metrics** — What you'll protect while optimizing (quality, margin, compliance)
- **Framework mapping** — AARRR funnel breakdown if applicable
- **Review cadence** — How often to check each metric tier
- **Connection to business goals** — How metrics tie to your OKRs and value prop

## What You'll Need

**Critical inputs (ask if not provided):**
- What product/feature are you designing metrics for?
- What framework makes sense? (AARRR for growth, HEART for UX, or Custom)

**Nice-to-have inputs:**
- Current metrics you're tracking
- Business goals and targets
- Data sources available

## Process

### Step 1: Review Your Context

I'll start by checking your context files:
- **product.md** — Current metrics, value proposition, key features
- **company.md** — Business goals, OKRs, strategic priorities
- **personas.md** — Who are you measuring value for?

I'll share what I find. For example:
> "I found your product delivers value through 'AI-powered project scheduling' (product.md). Your Jordan persona measures success by 'hours saved on planning.' Your company OKRs include 'improve retention to 95%.' I'll design a framework that tracks value delivery to Jordan while connecting to your retention goal."

### Step 2: Confirm Framework Approach

If I need clarity, I'll ask:
> "Before I design this metrics framework, I need:
> 1. What product or feature is this for? (I found [X] in product.md — is that right?)
> 2. What framework fits best — AARRR (full funnel), HEART (UX focus), or Custom?
>
> I can pull business goals from company.md and value props from product.md."

I won't generate a framework with made-up baselines. I'll use your real data or mark metrics as `[NEEDS DATA]`.

### Step 3: Choose the Right Framework

I'll recommend a framework based on your situation:
- **AARRR (Pirate Metrics):** Best for growth-stage products tracking the full customer lifecycle (Acquisition → Activation → Retention → Revenue → Referral). Use when you need acquisition-to-revenue visibility.
- **HEART:** Best for UX-focused products where experience quality matters most (Happiness, Engagement, Adoption, Retention, Task Success). Use when optimizing existing features.
- **Custom/Hybrid:** Best when your product doesn't fit standard funnels or you need metrics from multiple frameworks.

### Step 4: Define Your North Star

I'll identify the ONE metric that captures your core value:
- What would users miss most if your product disappeared?
- What action indicates they received value?

### Step 5: Map Input Metrics

I'll identify 3-5 leading behaviors that drive the North Star:
- What actions must users take before the North Star can increase?
- What do power users do differently than churned users?
- Where are the biggest leverage points in your user journey?

### Step 6: Set Guardrails

I'll define what shouldn't suffer while you optimize:
- Quality metrics (NPS, support load, bugs)
- Business constraints (margin, CAC, compliance)

### Step 7: Set Review Cadence

I'll recommend how often to review each metric tier, matching frequency to volatility and actionability.

## Output Template

```markdown
# Metric Framework: [Product Name]

**Framework:** AARRR / HEART / Custom
**Date:** [Date]
**Data Sources:** [List metrics sources used: analytics, surveys, etc.]

## Context
*What I found in your files:*
- **Core value prop:** [From product.md]
- **Target persona:** [From personas.md — who we're measuring for]
- **Business goals:** [From company.md — OKRs, targets]
- **Current metrics:** [From product.md if documented]

## North Star Metric
**Metric:** [Name]
**Definition:** [How it's calculated]
**Why:** [Why this captures core value]
**Current:** [Value]
**Target:** [Value] by [Date]

## Metric Hierarchy

### Tier 1: North Star
[North Star Metric]

### Tier 2: Input Metrics
*Leading indicators that drive the North Star*

| Metric | How It Drives North Star | Current | Target |
|--------|--------------------------|---------|--------|
| [Input 1] | [Explanation] | [X] | [Y] |
| [Input 2] | [Explanation] | [X] | [Y] |

### Tier 3: Health Metrics
*Guardrails to protect while optimizing*

| Metric | What It Protects | Minimum Acceptable (Floor) | Current |
|--------|------------------|----------------------------|---------|
| [Health 1] | [What quality/constraint] | [Min value] | [X] |

## AARRR Breakdown (if applicable)

| Stage | Metric | Definition | Current | Target |
|-------|--------|------------|---------|--------|
| Acquisition | [Metric] | [Def] | [X] | [Y] |
| Activation | [Metric] | [Def] | [X] | [Y] |
| Retention | [Metric] | [Def] | [X] | [Y] |
| Revenue | [Metric] | [Def] | [X] | [Y] |
| Referral | [Metric] | [Def] | [X] | [Y] |

## Guardrail Metrics
- [Metric 1] — Must not drop below [X]
- [Metric 2] — Must not drop below [X]

## Review Cadence
| Metric Type | Frequency | Owner |
|-------------|-----------|-------|
| North Star | Weekly | [Name] |
| Input Metrics | Weekly | [Name] |
| Health Metrics | Monthly | [Name] |
```

## Framework Reference
**AARRR (Pirate Metrics):** Full-funnel startup metrics
**HEART:** Google's UX-focused framework
**North Star:** Single unifying metric + inputs

## Tips for Best Results

1. **I'll use your context files** — I'll connect metrics to your value prop in product.md and personas
2. **I focus on value, not vanity** — I'll measure what users get, not what you build
3. **I keep it focused** — 3-5 input metrics max, not 20 competing priorities
4. **I tie to business goals** — Every metric will connect to your OKRs in company.md
5. **I define clearly** — Ambiguous definitions cause endless debates, so I'll be specific

## Suggested Updates
After finalizing the framework:
- [ ] Add metrics definitions to `product.md`
- [ ] Set up dashboards with these metrics
- [ ] Establish baseline measurements
