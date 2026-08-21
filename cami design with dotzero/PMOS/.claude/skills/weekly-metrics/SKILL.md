---
name: weekly-metrics
description: 'Pull live product metrics from PostHog and generate a PM-ready weekly review. Use when: weekly metrics, metrics review, product metrics, how are we doing, weekly numbers, posthog report, analytics review.'
allowed-tools:
  - mcp__posthog__query-run
  - mcp__posthog__event-definitions-list
  - mcp__posthog__properties-list
  - mcp__posthog__insights-get-all
  - mcp__posthog__dashboards-get-all
  - mcp__posthog__dashboard-get
  - mcp__posthog__insight-query
  - mcp__posthog__insight-create-from-query
  - mcp__posthog__dashboard-create
  - mcp__posthog__add-insight-to-dashboard
  - mcp__posthog__list-errors
disable-model-invocation: true
---

# Weekly Metrics Review

Pull live product metrics from your PostHog instance and generate a PM-ready weekly review — trends, anomalies, and what to do about them.

## Output

Save to `work/strategy/outputs/YYYY-MM-DD-HHmm/weekly-metrics.md` (use the current UTC timestamp; create a fresh run folder per invocation).

**Every artifact MUST start with this literal YAML frontmatter block. Copy verbatim — do not paraphrase. Replace bracketed placeholders only; do NOT add prose before the opening `---`.**

```yaml
---
id: [generate via the `ulid` npm package — NOT crypto.randomUUID()]
type: metrics-report
title: "[human-readable artifact title]"
created_at: [ISO-8601 UTC, e.g. 2026-04-27T20:30:00Z, from `new Date().toISOString()`]
skill: weekly-metrics
---
```

Optional fields you MAY emit when known: `product`, `work_area: strategy`, `created_by`, `derived_from` (paths consumed), `related`, `supersedes`, `tags`. See `.claude/state/frontmatter-schema.md` for the full schema.

## When to Use This Skill
- Monday morning: "How did we do last week?"
- Before a team standup or leadership sync
- After a launch — tracking early signals
- Anytime you need a quick pulse check on product health

## What You'll Get

A complete weekly metrics summary with:
- **Top-line numbers** — Key events, unique users, sessions (this week vs last week)
- **Funnel health** — Conversion rates at each step of your core flow
- **Anomaly flags** — Significant changes (up or down) that need attention
- **Error pulse** — New or spiking errors impacting users
- **Recommended actions** — What to investigate, celebrate, or fix

## What You'll Need

**Required:**
- PostHog MCP server connected (the skill uses it directly — no copy-pasting data)

**Helpful but optional:**
- `context/product.md` — So I know which metrics matter most to your product
- A specific funnel or feature to focus on (otherwise I'll cover the full picture)

## Process

### Step 1: Read Your Context

Check the user's context files if they exist:
- `context/product.md` — Current metrics, North Star, known issues
- `context/company.md` — Business goals, OKRs, what "good" looks like

Share what you found:
> "I found your North Star is [X] and you're tracking [Y] as a key activation metric. I'll focus the review around those."

If no context files exist, say:
> "I don't see context files, so I'll do a general metrics review. After this, I can help you set up product.md so future reviews are more focused."

### Step 2: Discover What's Being Tracked

Use the PostHog MCP to list event definitions:
- Pull the full event list to understand what's instrumented
- Identify the core product events (not just autocapture)
- Group them mentally: acquisition, activation, engagement, conversion, errors

Tell the user what you found:
> "You're tracking [N] custom events. Your core flow looks like: [event A] → [event B] → [event C]. I'll build the review around this."

### Step 3: Pull This Week vs Last Week

For each key event, run a trends query comparing the last 7 days to the prior 7 days:
- **Total event counts** (volume)
- **Unique users** (reach)
- **Daily trend** (trajectory — growing, flat, declining?)

Use `query-run` with TrendsQuery, `compareFilter: { compare: true }`, and `dateRange: { date_from: "-7d" }`.

Focus on custom events that represent real product usage — skip `$autocapture` and `$pageview` unless the user asks for traffic metrics specifically.

### Step 4: Check Core Funnel

If you identified a core conversion flow in Step 2, run a funnel query:
- Use `query-run` with FunnelsQuery
- Set a reasonable conversion window (14 days default)
- Calculate step-by-step conversion rates

Flag any step where conversion dropped significantly vs the prior period.

### Step 5: Check Errors

Use `list-errors` to pull recent errors:
- Sort by occurrences (most frequent first)
- Note any new errors (first_seen in the last 7 days)
- Flag errors with high user impact (many affected users/sessions)

### Step 6: Identify Anomalies

An anomaly is any metric that moved **more than 20% week-over-week** (up or down). For each anomaly:
- State the metric and the change
- Hypothesize why (launch? bug? seasonal? marketing campaign?)
- Recommend an action (investigate, celebrate, or fix)

### Step 7: Generate the Review

Compile everything into the output template below. Be opinionated — don't just report numbers, interpret them.

## Output Template

```markdown
# Weekly Metrics Review

**Period:** [Start date] – [End date]
**Compared to:** [Prior week dates]
**Data source:** PostHog (live query)

## Top-Line Summary

| Metric | This Week | Last Week | Change | Signal |
|--------|-----------|-----------|--------|--------|
| [Key event 1] | [N] | [N] | [+/- %] | [↑ ↓ →] |
| [Key event 2] | [N] | [N] | [+/- %] | [↑ ↓ →] |
| [Key event 3] | [N] | [N] | [+/- %] | [↑ ↓ →] |
| Unique users | [N] | [N] | [+/- %] | [↑ ↓ →] |

**One-line verdict:** [e.g., "Strong week — activation up 15%, but checkout conversion dropped. Worth investigating."]

## Funnel Health

**Core flow:** [Event A] → [Event B] → [Event C] → [Event D]

| Step | Users | Conversion | vs Last Week |
|------|-------|------------|--------------|
| [Step 1] | [N] | 100% | — |
| [Step 2] | [N] | [X%] | [+/- pp] |
| [Step 3] | [N] | [X%] | [+/- pp] |
| [Step 4] | [N] | [X%] | [+/- pp] |

**Overall conversion:** [X%] (last week: [Y%])

**Biggest drop-off:** [Step] at [X%] — [one-line hypothesis]

## Anomalies

[For each 20%+ change, one section:]

### [↑/↓] [Metric name]: [change %]
- **What happened:** [Description]
- **Likely cause:** [Hypothesis]
- **Action:** [Investigate / Celebrate / Fix]

## Error Pulse

| Error | Occurrences | Users Affected | First Seen | Status |
|-------|-------------|----------------|------------|--------|
| [Error 1] | [N] | [N] | [Date] | [New/Ongoing] |
| [Error 2] | [N] | [N] | [Date] | [New/Ongoing] |

**Action needed:** [Summary of what to look at]

## Recommended Actions

1. **Investigate:** [What needs digging into]
2. **Celebrate:** [What went well]
3. **Fix:** [What's broken or degrading]
4. **Watch:** [What to keep an eye on next week]
```

## Tips for Best Results

1. **Connect PostHog MCP first** — This skill queries PostHog directly. No MCP = no data.
2. **Set up context files** — `product.md` with your North Star and key metrics makes reviews 10x more focused
3. **Run it every Monday** — The real value is the trend over time, not any single week
4. **Use it before syncs** — Great prep for team standups, leadership updates, or board meetings
5. **Follow up on anomalies** — The review flags them, but you need to investigate

## After the Review

- [ ] Share the summary with your team
- [ ] Create tickets for any "Fix" items
- [ ] Update `product.md` if you learned something new about your metrics
- [ ] Schedule the anomaly investigations
