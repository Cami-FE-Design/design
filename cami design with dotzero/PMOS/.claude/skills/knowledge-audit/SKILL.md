---
name: knowledge-audit
description: "Audit your context files for stale claims, missing evidence, and gaps. Find what needs refreshing before it degrades your skill outputs. Use when: knowledge audit, context audit, stale context, what needs updating, context health, audit context."
model: sonnet
disable-model-invocation: true
category: cc
---

# Knowledge Audit

Find what's stale, missing, or unverified in your context files before it silently degrades every skill you run. A monthly habit that keeps your PM OS trustworthy.

## When to Use

- Monthly cadence (first Monday of the month)
- Before a quarterly planning cycle (ensure context is fresh for roadmap/goal-setting)
- After major product or market changes (verify context reflects reality)
- When skill outputs start feeling generic or off (symptom of stale context)
- During managed services context refresh cycles

## Process

### Step 1: Read All Context Files

Read every file listed in `context/INDEX.md`. If INDEX.md doesn't exist, read the standard five:

1. `context/company.md`
2. `context/product.md`
3. `context/personas.md`
4. `context/competitors.md`
5. `context/goals.md`

For each file, catalog:

- Total sections and word count
- Sections with `[NOT YET FILLED]` markers (never populated)
- Sections with `<!-- auto-updated: YYYY-MM-DD -->` markers (check date)
- Claims that include evidence tags (e.g., `— Source, Date`)
- Claims without any source attribution
- The file's `Last updated` metadata header (if present)

### Step 2: Freshness Analysis

Score each context file on three dimensions:

**Completeness** — What percentage of sections are filled vs. `[NOT YET FILLED]`?

| Score | Meaning |
|-------|---------|
| Green | 80%+ sections filled |
| Yellow | 50-80% filled |
| Red | <50% filled |

**Freshness** — How old is the content?

| Score | Meaning |
|-------|---------|
| Green | Updated within 30 days |
| Yellow | 30-60 days since last update |
| Red | 60+ days since last update |

Use `Last updated` header, `<!-- auto-updated -->` dates, and evidence dates to determine age.

**Evidence Quality** — How many claims have source attribution?

| Score | Meaning |
|-------|---------|
| Green | 70%+ claims have sources |
| Yellow | 40-70% have sources |
| Red | <40% have sources (lots of unsupported assertions) |

### Step 3: Flag Specific Issues

Identify and categorize issues into four groups:

**Stale Claims (highest priority)**

Claims with dates older than 60 days that may no longer be true. Examples:

- "Our main competitor charges $X/month" (pricing changes frequently)
- "We have Y active users" (metrics go stale fast)
- "The market is estimated at $Z" (market reports update annually)

**Missing Evidence**

Assertions presented as facts without source attribution. Examples:

- "Users prefer X over Y" (says who? which users? when?)
- "We win on ease of use" (based on what data?)
- Persona frustrations without interview quotes or data backing

**Unfilled Sections**

`[NOT YET FILLED]` markers that have been untouched for 60+ days. These are gaps that skills work around — filling them would improve output quality.

**Contradictions**

Claims in one file that conflict with claims in another. Examples:

- goals.md says "focus on enterprise" but personas.md only has SMB personas
- product.md says "launching Q1" but it's now Q2 and no update
- competitors.md lists a competitor that no longer exists

### Step 4: Present the Audit Report

Display the Context Health Summary table and a prioritized refresh list:

```
Knowledge Audit — [Date]

Context Health Summary

| File            | Completeness | Freshness   | Evidence |
|-----------------|--------------|-------------|----------|
| company.md      | Green        | Yellow 42d  | Green    |
| product.md      | Green        | Green 12d   | Yellow   |
| personas.md     | Yellow       | Red 78d     | Red      |
| competitors.md  | Green        | Yellow 55d  | Yellow   |
| goals.md        | Red          | Red 91d     | Yellow   |

Priority Refresh List:

1. [Red] goals.md — Q1 goals still active, Q2 not set
   Impact: Every planning and prioritization skill uses stale priorities
   Fix: Run /set-goals to establish Q2 goals

2. [Red] personas.md — 3 of 5 persona sections are [NOT YET FILLED]
   Impact: PRDs and positioning cite only 2 personas
   Fix: Run /persona-generator for the missing personas

3. [Yellow] competitors.md — Pricing data is 55 days old
   Impact: /pricing-strategy-analyzer may use outdated competitor prices
   Fix: Run /competitive-profile-builder for top 2 competitors

4. [Yellow] product.md — 4 claims lack source attribution
   Impact: Low confidence in product claims cited by skills
   Fix: Add evidence tags manually or run /enhance-context with recent docs

5. [Green] company.md — Healthy, no action needed

Total: [N] critical, [N] moderate, [N] healthy
```

### Step 5: Recommend Next Actions

Based on the audit, recommend 1-3 specific actions in priority order. Focus on what the user can do THIS WEEK. Do not create a 10-item backlog — 3 actions maximum.

```
Recommended Actions:

1. Run /set-goals now — your Q1 goals are 91 days old and Q2
   hasn't started. This is the highest-impact refresh because
   goals.md feeds into every planning skill.

2. Schedule /competitive-profile-builder for [top competitor]
   this week — pricing data is likely stale.

3. Drop any recent user interview transcripts into
   work/discovery/inputs/ and run /enhance-context to fill
   persona gaps.

Next audit: [first Monday of next month]
```

## What This Does NOT Do

- Does NOT auto-edit context files (surfaces issues for human judgment)
- Does NOT access external data sources (works entirely from local files)
- Does NOT replace /enhance-context or /context-sync (it identifies WHAT needs refreshing, those skills DO the refreshing)
- Does NOT score content quality (for that, use the content-quality-auditor skill on marketing content)

## Framework Reference

This skill applies **information decay analysis** — the principle that knowledge has a half-life. Competitive pricing decays in weeks. User research insights decay in months. Mission statements decay in years. The freshness thresholds (30/60 days) reflect how quickly PM context goes stale in practice.

## Tips for Best Results

1. **Run monthly** — Context decay is gradual. Monthly cadence catches staleness before it compounds across skills.
2. **Fix Red items first** — One stale goals.md degrades every planning skill. Prioritize files that feed the most downstream skills.
3. **Add evidence as you go** — When you learn something new (interview, competitor change, metric update), tag it with source and date. Future audits will thank you.
4. **Pair with /enhance-context** — This skill finds what's wrong. /enhance-context fixes it. Run them back to back for a full refresh cycle.

## Time

- **Audit:** 2-3 minutes (reading and scoring)
- **Full refresh cycle** (audit + fixes): 15-30 minutes depending on how many files need updating
