---
name: app-review-analyzer
description: 'Extract themes, complaints, and feature requests from app store or SaaS reviews at scale. Use when: analyze app reviews, app store reviews, G2 reviews, Capterra reviews, review analysis.'
disable-model-invocation: true
category: discovery
---

# App Review Analyzer

Extract themes, complaints, and feature requests from app store or SaaS reviews at scale.

## Output
Write the file to exactly this path:

  work/analytics/outputs/app-reviews-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Analyzing iOS App Store or Google Play reviews
- Processing G2, Capterra, or TrustRadius reviews
- Preparing competitive research on a competitor's reviews
- Building a case for fixing specific issues

## What You'll Need

**Critical inputs (ask if not provided):**
- Reviews to analyze (paste them, or point to a file/URL)
- What app/product these are for

**Nice-to-have inputs:**
- Platform context (App Store, Play Store, G2, Capterra)
- Whether this is your product or a competitor

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/personas.md` — Who are the reviewers? Do they match your personas?
- `context/competitors.md` — If analyzing competitor, what do you know about them?
- `context/product.md` — Known issues that might appear in reviews

**Tell the user what you found.** For example:
> "I found your Jordan persona (PM) in personas.md. I'll flag reviews that mention Jordan-type pain points like 'project visibility' or 'status updates.' Your product.md mentions 'reporting' as a known issue — I'll track how often that appears."

### Step 2: Get the Reviews
**CRITICAL:** If the user hasn't provided reviews, ask:

> "I need reviews to analyze. Please share:
> 1. The reviews (paste them, or tell me where to find them)
> 2. What app/product these are for
> 3. What platform (App Store, Play Store, G2, Capterra, etc.)
>
> If this is for competitive research, let me know which competitor."

Do NOT generate placeholder output if review data is missing.

### Step 3: Ingest Reviews
Parse reviews from the provided data. Extract:
- Rating (stars/score)
- Review text
- Date (if available)
- Reviewer context (if available: role, company size, verified purchase)

### Step 4: Sentiment Analysis
Categorize each review by:
- **Sentiment:** Positive (4-5 stars) / Neutral (3 stars) / Negative (1-2 stars)
- **Primary theme:** What is the main topic?
- **Emotional intensity:** Mild frustration vs. strong anger/delight

### Step 5: Theme Extraction
Identify recurring themes across reviews:
- What do positive reviews praise most?
- What do negative reviews complain about most?
- What features are mentioned (positively or negatively)?

### Step 6: Feature Request & Bug Extraction
Parse explicit requests and issues:
- "I wish it had..." = feature request
- "It would be great if..." = feature request
- "Keeps crashing when..." = bug report
- "Doesn't work with..." = compatibility issue

### Step 7: Competitor Mentions
Note any mentions of alternative products:
- "Switched from [competitor]..."
- "Unlike [competitor], this..."
- "Considering [competitor] instead..."

## Output Template

```markdown
# App Review Analysis: [App Name] on [Platform]

**Source:** [Platform - e.g., iOS App Store, G2, Capterra]
**Reviews Analyzed:** [Count]
**Date Range:** [Earliest] - [Latest]
**Average Rating:** [X.X/5 stars]

## Context
*What I found in your files:*
- **Relevant persona:** [From personas.md — who are these reviewers?]
- **Known issues:** [From product.md — issues we'd expect to see]
- **Competitor context:** [From competitors.md if analyzing competitor]

## Sentiment Distribution

| Rating | Count | Percentage |
|--------|-------|------------|
| 5 stars | [N] | [%] |
| 4 stars | [N] | [%] |
| 3 stars | [N] | [%] |
| 2 stars | [N] | [%] |
| 1 star | [N] | [%] |

**Trend:** [Improving / Stable / Declining based on recent vs. older reviews]

## Top Positive Themes

### 1. [Theme Name] — [N] mentions
**What users love:**
> "[Representative positive quote]" — [Rating], [Date if available]

**Why it matters:** [Brief interpretation]

### 2. [Theme Name] — [N] mentions
[Same structure]

## Top Negative Themes

### 1. [Theme Name] — [N] mentions ([% of negative reviews])
**What users complain about:**
> "[Representative negative quote]" — [Rating], [Date]

**Severity:** [Critical/High/Medium] — [Why: affects core workflow, causes data loss, etc.]

### 2. [Theme Name] — [N] mentions
[Same structure]

## Feature Requests (by frequency)

| Request | Mentions | Representative Quote |
|---------|----------|---------------------|
| [Feature 1] | [N] | "[Short quote]" |
| [Feature 2] | [N] | "[Short quote]" |
| [Feature 3] | [N] | "[Short quote]" |

## Bug Reports

| Issue | Mentions | Severity | Quote |
|-------|----------|----------|-------|
| [Bug 1] | [N] | Critical | "[Quote]" |
| [Bug 2] | [N] | High | "[Quote]" |

## Competitor Mentions

| Competitor | Context | Quote |
|------------|---------|-------|
| [Competitor 1] | [Switching from / Comparing to] | "[Quote]" |
| [Competitor 2] | [Context] | "[Quote]" |

## Stakeholder-Ready Quotes

**For positive messaging (marketing, sales):**
> "[Strong positive quote with specific praise]" — [Source]

**For prioritization discussions (product, eng):**
> "[Quote showing user pain that supports a specific initiative]" — [Source]

**For competitive positioning:**
> "[Quote comparing to competitor favorably]" — [Source]

## Recommendations

1. **Immediate:** [Action to address critical issues]
2. **Short-term:** [Feature or fix based on frequency]
3. **Long-term:** [Strategic opportunity from patterns]
```

## Framework Reference

**Voice of Customer (VoC)** analysis adapted for review mining:
- Quantitative: Rating distribution and trends
- Qualitative: Theme extraction with quotes
- Actionable: Recommendations tied to patterns

## Tips for Best Results

1. **Use your context files** — I'll connect themes to your personas and known issues
2. **More reviews = better patterns** — 20 reviews shows themes, 100+ reveals reliable patterns
3. **Include ratings** — Sentiment without stars misses intensity
4. **Recent reviews matter more** — Old reviews may not reflect current product
5. **Segment if possible** — Enterprise vs. SMB, iOS vs. Android differ
6. **Don't ignore neutrals** — 3-star reviews often have the most actionable feedback

## Suggested Updates
After analysis:
- [ ] Add new feature requests to backlog
- [ ] Update `product.md` with newly discovered issues
- [ ] Update `competitors.md` if analyzing competitor reviews
