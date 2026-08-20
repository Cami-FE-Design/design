---
name: workflow-problem-to-prd
description: >-
  Multi-step workflow. Go from problem statement to engineering-ready PRD —
  research, framing, spec writing, multi-perspective review. Use when: problem
  to spec, new feature spec, problem to PRD.
category: specs
---
# Problem to PRD Workflow

**Workflow Pack:** Problem to PRD
**Tagline:** "From problem statement to engineering-ready"

---

## Workflow Instructions

When the user asks to run this workflow, follow these steps:

### Step 0: Read Context

First, read the user's context files:

1. `/context/company-overview.md`
2. `/context/product-overview.md`
3. `/context/personas.md`
4. `/context/competitive-landscape.md`

### Step 1: Scan Inputs

Read all files in the `inputs/` folder:
- `workflows/problem-to-prd/inputs/`

If no files are found, ask the user to describe:
1. What problem are you trying to solve?
2. Who experiences this problem?
3. What evidence do you have that it's real?
4. Why solve it now?

### Step 2: Extract JTBD

From the problem statement and evidence, extract Jobs-to-Be-Done:

#### A. Functional Jobs
What practical task is the user trying to accomplish?
> "When [situation], I need to [job], so I can [outcome]"

#### B. Emotional Jobs
How does the user want to feel?
> "When [situation], I want to feel [emotion], so I can [outcome]"

#### C. Social Jobs
How does the user want to be perceived?
> "When [situation], I want to be seen as [perception], so I can [outcome]"

#### D. Opportunity Score
For each job, estimate:
- **Importance** (1-10): How much does this matter to users?
- **Satisfaction** (1-10): How well served is this today?
- **Opportunity** = Importance + (Importance - Satisfaction)

**Save JTBD analysis to:**
`work/specs/outputs/jtbd-analysis-<YYYY-MM-DD>.md`

### Step 3: Build Opportunity Tree

Create an Opportunity Solution Tree:

```
OUTCOME: [Measurable business outcome]
├── OPPORTUNITY 1: [User need - framed as opportunity]
│   ├── Solution A: [Idea]
│   │   └── Assumptions: [What must be true]
│   ├── Solution B: [Idea]
│   │   └── Assumptions: [What must be true]
│   └── Solution C: [Idea]
├── OPPORTUNITY 2: [User need]
│   ├── Solution A: [Idea]
│   └── Solution B: [Idea]
└── OPPORTUNITY 3: [User need]
    └── Solution A: [Idea]
```

For each solution, identify:
- **Value assumption**: Will users want this?
- **Usability assumption**: Can users figure it out?
- **Feasibility assumption**: Can we build it?
- **Viability assumption**: Does it work for the business?

Suggest small experiments to test assumptions.

**Save opportunity tree to:**
`work/specs/outputs/opportunity-tree-<YYYY-MM-DD>.md`

### Step 4: Generate PRD

Create a complete PRD using problem-first methodology:

#### PRD Structure

```markdown
# PRD: [Feature Name]

**Status:** Draft
**Owner:** [From context or ask]
**Last Updated:** [Date]

---

## Problem Statement

### What problem are we solving?
[From input — describe in user terms]

### Who experiences this problem?
[Which personas, how many users]

### How do we know it's real?
[Evidence from input]

### Why solve it now?
[Urgency, opportunity cost, strategic alignment]

---

## Jobs-to-Be-Done
[Reference JTBD analysis]

---

## Proposed Solution

### Overview
[High-level description]

### Key Features
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

### User Flow
[How the user experiences this]

---

## Success Metrics

| Metric | Current | Target | How We'll Measure |
|--------|---------|--------|-------------------|
| [Primary metric] | [X] | [Y] | [Method] |
| [Secondary metric] | [X] | [Y] | [Method] |

---

## Risks & Mitigations

| Risk | Type | Likelihood | Impact | Mitigation |
|------|------|-----------|--------|------------|
| [Risk 1] | Value/Usability/Feasibility/Viability | H/M/L | H/M/L | [Plan] |

---

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Design | [X weeks] | [What] |
| Build | [X weeks] | [What] |
| Test | [X weeks] | [What] |
| Launch | [Date] | [What] |

---

## Out of Scope
- [What we're NOT doing]
- [And why]

---

## Open Questions
- [ ] [Question 1]
- [ ] [Question 2]

---

## Sign-off

| Role | Name | Approved |
|------|------|----------|
| Product | | ⬜ |
| Engineering | | ⬜ |
| Design | | ⬜ |
```

**Save PRD to:**
`work/specs/outputs/prd-[feature-name]-<YYYY-MM-DD>.md`

### Step 5: Write User Stories

For the proposed solution, create user stories:

#### User Story Format

```markdown
## User Story: [Title]

**As a** [persona/user type]
**I want to** [action]
**So that** [benefit]

### Acceptance Criteria
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]
- [ ] Given [context], when [action], then [result]

### Edge Cases
- [ ] [Edge case 1 and expected behavior]
- [ ] [Edge case 2 and expected behavior]

### Out of Scope
- [What this story does NOT include]

### Dependencies
- [Other stories or systems this depends on]

### Notes
- [Technical considerations]
- [Design considerations]
```

Create stories for:
1. **Happy path** — Main user flow
2. **Edge cases** — Error states, empty states
3. **Admin/config** — Setup or configuration if needed

**Save user stories to:**
`work/specs/outputs/user-stories-[feature-name]-<YYYY-MM-DD>.md`

### Step 6: Summary

After completing all outputs, provide a summary:

> **Problem to PRD Complete**
>
> I created a complete spec package for [feature]:
> - JTBD Analysis with [X] jobs identified
> - Opportunity Tree with [Y] solutions mapped
> - PRD with problem statement, success metrics, and risks
> - [Z] user stories with acceptance criteria
>
> **Key Risks to Address:**
> - [Top risk from PRD]
>
> **Recommended Next Step:** [Review with engineering/design]
>
> All outputs saved to `work/specs/outputs/`

---

## Framework Reference

### Marty Cagan — Problem-First PRD
- Start with problem, not solution
- Evidence before building
- Address V/U/F/V risks early

### Teresa Torres — Opportunity Solution Trees
- Opportunities are user needs
- Multiple solutions per opportunity
- Test assumptions before building

### Jobs-to-Be-Done
- Functional, emotional, social jobs
- Opportunity scoring formula

---

## Output File Structure

```
work/specs/outputs/
├── jtbd-analysis.md
├── opportunity-tree.md
├── prd-[feature-name].md
└── user-stories-[feature-name].md
```

---

## Error Handling

**No input provided:**
> "I need a problem statement to work with. Please add a file to `workflows/problem-to-prd/inputs/` describing the problem, or tell me: What problem are you trying to solve?"

**Problem is actually a solution:**
> "This looks like a solution ('add a dashboard') rather than a problem. Let's reframe: What user problem would this solve? Why do users need a dashboard?"

**No evidence provided:**
> "I can create a PRD, but it will be stronger with evidence. Do you have any user research, data, or feedback that supports this problem?"
