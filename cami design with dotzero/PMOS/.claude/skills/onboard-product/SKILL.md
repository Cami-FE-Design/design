---
name: onboard-product
description: "Set up a single product's context in ~3 minutes — product overview, goals, and starter personas. Runs when the admin or assigned lead is bootstrapping a newly-added product. Reuses the company-level context already in place."
model: sonnet
effort: medium
disable-model-invocation: true
category: cc
---

# Onboard a Product

You are running per-product context setup for a customer who has just added
a second (or third, or fourth) product in mySecond. Your job is to walk them
through three files for THIS product — product, goals, personas — one file
at a time, with the same confident-senior-PM voice the /welcome skill uses.
You re-use the team's existing `company.md` and `competitors.md` (which
/welcome already set up); you never re-ask company-level questions.

You never batch. You never paste raw `curl` commands or HTTP responses into
the chat. You ALWAYS use the `Write` tool to save files (never bash heredoc,
echo, or printf — the sync hook only fires on Write/Edit/MultiEdit).

---

## Critical Tool Rules (load-bearing — sync depends on this)

**ALWAYS use the `Write` tool to save context files.** Never use bash
heredoc, `echo > file`, `printf >`, or any other shell-based file write.
The customer plugin's PostToolUse sync hook only fires on `Write|Edit|
MultiEdit` tool invocations — bash file-writes do NOT trigger sync, so the
file never reaches mySecond. This silently breaks the bootstrap completion
gate, which checks for product.md / goals.md to actually arrive at the
server before allowing the "complete" flip.

Specifically:
- ✅ Right: use the Write tool with `file_path` = `context/products/<slug>/product.md`
- ❌ Wrong: `Bash` with `cat > "context/products/<slug>/product.md" << 'EOF' ... EOF`

---

## Required Argument

The skill takes ONE positional argument: the product `<slug>` (e.g.
`/onboard-product beta`). The web "Add Product" flow shows the user this
exact command in the Setup-pending card. Without a slug, refuse:

```
Usage: /onboard-product <slug>

Check your last `mysecond sync` output for a bootstrap nudge — it carries the
slug. You can also see your products in mySecond:
https://app.mysecond.ai/settings/products
```

Do NOT prompt the user to "pick a product" from a list. The product they
need is always the one the web told them to onboard; asking again is noise.

---

## Pre-Flight: Load Companion Credentials

Before any `curl` to the companion API, get `COMPANION_API_KEY` and
`COMPANION_API_URL` into shell env. The CLI writes credentials in two
places (per-project credentials file is the modern path; project-root
`.env` is the legacy fallback). Mirror `/set-product`'s resolver. Run
silently via Bash (do not paste the command or output into the chat):

```bash
# Resolve the per-project credentials file written by `mysecond init`.
# Multiple matches -> newest mtime wins. Dirs are named by an opaque
# <projectHash> so there's no reliable way to match the current project
# by name from bash (see the mysecond print-env follow-up).
CRED=$(ls -t ~/.mysecond/projects/*/credentials 2>/dev/null | head -1)
# Use ';' not '&&' so 'set +a' always runs even if 'source' exits non-zero —
# otherwise auto-export leaks into the rest of the session.
[ -n "$CRED" ] && { set -a; source "$CRED"; set +a; }
# Legacy fallback: .env in the project root.
[ -z "$COMPANION_API_KEY" ] && [ -f .env ] && { set -a; source .env; set +a; }
# Machine-wide fallback: `~/.mysecond/credentials`, written by the `/mysecond`
# login skill (new install flow — no `mysecond init` step exists there).
# Same bare-token-or-VAR=value handling as the per-project file.
if [ -z "$COMPANION_API_KEY" ] && [ -f ~/.mysecond/credentials ]; then
  if grep -qE '^[A-Z_][A-Z0-9_]*=' ~/.mysecond/credentials 2>/dev/null; then
    set -a; source ~/.mysecond/credentials; set +a
  else
    COMPANION_API_KEY=$(head -1 ~/.mysecond/credentials | tr -d '[:space:]')
    export COMPANION_API_KEY
  fi
fi
```

If `COMPANION_API_KEY` is still empty after this, the companion CLI isn't
initialized for this project. Tell the user plainly **and give them the
recovery step** — stop after this, don't guess a key, don't suggest
`mysecond sync` (sync doesn't fix auth):

> This workspace isn't connected to mySecond yet. Run `/mysecond` to
> connect (or `mysecond init` in this folder if you use the CLI setup),
> then try `/onboard-product <slug>` again.

---

## Step 1 — Resolve the Slug + Confirm Actor

Silently call the lookup endpoint. Capture BOTH the body and the HTTP
status so we can detect auth/server failures BEFORE trying to JSON-parse
the body:

```bash
RESP=$(curl -s -w '\n%{http_code}' \
  "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/products/lookup?slug=<SLUG>" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}")
STATUS=$(printf '%s' "$RESP" | tail -n1)
BODY=$(printf '%s' "$RESP" | sed '$d')
```

Dispatch on `STATUS` **before** parsing `BODY` — JSON-parsing a 401/5xx
body produces gibberish. Six outcomes:

1. **HTTP 401** → tell the user: "Your mySecond credentials look invalid
   or expired. Run `/mysecond` to reconnect (or `mysecond init` in this
   project folder if you use the CLI setup), then re-run
   `/onboard-product <slug>`." — then stop.
2. **HTTP 404** → tell the user: "I can't find a product called `<slug>`
   in your team. Check the slug in mySecond:
   https://app.mysecond.ai/settings/products" — then stop.
3. **HTTP 5xx / empty body / non-JSON body** → tell the user: "The
   mySecond API didn't respond cleanly (status: $STATUS). Try again in a
   moment; if it persists, run `mysecond doctor`." — then stop.
4. **HTTP 200 + `can_bootstrap: false` with `actor_kind: 'neither'` (or
   HTTP 403)** → tell the user: "{slug} isn't assigned to you yet. Ask
   your admin to add you as {slug}'s lead in Settings → Team, then try
   again." — then stop.
5. **HTTP 200 + `bootstrap_status: 'complete'`** → tell the user: "{slug}
   is already set up. If you want to re-onboard it, ask your admin to
   reset it from Settings → Products first." — then stop.
6. **HTTP 200 + OK to proceed** → continue to Step 2. Stash `product_id`
   (UUID) and `bootstrap_status_changed_at` for the CAS guards on later
   POSTs.

---

## Step 2 — Re-Entrancy Check (read existing files first)

For each file in this order, check if it exists on disk AND has real content:

- `context/products/<slug>/product.md`
- `context/products/<slug>/goals.md`
- `context/products/<slug>/personas.md`

For each one that exists with non-trivial content (more than ~200 bytes and
no `[NOT YET FILLED]` placeholder), SKIP its question pass — you'll show it
later in the saved-summary list but won't re-ask. This is what makes the
skill re-entrant: a user who quit halfway through last session picks up at
the next unfinished file.

If ALL three files already have real content, jump straight to Step 7
(complete-flip). You don't need to re-do work the user already did.

---

## Step 3 — Post in_progress

If at least one file needs questions answered, POST status `in_progress`:

```bash
curl -s -X POST \
  "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/products/<PRODUCT_ID>/bootstrap-status" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"status":"in_progress","expected_changed_at":"<bootstrap_status_changed_at>"}'
```

Pass the `expected_changed_at` from Step 1's lookup so concurrent sessions
get 409'd instead of clobbering each other. On a 409:

- `error: "stale_state"` → tell the user: "Looks like {slug}'s setup state
  moved while we were starting — maybe another session is also running this,
  or an admin just reassigned. Try `mysecond sync` and re-run." — stop.
- `error: "wrong_actor"` → mirror the message from Step 1 outcome 2.
- `error: "illegal_transition"` → the row is already `complete`; mirror
  outcome 3.

On success, continue to Step 4.

---

## Step 4 — File 1: Product Overview 📦

**Eyebrow:** `(1 of 3 — <ProductName> product)` 📦

If `context/products/<slug>/product.md` already had real content (Step 2),
skip the question pass and just acknowledge: `product.md already saved.`
Then jump to Step 5.

Otherwise, open with:

```
Tell me about <ProductName> in one sentence — what is it, and who's it for?
```

One question, one answer. Then ask:

```
What's the core promise — the one thing this product does that nothing else
does as well? (One sentence is fine.)
```

Once you have both answers, draft `product.md` inline (NOT inside a fenced
code block — inline prose with bold section headers like /welcome does).
Use this template:

```markdown
# <ProductName> — Product Context

**Last updated:** <today's date>

**Source:** /onboard-product

---

## What <ProductName> Is

<answer 1 — what + who>

## Core Promise

<answer 2 — the one differentiator>

## Primary User

<inferred from answer 1, or restated if explicit>

## Core Features

> ⚠️ **NOT YET FILLED** — Add the top 3-5 features in mySecond when ready,
> or run `/prd-generator` and it'll surface what to fill.

## Key Metrics

> ⚠️ **NOT YET FILLED** — What 2-3 metrics show <ProductName> is working?
> Run `/set-goals` or edit directly.
```

Show the inline render. Ask: *Looks good? Say `yes` to save, or tell me
what to change.* On approval, **use the Write tool** to save to
`context/products/<slug>/product.md`. Then:

```
✓ Saved to context/products/<slug>/product.md
Solid scaffold. /prd-generator now knows what <ProductName> is for. **1 of 3 done.**
```

---

## Step 5 — File 2: Goals 🏁

**Eyebrow:** `(2 of 3 — <ProductName> goals)` 🏁

If `context/products/<slug>/goals.md` already had real content, skip and
acknowledge: `goals.md already saved.` Jump to Step 6.

Otherwise, open with: `Three quick questions:`

Ask, **one at a time** (not all three together — wait for each answer):

1. *What's your #1 <ProductName> priority this quarter?*
2. *What number changes if it works?*
3. *What's the ONE thing the team is intentionally NOT prioritizing for
   <ProductName> right now?*

Draft `goals.md` inline:

```markdown
# <ProductName> — Goals

**Last updated:** <today's date>

**Source:** /onboard-product

---

## This Quarter

### Priority
<answer 1>

### Success Metric
<answer 2>

### Anti-Goal (What We're Intentionally NOT Doing)
<answer 3>

---

## Strategic Narrative

> ⚠️ **NOT YET FILLED** — Run `/set-goals` for the full strategic narrative,
> or edit directly.
```

Show inline. Ask: *Looks good? Say `yes` to save, or tell me what to change.*
On approval, Write to `context/products/<slug>/goals.md`. Then:

```
✓ Saved to context/products/<slug>/goals.md
Goals locked in. **2 down. One to go.**
```

---

## Step 6 — File 3: Personas 🎯 (always a v1 stub)

**Eyebrow:** `(3 of 3 — <ProductName> personas)` 🎯

Open with a humble framing — do NOT ask persona questions inline. Personas
are a research artifact and need real interviews to be sharp; a 90-second
Q&A pass would produce something worse than nothing.

```
Personas are a research artifact — they want real interviews to be sharp.
I'm going to save a starter stub now and you can deepen it with
/persona-generator any time, especially after you've talked to a few users.
```

Write the stub directly (no questions):

```markdown
# <ProductName> — Personas

**Last updated:** <today's date>

**Source:** /onboard-product (starter stub)

---

## How to Use This File

This is a stub. Real personas come from interview synthesis — run
`/persona-generator` when you have 3-5 customer conversations to draw from.
Until then, every <ProductName> skill will read this and know to write
generically for the primary user (see `product.md`).

## Primary User (from product.md)

<one-line reference to the primary user named in product.md>

## Open Questions for Real Persona Work

- What's a typical day for the primary user? What problem are they trying
  to solve when they reach for <ProductName>?
- What does success look like for them — a job done, a fear avoided, a
  status earned?
- Who else has tried to solve this for them, and why didn't it stick?
```

Write to `context/products/<slug>/personas.md`. Then:

```
✓ Saved to context/products/<slug>/personas.md (starter stub)
Starter stub saved. Deepen later with /persona-generator — no rush. **3 of 3.**
```

---

## Step 7 — Sync + Mark Complete

Push the files to the server so the bootstrap-status completion gate can
see them:

```bash
mysecond sync
```

Wait for it to finish (it returns when sync settles). Then POST status
`complete` — the server checks that product.md + goals.md actually arrived
and have enough content before accepting the flip:

```bash
curl -s -X POST \
  "${COMPANION_API_URL:-https://app.mysecond.ai}/api/companion/products/<PRODUCT_ID>/bootstrap-status" \
  -H "Authorization: Bearer ${COMPANION_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"status":"complete"}'
```

Possible 409 responses:
- `error: "files_not_pushed"` → the sync didn't fully complete. Tell the
  user: "Looks like the file push didn't settle — give me a moment to retry
  `mysecond sync`." Re-run sync once, retry the POST. If it fails again,
  surface the error in plain English.
- `error: "completeness_gate"` → product.md or goals.md content too short
  or contains a `TODO` marker. Tell the user which file + which issue,
  invite them to flesh it out: "Beta's product.md is too short to set as
  complete — want to add a paragraph?"
- `error: "illegal_transition"` → the row moved while we worked. Sync,
  surface the message.

On success, continue to Step 8.

---

## Step 8 — Celebrate

Use this verbatim, substituting `<ProductName>`:

```
🎉 Your <ProductName> context is live.

Three files synced — product, goals, personas — and the bootstrap is marked
complete. PRDs and specs you produce for <ProductName> from here will route
to its context.

**What's next?** Try `/prd-generator` on a real <ProductName> feature you're
scoping. Watch the new context show up in the output.

*Personas were saved as a starter stub. Run `/persona-generator` after
you've talked to 3-5 users to deepen them.*
```

Stop there. No scorecard, no recap, no next-steps menu.

---

## What This Skill Does NOT Do

- **No company.md / competitors.md changes.** Those are shared across all
  products and are set by `/welcome`. `/onboard-product` reuses them.
- **No persona Q&A.** Personas are a research artifact; we save a stub
  pointing to `/persona-generator`.
- **No scoring math.** The bootstrap-status route checks file lengths +
  TODO markers on the server. The skill does not invent labels.
- **No batching.** One file at a time, save before moving to the next.
- **No fenced code blocks** when displaying file content for review.
  Inline prose with bold section headers only.
- **No raw curl or HTTP responses in chat.** All API calls silent.
- **No "pick a product from this list" prompt.** The slug arg is required.

---

## Time Budget

Target: ~3 minutes (2 question passes of 2-3 questions each + a stub file
+ one sync + one status flip).
