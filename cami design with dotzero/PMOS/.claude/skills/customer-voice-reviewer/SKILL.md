---
name: customer-voice-reviewer
description: 'Review PRDs and specs from a customer perspective using your personas. Use when: customer review, user perspective, voice of customer, adoption check, customer success view, user advocate.'
disable-model-invocation: true
category: discovery
---

# Customer Voice Reviewer

Review PRDs and specs from a customer perspective using your personas.

## Output
Write the file to exactly this path:

  work/discovery/outputs/customer-voice-<YYYY-MM-DD>.md

`<YYYY-MM-DD>` is today’s UTC date as 10 characters, hyphenated (e.g. `2026-05-03`).

If a file already exists at that exact path, overwrite it. For an explicit second draft only, append `-v2`, `-v3`, etc. before `.md`.
## When to Use This Skill
- Reviewing a PRD before stakeholder sign-off
- Checking if a feature aligns with user needs
- Assessing adoption likelihood
- Preparing for Customer Success concerns
- Evaluating support burden and onboarding complexity

## What You'll Need

**Critical inputs (ask if not provided):**
- The document to review (PRD, spec, proposal)

**Nice-to-have inputs:**
- Which personas are most affected by this feature
- Specific user concerns you're worried about

## Process

### Step 1: Check Your Context

First, read the user's context files to ground the review in their actual users:
- `context/personas.md` — **CRITICAL** — Who are the users? What are their needs, pains, and behaviors?
- `context/product.md` — Current user experience, onboarding flow, support pain points
- `context/company.md` — Customer Success team size, support capacity

**Tell the user what you found:**
> "I found 3 personas in personas.md: [Persona 1], [Persona 2], and [Persona 3]. I'll review this feature from each of their perspectives. [Persona 2] seems most affected because [reason from their pain points]."

**If personas.md is missing or thin:**
> "I don't have persona context. I can do a generic user review, but it will be stronger if you add persona details to context/personas.md. Want me to help you create personas first?"

### Step 2: Review the Document

Read the full document from a **customer lens**, not a product/business lens.

**Look for:**
- **User value clarity** — Will users understand what this does for them?
- **Adoption friction** — What makes this hard to adopt?
- **Learning curve** — How long to understand this?
- **Onboarding complexity** — Does this change how new users start?
- **Support burden** — What new questions will Customer Success get?
- **Churn risk vs. retention benefit** — Does this help or hurt retention?

### Step 3: Evaluate Per Persona

For each persona in `personas.md`, assess:

**Persona Perspective:**
- **Will they want this?** (excited / lukewarm / resistant)
- **Will they use it?** (adoption likelihood)
- **Will they understand it?** (clarity and discoverability)
- **Will they struggle?** (friction points)

**Use the persona's:**
- **Jobs to be done** — Does this help them accomplish their goals?
- **Pain points** — Does this address their real pains?
- **Behaviors** — Does this fit how they actually work?
- **Technical comfort** — Is this too complex for their skill level?

### Step 4: Customer Success Assessment

From a CS perspective, evaluate:
- **Support tickets expected** — What new questions will CS field?
- **Documentation needs** — What docs must be created/updated?
- **Training requirements** — Do users need training? Does CS need training?
- **Churn risk** — Could this cause users to leave?
- **Expansion opportunity** — Could this drive upsells or higher tier adoption?

### Step 5: Adoption Barrier Analysis

Identify what prevents users from adopting this:
- **Awareness** — Will users discover this exists?
- **Understanding** — Will they know what it does?
- **Motivation** — Will they care enough to try it?
- **Ability** — Can they figure out how to use it?
- **Triggers** — What prompts them to use it?

(Uses Fogg Behavior Model: B = M × A × T)

### Step 6: Generate Output

Create comprehensive customer review with:
1. Context from personas
2. Per-persona assessment
3. Support burden analysis
4. Adoption barriers
5. Customer Success perspective
6. Recommendations

## Output Template

```markdown
# Customer Voice Review: [Document Name]

**Review Date:** [Date]
**Document Type:** PRD / Spec / Proposal
**Personas Reviewed:** [List]

---

## Context from Your Personas

*What I found in personas.md:*

**Personas who will be affected:**
1. **[Persona 1 Name]** — [Role/context]
   - **Primary pain:** [Their main problem]
   - **How this relates:** [How this feature connects to their needs]

2. **[Persona 2 Name]** — [Role/context]
   - **Primary pain:** [Their main problem]
   - **How this relates:** [How this feature connects to their needs]

**Most affected persona:** [Persona name] — [Why they're most impacted]

---

## Overall Customer Perspective

**Overall Sentiment:** 🟢 Excited / 🟡 Lukewarm / 🔴 Resistant

**Why:**
[1-2 sentence summary of how users will react based on their needs and behaviors]

**Adoption Likelihood:** High / Medium / Low

**Why:**
[1-2 sentence assessment based on personas' motivation, ability, and triggers]

---

## Persona 1: [Persona Name]

**Who they are:**
[Brief recap from personas.md — role, context, goals]

**Overall:** 🟢 Excited / 🟡 Lukewarm / 🔴 Resistant

### What They'll Love
- [Benefit 1 — tied to their job-to-be-done]
- [Benefit 2 — addresses their pain]

### What They'll Struggle With
- [Friction point 1]
  - **Why this is hard for them:** [Based on their skills/behavior]
  - **Mitigation:** [Suggestion to reduce friction]

- [Friction point 2]
  - **Why this is hard for them:** [Based on their constraints]
  - **Mitigation:** [Suggestion]

### Adoption Assessment

**Will they discover it?** Yes / Maybe / No
- [How/why based on their behavior]

**Will they understand it?** Yes / Maybe / No
- [Assessment based on their technical comfort]

**Will they use it?** Yes / Maybe / No
- [Assessment based on their motivation and habits]

**Biggest barrier to adoption:**
[The #1 thing that will prevent them from using this]

### Questions They'll Ask
- "[Question 1]"
- "[Question 2]"

---

## Persona 2: [Persona Name]

[Same structure as Persona 1]

---

## Persona 3: [Persona Name]

[Same structure — if applicable]

---

## Support Burden Assessment

### New Support Tickets Expected

**Volume estimate:** [Low (<10/month) / Medium (10-50/month) / High (50+/month)]

**Why:**
[Reasoning based on complexity and affected user base]

**Top questions CS will receive:**
1. "[Question 1]"
2. "[Question 2]"
3. "[Question 3]"

**Complexity of answers:** Easy / Medium / Hard
- [Assessment of whether CS can answer or needs escalation]

### Documentation Needs

**Must create/update:**
- [ ] Help center article: [Topic]
- [ ] In-app tooltips: [Where]
- [ ] Video tutorial: [What to show]
- [ ] FAQ section: [Questions to answer]
- [ ] Release announcement: [What to communicate]

**Estimated effort:** [Hours/days for documentation team]

### Training Requirements

**Internal training needed:**
- [ ] Customer Success team — [What they need to learn]
- [ ] Sales team — [How to demo/position this]
- [ ] Support team — [How to troubleshoot]

**User training needed:**
- [ ] Onboarding update — [How to introduce this to new users]
- [ ] Webinar/workshop — [If complex feature]
- [ ] Email campaign — [To announce and educate existing users]

---

## Customer Success Perspective

### Impact on Customer Satisfaction

**Will this:**
- ✅ Increase satisfaction — [Why/for whom]
- ⚠️ Neutral impact — [Why]
- ❌ Risk dissatisfaction — [Why/for whom]

**Because:**
[Reasoning based on user needs and current satisfaction drivers]

### Impact on Churn

**Churn risk:** Decreases / No change / Increases

**Why:**
[Assessment based on whether this addresses retention drivers or creates new friction]

**User segments at risk:**
- [Segment 1]: [Why this might cause them to churn]
- [Segment 2]: [Why this might frustrate them]

**Mitigation:**
[How to reduce churn risk]

### Expansion Opportunity

**Could this drive:**
- ✅ Upsells to higher tier — [If feature is gated]
- ✅ Increased usage/engagement — [If drives adoption]
- ❌ No expansion impact — [Why]

**Because:**
[Reasoning based on value and pricing]

---

## Adoption Barriers (Fogg Behavior Model)

### Motivation (Do they want this?)
**Level:** High / Medium / Low

**Why:**
- [Does this solve a real pain?]
- [How urgent is the need?]
- [What's the perceived benefit?]

### Ability (Can they use this?)
**Level:** High / Medium / Low

**Why:**
- [Complexity of the feature]
- [Technical skill required]
- [Time investment needed]

### Triggers (What prompts usage?)
**Triggers in the product:**
- [Trigger 1]: [Where/when user sees this]
- [Trigger 2]: [Prompt or notification]

**Missing triggers:**
- [What's needed to remind users to use this]

**Adoption Equation:**
If Motivation = [High/Med/Low] AND Ability = [High/Med/Low] AND Triggers = [Present/Weak/Missing]
THEN Adoption = [High/Medium/Low]

---

## Onboarding Impact

**Does this change the new user experience?** Yes / No

**If yes:**
- **Where in onboarding:** [Step/stage]
- **How it changes things:** [Description]
- **Impact on time-to-value:** Faster / Slower / No change

**New onboarding steps required:**
- [ ] [Step 1]
- [ ] [Step 2]

**Onboarding friction added:** Low / Medium / High
- [Why this makes onboarding harder or easier]

---

## User Sentiment Prediction

**When users first see this:**
- [Persona 1]: "[Likely reaction quote]"
- [Persona 2]: "[Likely reaction quote]"

**After using it for a week:**
- [Persona 1]: "[Likely sentiment]"
- [Persona 2]: "[Likely sentiment]"

**After using it for a month:**
- [Persona 1]: "[Likely long-term sentiment]"
- [Persona 2]: "[Likely long-term sentiment]"

---

## Recommendations

### To Improve Adoption

**Before launch:**
1. [Action 1 to reduce adoption barriers]
2. [Action 2 to increase discoverability]
3. [Action 3 to simplify onboarding]

**At launch:**
1. [Communication strategy]
2. [In-product prompts]
3. [Support enablement]

**After launch:**
1. [Metric to watch]
2. [User feedback to collect]
3. [Iteration plan]

### To Reduce Support Burden

1. [Action 1 — documentation]
2. [Action 2 — in-app help]
3. [Action 3 — CS training]

### To Minimize Churn Risk

1. [Action 1 — for at-risk segment]
2. [Action 2 — monitoring]
3. [Action 3 — mitigation plan]

---

## Red Flags

**Concerns to address before launch:**
- ⚠️ [Concern 1] — [Why this matters for users]
- ⚠️ [Concern 2] — [Potential negative impact]

**Questions not answered in the document:**
- [Question 1 that users will ask]
- [Question 2 that CS will need answered]

---

## What Users Will Say

**Positive feedback we'll hear:**
> "[Quote from happy user]"

**Negative feedback we'll hear:**
> "[Quote from frustrated user]"

**Feature requests this will generate:**
- [Request 1 — predictable follow-up]
- [Request 2 — logical extension]

---

## Final Assessment

**Is this user-centric?** Yes / Mostly / No
- [Why/why not based on user needs vs. business goals]

**Will users adopt this?** Yes / Maybe / No
- [Bottom line on adoption likelihood]

**Biggest user risk:**
[The #1 thing that could make users reject this]

**Biggest user opportunity:**
[The #1 benefit users will get from this]

```

---

## Framework Reference

**Customer-centric product review**:
- Use real personas, not generic "users"
- Evaluate from their perspective, not product/business lens
- Assess adoption barriers (Motivation × Ability × Triggers)
- Predict support burden before launch
- Consider customer success impact, not just product metrics

This skill uses **Fogg Behavior Model** (B=MAT) and **Jobs-to-be-Done** thinking to ground feedback in actual user needs and behaviors.

---

## Tips for Best Results

1. **Keep personas.md rich and updated** — The more I know about your users, the more grounded this review will be
2. **Be honest about user behavior** — Don't assume adoption, validate it
3. **Think like CS, not PM** — What questions will they get? What makes their job harder?
4. **Consider onboarding impact** — Every new feature changes the new user experience
5. **Predict support burden** — Better to overstaff CS than be surprised
6. **Use this before launch** — Cheaper to simplify now than fix post-launch
7. **Pair with user research** — This review identifies risks; actual user testing validates them

---

## Calibration

**If you want focus on specific persona:**
> "Review this from [Persona name]'s perspective only."

**If you want CS-heavy review:**
> "Focus on support burden and documentation needs."

**If you want adoption-heavy review:**
> "Focus on adoption barriers and how to drive usage."

**If you have specific concerns:**
> "I'm worried users won't understand [X]. Focus on that."

---

## When NOT to Use This Skill

❌ **Don't use when:**
- You don't have personas yet (create them first)
- Feature is internal-facing only (not customer-facing)
- Low-stakes feature with minimal impact
- You're in early brainstorming (too early for detailed review)

✅ **Use when:**
- Customer-facing feature (directly impacts users)
- High adoption required for success
- Worried about support burden
- Want to prepare CS team for launch
- Need to justify ROI with user value

---

## After This Review

**Next steps:**
1. Address red flags and top concerns
2. Create required documentation
3. Plan CS enablement and training
4. Set up adoption metrics to track
5. Prepare communication plan for launch
6. (Optional) Run actual user testing to validate predictions
