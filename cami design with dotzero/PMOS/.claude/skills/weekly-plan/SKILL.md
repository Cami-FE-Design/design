---
name: weekly-plan
description: 'Generate your weekly priorities aligned to quarterly goals with milestones and risk tracking. Use when: plan my week, weekly planning, weekly priorities, what to focus on this week, monday planning.'
category: planning
---

# Weekly Plan

Generate your weekly priorities aligned to quarterly goals with milestones and risk tracking.

## Output
Write the file to exactly this path:

  work/specs/outputs/weekly-plan-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Monday mornings (weekly planning ritual)
- After quarterly planning (break goals into weekly chunks)
- When roadmap priorities shift
- Before stakeholder check-ins to show progress

## The Problem

Most solo PMs jump week-to-week without a clear plan, reacting to whatever stakeholders ask for. By Friday, you've been busy but can't point to meaningful progress on what actually matters.

This skill generates a weekly plan in 10 minutes that connects your top 3-5 priorities to quarterly goals, identifies milestones, and flags risks—giving you a clear map for the week that you can point to when asked "what are you working on?"

## What You'll Get

A complete weekly plan with:
- Week's top priorities (3-5 max, aligned to quarterly goals)
- Major milestones and deliverable deadlines
- Meeting commitments with prep requirements
- Risks and blockers flagged upfront with mitigation plans
- Goal progress check (are we on track for quarterly targets?)

## What You'll Need

**Nothing required** — I'll generate a plan from your context.

**Helpful (from context files or provided):**
- Quarterly goals (from `context/goals.md`)
- Backlog priorities (from `context/backlog.md`)
- This week's meetings
- Known deadlines or milestones

## Process

### Step 1: I'll Read Your Context First
I'll start by checking your context files for:
- **goals.md** — Your quarterly focus, success metrics, and blockers
- **backlog.md** — Prioritized initiatives and tasks
- **product.md** — Current roadmap and key metrics
- **company.md** — Strategic priorities and team context

I'll tell you what I found so you know what I'm working with. For example:
> "I pulled your quarterly goals from goals.md: 'Win the Agency Vertical,' 'Expand AI Capabilities,' and 'Move Upmarket.' Your backlog shows Resource Planning v2, Client Portals, and SSO as top items. Current NRR is 115% (target 120%). I'll map this week's work to these goals and metrics."

*You don't need to do anything here — I'll read the files automatically.*

### Step 2: I'll Ask Only What's Missing
Based on what I find in your context files, I'll ask for:
- **Week of** — What week is this plan for?
- **Key meetings** — Any major meetings, reviews, or demos this week?
- **Known deadlines** — Hard dates this week?
- **Strategic shifts** — Anything changed from last week's plan?

If your context files are rich, I'll say:
> "Based on your goals and backlog, I have enough to draft this week's plan. I'll flag any assumptions about capacity or dependencies."

*Tip: Keep goals.md and backlog.md current. If you finished last week with context for this week, include it.*

### Step 3: Select Week's Top Priorities (3-5 Max)
I'll identify this week's priorities by:
1. Checking **goals.md** for quarterly targets and current progress
2. Pulling highest priority items from **backlog.md**
3. Factoring in deadlines, stakeholder commitments, and team capacity
4. Considering dependencies (what unblocks other work?)

**Important:** I'll limit to 3-5 priorities because that's realistic for one week. More than 5 = you're overcommitted.

**I won't invent priorities.** If your context is thin, I'll ask:
> "What are your top priorities for this week? Or share your quarterly goals and I'll help break them into weekly work."

### Step 4: Map Each Priority to Quarterly Goals
For every priority, I'll show the connection to quarterly goals:

**Priority 1: Ship Resource Planning v2 MVP**
- **Goal alignment:** Supports Q1 goal "Expand AI Capabilities"
- **Metric impact:** Should improve "PM admin time reduced" metric (KR: 50% reduction)
- **Strategic rationale:** Jordan (PM persona) cited resource conflicts as #1 pain point

This creates a clear thread: weekly work → quarterly goals → annual strategy.

### Step 5: Identify Milestones and Deliverables
For each priority, I'll break down:
- What ships this week (concrete deliverables)
- Major milestones with due dates
- Owner (you, engineering, design, stakeholder)

### Step 6: Map Major Meetings
I'll organize this week's meetings by:
- Purpose (alignment, decision, review, planning)
- Prep needed before the meeting
- Expected outcome or decision

### Step 7: Flag Risks and Blockers
I'll proactively identify:
- Dependencies on other teams or stakeholders
- Capacity constraints (too many priorities, not enough time)
- Known blockers from goals.md
- Risks that could derail the week

For each risk, I'll suggest mitigation.

### Step 8: Check Quarterly Goal Progress
I'll review your quarterly goals and assess:
- On track / At risk / Off track
- What needs to accelerate this week
- What can be deferred if capacity is tight

## Output Template

**I'll generate all of this for you.** You provide the week and meetings—I'll fill in priorities, map to goals, and flag risks.

Here's what you'll get:

```markdown
# Weekly Plan - Week of [Date]

## Context from Your Files
*What I pulled to build this plan:*
- **Quarterly goals:** [From goals.md]
- **Backlog priorities:** [From backlog.md]
- **Strategic focus:** [From company.md]
- **Current metrics:** [From product.md — baselines for progress tracking]

---

## This Week's Priorities

### 🎯 Priority 1: [Initiative/Deliverable]
- **Goal alignment:** [Which quarterly goal or OKR]
- **Deliverables:**
  - [ ] [Deliverable 1] — Due [Day]
  - [ ] [Deliverable 2] — Due [Day]
- **Owner:** [You / Team / Shared]
- **Blocked by:** [Dependencies, if any — or "None"]
- **Success looks like:** [Specific outcome by Friday]

### 🎯 Priority 2: [Initiative/Deliverable]
- **Goal alignment:** [Quarterly goal]
- **Deliverables:**
  - [ ] [Deliverable 1]
  - [ ] [Deliverable 2]
- **Owner:** [Who]
- **Blocked by:** [Dependencies or "None"]
- **Success looks like:** [Outcome]

### 🎯 Priority 3: [Initiative/Deliverable]
- **Goal alignment:** [Goal]
- **Deliverables:**
  - [ ] [Deliverable 1]
- **Owner:** [Who]
- **Blocked by:** [Dependencies or "None"]
- **Success looks like:** [Outcome]

*Continue for up to 5 priorities max*

---

## Key Milestones

| Milestone | Due | Owner | Status |
|-----------|-----|-------|--------|
| [Milestone 1] | [Day of week] | [Person/Team] | Not started / In progress / At risk |
| [Milestone 2] | [Day] | [Person] | Status |

---

## Major Meetings

| Day | Time | Meeting | Purpose | Prep Needed | Outcome Expected |
|-----|------|---------|---------|-------------|------------------|
| Mon | 2pm | [Name] | [Alignment / Decision / Review] | [What to prepare] | [What you need from meeting] |
| Wed | 10am | [Name] | [Purpose] | [Prep] | [Outcome] |
| Fri | 3pm | [Name] | [Purpose] | [Prep] | [Outcome] |

---

## Risks & Blockers

### ⚠️ [Risk 1]: [Description]
- **Impact:** High / Medium / Low
- **Likelihood:** High / Medium / Low
- **Mitigation:** [What you'll do to address]
- **Owner:** [Who's responsible for mitigation]
- **Status:** [Monitoring / Escalated / Resolved]

### ⚠️ [Risk 2]: [Description]
- **Impact:** [H/M/L]
- **Likelihood:** [H/M/L]
- **Mitigation:** [Plan]
- **Owner:** [Who]
- **Status:** [Status]

*If no major risks: "No critical blockers identified. Will monitor throughout week."*

---

## Quarterly Goal Progress Check

*Where we stand on Q[X] goals as of this week:*

### Goal 1: [Goal Name from goals.md]
- **Status:** 🟢 On track / 🟡 At risk / 🔴 Off track
- **Current:** [Metric current value]
- **Target:** [Metric target]
- **Gap:** [What's needed to get on track]
- **This week's impact:** [How this week's work moves this goal]

### Goal 2: [Goal Name]
- **Status:** [On track / At risk / Off track]
- **Current:** [Value]
- **Target:** [Value]
- **Gap:** [Gap analysis]
- **This week's impact:** [How work connects]

*Continue for all quarterly goals*

---

## Capacity Check

**Total priorities:** [N]
**Major meetings:** [N hours]
**Available focus time:** [~X hours after meetings]

⚠️ **Capacity flag:** [If overcommitted, note: "This week is tight—Priority X could slip to next week if [Risk] materializes."]

---

## What's NOT Happening This Week

*Explicit deprioritization (helps set expectations):*
- [Item from backlog] — Deferred to next week because [Priority 1-3 higher impact]
- [Request from stakeholder] — Pushed to [Date] due to capacity
- [Nice-to-have] — Not urgent, revisit in [Timeframe]

---

## Context for Next Week

**Carry forward:**
- [If Priority 2 doesn't finish] → Highest priority next week
- [Follow-up from Wednesday meeting] → Schedule follow-up for Monday

**Planning ahead:**
- [Milestone next week] → Need to prepare [Deliverable] by Thursday
- [Known capacity issue] → Plan lighter load next week

---

## Friday Reflection Prompts

*At end of week, review:*
- ✅ Did we ship all deliverables? (If not, what blocked us?)
- ✅ Did quarterly goals move forward measurably?
- ✅ Were risks mitigated or did they materialize?
- ✅ What surprised us this week that should inform next week's plan?

*Use this reflection to improve next Monday's planning.*
```

## How This Works

This skill combines proven planning frameworks:

**1. Quarterly Goals → Weekly Priorities (OKR Methodology)**
Every weekly priority connects to a quarterly goal. If a task doesn't support a goal, question why it's a priority.

**2. Outcome-Based Planning**
Weekly plans define success as "shipped X" not "worked on X." Clear deliverables = clear wins.

**3. Risk Management (Proactive vs. Reactive)**
Identifying risks Monday means you can mitigate them early, not scramble Thursday when they blow up.

**4. Capacity Reality Check**
If you have 40 hours and 30 hours of meetings, you don't have 40 hours for priorities. Plan accordingly.

## Tips for Best Results

1. **Run this every Monday morning** — Make it a 10-minute ritual to start the week with clarity
2. **Update goals.md after each week** — Add blockers discovered, update progress toward metrics
3. **Review quarterly goals mid-week** — Wednesday check: are we on track? Do we need to adjust?
4. **Share with stakeholders** — Send Friday to your manager/team so they know what you shipped
5. **Limit to 3-5 priorities max** — More = you're overcommitted. Defer ruthlessly.
6. **Be honest about risks** — If you're blocked on engineering bandwidth, flag it Monday, not Friday
7. **Track what moves goals** — If priorities don't move quarterly metrics, rethink the priorities
8. **Reflect on Fridays** — Use the reflection prompts to improve next week's plan
9. **Celebrate wins** — If you shipped all deliverables, note it. Momentum matters.
10. **Update backlog.md** — As priorities shift, keep backlog current so next week's plan is easier
