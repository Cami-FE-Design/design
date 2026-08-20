---
name: message-matrix-builder
description: 'Build a Pragmatic Institute Message Matrix to tailor product messaging by buyer type (economic, functional, technical). Use when: message matrix, buyer messaging, create messaging by buyer, pragmatic messaging.'
disable-model-invocation: true
category: communication
---

# Message Matrix Builder

Build a Pragmatic Institute Message Matrix to tailor product messaging by buyer type (economic, functional, technical).

## Output
Write the file to exactly this path:

  work/launches/outputs/message-matrix-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Creating messaging for a product launch
- Tailoring sales messaging by buyer persona
- Aligning marketing and sales on value propositions
- Differentiating messaging for different stakeholder types

## What You'll Need
- Product features or capabilities to message
- Target buyer personas (economic, functional, technical)
- Competitive positioning (optional but helpful)
- Company/product context

## Critical Input Distinction

**Buyer Types (Pragmatic Framework):**
- **Economic Buyer:** Has budget authority, cares about ROI, business impact, risk
- **Functional Buyer:** Day-to-day user, cares about workflow, efficiency, usability
- **Technical Buyer:** Evaluates implementation, cares about security, integrations, scalability

**Before generating:**
If you don't have clear buyer personas, ask:
> "To create buyer-specific messaging, I need to understand:
> 1. Who are the different buyers involved in your sales process? (e.g., CFO, PM, CTO)
> 2. What features or capabilities should I message?
>
> Once I have this, I can create the Message Matrix."

## Process

### Step 1: Check Your Context
Read the user's context files:
- `context/product.md` — What features exist?
- `context/personas.md` — Who are the buyers vs users?
- `context/competitors.md` — Competitive positioning
- `context/company.md` — Company value props

**Tell the user what you found** and whether you have enough to proceed.

### Step 2: Identify Buyer Types
Map the buying committee:
- Who has budget authority? (Economic)
- Who will use the product daily? (Functional)
- Who evaluates technical fit? (Technical)

### Step 3: List Features/Capabilities
Identify 5-8 key features or capabilities to message. Focus on differentiators and high-value capabilities.

### Step 4: Map Messages to Buyers
For each feature, craft messaging for each buyer type:
- **Economic:** ROI, business impact, cost savings, risk reduction
- **Functional:** Workflow improvement, time savings, ease of use, job performance
- **Technical:** Implementation ease, security, integrations, performance, scalability

### Step 5: Add Proof Points
For each message, include evidence:
- Customer quotes
- Data/metrics
- Case studies
- Competitive differentiation

### Step 6: Generate Matrix
Create the structured message matrix with buyer-specific messaging.

## Output Template

```markdown
# Message Matrix: [Product Name]

**Date:** [Date]
**Target Market:** [Market segment]
**Competitive Context:** [Key competitors]

---

## Buyer Personas

### Economic Buyer: [Name/Role]
**Profile:** [Job title, decision authority]
**Cares About:** ROI, business risk, strategic alignment, budget impact
**Success Metric:** [What they measure]

### Functional Buyer: [Name/Role]
**Profile:** [Job title, day-to-day user]
**Cares About:** Workflow efficiency, ease of use, job performance, time savings
**Success Metric:** [What they measure]

### Technical Buyer: [Name/Role]
**Profile:** [Job title, technical evaluator]
**Cares About:** Security, integrations, scalability, implementation effort
**Success Metric:** [What they measure]

---

## Message Matrix

### Feature 1: [Feature Name]

| Buyer Type | Message | Proof Point |
|------------|---------|-------------|
| **Economic** | [ROI/business impact message] | [Data, quote, case study] |
| **Functional** | [Workflow/efficiency message] | [User feedback, time savings] |
| **Technical** | [Implementation/security message] | [Technical specs, integrations] |

**Competitive Differentiation:**
[How this feature positions against competitors]

---

### Feature 2: [Feature Name]

| Buyer Type | Message | Proof Point |
|------------|---------|-------------|
| **Economic** | [ROI/business impact message] | [Data, quote, case study] |
| **Functional** | [Workflow/efficiency message] | [User feedback, time savings] |
| **Technical** | [Implementation/security message] | [Technical specs, integrations] |

**Competitive Differentiation:**
[How this feature positions against competitors]

---

### Feature 3: [Feature Name]

| Buyer Type | Message | Proof Point |
|------------|---------|-------------|
| **Economic** | [ROI/business impact message] | [Data, quote, case study] |
| **Functional** | [Workflow/efficiency message] | [User feedback, time savings] |
| **Technical** | [Implementation/security message] | [Technical specs, integrations] |

**Competitive Differentiation:**
[How this feature positions against competitors]

---

### Feature 4: [Feature Name]

[Same structure]

---

### Feature 5: [Feature Name]

[Same structure]

---

## Messaging Guidelines

### For Economic Buyers
**Do:**
- Lead with business outcomes and ROI
- Quantify cost savings, revenue impact, or risk reduction
- Address strategic fit and competitive advantage
- Speak to total cost of ownership

**Don't:**
- Get lost in feature details
- Ignore budget/financial concerns
- Assume they understand product jargon

**Example phrasing:**
- "Reduces project overruns by 30%, protecting margins"
- "Pays for itself in 6 months through time savings"
- "Eliminates need for 3 separate tools, reducing software spend"

---

### For Functional Buyers
**Do:**
- Focus on day-to-day workflow improvements
- Emphasize ease of use and adoption
- Show how it makes their job easier
- Address common frustrations directly

**Don't:**
- Overlook usability concerns
- Assume they care about technical architecture
- Ignore the "but will my team actually use it?" question

**Example phrasing:**
- "See who's available in 10 seconds, not 10 minutes"
- "Client portal cuts status update emails by 80%"
- "No more Friday afternoon time reconstruction"

---

### For Technical Buyers
**Do:**
- Lead with security, integrations, and scalability
- Address implementation effort and technical risk
- Show compliance and enterprise readiness
- Speak to architecture and performance

**Don't:**
- Ignore security or compliance requirements
- Assume "it just works" is sufficient
- Overlook integration needs

**Example phrasing:**
- "SOC 2 Type II certified, SSO ready"
- "REST API for custom integrations, 99.95% uptime SLA"
- "Deploys in 1 day, no IT team required"

---

## Usage Guide

**For Sales:**
- Use matrix to tailor pitch by who's in the meeting
- Lead with economic buyer messaging in first call
- Adjust demo based on buyer type attending

**For Marketing:**
- Map website sections to buyer types (e.g., pricing page = economic, product tour = functional, security page = technical)
- Create buyer-specific assets (economic: ROI calculator, functional: demo video, technical: security whitepaper)
- Segment email nurture by buyer role

**For Product Marketing:**
- Launch announcements should address all three buyer types
- Feature pages need multiple angles
- Sales enablement materials organized by buyer

---

## Next Steps

- [ ] Review matrix with sales team for accuracy
- [ ] Create buyer-specific assets (case studies, one-pagers, slides)
- [ ] Test messaging in sales calls and measure resonance
- [ ] Update website copy to map to buyer journeys
- [ ] Train sales team on when to use which messages

---

## Appendix

### Common Mistakes
- ❌ Using the same message for all buyers
- ❌ Leading with features instead of benefits
- ❌ Ignoring proof points (assertions without evidence)
- ❌ Assuming one person fits one buyer type (many wear multiple hats)

### Buyer Type Overlaps
In small companies, one person may play multiple roles:
- **Founder/CEO:** Often economic + functional buyer
- **Head of Ops:** Often functional + technical buyer
- **CTO at small co:** Often all three

Adjust messaging to address multiple concerns when selling to small companies.

```

## Framework Reference

This skill follows the **Pragmatic Institute Message Matrix** framework:
- **Buyer-specific messaging** — Tailor to economic, functional, and technical buyer concerns
- **Feature-to-message mapping** — Systematically address how each capability serves different buyers
- **Proof points** — Ground every message in evidence (data, quotes, case studies)
- **Alignment across GTM** — Sales, marketing, and product marketing use consistent messaging

**Source:** [Pragmatic Institute - Buyer Personas and the Message Matrix](https://www.pragmaticinstitute.com/resources/articles/product/buyer-personas-and-the-message-matrix/)

## Tips for Best Results

1. **Start with buyer personas** — If your `personas.md` doesn't distinguish buyer types, update it first
2. **Focus on differentiation** — Every feature should show how you're different/better than alternatives
3. **Use real customer language** — Pull quotes from interviews for proof points
4. **Less is more** — 5-8 features is ideal. Too many dilutes the message
5. **Test with sales** — Best validation is whether sales reps actually use this in calls
6. **Save to context/** — Create `context/messaging.md` with approved matrix for consistency
