---
name: spec-to-plan
description: 'Convert specs and PRDs into agent-executable implementation plans with wave ordering and verification criteria. Use when: implementation plan, spec to tasks, PRD to plan, build plan.'
disable-model-invocation: true
---

# Spec to Plan

Convert a technical spec or PRD into structured implementation plans that AI agents can execute without manual translation.

## Output

Save to `work/specs/outputs/YYYY-MM-DD-HHmm/plan-[feature]-[N]of[M].md` (use the current UTC timestamp; create a fresh run folder per invocation).

**Every artifact MUST start with this literal YAML frontmatter block. Copy verbatim — do not paraphrase. Replace bracketed placeholders only; do NOT add prose before the opening `---`.**

```yaml
---
id: [generate via the `ulid` npm package — NOT crypto.randomUUID()]
type: spec
title: "[human-readable artifact title]"
created_at: [ISO-8601 UTC, e.g. 2026-04-27T20:30:00Z, from `new Date().toISOString()`]
skill: spec-to-plan
---
```

Optional fields you MAY emit when known: `product`, `work_area: specs`, `created_by`, `derived_from` (paths consumed), `related`, `supersedes`, `tags`. See `.claude/state/frontmatter-schema.md` for the full schema.

## When to Use This Skill
- After a PRD or tech spec is written, before agent execution begins
- When you have a feature spec and want to hand it to Claude Code agents
- When breaking down a large feature into parallelizable agent work
- When you need wave-ordered plans with dependency tracking

## When NOT to Use This Skill
- **Rough idea with no spec?** Run the PRD generator first to clarify what you're building
- **Need sprint-planning artifacts for a human team?** Use the feature decomposition tool instead
- **Need the technical architecture designed?** Use the technical spec writer first

This skill produces execution prompts for AI agents. The feature decomposition tool produces planning artifacts for human engineering teams. Different audience, different output.

## What You'll Need

**Critical inputs (ask if not provided):**
- A tech spec, PRD, or detailed feature description (file path or pasted content)
- Access to the codebase (so plans reference real files and patterns)

**Nice-to-have inputs:**
- Upstream PRD with requirement IDs (from the PRD generator)
- Tech spec with Codebase Impact section (from the technical spec writer)
- Constraints: timeline, team size, or technical limitations

## Process

### Step 1: Read Spec and Codebase Context

Read the input spec. Accept it from:
- A file path (e.g., `work/specs/outputs/2026-03-16-1430/prd-usage-dashboard.md`)
- Pasted content in the conversation
- A detailed feature description (must be specific enough to plan — if too vague, redirect to the PRD generator)

Then read codebase context to ground the plans in reality:
- `context/product.md` — roadmap status, current state
- `package.json` — dependencies, scripts, tech stack
- Scan `app/`, `components/`, `lib/`, `types/` — existing patterns, naming conventions, file structure
- Check `specs/` — related specs or prior plans for this feature

**Tell the user what you found.** Example:
> "I found your tech spec for the usage dashboard. Your codebase uses Next.js App Router with server components, Supabase for auth, and TailwindCSS. I see existing API routes at `app/api/stripe/` and shared components in `components/`. I'll ground the plans in these patterns."

**If the input is too vague:** Don't proceed. Say:
> "This description doesn't have enough detail to produce reliable plans. I'd recommend running the PRD generator to clarify what you're building, then come back here."

### Step 2: Discuss (Lock Implementation Decisions)

Before generating plans, identify 2-3 implementation ambiguities — gray areas where an executing agent would have to make arbitrary choices.

**These are implementation decisions, NOT product decisions.** Product decisions should already be in the PRD. You're locking choices like:

- "The spec says 'real-time updates.' Should I plan for Supabase Realtime, polling, or SSE? Your codebase has no real-time patterns currently."
- "This feature needs a new database table. Should the migration be a separate plan (Wave 1) or inline with API route creation?"
- "The spec mentions role-based access. Should I plan for Supabase RLS policies or middleware-based checks? I see middleware patterns in `app/api/`."

**Rules for good discuss questions:**
- Reference what you found in the codebase (not generic questions)
- Focus on choices that change the plan structure, not minor details
- Maximum 3 questions — respect the user's time
- If the spec is thorough enough that no ambiguities exist, say so and skip to Step 3

Record all decisions. They go into the "Decisions Locked" section of every plan.

### Step 3: Scope and Generate Plans

**First, propose the plan breakdown:**

> "I'll create 3 plans for this feature:
> 1. **Database schema + migration** (Wave 1) — ~20 min agent time
> 2. **API routes + server logic** (Wave 2, depends on Plan 1) — ~30 min
> 3. **Frontend components + pages** (Wave 3, depends on Plan 2) — ~40 min
>
> Plans in the same wave can run in parallel. Plans across waves run sequentially. Should I proceed with this breakdown?"

**Rules for scoping:**
- Each plan should be completable in one agent session (30-60 min of agent work)
- Plans that produce things other plans depend on come in earlier waves
- Plans within the same wave must have zero interdependencies
- Prefer vertical slices (full feature path: DB → API → UI) when the feature is small enough for one plan
- If a plan would have 15+ tasks, split it into multiple plans

**Then generate each plan** following the output template below.

**Verify as you generate:**
- Glob-check that every file path you reference actually exists (for modify actions) or that the parent directory exists (for create actions)
- Ensure every file mentioned in a later plan that was created in an earlier plan is accounted for in "Depends on"
- Check that the union of all plans covers the full spec — nothing is missing
- Verify no circular dependencies between waves

### Step 4: Summary

After generating all plans, present a summary:

> **3 plans generated for [Feature Name]**
>
> | Plan | Wave | Depends On | Agent Time |
> |------|------|-----------|------------|
> | 1. Database schema | 1 | None | ~20 min |
> | 2. API routes | 2 | Plan 1 (table `usage_events`) | ~30 min |
> | 3. Frontend | 3 | Plan 2 (endpoints `/api/usage/*`) | ~40 min |
>
> **When all must_haves pass:** [What "done" looks like — the feature works end-to-end]
>
> Start with Plan 1. Plans saved to `work/specs/outputs/YYYY-MM-DD-HHmm/`.

## Output Template

Generate one file per plan:

```markdown
# Implementation Plan: [Feature Name] — Plan [N of M]

**Source:** [path to PRD/spec]
**Generated:** [YYYY-MM-DD]
**Wave:** [N] (of [M total waves])
**Depends on:** [Plan N | Key outputs: exact file paths, table names, exported functions, API endpoints] or "None"
**Estimated agent time:** [N min]

---

## Objective

[One paragraph: what this plan accomplishes and why it matters in the context of the full feature. An agent reading only this plan should understand its purpose.]

## Decisions Locked

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Implementation question from discuss step] | [Answer chosen] | [Why this choice] |

## Context References

Read these files before executing to understand existing patterns:
- `[exact file path]` — [what to look for: pattern, convention, or interface to match]
- `[exact file path]` — [what to look for]

## Tasks

### Task 1: [Action verb] [specific thing]
**File:** `[exact file path]`
**Action:** create | modify

[Concrete instructions with exact identifiers, parameters, and expected values.

NOT: "Implement the data model"
YES: "Create a Supabase migration file that adds the `usage_events` table with columns:
- `id` (UUID, PK, default gen_random_uuid())
- `user_id` (UUID, FK to profiles.id, NOT NULL)
- `event_type` (TEXT, NOT NULL)
- `metadata` (JSONB, default '{}')
- `created_at` (TIMESTAMPTZ, default now())

Add indexes on `user_id` and `created_at`. Add RLS policy: users can read own events only."]

### Task 2: [Action verb] [specific thing]
**File:** `[exact file path]`
**Action:** create | modify

[Concrete instructions. Reference existing patterns:
"Follow the pattern in `app/api/skills/route.ts` — use `createServerClient` from `lib/supabase/server.ts`, parse params with zod, return NextResponse.json()."]

### Task 3: ...

---

## Must-Haves (Technical Verification)

After execution, ALL of these must be true. These are machine-checkable assertions, not human judgment calls:

- [ ] `[exact file path]` exists and exports `[specific function/component name]`
- [ ] `npm run build` exits with code 0
- [ ] `curl -s localhost:3000/api/[route] | jq .` returns valid JSON with expected shape
- [ ] Migration file in `[directory]` creates table `[name]` with columns `[list]`
- [ ] `npm run lint` passes without new errors

## Product Verification

Maps back to source spec/PRD requirements to ensure we built the right thing:

- [ ] REQ-001: [Requirement from PRD] — verified by [specific check: page renders, data appears, flow completes]
- [ ] REQ-002: [Requirement from PRD] — verified by [specific check]

*If the source spec has no requirement IDs, describe the requirement in plain language.*

## Notes for Executing Agent

- [Codebase-specific pattern to follow: "All API routes in this project use `createServerClient` — see `app/api/skills/route.ts` for the pattern"]
- [Known gotcha: "Next.js 16: `cookies()` returns a Promise — must `await` it"]
- [Naming convention: "Components use PascalCase files, utilities use camelCase"]
```

## How This Chains with Other Skills

```
PRD generator           → PRD with requirement IDs (what to build)
        ↓
Technical spec writer   → Tech spec with codebase impact (how to build it)
        ↓
Spec to plan            → Agent-executable plans (execution prompts)
        ↓
Agent execution          → Code gets written
```

Each skill's output is the next skill's ideal input. You can skip steps — a good tech spec alone is enough for the spec-to-plan skill — but the full chain produces the best results.

## Framework Reference

This skill draws from:
- **GSD (Get Shit Done)** — wave-based dependency ordering, must_haves as goal-backward verification, fresh agent context per plan
- **Marty Cagan's Delivery Model** — plans map to product requirements, not just technical tasks
- **Vertical Slice Architecture** — prefer end-to-end feature slices over horizontal layers

Key insight: **The plan IS the execution prompt.** It's not a document that someone rewrites into agent instructions — it's structured so an agent can pick it up and execute it directly.

## Tips for Best Results

1. **Better input = better plans.** A thorough tech spec produces dramatically better plans than a rough description. Run the technical spec writer first if you haven't.
2. **Lock decisions in the discuss step.** Every ambiguity you resolve upfront prevents an agent from making the wrong choice downstream.
3. **Review the plan set before executing.** Check that the dependency chain makes sense and that must_haves cover what matters.
4. **One plan per agent session.** Don't try to execute multiple plans in one conversation — context rot degrades quality. Fresh agent, fresh plan.
5. **must_haves are your safety net.** If they all pass, the plan succeeded. If any fail, you know exactly what went wrong.
