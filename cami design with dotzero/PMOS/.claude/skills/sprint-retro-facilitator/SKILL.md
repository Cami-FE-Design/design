---
name: sprint-retro-facilitator
description: 'Structures sprint retrospectives with prompts, synthesis, and action items Use when: sprint retro, run retro, retrospective for, what went well what didn''t, retro notes.'
disable-model-invocation: true
category: operations
---

# Sprint Retro Facilitator

Structures sprint retrospectives using the "What Went Well / What Didn't / What to Change" format, synthesizes feedback, and generates concrete action items with owners.

## Output
Write the file to exactly this path:

  work/specs/outputs/retro-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- End of sprint or iteration
- After major releases or milestones
- When team needs to reflect on a difficult period
- Regular cadence of continuous improvement

## What You'll Get

- Structured retro summary with synthesized themes
- Previous action items status check
- New action items with clear owners and due dates
- Patterns and observations for long-term tracking
- Facilitation prompts for running the retro live

## What You'll Need

**Critical inputs (ask if not provided):**
- What sprint/period are you reflecting on?
- Team feedback (what went well, what didn't, ideas)

**Nice-to-have inputs:**
- Previous retro action items
- Context on major events (releases, incidents)
- Sprint goals and outcomes

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand what happened this sprint:
- `context/product.md` — Recent releases, incidents, roadmap items delivered
- `context/company.md` — Team structure, current priorities, recent changes

I'll summarize what I found. For example:
> "I found you launched 'Resource Planning v2' this sprint (product.md) and had one P2 incident. Your company priorities include 'improve team velocity.' I'll frame the retro around these events and check if they impacted velocity."

### Step 2: Gather Retro Context
If you don't have enough context, ask:
> "Before I facilitate this retro, I need:
> 1. What sprint or period? (I found [recent release] in product.md)
> 2. What was the sprint goal? Was it hit?
> 3. Do you have previous action items to review?
>
> Or paste the raw team feedback and I'll synthesize it."

### Step 3: Set Context
Clarify what period you're reflecting on and any specific themes to focus on.

### Step 4: Gather Feedback
Collect team input across three categories:
- What Went Well (keep doing)
- What Didn't Go Well (stop or fix)
- Ideas / What to Change (try something new)

### Step 5: Synthesize and Identify Patterns
I'll group similar feedback, identify themes, and flag patterns that recur across retros.

### Step 6: Generate Action Items
I'll create 3-5 specific, actionable improvements with clear owners and due dates.

### Step 7: Check Previous Action Items
I'll review what was committed in the last retro and assess follow-through.

## Output Template

I'll generate this retro summary for you:

```markdown
# Sprint Retrospective: [Sprint Name/Number]

**Date:** [Date]
**Facilitator:** [Name]
**Attendees:** [Team members present]
**Sprint Goal:** [What was the goal?]
**Goal Achieved:** Yes / Partially / No

## Context
*What I found in your files:*
- **Releases this sprint:** [From product.md]
- **Incidents:** [From product.md known issues]
- **Team priorities:** [From company.md]

---

## Previous Action Items Check

| Action Item | Owner | Status | Notes |
|-------------|-------|--------|-------|
| [Action from last retro] | [Name] | ✅ Done / 🔄 In Progress / ❌ Not Started | [Update] |
| [Action from last retro] | [Name] | ✅ / 🔄 / ❌ | [Update] |

---

## What Went Well ✅

*Things we should keep doing*

### Theme: [Theme Name]
- [Specific thing that went well] — [Who mentioned / context]
- [Specific thing that went well] — [Who mentioned / context]

### Theme: [Theme Name]
- [Specific thing that went well] — [Who mentioned / context]

---

## What Didn't Go Well ❌

*Things we should stop or fix*

### Theme: [Theme Name]
- [Specific thing that didn't go well] — [Who mentioned / context]
- [Specific thing that didn't go well] — [Who mentioned / context]

### Theme: [Theme Name]
- [Specific thing that didn't go well] — [Who mentioned / context]

---

## Ideas / What to Change 💡

*Things we want to try*

- [Idea or suggestion] — [Who suggested / rationale]
- [Idea or suggestion] — [Who suggested / rationale]

---

## Patterns and Observations

**Recurring themes:**
- [Theme that keeps coming up across retros]
- [Theme that keeps coming up across retros]

**Team energy/morale:**
- [Observation about team dynamics, energy, or morale]

**External factors:**
- [Context from outside the team that affected this sprint]

---

## Action Items for Next Sprint

| Priority | Action | Owner | Due Date |
|----------|--------|-------|----------|
| 🔴 High | [Specific, actionable improvement] | [Name] | [Date] |
| 🟡 Medium | [Specific, actionable improvement] | [Name] | [Date] |
| 🟡 Medium | [Specific, actionable improvement] | [Name] | [Date] |

**Commitment:** Team commits to completing these action items before next retro.

---

## Notes for Next Retro

- [Thing to follow up on]
- [Thing to watch for]

---

*Retro facilitated using the "What Went Well / What Didn't / What to Change" format.*
```

## Facilitation Prompts

If you need help generating discussion prompts for your retro, here are proven questions:

**What Went Well:**
- What helped us move fast this sprint?
- What should we make sure to keep doing?
- What made you proud this sprint?
- What went better than expected?

**What Didn't Go Well:**
- What slowed us down?
- What was frustrating?
- Where did we waste time?
- What would you do differently if we could restart this sprint?

**What to Change:**
- What's one thing we could try next sprint?
- What process is annoying but we've accepted it?
- What would make your work life 10% better?
- If you had a magic wand, what would you change?

**Team Health:**
- On a scale of 1-5, how sustainable was this sprint?
- Do you have what you need to do your best work?
- Is there anything you've been hesitant to bring up?

## Framework Reference

This skill uses the **"What Went Well / What Didn't Go Well / What to Change"** retrospective format, a simplified version of the classic "Start, Stop, Continue" framework.

Key principles from effective retrospectives (Agile Alliance, Esther Derby's "Agile Retrospectives"):
- **Safety first** — People need to feel safe to share honestly
- **Focus on systems, not people** — Blame kills learning
- **Action items must be actionable** — Vague improvements don't happen
- **Follow through** — Always review previous action items first
- **Vary the format** — Same format every time gets stale

## Tips for Best Results

1. **Use your context files** — I'll connect retro themes to recent releases and priorities
2. **Review last retro first** — Check action item status to show follow-through matters
3. **Time-box discussion** — 5-10 min per category, or the loudest voices dominate
4. **Dot vote for priorities** — When you have too many items, let the team vote
5. **Limit action items to 3-5** — More than that won't get done
6. **Assign real owners** — "The team" is not an owner
7. **Make it psychological safe** — What's said in retro stays in retro

## Suggested Next Steps

After reviewing this retro summary, you can:
- Save action items to track for next retro
- Update `product.md` if process changes affect product work
- Share summary with stakeholders if relevant
