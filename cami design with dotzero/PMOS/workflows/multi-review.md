---
description: 'Run a piece of work past every reviewer-persona agent installed in this project, in parallel, and synthesize the feedback. Use when: multi review, founder review, all-hands review, stakeholder review.'
---

**Workflow Pack:** Multi-Review
**Tagline:** "Every reviewer persona you have. In parallel. ~15 minutes."

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to ground every reviewer's perspective
in their real organization:

1. `/context/company.md` — Team structure, org priorities, known stakeholders
2. `/context/product.md` — Current product state, roadmap, constraints
3. `/context/personas.md` — User context for customer-facing reviewers
4. `/context/competitors.md` — Competitive landscape for go-to-market perspectives

**Tell the user what you found:**
> "I found your org structure in company.md — your CTO is [name] and they care about [priority]. I'll pass this to each reviewer so the feedback is grounded in your real org."

If context files are thin or missing, say:
> "I don't have much org context. Reviewers will use generic perspectives — you can add more to company.md for more tailored reviews."

### Step 1: Get the Document

Ask the user to provide the document to review:
> "What document should I review? (PRD, spec, proposal, one-pager, etc.)"

Accept pasted text, a file upload, or a path to a file in their workspace.

Confirm what you're reviewing:
> "I'm reviewing: [document name/title]. This is [X] words. Ready to proceed?"

### Step 2: Understand Review Goals (Optional)

Ask:
> "Are there specific concerns you want me to focus on? Or should I do a comprehensive review?"

This helps each reviewer prioritize.

### Step 3: Assemble the Review Panel

**The review panel is every persona agent installed in this project — not a
fixed list.** Customers add, remove, rename, and customize their reviewer
agents, so discover the panel at run time rather than assuming a set roster.

1. **List the agent files in `.claude/agents/`.** Each one is a reviewer
   persona — the file's frontmatter `name` is the agent identifier and its
   body is that reviewer's perspective and instructions. A default project
   ships six: `cto-tech-lead`, `devils-advocate`, `executive`,
   `sales-gtm-lead`, `user-advocate`, `ux-design-lead` — but use whatever is
   actually present.

2. **Tell the user the panel:**
   > "Your review panel is [N] reviewers: [list the agent names]. Running them in parallel now."

3. **Spawn one subagent per agent file, in parallel.** For each, use the
   Task tool with `subagent_type` set to that agent's name — so the review
   is delivered in that persona's own voice and lens. Give each reviewer:
   - The full document under review
   - The relevant context files (company.md, product.md, personas.md, competitors.md)
   - Any focus areas the user gave in Step 2
   - The shared output shape below ("Per-Reviewer Output")

   Do **not** re-specify each persona's perspective here — the agent file
   already defines it. This workflow just routes the document to whoever is
   on the panel.

4. **If `.claude/agents/` has no persona agents**, tell the user:
   > "I don't see any reviewer agents installed. I can run a generic cross-functional review instead — want me to proceed that way?"
   Then run a single comprehensive review covering engineering, design,
   executive, customer, and go-to-market lenses.

**Per-Reviewer Output** — ask each reviewer to return:
- An overall signal: 🟢 Supportive / 🟡 Concerns / 🔴 Blocker
- What they like
- Concerns and risks (with *why it matters* + a suggestion)
- Questions stakeholders will ask
- Recommendations

### Step 4: Coordinator Synthesis

Once **all** reviews are back (however many reviewers were on the panel),
synthesize them:

1. **Consensus** — Where do all perspectives align?
2. **Tensions** — Where do perspectives conflict? (e.g. Exec wants fast ship, Eng wants quality)
3. **Common questions** — What questions appear across multiple reviewers?
4. **Critical blockers** — Any 🔴 blockers that must be addressed?
5. **Priority issues** — What should be fixed before stakeholder review?

### Step 5: Generate Output

Create a comprehensive review document (see Output Template below).

Save to:
`work/specs/outputs/review-[document-name]-<YYYY-MM-DD>.md`

---

## Output Template

```markdown
# Multi-Perspective Review: [Document Name]

**Review Date:** [Date]
**Document Type:** PRD / Spec / Proposal / One-Pager
**Review Panel:** [N] reviewers — [comma-separated agent names]
**Status:** Draft Review

---

## Context

*What I found in your files:*
- **Org structure:** [From company.md — key stakeholders and their priorities]
- **Strategic priorities:** [From company.md — what leadership cares about]
- **Product context:** [From product.md — current state, roadmap, constraints]
- **User context:** [From personas.md — user needs that inform this review]
- **Competitive context:** [From competitors.md — market positioning]

---

## Review Summary

### Consensus
**Where everyone agrees:**
- [Point 1]
- [Point 2]

### Tensions
**Where perspectives conflict:**
| Issue | Perspective A | Perspective B | Resolution Needed |
|-------|---------------|---------------|-------------------|
| [Issue 1] | [View] | [Opposing view] | [Suggestion] |

### Critical Blockers
**Must address before proceeding:**
- [ ] [Blocker 1] — From: [Reviewer]

### Top Questions to Prepare For
1. [Question 1] — From: [Reviewer]
2. [Question 2] — From: [Reviewer]

---

## Reviews

<!-- One section per reviewer on the panel. Repeat this block for each
     agent that reviewed — heading = the reviewer's name. -->

### [Reviewer Name] Review

**Overall:** 🟢 Supportive / 🟡 Concerns / 🔴 Blocker

**Likes:**
- [Positive 1]

**Concerns:**
- [Concern 1]
  - **Why this matters:** [Risk / impact]
  - **Suggestion:** [Recommendation]

**Questions to Expect:**
- "[Question 1]"

**Recommendations:**
- [Recommendation 1]

---

## Synthesis

### Action Items Before Stakeholder Review
**Must address:**
- [ ] [Action 1] — Addresses: [Blocker/concern]

**Should address:**
- [ ] [Action 2] — Improves: [Area]

### Conflicting Priorities to Resolve
1. [Conflict 1] — [Perspective A] vs. [Perspective B]
   - **Recommendation:** [Suggestion]

### Questions to Prepare Answers For
1. [Question 1] — From: [Multiple reviewers]
2. [Question 2] — From: [Reviewer]

### Overall Assessment
**Ready for stakeholder review?** Yes / No / With Changes

**Why:**
[1-2 sentence assessment of whether this document is ready for real
stakeholder review, and what still needs work]
```

---

## Framework Reference

**Multi-perspective stakeholder analysis using agent teams:**
- Different roles have different priorities and blind spots
- Parallel review = ~15 minutes vs. 2+ hours sequential
- Surface concerns and tensions before the real meeting
- Prepare answers in advance = better meetings

This workflow uses **Claude Code agent teams**: it runs every reviewer-persona
agent in the project in parallel, drastically reducing review time while
increasing coverage. Because the panel is discovered from `.claude/agents/`
at run time, it always reflects the reviewers the customer actually has —
including any they've added or customized.

---

## Tips for Best Results

1. **Keep context files updated** — Reviewers ground their feedback in your real org, not generic personas
2. **Provide the full document** — Partial docs get partial feedback
3. **Note specific concerns** — If you're worried about executive pushback, tell me
4. **Customize your reviewers** — Edit the agent files in `.claude/agents/` to match your real stakeholders; the panel updates automatically
5. **Prepare for conflicts** — The value is in surfacing tensions before the meeting
6. **Use this iteratively** — Run review → fix issues → run again

---

## When NOT to Use This Workflow

❌ **Don't use when:**
- Document is still a rough draft (get it to 70% first)
- You're just brainstorming (too early)
- Low-stakes document that doesn't need full review

✅ **Use when:**
- High-stakes document (PRD, proposal, board deck)
- You need cross-functional alignment
- A real stakeholder review is coming soon
- You want to anticipate and prepare for concerns

---

## Time Savings

**Traditional sequential review:** each stakeholder reviews separately —
~20 min each, plus scheduling and waiting. A typical panel runs to 2+ hours
of PM time spread across days of calendar time.

**Multi-review workflow:** the whole panel reviews in parallel — output
ready in ~15 minutes.
