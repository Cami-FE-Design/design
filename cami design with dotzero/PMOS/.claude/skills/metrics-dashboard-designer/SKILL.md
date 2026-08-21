---
name: metrics-dashboard-designer
description: 'Design metrics dashboards with the right metrics for the right audience. Use when: metrics dashboard, dashboard design, executive dashboard, product dashboard.'
disable-model-invocation: true
category: data
---

# Metrics Dashboard Designer

Design metrics dashboards with the right metrics for the right audience — avoiding the "47 charts nobody looks at" problem.

## Output
Write the file to exactly this path:

  work/analytics/outputs/dashboard-spec-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Creating new dashboards for specific audiences
- Redesigning cluttered or unused dashboards
- Aligning teams on what to track and review

## What You'll Need

**Critical inputs (ask if not provided):**
- Who will use this dashboard (audience)
- What decisions they need to make

**Nice-to-have inputs:**
- Available data sources
- Existing dashboards to improve/replace
- Key questions the audience has

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Current metrics, metric definitions, data sources
- `context/company.md` — Team structure, roles, reporting cadence
- `context/personas.md` — If user-facing dashboard, who are the users?

**Tell the user what you found.** For example:
> "I found your key metrics in product.md: Activation Rate (45%), Monthly Retention (91%), NPS (42). Your company.md shows you review metrics weekly with leadership. I'll design a dashboard that answers the questions your leadership team needs."

### Step 2: Gather Dashboard Context
If you don't have enough context, ask:
> "Before I design this dashboard, I need:
> 1. Who's the audience? (execs, product team, growth team, etc.)
> 2. What decisions do they need to make?
>
> I can pull existing metric definitions from product.md."

### Step 3: Define Audience and Purpose
Who is this dashboard for, and what decisions will they make?

| Audience | Purpose | Review Frequency |
|----------|---------|------------------|
| Exec/Board | Business health, trajectory | Monthly/Quarterly |
| Product team | Feature health, user behavior | Weekly |
| Growth team | Funnel, experiments, channels | Daily/Weekly |
| CS team | Customer health, risk signals | Daily |

### Step 4: Identify Key Questions
What 3-5 questions does this audience need answered?
- "Are we on track for our goals?"
- "Where are users struggling?"
- "Which experiments are winning?"

### Step 5: Select Metrics
For each question, identify:
- **Primary metric** — The main answer to the question
- **Supporting metrics** — Context and breakdowns
- **Definition** — Exactly how it's calculated
- **Target** — What good looks like

**Rule of thumb:** 5-8 primary metrics per dashboard. More = nobody looks.

### Step 6: Design Layout
Structure the dashboard for scannability:
- **Top row:** Health summary (is everything OK?)
- **Middle:** Primary metrics with trends
- **Bottom:** Drill-downs and segments

### Step 7: Configure Alerts
What should trigger action?
- Define thresholds for each metric
- Specify who gets notified
- Include context in alert message

## Output Template

```markdown
# Dashboard Design: [Name]

**Audience:** [Who uses this]
**Purpose:** [What decisions it enables]
**Review Cadence:** [How often]
**Data Sources:** [Where metrics come from]

## Context
*What I found in your files:*
- **Current metrics:** [From product.md]
- **Team structure:** [From company.md — who reviews what]
- **Reporting cadence:** [From company.md]

## Key Questions

1. [Question 1]
2. [Question 2]
3. [Question 3]

## Dashboard Layout

### Row 1: Health Summary
| Indicator | Metric | Status Thresholds |
|-----------|--------|-------------------|
| [Name] | [Value] | Green: [X], Yellow: [Y], Red: [Z] |

### Row 2: Primary Metrics

| Metric | Definition | Target | Trend |
|--------|------------|--------|-------|
| [Metric 1] | [Calculation] | [Target] | [Sparkline] |
| [Metric 2] | [Calculation] | [Target] | [Sparkline] |

### Row 3: Drill-Downs

**[Metric 1] by [Dimension]**
| Segment | Value | vs Target |
|---------|-------|-----------|
| [Segment A] | [X] | [+/-]% |

## Filters Available
- Date range: [Options]
- Segment: [Options]
- [Other filters]

## Alert Configuration

| Metric | Threshold | Recipients | Message |
|--------|-----------|------------|---------|
| [Metric] | [Condition] | [Who] | [What to include] |

## Implementation Notes
- **Data refresh:** [Frequency]
- **Tool:** [Dashboard platform]
- **Owner:** [Who maintains]
```

## Framework Reference
**Dashboard design principles:**
- Dashboards answer questions, not display data
- Less is more — ruthlessly cut nice-to-haves
- Every metric needs a "so what?" action
- Alerts prevent "looking at dashboards" becoming a job

## Tips for Best Results

1. **Use your context files** — I'll incorporate existing metric definitions and targets
2. **Audience determines content** — Execs want different things than product teams
3. **5-8 metrics max** — More than that, nobody looks at any of them
4. **Define thresholds** — Green/yellow/red enables quick scanning
5. **Set alerts** — Dashboards shouldn't require daily checking

## Suggested Updates
After designing:
- [ ] Document metric definitions in `product.md`
- [ ] Set up dashboard in your analytics tool
- [ ] Configure alerts for key thresholds
