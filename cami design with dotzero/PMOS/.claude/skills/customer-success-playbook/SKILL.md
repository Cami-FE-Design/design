---
name: customer-success-playbook
description: 'Create CS playbooks with plays for onboarding, adoption, renewal, and expansion. Use when: customer success playbook, cs playbook, onboarding playbook, renewal playbook.'
disable-model-invocation: true
category: operations
---

# Customer Success Playbook

Create CS playbooks with plays for onboarding, adoption, renewal, and expansion.

## Output
Write the file to exactly this path:

  work/launches/outputs/cs-playbook-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- CS leaders building or formalizing playbooks
- PMs working on retention and activation
- Teams scaling customer success operations
- Defining health scoring and risk frameworks

## What You'll Need

**Critical inputs (ask if not provided):**
- Customer segment (SMB, Mid-Market, Enterprise)
- What CS challenges you're trying to solve

**Nice-to-have inputs:**
- Current churn/renewal rates
- Existing CS processes to improve
- Contract/renewal cycle timeline

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Key features, activation milestones, current metrics
- `context/personas.md` — User types, their goals, what "success" looks like for them
- `context/company.md` — Team structure, CS resources, business model

**Tell the user what you found.** For example:
> "I found your personas in personas.md: Jordan (PM) and Sam (Creative Director). Your product.md shows 'First project completed' as your activation milestone and 91% monthly retention. I'll design the playbook around getting Jordan to that first project milestone and keeping Sam's team engaged."

### Step 2: Gather Playbook Context
If you don't have enough context, ask:
> "Before I create this CS playbook, I need:
> 1. Who is this playbook for? (SMB, Mid-Market, Enterprise)
> 2. What CS challenges are you trying to solve? (churn, slow onboarding, low expansion)
>
> I can pull activation milestones from product.md and user profiles from personas.md."

### Step 3: Define Customer Journey Stages
Map the stages from sign-up to renewal/expansion:
- Onboarding (Day 0-30)
- Adoption (Day 31-90)
- Value Realization (Day 91+)
- Renewal/Expansion (Contract milestone)

### Step 4: Create Stage-Specific Plays
Each stage needs:
- Goals and success criteria
- Key activities and touchpoints
- Templates and talk tracks
- Risk signals and interventions

### Step 5: Build Health Scoring
Define leading indicators of success and churn risk.

### Step 6: Create Escalation Matrix
When should CS involve product, engineering, exec?

## Output Template

```markdown
# Customer Success Playbook: [Product/Segment]

## Context
*What I found in your files:*
- **Product activation milestone:** [From product.md]
- **Target personas:** [From personas.md — who needs to succeed]
- **Current retention:** [From product.md — baseline metrics]

---

**Segment:** SMB / Mid-Market / Enterprise
**Average Contract Value:** $[X]
**Renewal Cycle:** Monthly / Annual / Multi-year
**CSM Ratio:** 1:[X] accounts

---

## Customer Journey Overview

| Stage | Timeline | Goal | Key Metrics |
|-------|----------|------|-------------|
| Onboarding | Day 0-30 | First value achieved | Time to first [milestone] |
| Adoption | Day 31-90 | Core features adopted | [Feature] adoption rate |
| Value Realization | Day 91+ | ROI demonstrated | NPS, usage metrics |
| Renewal | [X] days before renewal | Renewal secured | Renewal rate, expansion |

---

## Play 1: Onboarding Play

### Goal
Get customer to first value within [X] days.

### Success Criteria
- [ ] [Milestone 1] completed by Day [X]
- [ ] [Milestone 2] completed by Day [X]
- [ ] [Milestone 3] completed by Day [X]

### Timeline & Touchpoints

| Day | Activity | Owner | Channel |
|-----|----------|-------|---------|
| 0 | Welcome email + kickoff scheduling | CSM | Email |
| 1-3 | Kickoff call | CSM | Video |
| 7 | Check-in on [milestone 1] | CSM | Email |
| 14 | Training session | CSM | Video |
| 21 | Progress review | CSM | Email |
| 30 | Onboarding complete call | CSM | Video |

### Kickoff Call Agenda
1. Introductions (5 min)
2. Confirm goals and success metrics (10 min)
3. Review implementation plan (15 min)
4. Assign action items (10 min)
5. Schedule next check-in (5 min)

### Templates

**Welcome Email**
Subject: Welcome to [Product] — let's get you started

Hi [Name],

Welcome to [Product]! I'm [CSM Name], your Customer Success Manager.

To get you to value quickly, here's what we'll do together:
1. [Milestone 1] — by Day [X]
2. [Milestone 2] — by Day [X]
3. [Milestone 3] — by Day [X]

I've scheduled our kickoff call for [Date/Time].

In the meantime, here's one thing you can do right now: [Quick win action]

Looking forward to working together!

[Signature]

**Onboarding Complete Email**
Subject: You're live! Here's what's next

Hi [Name],

Congratulations — you've completed onboarding! Here's what you've achieved:
- ✅ [Milestone 1]
- ✅ [Milestone 2]
- ✅ [Milestone 3]

**What's Next:**
[Adoption phase activities]

I'll check in at [date] to see how things are going. In the meantime, reach out anytime.

[Signature]

### Risk Signals
- Kickoff not scheduled within 3 days → CSM outreach
- No login within 7 days → CSM + manager escalation
- Milestone not hit by deadline → Intervention call

---

## Play 2: Adoption Play

### Goal
Drive adoption of core features beyond initial use case.

### Success Criteria
- [ ] [Feature 1] adopted by [X]% of users
- [ ] [Feature 2] enabled
- [ ] [Metric] reaches [threshold]

### Key Activities

| Week | Activity | Trigger | Owner |
|------|----------|---------|-------|
| 4-6 | Feature adoption check-in | Post-onboarding | CSM |
| 8 | Business review (QBR-lite) | Scheduled | CSM |
| 12 | Full QBR | Scheduled | CSM |

### Feature Adoption Checklist
- [ ] [Feature 1] — Usage at [X]%
- [ ] [Feature 2] — [X] users enabled
- [ ] [Feature 3] — Integration connected
- [ ] [Feature 4] — Reports running

### Business Review (QBR) Agenda
1. Recap: What we set out to achieve (5 min)
2. Results: What you've accomplished (15 min)
3. Insights: What we've learned (10 min)
4. Roadmap: What's coming that helps you (10 min)
5. Next steps: Goals for next quarter (10 min)

### Risk Signals
- Usage drop >20% week-over-week → CSM outreach
- Champion goes silent → Risk flag + exec outreach
- Feature adoption stalled → Training offer
- Negative NPS response → Immediate follow-up

---

## Play 3: Renewal Play

### Goal
Secure renewal at or above current value.

### Timeline

| Days Before Renewal | Activity | Owner |
|---------------------|----------|-------|
| 90 | Renewal kickoff (internal) | CSM |
| 75 | Executive business review | CSM + Exec |
| 60 | Renewal proposal sent | CSM |
| 45 | Negotiation / objection handling | CSM + Sales |
| 30 | Contract finalized | CSM + Legal |
| 15 | Final signature push | CSM |
| 0 | Renewal closed | CSM |

### Renewal Health Check
Before starting renewal:
- Overall health score: [Green/Yellow/Red]
- Usage trend: [Up/Flat/Down]
- NPS/CSAT: [Score]
- Open support tickets: [#]
- Champion status: [Active/Passive/Left]

### Executive Business Review Agenda
1. Partnership recap (5 min)
2. Value delivered with metrics (15 min)
3. Customer feedback on roadmap (10 min)
4. Renewal terms discussion (10 min)
5. Mutual commitments (5 min)

### Renewal Objection Handlers

**"We want to reduce seats"**
Response: "I understand. Can you tell me more about what's driving that? [Listen] Let's look at your usage data to see if there are underutilized seats we can address differently..."

**"We're evaluating alternatives"**
Response: "That makes sense — you should make the best decision for your team. What criteria are most important to you? [Listen] Here's how we compare on those dimensions..."

**"Budget is tight this year"**
Response: "I hear you. Let's talk about the ROI you've seen with us. [Share metrics] Given this value, what would make the investment work for you?"

### Risk Signals
- Champion left company → Exec escalation, new champion identification
- No exec engagement at 90 days out → Escalate to CS leadership
- Competitor mentioned → Battlecard + exec involvement
- Usage decline → Value realization intervention

---

## Play 4: Expansion Play

### Goal
Identify and close expansion opportunities.

### Expansion Signals
| Signal | Opportunity | Action |
|--------|-------------|--------|
| Usage at >80% of limit | Upgrade tier | CSM proposes upgrade |
| New team/department mentioned | Add seats | CSM discovery call |
| Power user asks about [feature] | Feature upsell | CSM demo + proposal |
| Successful QBR with exec | Multi-year | CSM + Sales proposal |

### Expansion Discovery Questions
- "How has your team grown since we started working together?"
- "Are there other teams that might benefit from [Product]?"
- "What workflows are you doing manually that we could help with?"
- "What would it take to expand this to [other department]?"

### Expansion Proposal Template
Subject: Expanding [Product] to [team/use case]

Hi [Name],

Following our conversation about [expansion opportunity], I've put together a proposal:

**What's Included:**
- [Expansion item 1]
- [Expansion item 2]

**Investment:** $[X]/year (Y% discount for expanding)

**Timeline:** Can be live by [date]

**Next Step:** 15-minute call to finalize details?

[Signature]

---

## Health Scoring Framework

### Health Score Components

| Factor | Weight | Green | Yellow | Red |
|--------|--------|-------|--------|-----|
| Usage (DAU/MAU) | 30% | >50% | 25-50% | <25% |
| Feature Adoption | 25% | >3 features | 2-3 features | <2 features |
| NPS/CSAT | 20% | >8 | 6-8 | <6 |
| Support Tickets | 15% | <2/mo | 2-5/mo | >5/mo |
| Engagement | 10% | Active champion | Passive | No champion |

### Health Score Thresholds
- **Green (70-100):** Healthy, expansion opportunity
- **Yellow (40-69):** At risk, intervention needed
- **Red (0-39):** High churn risk, escalate immediately

### Intervention Playbook by Health Score

| Score | Action | Owner | Timeline |
|-------|--------|-------|----------|
| Yellow | CSM outreach + check-in call | CSM | Within 48 hours |
| Red | Exec escalation + rescue plan | CS Manager | Same day |
| Red + Champion left | War room + exec-to-exec | CS Director | Same day |

---

## Escalation Matrix

| Situation | Escalate To | Timeline | What They Do |
|-----------|-------------|----------|--------------|
| Onboarding stalled | CS Manager | Day 14 | Unblock resources |
| Champion leaving | CS Director | Same day | Exec outreach |
| Churn risk (Red health) | CS Director | Same day | Rescue plan |
| Product bug blocking | Product | Same day | Prioritize fix |
| Security/compliance | Security | Same day | Compliance response |
| Renewal at risk (>$50K) | VP CS | 60 days out | Exec involvement |
| Competitor threat | VP CS + Sales | Same day | Battlecard + strategy |

---

## Templates Library

### Email Templates
- Welcome email (Onboarding Play)
- Onboarding complete (Onboarding Play)
- Check-in email
- QBR scheduling
- Renewal proposal
- Expansion proposal
- At-risk intervention

### Meeting Agendas
- Kickoff call (Onboarding Play)
- QBR (Adoption Play)
- Executive business review (Renewal Play)
- Rescue call (Red health)

### Internal Templates
- Account handoff doc
- Health score review
- Renewal forecast
- Churn post-mortem
```

## Framework Reference
**Customer Success Stages:**
1. Onboarding — First value
2. Adoption — Full utilization
3. Value Realization — ROI proven
4. Renewal — Contract secured
5. Expansion — Growth captured

## Tips for Best Results
1. **Use your context files** — I'll connect milestones to personas and metrics
2. **Customize timelines** — SMB moves faster than Enterprise
3. **Define clear milestones** — "Activated" should mean something specific
4. **Make health scoring objective** — Gut feel doesn't scale
5. **Escalate early** — Red flags need immediate attention
6. **Document everything** — Playbooks only work if followed

## Suggested Updates
After creating the playbook:
- [ ] Update `product.md` with activation milestones and health thresholds
- [ ] Document churn reasons and intervention triggers
- [ ] Share playbook with CS team for feedback
