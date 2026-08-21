---
description: 'Run a top-down + bottom-up market sizing workflow with explicit assumptions and TAM/SAM/SOM output. Use when: market sizing, TAM SAM SOM workflow, opportunity sizing.'
---

**Workflow Pack:** Market Sizing Analyzer
**Tagline:** "TAM/SAM/SOM from 5 sources. 45 minutes."
**Framework:** TAM/SAM/SOM Analysis, Bottom-Up + Top-Down Sizing

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to understand their product and market:

1. `/context/product.md` — Product description, target market
2. `/context/company.md` — Business model, strategic priorities

### Step 1: Get Market Definition

Ask the user to define the market:

> "What market should I size? (Be specific - e.g., 'Project management software for creative agencies' or 'AI-powered CRM for B2B SaaS')"

**If user is vague ("the PM tools market"):**
> "Can you be more specific? For example:
> - What type of PM tools? (roadmapping, research, documentation)
> - Who's the buyer? (solo PMs, teams, enterprises)
> - What's unique about this segment?"

### Step 2: Get Geography and Time Horizon

Ask for additional parameters:

> "Geography and time horizon:
> 1. Target geography: Global, North America, US only, Europe, etc.?
> 2. Time horizon: 2026 (current year) or 5-year projection (2026-2031)?
>
> (I'll use Global + current year if you skip this)"

### Step 3: Spawn Agent Team

**This is an agent teams workflow. You will coordinate 5 teammates researching different methodologies in parallel.**

**Team structure:**
- **Lead (you):** Coordinate research, triangulate estimates, synthesize report
- **Teammates 1-5:** Each researches one methodology independently

**Spawn 5 teammates:**
```
Teammate 1 → Analyst Reports (Gartner, Forrester, IDC)
Teammate 2 → Competitor Financials (public companies, revenue estimates)
Teammate 3 → Bottom-Up Sizing (# customers × ARPU)
Teammate 4 → Top-Down Sizing (industry size × % addressable)
Teammate 5 → Adjacent Market Proxies (similar markets as benchmarks)
```

**Instructions for each teammate:**

**Teammate 1: Analyst Reports**
> Research analyst reports (Gartner, Forrester, IDC, CB Insights) for **[Market]** in **[Geography]**.
>
> Find:
> - TAM (Total Addressable Market) estimates
> - SAM (Serviceable Addressable Market) estimates
> - Growth rate (CAGR)
> - Market segmentation
> - Sources and publication dates
>
> Output:
> - TAM: $X.XB
> - SAM: $X.XB
> - Confidence: High/Medium/Low (based on report recency and credibility)
> - Sources: [Report name, date, URL]
> - Key assumptions: [What analyst assumed]

**Teammate 2: Competitor Financials**
> Research public competitor revenues and estimate market size based on **[Market]** in **[Geography]**.
>
> Find:
> - List 5-10 public competitors or well-funded private companies
> - Their annual revenues (ARR or total revenue)
> - Estimated market share
> - Extrapolate total market size
>
> Calculation:
> - If Competitor A has $500M ARR and ~5% market share → TAM = $10B
> - Average across multiple competitors for triangulation
>
> Output:
> - TAM: $X.XB (based on competitor extrapolation)
> - SAM: $X.XB (based on funded startups + established players)
> - Confidence: Medium (depends on market share accuracy)
> - Sources: [Competitor names, revenue sources]
> - Key assumptions: [Market share estimates]

**Teammate 3: Bottom-Up Sizing**
> Calculate market size bottom-up for **[Market]** in **[Geography]**.
>
> Method:
> 1. Estimate # of target customers:
>    - How many companies/users fit the target profile?
>    - Example: 500K creative agencies globally with 5-50 employees
> 2. Estimate Average Revenue Per User (ARPU):
>    - What would they pay annually?
>    - Example: $200/user/year or $2,400/company/year
> 3. Calculate:
>    - TAM = Total # customers × ARPU
>    - SAM = Customers you can realistically reach × ARPU
>    - SOM = Year 1-3 realistic capture (1-5% of SAM)
>
> Output:
> - TAM: $X.XB (# customers × ARPU)
> - SAM: $X.XB (addressable customers × ARPU)
> - SOM: $XXM (realistic 3-year capture)
> - Confidence: Medium (depends on customer count accuracy)
> - Sources: [Where you got customer counts, ARPU estimates]
> - Key assumptions: [# customers, ARPU, penetration rate]

**Teammate 4: Top-Down Sizing**
> Calculate market size top-down for **[Market]** in **[Geography]**.
>
> Method:
> 1. Find total industry size (e.g., "Enterprise software market = $500B")
> 2. Identify % addressable for this specific segment:
>    - Example: "PM tools = 3% of enterprise software = $15B"
>    - Then: "AI-powered PM tools = 10% of PM tools = $1.5B"
> 3. Narrow to target segment:
>    - Example: "Solo PM tools = 20% of PM tools = $3B"
>
> Output:
> - TAM: $X.XB (industry size × % addressable)
> - SAM: $X.XB (further narrowed to reachable segment)
> - Confidence: Low-Medium (depends on % assumptions)
> - Sources: [Industry reports, % breakdowns]
> - Key assumptions: [% addressable at each level]

**Teammate 5: Adjacent Market Proxies**
> Use adjacent/similar markets as proxies for **[Market]** in **[Geography]**.
>
> Method:
> 1. Identify 2-3 similar markets:
>    - Example for "AI PM tools": CRM software, project management, workflow automation
> 2. Research their market sizes
> 3. Adjust for differences:
>    - If CRM = $50B but broader, AI PM tools might be 10-20% = $5-10B
>
> Output:
> - TAM: $X.XB (based on proxy markets)
> - Confidence: Medium (depends on similarity)
> - Sources: [Proxy market reports]
> - Key assumptions: [Adjustment factors, why this proxy is relevant]

---

### Step 4: Parallel Research (Teammates Execute)

Each teammate independently researches their assigned methodology.

**Lead responsibilities during research:**
- Monitor teammate progress
- Don't interrupt — let them work in parallel
- Prepare triangulation framework

**Expected duration:** 30-45 minutes total

---

### Step 5: Triangulate Estimates (Lead Synthesis)

Once all teammates report findings, synthesize into comprehensive market sizing report.

**Output structure:**

#### A. Executive Summary

**Market:** [Market category]
**Geography:** [Region]
**Time Horizon:** [Year or projection period]
**Date:** [Analysis date]

**TAM (Total Addressable Market):** $X.XB - $Y.YB (Mid: $Z.ZB)
**SAM (Serviceable Addressable Market):** $X.XB - $Y.YB (Mid: $Z.ZB)
**SOM (Serviceable Obtainable Market):** $XXM - $YYM (Mid: $ZZM)

**Recommended Estimate:** [Which estimate to use and why]

**Confidence Level:** High/Medium/Low (based on convergence across sources)

**Growth Rate:** X-Y% CAGR (if available)

---

#### B. Methodology Summary

Create comparison table of all 5 estimates:

```markdown
| Source | TAM | SAM | SOM | Confidence | Key Assumption |
|--------|-----|-----|-----|------------|----------------|
| Analyst Reports | $XB | $XB | $XM | High | Gartner 2025 report |
| Competitor Financials | $XB | $XB | $XM | Medium | 10 public companies, ~5% market share |
| Bottom-Up Sizing | $XB | $XB | $XM | Medium | 500K customers × $200 ARPU |
| Top-Down Sizing | $XB | $XB | $XM | Low | Enterprise SW ($500B) × 3% = $15B |
| Adjacent Markets | $XB | $XB | $XM | Medium | CRM market ($50B) × 20% = $10B |
```

---

#### C. Detailed Analysis by Source

For each of the 5 sources, provide full breakdown:

```markdown
### 1. Analyst Reports (Gartner, Forrester, IDC)

**TAM:** $X.XB
**SAM:** $X.XB
**SOM:** $XXM (3-year realistic capture)

**Sources:**
- [Gartner Report Name, Date, URL]
- [Forrester Report Name, Date, URL]

**Key Findings:**
- [Finding 1]
- [Finding 2]

**Assumptions:**
- [Assumption 1]
- [Assumption 2]

**Confidence:** High/Medium/Low
**Rationale:** [Why this confidence level]
```

[Repeat for teammates 2-5]

---

#### D. Triangulated Estimate

**TAM Range:**
- Low: $X.XB (most conservative estimate)
- Mid: $Z.ZB (weighted average across sources)
- High: $Y.YB (most optimistic estimate)

**SAM Range:**
- Low: $X.XB
- Mid: $Z.ZB
- High: $Y.YB

**SOM Range (3-year):**
- Low: $XXM
- Mid: $ZZM
- High: $YYM

**Triangulation Methodology:**

Weighted average based on source credibility:
- Analyst Reports: 40% (most credible if recent)
- Bottom-Up Sizing: 30% (grounded in unit economics)
- Competitor Financials: 20% (real market data)
- Adjacent Markets: 5% (proxy, less direct)
- Top-Down Sizing: 5% (many assumptions)

**Convergence Analysis:**
- If estimates are within 2× range → High confidence
- If estimates are within 5× range → Medium confidence
- If estimates are >5× spread → Low confidence, more research needed

**Growth Rate:** X-Y% CAGR (2026-2031)
**Source:** [Where growth rate came from]

---

#### E. Assumptions & Risks

**Key Assumptions:**
1. [Assumption 1] — If wrong, impact: [describe impact]
2. [Assumption 2] — If wrong, impact: [describe impact]
3. [Assumption 3] — If wrong, impact: [describe impact]

**Sensitivity Analysis:**

| Variable | Base Case | Low Case | High Case | Impact on TAM |
|----------|-----------|----------|-----------|---------------|
| ARPU | $200 | $150 (-25%) | $300 (+50%) | -25% / +50% |
| # Customers | 500K | 300K (-40%) | 700K (+40%) | -40% / +40% |
| Addressable % | 15% | 10% (-33%) | 20% (+33%) | -33% / +33% |

**Confidence Drivers:**

✅ **Strengths:**
- Multiple independent sources converge
- Bottom-up math is sound
- Analyst reports are recent (2025)

⚠️ **Cautions:**
- Limited public data on [specific segment]
- ARPU is estimated, not measured
- Market definition could vary

❌ **Weaknesses:**
- Analyst reports are 1-2 years old
- Competitor market share is guessed
- Top-down % assumptions are rough

---

#### F. Recommended Use

**For Fundraising Pitch:**
- Use **mid-range TAM** ($Z.ZB)
- Cite **analyst reports** (Gartner, Forrester) for credibility
- Show **bottom-up calculation** to prove it's realistic
- Example: "TAM = $10B (Gartner 2025) validated by bottom-up (500K agencies × $200 ARPU = $10B)"

**For Internal Planning (OKRs, goals):**
- Use **conservative SOM** ($XXM) for realistic target-setting
- Don't anchor to TAM — SOM is what matters for execution
- Example: "Capture 2% of SAM in 3 years = $XXM realistic goal"

**For Board Presentation:**
- Show **range** (low/mid/high) with confidence levels
- Explain **methodology** (not just number)
- Flag **key assumptions** and risks
- Example: "TAM = $8-12B (mid: $10B), confidence: Medium, key risk: ARPU assumption"

**For Market Entry Decision:**
- Use **SAM** (not TAM) to decide if market is big enough
- Check if SAM supports venture-scale outcomes (>$100M ARR potential)
- Example: "SAM = $3B → Even at 5% share = $150M ARR → Venture-scalable"

---

#### G. Appendix: Sources

List all sources used by teammates:
- Analyst reports (Gartner, Forrester, IDC)
- Competitor financials (company names, revenue sources)
- Industry reports (market size data)
- Customer count sources (census, industry associations)
- ARPU benchmarks (pricing pages, case studies)
- Adjacent market reports

---

### Step 6: Save Report

Save the market sizing report to:

**Filename:** `market-sizing-report-<YYYY-MM-DD>.md`

**Location:** `work/strategy/outputs/`

**Example:** `market-sizing-report-2026-02-05.md`

---

### Step 7: Summary Message

After completing the analysis, provide a summary to the user:

> **Market Sizing Analysis Complete**
>
> I researched **[Market]** using 5 independent methodologies.
>
> **TAM:** $X.XB - $Y.YB (Mid: $Z.ZB)
> **SAM:** $X.XB - $Y.YB (Mid: $Z.ZB)
> **SOM (3-year):** $XXM - $YYM (Mid: $ZZM)
>
> **Confidence:** [High/Medium/Low] — [1 sentence why]
>
> **Recommended for:**
> - Fundraising: Use mid-range TAM ($Z.ZB) citing [Source]
> - Planning: Use conservative SOM ($XXM) for goals
>
> **Report saved to:** `work/strategy/outputs/market-sizing-report-<YYYY-MM-DD>.md`
>
> **Time saved:** ~3 hours (vs. manual research)

---

## Framework Reference

### TAM/SAM/SOM Framework

**TAM (Total Addressable Market):**
- The revenue opportunity if you captured 100% of the market
- Broadest definition of the market
- Example: All project management software globally = $20B

**SAM (Serviceable Addressable Market):**
- The portion of TAM you can realistically serve (based on geography, product fit, go-to-market)
- Example: PM software for agencies in North America = $3B

**SOM (Serviceable Obtainable Market):**
- The portion of SAM you can realistically capture in 3-5 years
- Example: 2-5% of SAM = $60-150M

### Sizing Methodologies

**Bottom-Up:**
- Start with unit economics (# customers × ARPU)
- Most realistic for startups
- Pro: Grounded in your business model
- Con: Hard to estimate total # of customers

**Top-Down:**
- Start with industry size, narrow down
- Common in pitch decks
- Pro: Uses published data
- Con: Many assumption layers

**Triangulation:**
- Use 3-5 independent methods
- Identify consensus range
- Increases confidence

---

## Output File Structure

```
work/strategy/outputs/
└── market-sizing-report-<YYYY-MM-DD>.md
```

---

## Error Handling

**Market definition too broad:**
> "The market you described is very broad (e.g., 'software'). Can you narrow it down? For example: 'Project management software for creative agencies' or 'AI-powered CRM for B2B SaaS'."

**No public data available:**
> "I couldn't find recent analyst reports for this specific market. I'll focus on bottom-up sizing, competitor financials, and adjacent market proxies. The estimate will have lower confidence without analyst data."

**Estimates diverge widely (>10× spread):**
> "The 5 estimates have a very wide range ($1B - $50B). This suggests:
> - Market definition needs clarification
> - We're mixing different segments
> - More research needed
>
> Should I narrow the market definition and re-run?"

---

## Tips for Best Results

**Before running:**
1. ✅ Be specific about market segment (not "PM tools" but "AI PM tools for solo PMs")
2. ✅ Clarify geography (Global? US only? Europe?)
3. ✅ Know your use case (fundraising? planning? board deck?)

**During execution:**
- Workflow takes 30-45 minutes (research + triangulation)
- Don't interrupt — let teammates research in parallel

**After receiving report:**
- **Validate assumptions** — Are customer counts realistic? Is ARPU accurate?
- **Cite sources** — When presenting, always cite (Gartner, bottom-up, etc.)
- **Show range, not point estimate** — "$8-12B" is more credible than "$10.347B"
- **Use appropriate estimate** — TAM for fundraising, SOM for planning

---

## Limitations & Caveats

**What this workflow CAN'T do:**
- ❌ Access paywalled analyst reports (uses public excerpts, press releases)
- ❌ Guarantee 100% accuracy (market sizing is always estimates + assumptions)
- ❌ Predict future market size with certainty (uses historical growth rates)
- ❌ Provide real-time market tracking (one-time snapshot)

**What this workflow DOES:**
- ✅ Research 5 independent methodologies in parallel
- ✅ Triangulate estimates to find consensus range
- ✅ Flag key assumptions and sensitivity
- ✅ Recommend which estimate to use for what purpose
- ✅ Save 3-4 hours of manual research

---

