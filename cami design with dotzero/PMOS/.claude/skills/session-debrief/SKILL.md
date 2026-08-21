---
name: session-debrief
description: "Review your working session and propose context updates so your PM OS gets smarter over time. Use when: session debrief, end of session, what did I learn, update context, session review, debrief."
model: sonnet
disable-model-invocation: true
category: cc
---

# Session Debrief

A 5-minute end-of-session review that turns today's work into lasting knowledge. Your PM OS learns what works for your team — every session makes the next one smarter.

## When to Use

- End of a working session (before closing Claude Code)
- After a productive session where you learned something new
- When skills produced outputs that revealed gaps in context
- Weekly habit: Friday debrief to capture the week's learning

## Step 1: Review Session Activity

Read the session's activity:
- Check recent files in output folders (`work/discovery/outputs/`, `work/strategy/outputs/`, `work/specs/outputs/`, `work/launches/outputs/`) for files created or modified today — output files are named `<name>-<YYYY-MM-DD>.md`, so today's work carries today's date in the filename
- Check `.claude/napkin.md` for corrections made this session
- Check `git log --oneline --since="8 hours ago"` for what changed
- Note which skills were run (look for skill output headers in recent files)

Present a brief summary:

```
Session Review — [Date]

Skills used: /prd-generator, /competitive-profile-builder, /weekly-plan
Outputs created: 3 files (work/specs/outputs/prd-checkout-2026-04-27.md, work/strategy/outputs/competitive-intel-report-2026-04-27.md)
Corrections logged: 1 (napkin.md)
```

## Step 2: Three Debrief Questions

Ask the user three questions (they can skip any):

1. **What worked?** "Did any skill output surprise you positively? What made it good?"
   — Captures what to keep doing, reinforces effective patterns

2. **What didn't work?** "Did any output miss the mark? What was wrong or missing?"
   — Captures gaps, surfaces what context is missing or stale

3. **What did you learn?** "Any new insight about your product, users, market, or team?"
   — Captures new knowledge, the raw material for context updates

Keep it conversational. If user gives short answers, that's fine. If they skip all three, check napkin.md for corrections and propose updates based on those alone.

## Step 3: Propose Context Updates

Based on the user's answers AND session activity, propose specific edits to context files.

**Format each proposal as:**

```
Proposed update to [file]:

Section: [section name]
Change: [what to add/modify]
Source: session debrief, [date]
Why: [how this improves future skill outputs]

Apply? (yes/skip)
```

**What to propose:**

| Insight Type | Target File | Example |
|---|---|---|
| New persona insight | `context/personas.md` | New frustration, behavior, quote |
| Competitive discovery | `context/competitors.md` | New competitor, feature gap, positioning shift |
| Product learning | `context/product.md` | Metrics update, roadmap change, known issue |
| Goal adjustment | `context/goals.md` | Priority shift, metric update, new "not doing" |
| Company context | `context/company.md` | Market shift, business model insight |

**Rules for proposals:**

1. Maximum 5 proposals per debrief — focus on highest-impact
2. Each proposal must trace to something the user said or a session artifact
3. Never propose removing content — only additions or refinements
4. Use the `<!-- auto-updated: YYYY-MM-DD | source: session-debrief -->` marker for new sections
5. Preserve existing content and human-curated sections (no `<!-- auto-updated -->` marker = don't touch)
6. Flag contradictions — if a new insight conflicts with existing content, surface both and ask the user which is accurate

## Step 4: Apply and Summarize

For each approved proposal:

1. Read the current context file
2. Find the target section (or create at bottom if new)
3. Apply the edit with source attribution
4. Update `context/INDEX.md` last-enriched note if it exists

Present final summary:

```
Debrief Complete — [Date]

Applied:
- Added enterprise onboarding pain point to personas.md
- Updated product.md with new activation metric
- Skipped: competitor positioning (user wants to validate first)

Your context files are now fresher. Next session, skills that
reference personas and product will use this new information.

Tip: Run /enhance-context monthly to process docs in your input folders.
```

## What This Does NOT Do

- Does NOT run automatically (it's user-triggered, not a hook)
- Does NOT overwrite human-curated sections
- Does NOT store session logs or transcripts
- Does NOT require specific tools or integrations — works with just context files

## Tips for Best Results

1. **Run it before closing Claude Code** — insights are freshest right after the session
2. **Short answers are fine** — even "personas felt off" gives a signal to work with
3. **Skip questions freely** — the skill checks napkin.md and session artifacts regardless
4. **Stack with /context-sync** — run context-sync at session start, session-debrief at session end
