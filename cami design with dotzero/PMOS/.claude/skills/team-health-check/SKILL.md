---
name: team-health-check
description: 'Run structured team health checks using the Spotify Squad Health Check model Use when: team health check, squad health check, team morale check, how is the team doing, team assessment.'
disable-model-invocation: true
category: operations
---

# Team Health Check

Run structured team health checks using the Spotify Squad Health Check model to surface what's working and what needs attention.

## Output
Write the file to exactly this path:

  work/analytics/outputs/team-health-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- Quarterly or monthly team health assessments
- When something feels off but you can't pinpoint why
- After significant changes (reorg, new leadership, big project)
- Before planning cycles to identify team capacity constraints
- Part of regular engineering/product team rituals

## What You'll Get

- Health check summary with overall team health score
- Traffic light ratings (🟢🟡🔴) across 11 indicators
- Trend analysis comparing to previous health checks
- Root cause analysis for red/yellow indicators
- 2-4 prioritized action items with owners

## What You'll Need

**Critical inputs (ask if not provided):**
- Which team you're assessing
- Team feedback on health indicators (ratings + comments)

**Nice-to-have inputs:**
- Previous health check results (for trends)
- Recent context (launches, incidents, team changes)
- Observations from 1:1s

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand team structure and recent events:
- `context/company.md` — Team structure, recent org changes, company priorities
- `context/product.md` — Recent releases, incidents, current workload

I'll summarize what I found. For example:
> "I found your Engineering team has 25 people (company.md). Recent context: you launched Resource Planning v2 and had a P2 incident last month (product.md). I'll factor these into the health check interpretation."

### Step 2: Gather Health Check Data
If you don't have the team feedback, ask:
> "Before I run this health check, I need:
> 1. Which team? (I found these teams in company.md: [list])
> 2. Team member ratings on health indicators
>
> Do you have previous health check results for trend comparison?"

**Do NOT generate health assessments without actual team feedback. This is about what the team thinks, not assumptions.**

### Step 3: Define Health Indicators
I'll use the Spotify Squad Health Check indicators (or customize for your team):
- Delivering value
- Easy to release
- Learning
- Mission/purpose
- Fun
- Pawns or players (autonomy)
- Health of codebase
- Teamwork
- Speed
- Support (tools, processes)
- Suitable process

### Step 4: Gather Team Input
Have each team member rate each indicator (green/yellow/red or 1-5) and provide optional comments.

### Step 5: Synthesize Results
I'll calculate averages, identify outliers, and group qualitative feedback into themes.

### Step 6: Identify Trends and Root Causes
I'll compare to previous health checks if available, and dig into why indicators are red/yellow.

### Step 7: Generate Action Items
I'll create 2-4 focused improvements with owners and timeline.

## Output Template

I'll generate this health check summary for you:

```markdown
# Team Health Check: [Team Name]

**Date:** [Date]
**Facilitator:** [Name]
**Team Members:** [List or count]
**Response Rate:** [X/Y responded]

## Context
*What I found in your files:*
- **Team size:** [From company.md]
- **Recent events:** [From product.md — releases, incidents]
- **Company priorities:** [From company.md — how they affect this team]
- **Recent changes:** [From company.md — reorgs, new hires]

---

## Summary

**Overall Health:** 🟢 Healthy / 🟡 Some Concerns / 🔴 Needs Attention

**Top Strengths:** [1-2 strongest indicators]
**Top Concerns:** [1-2 weakest indicators]

---

## Health Indicators

*Rating: 🟢 Green (healthy) / 🟡 Yellow (some issues) / 🔴 Red (needs attention)*
*Trend: ↑ Improving / → Stable / ↓ Declining (vs. last health check)*

| Indicator | Rating | Trend | Key Themes |
|-----------|--------|-------|------------|
| Delivering Value | 🟢🟡🔴 | ↑ ↓ → | [Brief theme from comments] |
| Easy to Release | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Learning | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Mission/Purpose | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Fun | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Autonomy | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Codebase Health | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Teamwork | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Speed | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Support | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |
| Process | 🟢🟡🔴 | ↑ ↓ → | [Brief theme] |

---

## What's Going Well 🟢

### [Strength 1: Indicator Name]
**Rating:** 🟢 [Average score if using numbers]

**What the team said:**
- [Quote or paraphrased feedback]
- [Quote or paraphrased feedback]

**Why this matters:** [Brief interpretation]

### [Strength 2: Indicator Name]
**Rating:** 🟢

**What the team said:**
- [Quote or paraphrased feedback]

---

## What Needs Attention 🔴

### [Concern 1: Indicator Name]
**Rating:** 🔴 [Average score]
**Trend:** [Improving/Stable/Declining]

**What the team said:**
- [Quote or paraphrased feedback]
- [Quote or paraphrased feedback]

**Root cause analysis:**
[Why is this indicator red? What's driving the problem?]

**Recommended action:** [Specific improvement]

### [Concern 2: Indicator Name]
**Rating:** 🔴 or 🟡
**Trend:** [Direction]

**What the team said:**
- [Quote or paraphrased feedback]

**Root cause analysis:**
[Why is this indicator struggling?]

**Recommended action:** [Specific improvement]

---

## Trends Over Time

| Indicator | [Previous Date] | [Current Date] | Change |
|-----------|-----------------|----------------|--------|
| [Indicator] | 🟢🟡🔴 | 🟢🟡🔴 | ↑ ↓ → |
| [Indicator] | 🟢🟡🔴 | 🟢🟡🔴 | ↑ ↓ → |

**Observations:**
- [Pattern or trend worth noting]
- [Improvement or regression to highlight]

---

## Action Items

| Priority | Action | Owner | Due Date | Indicator Addressed |
|----------|--------|-------|----------|---------------------|
| 🔴 High | [Specific action] | [Name] | [Date] | [Which indicator] |
| 🟡 Medium | [Specific action] | [Name] | [Date] | [Which indicator] |

**Note:** Focus on 2-4 actions. Too many dilutes focus and accountability.

---

## Discussion Notes

**Topics raised during discussion:**
- [Important point or debate]
- [Question that came up]

**Parking lot (for future):**
- [Issue acknowledged but not prioritized this cycle]

---

## Next Health Check

**Scheduled:** [Date]
**Focus areas:** [What to pay attention to]

---

*Health check using the Spotify Squad Health Check model.*
```

## Health Indicator Definitions

**Delivering Value:** Are we delivering quality work that matters to customers?
- 🟢 We deliver great stuff, proud of it
- 🔴 We deliver crap, or stuff no one wants

**Easy to Release:** How easy is it to get changes into production?
- 🟢 Releasing is simple, safe, painless
- 🔴 Releasing is risky, painful, manual

**Learning:** Are we learning new things and growing?
- 🟢 We're learning lots of interesting stuff
- 🔴 We never have time to learn anything

**Mission/Purpose:** Do we know why we exist and what we're aiming for?
- 🟢 We know exactly why we're here and it's inspiring
- 🔴 No clue, or we disagree, or it's not motivating

**Fun:** Do we enjoy coming to work?
- 🟢 Awesome, love this team and job
- 🔴 Dread, boredom, or frustration

**Pawns or Players (Autonomy):** Do we have control over what we do and how?
- 🟢 We're in control, decide what to build and how
- 🔴 We're told exactly what to do, no influence

**Health of Codebase:** Is our code/system in good shape?
- 🟢 Clean, easy to work with, proud of it
- 🔴 Mess, technical debt everywhere, scary

**Teamwork:** Do we work well together?
- 🟢 Great collaboration, support each other
- 🔴 Silos, tension, or people not pulling weight

**Speed:** How fast do we get things done?
- 🟢 We're fast, no waiting, good flow
- 🔴 Slow, blocked often, too much WIP

**Support:** Do we have the tools, processes, and help we need?
- 🟢 Great support, good tools, help when needed
- 🔴 Poor tools, no support, frustrating bureaucracy

**Suitable Process:** Does our way of working make sense for us?
- 🟢 Process helps us, feels right for the team
- 🔴 Process gets in the way, not fit for purpose

## Framework Reference

This skill uses the **Spotify Squad Health Check** model, developed by Henrik Kniberg and Spotify's engineering team. The model:

- Uses traffic light colors (green/yellow/red) for quick visualization
- Includes trend arrows to track progress over time
- Focuses on how the team *feels*, not just metrics
- Is designed to spark conversation, not just measure

Key principles:
- **Anonymity matters** — People are more honest when ratings are anonymous
- **Discussion > scores** — The conversation about "why" is more valuable than the ratings
- **Trend > snapshot** — Improvement direction matters more than absolute score
- **Action-oriented** — Every health check should produce 2-4 improvements to try

## Tips for Best Results

1. **Use your context files** — I'll interpret results in light of recent events and priorities
2. **Run consistently** — Monthly or quarterly, same indicators each time
3. **Make it anonymous** — Use a survey tool, not public voting
4. **Timebox the meeting** — 60-90 min max, or energy drops
5. **Focus on trends** — Don't panic about one red indicator; watch patterns
6. **Limit actions to 2-4** — More than that won't get done
7. **Close the loop** — Review previous action items at start of each health check

## Suggested Next Steps

After reviewing this health check summary, you can:
- Save results for trend tracking
- Update `company.md` with team health status if relevant
- Track action items for next health check
