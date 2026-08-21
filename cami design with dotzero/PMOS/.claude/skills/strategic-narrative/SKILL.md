---
name: strategic-narrative
description: 'Build a compelling strategic narrative that sells your roadmap, vision, or feature to any audience. Use when: strategic narrative, pitch my roadmap, tell the story, product pitch, sell the vision.'
disable-model-invocation: true
category: communication
---

# Strategic Narrative Builder

Build a compelling strategic narrative that sells your roadmap, vision, or feature to any audience — board, exec team, engineering, customers, or investors.

## Output
Write the file to exactly this path:

  work/strategy/outputs/strategic-narrative-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Pitching your roadmap or vision to leadership
- Preparing for a board meeting or exec review
- Aligning engineering on why something matters
- Writing a product pitch for customers or investors
- Framing a strategic pivot or major bet
- Getting buy-in for a controversial decision

## The Problem

PMs build great products but struggle to sell the story. They show slides full of features and timelines while executives ask "so what?" Engineering asks "why this, why now?" Customers ask "what's in it for me?" The same initiative needs a different narrative for each audience — and most PMs default to one pitch that works for none.

This skill builds audience-specific strategic narratives grounded in YOUR product context, using proven storytelling frameworks from the best strategic communicators.

## What You'll Get

A complete narrative package:
- The core strategic story (adaptable to any audience)
- Audience-specific versions tuned to what each group cares about
- The "why now" argument that creates urgency
- A narrative stress test exposing weak points before you present
- Key phrases and sound bites for hallway conversations

## What You'll Need

**Critical inputs (ask if not provided):**
- What are you pitching? (roadmap, feature, vision, pivot, investment)
- Who is your audience? (board, exec team, engineering, customers, investors)

**Helpful (improves the narrative):**
- What's the resistance? Why haven't they bought in already?
- Any data points, metrics, or customer quotes you want woven in
- Previous attempts to pitch this (what didn't land?)

## Process

### Step 1: Read Your Context
I'll check your context files to understand the full picture:
- **product.md** — Current roadmap, metrics, product state
- **company.md** — Mission, strategic priorities, market position
- **personas.md** — Who you serve, their pain points, what resonates
- **competitors.md** — Competitive landscape, threats, advantages

I'll tell you what I found. For example:
> "From your context: You're positioning around 'PM infrastructure for product teams,' competing against ChatGPT (no context) and enterprise tools (too expensive). Your key metric is implementation pipeline. Your persona (Head of Product) cares about team consistency and proving PM ROI to the CEO."

### Step 2: Identify the Narrative Type
Different situations need different narrative structures. I'll recommend the best fit:

**Vision Narrative** — "Here's where we're going and why it matters"
- Best for: Board meetings, company all-hands, investor pitches
- Framework: Strategic Narrative (Andy Raskin)

**Change Narrative** — "Here's what shifted and how we respond"
- Best for: Strategic pivots, market shifts, reprioritization
- Framework: Sparkline (Nancy Duarte)

**Decision Narrative** — "Here's what we should do and why"
- Best for: Exec reviews, go/no-go decisions, resource asks
- Framework: Pyramid Principle (Barbara Minto)

**Feature Narrative** — "Here's what we built and why users will care"
- Best for: Launch announcements, customer pitches, sales enablement
- Framework: Problem-Agitation-Solution

**Alignment Narrative** — "Here's why this matters for YOUR team"
- Best for: Engineering alignment, cross-functional buy-in, new PM onboarding
- Framework: Context-Stakes-Role

If the type isn't obvious, I'll ask:
> "Are you trying to sell a vision, justify a decision, or align a team? That changes which narrative structure works best."

### Step 3: Build the Core Story
Using the selected framework, I'll draft the narrative arc. Every framework follows a common spine:

1. **Shared reality** — Start where the audience already is. What do they know and believe?
2. **The shift** — What changed? Why can't we stay here?
3. **The possibility** — What's now possible that wasn't before?
4. **The stakes** — What happens if we act? What happens if we don't?
5. **The path** — How we get there (your product/roadmap/decision)
6. **The proof** — Evidence this will work (data, customers, precedent)

**Grounding rule:** Before writing "The Proof," I'll extract specific data points, customer quotes, or metrics from your context files. Every claim in the proof table must cite its source. If evidence doesn't exist, I'll write "⚠️ No evidence — needs [specific data type]" instead of inventing proof.

**If I can't find strong evidence for a narrative element:**
> "I don't have data to support [the shift/the proof/the stakes]. I'll draft this as a hypothesis you should validate before presenting. Weak proof is worse than no proof — your audience will spot it."

I'll ground every element in YOUR context — your market, your users, your data. Not generic examples.

### Step 4: Tune for Audience
The same story hits differently depending on who's listening. I'll adapt:

**Board / Investors:**
- Lead with market opportunity and business impact
- Frame as a bet with risk/reward calculus
- Show the competitive window (why now, not later)
- Include financial proof points

**Executive Team:**
- Lead with strategic alignment to company priorities
- Show resource trade-offs explicitly
- Frame as a decision with clear options
- Anticipate their likely objections

**Engineering:**
- Lead with the user problem (make them care about the "why")
- Show technical feasibility signals
- Frame as a challenge worth solving
- Respect their time — be direct about what you need from them

**Customers:**
- Lead with THEIR pain point (not your product)
- Show the transformation (before/after)
- Use their language, not your internal jargon
- Make them the hero of the story

**Cross-Functional / All-Hands:**
- Lead with shared mission and context
- Show how each function contributes
- Make the stakes personal — what this means for the team
- End with clear next steps for each group

### Step 5: Narrative Stress Test
Before you present, I'll challenge the narrative by testing for:

**The "So What?" Test:**
- If I removed the last slide, would anyone care?
- Is the urgency real or manufactured?

**The "Why Not?" Test:**
- What's the strongest argument against this?
- What would a smart skeptic ask first?
- Have you addressed the elephant in the room?

**The "Why You?" Test:**
- Why is your team/product the right one to solve this?
- What's your unfair advantage?
- Why should they trust this bet?

**The "Why Now?" Test:**
- What changed that makes this urgent?
- What's the cost of waiting 6 months?
- Is there a competitive window closing?

I'll flag weak spots and suggest how to shore them up — before the room finds them for you.

### Step 6: Extract Key Phrases
I'll pull out 3-5 memorable phrases you can use in:
- The hallway conversation version (30 seconds)
- The elevator pitch version (2 minutes)
- The email subject line that gets the meeting
- The Slack message that builds pre-meeting momentum

These aren't slogans. They're the phrases people will repeat when they explain your idea to someone who wasn't in the room.

## Output Template

```markdown
# Strategic Narrative: [What You're Pitching]

**Audience:** [Who this version is for]
**Narrative Type:** [Vision / Change / Decision / Feature / Alignment]
**Framework:** [Which framework, and why it fits]

## Your Context
*What I pulled from your files:*
- **Strategic position:** [From company.md]
- **Product state:** [From product.md]
- **User reality:** [From personas.md]
- **Competitive landscape:** [From competitors.md]

---

## The Narrative

### 1. Shared Reality
*Where the audience already is — what they know and believe*

[2-3 sentences that establish common ground. Reference real context.]

### 2. The Shift
*What changed — why the old approach no longer works*

[2-3 sentences on what's different now. Data or market evidence.]

### 3. The Possibility
*What's now possible — the opportunity in front of us*

[2-3 sentences painting the future state. Make it vivid and specific.]

### 4. The Stakes
*Why this matters — what we gain and what we risk*

**If we act:** [Specific positive outcome with timeline]
**If we don't:** [Specific consequence — competitive, financial, or user impact]

### 5. The Path
*How we get there — your roadmap/product/decision*

[3-5 concrete steps or initiatives, mapped to the possibility above]

### 6. The Proof
*Evidence this will work*

| Evidence Type | Detail | Source |
|--------------|--------|--------|
| Data | [Metrics, benchmarks, trends] | [company.md / product.md / ⚠️ Inferred] |
| Customer Signal | [Quotes, feedback, behavior] | [personas.md / interviews / ⚠️ Inferred] |
| Precedent | [Who else has done this successfully] | [Cited reference / ⚠️ Verify independently] |
| Early Results | [Beta data, pilot results, prototypes] | [product.md / provided / ⚠️ No data available] |

---

## Narrative Stress Test

### Weak Points Identified
| Test | Finding | How to Address |
|------|---------|----------------|
| So What? | [Is the urgency real?] | [How to strengthen] |
| Why Not? | [Strongest counterargument] | [How to preempt] |
| Why You? | [Is your advantage clear?] | [How to reinforce] |
| Why Now? | [Is the timing justified?] | [How to sharpen] |

### Anticipated Questions
1. **[Most likely question]** — [Prepared response]
2. **[Second question]** — [Prepared response]
3. **[Hardest question]** — [Prepared response]

---

## Key Phrases

**Hallway version (30 sec):**
> "[One sentence that captures the entire narrative]"

**Elevator version (2 min):**
> "[3-4 sentences: reality, shift, stakes, path]"

**Email subject line:**
> "[Subject line that gets the meeting]"

**Repeatable sound bite:**
> "[The phrase people will use when explaining your idea to others]"

---

## Audience Adaptation Notes
*If presenting to a different audience, adjust:*

| Audience | Lead With | Emphasize | De-emphasize |
|----------|-----------|-----------|--------------|
| Board | Market opportunity | Financial impact | Technical details |
| Exec team | Strategic alignment | Trade-offs | Implementation |
| Engineering | User problem | Technical challenge | Business metrics |
| Customers | Their pain | Transformation | Internal strategy |
```

## Framework Reference

This skill draws from five proven narrative frameworks:

- **Strategic Narrative (Andy Raskin)** — Five-act structure: old world, shift, new world, stakes, your role. Best for vision and fundraising pitches.
- **Sparkline (Nancy Duarte)** — Alternates between "what is" and "what could be," building tension toward a new bliss. Best for change narratives and keynotes.
- **Pyramid Principle (Barbara Minto)** — Lead with the conclusion, then support with arguments and evidence. Best for executive decision-making.
- **Problem-Agitation-Solution** — Name the problem, make the audience feel it, then present your solution. Best for customer-facing narratives.
- **Context-Stakes-Role** — Give context, raise stakes, define each group's role. Best for cross-functional alignment.

**Key insight:** The framework matters less than the audience adaptation. A brilliant vision narrative delivered to engineers who want to know "why this matters for users" will fall flat. Match the structure to who's listening.

## Tips for Best Results

1. **Start with the resistance** — Tell me what hasn't worked or where you're stuck. The narrative is stronger when it directly addresses the objection.
2. **One narrative, multiple versions** — Don't build separate pitches. Build one core story and tune it per audience. Consistency builds trust.
3. **Data beats adjectives** — "We grew 40% last quarter" lands harder than "We had incredible growth." I'll push for specifics.
4. **The audience is the hero** — Your product is the tool, not the protagonist. The best narratives make the listener see themselves winning.
5. **Test it out loud** — Read the narrative aloud before presenting. If a sentence feels awkward to say, it's wrong. Rewrite it.
6. **Update your context** — After the pitch, add the outcome to `context/product.md`. Did they buy in? What objections came up? Future narratives get better with history.
