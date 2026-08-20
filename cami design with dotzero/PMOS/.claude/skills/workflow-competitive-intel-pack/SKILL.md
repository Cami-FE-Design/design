---
name: workflow-competitive-intel-pack
description: >-
  Multi-step workflow. Run a full competitive intelligence analysis — landscape
  map, competitor profiles, feature matrix, pricing comparison, strategic
  recommendations. Use when: competitive analysis, competitor research, market
  landscape.
category: competitive
---
# Competitive Intelligence Pack Workflow

**Workflow Pack:** Competitive Intelligence Pack
**Tagline:** "5 competitors. 30 minutes. Complete intel."
**Framework:** DHM Model (Gibson Biddle), April Dunford Positioning

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to understand their product and competitive landscape:

1. `/context/company.md` — Company mission, business model, strategic priorities
2. `/context/product.md` — Product features, positioning, metrics
3. `/context/competitors.md` (if exists) — Known competitors

### Step 1: Get Competitor Names

Ask the user which competitors to analyze:

> "Which competitors should I analyze? (Provide 3-5 company names)"

**If user provides <3 competitors:**
> "I work best with 3-5 competitors for comprehensive analysis. Can you provide at least 3?"

**If user provides >5 competitors:**
> "I can analyze up to 5 competitors in parallel. Should I:
> 1. Analyze the first 5 now, then run a second batch?
> 2. Prioritize — which 5 are most important?"

### Step 2: Clarify Analysis Focus (Optional)

Ask the user if they want to focus on specific areas:

> "What should I focus on? (Leave blank for comprehensive analysis)
> - Product features
> - Pricing strategy
> - Market positioning
> - Customer satisfaction
> - Tech stack
> - All of the above (default)"

### Step 3: Spawn Agent Team

**This is an agent teams workflow. You will coordinate 5 teammates working in parallel.**

**Team structure:**
- **Lead (you):** Coordinate analysis, synthesize findings, create report
- **Teammate 1-5:** Each researches one competitor independently

**Spawn 5 teammates:**
```
Teammate 1 → Research [Competitor A]
Teammate 2 → Research [Competitor B]
Teammate 3 → Research [Competitor C]
Teammate 4 → Research [Competitor D]
Teammate 5 → Research [Competitor E]
```

**Instructions for each teammate:**

> You are researching [Competitor Name]. Gather competitive intelligence on:
>
> **1. Product Analysis**
> - Core features and capabilities
> - Product positioning (who it's for, what problem it solves)
> - Recent product updates/launches (last 6 months)
> - Feature gaps vs. user's product (from context files)
>
> **2. Pricing Analysis**
> - Pricing tiers (Free, Starter, Pro, Enterprise)
> - Value metric (per seat, per usage, per outcome)
> - Pricing model (subscription, one-time, usage-based)
> - Estimated ARPU (if available or inferable)
>
> **3. Market Positioning**
> - Target market (SMB, mid-market, enterprise)
> - Key messaging and value props (from website, marketing)
> - Marketing channels (content, ads, partnerships)
> - Brand perception
>
> **4. Customer Sentiment**
> - G2/Capterra reviews (rating, number of reviews)
> - Common complaints (top 3)
> - Common praise (top 3)
> - Retention signals (if available)
>
> **5. Tech Stack (if relevant)**
> - Platform (web, desktop, mobile)
> - Key integrations
> - API availability
> - Technical differentiation
>
> **6. DHM Analysis (Gibson Biddle)**
> - **Delight:** What delights their customers? (from reviews, case studies)
> - **Hard-to-copy:** What's their moat? (tech, network effects, data)
> - **Margin-enhancing:** What's their pricing power? (premium positioning, churn)
>
> Report your findings in structured format. Include sources (links).

### Step 4: Parallel Research (Teammates Execute)

Each teammate independently researches their assigned competitor.

**Lead responsibilities during research:**
- Monitor teammate progress
- Don't interrupt — let them work in parallel
- Prepare synthesis framework

**Expected duration:** 20-30 minutes total

### Step 5: Synthesize Findings (Lead)

Once all teammates report back, synthesize their findings into a comprehensive report.

**Output structure:**

#### A. Executive Summary
3-5 key findings:
- Biggest competitive threats
- Positioning opportunities
- Feature gaps
- Pricing insights
- Strategic recommendations (1-2 sentences each)

#### B. Competitive Landscape Map

Create a 2×2 positioning map. Choose axes based on analysis focus:
- Quality vs. Price
- Features vs. Simplicity
- Enterprise vs. SMB
- Established vs. Innovative

Plot all 5 competitors + user's product.

**Format:**
```
High Quality
     │
  D  │  B    [Us]
     │
─────┼─────────────
  C  │  A    E
     │
Low Quality
  Low Price → High Price
```

#### C. Individual Competitor Profiles

For each competitor, create a profile:

```markdown
### [Competitor Name]

**Overview:** [Who they are, founded, funding, size]

**Product:**
- Core features: [list]
- Positioning: [who it's for, value prop]
- Recent launches: [last 6 months]

**Pricing:**
- Free: [details or "No free tier"]
- Starter: [price, features]
- Pro: [price, features]
- Enterprise: [price, features]
- Value metric: [per seat/usage/outcome]

**Strengths:**
- [What they do exceptionally well]
- [Unique capabilities]
- [Market advantages]

**Weaknesses:**
- [Where they fall short]
- [Common complaints]
- [Gaps vs. user expectations]

**DHM Analysis:**
- Delight: [What delights customers]
- Hard-to-copy: [Their moat]
- Margin-enhancing: [Pricing power sources]

**Threat Level:** 🔴 High / 🟡 Medium / 🟢 Low

**Why:** [Explain threat assessment]

**Customer Sentiment:**
- G2 Rating: [X.X/5.0] ([N] reviews)
- Top praise: [theme]
- Top complaint: [theme]

**Sources:**
- Website: [URL]
- Pricing: [URL]
- G2 page: [URL]
```

#### D. Feature Comparison Matrix

Create side-by-side feature comparison:

```markdown
| Feature Category | Our Product | Competitor A | B | C | D | E |
|-----------------|-------------|--------------|---|---|---|---|
| [Feature 1] | ✅ | ✅ | ❌ | ✅ | ⚠️ | ✅ |
| [Feature 2] | ✅ | ⚠️ | ✅ | ❌ | ✅ | ❌ |
...

Legend:
✅ Full support
⚠️ Partial/Limited
❌ Not available
```

Focus on features that matter to user's target market.

#### E. Pricing Comparison

```markdown
| Company | Free | Starter | Pro | Enterprise | Value Metric |
|---------|------|---------|-----|------------|--------------|
| Us | [Details] | [Price] | [Price] | [Price] | [per X] |
| Competitor A | ... | ... | ... | ... | [per X] |
...
```

Add insights:
- Who's most expensive/cheapest?
- Who offers best value at each tier?
- Pricing gaps (opportunities for us)?

#### F. SWOT Analysis by Competitor

For each competitor, provide concise SWOT:

```markdown
### [Competitor Name] SWOT

**Strengths:**
- [Internal advantage]
- [Capability]

**Weaknesses:**
- [Internal limitation]
- [Gap]

**Opportunities (for them):**
- [Market trend they could exploit]

**Threats (to them):**
- [External risk]
- [Competitive pressure]
```

#### G. Strategic Recommendations

Based on all analysis, provide actionable recommendations:

**1. Positioning Opportunities**
- Where can we differentiate?
- What gaps exist in the market?
- What messaging angles are unclaimed?

**2. Feature Development Priorities**
- Features to build (competitive gaps we can fill)
- Features to deprioritize (table stakes we shouldn't over-invest in)
- Unique capabilities to double down on

**3. Pricing Strategy**
- How should we position pricing vs. competitors?
- What value metric makes sense?
- Which tier should we compete in (SMB vs. Enterprise)?

**4. Marketing & Messaging**
- Competitive claims we can make
- Messaging opportunities
- Channels competitors aren't using

**5. Threat Mitigation**
- Which competitors pose biggest threats?
- How to defend against their strengths?
- What moves should we monitor?

#### H. Appendix: Sources

List all sources used by teammates:
- Competitor websites
- Pricing pages
- G2/Capterra review pages
- Case studies
- Press releases
- Blog posts
- LinkedIn pages

---

### Step 6: Save Report

Save the comprehensive report to:

**Filename:** `competitive-intel-report-<YYYY-MM-DD>.md`

**Location:** `work/strategy/outputs/`

**Example:** `competitive-intel-report-2026-02-05.md`

---

### Step 7: Summary Message

After completing the analysis, provide a summary to the user:

> **Competitive Intelligence Analysis Complete**
>
> I analyzed [X] competitors in parallel and created a comprehensive competitive intelligence report.
>
> **Top Findings:**
> - [Biggest threat]: [Why]
> - [Positioning opportunity]: [What gap exists]
> - [Feature gap]: [What competitors lack]
>
> **Recommended Next Steps:**
> 1. [Immediate action based on findings]
> 2. [Strategic move]
> 3. [Follow-up research needed]
>
> **Report saved to:** `work/strategy/outputs/competitive-intel-report-<YYYY-MM-DD>.md`
>
> **Time saved:** ~3.5 hours (vs. manual research)

---

## Framework Reference

### Gibson Biddle's DHM Model

**Delight:**
- What makes customers happy with this competitor?
- Evidence: reviews, case studies, NPS, testimonials

**Hard-to-Copy:**
- What's their competitive moat?
- Examples: proprietary tech, network effects, data advantages, brand, switching costs

**Margin-Enhancing:**
- What gives them pricing power?
- Examples: premium positioning, low churn, upsell success, high willingness-to-pay

### April Dunford — Obviously Awesome Positioning

**Competitive Alternatives:**
- What would customers use if this competitor didn't exist?

**Unique Attributes:**
- What does only this competitor have?

**Value:**
- What customer outcomes do they deliver?

**Target Market:**
- Who values these unique attributes most?

---

## Output File Structure

```
work/strategy/outputs/
└── competitive-intel-report-<YYYY-MM-DD>.md
```

---

## Error Handling

**User provides non-existent company:**
> "I couldn't find information about [Company Name]. Could you double-check the spelling or provide their website URL?"

**Competitor website is down:**
> "I couldn't access [Competitor]'s website directly. I'll use cached data and alternative sources (G2, press releases, LinkedIn)."

**Pricing not publicly available:**
> "Pricing for [Competitor] is not publicly listed. I'll note 'Pricing on request' and estimate based on comparable companies."

**User's context files missing:**
> "I don't see your company.md or product.md context files. I can still analyze competitors, but the strategic recommendations will be generic without your context. Should I proceed?"

---

## Tips for Best Results

**Before running:**
1. ✅ Update your `/context/company.md` and `/context/product.md` files
2. ✅ Be specific about competitor names (exact company names or URLs)
3. ✅ If you have specific questions (e.g., "How does their pricing compare?"), mention them upfront

**During execution:**
- Agent team will take 20-30 minutes to complete
- Don't interrupt — teammates work in parallel
- You'll see progress updates as teammates report findings

**After receiving report:**
- Validate pricing data (check competitor websites — pricing changes frequently)
- Cross-reference G2 reviews (sentiment may shift)
- Use strategic recommendations as starting point, not gospel
- Share relevant sections with your team (positioning, feature gaps, etc.)

---

## Limitations & Caveats

**What this workflow CAN'T do:**
- ❌ Access private/internal competitor data
- ❌ Guarantee 100% pricing accuracy (public pricing changes frequently)
- ❌ Predict competitor roadmaps (unless publicly announced)
- ❌ Provide real-time competitive tracking (this is a one-time snapshot)

**What this workflow DOES:**
- ✅ Synthesize public competitive intelligence in 30 minutes
- ✅ Identify positioning opportunities based on market gaps
- ✅ Provide strategic recommendations grounded in research
- ✅ Save 3-4 hours of manual research per analysis

---

