# Product Knowledge System

**Owner:** Michelle (Product)
**Last updated:** 2026-08-03
**Purpose:** The durable source-of-truth layer for how Cami actually works. Stops context drift, stops re-litigating settled decisions, and gives engineers and new hires one place to check "what must always be true" before they build.

These docs sit underneath the strategy context (company, product, personas, competitors, goals). Strategy explains *why we are building*. This layer pins down *what is true and must stay true* while we build.

## The docs

**01 to 05 are knowledge types** spanning every domain. **06 is the first domain doc**, spanning every knowledge type for one domain (money). If a second domain contract follows (booking, comms), split those into a `domains/` sub-folder rather than continuing the number series.

| # | Doc | Answers the question | When to read it |
|---|-----|----------------------|-----------------|
| 01 | [Product Invariants](01-product-invariants.md) | What must always hold, no exceptions | Before designing any flow that touches payments, reminders, or booking |
| 02 | [Glossary](02-glossary.md) | What do we mean by this word | Any time a term is ambiguous (sale vs void, GMV vs captured volume) |
| 03 | [State Machines](03-state-machines.md) | What states can this thing be in, and what moves it | Building booking, checkout, deposit, reschedule, or reminder logic |
| 04 | [Decision Records](04-decision-records.md) | Why did we choose X over Y | Before reopening a decision, or when a new hire asks "why not just..." |
| 05 | [Edge Case Catalog](05-edge-case-catalog.md) | What weird real-world cases must the product survive | Scoping any feature; QA; sizing gaps |
| 06 | [Money Composition Contract](06-money-composition-contract.md) | How do money objects combine on one invoice | Any ticket touching amount due, tax, discounts, tips, or tender |

## How to use

- **Invariants are load-bearing.** If a spec violates an invariant, the spec is wrong, not the invariant. Change an invariant only with a Decision Record.
- **Glossary is canonical.** If two docs use a term differently, the Glossary wins. Update the Glossary, do not fork the meaning.
- **State Machines are the contract.** The sale/void/refund glossary is the source of truth for checkout states (pending Sham and Maz sign-off).
- **Decision Records are append-only.** Do not delete a decision. Supersede it with a new record that references the old one.
- **Edge cases feed the backlog.** A 🔴 gap here is a candidate for prioritization, not a bug in this doc.
- **The Money Composition Contract is binding, and cited by name.** Tickets touching amount due cite the **Composition Order** (step N), the **Scope Rule**, or an **INV-M** ID. A bare link does not satisfy INV-11. 06 owns composition; 01 owns the invariant registry, 02 owns definitions, 03 owns reversal direction, 04 owns resolution of its open decisions. 06 cites them, it does not restate them.

## Status legend (used across all docs)

| Marker | Meaning |
|--------|---------|
| ✅ | Settled / shipped / holds today |
| ⚠️ | Partial, planned, or gated on an external unblock (META, NeoPay) |
| 🔴 | Known gap, no current handling |
| 🔒 | Permanent principle (change only via Decision Record) |
| 🕒 | Current constraint that will lift as the product matures |

## Maintenance

Update these whenever a decision lands, a term is coined, a state is added, or a pilot surfaces a new edge case. Use the `Write`/`Edit` tools only (sync depends on it). Keep entries tight, table-first, and dated.

**Watch for drift into 06.** The Money Composition Contract governs how amounts are *computed and composed*, not how funds *move*. Settlement, payout, and provider reconciliation belong in 03 §8/§9 and the payments invariants, not in 06.

| Date | Change |
|------|--------|
| 2026-08-09 | Added 06 Money Composition Contract and the domain-doc axis note. |
