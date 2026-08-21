---
description: 'Take a product hypothesis through structured validation, test design, and result interpretation. Use when: test a hypothesis, hypothesis validation, experiment workflow.'
---

**Workflow Pack:** Hypothesis Tester
**Tagline:** "5 theories. One truth. Fast."
**Framework:** Scientific Method, Pre-Mortems (Shreyas Doshi), Assumption Testing

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to understand their product and metrics:

1. `/context/product.md` — Product features, metrics, roadmap
2. `/context/company.md` — Company mission, business model, priorities

### Step 1: Get Problem Statement

Ask the user to describe the problem:

> "What problem are you investigating? (Be specific - e.g., 'Conversion dropped 20% last week' or 'Users aren't adopting the new feature')"

**If user is vague ("things are bad"):**
> "Can you be more specific? For example:
> - What metric changed? (conversion, retention, engagement)
> - By how much? (dropped 20%, increased 15%)
> - When did it start? (last week, after launch, etc.)"

### Step 2: Gather Context (Optional)

Ask for additional context to help hypothesis generation:

> "To help investigate, can you share:
> 1. What changed recently? (launches, marketing campaigns, code deploys)
> 2. What data do you have? (analytics, logs, user feedback, support tickets)
> 3. When did the problem start? (exact date or timeframe)
>
> (You can skip this if you don't know yet)"

### Step 3: Generate Hypotheses

Based on the problem statement and context, generate 5 competing hypotheses.

**Hypothesis generation principles:**
- Cover different categories (technical, UX, market, product, acquisition)
- Make them specific and testable
- Avoid overlap (each should explain the problem differently)
- Include both obvious and non-obvious theories

**Example (for "Conversion dropped 20% last week"):**
1. **Technical:** Bug in checkout flow (payment button not working)
2. **UX:** Pricing page confusion (users can't understand tiers)
3. **Platform:** Mobile experience degraded (checkout broken on mobile)
4. **Acquisition:** Marketing traffic quality dropped (wrong audience)
5. **Market:** Competitor launched competing feature (users switching)

**Present hypotheses to user:**
> "I've generated 5 competing hypotheses to investigate:
>
> 1. [Hypothesis 1]
> 2. [Hypothesis 2]
> 3. [Hypothesis 3]
> 4. [Hypothesis 4]
> 5. [Hypothesis 5]
>
> Should I investigate all 5, or do you want to replace any with your own theories?"

### Step 4: Spawn Agent Team

**This is an agent teams workflow. You will coordinate 5 teammates working in parallel.**

**Team structure:**
- **Lead (you):** Coordinate investigation, facilitate debate, synthesize findings
- **Teammates 1-5:** Each investigates one hypothesis independently

**Spawn 5 teammates:**
```
Teammate 1 → Investigate Hypothesis 1
Teammate 2 → Investigate Hypothesis 2
Teammate 3 → Investigate Hypothesis 3
Teammate 4 → Investigate Hypothesis 4
Teammate 5 → Investigate Hypothesis 5
```

**Instructions for each teammate:**

> You are investigating **[Hypothesis X]** as a possible explanation for **[Problem]**.
>
> Your job:
> 1. **Find supporting evidence** — What data, logs, user feedback, or observations support this hypothesis?
> 2. **Find disconfirming evidence** — What contradicts this theory? (This is critical — don't just confirm bias)
> 3. **Assign confidence level** — Based on evidence strength, how likely is this the root cause?
>    - **High (70-90%):** Multiple strong evidence sources, timing aligns, explains all symptoms
>    - **Medium (40-69%):** Some evidence, but gaps or contradictions remain
>    - **Low (<40%):** Weak or circumstantial evidence, many alternative explanations
> 4. **Propose validation tests** — How could we confirm or disprove this hypothesis? (Be specific and actionable)
>
> **Data sources to consider:**
> - Analytics (conversion funnels, user flows, retention cohorts)
> - Error logs (technical issues, bugs)
> - User feedback (support tickets, reviews, community posts)
> - Product changes (recent launches, updates)
> - Market data (competitor moves, industry trends)
> - A/B tests (if running)
>
> **Critical: Look for DISCONFIRMING evidence. Scientific method requires testing hypotheses, not just confirming them.**

### Step 5: Parallel Investigation (Teammates Execute)

Each teammate independently investigates their assigned hypothesis.

**Lead responsibilities during investigation:**
- Monitor teammate progress
- Don't interrupt — let them work in parallel
- Prepare debate framework

**Expected duration:** 10-15 minutes total

### Step 6: Adversarial Debate (Teammates Challenge Each Other)

Once all teammates report findings, facilitate a debate where teammates challenge each other's conclusions.

**Debate format:**

**Round 1: Presentation**
- Each teammate presents their hypothesis, evidence, and confidence level (2 min each)

**Round 2: Challenges**
- Teammates challenge each other:
  - "Your hypothesis doesn't explain [symptom X]"
  - "My evidence contradicts your theory because [reason]"
  - "Your confidence level is too high given [gap in evidence]"

**Round 3: Convergence**
- Look for overlapping evidence (multiple hypotheses pointing to same root cause)
- Identify contradictions that need resolution
- Update confidence levels based on debate

**Example debate:**
> Teammate 1: "I found error logs showing checkout failures starting Feb 1. High confidence (80%) this is a technical bug."
>
> Teammate 3: "But those error logs only affect 2% of sessions. That doesn't explain a 20% conversion drop. My hypothesis (mobile UX degradation) affects 60% of users."
>
> Teammate 2: "Actually, both could be true — mobile users hitting the technical bug. Let's check if error logs are mobile-specific."
>
> [Lead resolves: Teammate 1 and 3 hypotheses converge → mobile checkout bug]

### Step 7: Synthesize Findings (Lead)

After the debate, synthesize all findings into a comprehensive report.

**Output structure:**

#### A. Executive Summary

**Most Likely Cause:** [Hypothesis X] with [confidence %]

**Why:** [1-2 sentences explaining key evidence]

**Recommended Action:** [Immediate next step to validate or fix]

---

#### B. Hypotheses Investigated

For each hypothesis, create a detailed profile:

```markdown
### Hypothesis 1: [Name]

**Investigated by:** Teammate 1

**Confidence:** High/Medium/Low (XX%)

**Supporting Evidence:**
- [Evidence 1 with source]
- [Evidence 2 with source]
- [Evidence 3 with source]

**Disconfirming Evidence:**
- [What contradicts this theory]
- [Gaps in the explanation]

**Validation Tests:**
1. [Specific test to confirm/disprove]
2. [Another validation approach]
3. [Fallback test if first two inconclusive]

**Teammate Notes:**
[Any additional context or caveats]
```

[Repeat for all 5 hypotheses]

---

#### C. Debate Summary

**Key findings from teammate debate:**
- [Finding 1 — e.g., "Hypotheses 1 and 3 converged on mobile checkout issue"]
- [Finding 2 — e.g., "Hypothesis 4 was weakly supported — no retention data change"]
- [Finding 3 — e.g., "Hypothesis 5 unlikely — no major competitor launches in timeframe"]

**Convergent evidence** (multiple hypotheses pointing to same cause):
- [Evidence that supports multiple theories]

**Contradictions resolved:**
- [How debate resolved conflicting evidence]

**Remaining uncertainties:**
- [What we still don't know]
- [Where additional data is needed]

---

#### D. Recommended Next Steps

**Immediate (Validate Most Likely Cause):**
1. ✅ [First validation test — most critical]
2. ✅ [Second validation test — backup]
3. ✅ [Data to gather if tests are inconclusive]

**If Validated (Fix):**
1. [Recommended fix based on root cause]
2. [How to measure if fix worked]
3. [Timeline for fix deployment]

**If Not Validated (Explore Next Hypothesis):**
1. [Next most likely hypothesis to investigate]
2. [Additional data to gather]
3. [Alternative validation approaches]

---

#### E. Confidence Assessment

**Why [High/Medium/Low] Confidence (XX%):**
- [Reason 1 — e.g., "Multiple independent evidence sources"]
- [Reason 2 — e.g., "Timing aligns perfectly with symptom onset"]
- [Reason 3 — e.g., "Explains all observed symptoms, not just some"]

**Remaining Uncertainty:**
- [What could still prove this wrong]
- [Gaps in evidence]
- [Alternative explanations that weren't fully ruled out]

**Confidence calibration:**
- High (70-90%): Very likely, strong evidence, few gaps
- Medium (40-69%): Plausible, some evidence, notable gaps
- Low (<40%): Possible but uncertain, weak evidence

---

#### F. Appendix: Data Sources

**Data sources used:**
- [Analytics: conversion funnel link]
- [Error logs: date range, source]
- [User feedback: support tickets, reviews]
- [Product changes: recent launches]
- [Market data: competitor research]

---

### Step 8: Save Report

Save the hypothesis testing report to:

**Filename:** `hypothesis-testing-report-<YYYY-MM-DD>.md`

**Location:** `work/discovery/outputs/`

**Example:** `hypothesis-testing-report-2026-02-05.md`

---

### Step 9: Summary Message

After completing the analysis, provide a summary to the user:

> **Hypothesis Testing Complete**
>
> I investigated 5 competing hypotheses for **[Problem]**.
>
> **Most Likely Cause:** [Hypothesis X] (**[confidence %]**)
>
> **Why:** [1-2 sentence explanation with key evidence]
>
> **Recommended Next Steps:**
> 1. [Immediate validation test]
> 2. [If validated, recommended fix]
> 3. [If not validated, next hypothesis to explore]
>
> **Report saved to:** `work/discovery/outputs/hypothesis-testing-report-<YYYY-MM-DD>.md`
>
> **Confidence Note:** [High/Medium/Low] confidence means [explanation of uncertainty]
>
> **Time saved:** ~1.5-2 hours (vs. manual investigation)

---

## Framework Reference

### Scientific Method

1. **Observe** — Problem identified (metric change, user complaint)
2. **Hypothesize** — Generate competing explanations
3. **Test** — Look for supporting AND disconfirming evidence
4. **Conclude** — Assign confidence based on evidence strength
5. **Validate** — Propose tests to confirm/disprove

**Critical principle:** Actively look for disconfirming evidence. Confirmation bias kills good analysis.

### Shreyas Doshi — Pre-Mortems

**Pre-mortem process:**
1. Imagine a launch/feature failed spectacularly
2. Work backwards — what could cause that failure?
3. Generate 5-10 failure scenarios
4. Test assumptions before launch
5. Build mitigations for likely failures

**Use for:** Launch planning, feature validation, risk assessment

### Assumption Testing (David Bland)

**Assumption mapping:**
1. Identify riskiest assumptions (what must be true for this to work?)
2. Design validation tests (how to prove/disprove?)
3. Run experiments (cheapest test first)
4. Update confidence based on results

---

## Output File Structure

```
work/discovery/outputs/
└── hypothesis-testing-report-<YYYY-MM-DD>.md
```

---

## Error Handling

**Problem statement too vague:**
> "Can you be more specific? Instead of 'users aren't happy', try 'NPS dropped from 45 to 30 last month' or 'Support tickets increased 50%'."

**No data sources available:**
> "I don't have access to your analytics or logs. I can still generate hypotheses and suggest validation tests, but I'll note where data is needed. Should I proceed?"

**User wants to test only 1-2 hypotheses:**
> "Testing multiple competing hypotheses helps avoid confirmation bias. I recommend investigating at least 3. Should I generate additional hypotheses, or stick with your [X] theories?"

**All hypotheses have low confidence:**
> "All 5 hypotheses have low confidence (<40%). This suggests:
> - We need more data to investigate properly
> - The root cause might not be in our hypothesis list
> - Multiple causes are contributing (not one root cause)
>
> Recommended: Gather [specific data] and re-run analysis."

---

## Tips for Best Results

**Before running:**
1. ✅ Be specific about the problem (metric, magnitude, timeframe)
2. ✅ List available data sources (analytics, logs, user feedback)
3. ✅ Note recent changes (launches, campaigns, code deploys)
4. ✅ If you have theories already, share them (workflow can validate vs. generate new)

**During execution:**
- Workflow takes 10-15 minutes (investigation + debate + synthesis)
- Don't interrupt — let teammates finish debate
- Debate is critical (challenges prevent confirmation bias)

**After receiving report:**
- **Run validation tests BEFORE implementing fixes** — even high confidence (80%) isn't certainty
- If "most likely cause" is wrong after testing, investigate next hypothesis in rank order
- Share findings with team (transparency on uncertainty)

**Using for pre-mortems:**
- Frame as "What could cause [launch] to fail?"
- Generate failure scenarios (not success factors)
- Test assumptions before launch

---

## Limitations & Caveats

**What this workflow CAN'T do:**
- ❌ Access your analytics/logs directly (you provide data or descriptions)
- ❌ Guarantee root cause is correct (provides confidence %, not certainty)
- ❌ Fix the problem automatically (recommends fixes, doesn't implement)
- ❌ Replace A/B testing or experiments (hypothesis testing ≠ validation)

**What this workflow DOES:**
- ✅ Generate competing hypotheses (prevents anchoring on first theory)
- ✅ Investigate multiple theories in parallel (saves time)
- ✅ Challenge assumptions through adversarial debate (reduces confirmation bias)
- ✅ Assign confidence levels (honest about uncertainty)
- ✅ Recommend specific, actionable validation tests
- ✅ Save 1.5-2 hours of manual investigation

---

