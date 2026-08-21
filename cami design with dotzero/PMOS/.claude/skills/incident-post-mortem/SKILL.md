---
name: incident-post-mortem
description: 'Writes a blameless incident post-mortem with root cause analysis Use when: incident post-mortem, write post-mortem, postmortem for, outage retrospective.'
disable-model-invocation: true
category: operations
---

# Incident Post-Mortem

Writes a blameless incident post-mortem with root cause analysis following the 5 Whys framework.

## Output
Write the file to exactly this path:

  work/specs/outputs/postmortem-[incident]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- After production incidents (P1/P2 outages)
- After security incidents
- After any event that impacted customers or required urgent response
- When you need to document what happened without blame

## What You'll Get

- Blameless post-mortem document with complete incident timeline
- 5 Whys root cause analysis to identify systemic causes
- Impact assessment linked to affected personas
- Action items with owners and priorities
- Lessons learned for future incident prevention

## What You'll Need

**Critical inputs (ask if not provided):**
- What happened (the incident description)
- When it happened (start/end times)
- Severity level (P1/P2/P3)

**Nice-to-have inputs:**
- Timeline of events
- Who was impacted and how
- What the team did to respond
- Known contributing factors

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand the incident context:
- `context/product.md` — Affected features, known issues, related past incidents
- `context/company.md` — Team structure, on-call procedures, escalation paths
- `context/personas.md` — Which users were most affected? How does this impact them?

I'll summarize what I found. For example:
> "I found 'Resource Planning' in your product.md — was this the affected feature? Your Jordan persona relies on this for 'daily capacity planning.' I'll quantify impact in terms of Jordan's workflow disruption."

### Step 2: Gather Incident Details
If you don't have enough information, ask:
> "Before I write this post-mortem, I need:
> 1. What happened? (Brief description)
> 2. When did it start and end?
> 3. What was the severity? (P1/P2/P3)
>
> I can pull affected feature context from product.md and impacted personas from personas.md."

**Do NOT generate a post-mortem without knowing what actually happened. Get the facts first.**

### Step 3: Gather Incident Details
Collect the basic facts: what broke, when, who was affected, and how it was detected.

### Step 2: Build the Timeline
Document the sequence of events from first signal to full resolution. Include times and who took what actions.

### Step 3: Apply 5 Whys Root Cause Analysis
Ask "why" iteratively to get from the symptom to the underlying root cause:
- Why did X happen? → Because Y
- Why did Y happen? → Because Z
- Continue until you reach a systemic cause (usually 5 levels)

### Step 4: Capture Learnings
Document what went well (things that helped) and what went poorly (things that made it worse or delayed resolution).

### Step 5: Generate Action Items
Create specific, actionable follow-ups with owners and due dates to prevent recurrence.

## Output Template

```markdown
# Post-Mortem: [Incident Title]

**Date:** [Incident date]
**Author:** [Your name]
**Status:** Draft | Final
**Severity:** P1 | P2 | P3

## Context
*What I found in your files:*
- **Affected feature:** [From product.md]
- **Impacted persona:** [From personas.md — who was affected most]
- **Team on-call:** [From company.md if documented]
- **Related past incidents:** [From product.md known issues]

---

## Executive Summary

**What happened:** [One-sentence description]

**Duration:** [Start time] to [End time] ([X hours/minutes])

**Impact:**
- [Number] customers affected
- [Impact description — downtime, data loss, etc.]
- [Business impact if applicable — revenue, reputation, etc.]

**Root cause:** [One-sentence root cause]

**Status:** Resolved | Mitigated | Ongoing

---

## Timeline

| Time | Event |
|------|-------|
| [HH:MM] | [First sign of issue detected] |
| [HH:MM] | [Escalation / team notified] |
| [HH:MM] | [Investigation started] |
| [HH:MM] | [Root cause identified] |
| [HH:MM] | [Fix deployed / rollback initiated] |
| [HH:MM] | [Full resolution confirmed] |

---

## Root Cause Analysis (5 Whys)

1. **Why did [the incident] happen?**
   → [Answer]

2. **Why did [Answer 1] happen?**
   → [Answer]

3. **Why did [Answer 2] happen?**
   → [Answer]

4. **Why did [Answer 3] happen?**
   → [Answer]

5. **Why did [Answer 4] happen?**
   → [Root cause — typically a process, system, or organizational gap]

**Root Cause Summary:** [One-paragraph explanation of the underlying issue]

---

## What Went Well

- [Thing that helped detect the issue quickly]
- [Thing that helped resolve the issue]
- [Effective communication, teamwork, or process that worked]

## What Went Poorly

- [Thing that delayed detection]
- [Thing that made resolution harder]
- [Process gap that contributed to the incident]

---

## Action Items

| Action | Owner | Due Date | Priority |
|--------|-------|----------|----------|
| [Specific action to prevent recurrence] | [Name] | [Date] | P1/P2/P3 |
| [Process improvement] | [Name] | [Date] | P1/P2/P3 |
| [Monitoring/alerting improvement] | [Name] | [Date] | P1/P2/P3 |

---

## Lessons Learned

1. **[Lesson 1]:** [What we learned and how we'll apply it]
2. **[Lesson 2]:** [What we learned and how we'll apply it]

---

## Follow-Up

**Review scheduled:** [Date for follow-up to verify action items completed]
**Post-mortem meeting:** [Date if applicable]

---

*This post-mortem follows a blameless culture. We focus on systems and processes, not individuals.*
```

## Framework Reference

This skill uses the **5 Whys** root cause analysis technique, developed by Sakichi Toyoda at Toyota. The method helps teams move beyond surface-level symptoms to identify systemic causes.

**Blameless post-mortem principles** (from Google SRE, Etsy, and other engineering cultures):
- Focus on systems, not people
- Assume everyone acted with good intentions and the best information available
- Identify process and tooling improvements
- Share learnings widely to prevent similar incidents

## Tips for Best Results

1. **Use your context files** — I'll connect impact to affected personas and features
2. **Write soon after resolution** — Memory fades quickly; capture details within 24-48 hours
3. **Include timestamps** — Specific times make the timeline useful for future reference
4. **Be honest about what went poorly** — The value is in learning, not looking good
5. **Assign real owners** — Action items without owners don't get done
6. **Schedule the follow-up** — Most post-mortems fail at the action item stage

## Suggested Updates
After the post-mortem:
- [ ] Add incident to known issues in `product.md`
- [ ] Update runbooks based on learnings
- [ ] Track action items to completion
