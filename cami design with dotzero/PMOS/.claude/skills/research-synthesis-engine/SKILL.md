---
name: research-synthesis-engine
description: 'Combine insights from multiple research sources into a unified synthesis with patterns and actionable recommendations. Use when: synthesize research, research synthesis, combine interviews.'
category: discovery
---

# Research Synthesis Engine

Combine insights from multiple research sources into a unified synthesis with patterns, themes, and actionable recommendations.

## Output
Write the file to exactly this path:

  work/discovery/outputs/research-synthesis-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- After completing a research sprint with multiple sources
- Quarterly research reviews to find emerging patterns
- Building a business case with evidence from multiple channels

## What You'll Need
- Multiple research inputs (interviews, surveys, feedback, support tickets)
- A research question or opportunity area you're exploring

## Process

### Step 1: Check Your Context
First, read the user's context files to understand existing knowledge:
- `context/personas.md` — Who are we learning about?
- `context/product.md` — What's the current product state? Known issues?
- Research files — Any prior syntheses, interview snapshots, or feedback analyses?

**Tell the user what you found.** For example:
> "I found 3 interview snapshots in your research folder and a feedback analysis from last month. I'll synthesize these together with the new data you provide and look for patterns across all of it."

### Step 2: Gather Your Sources
If the user hasn't provided research, ask:
> "I need multiple research sources to synthesize. What do you have?
> - Interview snapshots or transcripts
> - Survey results
> - NPS/CSAT comments
> - Support ticket analysis
> - Sales call notes
> - App reviews or feedback
>
> I work best with 3+ sources. You can paste them here or point me to files."

**Connect to research question:**
> "What's the research question you're trying to answer? This helps me focus the synthesis."

### Step 3: Atomic Breakdown
Each source gets broken into atomic insights:
- One insight per observation
- Include source and evidence strength
- Tag with relevant themes

### Step 4: Theme Clustering
Insights are grouped by theme:
- What patterns emerge across sources?
- How many sources mention each theme?
- What's the evidence strength?

### Step 5: Pattern Analysis
Identify:
- **Convergence:** Where multiple sources agree
- **Contradictions:** Where sources conflict (often segment differences)
- **Outliers:** Unique insights that might be important
- **Gaps:** What we still don't know

### Step 6: Connect to Existing Knowledge
Link findings to what you already know:
- Does this confirm or contradict persona assumptions?
- Does this relate to known product issues?
- Are there new opportunities not on the roadmap?

## Output Template

```markdown
# Research Synthesis: [Topic/Question]

**Date:** [Date]
**Research Question:** [What you were trying to learn]

## Context
*What I found in your files:*
- **Existing personas:** [From personas.md]
- **Known product issues:** [From product.md]
- **Prior research:** [Any previous syntheses or analyses]

## Sources Analyzed
| Source | Type | Sample Size | Date |
|--------|------|-------------|------|
| [Source 1] | Interview | 5 participants | [Date] |
| [Source 2] | Survey | 150 responses | [Date] |
| [Source 3] | Support tickets | 45 tickets | [Date] |

**Total data points:** [Count]

## Executive Summary
[2-3 sentence overview of key findings]

## Theme Analysis

### Theme 1: [Name]
**Evidence Strength:** Strong ([X] sources, [N] mentions)
**Key Insights:**
- [Insight 1] — Source: [Interview 3, Survey]
- [Insight 2] — Source: [Support tickets]

**Representative Quote:**
> "[Quote]"
> — [Source, participant type]

**Connection to existing knowledge:**
- [How this relates to personas, product.md, or prior research]

### Theme 2: [Name]
[Same structure]

## Patterns

### Convergence (High Confidence)
*Multiple sources agree on these findings:*
- [Finding] — Sources: [List]

### Contradictions (Needs Resolution)
*Conflicting findings and possible explanations:*
- [Finding A] vs [Finding B] — Possible explanation: [Segment difference? Context?]

### Outliers (Worth Watching)
*Unique insights from single sources:*
- [Insight] — Source: [Single source] — Worth validating because: [Why]

### Gaps
*What we still don't know:*
- [ ] [Question we can't answer from this data]

## Impact on Existing Understanding

### Personas
| Persona | Confirmed | New Insight | Action |
|---------|-----------|-------------|--------|
| [Jordan] | [What's validated] | [What's new] | [Update needed?] |

### Product Roadmap
| Finding | Roadmap Item | Implication |
|---------|--------------|-------------|
| [Finding] | [Related initiative] | [Supports/challenges/new] |

## Prioritized Opportunities

*Ranked by evidence strength (frequency × source diversity).*

| Opportunity | Evidence | Impact | Confidence | Sources |
|-------------|----------|--------|------------|---------|
| [Opp 1] | Strong | High | High | [N] sources |
| [Opp 2] | Medium | Medium | Medium | [N] sources |

## Recommended Next Steps
1. [Immediate action]
2. [Follow-up research to fill gaps]
3. [Updates to context files]

## Suggested Updates to Context Files
- [ ] Update `personas.md` with [specific findings]
- [ ] Add opportunities to backlog
- [ ] Note product issues in `product.md`
```

## Framework Reference

Combines **Atomic Research** (breaking insights into atoms) with **thematic analysis** techniques for qualitative synthesis.

## Edge Case Handling

**If sources are limited or low-quality:**
I'll work with what's available but explicitly flag confidence levels. Single-source insights are labeled as hypotheses, not findings. If I don't have enough data to identify a pattern, I'll say so rather than forcing a theme from thin evidence.

**If the research doesn't answer your question:**
I'll tell you what the data CAN answer and what it can't, rather than stretching findings to fit the original question.

## Tips for Best Results
1. **Keep research files organized** — I'll synthesize across everything in your research folder
2. **More sources = higher confidence** — Single-source insights are hypotheses
3. **Contradictions are valuable** — They reveal segments or context differences
4. **Update context files** — Synthesis should feed back into your personas and product docs
