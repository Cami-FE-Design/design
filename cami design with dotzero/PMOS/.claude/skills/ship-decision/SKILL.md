---
name: ship-decision
description: 'Decide whether to ship, iterate, or kill a feature using structured evidence and risk analysis. Use when: should we ship, go no-go, launch decision, ship decision.'
disable-model-invocation: true
category: strategy
---

# Ship Decision

Decide whether to ship, iterate, or kill a feature using structured evidence and risk analysis.

## Output
Write the file to exactly this path:

  work/specs/outputs/ship-decision-[feature]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- You've built something and need to decide: ship it, iterate more, or kill it
- Preparing for a go/no-go meeting and need a structured recommendation
- Stakeholders disagree on whether something is "ready"
- You're caught between perfectionism and shipping pressure

## What You'll Need

**Critical inputs (ask if not provided):**
- What feature/product are you deciding on?
- What's the current state? (beta, internal, soft launch, etc.)

**Helpful (improves analysis):**
- Any data you have (usage metrics, bug reports, user feedback)
- What's already been tried or iterated on
- Timeline or external pressure (competitor launch, customer commitment, etc.)

## Process

### Step 1: Check Your Context
Read the user's context files to understand what you already know:
- `context/product.md` — Is this feature on the roadmap? What's the current state?
- `context/company.md` — Are there strategic pressures (funding, competitive, customer)?
- `context/personas.md` — Who is this for? What's their tolerance for rough edges?
- `context/competitors.md` — Are competitors already shipping this? Is speed critical?

**Tell the user what you found.** For example:
> "I found 'Smart Notifications' in your roadmap — it's been in development since Q1. Your persona (Jordan) values reliability over speed. Competitors don't have this yet, so there's no external urgency."

### Step 2: Establish the Decision Frame
Before analyzing, clarify what kind of decision this is:

**Reversibility check:**
- **Reversible (two-way door):** Ship fast, learn, iterate. Cost of being wrong is low.
- **Irreversible (one-way door):** Be thorough. Cost of being wrong is high (data migration, pricing change, public API, contractual commitment).

**Ask the user if unclear:**
> "Is this reversible? If we ship and it's wrong, can we pull it back or iterate — or are we locked in?"

Most features are two-way doors. PMs over-classify decisions as one-way doors, which causes slow shipping.

### Step 3: Gather Evidence
Organize what you know across four dimensions:

**Quality signals:**
- Bug count and severity (P0/P1/P2)
- Edge cases handled vs. known gaps
- Performance metrics (load time, error rates)
- Test coverage and confidence

**User signals:**
- Beta/dogfooding feedback (positive and negative)
- Task completion rates
- User quotes or sentiment
- Support ticket preview (what will users ask about?)

**Business signals:**
- Customer commitments or deadlines
- Competitive pressure
- Revenue or retention impact
- Cost of delay (opportunity cost of the team staying on this)

**Team signals:**
- Engineering confidence ("would you put your name on this?")
- Design confidence ("does this meet the bar?")
- Known tech debt being created
- Team morale and momentum

**If data is thin, say so:**
> "I don't have usage data or beta feedback to work with. I'll analyze based on what you've told me, but flag where data would change the recommendation."

### Step 4: Apply the Ship Decision Matrix
Score each dimension and map to a recommendation:

| Signal | Strong Ship | Acceptable | Weak — Needs Work |
|--------|------------|------------|-------------------|
| **Quality** | No P0/P1 bugs, edge cases handled | Minor P2 bugs, workarounds exist | P0/P1 open, known data issues |
| **User** | Positive feedback, high completion | Mixed feedback, usable but rough | Confused users, low completion |
| **Business** | Clear deadline or competitive need | Nice to have, no urgency | No clear business case for now |
| **Team** | High confidence across eng + design | Some concerns, but manageable | Low confidence, "shipping to ship" |

### Step 5: Evaluate the Three Options

**Option A: Ship Now**
- What's the minimum bar to ship? Does this meet it?
- What known issues are acceptable to ship with? (document them)
- What's the rollback plan if things go wrong?
- What's the monitoring plan for the first 48 hours?

**Option B: Iterate (time-boxed)**
- What specific gaps would iteration close?
- How long? (Must be time-boxed: 1 sprint, 2 weeks max)
- What's the exit criteria? When do you stop iterating?
- What's the cost of this delay? (team capacity, competitive window)

**Option C: Kill / Shelf**
- Is the problem still worth solving?
- Has the evidence changed since you started?
- What did you learn that applies elsewhere?
- How do you communicate this to stakeholders?

### Step 6: Generate Recommendation
Produce one clear recommendation with supporting evidence.

**The recommendation must be one of:**
1. **Ship** — with known issues documented and monitoring plan
2. **Iterate** — with time-box, specific gaps to close, and exit criteria
3. **Kill** — with rationale and learnings to preserve

## Output Template

```markdown
# Ship Decision: [Feature Name]

**Decision:** Ship / Iterate / Kill
**Date:** [Date]
**Owner:** [PM Name]
**Reversibility:** Two-way door / One-way door

## Context
*What I found in your files:*
- **Roadmap:** [Feature status from product.md]
- **Strategic pressure:** [From company.md — deadlines, competitive, customer]
- **User tolerance:** [From personas.md — rough edges OK or reliability-first?]
- **Competitive:** [From competitors.md — urgency level]

## Evidence Summary

### Quality Signals
| Signal | Status | Detail |
|--------|--------|--------|
| P0/P1 bugs | ✅ None / ⚠️ [Count] open | [Details] |
| Edge cases | ✅ Handled / ⚠️ [Gaps] | [Details] |
| Performance | ✅ Meets bar / ⚠️ [Issues] | [Details] |

### User Signals
| Signal | Status | Detail |
|--------|--------|--------|
| Beta feedback | ✅ Positive / ⚠️ Mixed / 🔴 Negative | [Details] |
| Task completion | ✅ High / ⚠️ Moderate / 🔴 Low | [Details] |
| User sentiment | [Quotes or summary] | |

### Business Signals
| Signal | Status | Detail |
|--------|--------|--------|
| Deadline/commitment | ✅ Yes: [Date] / ⚠️ Soft / 🔴 None | [Details] |
| Competitive pressure | ✅ High / ⚠️ Moderate / 🔴 Low | [Details] |
| Cost of delay | [What the team could be doing instead] | |

### Team Signals
| Signal | Status | Detail |
|--------|--------|--------|
| Eng confidence | ✅ High / ⚠️ Concerns / 🔴 Low | [Details] |
| Design confidence | ✅ High / ⚠️ Concerns / 🔴 Low | [Details] |
| Tech debt created | ✅ Minimal / ⚠️ Some / 🔴 Significant | [Details] |

## Recommendation: [Ship / Iterate / Kill]

**Why:**
[2-3 sentences explaining the core reasoning]

**Key factor:**
[The single most important signal driving this recommendation]

### If Ship:
- **Known issues shipping with:** [List with severity]
- **Rollback plan:** [How to undo if needed]
- **Monitoring plan (first 48 hrs):** [What to watch]
- **Fast-follow items:** [What to fix in next sprint]

### If Iterate:
- **Time-box:** [Specific duration — max 2 weeks]
- **Gaps to close:** [Specific items, not vague "polish"]
- **Exit criteria:** [When you stop — metrics or checklist]
- **Cost of delay:** [What the team isn't doing during this time]

### If Kill:
- **Rationale:** [Why the problem isn't worth solving now]
- **Learnings to preserve:** [What you learned]
- **Communication plan:** [How to tell stakeholders]

## Decision Log
| Factor | Weight | Assessment |
|--------|--------|------------|
| Quality | [H/M/L] | [Strong / Acceptable / Weak] |
| User signals | [H/M/L] | [Strong / Acceptable / Weak] |
| Business signals | [H/M/L] | [Strong / Acceptable / Weak] |
| Team confidence | [H/M/L] | [Strong / Acceptable / Weak] |
| Reversibility | — | [Two-way / One-way door] |

## Open Questions
- [Any unresolved items that could change the recommendation]
```

## Framework Reference

This skill combines several proven decision frameworks:

- **Two-Way / One-Way Door** (Jeff Bezos/Amazon) — Reversible decisions should be made quickly. Irreversible decisions deserve more analysis.
- **Ship Decision Matrix** — Evaluates readiness across quality, user, business, and team dimensions.
- **Time-boxed Iteration** — If iterating, always set a deadline and exit criteria. Open-ended "polish" kills momentum.

**Key insight:** Most PM teams ship too slowly, not too fast. The default should be "ship" unless evidence clearly says otherwise. Perfectionism disguised as quality is the most common shipping blocker.

## Tips for Best Results

1. **Bias toward shipping** — If it's a two-way door and signals are mostly green, ship it. You'll learn more from real users than another sprint of polish.
2. **Time-box everything** — "Iterate" without a deadline becomes "never ship." Set exit criteria before you start iterating.
3. **Document known issues** — Shipping with known P2 bugs is fine. Shipping with undocumented P2 bugs is not.
4. **Cost of delay is real** — Every sprint on this feature is a sprint NOT spent on the next thing. Make that cost explicit.
5. **Update your context files** — Add the decision and outcome to `context/product.md` so future decisions have history to reference.
