---
name: strategic-roadmap-review
description: "Run a structured strategic review before planning your next roadmap — assess what happened, what worked, and what didn't, then define where you're going and why. Use when: strategic review, roadmap review, quarterly review, planning cycle, look back then look forward."
disable-model-invocation: true
category: strategy
---

# Strategic Roadmap Review

A facilitated thinking exercise that walks you through a structured "look back, then look forward" review before building your next roadmap. The output is a strategic review document you can share with stakeholders to drive alignment before the roadmap conversation.

**Time:** 45-60 minutes as a facilitated conversation.

## Output
Write the file to exactly this path:

  work/strategy/outputs/roadmap-review-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Before any roadmap planning cycle (quarterly, half, annual)
- At the start of a new quarter or planning period
- After a major strategic shift or market change
- When the team feels disconnected from what matters
- Before board meetings or strategy offsites

## The Problem

Most PMs jump straight into "what should we build next?" without honestly assessing what happened. Previous roadmap items quietly disappear. Business health gets hand-waved. Customer learnings get ignored. The result: roadmaps disconnected from reality that repeat past mistakes.

Strategic planning requires two modes of thinking — reflection and direction. This skill forces you through both, in order, by asking the hard questions most teams skip.

## What You'll Get

A stakeholder-ready strategic review document with:
- **Business assessment** — what's going well, what needs attention
- **Product assessment** — what's working, what isn't
- **Customer & discovery learnings** — what you learned from users that should shape what's next
- **Previous roadmap scorecard** — what shipped, what didn't, and why
- **Business objectives** for the next period, with trade-off clarity
- **Leading product outcomes** aligned to those objectives
- **Strategic initiatives** that roll up, reality-checked against capacity
- **Explicit "not doing" list** — what you're deferring, what you're declining, and why

Share this with your leadership team, stakeholders, or board to align on strategic direction *before* building the tactical roadmap. Then hand it to the roadmap builder skill for the Now/Next/Later plan.

## What You'll Need

**Required:**
- Planning period you're reviewing (e.g., "Q4 2025" or "H2 2025")
- Planning period you're planning for (e.g., "Q1 2026")

**Helpful (from context files or provided):**
- Previous roadmap or plan (what was committed)
- Key metrics and how they moved
- Business context (revenue, growth, churn, deals won/lost)
- Customer feedback, interview insights, or discovery learnings
- Known market or competitive changes

**Cold start?** If you're a new PM inheriting a product or there's no previous roadmap, that's fine. Skip the Roadmap Scorecard step and focus on the health assessments and look-forward. You can still build a strong strategic foundation without a retrospective.

## How This Works

This is a **facilitated conversation**, not a one-shot generation. I'll walk you through each section, ask focused questions, and push back when answers are vague. You do the thinking — I structure it.

We'll move through each section one at a time. After each section, I'll summarize what I heard and confirm before moving on. At the end, I'll compile everything into the final document.

**Pacing note:** The look-back can easily consume the entire session if there's a lot to unpack. If we're running long on the retrospective, I'll summarize what we have and move to the look-forward. We can always go deeper later.

## Process

### Step 1: Set the Stage
I'll read your context files (product.md, company.md, personas.md, competitors.md) and summarize what I found.

Then I'll confirm:
- What period are we reviewing?
- What period are we planning for?
- Is there a previous roadmap or plan I should reference?

---

## Part 1: Look Back

### Step 2: Business Health Assessment
I'll ask you to walk me through the business:

**What's going well?**
> "What areas of the business have momentum right now? Where are you winning — revenue, retention, market position, team, partnerships? What should you protect and double down on?"

**What needs attention?**
> "What areas are declining, stalling, or at risk? Where are you losing ground — churn, pipeline, competitive pressure, team gaps? What requires retention effort or course correction?"

For each area you raise, I'll push for evidence:
> "What's the signal that tells you this? Is it a metric, customer feedback, gut feel? How confident are you?"

I won't accept vague answers. If you say "growth is good," I'll ask "good relative to what? What's the number?"

### Step 3: Product Health Assessment
Same honest assessment, focused on the product:

**What's working?**
> "Which features, flows, or capabilities are driving value? What do users love? What's your product's strongest asset right now?"

**What's not working?**
> "Where is there friction, low adoption, or user complaints? What did you build that isn't delivering? What's embarrassing?"

Again, I'll push for specifics. "Users don't like X" becomes "what's the evidence? Usage data? Support tickets? Interview feedback?"

### Step 4: Customer & Discovery Learnings
This is the step most teams skip — and it's where the best product leaders differentiate their planning.

> "What did you learn from customers this period that surprised you? What came up in interviews, support conversations, or usage data that you didn't expect?"

> "What opportunities did discovery surface that aren't on the current roadmap? Are there user needs or market signals you've been ignoring?"

> "Did customer behavior confirm or contradict your assumptions from last period?"

A strategic review that doesn't include what you learned from customers is strategy by spreadsheet. This step ensures the look-forward is grounded in real user evidence, not just business metrics.

### Step 5: Previous Roadmap Scorecard
This is the hardest and most valuable part. I'll walk through what was on the previous roadmap:

> "What were your top commitments for [previous period]? Let's go through each one."

For each item, I'll ask which category it falls into:
- **Shipped & delivered the expected outcome** — It worked. What made it successful?
- **Shipped but didn't move the needle** — It went out but the hypothesis was wrong. What did you learn?
- **Shipped, but should we have built it at all?** — The outcome was the wrong outcome. Your strategy was off, not your execution.
- **Didn't ship** — What happened? Scope creep, dependencies, priority shift, capacity?

Then I'll push for patterns:
> "Looking across everything — what's the pattern? Are you consistently over-scoping? Under-resourcing? Getting pulled into reactive work? What's the one thing you'd do differently?"

**I won't let you skip items that didn't ship.** The temptation is to focus on wins. The value is in the honest accounting.

---

### Synthesis: Connecting Back to Forward

Before we move on, I'll pause and ask the key question:

> "Given everything we just reviewed — the business strengths and risks, the product wins and gaps, what customers told you, and the patterns from your last roadmap — what's the single most important thing this tells you about the next period? What must be true for the next plan to be better than the last one?"

This is the bridge. The look-back isn't just an exercise — it directly shapes the look-forward. Your answer here sets the strategic frame for everything that follows.

---

## Part 2: Look Forward

### Step 6: Business Objectives
Based on the look-back and your strategic context, I'll ask:

> "What does the business need to achieve in [next period]? Not product features. Business outcomes."

I'll push each objective to be specific:
> "How will you know if you achieved this? What's the metric? What's the target?"

I'll connect it back to the look-back:
> "Is this objective doubling down on a strength you identified, or addressing a risk? Where does it come from?"

And I'll challenge whether it's the *right* objective:
> "Is this the most important thing the business could achieve this period? What happens if you're wrong about this one?"

**When you have multiple objectives, I'll ask about trade-offs:**
> "If these objectives conflict — and they will — which wins? If 'grow revenue' and 'reduce churn' compete for the same engineering resources, what's the priority?"

Real strategy is about trade-offs. A plan with five equal-priority objectives has no priorities.

### Step 7: Product Outcomes & Strategic Initiatives
For each business objective:

> "What product changes would drive this business outcome? These are the leading indicators — the product metrics that move before the business metric does."

I'll help you distinguish outcomes from outputs:
> "That sounds like a feature, not an outcome. What changes for the user or the business if you build that?"

Then we'll map the initiatives — the major bets that deliver each product outcome:
> "What are the strategic moves you'd make to achieve these outcomes? Not a backlog — the 3-5 major bets for this period."

Each initiative must trace back: Initiative → Product Outcome → Business Objective. If an initiative can't trace back, it doesn't belong.

**I'll challenge scope:**
> "You've listed 7 initiatives. How many can your team realistically run in parallel? Are you planning for the team you have, or the team you wish you had?"

> "What's the riskiest assumption in this initiative? What would have to be true for it to work?"

### Step 8: What We're NOT Doing (and Why)

I'll ask about two distinct categories:

**Deferring** — right idea, wrong time:
> "What are you pushing to a future period? Why not now? What would change to make this the right time?"

**Declining** — wrong direction for your strategy:
> "What are stakeholders asking for that you're saying no to? What's been requested that doesn't fit your strategy?"

For each item:
> "Who will push back on this decision? What's your answer when they do?"

This turns the "not doing" list from a planning artifact into a stakeholder alignment tool. The document doesn't just list what's deferred — it arms you with the rationale for the conversations that will happen.

---

### Compile the Document
After we've worked through every section, I'll compile your thinking into a clean, shareable document. Nothing in it will be a surprise — it's a synthesis of what you told me, structured for stakeholder consumption.

## Output Template

```markdown
# Strategic Roadmap Review: [Period Under Review] → [Period Ahead]

## Context
- **Period reviewed:** [Quarter/Half/Year]
- **Planning for:** [Next period]
- **Sources:** [Context files referenced + inputs provided]

---

# PART 1: LOOK BACK

## Business Health Assessment

### Going Well (Protect & Double Down)
| Area | Evidence | Implication for Next Period |
|------|----------|-----------------------------|
| [Area of strength] | [Specific metrics or signals] | [What this means for planning] |

### Needs Attention (Retain & Course-Correct)
| Area | Evidence | Implication for Next Period |
|------|----------|-----------------------------|
| [Area of concern] | [Specific metrics or signals] | [What this means for planning] |

---

## Product Health Assessment

### Working Well (Protect)
| Area | Evidence | Implication for Next Period |
|------|----------|-----------------------------|
| [Product strength] | [Usage, adoption, feedback] | [What this means for planning] |

### Not Working (Fix or Rethink)
| Area | Evidence | Implication for Next Period |
|------|----------|-----------------------------|
| [Product weakness] | [Usage, adoption, feedback] | [What this means for planning] |

---

## Customer & Discovery Learnings
- **Surprises:** [What you learned that was unexpected]
- **Unmet needs surfaced:** [Opportunities discovery revealed]
- **Assumptions validated/invalidated:** [What customer behavior confirmed or contradicted]

---

## Previous Roadmap Scorecard

### What Was Planned vs. What Happened

| Initiative | Planned Outcome | Status | Actual Outcome |
|------------|-----------------|--------|----------------|
| [Initiative] | [What we expected] | Shipped & delivered / Shipped, didn't move needle / Wrong bet / Didn't ship | [What actually happened] |

### Patterns & Learnings
- **Shipped & delivered:** [What worked and why]
- **Shipped but didn't move the needle:** [What we learned about our assumptions]
- **Wrong bet:** [Where our strategy was off, not just execution]
- **Didn't ship:** [Root causes]
- **Key takeaway for next period:** [The one thing to do differently]

---

## Synthesis
**The single most important insight from this review:**
[What the look-back tells us about what must be true for the next period]

---

# PART 2: LOOK FORWARD

## Business Objectives
*What the business needs to achieve in [next period]*

| Objective | Connected to (Look-Back) | Key Metric | Target |
|-----------|--------------------------|------------|--------|
| [Business objective] | [Strength to leverage or risk to address] | [How we'll measure] | [Specific target] |

**Priority trade-off:** If [Objective A] and [Objective B] conflict, [which wins and why].

---

## Leading Product Outcomes
*The product changes that will drive business objectives*

| Product Outcome | Drives Objective | Current Baseline | Target |
|-----------------|------------------|------------------|--------|
| [Outcome] | [Which business objective] | [Current number or PLACEHOLDER] | [Target] |

---

## Strategic Initiatives
*The major bets for [next period]*

| Initiative | Drives Outcome | Riskiest Assumption | Why This Initiative |
|------------|----------------|---------------------|---------------------|
| [Initiative] | [Which product outcome] | [What must be true] | [Rationale, connected to the review] |

**Capacity check:** [X] initiatives mapped against [team size/capacity]. [Realistic / Stretch / Overcommitted].

---

## What We're NOT Doing

### Deferring (Right Idea, Wrong Time)
| Item | Why Not Now | Revisit When |
|------|------------|--------------|
| [Deferred item] | [Clear rationale] | [Trigger or timeframe] |

### Declining (Wrong Direction for Our Strategy)
| Item | Who's Asking | Why We're Saying No |
|------|--------------|---------------------|
| [Declined item] | [Stakeholder] | [Strategic rationale] |

---

## Assumptions to Validate
*Things I inferred that you should confirm:*
- ⚠️ [Assumption 1]
- ⚠️ [Assumption 2]

---

## Next Step
Hand this document to the roadmap builder skill to create the tactical Now/Next/Later plan:

> Paste this review into a new conversation and say: **"Build a roadmap based on this strategic review."**

The roadmap builder will use your business objectives, product outcomes, and strategic initiatives as inputs — skipping the context-gathering it would normally do — and organize them into Now/Next/Later with dependencies, owners, and timelines.
```

## Framework Reference

This skill uses a **look back, then look forward** framework that combines several proven approaches:

1. **Honest assessment before ambition** — You can't plan where to go without understanding where you are. The look-back forces uncomfortable honesty about what worked and what didn't. This mirrors what Marty Cagan teaches about informed decision-making in *Inspired* — strategy grounded in current reality, not aspirational thinking.

2. **Customer evidence in strategic planning** — Teresa Torres's continuous discovery framework emphasizes that product decisions should be grounded in customer evidence, not just business metrics. The Customer & Discovery Learnings step ensures the look-forward is shaped by what users actually told you.

3. **Business → Product → Initiatives chain** — Every initiative connects to a product outcome, which connects to a business objective. No orphaned features. This outcome-based roadmapping approach comes from Cagan's vision → strategy → discovery → delivery stack.

4. **Previous roadmap accountability** — Reviewing what shipped (and didn't) prevents quietly abandoning commitments and repeating the same over-scoping. The scorecard categories (delivered / didn't move the needle / wrong bet / didn't ship) force different types of learning from each.

5. **Explicit "not doing" list** — Shreyas Doshi emphasizes that what you choose not to do is as strategic as what you pursue. Splitting into "deferring" (right idea, wrong time) and "declining" (wrong direction) gives you sharper language for stakeholder conversations.

6. **Facilitated conversation over template filling** — The value is in being pushed to think honestly, not in having a document generated for you.

## Tips for Best Results

1. **Be honest in the look-back** — The value is in the uncomfortable truths. Don't skip items that didn't ship or features that underperformed.
2. **Have your metrics ready** — The more specific you can be about numbers, the stronger the document. Vague assessments produce vague plans.
3. **Bring customer evidence** — Even informal insights from support tickets or sales calls count. The review is stronger with real user signal.
4. **Do this before roadmap building** — This produces the strategic inputs. Then use the roadmap builder skill for the tactical Now/Next/Later plan.
5. **Share the look-back with stakeholders first** — Get alignment on "where we are" before debating "where we're going." It changes the conversation.
6. **Revisit the "not doing" list mid-period** — Circumstances change. The rationale for deferral might no longer hold.
