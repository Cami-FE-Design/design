---
name: decision-document-creator
description: 'Document important decisions with context, rationale, and alternatives considered. Use when: decision document, decision log, document decision, recommendation memo, adr, architecture decision.'
disable-model-invocation: true
category: communication
---

# Decision Document Creator

Document important decisions with context, rationale, and alternatives considered.

## Output
Write the file to exactly this path:

  work/strategy/outputs/decision-doc-[topic]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Recording significant product decisions
- Creating institutional memory for your team
- Onboarding new team members to past decisions
- Documenting vendor/tool selections
- Recording architectural choices

## What You'll Get

- Structured decision document with full context
- Clear comparison of all options considered
- Record of who decided and why
- Review triggers for future revisitation
- Institutional memory that survives team changes

## What You'll Need

**Critical inputs (ask if not provided):**
- The decision being made (or options to evaluate)
- At least 2 options that were considered

**Nice-to-have inputs:**
- Why this decision is needed now
- Constraints (budget, timeline, resources)
- Who made or should make the decision
- Dissenting views

## Process

### Step 1: Check Your Context
I'll start by reading your context files to understand the strategic landscape:
- `context/company.md` — Company priorities, constraints, who makes decisions
- `context/product.md` — Roadmap, current focus areas, technical constraints
- `context/competitors.md` — If decision involves competitive positioning

I'll summarize what I found. For example:
> "I found your Q1 priorities in company.md: 'Nail retention before growth.' Your product.md shows a constraint around 'no new infrastructure before Series B.' I'll frame this decision against those constraints."

### Step 2: Gather Decision Context
If the decision or options aren't clear, ask:
- "What are the options you're considering?"
- "What constraints are shaping this decision?"

### Step 3: State the Decision
What are you deciding? Be specific. A good decision statement is:
- Narrow enough to be actionable
- Broad enough to be meaningful

### Step 4: Capture Context
- **Why it matters:** Business impact if we get this wrong
- **Constraints:** Budget, timeline, technical, regulatory
- **Trigger:** What prompted this decision now?

### Step 5: Document Options
For each option considered:
- What is it? (brief description)
- Pros (2-4 key benefits)
- Cons (2-4 key drawbacks)
- Status: Selected or Rejected (with reason)

### Step 6: Record the Decision
- What was decided?
- Who made the decision?
- What's the rationale? (why this option over others)
- Were there dissenting views? (important for institutional memory)

### Step 7: Note Consequences
- What changes as a result?
- What stays the same? (reduces anxiety)
- What risks are we accepting?

### Step 8: Set Review Triggers
- When should this be revisited?
- What conditions would invalidate this decision?

## Output Template

I'll generate this decision document for you:

```markdown
# Decision: [Short Title]

**Status:** Proposed / Accepted / Deprecated / Superseded
**Date:** [Date]
**Decision Makers:** [Names]
**Consulted:** [Names]

## Strategic Context
*What I found in your files:*
- **Company priorities:** [From company.md — what matters now]
- **Roadmap alignment:** [From product.md — how this fits]
- **Constraints:** [From context files — budget, timeline, technical]

---

## Context

### Why This Decision Matters
[Why are we deciding this? What's the impact if we get it wrong?]

### Constraints
- [Constraint 1]
- [Constraint 2]

### Trigger
[What prompted this decision now?]

---

## Options Considered

### Option A: [Name]
**Description:** [What this option entails]

**Pros:**
- [Pro 1]
- [Pro 2]

**Cons:**
- [Con 1]
- [Con 2]

**Status:** ✅ Selected / ❌ Rejected — Reason: [Why]

---

### Option B: [Name]
[Same structure]

---

### Option C: [Name]
[Same structure]

---

## Decision

**We will:** [Clear statement of what was decided]

**Rationale:** [Why this option over others]

**Dissenting Views:** [If any, what were they?]

---

## Consequences

### What Changes
- [Change 1]
- [Change 2]

### What Stays the Same
- [Thing that doesn't change — reduces anxiety]

### Risks Accepted
- [Risk we're knowingly accepting]

---

## Review Trigger

Revisit this decision if:
- [Condition 1]
- [Condition 2]

**Next Review:** [Date or trigger]

---

## Related Decisions
- [Link to related decision docs]
```

## Framework Reference

**Architecture Decision Records (ADR)** adapted for product decisions:
- Capture the "why" not just the "what"
- Document alternatives for future context
- Set review triggers so decisions don't become sacred cows
- Record dissenting views — they're often valuable later

The ADR format was popularized by Michael Nygard and is widely used in software architecture. This template adapts it for product decisions.

## Tips for Best Results

1. **Use your context files** — I'll frame decisions against company priorities
2. **Document when you decide, not later** — Context fades fast
3. **Include rejected options** — Future you will want to know why
4. **Note dissenting views** — They're often proven right later
5. **Set concrete review triggers** — "If X happens, revisit this"
6. **Keep it short** — A decision doc nobody reads is useless
7. **Link related decisions** — Decisions form a graph, not a list

## Suggested Next Steps

After reviewing this decision document, you can:
- Save it to a `decisions/` folder for future reference
- Update `product.md` if the decision affects your roadmap
- Link to related decisions in other docs
