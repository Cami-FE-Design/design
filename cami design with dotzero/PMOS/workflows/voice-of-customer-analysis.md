---
description: 'Synthesize raw customer feedback (interviews, support tickets, reviews) into a Voice of Customer report. Use when: VoC analysis, voice of customer, synthesize feedback.'
---

**Workflow Pack:** Voice of Customer Analysis
**Tagline:** "All your feedback. One report. 30 minutes."
**Framework:** VoC Synthesis, Theme Extraction, Atomic Research

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to understand their product:

1. `/context/product.md` — Product features, target users
2. `/context/company.md` — Business model, strategic priorities

### Step 1: Identify Available VoC Sources

Ask the user which VoC sources they have:

> "Which Voice of Customer sources do you want me to analyze? (Select at least 2)
>
> - ✅ Support tickets (exported CSV or pasted text)
> - ✅ NPS/CSAT comments
> - ✅ Sales call notes or transcripts
> - ✅ Community posts (Reddit, forums, Slack)
> - ✅ App store reviews (iOS, Android, Chrome)
> - ✅ Social media mentions (Twitter, LinkedIn)
> - ✅ User feedback forms
>
> Let me know which sources you have, and I'll analyze them in parallel."

**If user has only 1 source:**
> "VoC analysis works best with 2+ sources to identify cross-source themes. Do you have any other feedback sources? If not, I can still analyze the one source you have."

### Step 2: Get Source Data

For each source the user selected, ask them to provide the data:

> "How should I access your [Source Type]:
> 1. Files in `inputs/` folder (add them to `workflows/voice-of-customer-analysis/inputs/`)
> 2. Paste directly (I'll analyze inline)
> 3. Describe what exists (I'll note it for manual review)"

**Expected formats:**
- Support tickets: CSV export or list of ticket summaries
- NPS comments: CSV with score + comment, or paste comments
- Sales calls: Transcripts or summary notes
- Community posts: URLs or pasted text
- App reviews: Paste from App Store/Play Store, or use review aggregator export
- Social media: Paste tweets/posts or provide search results

### Step 3: Spawn Agent Team

**This is an agent teams workflow. You will coordinate N teammates (1 per source type) working in parallel.**

**Team structure:**
- **Lead (you):** Coordinate analysis, synthesize cross-source themes, prioritize opportunities
- **Teammates (N):** Each analyzes one source type independently

**Spawn N teammates (based on sources provided):**
```
If user has:
- Support tickets → Teammate 1
- NPS comments → Teammate 2
- Sales calls → Teammate 3
- Community posts → Teammate 4
- App reviews → Teammate 5
- etc.
```

**Instructions for each teammate:**

> You are analyzing **[Source Type]** for Voice of Customer insights.
>
> Your job:
> 1. **Extract pain points** — What are customers frustrated about?
> 2. **Identify feature requests** — What do customers want?
> 3. **Detect themes** — What recurring topics appear? (group similar feedback)
> 4. **Pull representative quotes** — Verbatim customer language (for each theme)
> 5. **Assess sentiment** — Overall: positive, neutral, negative (% breakdown)
> 6. **Rate urgency** — For each theme, how urgent? (High/Medium/Low)
>
> **Output format:**
>
> ```markdown
> ## [Source Type] Analysis
>
> **Total Items Analyzed:** [count]
>
> **Top Themes:**
> 1. **[Theme Name]** — [Brief description]
>    - Frequency: [count or %]
>    - Urgency: High/Medium/Low
>    - Representative Quote: "[verbatim quote]"
>
> 2. **[Theme 2]** ...
>
> **Pain Points:**
> - [Pain 1]: [count] mentions
> - [Pain 2]: [count] mentions
>
> **Feature Requests:**
> - [Feature 1]: [count] mentions
> - [Feature 2]: [count] mentions
>
> **Sentiment Breakdown:**
> - Positive: X%
> - Neutral: Y%
> - Negative: Z%
>
> **Key Insights:**
> - [Insight 1 specific to this source]
> - [Insight 2 specific to this source]
> ```

### Step 4: Parallel Analysis (Teammates Execute)

Each teammate independently analyzes their assigned source.

**Lead responsibilities during analysis:**
- Monitor teammate progress
- Don't interrupt — let them work in parallel
- Prepare cross-source synthesis framework

**Expected duration:** 20-30 minutes total

---

### Step 5: Cross-Source Synthesis (Lead)

Once all teammates report findings, synthesize into comprehensive VoC report.

**Output structure:**

#### A. Executive Summary

**Date:** [Analysis date]
**Sources Analyzed:** [List with counts]
**Total Feedback Items:** [Sum across all sources]

**Top 3 Cross-Source Themes:**
1. **[Theme 1]** — Appeared in 4/5 sources, High urgency
   - Impact: [What this means for product/roadmap]
2. **[Theme 2]** — Appeared in 3/5 sources, Medium urgency
   - Impact: [What this means]
3. **[Theme 3]** — Appeared in 2/5 sources, High urgency
   - Impact: [What this means]

**Recommended Actions:**
1. **Quick win:** [Action based on Theme 1] → Est. impact: [metric improvement]
2. **Strategic fix:** [Action based on Theme 2] → Est. impact: [outcome]

---

#### B. Cross-Source Theme Analysis

For each major theme that appears in 2+ sources:

```markdown
### Theme 1: [Theme Name]

**Frequency:** High/Medium/Low (appeared in X/N sources)

**Urgency:** High/Medium/Low

**Sources Where This Appears:**
- **Support tickets:** 45 mentions
- **NPS comments:** 12 mentions (avg. score: 3.2/10)
- **Community posts:** 8 mentions
- **App reviews:** 6 mentions (4 in 1-2★ reviews)

**Representative Quotes:**
- Support: "[verbatim quote from ticket]" (ticket #12345)
- NPS: "[verbatim comment]" (detractor, score 2)
- Community: "[verbatim post]" (Reddit, 15 upvotes)

**Sentiment:** 70% negative, 20% neutral, 10% positive

**Customer Impact:**
- Retention risk: High (mentioned in churn feedback)
- Expansion blocker: Medium (sales calls cite this objection)

**Opportunity:**
[What should we build/fix based on this theme? Be specific.]

**Estimated Impact:**
- Fix this → Reduce support volume by ~15-20%
- Fix this → Increase NPS by ~5-8 points
- Fix this → Unlock [specific customer segment]
```

[Repeat for all cross-source themes]

---

#### C. Prioritized Pain Points

Create prioritization matrix:

```markdown
| Pain Point | Frequency | Urgency | Sources | Business Impact | Recommended Action |
|------------|-----------|---------|---------|-----------------|-------------------|
| [Pain 1] | High (50+) | High | 4/5 | Retention risk | Fix in next sprint |
| [Pain 2] | Medium (20-49) | Medium | 3/5 | Expansion blocker | Roadmap for Q2 |
| [Pain 3] | Low (<20) | High | 2/5 | Churn signal | Investigate further |
| [Pain 4] | High (70+) | Low | 2/5 | Quality of life | Backlog |
```

**Prioritization Framework:**
- **P0 (Fix Now):** High frequency + High urgency + 3+ sources
- **P1 (Next Quarter):** Medium frequency + High urgency, OR High frequency + Medium urgency
- **P2 (Backlog):** Low urgency or single-source themes

---

#### D. Source-Specific Insights

For each source, provide detailed breakdown:

```markdown
### Support Tickets (500 analyzed)

**Top Issues:**
1. **[Issue 1]:** 45 tickets (9% of total)
   - Representative: "[quote from ticket]"
   - Root cause: [if identifiable]
2. **[Issue 2]:** 32 tickets (6.4% of total)
   - Representative: "[quote]"

**Sentiment Breakdown:**
- Frustrated: 60%
- Neutral: 30%
- Positive (feature request): 10%

**Unique Insights:**
- Peak ticket volume: [time period] (indicates urgency)
- Most common customer segment: [who experiences this]

**Actionable Takeaway:**
- [What support ticket data uniquely tells us]
```

[Repeat for NPS, Sales Calls, Community, Reviews, etc.]

---

#### E. Feature Requests (Aggregated)

```markdown
| Feature Request | Sources | Frequency | Business Impact | Effort Est. | Priority |
|----------------|---------|-----------|-----------------|-------------|----------|
| [Feature 1] | Support, NPS, Community | High (50+) | High (retention) | Medium | P0 |
| [Feature 2] | Sales, Reviews | Medium (20-49) | Medium (expansion) | High | P1 |
| [Feature 3] | Community only | Low (<20) | Low | Low | P2 |
```

**Top Requested Features:**
1. **[Feature 1]** — [Why customers want this, what it unlocks]
2. **[Feature 2]** — [Why customers want this]

---

#### F. Sentiment Analysis

**Overall Sentiment Across All Sources:**
- Positive: X%
- Neutral: Y%
- Negative: Z%

**Sentiment by Source:**
| Source | Positive | Neutral | Negative | Notes |
|--------|----------|---------|----------|-------|
| Support tickets | 40% | 30% | 30% | Filtered by issue type (bugs skew negative) |
| NPS comments | 65% | 20% | 15% | Promoters (9-10) = 45%, Passives = 35%, Detractors = 20% |
| App reviews | 70% | 15% | 15% | 4.2★ average (iOS), 3.9★ (Android) |
| Community posts | 50% | 30% | 20% | Engaged users, mixed sentiment |
| Sales calls | 60% | 25% | 15% | Pre-sale optimism, post-objection handling |

**Sentiment Trends:**
- Positive sentiment drivers: [Features customers love]
- Negative sentiment drivers: [Pain points causing frustration]

---

#### G. Opportunity Areas

**Quick Wins (< 1 Sprint):**
1. **[Fix based on Theme 1]**
   - Why quick: [Reason]
   - Estimated impact: Reduce support volume by ~20%, increase NPS by ~5 points
2. **[Improvement based on Theme 3]**
   - Why quick: [Reason]
   - Estimated impact: [Metric improvement]

**Strategic Bets (> 1 Quarter):**
1. **[Feature based on Theme 2]**
   - Why strategic: Unlocks [new market segment], differentiates from [competitor]
   - Estimated impact: [Revenue/retention/expansion outcome]
2. **[Platform improvement based on Theme 4]**
   - Why strategic: [Long-term value]
   - Estimated impact: [Outcome]

---

#### H. Recommended Next Steps

**Immediate (This Sprint):**
1. ✅ Fix [Pain Point 1] — Quick win, high retention impact
2. ✅ Communicate [feature roadmap] to address [Theme 2] — Reduces churn risk

**Short-term (Next Quarter):**
1. Build [Feature based on Theme 1] — Requested across 4 sources
2. Improve [area based on Theme 3] — Expansion blocker for sales

**Long-term (6-12 Months):**
1. Strategic investment in [Theme 4] — Platform play, competitive moat

---

#### I. Appendix: Data Sources

**Sources analyzed:**
- Support tickets: [count] from [date range], [tool/export]
- NPS comments: [count] from [date range], [avg. score]
- Sales calls: [count] calls from [date range]
- Community posts: [count] posts from [platforms]
- App reviews: [count] reviews from [iOS/Android], [avg. rating]

---

### Step 6: Save Report

Save the VoC analysis report to:

**Filename:** `voc-analysis-report-<YYYY-MM-DD>.md`

**Location:** `work/discovery/outputs/`

**Example:** `voc-analysis-report-2026-02-05.md`

---

### Step 7: Summary Message

After completing the analysis, provide a summary to the user:

> **Voice of Customer Analysis Complete**
>
> I analyzed **[N] sources** with **[total count] feedback items**.
>
> **Top 3 Cross-Source Themes:**
> 1. **[Theme 1]** — Appeared in X sources, High urgency
> 2. **[Theme 2]** — Appeared in Y sources, Medium urgency
> 3. **[Theme 3]** — Appeared in Z sources, High urgency
>
> **Recommended Immediate Actions:**
> 1. [Quick win] → Est. impact: [metric]
> 2. [Communication] → Reduces churn risk
>
> **Report saved to:** `work/discovery/outputs/voc-analysis-report-<YYYY-MM-DD>.md`
>
> **Time saved:** ~2.5 hours (vs. manual analysis)

---

## Framework Reference

### VoC Synthesis Framework

**Multi-source triangulation:**
- Themes that appear in 3+ sources = highest priority
- Single-source themes = investigate (may be niche or early signal)
- Cross-source themes = validated pain points

**Atomic Research:**
- Break feedback into atomic units (individual pain points, feature requests)
- Tag with source, frequency, urgency
- Cluster atoms into themes

**Prioritization Matrix:**
- **P0:** High frequency + High urgency + 3+ sources
- **P1:** Medium frequency + High urgency OR High frequency + Medium urgency
- **P2:** Low urgency or single-source

### Sentiment Analysis

**Positive indicators:**
- Feature praise, NPS promoters (9-10), 4-5★ reviews
- "Love this", "Can't live without", "Recommend"

**Neutral indicators:**
- Feature requests without complaint, NPS passives (7-8), 3★ reviews
- "Would be nice if", "Missing X but otherwise good"

**Negative indicators:**
- Bug reports, churn feedback, NPS detractors (0-6), 1-2★ reviews
- "Frustrated", "Switching to [competitor]", "Doesn't work"

---

## Output File Structure

```
workflows/voice-of-customer-analysis/
├── inputs/
│   ├── support-tickets.csv
│   ├── nps-comments.csv
│   ├── community-posts.txt
│   └── app-reviews.txt
└── outputs/
    └── voc-analysis-report-<YYYY-MM-DD>.md
```

---

## Error Handling

**User provides only 1 source:**
> "VoC analysis works best with 2+ sources to identify cross-source themes. I can analyze your [single source], but I won't be able to validate themes across multiple sources. Should I proceed, or do you have other feedback sources?"

**Source is empty or too small:**
> "I found only [X] items in [Source]. VoC analysis works best with 20+ items per source. Should I proceed with what's available, or wait until you have more feedback?"

**Sources don't align (different time periods):**
> "Your sources cover different time periods:
> - Support tickets: Jan-Feb 2026
> - NPS comments: Nov-Dec 2025
> - App reviews: All-time
>
> This may create inconsistencies (old themes vs. new). Should I note this caveat in the report, or would you like to filter sources to the same time period?"

---

## Tips for Best Results

**Before running:**
1. ✅ Collect at least 2 VoC sources (more = better theme validation)
2. ✅ Use recent data (last 3-6 months for current pain points)
3. ✅ Include diverse sources (support + sales + community = different perspectives)

**During execution:**
- Workflow takes 20-30 minutes (analysis + synthesis)
- Don't interrupt — let teammates analyze in parallel

**After receiving report:**
- **Act on P0 items immediately** (high frequency + urgency + 3+ sources)
- **Communicate roadmap** (customers want to know you heard them)
- **Close feedback loop** (reply to NPS detractors, top community posts)
- **Re-run quarterly** (VoC themes shift over time)

---

## Limitations & Caveats

**What this workflow CAN'T do:**
- ❌ Access your support/NPS tools directly (you provide exports)
- ❌ Guarantee perfect theme extraction (some nuance may be lost)
- ❌ Predict future customer needs (analyzes current feedback only)
- ❌ Replace talking to customers (VoC is data, not conversation)

**What this workflow DOES:**
- ✅ Analyze multiple VoC sources in parallel (saves hours)
- ✅ Identify cross-source themes (validated pain points)
- ✅ Prioritize by frequency + urgency + business impact
- ✅ Pull representative quotes (customer language for roadmap communication)
- ✅ Save 2.5-3 hours of manual synthesis

---

