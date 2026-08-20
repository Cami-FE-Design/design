---
name: set-goals
description: "Set up your full strategic goals — narrative, business objectives, product goals, and OKRs with deeper strategic alignment. Use when: set goals, goal setting, OKRs, quarterly goals, business objectives, strategic planning."
disable-model-invocation: true
category: cc
---

# Set Goals

Build your full `context/goals.md` with strategic narrative, business objectives, product goals, and what you're NOT doing. This is the deep version — if you ran the welcome skill, you already have a quick goals file. This skill replaces it with a complete one.

## Output

Write the file to exactly this path:

  work/strategy/outputs/goals-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today's UTC date as 10 characters, hyphenated (e.g. `2026-05-27`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.

**Every artifact MUST start with this literal YAML frontmatter block. Copy verbatim — do not paraphrase. Replace bracketed placeholders only; do NOT add prose before the opening `---`.**

```yaml
---
id: [generate via the `ulid` npm package — NOT crypto.randomUUID()]
type: okr
title: "[human-readable artifact title]"
created_at: [ISO-8601 UTC, e.g. 2026-04-27T20:30:00Z, from `new Date().toISOString()`]
skill: set-goals
---
```

Optional fields you MAY emit when known: `product`, `work_area: strategy`, `created_by`, `derived_from` (paths consumed), `related`, `supersedes`, `tags`. See `.claude/state/frontmatter-schema.md` for the full schema.

## When to Use This Skill

- After the welcome skill when you want deeper strategic alignment
- Quarterly planning — refresh goals for the new quarter
- When you have strategy docs to extract goals from (pitch deck, OKRs, roadmap)
- When downstream skills (roadmap builder, prioritization engine) need stronger goal context

## What You'll Get

A complete `context/goals.md` with:
- **Strategic Narrative** — 5-sentence story (vision → current state → milestone → business impact → customer outcome)
- **Business Objectives** — 2-3 measurable business targets
- **Product Goals** — 2-3 product goals mapped to business objectives
- **What We're NOT Doing** — Explicit anti-goals that give skills permission to deprioritize
- **Open Questions** — Unresolved strategic questions to track

## How Downstream Skills Use Goals

| Goals Section | Skills That Reference It |
|---------------|------------------------|
| Strategic Narrative | Roadmap builder (aligns features to vision), PRD generator (frames problem in strategic context) |
| Business Objectives | Prioritization engine (scores against business impact), weekly metrics skill (tracks objective progress) |
| Product Goals | Roadmap builder (maps initiatives to goals), OKR coach (validates OKRs against goals) |
| What We're NOT Doing | Prioritization engine (confidently deprioritizes), roadmap builder (excludes out-of-scope work) |
| Success Metrics | A/B test designer (knows what to measure), experiment designer (defines success criteria) |

---

## Process

### Step 1: Check Context and Existing Goals

Read these context files to inform goal-setting:
- `context/company.md` — business model, stage, market context
- `context/product.md` — current metrics, roadmap priorities, known gaps
- `context/personas.md` — who you're building for, their JTBD
- `context/competitors.md` — competitive dynamics, where you win/lose
- `context/goals.md` — existing goals if any

Surface relevant context when asking questions later. For example, if company.md shows ARR of $4.2M, or product.md shows retention below target, reference these when helping the user set informed objectives.

**If goals.md has real content (from the welcome skill or previous run):**
```
I see you already have goals set up:

Priority: [current priority]
Success Metric: [current metric]
NOT Doing: [current anti-goals]

Want me to:
1. Build on this — add strategic narrative and objectives
2. Start fresh — replace everything
3. Cancel
```

**If goals.md is empty or placeholder:**
→ Continue to Step 2

---

### Step 2: Choose Your Path

```
Let's set up your strategic goals. Two ways to do this:

1. Upload strategy docs (faster if you have them)
   → Pitch deck, OKR doc, roadmap, quarterly plan
   → I'll extract goals automatically

2. Answer questions (5 minutes)
   → I'll walk you through it

Which do you prefer?
```

---

### Step 3A: Extract from Documents

**If user chooses to upload docs:**

```
Drop your strategy docs here. I can work with:
- Pitch decks, roadmap docs, quarterly plans
- OKR documents, strategy memos
- Board presentations, investor updates

Paste the content or tell me the file paths.
```

**After receiving docs:**

Read all uploaded files. Extract goals by scanning for:
- **Vision statements** — "Our vision is...", "We're building toward..."
- **Measurable objectives** — Revenue targets, growth goals, metric targets
- **Product initiatives** — Features, launches, improvements with timelines
- **Explicit exclusions** — "We're not doing...", "Out of scope..."

Cross-reference extracted goals with context files (from Step 1) to validate alignment and fill gaps.

**Show extracted content:**

```
Here's what I found:

## Strategic Narrative
> [extracted narrative]

## Business Objectives
[list extracted objectives with metrics]

## Product Goals
[list extracted goals with objective mappings]

## What We're NOT Doing
[list extracted anti-goals]

Confidence:
- Strategic Narrative: [high/medium/low]
- Business Objectives: [high/medium/low]
- Product Goals: [high/medium/low]

Where I'm less confident, I've marked with a flag.

Should I save this? (yes / edit first)
```

**If "yes":** Save to `context/goals.md` → Skip to Step 4
**If "edit first":** Ask what to change, update, then save

---

### Step 3B: Question-Based Goals

**If user chooses questions:**

#### Part 1: Strategic Narrative (Required)

```
Let's build your strategic narrative. Answer each prompt
in 1-2 sentences:

1. Our vision is...
   (Where are we going? What does the world look like if we win?)

2. Currently we are...
   (Where are we today? What stage, what traction?)

3. By the end of [Q/year], we will...
   (What's the next milestone?)

4. And drive the business by...
   (What business impact does that milestone create?)

5. This will empower customers to...
   (What can customers do that they couldn't before?)
```

Wait for answers. Structure into narrative:

```
Here's your strategic narrative:

> Our vision is [sentence 1].
> Currently we are [sentence 2].
> By the end of [timeframe], [sentence 3],
> and drive the business [sentence 4].
> This will empower customers to [sentence 5].

Sound right? (yes / edit)
```

#### Part 2: Business Objectives

```
What are your top 2-3 business objectives for this quarter?

Each one should be measurable. Examples:
- Increase MRR from $50K to $100K
- Reduce churn from 5% to 3%
- Expand to enterprise segment (first 3 deals)
- Increase activation rate from 30% to 50%
```

Wait for response.

#### Part 3: Product Goals

```
Now, what 2-3 product goals drive those business objectives?

Format: [Goal] → drives [Business Objective]

Examples:
- Launch onboarding flow → drives activation (reduces churn)
- Add API access → drives enterprise expansion
- Rebuild pricing page → drives MRR growth
```

Wait for response.

#### Part 4: Anti-Goals

```
Last one — what are you deliberately NOT doing this quarter?

This is the most important question for prioritization skills.
It gives every skill permission to say no.

Examples:
- Not building enterprise features yet
- Not expanding to new markets
- Not rebuilding the mobile app
- Not pursuing partnerships
```

Wait for response.

---

### Step 4: Save and Confirm

Generate `context/goals.md` using the template below. Save it.

```
Goals saved!

Here's what this unlocks:

- The roadmap builder will align features to your business objectives
- The prioritization engine will score backlog against your goals
- The PRD generator will frame problems in your strategic context
- The weekly metrics skill will track progress against your success metrics
- The experiment designer will design tests around your product goals

You can update goals.md anytime — edit the file directly
or run this skill again next quarter.
```

---

## Goals Template

```markdown
# Goals

## Strategic Narrative

> [5-sentence narrative from extraction or questions]

---

## Current Focus (Q[X] 202X)

### Business Objectives

1. **[Objective 1]** — measured by [metric], target: [target]
2. **[Objective 2]** — measured by [metric], target: [target]
3. **[Objective 3]** — measured by [metric], target: [target]

### Product Goals (How We Drive Business)

1. **[Product Goal 1]** → drives [Business Objective]
   - Key results: [specific deliverables or milestones]
2. **[Product Goal 2]** → drives [Business Objective]
   - Key results: [specific deliverables or milestones]
3. **[Product Goal 3]** → drives [Business Objective]
   - Key results: [specific deliverables or milestones]

### What We're NOT Doing

- [Anti-goal 1]
- [Anti-goal 2]
- [Anti-goal 3]

### Success Metrics

| Metric | Current | Target | Timeframe |
|--------|---------|--------|-----------|
| [Metric 1] | [current] | [target] | [Q/date] |
| [Metric 2] | [current] | [target] | [Q/date] |
| [Metric 3] | [current] | [target] | [Q/date] |

---

## Open Questions

- [ ] [Unresolved strategic question 1]
- [ ] [Unresolved strategic question 2]
```

---

## Tips for Best Results

**For document extraction:**
- Pitch decks and quarterly plans work best — they contain goals, metrics, and strategy in condensed form
- OKR docs give the most precise objectives
- If extraction confidence is low, supplement with questions

**For question-based:**
- Keep answers to 1-2 sentences — you can add detail later
- Business objectives should be measurable (include a number)
- Product goals should map to a business objective
- Anti-goals are the most valuable input — be specific about what you're saying no to

**Updating goals:**
- Run this skill each quarter to refresh
- Edit `context/goals.md` directly for quick updates
- Goals don't need to be perfect — directionally correct is enough for skills to work well

---

## Framework Reference

- **Strategic Narrative:** Amazon-style working backwards narrative
- **Business Objectives:** OKR methodology (John Doerr)
- **Product Goals:** Product Strategy Stack (Marty Cagan)
- **Anti-Goals:** Inspired by Amazon's "tenets" — what we believe and what we choose NOT to do

---

## Time

**With docs:** 3-5 minutes (upload → extract → review → save)
**With questions:** 5-7 minutes (narrative → objectives → goals → anti-goals → save)
**vs. Starting from scratch:** 2-3 hours to align strategy docs into a usable goals file
