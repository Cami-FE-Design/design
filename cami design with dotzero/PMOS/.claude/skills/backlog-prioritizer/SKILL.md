---
name: backlog-prioritizer
description: 'Prioritize large backlogs into P0/P1/P2 groups using RICE scoring with strategic overrides. Use when: prioritize backlog, organize backlog, triage backlog.'
disable-model-invocation: true
category: planning
---

# Backlog Prioritizer

Prioritizes large backlogs into P0/P1/P2 groups using RICE scoring (Reach × Impact × Confidence / Effort) with strategic overrides.

## Output
Write the file to exactly this path:

  work/strategy/outputs/backlog-priority-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- Sprint planning with a large backlog (10+ items)
- Quarterly backlog triage
- Stakeholder alignment on what's NOT getting done
- New PM inheriting a messy backlog

**For smaller comparisons (5-10 items):** Use the prioritization-engine skill instead.

## The Problem

Backlogs grow to 100+ items. Everyone thinks their thing is urgent. Without a framework, prioritization becomes politics, not strategy. Sprint planning turns into a 2-hour argument.

**This skill solves it by:** Applying quantitative RICE scoring with strategic context from your company/product files—so prioritization decisions are defensible, documented, and aligned to business priorities.

## What You'll Get

- Scored and ranked backlog
- P0/P1/P2/P3 groupings mapped to action
- Strategic overrides documented and justified
- Low confidence items flagged for discovery
- Items NOT making the cut (with rationale)

## What You'll Need

**Required:**
- Backlog items (10+ recommended for this skill)
- Sprint/quarter capacity (how many items can you do?)

**Helpful:**
- Request counts or votes per item
- Lost deal data
- Effort estimates
- Strategic priorities for override decisions

## Process

### Step 1: Check Your Context
I'll start by reading your context files:
- `context/company.md` — Strategic priorities for override decisions
- `context/product.md` — Known issues, roadmap items, current priorities
- `context/personas.md` — Which users care about which items?
- `context/competitors.md` — Competitive pressure that might warrant priority bumps
- Research files — Feedback or feature requests with frequency data

**I'll tell you what I found.** For example:
> "I found your strategic priorities in company.md ('Win Agency Vertical', 'Expand AI'). Your product.md lists 'Reporting is too basic' as a known issue. I'll factor these into prioritization and flag any backlog items that align with strategic priorities for potential override."

### Step 2: Gather Backlog Items
If you haven't provided the backlog, I'll ask:
> "I need your backlog to prioritize. Please share:
> 1. The list of items (paste or point to a file)
> 2. How many items can you realistically complete this sprint/quarter?
> 3. Any items that are revenue-blocking or executive mandates?"

**If I find existing data:**
> "I see feedback data in your files. Should I cross-reference the backlog with customer request frequency?"

### Step 3: Apply RICE Scoring
For each item, score:
- **Reach:** Users affected per quarter
- **Impact:** 0.25× (minimal) to 3× (massive)
- **Confidence:** 20% (guess) to 100% (certain)
- **Effort:** Person-weeks

**Cite sources for scores:**
> "Reach: 340 (all customers from company.md)"
> "Impact: 2× — Jordan persona cites this as top pain point"
> "Confidence: 60% — mentioned in feedback but limited validation"
> "Effort: 3 weeks — [ask for eng estimate if not provided]"

### Step 4: Calculate and Rank
RICE Score = (Reach × Impact × Confidence) / Effort

### Step 5: Apply Priority Groupings

| Priority | Definition | Action |
|----------|------------|--------|
| **P0** | Urgent, do now | This sprint |
| **P1** | Important, do next | Next 2-3 sprints |
| **P2** | Good idea, later | Quarterly review |
| **P3** | Backlog | Monitor for signal |

### Step 6: Document Strategic Overrides
Some items warrant priority bumps — cite context:
- Revenue blocking (deals waiting) — from competitors.md win/loss
- Executive mandate — from company.md
- Competitive urgency — from competitors.md
- Technical debt enabling future work

### Step 7: Flag Low Confidence Items
Items with <60% confidence need discovery before committing.

### Step 8: Document What's NOT Making the Cut
Explicit "no" prevents scope creep and gives stakeholders answers.

## Output Template

I'll generate this prioritized backlog for you:

```markdown
# Backlog Prioritization: [Context]

**Framework:** RICE with P0/P1/P2 groupings
**Date:** [Date]
**Capacity:** [N items this sprint/quarter]

## Context
*What I found in your files:*
- **Strategic priorities:** [From company.md]
- **Known product issues:** [From product.md]
- **User pain points:** [From personas.md]
- **Competitive factors:** [From competitors.md]

---

## Summary

| Priority | Count | Recommendation |
|----------|-------|----------------|
| P0 (Do Now) | [N] | This sprint |
| P1 (Do Next) | [N] | Next 2-3 sprints |
| P2 (Later) | [N] | Quarterly consideration |
| P3 (Backlog) | [N] | Monitor for signal |

---

## P0: Do Now (This Sprint)

| Item | RICE Score | Rationale | Source |
|------|------------|-----------|--------|
| [Item] | [Score] | [Why P0] | [Context file or provided] |

---

## P1: Do Next (2-3 Sprints)

| Item | RICE Score | Rationale | Source |
|------|------------|-----------|--------|
| [Item] | [Score] | [Why P1] | [Source] |

---

## P2: Later (Quarterly)

| Item | RICE Score | Rationale |
|------|------------|-----------|
| [Item] | [Score] | [Why wait] |

---

## P3: Backlog (Monitor)

| Item | RICE Score | Rationale |
|------|------------|-----------|
| [Item] | [Score] | [Why backlog] |

---

## Strategic Overrides

| Item | Normal Rank | Override To | Reason | Source |
|------|-------------|-------------|--------|--------|
| [Item] | P2 | P0 | Revenue-blocking — cited in lost deals | competitors.md |
| [Item] | P1 | P0 | Exec priority | company.md |

---

## Low Confidence Risks

| Item | Confidence | What's Uncertain | Recommended Discovery |
|------|------------|------------------|----------------------|
| [Item] | [%] | [What needs validation] | [Research to do] |

---

## Items NOT Making the Cut

| Item | Why Not | Stakeholder to Notify |
|------|---------|----------------------|
| [Item] | [Rationale] | [Who asked for this] |

---

## Assumptions
- ⚠️ [Effort estimates are rough — need eng validation]
- ⚠️ [Reach numbers based on company.md customer count]

## Suggested Updates to Context Files
- [ ] Add prioritized items to `product.md` roadmap
- [ ] Flag deferred items in backlog for future review
```

## Framework Reference

This skill combines:
- **RICE scoring** (Intercom): Quantitative comparison
- **Priority tiers** (P0/P1/P2/P3): Maps to action timelines
- **Strategic overrides:** Acknowledges that business context sometimes trumps pure RICE
- **Confidence flagging:** Identifies items needing discovery

## Tips for Best Results

1. **Keep context files updated** — I'll pull strategic priorities and known issues to inform scoring
2. **Bring capacity** — Knowing you can only do 4 items changes the conversation
3. **Include lost deals** — Revenue-blocking items often get strategic overrides
4. **Flag uncertainty** — Better to know confidence is low than to commit blindly
5. **Re-run monthly** — Backlogs shift as you learn
