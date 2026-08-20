---
description: 'Process multiple user interview transcripts in batch and produce a cross-cut synthesis. Use when: batch interviews, interview synthesis, cross-interview themes.'
---

**Workflow Pack:** Batch Interview Analysis
**Tagline:** "10 interviews. 15 minutes. Done."

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files to understand their product and users:

1. `/context/product-overview.md`
2. `/context/personas.md`
3. `/context/company-overview.md`

### Step 1: Scan Inputs

Read all files in the `inputs/` folder within this workflow directory:
- `workflows/batch-interview-analysis/inputs/`

If no files are found, ask the user to add interview transcripts to the inputs folder.

Count the number of interviews and confirm with the user:
> "I found [X] interview files. Ready to analyze them?"

### Step 2: Ask for Research Context (Optional)

Ask the user:
> "What were you trying to learn from these interviews? (e.g., 'how PMs handle competitive research' or 'onboarding pain points')"

This helps focus the analysis. If they skip, proceed with general analysis.

### Step 3: Analyze Each Interview

For each interview file, create an **Interview Snapshot** with:

#### A. Participant Profile
- Role/title (if mentioned)
- Company type/size (if mentioned)
- Relevant context

#### B. Jobs-to-Be-Done
Extract JTBD statements in this format:
> "When [situation], I need to [job], so I can [outcome]"

Look for:
- **Functional jobs** — practical tasks they're trying to accomplish
- **Emotional jobs** — how they want to feel
- **Social jobs** — how they want to be perceived

#### C. Opportunities Identified
Frame as user needs, NOT solutions:
- ✅ "Need faster way to gather competitive intel"
- ❌ "Add a competitor tracking dashboard"

Rate evidence strength:
- **Strong** — mentioned multiple times, high emotion
- **Medium** — mentioned clearly once
- **Weak** — implied or tangential

#### D. Key Quotes
Pull verbatim quotes that:
- Capture emotional context
- Could be used in presentations
- Represent broader patterns

Include context for each quote.

#### E. Behavioral Observations
Note what you observed beyond what was said:
- Hesitation, frustration, excitement
- Workarounds they mentioned
- Tools or processes they use today

#### F. Follow-up Questions
Questions to explore in future research based on gaps or interesting threads.

**Save each snapshot to:**
`work/discovery/outputs/interview-snapshot-[filename]-<YYYY-MM-DD>.md`

### Step 4: Synthesize Across Interviews

After processing all interviews, create a **Research Synthesis** that includes:

#### A. Executive Summary
2-3 sentences on the most important findings.

#### B. Top Themes (Ranked by Frequency)
For each theme:
- How many interviews mentioned it
- Supporting evidence
- Representative quote

#### C. Patterns
- **Convergence** — where multiple interviews agree
- **Contradictions** — where interviews conflict (note possible explanations)
- **Outliers** — unique insights that might be important

#### D. Research Gaps
What we still don't know and should explore.

#### E. Prioritized Opportunities
| Opportunity | Evidence Strength | Mentions | Impact | Confidence |
|-------------|-------------------|----------|--------|------------|

**Save synthesis to:**
`work/discovery/outputs/research-synthesis-<YYYY-MM-DD>.md`

### Step 5: Generate Personas

Based on the research, create **Data-Backed Personas**:

For each distinct user type identified:

#### Persona Template
```markdown
## [Persona Name]: [Archetype Title]

**Who they are:** [Role, company type, context]

**Jobs-to-Be-Done:**
- "When [situation], I need to [job], so I can [outcome]"

**Goals:**
- [What they're trying to achieve]

**Frustrations:**
- [Pain points — use their words when possible]

**Current Behavior:**
- [How they solve this today]

**Quotes:**
> "[Representative quote]"

**Product Implications:**
- [What this means for our product]
```

Ground personas in actual research data. Cite which interviews support each persona.

**Save personas to:**
`work/discovery/outputs/personas-<YYYY-MM-DD>.md`

### Step 6: Create Opportunity Tree

Build an **Opportunity Solution Tree** based on the research:

```
OUTCOME: [Business outcome the research informs]
├── OPPORTUNITY 1: [User need from research]
│   ├── Evidence: [Which interviews, strength]
│   └── Potential solutions: [Brainstorm 2-3]
├── OPPORTUNITY 2: [User need]
│   ├── Evidence: [Sources]
│   └── Potential solutions: [Ideas]
└── OPPORTUNITY 3: [User need]
    ├── Evidence: [Sources]
    └── Potential solutions: [Ideas]
```

Prioritize opportunities by:
- Evidence strength (how many sources, how clear)
- User impact (how painful is this problem)
- Confidence (how sure are we this is real)

**Save opportunity tree to:**
`work/discovery/outputs/opportunity-tree-<YYYY-MM-DD>.md`

### Step 7: Summary

After completing all outputs, provide a summary to the user:

> **Batch Interview Analysis Complete**
>
> I analyzed [X] interviews and created:
> - [X] individual interview snapshots
> - 1 research synthesis with [Y] themes identified
> - [Z] data-backed personas
> - 1 opportunity tree with [N] prioritized opportunities
>
> **Top Finding:** [Most important insight]
>
> **Recommended Next Step:** [What to do with this research]
>
> All outputs saved to `work/discovery/outputs/`

---

## Framework Reference

### Teresa Torres — Continuous Discovery Habits
- Opportunities are user needs, not solutions
- Evidence strength matters for prioritization
- Opportunity trees connect research to decisions

### Jobs-to-Be-Done (Christensen/Ulwick)
- Functional, emotional, and social jobs
- "When [situation], I want to [motivation], so I can [outcome]"

### Atomic Research
- Break insights into atomic units
- Tag with themes and evidence strength
- Synthesize by clustering atoms

---

## Output File Structure

```
work/discovery/outputs/
├── interview-snapshot-[name-1].md
├── interview-snapshot-[name-2].md
├── interview-snapshot-[name-3].md
├── ...
├── research-synthesis.md
├── personas.md
└── opportunity-tree.md
```

---

## Error Handling

**No files in inputs folder:**
> "I don't see any interview files in the inputs folder. Please add your interview transcripts to `workflows/batch-interview-analysis/inputs/` and run this workflow again."

**Files aren't interviews:**
> "Some of these files don't look like interview transcripts. I'll do my best, but the analysis works best with actual interview notes or transcripts."

**Very short interviews:**
> "This interview is quite short. I'll extract what I can, but richer transcripts produce better analysis."
