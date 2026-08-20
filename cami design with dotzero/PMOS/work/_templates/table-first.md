# Template: table-first output

**Use for:** discovery outputs, specs, gap docs, and skill outputs (jtbd, journey maps, research synthesis, scoping).
**Do not use for:** reference law (`context/knowledge/01-06`). Those are the authority everything else cites; flattening them into use-case tables breaks the separation that makes both layers work.
**Adapted from:** the tech lead's feature-guide template (`cami-feature-docs/feature-guides/README.md`). Vocabulary is deliberately shared, see Labels below.
**Last updated:** 2026-08-16

---

## The shape

| Section | Question it answers | Required |
|---|---|---|
| **One question** | What single thing does this doc answer? | Yes |
| **Words that matter** | Which terms does this page need? | If any are ambiguous |
| **Owns / not this** | What is out of scope, and where does it live? | Yes |
| **Map of groups** | Where do I start reading? | If 3+ groups |
| **Group tables** | One small table per group | Yes |
| **Open decisions** | What does this doc not know, and what does that block? | Yes |
| **Evidence & confidence** | How much of this is real? | Yes |
| **Change log** | What changed and when | If the doc will be revised |

---

## Rules

| Rule | Why |
|---|---|
| One question at the top. If a row does not serve it, cut the row or move it | Forces scope |
| Never one big table. 3 to 6 groups, one small table each | Big tables get skimmed, small ones get read |
| Same row shape across every group in a doc | You scan instead of read |
| Group by **what the person is doing**, not by source doc, team, or happy-vs-edge | The doc has to be usable by someone doing the job |
| Cite law IDs in **Evidence** and **Open decisions**, not in every row | Rows stay scannable; the citation still exists |
| **Cite law, never restate it.** If it needs changing, change `01-06` first | One source of truth |
| A claim with no evidence gets a label, not a hedge in prose | "⚠️ Assumed" beats "it seems likely that" |
| Prose only as short bullets under a table. No paragraph blocks | The preference this template exists for |
| No em dashes. American spelling | Standing house rules |

---

## Labels (closed sets)

Pick one set per column. Do not invent new words.

**Build state**, when scoring what exists. **Same words as the feature guides, on purpose**, so the two layers do not fork vocabulary.

| Label | Means |
|---|---|
| Works | On `main`, matches the use-case |
| Partial | Some of it works |
| Missing | Required, not on `main` |
| Broken | Built, disagrees with the law |
| Needs check | Not verified yet |
| Needs decision | Product open |

**Evidence state**, when scoring how much a claim is worth.

| Label | Means |
|---|---|
| ✅ Validated | Someone real said or did this |
| ⚠️ Inferred | Derived from an artifact (a competitor's build, a spec, code) |
| ⚠️ Assumed | Reasoned, unverified. Say so plainly |
| 🔴 Unknown | Named gap, no basis yet |

**Status**, when tracking a gap or an item.

| Marker | Means |
|---|---|
| ✅ | Settled, shipped, holds today |
| ⚠️ | Partial, planned, or gated on an external unblock |
| 🔴 | Known gap, no current handling |

---

## Skeleton

```markdown
# [Doc name]

**One question:** [The single thing this answers]
**Law:** [cite 01-06 IDs, or the specs this depends on]
**Date:** YYYY-MM-DD

## TL;DR
1. [Finding, with the number in it]
2. [Finding]

⚠️ **Evidence:** [what kind, and what it cannot support]

## Words that matter
| Say this | Means |
|---|---|

## Owns / not this
| This doc owns | Point elsewhere |
|---|---|

## Map of groups
| Group | Job | Start here if… |
|---|---|---|

### A · [Group name]
| ID | Job | Done when | Today | Evidence | Verdict |
|----|-----|-----------|-------|----------|---------|
| XX-A1 | | | | | |

## Open decisions
| Decision | Blocks what | Owner | Where it resolves |
|---|---|---|---|

## Evidence & confidence
- ✅ Validated: …
- ⚠️ Assumed: …

## Change log
| Date | Change |
|---|---|
```

---

## Two things worth copying deliberately

**The "Start here if…" column** routes by symptom, not by structure. A reader arrives with a problem, not a table of contents.

**The Open decisions table with "blocks what"** makes the doc report its own holes. Without it, an unresolved question reads as an oversight. With it, it reads as tracked work and it names who owes the answer.

---

## Where narrative is still right

Sequence and feeling do not fit in a grid. Journey maps need an emotional arc; a day-in-the-life needs to be readable as a day. Keep those, but:

- Lead with the table, put the narrative under it
- Short bullets, not paragraph blocks
- Every emotion carries an evidence label, or it is decoration

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Adapted from the tech lead's feature-guide template; build-state labels shared verbatim |
