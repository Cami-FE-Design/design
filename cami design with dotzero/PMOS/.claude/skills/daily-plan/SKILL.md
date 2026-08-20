---
name: daily-plan
description: 'Generate your daily plan aligned to goals and priorities with time-blocked focus areas. Use when: plan my day, daily planning, morning planning, what to focus on today, daily priorities.'
disable-model-invocation: true
category: planning
---

# Daily Plan

Generate your daily plan aligned to goals and priorities with time-blocked focus areas.

## Output
Write the file to exactly this path:

  work/specs/outputs/daily-plan-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Start of each workday (morning planning ritual)
- After getting pulled into urgent issues (reset priorities)
- When you have too many competing priorities
- Training yourself to focus on high-impact work

## The Problem

Most solo PMs start the day reactive—opening Slack, checking email, putting out fires. By 10am, the day is already fragmented with no time for deep work on what actually moves the needle.

This skill generates a daily plan in 5 minutes that aligns your top 3 priorities to quarterly goals, time-blocks your day for focus, and prepares you for meetings—giving you clarity before the chaos starts.

## What You'll Get

A complete daily plan with:
- Today's top 3 priorities (aligned to quarterly goals from goals.md)
- Time blocks optimized for energy (deep work morning, admin afternoon)
- Meeting prep requirements so you're ready
- Context to hand off to tomorrow's plan
- Clear rationale for "why these priorities today"

## What You'll Need

**Nothing required** — I'll generate a plan from your context.

**Helpful (from context files or provided):**
- Quarterly goals (from `context/goals.md`)
- Backlog priorities (from `context/backlog.md`)
- Today's meetings
- Urgent items or deadlines

## Process

### Step 1: I'll Read Your Context First
I'll start by checking your context files for:
- **goals.md** — Your quarterly focus and success metrics
- **backlog.md** — Prioritized initiatives and tasks
- **product.md** — Current roadmap and priorities
- **company.md** — Strategic priorities that should influence daily work

I'll tell you what I found so you know what I'm working with. For example:
> "I pulled your quarterly goals from goals.md: 'Win the Agency Vertical' and 'Expand AI Capabilities.' Your backlog shows Resource Planning v2 is highest priority. I'll make sure today's plan moves these forward."

*You don't need to do anything here — I'll read the files automatically.*

### Step 2: I'll Ask Only What's Missing
Based on what I find in your context files, I'll ask for:
- **Today's date** — What day is it?
- **Today's meetings** — Any scheduled meetings?
- **Urgent items** — Anything blocking or deadline-driven today?
- **Energy level** — Feeling focused or already fragmented?

If your context files have clear priorities, I'll say:
> "Based on your goals and backlog, I have enough to draft today's plan. I'll flag any assumptions about timing or capacity."

*Tip: The more you keep goals.md and backlog.md updated, the less I'll need to ask.*

### Step 3: Identify Today's Top 3 Priorities
I'll select today's top 3 priorities by:
1. Checking **goals.md** for quarterly focus areas
2. Checking **backlog.md** for highest priority items
3. Factoring in urgency (deadlines, blockers, stakeholder needs)
4. Considering energy level and meeting load

**I won't invent priorities.** If your context is thin, I'll ask:
> "What are your top 3 priorities for today? Or share your backlog and I'll help prioritize."

### Step 4: Map Priorities to Goals
For each priority, I'll connect it to a quarterly goal or strategic objective so you see the "why":

**Priority 1: Finalize Resource Planning PRD**
- **Why:** Supports Q1 goal "Expand AI Capabilities" and roadmap item "Resource Planning v2"
- **Alignment:** Jordan (PM persona) cited resource conflicts as top pain point

This creates a clear thread from daily work → quarterly goals → company strategy.

### Step 5: Time Block Your Day
I'll organize your day into time blocks optimized for:
- **Deep work** → Morning (08:00-12:00) for hard thinking
- **Meetings** → Mid-day blocks for collaboration
- **Admin/reactive** → Afternoon (16:00-17:00) for email, Slack, planning

**Energy management principle:** Front-load cognitively demanding work when you're fresh.

### Step 6: Identify Meeting Prep Needs
For each meeting today, I'll note:
- What to prepare beforehand
- What decisions need to be made
- Who you need input from

### Step 7: Capture Context for Tomorrow
I'll note what needs to carry over to tomorrow:
- Incomplete work from today
- Follow-ups from meetings
- New blockers or dependencies discovered

## Output Template

**I'll generate all of this for you.** You just provide the date and today's meetings—I'll fill in the structure, map to goals, and time-block your day.

Here's what you'll get:

```markdown
# Daily Plan - [Day of Week, Date]

## Context from Your Files
*What I pulled to build this plan:*
- **Quarterly goals:** [From goals.md]
- **Backlog priorities:** [From backlog.md]
- **Strategic focus:** [From company.md]
- **Current roadmap:** [From product.md]

---

## Today's Focus

🎯 **Priority 1:** [Task/Initiative]
   - **Why:** Supports [Goal/OKR from goals.md]
   - **Time block:** [When you'll work on this]
   - **Output:** [What you'll ship by end of day]
   - **Effort:** [Estimated time needed]

🎯 **Priority 2:** [Task/Initiative]
   - **Why:** [Alignment to goals or backlog]
   - **Time block:** [When]
   - **Output:** [Deliverable]
   - **Effort:** [Time estimate]

🎯 **Priority 3:** [Task/Initiative]
   - **Why:** [Alignment]
   - **Time block:** [When]
   - **Output:** [Deliverable]
   - **Effort:** [Time estimate]

---

## Schedule

**08:00-10:00** | 🧠 Deep Work: [Priority 1]
   - Focus area: [Specific task]
   - Goal: [What to complete in this block]

**10:00-10:30** | ☕ Break
   - Stretch, refill coffee, check Slack briefly

**10:30-12:00** | 🧠 Deep Work: [Priority 2]
   - Focus area: [Specific task]
   - Goal: [What to complete]

**12:00-13:00** | 🍱 Lunch
   - Disconnect from work

**13:00-14:00** | 📞 Meeting: [Meeting name]
   - **Purpose:** [What this meeting is about]
   - **Prep needed:** [What to prepare]
   - **Outcome:** [Decision or alignment needed]

**14:00-16:00** | ⚡ Focus: [Priority 3]
   - Focus area: [Task]
   - Goal: [What to complete]

**16:00-17:00** | 📧 Admin Block
   - Email catchup
   - Slack responses
   - Tomorrow planning
   - Backlog updates

---

## Meeting Prep

### [Meeting Name] (Time)
**Attendees:** [Who will be there]
**Purpose:** [What you're trying to accomplish]
**Your prep:**
- [ ] [Preparation item 1]
- [ ] [Preparation item 2]
**Questions to ask:**
- [Question 1]
**Decisions needed:**
- [Decision 1]

---

## Blockers & Dependencies
⚠️ [Current blocker]: [Mitigation plan or who to follow up with]

---

## Context for Tomorrow

**Carry over:**
- [Incomplete Priority 1 task] → Continue tomorrow morning
- [Follow-up from meeting] → Reach out to [Person]

**New inputs:**
- [Feedback received today] → Incorporate into [Initiative]
- [Blocker identified] → Escalate to [Stakeholder]

---

## Success Check
At end of day, ask yourself:
- ✅ Did Priority 1 move forward? (If not, what blocked it?)
- ✅ Are you prepared for tomorrow's meetings?
- ✅ Did you protect deep work time or get pulled reactive?

*Use this reflection to improve tomorrow's plan.*
```

## How This Works

This skill combines proven productivity principles:

**1. Top 3 Priorities (Greg McKeown, *Essentialism*)**
If everything is important, nothing is. Limiting to 3 priorities forces clarity on what truly matters today.

**2. Time Blocking (Cal Newport, *Deep Work*)**
Allocating specific time blocks for specific work protects focus from Slack/email interruptions.

**3. Energy Management (Not Time Management)**
Your brain is sharpest in the morning. Schedule hard thinking (PRDs, strategy) early, administrative work late.

**4. Alignment to Goals**
Every daily priority connects to a quarterly goal. If it doesn't support a goal, why are you doing it?

## Tips for Best Results

1. **Run this every morning** — Make it a 5-minute ritual before opening Slack
2. **Update goals.md regularly** — Keep quarterly priorities current so daily plans stay aligned
3. **Protect deep work blocks** — Close Slack, turn off notifications, tell team you're heads-down
4. **Review at end of day** — Use the success check to see what worked and adjust tomorrow
5. **Be realistic about meetings** — If you have 4 hours of meetings, you don't have 6 hours of focus time
6. **Carry context forward** — Use "Context for Tomorrow" section to prep next day's plan
7. **Flag when reactive** — If urgent issues derail your plan, note it. Pattern = need to delegate or say no more
