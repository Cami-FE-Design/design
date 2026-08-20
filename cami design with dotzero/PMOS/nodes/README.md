# Nodes

**One question:** Where is every artifact, whether it lives in PMOS or not?
**The chain itself:** [artifact-flow.md](../artifact-flow.md)
**Last checked:** 2026-08-16

Everything is reachable from here in one click. **Not everything lives here**, and that is deliberate, see Ownership below.

---

## The twelve nodes

| # | Node | Open | In PMOS? |
|---|------|------|----------|
| 1 | Objective | [context/goals.md](../context/goals.md) | ✅ |
| 2 | Job | [context/personas.md](../context/personas.md) · [jtbd outputs](../work/discovery/outputs/) | ✅ |
| 3 | Evidence | [discovery outputs](../work/discovery/outputs/) · [inputs](../work/discovery/inputs/) | ✅ |
| 4 | BRD | [work/specs/brd/](../work/specs/brd/) | ✅ |
| 5 | PRD | [work/specs/prd/](../work/specs/prd/) | ✅ |
| 6 | Use case ID | [feature-mappings/](../../cami-feature-docs/feature-mappings/) · [MAP](../../cami-feature-docs/feature-mappings/MAP.md) | ↗ eng repo |
| 7 | Use-case spec | [work/specs/use-cases/](../work/specs/use-cases/) | ✅ |
| A | Law | [business-rules/](../../cami-feature-docs/business-rules/) | ↗ eng repo |
| 8 | Design spec | [docs/specs/](../../../docs/specs/) | ↗ design repo |
| 9 | Linear ticket | [linear.app/getcami](https://linear.app/getcami) | ↗ Linear |
| 10 | Validation | [validations/](../../cami-feature-docs/feature-mappings/get-booked/validations/) | ↗ eng repo |
| B | Instrumentation | — | 🔴 does not exist |
| 11 | Launch | — | 🔴 does not exist |
| 12 | Metric | — | 🔴 does not exist |

---

## Ownership, and why some nodes are not in PMOS

| Repo | Holds | Co-authored by | Moving it would |
|---|---|---|---|
| **PMOS** (this) | 1 to 5, 7, and everything you author alone | Michelle | — |
| [`getcami/cami-feature-docs`](https://github.com/getcami/cami-feature-docs) | 6, A, 10 | **Mike Nguyen** (tech lead). Validations are authored by engineering, and Mike works in this repo | Break his clone and open PRs |
| [`Cami-FE-Design/design`](https://github.com/Cami-FE-Design/design) | 8 | Hussain Shabbir, hussainNGI | Break engineering's design-spec references |

**Law is never duplicated into PMOS.** Two copies of `01-06` drift, and the system rests on one source of truth ("cite law, never restate", INV-11). PMOS links to it, one click above.

**Rule:** a node lives where its author works. PMOS is the map, not the warehouse. If you author it alone, it belongs in PMOS; if someone else writes into it, link out.

PMOS itself sits inside the design repo working tree and is untracked there, which is why cross-repo paths look long. That is a path artifact, not a structure problem.

---

## Templates

| Writing | Template |
|---|---|
| Any doc, what shape? | [table-first](../work/_templates/table-first.md) |
| BRD | [brd](../work/_templates/brd.md) |
| Use-case spec | [work/specs/use-cases/\_template](../work/specs/use-cases/_template.md) |
| Validation | [validations/\_template](../../cami-feature-docs/feature-mappings/get-booked/validations/_template.md) |
| Feature guide | [feature-mappings/\_template](../../cami-feature-docs/feature-mappings/_template.md) |
| PRD | `/prd-generator` skill |

---

## Gaps

| Node | State | First step |
|---|---|---|
| 3 Evidence | ⚠️ one interview (Queenie). No chain operator, no payer observed | 5 payment observations, 1 chain operator |
| 4 BRD | ⚠️ one written, zero requirements fully traced to IDs | Fill the Use case ID column, or create the missing IDs |
| 7 Use-case spec | ⚠️ 1 of ~80 IDs | Four money-path specs: checkout tip, package refund, link cancel, terminal decline |
| B Instrumentation | 🔴 nothing | Metric tree first, then a spec per PRD |
| 11 Launch | 🔴 nothing | Launch brief template plus a tiering rule |
| 12 Metric | 🔴 nothing | Captured-vs-booked (EC-19), the number the revenue model runs on |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-16 | First version. BRD moved into PMOS; nodes 6 to 10 stay with their co-authors and are linked out |
