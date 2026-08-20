---
name: board-deck-generator
description: 'Create board meeting decks with clear narrative arc, metrics, and Q&A prep. Use when: board deck, board meeting, investor update, quarterly board.'
disable-model-invocation: true
category: communication
---

# Board Deck Generator

Create board meeting decks with clear narrative arc, metrics, and Q&A prep.

## Output
Write the file to exactly this path:

  work/strategy/outputs/board-deck-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Quarterly board meetings
- Investor updates
- Executive reviews requiring formal presentation
- Annual planning presentations

## The Problem

Board decks are high-stakes but time-consuming. PMs spend days building slides, only to realize they buried the lede, missed key metrics, or failed to prep for tough questions. Bad decks lose board confidence.

**This skill solves it by:** Structuring your deck with a proven 10-slide framework, narrative arc selection (Momentum/Turnaround/Inflection), and Q&A prep—so you present with confidence and keep board trust.

## What You'll Get

I'll generate a complete board deck including:
- 10-slide structure with narrative arc (Momentum, Turnaround, or Inflection)
- Executive summary with TL;DR and asks
- Metrics scorecard with status indicators
- Accomplishments mapped to OKRs
- Product, GTM, team, and financial updates
- Risks and challenges with mitigation
- Q&A prep guide with anticipated questions
- Appendix slides for detail

## What You'll Need

**Critical inputs (ask if not provided):**
- What time period is this covering?
- What's the narrative arc? (Momentum, Turnaround, or Inflection)
- What are your key asks from the board?

**Nice-to-have inputs:**
- Key metrics with current values
- Major accomplishments to highlight
- Specific risks or challenges to address

## Process

### Step 1: Check Your Context
I'll start by reading your context files:
- `context/product.md` — Current metrics, roadmap progress, feature adoption
- `context/company.md` — Strategic priorities, OKRs, team structure, funding stage
- `context/personas.md` — Customer context for "who we serve" narrative
- `context/competitors.md` — Competitive landscape for market positioning

**I'll tell you what I found.** For example:
> "I found your company context: Series B, $25M raised, 85 employees. Your product.md shows ARR at $3.2M with 15% MoM growth. Your Q2 OKRs were 'Expand enterprise' and 'Launch Resource Planning.' I'll structure the deck around progress against these goals and your competitive positioning vs Monday.com."

### Step 2: Gather Board Context
If you haven't provided enough context, I'll ask:
> "Before I create this board deck, I need:
> 1. What period is this covering?
> 2. What's the narrative arc — Momentum (things going well), Turnaround (recovering), or Inflection (decision point)?
> 3. What's your primary ask from the board?
>
> I can pull metrics from product.md and strategic context from company.md."

If metrics are missing, I'll mark sections as `[CEO TO FILL]` rather than inventing data.

### Step 3: Define the Narrative Arc
Every board deck tells a story. I'll help you identify yours:

| Arc Type | When to Use | Structure |
|----------|-------------|-----------|
| **Momentum** | Things are going well | Here's our velocity → here's what's next → here's how you can help |
| **Turnaround** | Recovering from challenges | Here's what happened → here's what we learned → here's the plan |
| **Inflection** | Major decision point | Here's where we are → here are the options → here's our recommendation |

### Step 4: Gather Your Metrics
I'll pull together:
- Financial metrics (ARR, MRR, burn, runway)
- Growth metrics (customers, revenue growth, churn)
- Product metrics (engagement, NPS, key feature adoption)
- Team metrics (headcount, key hires, attrition)

### Step 5: Structure Your Deck
I'll use the 10-slide framework (see template below).

### Step 6: Prepare for Q&A
Board members will ask hard questions. I'll help you anticipate them.

### Step 7: Build Your Appendix
Detailed slides that support the narrative but don't clutter the main deck.

## Output Template

I'll generate this board deck for you:

```markdown
# Board Deck: [Company] — [Quarter/Year]

**Board Meeting Date:** [Date]
**Prepared By:** [CEO/Presenter]
**Narrative Arc:** Momentum / Turnaround / Inflection

## Context
*What I found in your files:*
- **Company stage:** [From company.md — funding, headcount]
- **Strategic priorities:** [From company.md — OKRs, goals]
- **Key metrics baseline:** [From product.md — ARR, growth, retention]
- **Competitive position:** [From competitors.md — market context]
- **Customer context:** [From personas.md — who we serve]

---

## Slide 1: Title

**[Company Name]**
Board Meeting — [Quarter Year]
[Date]

*Presenter: [Name, Title]*

---

## Slide 2: TL;DR / Executive Summary

**Overall:** 🟢 On Track / 🟡 Caution / 🔴 Needs Attention

**3 Key Messages:**
1. [Most important thing the board should know]
2. [Second most important thing]
3. [Third most important thing]

**Today's Asks:**
- [Decision/approval needed]
- [Introduction/connection requested]

---

## Slide 3: Scorecard / Key Metrics

| Metric | Last Quarter | This Quarter | Target | Status |
|--------|--------------|--------------|--------|--------|
| ARR | $X | $Y | $Z | 🟢/🟡/🔴 |
| MRR Growth | X% | Y% | Z% | 🟢/🟡/🔴 |
| Customers | X | Y | Z | 🟢/🟡/🔴 |
| Net Revenue Retention | X% | Y% | Z% | 🟢/🟡/🔴 |
| Burn Rate | $X/mo | $Y/mo | $Z/mo | 🟢/🟡/🔴 |
| Runway | X months | Y months | Z months | 🟢/🟡/🔴 |

---

## Slide 4: What We Accomplished

### Key Wins
- **[Win 1]** — [Impact/metric]
- **[Win 2]** — [Impact/metric]
- **[Win 3]** — [Impact/metric]

### Milestones Hit
- ✅ [Milestone 1]
- ✅ [Milestone 2]

### Progress Against OKRs
| Objective | Key Result | Status |
|-----------|------------|--------|
| [Objective 1] | [KR] | X% |
| [Objective 2] | [KR] | X% |

---

## Slide 5: Product Update

### Shipped This Quarter
- **[Feature 1]** — [One-line description and adoption/impact]
- **[Feature 2]** — [One-line description and adoption/impact]

### Next Quarter Focus
- [Priority 1]
- [Priority 2]
- [Priority 3]

---

## Slide 6: Go-to-Market Update

### Pipeline & Sales
- Pipeline: $X (vs $Y target)
- Win rate: X%
- Average deal size: $X

### Customer Highlights
- **New logos:** [Notable customers]
- **Expansions:** [Notable expansions]
- **Churn:** [Notable losses and why]

---

## Slide 7: Team & Culture

### Headcount
| Department | Start of Q | End of Q | Target |
|------------|-----------|----------|--------|
| Engineering | X | Y | Z |
| Sales | X | Y | Z |
| Total | X | Y | Z |

### Key Hires
- [Name, Role] — [Why notable]

### Organizational Health
- [Any culture/team notes worth sharing]

---

## Slide 8: Financial Deep Dive

### Cash Position
- **Cash on Hand:** $X
- **Monthly Burn:** $X
- **Runway:** X months

### Path to [Profitability/Next Raise]
[Brief narrative on financial trajectory]

### Budget vs Actual
| Category | Budget | Actual | Variance |
|----------|--------|--------|----------|
| Revenue | $X | $Y | +/-% |
| OpEx | $X | $Y | +/-% |

---

## Slide 9: Risks & Challenges

### Risk 1: [Risk Name]
- **What:** [Description]
- **Impact:** [Potential consequence]
- **Mitigation:** [What we're doing]
- **Help Needed:** [None / Board ask]

### Risk 2: [Risk Name]
[Same structure]

### What Kept Us Up at Night
[Honest reflection on concerns]

---

## Slide 10: Asks & Discussion

### Decisions Needed

| Decision | Context | Recommendation | Urgency |
|----------|---------|----------------|---------|
| [Decision 1] | [Brief context] | [Your recommendation] | This meeting |
| [Decision 2] | [Brief context] | [Your recommendation] | Next 30 days |

### Introductions Requested
- [Company/Person] — [Why, how board can help]

### Topics for Discussion
- [Topic we want board input on]

---

## Q&A Preparation Guide

### Expected Questions & Answers

**Q: "Why is [metric] below target?"**
A: [Honest answer with context and plan]

**Q: "What's your biggest concern right now?"**
A: [Honest answer that shows self-awareness]

**Q: "If you could only do one thing next quarter, what would it be?"**
A: [Clear priority with rationale]

**Q: "What are competitors doing?"**
A: [Brief competitive landscape update]

**Q: "How's the team holding up?"**
A: [Honest culture/morale assessment]

---

## Appendix Slides (As Needed)

### A1: Detailed Financial Model
[Link or detailed table]

### A2: Product Roadmap
[Visual or detailed timeline]

### A3: Competitive Landscape
[Detailed competitive analysis]

### A4: Customer Case Studies
[Success stories with metrics]

### A5: Team Org Chart
[Current organization]
```

## Narrative Arc Templates

### Momentum Arc (Things Going Well)
- **Slide 2 Frame:** "We're executing well. Here's our velocity and what we need to keep going."
- **Risks Slide Frame:** "Even with momentum, here's what we're watching."
- **Asks Frame:** "Help us accelerate by..."

### Turnaround Arc (Recovering)
- **Slide 2 Frame:** "We hit challenges in Q[X]. Here's what happened, what we learned, and our path forward."
- **Risks Slide Frame:** "Here's what could still go wrong and how we're preventing it."
- **Asks Frame:** "We need patience on X and support on Y."

### Inflection Arc (Decision Point)
- **Slide 2 Frame:** "We've reached a critical juncture. Here are our options and recommendation."
- **Risks Slide Frame:** "Here are the risks of each path."
- **Asks Frame:** "We need a decision on X to move forward."

## Framework Reference
**10-Slide Board Deck Structure:**
1. Title
2. Executive Summary (TL;DR + Asks)
3. Scorecard (Key Metrics)
4. Accomplishments
5. Product Update
6. Go-to-Market Update
7. Team & Culture
8. Financials
9. Risks & Challenges
10. Asks & Discussion

## Tips for Best Results
1. **Use your context files** — I'll pull metrics from product.md, strategy from company.md
2. **Lead with the TL;DR** — Busy board members may only read slide 2
3. **Be honest about challenges** — Boards appreciate transparency over spin
4. **Make asks explicit** — Don't bury what you need
5. **Prepare the Q&A** — The questions you fear are the ones to prepare for
6. **Use appendix liberally** — Detail belongs in backup slides
7. **Update your context files after** — New metrics, decisions, asks go back into product.md

## Suggested Updates
After the board meeting:
- [ ] Update `product.md` with new targets or metrics discussed
- [ ] Update `company.md` with any strategic decisions
- [ ] Log board feedback for next quarter's deck
