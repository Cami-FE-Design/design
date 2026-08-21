---
title: Product Knowledge System
created at: Thu Jul 30 2026 22:30:03 GMT+0000 (Coordinated Universal Time)
updated at: Fri Jul 31 2026 03:59:24 GMT+0000 (Coordinated Universal Time)
---

# Product Knowledge System

#

**Owner:** Michelle You **Scope at v0.1:** Sales modules. Extends to other modules as they are specified.

## Why these are separate

Four things were living in one flat Q\&A sheet: invariants, decisions, specs, and open questions. They change at completely different rates. Flattened together, all four decay at the speed of the fastest-moving one, which is why the same principle got answered four times in two days.

Separated by rate of change, each one stays trustworthy for as long as it should.

| #   | Artifact            | Changes                 | Owner          |
| --- | ------------------- | ----------------------- | -------------- |
| 01  | Product invariants  | Almost never            | Michelle       |
| 02  | Glossary            | Rarely                  | Michelle       |
| 03  | State machines      | Per release             | Michelle       |
| 04  | Decision records    | Immutable once accepted | Decision owner |
| 05  | Business rules      | Per feature             | Michelle       |
| 06  | Open questions      | Constantly, drains      | Question owner |
| 07  | Edge case catalogue | Grows forever           | Haroon         |

## The triage rule

An incoming question goes through three tests in order.

1. **Does an existing invariant answer it?** Point at the invariant. Done.
2. **Is there a real tradeoff with a losing option?** Write a decision record.
3. **Neither?** It is a spec gap. Write a rule with an ID into the PRD.

Then the loop that keeps the system alive: **any question answered twice gets promoted to an invariant or a glossary entry.** Skip this and the system decays back into a queue within a month.

## The traceability spine

```raw
Invariant (INV-04)
  → Rule (REV-03)
    → Linear issue (CAM-xxx)
      → Test case (Haroon)
        → Bug report cites REV-03
```

Every link is a citation, not a link in a doc. When a merchant reports a bug, you can walk back to the intent. When you change an intent, you can walk forward to everything it touches.

## Conventions

* **IDs are permanent.** A retired rule keeps its ID and is marked retired. IDs are never reused.
* `[OPEN-xx]` marks any unresolved item, inline, wherever it appears. Grep-able.
* **Decision records are immutable.** Superseded by a new PDR, never edited.
* **One DRI per artifact.** Listed at the top of each file. Currently Michelle owns five of seven, which is a fact worth making visible in the DRI map rather than leaving implicit.

## Files

| File                         | Contents                                                              | Home                    |
| ---------------------------- | --------------------------------------------------------------------- | ----------------------- |
| `01-product-invariants.md`   | 11 platform-wide rules                                                | Slite                   |
| `02-glossary.md`             | Domain terms, including the definition of "session"                   | Slite                   |
| `04-decision-records.md`     | Template plus PDR-001, 002, 003                                       | Slite                   |
| `03-state-machines.md`       | Invoice, gift card, package session, product stock, reversal decision | FigJam, embedded here   |
| `05-business-rules-sales.md` | 36 rules in Given/When/Then, ID'd                                     | Sales PRD, as a section |
| `07-edge-case-catalogue.md`  | 41 cases across 6 modules, ranked by risk                             | Sales PRD appendix      |
| `06-open-questions.md`       | 8 open, 7 closed                                                      | Linear, CAM team        |
