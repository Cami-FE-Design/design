---
name: persona-generator
description: 'Build behavioral buyer and user personas with Pragmatic Institute use scenarios and jobs-to-be-done analysis. Use when: create persona, user persona, buyer persona, pragmatic persona.'
category: discovery
---

# Persona Generator

Build behavioral buyer and user personas with Pragmatic Institute use scenarios, buying process mapping, and jobs-to-be-done analysis — grounded in research, not assumptions.

## Output
Write the file to exactly this path:

  work/discovery/outputs/persona-[name]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Creating initial personas for a new product
- Updating stale personas with recent research
- Onboarding new team members to who your users are

## What You'll Get

I'll generate complete persona profiles with:
- **Buyer vs User distinction** — Separate personas for who buys (economic/functional/technical) vs who uses
- **Use scenarios (Pragmatic format)** — Persona + Goal + Problem + Frequency for each key workflow
- **Buying process map** — How buyers evaluate, decide, and purchase (for B2B products)
- **Behavioral patterns** — What triggers them, their workflow, and frequency
- **Jobs-to-be-done** — What they're trying to accomplish and why
- **Goals and frustrations** — What success looks like vs. what gets in their way
- **Evidence tracking** — What's validated from research vs. what needs verification
- **Product implications** — How each insight should influence your roadmap
- **Anti-personas** — Who you're NOT building for (and why)

## What You'll Need
- User research (interviews, surveys, behavioral data)
- Product usage patterns (if available)
- Clarity on who you're building for vs. not

## Process

### Step 1: Review Your Context

I'll start by checking your context files:
- **personas.md** — Do personas already exist? Should I update them or create new ones?
- **product.md** — What does the product do? Who is it for?
- **company.md** — What's the target market?
- **Research files** — Any interview transcripts, feedback data, or analytics?

I'll share what I find. For example:
> "I found 2 existing personas in your personas.md (Jordan and Alex). Are you looking to update these with new research, or create additional personas?"

Or if starting fresh:
> "You don't have personas in your context files yet. I'll create them from scratch based on the research you provide."

### Step 2: Request Research Data

If you haven't shared research yet, I'll ask:
> "To create data-driven personas, I need research to analyze. Do you have any of these?
> - Interview transcripts or snapshots
> - Survey responses with demographics
> - Product analytics (usage patterns by user type)
> - Support tickets by user segment
>
> You can paste it here or point me to files."

**If data is thin:** I can create assumption-based personas to start, but I'll flag everything as ⚠️ Assumed so you know what needs validation.

### Step 3: Distinguish Buyers from Users (B2B Products)

For B2B products, I'll identify:
- **Economic Buyer:** Who has budget authority? (e.g., CEO, VP, Department Head)
- **Functional Buyer:** Who evaluates day-to-day fit? (e.g., PM, Manager)
- **Technical Buyer:** Who evaluates technical fit? (e.g., CTO, IT, Ops)
- **End Users:** Who uses the product daily?

These often overlap (small companies: founder = economic + functional + user).

### Step 4: Identify Behavioral Patterns

I'll analyze HOW people use your product:
- What triggers them to engage?
- What workflow do they follow?
- Where do they get stuck?
- What makes them successful?

### Step 5: Create Use Scenarios (Pragmatic Format)

For each persona, I'll define use scenarios:
- **Persona:** Who experiences this?
- **Goal:** What are they trying to accomplish?
- **Problem:** What prevents them?
- **Frequency:** How often does this occur?

This format clarifies exactly when/why/how your product helps.

### Step 6: Extract Jobs-to-be-Done

For each emerging persona, I'll identify:
- What are they trying to accomplish?
- What does success look like?
- What's their emotional state when using your product?

### Step 7: Map Buying Process (B2B Buyers)

For buyer personas, I'll document:
- **Awareness:** How do they discover solutions?
- **Evaluation:** What criteria do they use? Who's involved?
- **Decision:** What triggers purchase? What are deal-breakers?
- **Implementation:** What happens post-purchase?

### Step 8: Define Anti-Personas

I'll clarify who you're NOT building for:
- Who isn't a fit for your product?
- Why? (Wrong use case, wrong stage, etc.)
- What's the risk if you try to serve them anyway?

### Step 9: Make Personas Actionable

I'll ensure each persona informs product decisions, not just demographics. Every trait will connect to a design implication.

## Output Template

```markdown
# User Personas

**Data Sources:** [List research inputs]
**Generated:** [Date]
**Updates existing:** [Yes/No — if yes, note what changed]

## Context
*What I found in your files:*
- **Existing personas:** [From personas.md, or "None — creating from scratch"]
- **Product context:** [From product.md]
- **Target market:** [From company.md]

---

# Persona: [Name]

**Role:** [Job title/description]
**Segment:** [Company size, industry, etc.]
**Persona Type:** Buyer (Economic/Functional/Technical) | User | Buyer + User

## Overview
[2-3 sentence description of who this person is]

## Use Scenarios (Pragmatic Format)

| Persona | Goal | Problem | Frequency |
|---------|------|---------|-----------|
| [Name] | [What they're trying to accomplish] | [What prevents them] | [How often] |
| [Name] | [Another goal] | [Another problem] | [Frequency] |

## Jobs-to-be-Done
- "When [situation], I want to [motivation], so I can [outcome]"
- [Additional jobs-to-be-done]

## Goals
- [What they're trying to achieve]
- [Success metrics they care about]

## Frustrations
- [Pain points with current solutions]
- [What gets in their way]

## Behaviors
- **Triggers:** [What causes them to engage]
- **Workflow:** [How they use the product]
- **Frequency:** [How often they engage]

## Buying Process (if Buyer persona)

| Stage | Behavior | Criteria | Influencers |
|-------|----------|----------|-------------|
| **Awareness** | [How they discover solutions] | [What triggers search] | [Who influences] |
| **Evaluation** | [How they compare options] | [Decision criteria] | [Who's involved] |
| **Decision** | [What triggers purchase] | [Deal-breakers] | [Final approver] |
| **Implementation** | [Post-purchase experience] | [Success criteria] | [Who onboards] |

## Evidence
*What supports this persona:*
- ✅ **Validated:** [Research evidence]
- ⚠️ **Assumed:** [Inferences to verify]

## Product Implications
| Insight | Design Implication |
|---------|-------------------|
| [Behavior/Need] | [How it affects product] |

## Quotes
> "[Representative quote from research]"
> — Source: [Interview/Survey/etc.]

---

# Anti-Persona: [Name]

**Who:** [Description]
**Why Not:** [Why they're not a fit]
**Risk if We Target Them:** [What goes wrong]

---

## Persona Comparison
| Attribute | [Persona 1] | [Persona 2] | [Anti-Persona] |
|-----------|-------------|-------------|----------------|
| Primary goal | [Goal] | [Goal] | [Goal] |
| Key pain | [Pain] | [Pain] | [Pain] |
| Frequency | [Usage] | [Usage] | N/A |

## Suggested Next Steps
- [ ] Save to `context/personas.md` (or update existing)
- [ ] Validate assumptions with additional research
- [ ] Share with team for alignment
```

## Framework Reference

Combines **Pragmatic Institute personas** with **Jobs-to-be-Done** methodology:
- **Buyer vs User distinction** — Pragmatic separates who buys from who uses (critical for B2B)
- **Use scenarios** — Pragmatic's persona + goal + problem + frequency format
- **Buying process mapping** — Understand how buyers evaluate and decide
- **Behavioral focus** — What users DO, not just who they ARE
- **Evidence-based** — Ground in research, not assumptions
- **Anti-personas** — Maintain focus by defining who you're NOT serving

**Sources:**
- [Pragmatic Institute - The Power of the Persona](https://www.pragmaticinstitute.com/resources/articles/product/the-power-of-the-persona/)
- [Pragmatic Institute - Buyer Personas and the Message Matrix](https://www.pragmaticinstitute.com/resources/articles/product/buyer-personas-and-the-message-matrix/)
- Jobs-to-be-Done framework (Clayton Christensen)

## Tips for Best Results
1. **For B2B: Distinguish buyers from users** — The CEO (economic buyer) has different needs than the PM (functional buyer/user)
2. **Use scenarios clarify value** — "When planning projects, Jordan needs visibility into team capacity (daily)" is more actionable than "Jordan is busy"
3. **Map the buying process** — Understanding how buyers evaluate helps marketing and sales
4. **Share real research** — The more interview transcripts or behavioral data you provide, the better
5. **I'll build on existing personas** — If you have personas.md, I'll update rather than recreate
6. **I focus on behavior, not demographics** — "Exports to Excel weekly" beats "35-45 years old"
7. **I'll ground everything in evidence** — Each trait will link to research or be flagged as assumed
8. **I cut fluff** — If a detail doesn't inform decisions, I won't include it
9. **Save to context/personas.md** — Keep personas fresh and accessible for future skills
