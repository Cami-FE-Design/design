---
name: process-documentation
description: 'Documents team processes with quick reference checklists and detailed steps Use when: process documentation, document this process, write a runbook, SOP for, standard operating procedure.'
disable-model-invocation: true
category: operations
---

# Process Documentation

Documents team processes with a quick reference checklist and detailed step-by-step guide that new team members can follow.

## Output
Write the file to exactly this path:

  work/specs/outputs/process-doc-[name]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill

- Onboarding new team members who need to learn processes
- Standardizing operations across the team
- Compliance or audit documentation
- Capturing knowledge before someone leaves
- Creating runbooks for recurring tasks

## What You'll Need

**Critical inputs (ask if not provided):**
- Which process to document
- Who performs this process (role)

**Nice-to-have inputs:**
- Current steps (even rough notes)
- Common mistakes or gotchas
- Tools/systems involved
- Who to escalate to when things go wrong

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/company.md` — Team structure, roles, escalation paths
- `context/product.md` — Related features, tools used, systems involved

**Tell the user what you found.** For example:
> "I found your team structure in company.md — your CS team has 12 people and Engineering has 25. I'll tailor the process doc to the right audience and include relevant escalation paths."

### Step 2: Gather Process Details
If you don't have enough context, ask:
> "Before I document this process, I need:
> 1. What process are we documenting?
> 2. Who performs it? (I found these roles in company.md: [list])
> 3. When/how often does it happen?
>
> Do you have rough notes or current steps I can build from?"

**Do NOT generate a process doc from imagination. Get the actual steps first.**

### Step 3: Define Scope and Audience
Clarify what process you're documenting, who will use this doc, and what they need to accomplish.

### Step 2: Create Quick Reference Checklist
Build a scannable checklist for experienced users who just need a reminder of the steps.

### Step 3: Document Detailed Steps
Write the full step-by-step guide with screenshots, links, and context that a new person would need.

### Step 4: Identify Roles and Responsibilities
Clarify who does what, who approves, and who to contact for help.

### Step 5: Capture Exceptions and Edge Cases
Document what to do when things don't go as expected.

### Step 6: Add Ownership and Maintenance
Assign an owner and create a changelog to keep the doc fresh.

## Output Template

```markdown
# [Process Name]

**Owner:** [Name/Role]
**Last Updated:** [Date]
**Review Frequency:** [Quarterly/Annually/As needed]

## Context
*What I found in your files:*
- **Team responsible:** [From company.md]
- **Related systems:** [From product.md]
- **Escalation path:** [From company.md]

---

## Quick Reference Checklist

Use this if you've done this before and just need a reminder.

- [ ] Step 1: [Brief action]
- [ ] Step 2: [Brief action]
- [ ] Step 3: [Brief action]
- [ ] Step 4: [Brief action]
- [ ] Step 5: [Brief action]
- [ ] Final check: [Verification step]

---

## Overview

**Purpose:** [What this process accomplishes]

**When to use:** [Trigger conditions — when does this process kick in?]

**Who performs:** [Role responsible]

**Estimated time:** [How long this typically takes]

**Prerequisites:**
- [Access/permission needed]
- [Tool or system needed]
- [Information needed before starting]

---

## Detailed Steps

### Step 1: [Step Name]

**What:** [Clear description of what to do]

**How:**
1. [Specific sub-step]
2. [Specific sub-step]
3. [Specific sub-step]

**Where:** [Link to tool/system/location]

**Tip:** [Helpful hint or common mistake to avoid]

### Step 2: [Step Name]

**What:** [Clear description of what to do]

**How:**
1. [Specific sub-step]
2. [Specific sub-step]

**Where:** [Link to tool/system/location]

### Step 3: [Step Name]

[Continue pattern...]

---

## Roles and Responsibilities

| Role | Responsibility |
|------|----------------|
| [Role 1] | [What they do in this process] |
| [Role 2] | [What they do in this process] |
| [Approver] | [When they need to approve/sign off] |

---

## Exceptions and Edge Cases

### If [Exception Condition 1]
**What to do:** [Alternative steps]
**Who to contact:** [Escalation path]

### If [Exception Condition 2]
**What to do:** [Alternative steps]
**Who to contact:** [Escalation path]

---

## Troubleshooting

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| [Common issue 1] | [Why it happens] | [How to fix] |
| [Common issue 2] | [Why it happens] | [How to fix] |

---

## Related Processes

- [Related Process 1] — [How it connects]
- [Related Process 2] — [How it connects]

---

## Tools and Resources

- [Tool 1]: [Link] — [What it's used for in this process]
- [Tool 2]: [Link] — [What it's used for in this process]
- [Resource]: [Link] — [Reference material]

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| [Date] | [Name] | Initial version |
| | | |
```

## Framework Reference

This skill follows documentation best practices from:

- **Write the Docs** community standards for technical documentation
- **The Documentation System** (Divio) — separating quick reference from detailed how-to
- **Runbook patterns** from SRE/DevOps practices

Key principles:
- Lead with a scannable checklist for speed
- Provide enough detail for someone completely new
- Document exceptions because they always happen
- Assign ownership because orphan docs go stale

## Tips for Best Results

1. **Use your context files** — I'll pull team structure and escalation paths from company.md
2. **Walk through the process yourself** — Document while doing, not from memory
3. **Include the "why"** — Context helps people make good decisions when things go sideways
4. **Screenshot liberally** — Show where to click, what success looks like
5. **Test with a new person** — Have someone unfamiliar try to follow the doc
6. **Set a review date** — Stale docs are worse than no docs

## Suggested Updates
After documenting:
- [ ] Link this process doc from relevant product.md sections
- [ ] Notify team members who use this process
- [ ] Set calendar reminder for review date
