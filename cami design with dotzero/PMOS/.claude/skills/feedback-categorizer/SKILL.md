---
name: feedback-categorizer
description: 'Organize and analyze customer feedback from multiple channels into categorized, prioritized insights. Use when: categorize feedback, feedback analysis, feedback themes, sort feedback.'
disable-model-invocation: true
category: discovery
---

# Feedback Categorizer

Organize and analyze customer feedback from multiple channels into categorized, prioritized insights.

## Output
Write the file to exactly this path:

  work/analytics/outputs/feedback-categories-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Monthly feedback reviews
- Building evidence for a feature you want to prioritize
- Preparing customer insights for exec reviews

## What You'll Need
- Raw feedback from any channel (support, NPS, reviews, sales notes)
- Context on what you're looking to learn (optional)

## Process

### Step 1: Check Your Context
First, read the user's context files to understand existing knowledge:
- `context/personas.md` — Can we segment feedback by persona?
- `context/product.md` — What are known issues? Does feedback confirm them?
- `context/competitors.md` — Any competitive mentions to flag?
- Prior feedback analyses — Are there trends over time?

**Tell the user what you found.** For example:
> "I found 3 personas in your files. I'll tag feedback by persona when identifiable. I also see 'reporting is too basic' is a known issue in product.md — I'll flag if this comes up in the feedback."

### Step 2: Input Feedback Data
**CRITICAL:** If the user hasn't provided feedback data, ask:
> "I need feedback to analyze. Please share:
> 1. The raw feedback (paste it, or point me to the file)
> 2. What time period this covers
> 3. What channels it's from (support, NPS, reviews, etc.)
>
> I can analyze support tickets, NPS comments, app reviews, G2/Capterra reviews, sales notes, or any mix."

**Do NOT generate placeholder output if feedback data is missing.**

### Step 3: Automatic Categorization
Feedback is tagged by:
- **Theme:** What topic is this about?
- **Sentiment:** Positive / Negative / Neutral
- **Urgency:** Blocking / Frustrating / Nice-to-have
- **User Type:** Persona if identifiable
- **Related to known issues:** From product.md

### Step 4: Pattern Detection
Analysis reveals:
- Most frequent themes
- Sentiment trends
- Urgent issues requiring attention
- Positive patterns to amplify
- Connections to existing knowledge

### Step 5: Impact Scoring
Each theme is scored by:
- Frequency (how often mentioned)
- Severity (how painful)
- User value (which personas affected)

## Output Template

```markdown
# Feedback Analysis: [Time Period/Topic]

**Date Range:** [Start] - [End]
**Analysis Method:** Thematic coding with sentiment + urgency tagging

## Context
*What I found in your files:*
- **Personas for segmentation:** [From personas.md]
- **Known product issues:** [From product.md]
- **Prior feedback analyses:** [Any previous analyses to compare]

## Sources Analyzed
| Source | Count | Channel |
|--------|-------|---------|
| [Source 1] | [N] | Support tickets |
| [Source 2] | [N] | NPS comments |
| [Source 3] | [N] | App reviews |

**Total Items:** [Count]

## Executive Summary
[2-3 sentence overview of key findings]

## Theme Breakdown

| Theme | Count | Sentiment | Urgency | Impact Score | Known Issue? |
|-------|-------|-----------|---------|--------------|--------------|
| [Theme 1] | [N] | Negative | High | 9/10 | ✅ Yes (product.md) |
| [Theme 2] | [N] | Mixed | Medium | 7/10 | ❌ New |
| [Theme 3] | [N] | Positive | Low | 5/10 | — |

## Top Themes Detail

### Theme 1: [Name]
**Frequency:** [N] mentions ([%] of total)
**Sentiment:** [Breakdown]
**Urgency:** [Level]
**Known issue:** [Yes/No — reference product.md if yes]

**By Persona:** (if identifiable)
| Persona | Mentions | Sentiment |
|---------|----------|-----------|
| [Jordan] | [N] | Negative |
| [Alex] | [N] | Mixed |

**Representative Quotes:**
> "[Quote 1]" — [Source], [User type if known]
> "[Quote 2]" — [Source], [User type]

**Pattern:** [What's driving this feedback]
**Recommendation:** [What to do about it]

### Theme 2: [Name]
[Same structure]

## Sentiment Overview
- Positive: [N] ([%])
- Neutral: [N] ([%])
- Negative: [N] ([%])

**Trend vs. prior analysis:** [Better/Worse/Stable — if prior data exists]

## Urgent Issues (Requires Attention)
1. [Issue] — [N] mentions, blocking users
2. [Issue] — [N] mentions, causing churn risk

## Positive Patterns (Amplify)
1. [What users love] — [N] mentions
2. [What's working] — [N] mentions

## New Issues (Not in product.md)
*Feedback about problems not currently documented:*
- [Issue] — [N] mentions — Consider adding to product.md

## Competitive Mentions
*References to competitors in feedback:*
| Competitor | Mentions | Context |
|------------|----------|---------|
| [Competitor] | [N] | [What users said] |

## Recommendations
1. [Priority action]
2. [Secondary action]
3. [Monitor/watch]

## Suggested Updates to Context Files
- [ ] Add new issue "[X]" to product.md known issues
- [ ] Update personas with feedback patterns
- [ ] Flag competitive mentions in competitors.md
```

## Framework Reference

**Voice of Customer (VoC)** analysis with thematic coding:
- Systematic categorization reduces bias
- Frequency + severity = impact
- Quotes preserve user voice

## Tips for Best Results
1. **Keep context files updated** — I'll connect feedback to what you already know
2. **Don't cherry-pick** — Include all feedback, not just what supports your view
3. **Watch for vocal minorities** — 10 loud users ≠ 1000 quiet ones
4. **Track over time** — Run this monthly to see trends
