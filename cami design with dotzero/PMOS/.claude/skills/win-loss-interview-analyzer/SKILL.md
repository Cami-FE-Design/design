---
name: win-loss-interview-analyzer
description: 'Analyze win/loss interviews to uncover why deals close or slip away Use when: analyze win loss interview, win loss analysis, why did we win, why did we lose, competitive win loss.'
disable-model-invocation: true
category: competitive
---

# Win/Loss Interview Analyzer

Analyze win and loss interviews to uncover patterns, competitive insights, and actionable recommendations.

## Output
Write the file to exactly this path:

  work/discovery/outputs/win-loss-interview-[company]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- You've conducted win/loss interviews and need to extract themes
- You want to understand why deals close or slip away
- You need quarterly win/loss reporting for leadership
- You're refining competitive positioning based on real deal feedback

## What You'll Need

**Critical inputs:**
- Raw interview notes or transcripts (at least 3 wins + 3 losses preferred)
- Context on your product/company

**Optional (improves output):**
- Competitor names mentioned
- Deal size/segment information
- Time period covered

## Process

### Step 1: Gather Interview Data

Before starting, collect:
- Win interview notes (deals you closed)
- Loss interview notes (deals you lost to competitors or status quo)
- Any quantitative data (deal size, segment, competitor)

### Step 2: Provide Context

I'll ask you:
1. What interviews should I analyze? (paste notes or transcripts)
2. What product/company is this for? (brief context)

### Step 3: Analysis

I'll apply the **Pragmatic Institute Win/Loss Analysis Framework** (8 Rules):

1. **Focus on the buyer's journey** — What drove their decision?
2. **Identify decision criteria** — What factors mattered most?
3. **Understand perception vs reality** — How do buyers see you?
4. **Map competitive positioning** — Where do you win/lose against competitors?
5. **Uncover objections** — What creates friction or doubt?
6. **Find patterns** — Themes across multiple interviews
7. **Segment insights** — Do patterns vary by customer type?
8. **Drive action** — Translate insights into recommendations

## Output Template

```markdown
# Win/Loss Analysis Report
**Period:** [Time period]
**Interviews Analyzed:** [X wins, Y losses]

---

## Executive Summary
[3-4 sentence summary of key findings]

**Win Rate Context:** [If available]
**Primary Win Theme:** [Most common reason for wins]
**Primary Loss Theme:** [Most common reason for losses]

---

## Win Themes

### Theme 1: [Name]
**Frequency:** [X of Y wins]
**Buyer Quote:** "[Representative quote]"

**What this means:**
[Analysis of why this matters and what it reveals about your positioning]

### Theme 2: [Name]
[Repeat structure]

---

## Loss Themes

### Theme 1: [Name]
**Frequency:** [X of Y losses]
**Lost to:** [Competitor or "Status Quo"]
**Buyer Quote:** "[Representative quote]"

**What this means:**
[Analysis of the underlying issue and market perception]

### Theme 2: [Name]
[Repeat structure]

---

## Decision Criteria Analysis

What mattered most to buyers:

| Criterion | Wins | Losses | Insight |
|-----------|------|--------|---------|
| [e.g., Price] | [How you performed] | [How you performed] | [What this reveals] |
| [e.g., Features] | | | |
| [e.g., Trust/Brand] | | | |

---

## Competitive Intelligence

### vs. [Competitor 1]
**Head-to-head record:** [X wins, Y losses]

**Where you win:**
- [Specific advantage from interviews]
- [Specific advantage from interviews]

**Where you lose:**
- [Specific weakness from interviews]
- [Specific weakness from interviews]

**Buyer perception gap:**
[How buyers see you vs how you see yourself]

### vs. Status Quo
[Same structure for "no decision" losses]

---

## Buyer Perception Summary

### What buyers believe is true (even if it isn't):
1. [Perception from interviews]
2. [Perception from interviews]

### What buyers don't know (that you wish they did):
1. [Gap in awareness]
2. [Gap in awareness]

---

## Actionable Recommendations

### Immediate (This Quarter)
1. **[Action]** — [Why it matters based on interviews]
2. **[Action]** — [Why it matters based on interviews]

### Near-term (Next Quarter)
1. **[Action]** — [Strategic implication]
2. **[Action]** — [Strategic implication]

### Long-term (6-12 months)
1. **[Action]** — [Strategic opportunity]

---

## Key Quotes by Category

### Why Customers Chose You
> "[Quote 1]" — [Win interview]

> "[Quote 2]" — [Win interview]

### Why Customers Chose Competitors
> "[Quote 1]" — [Loss interview]

> "[Quote 2]" — [Loss interview]

### Surprising Insights
> "[Quote that reveals unexpected insight]"

---

## Appendix: Methodology

**Interviews analyzed:** [X wins, Y losses]
**Time period:** [Date range]
**Framework:** Pragmatic Institute Win/Loss Analysis (8 Rules)
**Segments included:** [If segmented by company size, industry, etc.]
```

## Framework Reference

This skill applies the **Pragmatic Institute Win/Loss Analysis Framework** from Pragmatic Marketing.

**The 8 Rules:**
1. Talk to buyers, not your sales team
2. Use a third party when possible (removes bias)
3. Interview within 90 days of decision
4. Ask open-ended questions
5. Focus on the buying process, not your product
6. Listen for perception, not just facts
7. Look for patterns across multiple interviews
8. Turn insights into action

**Learn more:** [Pragmatic Institute Win/Loss Analysis](https://www.pragmaticinstitute.com/product/framework/win-loss-analysis/)

**Credit:** Framework developed by Pragmatic Institute, a leading product management training organization.

## Tips for Best Results

1. **Provide raw transcripts** — Don't pre-summarize, let me find patterns
2. **Include both wins AND losses** — Contrast reveals the most insight
3. **Note competitor names** — Helps me analyze competitive positioning
4. **Share deal context** — Segment, size, industry (if relevant)
5. **Be honest about losses** — The goal is learning, not ego protection

## Edge Case Handling

**If you only have wins or only losses:**
I'll analyze what you have but flag that contrast is missing. The output will focus on themes within the available data.

**If interviews are thin or vague:**
I'll ask clarifying questions about what was discussed, or work with what's available and flag assumptions.

**If you don't have interviews yet:**
I'll provide a win/loss interview guide based on Pragmatic's methodology to help you conduct them first.
