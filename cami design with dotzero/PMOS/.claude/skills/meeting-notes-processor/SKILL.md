---
name: meeting-notes-processor
description: 'Extract action items, decisions, and key points from meeting notes or transcripts. Use when: meeting notes, process notes, extract action items, meeting summary.'
disable-model-invocation: true
category: communication
---

# Meeting Notes Processor

Extract action items, decisions, and key points from meeting notes or transcripts.

## Output
Write the file to exactly this path:

  work/discovery/outputs/meeting-notes-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Processing notes right after a meeting
- Catching up on meetings you missed
- Creating accountability for follow-through

## What You'll Need

**Critical inputs (ask if not provided):**
- Meeting notes, transcript, or recording summary

**Nice-to-have inputs:**
- Attendee list (if not in notes)
- Meeting context (what was the purpose?)

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/company.md` — Team members, roles, who's responsible for what
- `context/product.md` — Current priorities, roadmap items being discussed

**Tell the user what you found.** For example:
> "I found your team structure in company.md — Sarah (Engineering), Mike (Design), you (PM). I'll assign action items to the right people. Your product.md shows 'Resource Planning v2' as the current focus, so I'll flag any decisions related to that."

### Step 2: Validate Input

**CRITICAL:** If the user hasn't provided meeting notes, ask:

> "I need meeting notes to process. Please share:
> 1. The notes, transcript, or recording summary (paste or point to the file)
> 2. Meeting date and attendees (if not in the notes)
>
> I can work with messy notes, AI transcripts, or shorthand — just get me the raw content."

Do NOT generate placeholder output if notes are missing.

### Step 3: Input Notes
Paste your raw notes in any format — messy is fine.

### Step 4: Extract Decisions
Identify clear decisions made:
- What was decided?
- Who made the decision?
- What's the scope?

### Step 5: Extract Action Items
For each action:
- What is the task?
- Who owns it?
- When is it due?

### Step 6: Apply Stranger Test
Would someone who wasn't in the meeting understand these notes?

### Step 7: Identify Follow-ups
What questions remain open?

## Output Template

```markdown
# Meeting Notes: [Meeting Name]

**Date:** [Date]
**Attendees:** [Names]
**Duration:** [Length]
**Note Taker:** [Name]

## Context
*What I found in your files:*
- **Team members:** [From company.md — who's who]
- **Current focus:** [From product.md — relevant projects/priorities]
- **Related decisions:** [Any past decisions that are relevant]

---

## Decisions Made

| # | Decision | Owner | Scope |
|---|----------|-------|-------|
| D1 | [Decision statement] | [Name] | [Context] |
| D2 | [Decision statement] | [Name] | [Context] |

---

## Action Items

| # | Task | Owner | Due | Status |
|---|------|-------|-----|--------|
| A1 | [Specific task] | [Name] | [Date] | ⬜ |
| A2 | [Specific task] | [Name] | [Date] | ⬜ |
| A3 | [Specific task] | [Name] | [Date] | ⬜ |

---

## Key Discussion Points

### [Topic 1]
- [Point 1]
- [Point 2]
- **Conclusion:** [What was concluded]

### [Topic 2]
- [Point 1]
- **Open Question:** [What remains unresolved]

---

## Open Questions
- [ ] [Question 1] — Owner: [Name]
- [ ] [Question 2] — Owner: [Name]

---

## Parking Lot (Deferred Topics)
- [Topic 1] — Revisit: [When]

---

## Next Meeting
**Date:** [Date]
**Suggested Agenda:**
1. [Item 1]
2. [Item 2]
3. Review action items from this meeting
```

## Framework Reference
**Structured meeting documentation**:
- Decisions and actions are explicit and assigned
- "Stranger Test" ensures clarity
- Follow-up is built in

## Tips for Best Results

1. **Use your context files** — I'll assign action items to the right team members
2. **Assign every action item** — Unowned tasks don't get done
3. **Be specific on due dates** — "Soon" isn't a deadline
4. **Capture the "why"** — Decisions without context are hard to revisit
5. **Note disagreements** — Who pushed back and why matters
6. **Test with a stranger** — Would someone who missed the meeting understand?

## Suggested Updates
After processing notes:
- [ ] Save major decisions to `decisions/` folder
- [ ] Update `product.md` if roadmap decisions were made
- [ ] Add action items to your task management system
