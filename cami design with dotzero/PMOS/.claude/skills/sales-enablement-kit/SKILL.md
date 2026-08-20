---
name: sales-enablement-kit
description: 'Create complete sales enablement materials for new features or products. Use when: sales enablement, sales kit, how to sell, battlecard.'
disable-model-invocation: true
category: launch
---

# Sales Enablement Kit

Create complete sales enablement materials for new features or products.

## Output
Write the file to exactly this path:

  work/launches/outputs/sales-kit-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- New feature launches
- New tier or pricing changes
- Entering new market segments
- Competitive response situations

## What You'll Need

**Critical inputs (ask if not provided):**
- What are you enabling sales on? (feature, product, pricing)
- Who's the target buyer?

**Nice-to-have inputs:**
- Value prop and key differentiators
- Competitive context
- Recent win/loss insights

## Process

### Step 1: Check Your Context
First, read the user's context files:
- `context/product.md` — Feature details, pricing, value prop
- `context/personas.md` — Target buyers, their pain points, language
- `context/competitors.md` — Competitive positioning, differentiation
- `context/company.md` — Sales motion, team structure

**Tell the user what you found.** For example:
> "I found 'Resource Planning' in your product.md as the feature to enable. Your Jordan persona (PM) is the buyer — they care about 'workload visibility.' Your competitors.md shows Monday.com is the main competitor. I'll build battlecards and objection handlers based on this."

### Step 2: Gather Enablement Context
If you don't have enough context, ask:
> "Before I create this sales enablement kit, I need:
> 1. What feature/product? (I found [X] in product.md)
> 2. Who's the target buyer? (I found [personas] in personas.md)
>
> I can pull competitive positioning from competitors.md and value props from product.md."

### Step 3: Identify Sales Context
- What's the sales motion? (PLG, sales-assisted, enterprise)
- What stage of deal? (Discovery, demo, negotiation)
- What objections are expected?

### Step 4: Build Core Materials
- One-pager for leave-behind/email
- Battlecard for competitive positioning
- ROI framework for value justification

### Step 5: Create Talk Tracks
- Discovery questions to qualify
- Objection handlers with responses
- Demo talking points

### Step 6: Provide Templates
- Outreach email templates
- Follow-up sequences
- Proposal language

## Output Template

```markdown
# Sales Enablement Kit: [Feature/Product Name]

**Target Buyer:** [Persona]
**Sales Motion:** PLG / Sales-Assisted / Enterprise
**Launch Date:** [Date]

## Context
*What I found in your files:*
- **Feature/product:** [From product.md]
- **Target buyer:** [From personas.md — buyer profile]
- **Buyer pain points:** [From personas.md — what they care about]
- **Key competitors:** [From competitors.md]
- **Competitive positioning:** [From competitors.md]

---

## 1. One-Pager (Customer-Facing)

### [Feature Name]: [Benefit-First Headline]

**The Problem**
[2-3 sentences describing the pain point your target buyer feels]

**The Solution**
[2-3 sentences describing what you offer and why it's better]

**Key Benefits**
- **[Benefit 1]** — [One sentence explanation]
- **[Benefit 2]** — [One sentence explanation]
- **[Benefit 3]** — [One sentence explanation]

**How It Works**
1. [Simple step 1]
2. [Simple step 2]
3. [Simple step 3]

**Proof Points**
- "[Customer quote or metric]" — [Customer name/type]
- [Stat]: [Number] customers using this
- [Outcome]: Average [X]% improvement in [metric]

**Pricing**
[Brief pricing context — "Included in Business tier" or "Available as add-on"]

**Get Started**
[CTA — what to do next]

---

## 2. Competitive Battlecard

### Us vs. [Competitor 1]

| Dimension | Luma | [Competitor] | Winner |
|-----------|------|--------------|--------|
| [Capability 1] | [Our version] | [Their version] | Us/Them/Tie |
| [Capability 2] | [Our version] | [Their version] | Us/Them/Tie |
| [Capability 3] | [Our version] | [Their version] | Us/Them/Tie |
| Pricing | [Our price] | [Their price] | Us/Them/Tie |

**When We Win**
- [Scenario where we have the advantage]
- [Another scenario]

**When We Lose**
- [Scenario where they have the advantage]
- [How to counter if this comes up]

**Landmines to Set**
- Ask: "[Question that exposes competitor weakness]"
- Ask: "[Another question]"

**Talking Points**
- "Unlike [Competitor], we [differentiator]..."
- "[Competitor] requires [pain point], but we [solution]..."

### Us vs. [Competitor 2]
[Same structure]

---

## 3. Discovery Questions

### Qualification Questions
- "What tools are you currently using for [problem area]?"
- "How many people on your team would use this?"
- "What's your timeline for making a decision?"

### Pain Discovery
- "Tell me about the last time [problem] happened..."
- "How much time does your team spend on [manual process]?"
- "What happens when [pain point] occurs?"

### Budget/Authority
- "Who else is involved in evaluating tools like this?"
- "Do you have budget allocated for [category]?"
- "What would need to be true for you to move forward this quarter?"

### Competition
- "What other options are you considering?"
- "What would make you choose us over [competitor]?"

---

## 4. Objection Handlers

### "It's too expensive"
**What They Mean:** [Actual concern underneath]
**Response:** "[Scripted response]"
**Follow-Up:** "[Question to ask after response]"

### "We already have a solution"
**What They Mean:** [Actual concern underneath]
**Response:** "[Scripted response]"
**Follow-Up:** "[Question to ask after response]"

### "We need to think about it"
**What They Mean:** [Actual concern underneath]
**Response:** "[Scripted response]"
**Follow-Up:** "[Question to ask after response]"

### "[Feature/Competitor] specific objection"
**What They Mean:** [Actual concern underneath]
**Response:** "[Scripted response]"
**Follow-Up:** "[Question to ask after response]"

---

## 5. ROI Calculator

### Time Savings
| Activity | Current Time | With [Feature] | Savings |
|----------|--------------|----------------|---------|
| [Task 1] | X hrs/week | Y hrs/week | Z hrs/week |
| [Task 2] | X hrs/week | Y hrs/week | Z hrs/week |
| **Total** | | | **Z hrs/week** |

**Annual Time Saved:** [Z × 52] hours
**Value of Time Saved:** [Hours × hourly rate] = $[Amount]

### Revenue Impact
- [Metric improved]: [X]% improvement
- Estimated revenue impact: $[Amount]

### Total ROI
- **Investment:** $[Annual cost]
- **Return:** $[Total value]
- **ROI:** [X]%
- **Payback Period:** [X] months

---

## 6. Demo Script Outline

### Opening (2 min)
- Confirm attendees and roles
- Set agenda: "Today I'll show you [3 things], and we'll save time for questions"
- Discovery recap: "Last time we discussed [pain point]. Let me show you how we solve that..."

### Core Demo (15 min)
**Scene 1: [Pain Point → Solution]**
- "Let me show you what happens when [pain scenario]..."
- Demo the feature
- "Notice how [benefit]. Your team would [outcome]."

**Scene 2: [Second Pain Point → Solution]**
- [Same structure]

**Scene 3: [Third Pain Point → Solution]**
- [Same structure]

### Closing (3 min)
- "Based on what you've seen, [summary of value]"
- "What questions do you have?"
- "What would be the next step to [move forward]?"

---

## 7. Email Templates

### Initial Outreach
**Subject:** [Benefit-focused, <50 chars]

Hi [Name],

[One sentence about their company/situation showing you did research]

[One sentence about the problem you solve]

[One sentence about the result customers see]

Worth a 15-minute call to see if this could help [Company]?

[Signature]

### Post-Demo Follow-Up
**Subject:** Following up on [Feature] demo

Hi [Name],

Thanks for your time today. As we discussed:

**Key Takeaways:**
- [Benefit 1 specific to their situation]
- [Benefit 2 specific to their situation]

**Next Steps:**
- [What you agreed to do]
- [What they agreed to do]

Let me know if any questions come up.

[Signature]

### Proposal Follow-Up
**Subject:** [Company] + [Your Company] proposal

Hi [Name],

Attached is the proposal we discussed. Quick summary:

- **What's included:** [Brief summary]
- **Investment:** [Price]
- **Timeline:** [Start date if signed by X]

I'm available [times] if you'd like to walk through any details.

[Signature]

---

## 8. Internal Training Notes

### Key Messaging
- Lead with: "[Primary value prop]"
- Avoid: "[Common mistake or off-brand messaging]"
- Always mention: "[Proof point or differentiator]"

### Common Mistakes
- ❌ [Thing sales reps do wrong]
- ✅ [What to do instead]

### Escalation Triggers
- If prospect mentions [X], loop in [person/team]
- If deal size exceeds $[X], involve [person/team]
- If competitor is [X], use [specific battlecard]
```

## Framework Reference
**Sales enablement components:**
1. Educate (one-pager, training)
2. Differentiate (battlecards)
3. Qualify (discovery questions)
4. Handle (objection scripts)
5. Justify (ROI calculator)
6. Close (demo script, templates)

## Tips for Best Results
1. **Use your context files** — I'll pull personas, competitors, and value props automatically
2. **Know your buyer** — Different personas need different emphasis
3. **Be specific on competitors** — Generic battlecards don't help
4. **Test with sales** — Have AEs review and provide feedback
5. **Keep it scannable** — Sales will skim, make key points bold
6. **Update regularly** — Stale enablement is worse than none

## Suggested Updates
After creating the kit:
- [ ] Train sales team on new materials
- [ ] Update `competitors.md` with competitive insights from sales feedback
- [ ] Track win rates with new enablement
