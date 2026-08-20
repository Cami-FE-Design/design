---
name: launch-checklist-generator
description: 'Generate comprehensive launch checklists customized to your feature tier. Use when: launch checklist, release checklist, go-live checklist, launch readiness.'
disable-model-invocation: true
category: launch
---

# Launch Checklist Generator

Generate comprehensive launch checklists customized to your feature tier.

## Output
Write the file to exactly this path:

  work/specs/outputs/launch-checklist-[feature]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Any feature launch (big or small)
- Standardizing your launch process
- Making sure nothing falls through the cracks

## What You'll Need
- Feature description
- Launch tier (T1 = major, T2 = medium, T3 = minor)
- Target launch date

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — What feature is launching? What's the context?
- `context/company.md` — Team structure (who owns what?)
- `context/personas.md` — Who will this impact? How should we communicate?

**Tell the user what you found.** For example:
> "I found 'Resource Planning v2' in your product.md as a Q2 priority. Your team structure shows 12 in Customer Success and 15 in Sales. I'll include support and sales enablement in the checklist."

### Step 2: Gather Launch Details
If not clear from context, ask:
> "I need a few things to create the launch checklist:
> 1. What feature are you launching? (I found [X] in product.md — is that it?)
> 2. What's the target launch date?
> 3. What tier is this launch?"

**Tier Decision Guide:**
| Tier | Examples | Risk Level |
|------|----------|------------|
| T1 | New product, pricing change, major feature overhaul, >50% of users affected | High |
| T2 | New feature, significant UX change, integration launch | Medium |
| T3 | Bug fix, copy change, small enhancement, internal tool | Low |

**Do NOT generate a checklist with [placeholders]. Get the real info first.**

### Step 3: Determine Launch Tier
- **T1 (Major):** New product, major feature, pricing change
- **T2 (Medium):** Significant feature, affects many users
- **T3 (Minor):** Small improvement, bug fix, low risk

### Step 4: Generate Checklist
Checklist is customized by tier — T1 gets everything, T3 gets essentials.

### Step 5: Assign Owners
Every item needs an owner — use team structure from company.md when available.

### Step 6: Set Review Points
Pre-launch review, go/no-go, post-launch review.

## Output Template

```markdown
# Launch Checklist: [Feature Name]

**Launch Tier:** T1 / T2 / T3
**Target Launch:** [Date]
**Owner:** [PM Name]

## Context
*What I found in your files:*
- **Feature:** [From product.md]
- **Team structure:** [From company.md — who's involved]
- **Impacted personas:** [From personas.md]

---

## Pre-Launch (T-2 weeks)

### Product
- [ ] PRD approved — Owner: [Name]
- [ ] Success metrics defined (from product.md: [metrics]) — Owner: [Name]
- [ ] Rollback plan documented — Owner: [Name]

### Engineering
- [ ] Code complete — Owner: [Name]
- [ ] Code reviewed — Owner: [Name]
- [ ] Unit tests passing — Owner: [Name]
- [ ] Staging tested — Owner: [Name]
- [ ] Performance tested — Owner: [Name] (T1/T2 only)
- [ ] Security review complete — Owner: [Name] (T1 only)

### Design
- [ ] Final designs approved — Owner: [Name]
- [ ] Edge cases designed — Owner: [Name]
- [ ] Error states designed — Owner: [Name]
- [ ] Accessibility reviewed — Owner: [Name] (T1/T2 only)

### QA
- [ ] Test plan created — Owner: [Name]
- [ ] Manual testing complete — Owner: [Name]
- [ ] Regression testing complete — Owner: [Name] (T1/T2 only)

---

## Pre-Launch (T-1 week)

### Documentation
- [ ] Help docs updated — Owner: [Name]
- [ ] API docs updated — Owner: [Name] (if applicable)
- [ ] Internal FAQ created — Owner: [Name] (T1/T2 only)

### Support (from company.md: [X] CS team members)
- [ ] Support team briefed — Owner: [Name]
- [ ] Troubleshooting guide created — Owner: [Name] (T1/T2 only)
- [ ] Escalation path defined — Owner: [Name] (T1 only)

### Sales (from company.md: [X] Sales team members) — T1/T2 only
- [ ] Sales team briefed — Owner: [Name]
- [ ] Demo script updated — Owner: [Name]
- [ ] Battlecard updated — Owner: [Name] (if competitive)

### Marketing (T1/T2 only)
- [ ] Launch messaging approved — Owner: [Name]
- [ ] Email/in-app notifications ready — Owner: [Name]
- [ ] Social posts scheduled — Owner: [Name] (T1 only)
- [ ] Blog post drafted — Owner: [Name] (T1 only)

### Legal (T1 only)
- [ ] Terms of service reviewed — Owner: [Name]
- [ ] Privacy policy updated — Owner: [Name]

---

## Launch Day (T-0)

- [ ] Go/no-go decision made — Owner: [Name]
- [ ] Feature flag enabled — Owner: [Name]
- [ ] Monitoring dashboards active — Owner: [Name]
- [ ] On-call rotation confirmed — Owner: [Name]
- [ ] Announcement sent — Owner: [Name]

---

## Post-Launch (T+1 week)

- [ ] Metrics reviewed (targets from product.md) — Owner: [Name]
- [ ] Bugs triaged — Owner: [Name]
- [ ] Customer feedback collected — Owner: [Name]
- [ ] Post-launch retro scheduled — Owner: [Name] (T1/T2 only)
- [ ] Success declared or iteration planned — Owner: [Name]

---

## Rollback Plan

**Trigger:** [When to roll back — e.g., error rate > 1%]
**Process:** [How to roll back]
**Owner:** [Name]
**Communication:** [How to notify users/team]

---

## Success Metrics

| Metric | Current | Target | Source |
|--------|---------|--------|--------|
| [Metric] | [From product.md] | [Target] | product.md |

---

## Assumptions
- ⚠️ [Assumptions about team availability, dependencies, etc.]
```

## Framework Reference
**Tiered launch playbook**:
- Scope checklist to risk level
- Every item has an owner
- Rollback is planned in advance

## Tips for Best Results

1. **Keep context files updated** — I'll pull team structure and success metrics from your files
2. **Be honest about tier** — Under-scoping leads to missed steps
3. **Assign real owners** — "TBD" items don't get done
4. **Plan the rollback before you need it** — It's too late when things go wrong
