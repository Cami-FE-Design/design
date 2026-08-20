---
name: journey-map-creator
description: 'Build comprehensive customer journey maps that visualize the end-to-end experience with pain points and opportunities. Use when: journey map, customer journey, user journey, experience map.'
disable-model-invocation: true
category: discovery
---

# Journey Map Creator

Build comprehensive customer journey maps that visualize the end-to-end experience with pain points and opportunities.

## Output
Write the file to exactly this path:

  work/discovery/outputs/journey-map-[persona]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Mapping a new user flow before building
- Diagnosing where users drop off or get frustrated
- Aligning cross-functional teams on the full experience

## What You'll Need
- A specific persona and scenario to map
- Research data, observations, or informed assumptions
- Clarity on journey start and end points

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/personas.md` — Which persona is taking this journey?
- `context/product.md` — What's the current product experience? Known issues?
- Research files — Interview snapshots, feedback about this journey?

**Tell the user what you found.** For example:
> "I found your Jordan persona (PM) in personas.md. Their main frustration is 'finding out someone is double-booked only when deadlines slip.' Want me to map Jordan's journey for resource planning?"

### Step 2: Define Scope
If not clear from context, ask:
> "I need to know the journey boundaries:
> 1. Which persona is taking this journey? (I found [X] in your files)
> 2. What scenario/goal are they trying to accomplish?
> 3. Where does the journey start and end?
>
> Example: 'Jordan onboarding a new client project, from kickoff meeting to project go-live'"

### Step 3: Gather Journey Data
If the user doesn't have research, prompt:
> "To map this journey accurately, it helps to have:
> - User interview notes about this flow
> - Analytics showing where users drop off
> - Support tickets about this journey
> - Your own observations from watching users
>
> I can work with assumptions, but I'll flag them as ⚠️ Assumed."

### Step 4: Map Stages
Break the journey into distinct stages (typically 4-7):
- Awareness → Consideration → Decision → Onboarding → Usage → Advocacy
- Or more specific stages for your scenario

### Step 5: Document Each Stage
For each stage, capture:
- **Actions:** What is the user doing?
- **Thoughts:** What are they thinking?
- **Emotions:** How are they feeling?
- **Touchpoints:** What are they interacting with?
- **Pain Points:** What's frustrating them?

**Connect to known issues:** Reference product.md or feedback data when relevant.

### Step 6: Identify Opportunities
Where can we improve the experience? Prioritize by:
- Severity of pain point
- Frequency of occurrence
- Feasibility of improvement

## Output Template

```markdown
# Journey Map: [Scenario Name]

**Persona:** [Name — from personas.md]
**Scenario:** [What they're trying to accomplish]
**Scope:** [Start] → [End]

## Context
*What I found in your files:*
- **Persona details:** [From personas.md]
- **Known issues in this journey:** [From product.md or research]
- **Related feedback:** [From research files]

**Data Sources:** [Research used — interviews, observations, analytics, etc.]
**Confidence:** [High/Medium/Low — based on data quality]

## Journey Overview

| Stage | Actions | Emotions | Pain Points |
|-------|---------|----------|-------------|
| [Stage 1] | [Actions] | 😊/😐/😤 | [Pains] |
| [Stage 2] | [Actions] | 😊/😐/😤 | [Pains] |
| [Stage 3] | [Actions] | 😊/😐/😤 | [Pains] |

## Stage Details

### Stage 1: [Name]
**User Actions:**
- [Action 1]
- [Action 2]

**Thoughts:**
- "[What they're thinking]"

**Emotional State:** [Positive/Neutral/Negative + why]

**Touchpoints:**
- [Channel/interaction point]

**Pain Points:**
- [Frustration 1] — Evidence: [Research/Assumed]
- [Frustration 2]

**Opportunities:**
- [How we could improve]

### Stage 2: [Name]
[Same structure]

## Emotional Journey
```
High  |     ●
      |   ●   ●
      | ●       ●
Low   |           ●
      +---------------
        1  2  3  4  5
```

## Moments of Truth

*Make-or-break points where experience determines success or failure*

| Moment | Stage | Impact | Current State | Evidence |
|--------|-------|--------|---------------|----------|
| [Critical moment] | [Stage] | [Why it matters] | ✅/⚠️/❌ | [Research/Assumed] |

## Priority Opportunities

*Ranked by impact and evidence strength*

| Opportunity | Stage | Impact | Effort | Evidence |
|-------------|-------|--------|--------|----------|
| [Opp 1] | [Stage] | High | Low | [Research source] |
| [Opp 2] | [Stage] | High | Medium | [Research source] |

## Connection to Product Roadmap
| Finding | Related Initiative | Status |
|---------|-------------------|--------|
| [Pain point] | [Roadmap item from product.md] | Planned/Not planned |

## Assumptions to Validate
*Things I inferred that need research:*
- ⚠️ [Assumption 1]
- ⚠️ [Assumption 2]

## Next Steps
1. [Immediate action]
2. [Follow-up research needed]
3. [Update to product.md or roadmap]
```

## Framework Reference

**Service Design** methodology for experience mapping:
- Map the full journey, not just your product
- Include emotions — they drive behavior
- Focus on moments of truth (make-or-break points)

## Tips for Best Results
1. **Use your personas** — I'll pull details from personas.md to make the journey specific
2. **Walk the journey yourself** — Experience what users experience
3. **Validate with real users** — Don't map from assumptions alone
4. **Connect to roadmap** — Link opportunities to planned work
