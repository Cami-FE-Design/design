---
name: support-doc
description: "Format a short, scannable support doc for a Personal PM OS feature from Ron's brief. Default mode is brief-mode: Ron describes the feature and what to include, this skill formats it. Spec-mode is fallback when no brief exists. Enforces a use-case-shaped template, ≤350 words, customer language, descriptive hyperlinks, and outputs the matching lib/docs-nav.ts insertion snippet."
---

# /support-doc

Format a single support doc for one feature. Short by default. Scannable. Customer language. Descriptive hyperlinks. No marketing fluff. **One doc per invocation.**

If the user asks for "all the launch docs," refuse politely and ask them to invoke the skill once per feature.

---

## Two modes

### Mode B — Brief-mode (PRIMARY, default)

Ron pastes a short brief describing the feature, what's involved, and what to include. The skill formats only — does not invent content, does not pull from spec.

Why primary: specs are 1,000+ lines of engineering. Customer-perceived flow lives in Ron's head. Brief-mode produces accurate, concise docs faster than spec-mode and avoids stale-spec drift.

Brief-mode inputs:
- The brief itself (paragraph or bullets, however Ron writes it)
- Required: feature name, target IA section, filename
- Optional: related links to weave in

Brief-mode process:
1. Read the brief carefully. If anything is ambiguous, ask before drafting.
2. Read three nearest existing docs in the target IA section to match voice.
3. Format the brief into the template below. Don't add information Ron didn't include. Don't invent steps.
4. Self-review against hard limits.
5. Output file + `DOCS_NAV` snippet + verify checklist.

### Mode A — Spec-mode (FALLBACK)

Use only when Ron explicitly asks for it ("draft from the spec") or when no brief is provided and the feature has a clear, current canonical spec.

Spec-mode reads the canonical spec/EDD plus the support runbook, drafts a doc, and Ron edits. Higher risk of stale info. Always treat Mode A output as a first draft, not a final.

---

## When to use this skill

- A new Personal PM OS feature is shipping and needs a help-center page
- An existing doc is wrong, stale, or written in $499-era framing

## When NOT to use this skill

- Marketing landing pages
- API reference (auto-generated, not narrative)
- Internal team docs (those are specs/EDDs)
- Anything mentioning the old $499 / Complete PM OS / Context Kit / wizard-as-checkout product

---

## Inputs

Required:
- **Feature name** — what the user calls it
- **One high-level sentence** — what this is and why you'd use it, in user words
- **Target IA section** — `getting-started`, `context`, `running-pm-os`, `files`, `account`, `troubleshooting`, `reference`, `team` (future)
- **Filename** — kebab-case `.md`

Optional but high-value:
- Spec or EDD path (for behavior accuracy)
- Related links to include — internal docs, Companion screens, related skills, official Claude Code docs

If a required input is missing, ask. Never guess.

---

## The template (enforced exactly — feature pages)

```markdown
# <Feature> — <one-line outcome for the user>

<One sentence: what this is and why you'd use it.>

## When to use this

- <bullet 1>
- <bullet 2>
- <bullet 3>

## Setup

1. <step — ≤2 lines>
2. <step>
3. <step>
   <up to 7 numbered steps total>

## How it works

<≤120 words of plain prose. What the user gets and what they can do next. No diagrams, no architecture detail.>

## Related

- [<descriptive anchor text>](<URL>)
- [<descriptive anchor text>](<URL>)
- [<descriptive anchor text>](<URL>)
```

**No "Common questions" section in feature pages.** Q&A patterns live in dedicated `troubleshooting/` docs.

**No "Troubleshooting" section in feature pages.** Failure modes live in dedicated `troubleshooting/` docs. Feature pages link to them under Related when relevant.

---

## Hard limits (the skill self-checks against these before output)

**Length**
- Feature pages: ≤350 words total
- Setup-only pages: ≤200 words
- Each numbered Setup step: ≤2 lines
- "How it works": ≤120 words
- Intro sentence: one sentence, ≤30 words
- **Concept-page exception:** for section-anchor or concept pages where the reader needs to learn what the thing IS before learning to use it (e.g. `running-pm-os/skills.md`, `running-pm-os/subagents.md`, `running-pm-os/workflows.md`), the intro may run 2–3 sentences (≤80 words total) and absorb the foundational definition. The default is still one sentence — only deviate when the reader can't act without first understanding the concept. When you do deviate, keep the language plain enough for someone new to the concept; pull from official Anthropic docs for accuracy but rewrite for accessibility.

**Language**
- No marketing words: `powerful`, `seamless`, `robust`, `effortless`, `unleash`, `supercharge`, `revolutionize`, `streamline`. Flag and rewrite.
- Customer terminology only. Say "sync" not "regen pipeline". Say "context files" not "context layer". Say "Claude Code" not "the agent".
- **Customer-facing product name is "mySecond"** — never "Companion" in customer-facing docs. "Companion" is internal-only. The web app at app.mysecond.ai is "mySecond".
- Active voice. Second person ("you").
- One sentence per concept in setup steps. Don't pile.
- Time estimates should under-promise. "Less than 10 minutes" beats "about 5 minutes" if either is plausible.
- Concrete examples in setup steps when useful, in parens (e.g. *"Create a new empty folder (e.g., Company Name PM OS)"*).
- End the Setup section with a "what to do first" step when natural — gives the user a starting point, not a dead-end.

**Forbidden references**
- `$499`, `Complete PM OS`, `Context Kit`, `wizard` (as checkout flow), "purchase email"
- Any reference to the old self-serve product
- The product name is **"Personal PM OS"**. Team tier (when launched) is **"Team PM OS"**.

**Sensitive content rule (CRITICAL)**
- **Never embed install commands, API keys, signed URLs, or other strings that contain user-specific or sensitive content** as live code blocks. The customer sees the real command in Companion — the doc must not.
- If you need to mention the shape of a command, describe it in prose: *"the command starts with `npm install -g`"* — not a copy-pasteable block.
- Inline `code` for short generic tokens (skill names like `/pm-os:welcome`, file paths like `context/company.md`, version numbers) is fine.
- Fenced code blocks only for things every user runs identically (rare in support docs — usually you don't need any).

**Formatting (the skill self-checks)**
- One H1, H2 for the four template sections (`When to use this`, `Setup`, `How it works`, `Related`). H3 only for genuine sub-points; usually unnecessary.
- Inline hyperlinks for every product reference. No bare URLs. No "click here". Anchor text is descriptive — `Claude Code Desktop` not `here`.
- Numbered lists for sequential steps. Bulleted lists for non-sequential. Never mix in one list.
- Inline `code` for skill names, file paths, version numbers.
- Tables only when comparing 3+ items across 2+ attributes.
- **Merge related tables.** If two tables describe the same set of items (e.g. one shows "purpose + contents", another shows "size + what to include" for the same five files), combine into one table with all unique attributes as columns. Two tables of the same items reads as repetition.
- Paragraphs are single lines (renderer handles wrap).
- No emoji unless explicitly asked. No callout boxes (`💎 Tip:`) — they were $499-era.

**Truth**
- Every behavior claim traces to the spec/EDD or live code. If unverifiable, mark `Assumption:` in your draft notes (not in the published doc) and ask Ron before publishing.
- Don't invent steps the user takes. If unsure about a step, read the relevant component or ask Ron.

---

## Process the skill follows

1. **Validate inputs.** If any required input missing, ask. Don't draft.
2. **Determine mode.** Default is Mode B (brief-mode). Use Mode A (spec-mode) only when Ron explicitly asks or no brief is provided.
3. **Read context:**
   - Mode B: just the brief Ron pasted
   - Mode A: the canonical spec/EDD + support runbook
   - Both modes: three nearest existing docs in the target IA section to match voice + `personas/vp-cs.md` for review lens
4. **Draft** using the template. Single-line paragraphs. Real hyperlinks. In Mode B, do not add information Ron didn't include.
5. **Self-review** against the hard-limits checklist. Revise. Loop until clean.
6. **Output three things:**
   a. The markdown file written to `content/docs/<section>/<filename>` via the `Write` tool
   b. The `lib/docs-nav.ts` insertion snippet
   c. A verify-before-merge checklist

---

## DOCS_NAV insertion snippet format

After writing the file, the skill prints:

```ts
// Add to DOCS_NAV section "<Section Title>" → items array, at position <N>:
{ title: '<Human-readable title>', slug: '<section>/<filename-without-md>' },
```

The skill never edits `lib/docs-nav.ts` itself — that's a paired operation Ron approves.

---

## Verify-before-merge checklist (skill prints after every draft)

```
[ ] `npm run dev` → page renders, sidebar entry appears, no 404
[ ] Every internal link resolves
[ ] External links return 200
[ ] Mobile spot-check at 375px
[ ] Forbidden tokens grep: rg -i '499|complete pm os|context kit'
[ ] Word count under limit
[ ] No live install commands with user-specific content
[ ] Read aloud — fresh reader reaches the outcome without asking a question
```

---

## What NOT to do

- Don't bulk-generate. One doc per invocation.
- Don't write a "comprehensive" doc — short and opinionated beats thorough.
- Don't add a "What is mySecond?" preamble. The reader already bought it.
- Don't include screenshots in v1. Text-only until the demo environment is stable.
- Don't use first person ("we", "I"). Address the user directly.
- Don't add Common Questions or Troubleshooting sections to feature pages — those live in dedicated `troubleshooting/` docs.
- Don't paste install commands or any string with user-specific content. Describe the shape in prose if needed.
- Don't pile multiple actions into one numbered step. One action per step.

---

## Skill validation gate (Solo launch only)

Before bulk-generating the launch docs:
1. Run this skill on `getting-started/connect-claude-code.md` only
2. Ron reviews
3. Iterate this skill file until output passes
4. Then generate the rest
