---
name: quarterly-planning-template
description: 'Creates a quarterly plan with themes, bets, and resource allocation Use when: quarterly planning, quarterly plan, q1 plan, q2 plan, q3 plan, q4 plan.'
disable-model-invocation: true
category: planning
---

# Quarterly Planning Template

Creates a quarterly plan with themes, bets, resource allocation, and explicit "NOT doing" list.

## Output
Write the file to exactly this path:

  work/strategy/outputs/quarterly-plan-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Quarterly planning cycles (Q1/Q2/Q3/Q4)
- Annual planning broken into quarters
- Strategy offsites with execution focus
- Team capacity planning

## The Problem

Quarterly planning consumes weeks of meetings. Teams struggle to connect OKRs to actual work, and nobody can explain what they are NOT doing this quarter. Plans get outdated because they're too detailed or too vague.

## What You'll Get

- Quarterly plan document ready for stakeholder review
- Strategic themes with capacity allocation
- Bets with hypotheses and kill criteria
- Explicit "NOT doing" list with rationale
- Dependencies and risk register
- Milestones and checkpoints

## What You'll Need

**Required:**
- Quarter (Q1/Q2/Q3/Q4 and year)
- Team capacity (headcount by function)

**Helpful:**
- Company OKRs or strategic priorities
- Known initiatives or commitments
- Key constraints (blocked deals, deadlines, dependencies)
- Previous quarter learnings

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand your strategic priorities and team capacity:
- `context/company.md` — Strategic priorities, team structure, business model
- `context/product.md` — Current roadmap, metrics, known issues
- `context/personas.md` — Who you're building for and what they need
- `goals.md` — Company/team OKRs (if it exists)

I'll summarize what I found. For example:
> "I found your Q2 roadmap in product.md (Resource Planning v2, Adobe integration, SSO) and your company priorities (Win Agency Vertical, Expand AI). I see your team is 32 engineering, 8 product, 6 design. I'll use this as the starting point for the quarterly plan."

### Step 2: Gather Missing Context
If not in context files, ask:
> "To build a solid quarterly plan, I need:
> 1. What quarter are we planning? (Q1/Q2/Q3/Q4 and year)
> 2. What's your team capacity? (I see [X] in company.md — is that current?)
> 3. Any commitments or constraints I should know about?
>
> You can also add this to your context files for future planning sessions."

### Step 3: Define Strategic Themes
I'll group initiatives into 2-4 **themes** (strategic focus areas that bucket related work) that map to your company priorities, and allocate capacity percentage to each.

Themes should be:
- Outcome-oriented (not activity-oriented)
- Aligned to company OKRs (from company.md or goals.md)
- Distinct from each other

### Step 4: Structure Bets
For each theme, I'll define **bets** (initiatives treated as testable hypotheses with clear success/failure criteria):
- **Hypothesis:** If we do X, then Y will happen
- **Owner:** Who's accountable
- **Effort:** Person-weeks
- **Dependencies:** What must happen first
- **Kill Criteria:** When to stop or pivot
- **Success Metric:** How we'll know it worked

### Step 5: Plan Resource Allocation
Assign people to themes. Ensure:
- Total allocation = 100%
- Buffer for unplanned work (typically 10-20%)
- No individual over-allocated

### Step 6: Document What's NOT In Scope
List items explicitly NOT in this quarter with rationale.
This prevents scope creep and gives stakeholders clear answers.

### Step 7: Identify Dependencies and Risks
Document what could block the plan.

### Step 8: Set Milestones
Key dates and checkpoints throughout the quarter.

## Output Template

I'll generate this complete quarterly plan for you:

```markdown
# [Team] [Quarter] [Year] Quarterly Plan

## Context
*What I found in your files:*
- **Company priorities:** [From company.md]
- **Current roadmap:** [From product.md]
- **Team structure:** [From company.md]
- **OKRs:** [From goals.md if exists]

## Executive Summary
**Quarter:** [Q1/Q2/Q3/Q4 Year]
**Team:** [Headcount by function from company.md]
**Capacity:** [Total person-weeks available]

[2-3 sentence summary of the quarter's focus and key outcomes]

---

## Strategic Themes

*Why This Quarter = Business timing, market window, or dependency rationale*

| Theme | % Capacity | Company Priority | Why This Quarter |
|-------|------------|------------------|------------------|
| [Theme 1] | [%] | [From company.md] | [Business rationale] |
| [Theme 2] | [%] | [From company.md] | [Business rationale] |
| Unplanned/Buffer | 15% | — | Flexibility |

---

## Theme 1: [Name] ([%])

**Company OKR Alignment:** [Which company goal this supports — from goals.md or company.md]

### Bets

#### Bet 1.1: [Name]
- **Hypothesis:** If we [action], then [outcome]
- **Owner:** [Team/Person]
- **Effort:** [N] person-weeks
- **Dependencies:** [List]
- **Kill Criteria:** If [condition], then [action]
- **Success Metric:** [Measurable outcome — baseline from product.md if available]

### Resources
- [N] PM
- [N] Engineers
- [N] Designers

---

## What We Are NOT Doing

| Item | Why Not This Quarter | Stakeholder |
|------|---------------------|-------------|
| [Item from product.md Later section] | [Clear rationale] | [Who asked] |
| [Item] | [Rationale] | [Who asked] |

*These items are explicitly deferred. Revisit in Q[X+1] planning.*

---

## Dependencies

*Risk Level: H = High (blocks critical path), M = Medium (slows progress), L = Low (minor impact)*

| Dependency | Owner | Needed By | Risk Level | Status |
|------------|-------|-----------|------------|--------|
| [What] | [Who] | [When] | [H/M/L] | Pending/Confirmed |

---

## Milestones & Checkpoints

| Date | Milestone | Owner | Theme |
|------|-----------|-------|-------|
| [Date] | [Milestone] | [Owner] | [Theme] |

**Mid-quarter checkpoint:** [Date] — Review progress, adjust if needed

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| [Risk] | [H/M/L] | [H/M/L] | [Action] | [Who] |

---

## Success Metrics for [Quarter]

| Metric | Current | Target | Source |
|--------|---------|--------|--------|
| [Metric] | [From product.md] | [Target] | product.md |
| [Metric] | [Baseline] | [Target] | [Source] |

---

## Assumptions to Validate
- ⚠️ [Assumption about capacity, dependencies, etc.]

---

*After you review this plan, you can update your context files:*
- Update `product.md` roadmap with Q[X] plan
- Add quarterly OKRs to `goals.md`
```

## Framework Reference

This template combines several planning frameworks:
- **Theme-based planning:** Groups work into strategic buckets rather than feature lists
- **Bet thinking:** Treats initiatives as hypotheses with explicit success/failure criteria (from "Thinking in Bets" by Annie Duke)
- **Kill criteria:** Pre-defines when to stop, preventing sunk cost fallacy
- **NOT doing list:** Explicitly captures scope boundaries (from "Good Strategy Bad Strategy" by Rumelt)

## Tips for Best Results

1. **Keep context files updated** — I'll pull priorities, roadmap, and team structure from your files
2. **Start with company OKRs** — Themes should ladder up, not exist in isolation
3. **Be honest about capacity** — 80% of theoretical capacity is realistic
4. **Fewer bets, higher conviction** — 4-6 major bets per quarter, not 15
5. **Write kill criteria before starting** — Easier to pivot when you've pre-committed
