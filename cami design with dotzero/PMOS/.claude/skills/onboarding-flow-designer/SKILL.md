---
name: onboarding-flow-designer
description: 'Design onboarding flows that guide users to value quickly without being annoying. Use when: onboarding flow, design onboarding, first-time user experience, ftue design, user activation.'
disable-model-invocation: true
category: specs
---

# Onboarding Flow Designer

Design onboarding flows that guide users to value quickly without being annoying.

## Output
Write the file to exactly this path:

  work/specs/outputs/onboarding-flow-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- PMs improving activation rates
- Growth teams optimizing FTUE (first-time user experience)
- Anyone designing signup → value journey
- Before major onboarding redesigns

## The Problem

New users sign up but don't stick around. They're not getting to the "aha moment" fast enough, or they're getting bombarded with features before they understand the basics. Bad onboarding = high churn.

## What You'll Need

**Critical inputs (ask if not provided):**
- Product name and what it does
- Target user persona (who is signing up?)
- What you believe the "aha moment" is

**Nice-to-have inputs:**
- Current activation rate
- Current onboarding flow (to critique)
- Drop-off data by step
- User feedback on current experience

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Current activation rate, onboarding metrics, aha moment definition
- `context/personas.md` — Who's signing up? What's their experience level? What do they want to accomplish?
- `context/competitors.md` — How do competitors onboard? What can we learn?

**Tell the user what you found.** For example:
> "I found your Jordan persona (PM) in personas.md. Jordan is 'tech-comfortable but time-poor' and wants to 'see team workload at a glance.' Your product.md shows current activation is 45%. I'll design onboarding that gets Jordan to the capacity dashboard (the aha moment) within 3 minutes."

### Step 2: Get Onboarding Context
If the PM hasn't provided enough context, ask:
1. "What product are we designing onboarding for?"
2. "Who is your target user and what are they trying to accomplish?"
3. "What's the 'aha moment' — when do users first experience value?"

Do NOT design generic onboarding. Get the specific product and user first.

### Step 3: Define the Aha Moment
Identify the specific moment when users "get it":
- What action proves they understand the value?
- How quickly can you get them there?
- What's the minimum path to that moment?

**Examples:**
- Slack: Send a message and get a response
- Dropbox: Upload a file and access it from another device
- Canva: Create and download their first design

### Step 4: Segment Users by Intent
Different users need different paths:
- **Evaluator:** Just looking, needs to see value fast
- **Ready to start:** Has a job to do, wants to get to work
- **Invited user:** Joining existing team, needs context
- **Power user:** Already knows tools like this, skip the basics

### Step 5: Design the Flow
For each step, define:
- What the user sees
- What action they take
- What they learn
- How long it takes
- What can go wrong

**Principles:**
- Every step must earn the next click
- Show progress (e.g., "Step 2 of 4")
- Let users skip (escape hatch)
- Celebrate small wins

### Step 6: Add Escape Hatches
Power users hate being forced through tutorials:
- "Skip this" link on every screen
- "I already know this" option
- "Set up later" for non-critical steps
- Remember preferences for return visits

### Step 7: Plan Progressive Disclosure
Don't show everything at once:
- Day 1: Core feature only
- Week 1: Introduce secondary features
- Month 1: Advanced features via tooltips/nudges
- Never: Features they haven't needed

### Step 8: Define Metrics and Experiments
How you'll measure success:
- Activation rate: % of signups who reach aha moment
- Time to value: How long to reach aha moment
- Drop-off by step: Where users abandon
- 7-day retention: Did they come back?

## Output Template

```markdown
# Onboarding Flow Design: [Product Name]

**Owner:** [PM Name]
**Date:** [Date]
**Status:** Draft | In Review | Approved

## Context
*What I found in your files:*
- **Target persona:** [From personas.md — who's signing up]
- **Persona experience level:** [From personas.md]
- **Persona goal:** [From personas.md — what they want to accomplish]
- **Current activation:** [From product.md if known]
- **Competitor approaches:** [From competitors.md if relevant]

---

## Aha Moment Definition

**The user has reached value when:** [Specific action they complete]

**Why this is the aha moment:**
- [Evidence or reasoning]

**Target time to aha moment:** [X minutes]

---

## User Segments

| Segment | Characteristic | What They Need | Flow Variant |
|---------|----------------|----------------|--------------|
| Evaluator | Browsing, not committed | Quick value demo | Guided tour |
| Ready to Start | Has a task in mind | Get to work fast | Quick setup |
| Invited User | Joining existing team | Context on team/project | Team intro |
| Power User | Knows tools like this | Skip basics, advanced tips | Express lane |

---

## Onboarding Flow

### Welcome Screen

**What user sees:**
- Headline: [Welcome message]
- Subhead: [Value proposition]
- CTA: [Primary action button]

**User action:** Click to continue
**Time on screen:** ~5 seconds
**Escape hatch:** None (first screen)

```
┌─────────────────────────────────────┐
│                                     │
│        Welcome to [Product]         │
│                                     │
│    [Value proposition - 1 line]     │
│                                     │
│       [ Get Started ] ← CTA         │
│                                     │
│    "Already have an account? Login" │
│                                     │
└─────────────────────────────────────┘
```

---

### Step 1: [Step Name] (Required)

**What user sees:**
- [Description of screen]

**What user learns:**
- [Key concept introduced]

**User action:** [What they do]
**Time on screen:** ~[X] seconds
**Escape hatch:** [Skip option or none]

```
┌─────────────────────────────────────┐
│  Step 1 of 4                        │
│  ─────────────────                  │
│                                     │
│  [Screen content]                   │
│                                     │
│  [Input or action area]             │
│                                     │
│  [ Continue ]        Skip →         │
│                                     │
└─────────────────────────────────────┘
```

**What can go wrong:**
- [Potential confusion or error]
- **Fix:** [How to handle it]

---

### Step 2: [Step Name] (Required)

[Same format as Step 1]

---

### Step 3: [Step Name] (Optional)

**What user sees:**
- [Description]

**Why optional:**
- [Reason this can be skipped]

**Skip behavior:**
- [What happens if skipped]
- [When/how we'll remind them later]

---

### Completion Screen

**What user sees:**
- Celebration moment
- Summary of setup
- Clear next action

```
┌─────────────────────────────────────┐
│                                     │
│           🎉 You're all set!        │
│                                     │
│    You've created your first [X]    │
│                                     │
│    Here's what's next:              │
│    • [Suggested action 1]           │
│    • [Suggested action 2]           │
│                                     │
│       [ Go to Dashboard ]           │
│                                     │
└─────────────────────────────────────┘
```

---

## Progressive Disclosure Plan

| Timeframe | What to Introduce | How |
|-----------|-------------------|-----|
| Day 1 | [Core feature only] | Onboarding flow |
| Day 2-3 | [Secondary feature] | Tooltip on first visit |
| Week 1 | [Another feature] | Email + in-app nudge |
| Week 2+ | [Advanced features] | Only when relevant action taken |
| Never | [Features they don't need] | User must discover |

---

## Metrics & Success Criteria

### Primary Metrics

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Activation rate | [X%] | [Y%] | [Definition] |
| Time to value | [X min] | [Y min] | [Definition] |
| Onboarding completion | [X%] | [Y%] | [Definition] |

### Step-Level Metrics

| Step | Current Drop-off | Target | Notes |
|------|------------------|--------|-------|
| Step 1 | [X%] | [Y%] | [Hypothesis] |
| Step 2 | [X%] | [Y%] | [Hypothesis] |
| Step 3 | [X%] | [Y%] | [Hypothesis] |

### A/B Test Plan

**Test 1: [Hypothesis]**
- Control: [Current experience]
- Variant: [Change to test]
- Primary metric: [What we measure]
- Sample size: [Needed for significance]
- Duration: [How long to run]

---

## Implementation Notes

### Technical Requirements
- [ ] [Requirement 1]
- [ ] [Requirement 2]

### Design Dependencies
- [ ] [Design asset needed]
- [ ] [Wireframe approval]

### Content Needs
- [ ] [Copy for screens]
- [ ] [Email sequences]

---

## Open Questions

- [ ] [Question] — Owner: [Name], Due: [Date]
```

## Framework Reference

**Onboarding Best Practices:**
- Time to value is everything
- Different users need different paths
- Every step must earn the next click
- Escape hatches respect user autonomy
- Progressive disclosure prevents overwhelm

## Tips for Best Results

1. **Use your context files** — I'll design for your specific personas and their goals
2. **Know your aha moment** — If you can't define it, you can't optimize for it
3. **Measure before redesigning** — Know your current drop-off points
4. **Test one thing at a time** — Multi-variant tests are hard to interpret
5. **Talk to churned users** — They'll tell you where onboarding failed
6. **Mobile matters** — Many users start on mobile, even for desktop products

## Suggested Updates
After designing:
- [ ] Update `product.md` with new activation targets
- [ ] Document aha moment definition in `product.md`
- [ ] Track onboarding experiments and results
