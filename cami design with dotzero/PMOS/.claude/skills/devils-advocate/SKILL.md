---
name: devils-advocate
description: 'Challenge PRDs and specs with critical questions and potential failure scenarios. Use when: challenge assumptions, stress test, find blind spots, what could go wrong, devils advocate, contrarian view.'
disable-model-invocation: true
category: strategy
---

# Devil's Advocate

Challenge PRDs and specs with critical questions and potential failure scenarios.

## When to Use This Skill
- Pressure-testing a proposal before stakeholder review
- You want someone to poke holes in your thinking
- Looking for blind spots and hidden risks
- Preparing for tough questions from skeptical stakeholders
- Something feels too easy — you want a reality check

## What You'll Need

**Critical inputs (ask if not provided):**
- The document to challenge (PRD, proposal, spec, strategy doc)

**Nice-to-have inputs:**
- Specific areas you're worried about
- Known risks or concerns you've already identified

## Process

### Step 1: Check Your Context

First, read the user's context files to ground the challenge in their reality:
- `context/company.md` — Past failures, known constraints, org dynamics
- `context/product.md` — Technical debt, current problems, resource limits
- `context/personas.md` — User behavior that might contradict assumptions
- `context/competitors.md` — How competitors have failed at similar things

**Tell the user what you found:**
> "I found in company.md that your last AI feature took 2× longer than planned due to data quality issues. I'll challenge any assumptions about data readiness. I also see from competitors.md that Monday.com tried this and removed it — I'll explore why."

If context is thin, say:
> "I don't have much context about past failures or constraints. I'll use generic challenge questions, but you can add more to company.md for more grounded pushback."

### Step 2: Review the Document

Read the full document carefully. Look for:
- **Assumptions presented as facts** — "Users want this" without evidence
- **Optimistic timelines** — "Should take 2 weeks"
- **Dependency handwaving** — "Sales will handle this"
- **Missing sections** — What's NOT addressed?
- **Vague language** — "Improve", "better", "enhance" without metrics
- **Scope creep potential** — Features that will grow
- **Edge cases ignored** — What happens when...?

### Step 3: Take Contrarian Perspective

Your role is to **push back constructively**. You're not trying to kill the idea, you're trying to make it stronger by surfacing risks early.

**Challenge everything:**
- Is the problem real? Or are we solving for an edge case?
- Do users actually want this? Or is it what we think they want?
- Will this work technically? Or are we underestimating complexity?
- Is now the right time? Or should we wait/deprioritize?
- What are we NOT doing because we're doing this?

**Look for:**
- **Hidden assumptions** — What are we taking for granted?
- **Failure modes** — How could this go wrong?
- **Unintended consequences** — What second-order effects might occur?
- **The hard questions** — What will skeptical stakeholders ask?

### Step 4: Identify Blind Spots

What hasn't been considered?
- User segments that won't want this
- Technical constraints that make it harder
- Competitive responses that could neutralize value
- Regulatory or legal implications
- Support/maintenance burden
- Documentation and training costs

### Step 5: Generate Output

Create a comprehensive challenge document with:
1. Critical questions (organized by assumption)
2. Potential failure scenarios (with likelihood/impact/mitigation)
3. Blind spots identified
4. Unintended consequences
5. The hard questions to prepare for

**Tone:** Constructive challenge, not dismissal. Frame as "Here's what could go wrong, let's prepare for it."

## Output Template

```markdown
# Devil's Advocate Review: [Document Name]

**Review Date:** [Date]
**Document Type:** PRD / Proposal / Spec / Strategy
**Challenge Focus:** Comprehensive / [Specific area if provided]

---

## Context

*What I found in your files that informs this challenge:*
- **Past challenges:** [From company.md — previous failures or delays that are relevant]
- **Resource constraints:** [From company.md/product.md — team size, technical debt, known limitations]
- **User behavior:** [From personas.md — user patterns that might contradict assumptions]
- **Competitive context:** [From competitors.md — how competitors have handled similar features]

---

## Executive Summary

**Overall Assessment:** 🟢 Solid / 🟡 Needs Work / 🔴 High Risk

**Top Risks:**
1. [Highest risk]
2. [Second highest risk]
3. [Third highest risk]

**Most Critical Question:**
> "[The one question that must be answered before proceeding]"

---

## Critical Questions

### Assumption 1: [State the assumption]
**The assumption:**
> "[Quote or paraphrase the assumption from the document]"

**Challenge:**
- What if [opposite is true]?
- Evidence supporting this assumption: [What evidence exists?]
- Evidence missing: [What evidence do we NOT have?]

**Why this matters:**
- **Risk:** [What's at stake if this assumption is wrong]
- **Impact:** High / Medium / Low
- **Confidence in assumption:** High / Medium / Low

**Questions to answer:**
- [Question 1]
- [Question 2]

---

### Assumption 2: [State the assumption]
[Same structure as above]

---

### Assumption 3: [State the assumption]
[Same structure as above]

---

## Potential Failure Scenarios

### Scenario 1: [What could fail]
**How this could happen:**
[Describe the failure path]

**Likelihood:** High / Medium / Low
**Impact:** High / Medium / Low
**Risk Score:** [Likelihood × Impact]

**Early warning signs:**
- [Signal 1 that this is happening]
- [Signal 2 that this is happening]

**Mitigation:**
- [What to do to prevent this]
- [What to do if it happens anyway]

---

### Scenario 2: [What could fail]
[Same structure]

---

### Scenario 3: [What could fail]
[Same structure]

---

## Blind Spots

### What Hasn't Been Addressed

**User segments not considered:**
- [Segment 1]: [How they might react differently]
- [Segment 2]: [Why this might not work for them]

**Technical complexities underestimated:**
- [Complexity 1]: [Why this is harder than it seems]
- [Complexity 2]: [Hidden technical debt this touches]

**Operational impacts ignored:**
- Support burden: [What new tickets will CS get?]
- Documentation needs: [What docs must be created/updated?]
- Training requirements: [Who needs to be trained?]

**External dependencies not mentioned:**
- [Dependency 1]: [Why this matters]
- [Dependency 2]: [Risk if this delays]

---

## Unintended Consequences

**Second-order effects:**
- [Effect 1]: [What might happen as a downstream result]
  - **Likelihood:** High / Medium / Low
  - **Impact:** Positive / Negative / Mixed

- [Effect 2]: [What might happen]
  - **Likelihood:** High / Medium / Low
  - **Impact:** Positive / Negative / Mixed

**Perverse incentives:**
- [Incentive 1]: [How users might game this system]
- [Incentive 2]: [Unintended behavior this might encourage]

**Competitive response:**
- What will competitors do when they see this?
- How quickly can they copy it?
- What makes this defensible?

---

## The Hard Questions

**Questions skeptical stakeholders will ask:**

### From Engineering:
- "[Technical question they'll ask]"
- "[Feasibility challenge they'll raise]"

### From Executive:
- "[ROI question they'll ask]"
- "[Strategy question they'll raise]"

### From Sales:
- "[Market question they'll ask]"
- "[Competitive question they'll raise]"

### From Design:
- "[Usability question they'll ask]"
- "[UX concern they'll raise]"

### From Legal/Compliance:
- "[Compliance question they'll ask]"
- "[Risk question they'll raise]"

---

## What's NOT in This Document

**Missing sections:**
- [ ] [Section that should exist but doesn't]
- [ ] [Analysis that's needed but absent]

**Vague areas that need clarification:**
- [Area 1]: [What's vague and needs specificity]
- [Area 2]: [What needs quantification]

---

## Stress Tests

**If user adoption is 10× lower than expected:**
- Is this still worth doing?
- What's the minimum viable success?

**If this takes 2× longer to build:**
- Does it still make sense?
- What gets cut?

**If a competitor ships this first:**
- Do we still build it?
- What's our differentiation?

**If the team shrinks (key person leaves):**
- Can we still deliver?
- What knowledge is at risk?

---

## Recommendations

**Before proceeding:**
1. [Action to address highest risk]
2. [Action to validate critical assumption]
3. [Action to prepare for most likely failure scenario]

**Things to watch for:**
- [Early warning sign 1]
- [Early warning sign 2]

**Questions to answer now:**
- [Question 1 — must answer before starting]
- [Question 2 — must answer before starting]

**Questions to defer (but track):**
- [Question 3 — can answer later but don't forget]
- [Question 4 — monitor as you go]

---

## Final Challenge

**The question you don't want to ask but should:**
> "[The uncomfortable question that gets to the heart of the risk]"

**The conversation you're avoiding:**
> "[The discussion with stakeholders that needs to happen]"

**The assumption you're most worried about:**
> "[The thing that, if wrong, would make this fail]"

```

---

## Framework Reference

**Contrarian thinking and failure mode analysis**:
- Surface assumptions before they become failures
- Challenge everything, even things that "feel right"
- Ask "What if we're wrong?" about every key decision
- Look for second-order effects and unintended consequences
- Use "pre-mortem" thinking: Imagine this failed — why?

This skill uses **pre-mortem analysis** (imagining future failure) and **assumption mapping** to strengthen proposals before they ship.

---

## Tips for Best Results

1. **Don't take it personally** — This pushback makes your proposal stronger
2. **Keep context files updated** — I'll ground challenges in your real constraints, not generic ones
3. **Be honest about what worries you** — If you're concerned about engineering feasibility, tell me
4. **Use this before high-stakes reviews** — Surface objections in private before public meetings
5. **Don't dismiss challenges too quickly** — Sit with uncomfortable questions before explaining them away
6. **Update your document** — Address the critical questions before stakeholder review
7. **Use iteratively** — Challenge → fix → challenge again

---

## Calibration

**If you want lighter challenges:**
> "Focus on top 3 risks only, not comprehensive"

**If you want harder challenges:**
> "Be maximally skeptical. Assume worst case on every assumption."

**If you have specific concerns:**
> "I'm most worried about [X]. Challenge that assumption hard."

---

## When NOT to Use This Skill

❌ **Don't use when:**
- You're still brainstorming (too early for rigorous challenge)
- You can't handle critical feedback right now (wrong headspace)
- The document is already in execution (too late to change course)
- Low-stakes decision that doesn't warrant deep scrutiny

✅ **Use when:**
- High-stakes proposal (big investment, big risk)
- You feel like it's too easy (suspiciously smooth)
- About to present to skeptical stakeholders
- Want to prepare for tough questions
- Something just feels off and you want to articulate why
