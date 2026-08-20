# Template: BRD (Business Requirements Document)

**Use for:** initiative-scale work spanning 3+ features, or needing a commercial case. Multi-location, settlement, KSA, reporting.
**Do not use for:** a single feature. Go objective → PRD directly.
**Not a PRD.** The BRD is a durable requirements register that outlives the release. The PRD is one release slice and dies at ship. Split rule below.
**Last updated:** 2026-08-16

---

## Split rule

| | BRD | PRD |
|---|---|---|
| Grain | Initiative, spans 3+ features | One release slice |
| Durable | Yes | No |
| Answers | What must the business be able to do, ranked | What we build now, why now, what could go wrong |
| Owns | R-numbers, priority, scope boundary | User stories, delivery shape, dependencies, risks, sign-off |
| Rewritten when | The business need changes | Every release |

**Never duplicate.** Problem, evidence, personas, and risks belong to the PRD. The BRD points at them in one line each. If a section exists in both, delete it from the BRD.

---

## Labels (closed sets)

**Priority**

| Label | Means |
|---|---|
| Must | The initiative fails without it |
| Should | Real value, ships if the Musts land early |
| Later | Named, deliberately deferred, has a trigger |
| Cut | Considered and rejected. Keep the row so it stays rejected |

**Traced**

| Marker | Means |
|---|---|
| ✅ | Use case IDs exist for this requirement |
| ⚠️ | Some IDs, gaps named |
| 🔴 | No IDs yet. Requirement is prose only |

Build state is **not** a BRD column. It lives in `feature-mappings/`, owned by engineering. The BRD says what must be true, not what is built.

---

## Skeleton

```markdown
# BRD: [Initiative]

**One question:** [What must the business be able to do?]
**Serves objective:** [goals.md objective, verbatim]
**Unlocks:** [tier, segment, or named account]
**Companion PRD:** [link, or "not written yet"]
**Law:** [01-06 IDs this initiative is constrained by]
**Owner:** [one DRI]
**Last checked:** YYYY-MM-DD

---

## TL;DR

1. [N] requirements. [N] Must, [N] Should, [N] Later.
2. [The single hardest one, and why]
3. [What is blocked until this ships]

⚠️ **Evidence:** [what kind, and what it cannot support]

---

## Why it is worth doing

| | |
|---|---|
| **Unlocks** | [tier / accounts / GMV] |
| **Costs us if we do not** | [named account, deadline, or leak] |
| **Trigger to start** | [what has to be true first] |
| **Trigger to stop** | [what would make this not worth it] |

One line each. The argument, not the essay. Detail lives in the PRD.

---

## Words that matter

| Say this | Means |
|---|---|
| … | … |

Only terms this initiative introduces. Everything else is in [02 Glossary](../../context/knowledge/02-glossary.md).

---

## Owns / not this

| This initiative owns | Point elsewhere |
|---|---|
| … | … |

---

## Requirements

Group by what the business is doing, 3 to 6 groups. Same row shape in every group.

### Map of groups

| Group | What it covers | Requirements |
|---|---|---|
| **A · …** | … | R1 to R3 |
| **B · …** | … | R4 to R6 |

### A · [Group name]

| ID | Requirement | Priority | Done when | Use case IDs | Traced |
|----|-------------|----------|-----------|--------------|--------|
| R1 | … | Must | … | CAL-A1, CAL-B1 | ✅ |
| R2 | … | Should | … | — | 🔴 |

**Done when** is testable, in the same voice as a feature-guide row. Not "supports multi-location", but "one owner sees all nine branches in one grid without switching account".

---

## Out of scope

| Not in this initiative | Why | Revisit when |
|---|---|---|
| … | … | … |

---

## Success criteria

| | Measure | Target | Source |
|---|---|---|---|
| **Lagging** | [business outcome] | … | [where the number comes from] |
| **Leading** | [pre-launch signal] | … | … |

A target with no named source is a wish. If nothing measures it, say 🔴 and add it to the instrumentation spec.

---

## Open decisions

| Decision | Blocks which requirement | Owner | Where it resolves |
|---|---|---|---|
| … | R… | … | ADR-… / meeting / person |

---

## Evidence & confidence

- ✅ Validated: …
- ⚠️ Inferred: …
- ⚠️ Assumed: …
- 🔴 Unknown: …

---

## Change log

| Date | Change |
|---|---|
| YYYY-MM-DD | First write |
```

---

## Where it sits in the chain

| # | Node | Answers |
|---|---|---|
| 1 | Objective | Why this half |
| 2 | Job | Whose problem |
| 3 | Evidence | Proof the job is real |
| **4** | **BRD** | **What the business must be able to do, ranked** |
| 5 | PRD | What we build now, why now |
| 6 | Use case ID | The named path, one row |
| 7 | Use-case spec | All paths, alternates |

The BRD's job in the chain is the **R-number to use case ID bridge**. Without that column the register is prose and nothing downstream can be traced back to a business need (INV-11).

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. Split rule set against the multi-location BRD/PRD overlap; build state deliberately excluded |
