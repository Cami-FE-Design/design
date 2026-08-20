---
name: market-problem-validator
description: 'Validate whether a market problem is urgent and pervasive enough to solve Use when: validate market problem, is this problem worth solving, market problem assessment, should we build this, problem validation.'
disable-model-invocation: true
category: discovery
---

# Market Problem Validator

Assess whether a market problem is urgent and pervasive enough to justify building a solution, using Pragmatic Marketing's problem-first framework.

## Output
Write the file to exactly this path:

  work/discovery/outputs/problem-validation-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- You've identified a potential problem to solve but aren't sure if it's worth pursuing
- Stakeholders are pushing for a solution and you need to validate the underlying problem
- You want to prioritize between multiple problem spaces
- You're deciding whether to invest in discovery research
- You need a go/no-go recommendation backed by evidence

## What You'll Need

**Critical inputs:**
- Problem description (what issue are customers facing?)
- Evidence (customer feedback, interview notes, support tickets, data)

**Optional (improves output):**
- Current workarounds customers use
- How customers describe the problem in their own words
- Frequency/impact data
- Competitor approaches to this problem

## Process

### Step 1: Describe the Problem

I'll ask you:
1. What problem are you considering solving?
2. What evidence do you have that this problem exists?

### Step 2: Validation Framework

I'll apply the **Pragmatic Marketing Problem Validation Framework**:

1. **Urgency** — Is this problem painful enough that customers will prioritize solving it?
2. **Pervasiveness** — Is this problem common across your target market or just a few customers?
3. **Willingness to Pay** — Will customers pay for a solution or is it a "nice-to-have"?
4. **Current Workarounds** — What are customers doing today? Does the workaround work well enough?
5. **Market Evidence** — Do customer conversations, usage data, and behavior validate the problem?

### Step 3: Go/No-Go Recommendation

Based on the assessment, I'll provide:
- **Go**: Problem is urgent and pervasive — invest in solution discovery
- **No-Go**: Problem lacks urgency or pervasiveness — deprioritize or investigate further
- **Investigate Further**: Promising but needs more evidence

## Output Template

```markdown
# Market Problem Validation: [Problem Name]
**Date:** [Date]
**Evaluated By:** [Your name/team]

---

## Problem Statement

### What problem are we considering solving?
[1-2 sentence description of the problem from the customer's perspective]

### Who experiences this problem?
[Segment, persona, or customer type]

### How are customers describing it?
"[Quote 1 from customer feedback]"
"[Quote 2 from customer feedback]"

---

## Validation Assessment

### 1. Urgency Score: [High / Medium / Low]

**Definition:** Is this problem painful enough that customers will prioritize solving it?

**Evidence:**
- [What customers say about pain/impact]
- [Behavioral evidence: frequency, escalations, churn]
- [Workaround effort customers expend]

**Assessment:**
[Why you scored it High/Medium/Low]

| Indicator | Finding |
|-----------|---------|
| Customer language | [Do they use urgent words like "critical," "blocking," "losing money"?] |
| Escalations | [How often does this problem escalate to leadership?] |
| Workaround investment | [Are customers building custom solutions or just tolerating it?] |

---

### 2. Pervasiveness Score: [High / Medium / Low]

**Definition:** Is this problem common across your target market or just a few customers?

**Evidence:**
- [How many customers/prospects mention this problem?]
- [What % of your target segment experiences this?]
- [Is it tied to a specific use case or broadly felt?]

**Assessment:**
[Why you scored it High/Medium/Low]

| Indicator | Finding |
|-----------|---------|
| Customer breadth | [X of Y customers mention this unprompted] |
| Segment coverage | [Does it affect all segments or just one?] |
| Competitive validation | [Are competitors solving this? Do buyers ask for it?] |

---

### 3. Willingness to Pay: [High / Medium / Low]

**Definition:** Will customers pay for a solution or is it a "nice-to-have"?

**Evidence:**
- [Have customers explicitly said they'd pay for a solution?]
- [Are they paying competitors for similar solutions?]
- [Do they allocate budget/resources to workarounds?]

**Assessment:**
[Why you scored it High/Medium/Low]

| Indicator | Finding |
|-----------|---------|
| Explicit willingness | [Have customers said they'd pay? How much?] |
| Proven market | [Are competitors monetizing this problem?] |
| Budget allocation | [Do customers already spend time/money on workarounds?] |

---

### 4. Current Workarounds

**What are customers doing today to address this problem?**

| Workaround | % Using | Satisfaction | Switching Cost |
|------------|---------|--------------|----------------|
| [Workaround 1] | [Estimate] | [High/Med/Low] | [High/Med/Low] |
| [Workaround 2] | [Estimate] | [High/Med/Low] | [High/Med/Low] |
| [No solution — tolerating] | [Estimate] | N/A | N/A |

**Insight:**
[Are workarounds "good enough" or are customers clearly frustrated? High satisfaction workarounds reduce urgency.]

---

### 5. Market Evidence Strength

| Evidence Type | Strength | Notes |
|---------------|----------|-------|
| **Customer interviews** | [Strong/Weak/None] | [X interviews, Y mentioned problem unprompted] |
| **Support tickets** | [Strong/Weak/None] | [X tickets in last Y months] |
| **Sales feedback** | [Strong/Weak/None] | [Lost deals, feature requests] |
| **Usage data** | [Strong/Weak/None] | [Behavioral signals of problem] |
| **Competitive intel** | [Strong/Weak/None] | [Competitors solving this? Buyers asking?] |

**Overall Evidence Strength:** [Strong / Moderate / Weak]

---

## Validation Summary

| Dimension | Score | Weight | Weighted Score |
|-----------|-------|--------|----------------|
| **Urgency** | [High/Med/Low] | 35% | [Calc] |
| **Pervasiveness** | [High/Med/Low] | 30% | [Calc] |
| **Willingness to Pay** | [High/Med/Low] | 20% | [Calc] |
| **Evidence Strength** | [Strong/Mod/Weak] | 15% | [Calc] |
| **Overall Score** | | **100%** | **[Total]** |

**Scoring Guide:**
- **High/Strong:** 3 points
- **Medium/Moderate:** 2 points
- **Low/Weak:** 1 point

**Overall Score Interpretation:**
- **2.5-3.0:** Strong validation — Go
- **2.0-2.4:** Moderate validation — Investigate further
- **1.0-1.9:** Weak validation — No-Go

---

## Recommendation: [GO / NO-GO / INVESTIGATE FURTHER]

### Rationale
[2-3 sentences explaining why you're recommending this path based on the scores]

### If GO: Next Steps
1. **[Action]** — [What to do to move toward solution discovery]
2. **[Action]** — [Additional validation or scoping needed]
3. **[Action]** — [Staffing, timeline, or resource allocation]

### If NO-GO: What This Means
- **Why not now:** [What's missing: urgency, pervasiveness, evidence?]
- **What would change the decision:** [Conditions under which you'd revisit]
- **Alternative focus:** [Other problems that scored higher]

### If INVESTIGATE FURTHER: What's Needed
- **Questions to answer:** [Specific unknowns blocking a decision]
- **Research approach:** [How to gather missing evidence]
- **Timeline:** [How long to investigate before deciding]

---

## Risk Factors

### Risks if we pursue this problem:
1. **[Risk]** — [Why this could fail]
2. **[Risk]** — [What assumptions might be wrong]

### Risks if we don't pursue this problem:
1. **[Risk]** — [Competitive or customer risk]
2. **[Risk]** — [Market opportunity cost]

---

## Appendix: Evidence Summary

### Customer Quotes
> "[Quote showing urgency]" — [Customer name/type]

> "[Quote showing pervasiveness]" — [Customer name/type]

> "[Quote showing willingness to pay]" — [Customer name/type]

### Data Points
- [Support ticket volume]
- [Churn reasons tied to this problem]
- [Feature request frequency]
- [Usage patterns indicating problem]

---

## Framework Reference

**Pragmatic Marketing: Problem-First, Market-Driven Approach**

Pragmatic Marketing teaches that products fail when they're built to solve problems that aren't urgent or pervasive enough. The "Market Problems" box in the Pragmatic Marketing Framework emphasizes:

1. **Start with problems, not solutions** — Validate the problem before designing features
2. **Urgency + Pervasiveness = Market** — Both must be true for a problem to justify investment
3. **Evidence over opinions** — Customer conversations, data, and behavior matter more than internal assumptions
4. **Willingness to pay signals value** — If customers won't pay, it's not a real problem

This skill applies those principles to systematically validate whether a problem is worth solving.

**Learn more:** [Pragmatic Marketing Framework](https://www.pragmaticinstitute.com/product/framework/)

**Credit:** Framework developed by Pragmatic Institute, a leading product management training organization.
```

## Tips for Best Results

1. **Provide direct customer evidence** — Quotes, tickets, interview notes (not internal opinions)
2. **Quantify where possible** — "20 of 30 customers mentioned this" > "lots of customers want this"
3. **Include workaround details** — Understanding what customers do today reveals problem severity
4. **Be honest about weak evidence** — "No-Go" is a valuable outcome that saves wasted effort
5. **Focus on one problem at a time** — Don't bundle multiple problems into one assessment

## Edge Case Handling

**If evidence is thin:**
I'll flag that the assessment is speculative and recommend investigation steps (e.g., run 5-10 customer interviews, review support tickets, analyze usage data).

**If urgency is high but pervasiveness is low (or vice versa):**
I'll explain the trade-off: high-urgency niche problems can be valuable if willingness to pay is strong. Low-urgency broad problems are rarely worth solving.

**If you don't have direct customer evidence yet:**
I'll provide a research plan to gather the evidence needed for validation (interview guide, data to collect, who to talk to).
