---
name: survey-question-generator
description: 'Design customer surveys with clear objectives, unbiased questions, and analysis plans. Use when: design survey, create survey, survey questions, customer survey, NPS survey.'
disable-model-invocation: true
category: discovery
---

# Survey Question Generator

Design customer surveys with clear objectives, unbiased questions, and analysis plans.

## Output
Write the file to exactly this path:

  work/discovery/outputs/survey-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Planning a customer satisfaction or NPS survey
- Researching a specific feature or product area
- Gathering post-launch feedback
- Running competitive research

## What You'll Need

**Critical inputs (ask if not provided):**
- What you're trying to learn (the research question)
- Who you're surveying (customer segment)
- What decision this will inform

**Nice-to-have inputs:**
- Target response count
- Distribution channel (in-app, email, post-support)
- Related prior surveys

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/personas.md` — Who are you surveying? What language do they use?
- `context/product.md` — What decision does this survey inform? What do you already know?
- `context/company.md` — Related strategic questions

**Tell the user what you found.** For example:
> "I found your Jordan persona (PM) in personas.md. If surveying Jordan-type users about reporting, I'll use their language ('visibility into project health') and avoid jargon. Your product.md mentions 'Advanced Reporting' as a Q2 priority — I'll design questions that help you prioritize specific reporting features."

### Step 2: Clarify Research Goals
**CRITICAL:** If the user hasn't specified what they want to learn, ask:

> "Before I design survey questions, I need to understand:
> 1. What decision are you trying to make? (e.g., whether to invest in mobile, how to improve onboarding)
> 2. Who will you survey? (all customers, specific segment, churned users?)
>
> I'll design questions that give you actionable data for that decision."

Do NOT generate generic survey questions without a clear objective.

### Step 3: Clarify Objectives
Before writing questions, define:
- **Research question:** What do we need to learn?
- **Decision:** What will we do with the answers?
- **Success metric:** What response would change our behavior?

### Step 4: Design Question Flow
Structure the survey:
1. **Screener** (if needed) — Qualify respondents
2. **Core questions** — 3-5 questions addressing the research question
3. **Context questions** — Segment data (role, company size, usage)
4. **Open-ended** — 1-2 for rich qualitative data

### Step 5: Write Unbiased Questions
For each question, ensure:
- No leading language ("Don't you agree...")
- Balanced options (not just positive choices)
- Single concept per question (no double-barrels)
- Clear, specific wording

### Step 6: Build Analysis Plan
Before launching, define:
- What "good" looks like for each question
- How you'll segment the data
- What action each answer triggers

### Step 7: Plan Distribution
Consider:
- Sample size needed for significance
- Channel (in-app, email, post-support)
- Timing (after onboarding, after usage, after churn)
- Incentives (if any)

## Output Template

```markdown
# Survey Design: [Topic]

## Context
*What I found in your files:*
- **Target persona:** [From personas.md]
- **Persona language:** [From personas.md — how they describe this area]
- **Related product context:** [From product.md — what this informs]

## Objectives

**Research Question:** [What we need to learn]
**Decision:** [What we'll do with the data]
**Target Audience:** [Who we're surveying — from personas.md]
**Target Responses:** [N] — [Why this number]

---

## Survey Questions

### Q1: [Question text]
**Type:** [Multiple choice / Scale / Open-ended / NPS]
**Purpose:** [What this question tells us]
**Options:**
- [Option A]
- [Option B]
- [Option C]
- [Option D]

**Analysis plan:** [If X% say A, we will Y. If X% say B, we will Z.]

---

### Q2: [Question text]
**Type:** [Type]
**Purpose:** [Purpose]
**Options/Scale:** [Details]

**Analysis plan:** [What different answers mean for our decision]

---

### Q3: [Question text]
[Same structure]

---

### Q4: [Question text]
[Same structure]

---

### Q5 (Open-ended): [Question text]
**Type:** Open-ended
**Purpose:** [What qualitative insight we're seeking]
**Character limit:** [Suggested limit]

**Analysis plan:** [How we'll code/theme responses]

---

## Segmentation Questions

### S1: [Role/Title question]
**Purpose:** Segment responses by user type
**Options:** [Relevant roles for this product]

### S2: [Usage/Tenure question]
**Purpose:** Segment by experience level
**Options:** [Time ranges or usage levels]

---

## Distribution Plan

| Channel | Timing | Expected Response Rate |
|---------|--------|------------------------|
| [Email / In-app / etc.] | [When to send] | [X%] |

**Sample size rationale:** [Why we need N responses]
**Incentive:** [None / Discount / Entry to drawing]

---

## Red Flags Avoided

This survey avoids:
- [ ] Leading questions
- [ ] Double-barreled questions
- [ ] Jargon or unclear language
- [ ] Too many questions (target: 5-8)
- [ ] All positive response options
- [ ] Required open-ended questions

---

## Expected Timeline

| Phase | Duration |
|-------|----------|
| Survey live | [X days] |
| Response collection | [X days] |
| Analysis | [X days] |
| Report delivery | [Date] |
```

## Framework Reference

**Survey Design Best Practices:**
- Start with the decision, not the questions
- Every question must have a "so what" — if the answer doesn't change your behavior, don't ask
- Open-ended questions at the end (after effort invested)
- Segment questions last (least interesting to respondent)

**Question Type Selection:**
- Use scales (1-5, 1-10) for comparability over time
- Use multiple choice for clear, mutually exclusive options
- Use open-ended sparingly — for "why" insights

## Tips for Best Results

1. **Use your context files** — I'll write questions using your personas' language
2. **Fewer questions = higher completion** — Cut anything not tied to a decision
3. **Pre-test with 3-5 people** — Catch confusing wording before launch
4. **Don't ask what you already know** — Pull usage data instead of asking
5. **Consider who won't respond** — Non-responders often differ systematically
6. **Plan analysis first** — If you can't analyze it, don't collect it

## Suggested Updates
After the survey:
- [ ] Add key findings to relevant context files
- [ ] Update `product.md` with insights that affect roadmap
- [ ] Update `personas.md` with new persona insights
