---
name: customer-announcement-writer
description: 'Write consistent customer announcements across all channels — email, in-app, social, internal. Use when: customer announcement, announce to customers, pricing change announcement, maintenance notice.'
disable-model-invocation: true
category: launch
---

# Customer Announcement Writer

Write consistent customer announcements across all channels — email, in-app, social, internal.

## Output
Write the file to exactly this path:

  work/launches/outputs/announcement-[feature]-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Feature launches (big or small)
- Pricing or plan changes
- Scheduled maintenance or downtime
- Policy or terms updates
- Breaking changes or deprecations

## The Problem

Customer announcements go out inconsistently—different tone in email vs in-app, CS hears about it last, or the announcement buries the action required. Customers get confused, CS gets blindsided, and trust erodes.

**This skill solves it by:** Generating consistent messaging across all channels (email, in-app, social, internal Slack) using persona language from your context files—so every touchpoint tells the same story with the right tone.

## What You'll Get

I'll generate a complete announcement package including:
- Email version with subject line and preview text
- In-app notification (brief, action-oriented)
- Changelog entry (structured, technical)
- Social posts (Twitter/X and LinkedIn)
- Internal Slack message for CS/Sales with talking points

## What You'll Need

**Critical inputs (ask if not provided):**
- What's changing? (feature, pricing, maintenance, etc.)
- What type of announcement? (Positive, Neutral, or Sensitive)

**Nice-to-have inputs:**
- Who's affected (all users vs specific segments)
- Action required (none, optional, required)
- Effective date

## Process

### Step 1: Check Your Context
I'll start by reading your context files:
- `context/product.md` — Feature details, pricing tiers, product name
- `context/personas.md` — Who's most affected? What language do they use?
- `context/company.md` — Brand voice, support channels, team structure

**I'll tell you what I found.** For example:
> "I found 'Resource Planning' in your product.md as a Pro-tier feature. Your Jordan persona (PM) is most affected. I'll write the announcement using their language ('workload visibility') and mention the Pro plan specifically."

### Step 2: Gather Announcement Details
If you haven't provided enough context, I'll ask:
> "Before I write this announcement, I need:
> 1. What's changing? (I found [X] in product.md — is that it?)
> 2. Is this Positive (new feature), Neutral (maintenance), or Sensitive (pricing/deprecation)?
>
> I can pull affected segments from personas.md and brand voice from company.md."

I won't write an announcement without knowing who's affected and what action (if any) they need to take.

### Step 3: Identify Announcement Type
Different changes need different tones:

| Type | Tone | Examples |
|------|------|----------|
| **Positive** | Excited, benefit-focused | New features, improvements |
| **Neutral** | Informative, matter-of-fact | Maintenance, minor updates |
| **Sensitive** | Transparent, empathetic | Pricing changes, deprecations |

### Step 4: Define the Core Message
One sentence that answers: "What does this mean for me?"
- ✅ "You can now track time from your phone"
- ❌ "We're excited to announce mobile time tracking"

### Step 5: Identify Required Action
- **No action:** "No action needed — this just works"
- **Optional action:** "Try it out: [CTA]"
- **Required action:** "You must X by [date] or Y will happen"

### Step 6: Generate All Formats
I'll create consistent messaging across:
- Email (the most detailed version)
- In-app notification (brief, action-oriented)
- Changelog (structured, technical)
- Social (engaging, shareable)
- Internal Slack (context for CS/Sales)

## Output Template

I'll generate this announcement package for you:

```markdown
# Customer Announcement: [Title]

**Announcement Type:** Positive / Neutral / Sensitive
**Affected Users:** [Who is affected]
**Action Required:** None / Optional / Required
**Effective Date:** [Date]

## Context
*What I found in your files:*
- **Feature/change:** [From product.md]
- **Affected persona:** [From personas.md — who this impacts most]
- **Persona language:** [From personas.md — how they describe this problem]
- **Brand voice:** [From company.md]

---

## Email Version

**Subject Line:** [Benefit-first, <50 chars]
**Preview Text:** [120 chars that appear in inbox]

---

Hi {{first_name}},

[Opening sentence: What's happening and why it matters to them]

[1-2 sentences of detail]

**What this means for you:**
- [Benefit or impact 1]
- [Benefit or impact 2]

[If action required:]
**What you need to do:**
[Clear action with deadline]

[If no action required:]
**No action needed** — [brief note about auto-rollout or availability]

**→ [CTA Button Text]**

Questions? Reply to this email or [contact method].

— The [Product] Team

---

## In-App Notification

**[Emoji] [Headline in <10 words]**
[One sentence with key message] [CTA link →]

---

## Changelog Entry

### [Benefit-first headline]

[One paragraph: What, why, and how to use it]

**Details:**
- [Specific change 1]
- [Specific change 2]

**Availability:** [Who, when, how to access]

---

## Social Posts

### Twitter/X
[Announcement in <280 chars]
[Link]

### LinkedIn
[Professional announcement, 1-2 paragraphs]

[Link]

#[hashtag] #[hashtag]

---

## Internal Slack (for CS/Sales)

**📢 Customer Announcement Going Out: [Title]**

**What:** [Brief description]
**Who's affected:** [Segments]
**Customer action needed:** Yes/No — [details]
**Talking points if customers ask:**
- [Point 1]
- [Point 2]

**Links:**
- Email preview: [link]
- Help doc: [link]
```

## Tone Guidance by Type

### Positive Announcements (New Features)
- Lead with the benefit, not the feature
- Be excited but not over-the-top
- Focus on what they can DO now
- Include how-to

### Neutral Announcements (Maintenance)
- Lead with timing and duration
- Be specific about impact
- Provide alternatives if possible
- Apologize only if disruption is significant

### Sensitive Announcements (Pricing, Deprecation)
- Lead with transparency
- Acknowledge the impact
- Explain the why (briefly)
- Provide clear timeline and options
- Offer help/support path

## Framework Reference
**Announcement hierarchy:**
1. What's happening (headline)
2. What it means for you (impact)
3. What you need to do (action)
4. When it happens (timing)
5. How to get help (support)

## Tips for Best Results
1. **Use your context files** — I'll pull persona language, brand voice, and feature details
2. **Be specific about who's affected** — "Pro plan users" vs "all users"
3. **State action requirements clearly** — Required, optional, or none
4. **Match tone to announcement type** — Excited for features, empathetic for pricing
5. **Internal Slack is for CS/Sales** — Give them talking points, not just the announcement
6. **Use persona language** — Write the way your users talk, not internal jargon

## Suggested Updates
After sending:
- [ ] Update `product.md` with launch date if this is a new feature
- [ ] Add announcement to changelog
