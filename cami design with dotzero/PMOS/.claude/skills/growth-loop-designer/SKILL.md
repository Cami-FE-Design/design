---
name: growth-loop-designer
description: "Design growth loops that compound — identify which loops fit your product, design the mechanics, and define what to measure. Use when: growth strategy, growth loops, viral loop, referral program, PLG, product-led growth, retention strategy."
disable-model-invocation: true
category: strategy
---

# Growth Loop Designer

Design growth loops that compound — identify which loops fit your product at your stage, design the specific mechanics, and define what to measure.

## Output
Write the file to exactly this path:

  work/strategy/outputs/growth-loop-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- You need a growth strategy beyond "do more marketing"
- You're deciding between product-led, sales-led, or community-led growth
- You want to add viral or referral mechanics to your product
- Retention is leaking and you need to fix it before scaling acquisition
- You're preparing a growth plan for the board or investors
- You've grown through one channel and need to find the next

## The Problem

Most PMs treat growth as a marketing problem — run more ads, write more content, hire more salespeople. But sustainable growth comes from loops built into the product itself, where each new user creates conditions for the next. The difference between a startup that scales and one that stalls is usually whether they found a growth loop that compounds.

The problem is that growth loop design requires understanding which loops are even possible for YOUR product, at YOUR stage, with YOUR resources. A B2B SaaS tool can't copy Dropbox's referral loop. A single-player product can't force network effects. Generic growth advice ("add a referral program!") wastes months building mechanics that don't fit.

This skill analyzes your product and market to identify realistic growth loops, design the specific mechanics, and define the metrics that tell you if they're working.

## What You'll Get

A complete growth loop design:
- Assessment of which growth model fits your product (PLG, sales-led, community-led, hybrid)
- 2-3 specific growth loops designed for your product — not generic templates
- The mechanics of each loop: trigger, action, output, re-entry
- Metrics and measurement plan for each loop
- Prioritized experiment plan to validate before building

## What You'll Need

**Critical inputs (ask if not provided):**
- What's your product? (what it does, who uses it)
- What's your current growth channel? (how users find you today)

**Helpful (improves the design):**
- Current metrics: signups, activation rate, retention, referral rate
- What you've tried that worked or didn't
- Team capacity and timeline constraints
- Pricing model (free, freemium, trial, paid-only)

## Process

### Step 1: Read Your Context
I'll check your context files to understand your product's growth reality:
- **product.md** — Current metrics, pricing, features, user flow
- **company.md** — Stage, priorities, resources, business model
- **personas.md** — Who uses the product, how they discover it, what makes them stay
- **competitors.md** — How competitors grow, where they're vulnerable

I'll tell you what I found. For example:
> "From your context: You're a B2B SaaS at Series A, $2M ARR, selling to PM teams. Your current growth is LinkedIn-driven (founder-led). Your product is a single-player tool that PMs use individually, but you're moving toward team features. Your persona (Head of Product) has a $5K+ budget. Competitors grow through content SEO and partnerships."

### Step 2: Diagnose Your Growth Model Fit
Before designing loops, I need to determine which growth model fits your product. Not every product can be product-led. Not every product needs to be.

**Product-Led Growth (PLG)**
- Fits when: Users can get value without talking to sales; product has natural sharing or collaboration; low price point or freemium
- Examples: Slack, Notion, Figma, Dropbox
- Key metric: Time to value, activation rate

**Sales-Led Growth**
- Fits when: High ACV, complex buying process, multiple stakeholders, requires customization
- Examples: Salesforce, Workday, enterprise tools
- Key metric: Pipeline velocity, close rate

**Community-Led Growth**
- Fits when: Users have shared identity, product creates artifacts people share, strong word-of-mouth potential
- Examples: Reforge, dbt, Figma community
- Key metric: Community engagement, referral rate

**Content-Led Growth**
- Fits when: Product solves problems people actively search for, strong SEO opportunity, educational content builds trust
- Examples: HubSpot, Ahrefs, Zapier
- Key metric: Organic traffic, content → signup conversion

**Hybrid (most common)**
- PLG for self-serve + Sales-led for enterprise
- Community for awareness + Content for acquisition + PLG for activation

I'll recommend the primary model and explain why, based on YOUR product reality.

### Step 3: Identify Candidate Growth Loops
A growth loop has four parts:

```
[Trigger] → [Action] → [Output] → [Re-entry]
     ↑                                    |
     └────────────────────────────────────┘
```

I'll identify 2-3 loops that are realistic for your product. For each, I'll map the specific mechanics:

**Types of loops I'll evaluate:**

| Loop Type | How It Works | Fits When |
|-----------|-------------|-----------|
| **Viral Loop** | User invites others as part of normal use | Product has collaboration or sharing built in |
| **Content Loop** | Users or product create content that attracts new users | Product creates shareable artifacts (reports, dashboards, templates) |
| **Paid Loop** | Revenue funds acquisition that generates more revenue | Unit economics are strong (LTV > 3x CAC) |
| **Network Effect Loop** | More users = more value for all users | Product gets better with more participants |
| **Data Loop** | More usage = smarter product = more value | AI/ML features, recommendations, benchmarks |
| **Platform Loop** | Developers/partners build on your product, attracting users | Extensible product with API or marketplace |
| **Sales Loop** | Happy customers refer new customers to sales | High-touch product with strong NPS |

For each candidate loop, I'll be honest about feasibility:
> "A viral loop isn't realistic right now because your product is single-player — there's no natural reason to invite a colleague. But a content loop IS realistic: your PMs create competitive analyses and roadmaps that they share with stakeholders, which puts your brand in front of other PMs."

### Step 4: Design the Loop Mechanics
For each viable loop, I'll design the specific mechanics:

**Trigger:** What initiates the loop? (User completes a task, hits a milestone, gets a result)
**Action:** What does the user do? (Share, invite, publish, reference)
**Output:** What artifact enters the world? (Shared doc, referral link, public template, case study)
**Re-entry:** How does the output bring new users back? (SEO, social share, colleague sees it, community discovery)
**Friction points:** Where could the loop break? (Too many steps, no incentive, output isn't compelling)
**Amplifiers:** What makes the loop spin faster? (Incentives, social proof, timing triggers)

I won't design generic mechanics. I'll design them for YOUR product:
> "When a PM generates a competitive analysis using your tool, they share the PDF with their exec team. Add a subtle 'Powered by [Product]' footer with a link. When the exec forwards it to another PM, that PM sees the link and signs up. The loop: PM uses tool → creates analysis → shares with stakeholders → stakeholder forwards → new PM signs up."

### Step 5: Retention First Check
Before scaling any acquisition loop, I'll check your retention foundation. Growth without retention is a leaky bucket.

**Retention diagnostic:**
- What's your Day 1 / Day 7 / Day 30 retention? (If you don't know, that's the first problem)
- What's your activation milestone? Can users reach it in < 5 minutes?
- What brings users back? Is there a natural frequency? (Daily, weekly, monthly)
- What's your "aha moment"? How many users reach it?

**If retention is weak, I'll say so directly:**
> "Your growth loops won't work until you fix retention. Users sign up but only 30% activate. The priority is: (1) reduce time to first value from 15 minutes to under 5, (2) add a weekly trigger that brings users back, (3) THEN layer on acquisition loops."

I'll design the retention fix as Loop 0 — the foundation that makes all other loops work.

### Step 6: Metrics and Measurement
For each designed loop, I'll define exactly what to measure:

**Loop health metrics:**
- **Loop time:** How long does one cycle take? (Days? Weeks?)
- **Loop conversion:** What % of users who enter the trigger actually complete the loop?
- **K-factor (viral coefficient):** How many new users does each existing user generate?
- **Loop efficiency:** What's the cost per loop cycle? (Zero for organic, nonzero for paid)

**Leading indicators (measure weekly):**
- Trigger rate: What % of active users hit the trigger?
- Action rate: Of those triggered, what % take the action?
- Output quality: Does the output attract new users?
- Re-entry conversion: What % of exposed new users actually sign up?

**Lagging indicators (measure monthly):**
- New users from loop vs. other channels
- Contribution to overall growth rate
- Payback period if any spend involved

### Step 7: Prioritize and Experiment
I'll rank your growth loops by:

| Factor | Weight | Why It Matters |
|--------|--------|----------------|
| **Feasibility** | High | Can you build this in < 4 weeks? |
| **Compounding potential** | High | Does it get stronger over time or stay flat? |
| **Retention prerequisite** | Medium | Does it need retention to be fixed first? |
| **Cost** | Medium | Free loops > paid loops early on |
| **Time to signal** | Medium | How fast will you know if it's working? |

For the top loop, I'll design a minimum viable experiment:
- What to build (smallest version that tests the loop)
- What metric proves the loop works
- What the success threshold is
- How long to run the experiment
- What to do if it works (and if it doesn't)

## Output Template

```markdown
# Growth Loop Design: [Product Name]

**Date:** [Date]
**Stage:** [Seed / Series A / B / C]
**Current ARR:** [If known]
**Current growth model:** [How users find you today]

## Your Context
*What I pulled from your files:*
- **Product:** [What it does, who uses it]
- **Current growth:** [Primary acquisition channel]
- **Metrics:** [Key numbers — signups, activation, retention]
- **Competitive landscape:** [How competitors grow]

---

## Growth Model Assessment

**Recommended primary model:** [PLG / Sales-led / Community-led / Content-led / Hybrid]

**Why this fits your product:**
[2-3 sentences grounded in your specific product, market, and stage]

**What doesn't fit (and why):**
[Which models I considered and rejected, with reasoning]

---

## Retention Foundation (Loop 0)

**Current state:**
| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Activation rate | [X]% | [Target]% | [Gap] |
| Day 1 retention | [X]% | [Target]% | [Gap] |
| Day 7 retention | [X]% | [Target]% | [Gap] |
| Day 30 retention | [X]% | [Target]% | [Gap] |
| Time to first value | [X] min | < 5 min | [Gap] |

**Retention verdict:** [Ready to scale acquisition / Needs work first]

**If needs work:**
- Fix 1: [Specific retention improvement]
- Fix 2: [Specific retention improvement]
- Timeline: [How long before acquisition loops make sense]

---

## Growth Loop 1: [Name] (Primary)

**Type:** [Viral / Content / Paid / Network / Data / Platform / Sales]

**The loop:**
```
[Trigger] → [Action] → [Output] → [Re-entry]
```

**Mechanics:**
- **Trigger:** [What initiates the loop — specific to your product]
- **Action:** [What the user does — specific behavior]
- **Output:** [What artifact enters the world]
- **Re-entry:** [How the output brings new users back]

**Why this works for you:**
[2-3 sentences connecting this loop to your specific product and market]

**Friction points:**
- [Where the loop could break]
- [Where users might drop off]

**Amplifiers:**
- [What makes the loop spin faster]
- [Incentives or mechanics that increase conversion at each step]

**Metrics:**
| Metric | What It Measures | Target |
|--------|------------------|--------|
| Loop time | Time for one cycle | [X days/weeks] |
| Trigger rate | % of users who enter | [X]% |
| Action rate | % who complete the action | [X]% |
| Re-entry conversion | % of new users who sign up | [X]% |
| K-factor | New users per existing user | [X] |

---

## Growth Loop 2: [Name] (Secondary)

[Same structure as Loop 1]

---

## Growth Loop 3: [Name] (Exploratory)

[Same structure — if applicable. Some products only have 1-2 viable loops.]

---

## Prioritization

| Loop | Feasibility | Compounding | Cost | Time to Signal | Priority |
|------|-------------|-------------|------|----------------|----------|
| [Loop 1] | H/M/L | H/M/L | $/Free | [X weeks] | **1** |
| [Loop 2] | H/M/L | H/M/L | $/Free | [X weeks] | **2** |
| [Loop 3] | H/M/L | H/M/L | $/Free | [X weeks] | **3** |

---

## Experiment Plan: [Top Priority Loop]

**Hypothesis:**
If we [build X], then [Y% of users] will [take action], resulting in [Z new users per month].

**Minimum viable version:**
[What to build — smallest version that tests the loop]

**Success metric:** [Specific number]
**Success threshold:** [What "working" looks like]
**Duration:** [How long to run]
**Resources needed:** [Eng time, design, etc.]

**If it works:** [Next step — scale, iterate, or combine with another loop]
**If it doesn't:** [What to try instead — pivot to Loop 2 or redesign]

---

## What NOT to Do
*Common growth traps for your stage and product type:*
- [Trap 1 — specific to their situation]
- [Trap 2 — specific to their situation]
- [Trap 3 — specific to their situation]

## Assumptions to Validate
- [Assumption about user behavior]
- [Assumption about market/competitive dynamics]
- [Assumption about metrics or capacity]
```

## Framework Reference

This skill draws from proven growth frameworks:

- **Growth Loops (Casey Winters / Reforge)** — Sustainable growth comes from loops, not funnels. Each user creates the conditions for the next user. The loop replaces the linear funnel model.
- **Retention-First (Elena Verna)** — "Acquisition is a tax on poor retention." Fix retention before scaling acquisition. The best growth hack is a product people come back to.
- **Four Fits (Brian Balfour)** — Product-market fit is necessary but not sufficient. You also need market-product fit, product-channel fit, channel-model fit, and model-market fit. Growth breaks when any fit is missing.
- **YC Growth Playbook (Gustaf Alstromer)** — Priority order: retention first, activation second, acquisition last. Don't pour water into a leaky bucket.
- **PLG vs. Sales-Led (Elena Verna / Kyle Poyar)** — Not every product can be product-led. The decision depends on ACV, buyer complexity, time to value, and whether users can self-serve.

**Key insight:** Growth isn't a feature you bolt on. It's a property of how your product creates and captures value. The best loops are invisible — users participate in them as part of normal product usage, not because you asked them to.

## Tips for Best Results

1. **Be honest about retention** — If I find your retention is weak, I'll tell you. Designing growth loops on a leaky bucket wastes engineering time. Fix Loop 0 first.
2. **One loop at a time** — Don't try to build three loops simultaneously. Pick the highest-feasibility, highest-compounding loop and validate it. Stack loops after the first one works.
3. **Measure the loop, not vanity metrics** — Signups are vanity. Loop conversion rate, K-factor, and loop time are the real signals. I'll set up the metrics that matter.
4. **Copy the model, not the tactic** — Dropbox's referral program worked because of product-channel fit, not because referral programs are magic. I'll help you find YOUR version of that fit.
5. **Experiment before building** — Don't spend a quarter building a referral system. Run a manual test first. If the loop doesn't work with duct tape, it won't work with engineering.
6. **Update your context** — Add growth loop results to `context/product.md`. Which loops are working? What K-factor are you seeing? Future growth planning gets better with history.
