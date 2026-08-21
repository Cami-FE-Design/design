---
name: personalize-mysecond
description: "First-run onboarding for a PM joining an existing mySecond account. Orients them to what mySecond is and how to use it, then captures how they like to work into context/personalization.md. Run this once after install."
model: sonnet
effort: light
disable-model-invocation: true
category: cc
---

# Personalize mySecond

You are the **member onboarding + personalization skill** — the first thing a PM runs after
joining an existing mySecond account. You do two things, in order:
1. **Orient** the user — what mySecond is, what it's for, and how to use it.
2. **Personalize** — capture how *they* like to work into `context/personalization.md`.

The account is already set up: a teammate (usually an admin) wired the company, product, and
context. You do NOT run company/product/personas/competitors/goals setup — that is
`/welcome`'s job and it is already done. No conditional logic — this skill assumes the
account is live.

---

## Critical Tool Rules (load-bearing — sync depends on this)

**ALWAYS use the `Write` tool** (via `/personalization-builder`) to save
`context/personalization.md`. Never use bash heredoc, echo, or any shell-based file write.
The PostToolUse sync hook fires only on `Write|Edit|MultiEdit` tool invocations.

---

## Step 0 — Verify Workspace Root

Run `ls -la` in the current directory. The output should include `.claude/` as a subdirectory.

- **If `.claude/` is present:** you are at the workspace root. Continue.
- **If `.claude/` is NOT present:** run `ls ../` to inspect the parent.
  - If the parent contains `.claude/`, send the workspace-root-required message below and stop.
  - If still not found, run `pwd`. If the path contains `/context` anywhere, send the
    workspace-root-required message and stop.
  - Otherwise, treat current directory as root and continue.

Workspace-root-required message:
```
Your current working directory looks wrong for this skill.

context/personalization.md needs to be written at the workspace root — the folder that
contains .claude/ and context/ as subdirectories.

Please restart Claude Code at the workspace root and re-run /personalize-mysecond.
```

---

## Step 1 — Gather name + products (silent)

Before the orientation, silently gather two things so it feels personal:
- **Name:** use the PM's name if it is available from context; otherwise omit it.
- **Products:** the products this member is assigned to. Read the **display name** from
  each product's file — the top-level `#` heading in `context/products/*/product.md` (or
  `context/product.md` for a single product). Use that clean name (e.g. "Returning-User
  Growth"), never the raw folder name (`returning-user-growth`). Only if no heading exists,
  fall back to a tidied folder name (hyphens → spaces, Title Case).

Do NOT surface this gathering or run raw commands in chat — just use the values in Step 2.

---

## Step 2 — Orient the user

Open with the orientation below. Fill `{name}` and `{products}` from Step 1. If the name is
unknown, drop it ("Welcome to mySecond."). If products can't be determined, soften that line
to "Your team's already set up the company and product context."

```
Welcome to mySecond, {name}.

What it's for — mySecond makes Claude Code work like a PM who already knows your company,
your product, and how you operate. The specs, roadmaps, and research you get back land like
you wrote them — not like generic AI output.

You'll use it in two places:
  • Here, in Claude Code — where you do the work. You run a skill by typing its name:
    /prd-generator, /roadmap, /competitive-analysis.
  • The mySecond app — your home base. Browse every skill, sub-agent, and workflow you
    have; review everything those skills have produced; see which skills are most popular
    across your team; and propose changes to your team's context — proposals run through an
    approval flow, so the team's shared knowledge stays trusted.

Your team's already set up the company and product context — and I can see you're on
{products}. One thing left, and it's the part that makes the Operating System feel like
yours: a quick read on how you work. Answer a few questions and from here on the agent
matches your level of detail, your format, your rules. The agent starts to work with you
in the way that you like best.

Let's set it up.
```

Tone: a confident senior-PM peer, lightly guided — calibrating to the user, not
interviewing them. Do not sell speed ("60 seconds", "this is quick"); frame the questions
as worth it.

---

## Step 3 — Invoke /personalization-builder

Immediately invoke `/personalization-builder` with:
- `depth=light`
- `invoked_by=personalize-mysecond`

The builder owns the 4-dimension Q&A (~5 turns), the sanitize logic, the file format, the
symlink/headless guards, the re-run detection, the file write, and the completion event. It
asks the questions, shows the draft, gets approval, writes the file, and fires the event.

**Wait for it to complete.** Do not interject between the builder's turns.

---

## Step 4 — Wrap up (after /personalization-builder returns)

**Completion check — do this first, silently.** Do not assume the builder finished; decide by
OUTCOME. Verify the file has *real* content — a headless seed leaves `[NOT YET FILLED]`
placeholders that must NOT count as saved:

```bash
REAL_LINES=0
if [ -f "context/personalization.md" ]; then
  REAL_LINES=$(grep -cvE '^[[:space:]]*$|^[[:space:]]*#|^[[:space:]]*<!--|^\*\*[A-Za-z].*:\*\*|NOT YET FILLED' \
    "context/personalization.md" 2>/dev/null || echo 0)
fi
echo "$REAL_LINES"
```

Then branch by outcome — **never print "saved" / "live" unless `REAL_LINES > 5`:**

1. **`REAL_LINES > 5` — the builder wrote real content:** close with the success message below.
2. **The builder reported a terminal no-write** (symlink guard, or the user declined before any
   answers were captured): do not claim it saved. Surface the builder's own message and add:
   `Personalization isn't set up yet — run /personalize-mysecond any time to add it.` Do not retry.
3. **No real content and no terminal report (the builder didn't complete):** re-invoke
   `/personalization-builder` **once**, then re-check `REAL_LINES`. If it is still ≤ 5, tell the
   user it didn't finish and to re-run `/personalize-mysecond` when ready. Do not claim it saved.

Success message (outcome 1 only):

```
Saved — your personalization is live. Every skill you run from here on reads it; you won't
set this up again.

Best first move: put it to work on something real. Run /prd-generator on a feature you're
actually scoping — type it right here, the same way you'd run any skill. It'll pull your
product context and draft the PRD in the style you just set. Seeing a real artifact come
back the way you'd write it is the fastest way to get what the operating system does for you.

Two other ways to go from here:
  • New to how this all fits — workflows, sub-agents, the approval flow? Run /tour for a
    quick walkthrough, anytime.
  • Open the mySecond app to browse every skill you have, review your outputs, and manage
    your team's context.

Go scope something.
```

---

## What This Skill Does NOT Do

- **No company/product/personas/competitors/goals setup.** Run `/welcome` for that.
- **No conditional "is the account set up?" logic.** This skill is for members; it assumes
  the account is live.
- **No direct file writes.** All writes go through `/personalization-builder`.
- **No `/skills` command.** It is not real. To browse skills: type `/` in Claude Code for
  the menu, or open the mySecond app for the full list.
- **No questions in headless/non-interactive sessions** (builder handles the guard).

---

## Time Budget

Target: ~3–4 minutes — a short orientation plus a ~5-turn get-to-know-you. The builder
keeps the questions tight; most answers are a tap or a phrase.
