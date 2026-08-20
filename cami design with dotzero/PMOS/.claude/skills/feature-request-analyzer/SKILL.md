---
name: feature-request-analyzer
description: 'Turn scattered feature requests into a prioritized list based on actual demand and business impact. Use when: analyze feature requests, prioritize features, feature backlog, request analysis.'
disable-model-invocation: true
category: discovery
---

# Feature Request Analyzer

Turn scattered feature requests into a prioritized list based on actual demand and business impact.

## Output
Write the file to exactly this path:

  work/discovery/outputs/feature-requests-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Quarterly planning to decide what to build next
- Evaluating a specific feature area for investment
- Building a case for (or against) a requested feature
- Cleaning up a messy backlog

## What You'll Need

**Critical inputs (ask if not provided):**
- Feature requests to analyze (from any source)
- Customer context if available (company size, plan tier, revenue)

**Nice-to-have inputs:**
- Lost deal data citing specific features
- Current roadmap to check alignment

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Current roadmap, known issues, feature gaps
- `context/personas.md` — Who's requesting? Which persona do they match?
- `context/company.md` — Strategic priorities to assess alignment
- `context/competitors.md` — Do competitors have these features?

**Tell the user what you found.** For example:
> "I found your roadmap in product.md — 'Advanced Reporting' is already planned. I'll flag requests that align with this vs. net-new asks. Your Alex persona (agency owner) cares about profitability visibility — I'll weight requests from Alex-type users higher."

### Step 2: Get the Request Data
**CRITICAL:** If the user hasn't provided feature request data, ask:

> "I need feature requests to analyze. Please share:
> 1. The requests (paste them, or point me to the file)
> 2. Any customer context (who requested what, their plan/size if known)
>
> I can work with raw lists, support exports, or CRM data."

Do NOT generate placeholder output if request data is missing.

### Step 3: Aggregate & Deduplicate
Parse requests and identify duplicates:
- "Add SSO" and "Need SAML authentication" = same request
- "Dark mode" mentioned by 8 users = 1 request, 8 mentions
- Preserve original language for quotes

### Step 4: Categorize Requests
Group by theme:
- Feature area (UI, integrations, reporting, etc.)
- User need (workflow efficiency, visibility, compliance, etc.)
- Size (small enhancement vs. major feature)

### Step 5: Score by Impact
For each request, assess:
- **Frequency:** How many users/accounts requested this?
- **Revenue weight:** Are high-value customers asking?
- **Strategic fit:** Does this align with company direction?
- **Competitive:** Are we losing deals over this?

### Step 6: Segment Analysis
Break down by:
- Customer tier (Enterprise vs. SMB)
- User role (Admin, PM, Individual contributor)
- Customer status (Prospect, Active, Churned)

### Step 7: Trend Detection
Identify:
- Rising requests (mentioned more recently)
- Declining requests (mentioned in past, not now)
- Sudden spikes (single event caused many requests)

## Output Template

```markdown
# Feature Request Analysis

**Source:** [List sources]
**Requests Analyzed:** [Total count]
**Unique Requests:** [Deduplicated count]
**Date Range:** [Period covered]

## Context
*What I found in your files:*
- **Roadmap alignment:** [From product.md — which requests match planned work]
- **Persona mapping:** [From personas.md — who's asking for what]
- **Strategic fit:** [From company.md — priority alignment]
- **Competitive gaps:** [From competitors.md — competitor feature parity]

## Executive Summary
[2-3 sentences: What are users asking for most? What should we build?]

## Top 10 Requests (by Impact Score)

| Rank | Request | Mentions | Revenue Impact | Lost Deals | Score |
|------|---------|----------|----------------|------------|-------|
| 1 | [Request] | [N] | [$X ARR] | [Y] | [9/10] |
| 2 | [Request] | [N] | [$X ARR] | [Y] | [8/10] |
| ... | ... | ... | ... | ... | ... |

## Request Details

### #1: [Request Name]
**Mentions:** [N] customers, [Y] total mentions
**First requested:** [Date] | **Most recent:** [Date]
**Trend:** Rising / Stable / Declining

**Who's asking:**
- Enterprise: [N] | SMB: [N]
- Plan tier breakdown: [details]
- Notable accounts: [List if any large/strategic customers]

**Lost deals citing this:** [N] — [$X potential ARR]

**Representative quotes:**
> "[Quote 1]" — [Customer context]
> "[Quote 2]" — [Customer context]

**Effort estimate:** [S/M/L] — [Brief rationale]
**Recommendation:** [Build / Monitor / Decline + why]

### #2: [Request Name]
[Same structure]

## Segment Analysis

### By Customer Tier
| Tier | Top Request | 2nd Request | 3rd Request |
|------|-------------|-------------|-------------|
| Enterprise | [Request] | [Request] | [Request] |
| SMB | [Request] | [Request] | [Request] |
| Prospect | [Request] | [Request] | [Request] |

### By User Role
| Role | Top Request | Notes |
|------|-------------|-------|
| Admin/Owner | [Request] | [Why] |
| Manager/PM | [Request] | [Why] |
| Individual | [Request] | [Why] |

## Trends

**Rising Requests (increasing over time):**
1. [Request] — [Why: new competitor feature, market shift, etc.]
2. [Request] — [Why]

**Declining Requests (less mentions recently):**
1. [Request] — [Why: we shipped it, market moved on, etc.]

**One-time Spikes (ignore as pattern):**
1. [Request] — [Caused by: single blog post, competitor news, etc.]

## Strategic Assessment

### Build Soon (High impact, aligns with strategy)
1. [Request] — [Rationale]
2. [Request] — [Rationale]

### Monitor (Valuable but timing not right)
1. [Request] — [What would change our mind]

### Decline (Low impact or doesn't fit)
1. [Request] — [Why we're saying no]

## Data Quality Notes
- [Any caveats: missing customer context, biased sample, etc.]
```

## Framework Reference

**Demand-weighted prioritization:**
- Frequency alone misleads (10 small customers ≠ 1 enterprise customer)
- Revenue weight balances the voice of high-value customers
- Lost deal analysis reveals true blockers
- Trend analysis prevents building for yesterday's problems

## Tips for Best Results

1. **Use your context files** — I'll connect requests to personas, roadmap, and competitors
2. **Include customer context** — Revenue/tier data dramatically improves analysis
3. **Note lost deals separately** — These deserve special attention
4. **Watch for vocal minorities** — 5 requests from 1 customer ≠ demand
5. **Recent > old** — Weight recent requests higher than year-old ones
6. **Check your assumptions** — A "small" request may be a big lift

## Suggested Updates
After analysis:
- [ ] Add high-priority requests to backlog in `product.md`
- [ ] Update competitor feature comparisons in `competitors.md`
- [ ] Share "Build Soon" recommendations with leadership
