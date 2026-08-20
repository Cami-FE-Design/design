---
name: context-sync
description: 'Refresh your PM context with the latest from connected tools and set up session crons. Use when: sync context, refresh context, start my day, morning sync, what changed, update context, context refresh.'
model: sonnet
disable-model-invocation: true
---

# Context Sync

Pull the latest from your connected tools, update your context files, and set up session-long background syncs — so every skill you run today works with fresh data.

## When This Runs

- **Session start:** Run this first thing when you open Claude Code to catch up on what happened since your last session
- **On demand:** Any time you want a manual refresh ("sync my context")
- **Auto-suggested:** If a skill detects context files are stale (last updated 3+ days ago)

## Step 1: Detect Connected Tools

Scan the skills directory for tool integration skills. Each tool skill follows the naming pattern `[tool-name]/SKILL.md` and contains API configuration.

Check which of these exist:
- `.claude/skills/jira/` — Project management
- `.claude/skills/gong/` — Call recordings
- `.claude/skills/slack/` — Team communication
- `.claude/skills/salesforce/` — CRM
- `.claude/skills/posthog/` — Product analytics
- `.claude/skills/linear/` — Issue tracking
- `.claude/skills/notion/` — Documentation

Also check for:
- Granola MCP connection (meeting transcripts)
- `discovery/meetings/` for unfiled meeting notes
- `work/discovery/inputs/` for unprocessed raw data

Report which tools are connected and which are not. Only sync from connected tools.

## Step 2: Determine What's New

For each connected tool, check what's changed since the last sync.

Read the sync log at `.claude/state/context-sync-log.md`. It tracks:
```markdown
## Last Sync
- **Date:** 2026-03-17 09:15 AM
- **Sources synced:** Granola (3 meetings), Jira (12 updates), Gong (1 call)
- **Context files updated:** personas.md, product.md
```

If no sync log exists, create one and treat this as a first sync — pull the last 7 days of data.

## Step 3: Pull and Extract

For each connected tool with new data since last sync:

### Granola / Meeting Transcripts
1. Pull recent meetings via Granola MCP (or scan `discovery/meetings/` for new files)
2. For each new meeting, extract:
   - **Customer signals** → quotes, pain points, feature requests
   - **Competitor mentions** → what competitors were named, in what context
   - **Priority signals** → decisions made, direction changes, urgency shifts
   - **Product feedback** → what's working, what's not, specific complaints

### Jira / Linear (Project Management)
1. Pull items completed, created, or blocked since last sync
2. Extract:
   - **What shipped** → completed items with descriptions
   - **What's blocked** → blockers and their owners
   - **Scope changes** → new items added mid-sprint, items removed

### Gong (Call Recordings)
1. Pull call summaries since last sync
2. Extract:
   - **Customer language** → exact phrases customers use for their problems
   - **Objections** → what pushback came up
   - **Competitive mentions** → which competitors, in what context
   - **Win/loss signals** → buying signals or deal risk indicators

### Slack (Team Communication)
1. Pull from configured channels since last sync
2. Extract:
   - **Decisions made** → anything that changes priorities or direction
   - **Escalations** → customer issues, production incidents
   - **Requests** → stakeholder asks that affect the product

### PostHog (Product Analytics)
1. Pull key metric movements since last sync
2. Extract:
   - **Metric changes** → significant moves in tracked KPIs
   - **Funnel shifts** → conversion rate changes
   - **Feature adoption** → usage of recently shipped features

## Step 4: Update Context Files

For each insight extracted, route it to the correct context file and section.

### Routing Map

| Insight Type | Target File | Target Section |
|---|---|---|
| Customer quote / pain point | `context/personas.md` | `## Recent Customer Signals` |
| Competitor mention | `context/competitors.md` | `## Recent Competitive Intelligence` |
| Priority shift / decision | `context/goals.md` | `## Recent Priority Signals` |
| What shipped / blocked | `context/product.md` | `## Recent Product Updates` |
| Metric movement | `context/goals.md` | `## Recent Metric Signals` |
| Feature request | `context/product.md` | `## Recent Feature Requests` |

### Update Rules

**CRITICAL: Merge, never overwrite.**

1. Read the current context file
2. Find the target section (create it at the bottom of the file if it doesn't exist)
3. Look for the `<!-- auto-updated -->` marker — only edit within auto-updated sections
4. Append new insights below existing ones
5. Add source attribution to every insight: `— Source, Date`
6. Keep the last 30 days of auto-updated insights. Archive older ones to `work/discovery/inputs/context-archive.md`
7. Update the `<!-- auto-updated: YYYY-MM-DD -->` timestamp

### Auto-Updated Section Format

```markdown
## Recent Customer Signals
<!-- auto-updated: 2026-03-18 | sources: 2 Granola calls, 1 Gong transcript -->

- "We spend 2 hours before every sprint just getting alignment on priorities"
  — Sarah Chen, Head of Product at Acme Corp (2026-03-15, discovery call)

- 2/3 prospects this week mentioned Notion AI as their current workaround
  — Gong call analysis (2026-03-14, 2026-03-16)

- Feature request: ability to share context files across team members (3rd time heard)
  — Mike Torres, PM at CloudCo (2026-03-17, Granola meeting)
```

**Never touch sections without the `<!-- auto-updated -->` marker.** Those are human-curated.

## Step 5: Set Up Session Crons

After the initial refresh, set up recurring syncs for the session:

| Cron | Schedule | What it does |
|---|---|---|
| Meeting sync | Every 2 hours | Pull new Granola meetings, extract insights |
| Quick context check | Every 4 hours | Light check on Jira/Linear for new blockers |

Use `CronCreate` for each. These run while the session is active.

**Note to PM:** These crons stop when you close this session. Next time you open Claude Code, run context sync again to refresh and recreate them.

## Step 6: Summary Report

After syncing, present an **impact-ranked** summary. Read `context/goals.md` to understand active priorities, then rank every change by its relevance to those priorities.

```
Context Sync Complete — March 18, 2026

Since your last sync (March 15):

🎯 High impact (directly relates to active goals):
• Competitor Linear launched AI triage — directly competes with
  your Q2 priority "AI-powered ticket routing" (competitors.md)
• 2 enterprise prospects mentioned compliance requirements —
  validates your enterprise expansion goal (personas.md)

📋 Standard updates:
• 8 Jira items completed → product.md updated
• 3 new meetings processed → 2 customer signals added to personas.md

⚡ 2 items need your review:
  1. Customer quote contradicts current persona assumption
     about enterprise readiness (personas.md line 47)
  2. New competitor "Marvin" mentioned in 2 separate calls —
     not yet in competitors.md curated section

Session crons active: meeting sync (2h), context check (4h)
```

**Ranking logic:** Read goals.md for active priorities and success metrics. Any synced insight that relates to a current goal, blocks a goal, or validates/invalidates a goal assumption gets ranked as "High impact" with an explicit connection to the goal. Everything else goes under "Standard updates."

Focus the summary on what's **new and actionable** — not a rehash of everything that was synced.

## Configuration

### For Implementation Teams (mySecond services)

During customer implementation, configure this skill by:

1. Setting up tool skills (Jira, Gong, etc.) with API credentials
2. Creating the initial auto-updated sections in each context file
3. Configuring which Slack channels to monitor
4. Setting PostHog dashboard IDs for metric tracking
5. Running the first sync to establish the baseline

### For Self-Serve Users

If you don't have tool integrations set up:
- This skill still processes `work/discovery/meetings/` and `work/discovery/inputs/`
- Manually drop meeting notes, transcripts, or research into those folders
- Run the context sync skill to extract and route insights to context files
