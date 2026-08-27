# DSG-80 — Product import: as-built review & design improvements

**Status**: Draft v1 (2026-08-27)
**Owner**: Hussain Shabbir
**Linear**: [DSG-80](https://linear.app/getcami/issue/DSG-80/product-import-design-improvements)
**Related**: PRD-63 (backend — product import must not reject rows for missing SKU)
**Scope**: **Products import only.** Clients and pets ride the same wizard in
production; they are explicitly out of scope here (see §7).

---

## 1. Where this came from

Slack thread (#product, 2026-08-19 → 08-20):

- **Aya** imported a client's product list as part of data migration. 100 rows
  in, 83 created, **17 rejected "for unclear reasons"**.
- **Maaz**: *"the rejection reasons are not readable with the current UI"* —
  he had to reverse-engineer from a screenshot that SKU is mandatory. Flagged
  **17–20% leakage on every import**, and asked for a UI fix plus an import-logic
  review.
- **Michelle** filed PRD-63 (BE): generate unique placeholder SKUs instead of
  rejecting, flagged for operators to edit later.
- **Aya** hit the same class of failure on the **client** import (80 of 100
  transferred).
- **Maaz**: *"the above screens do not look like all the other modules. There's
  a notable difference"* and *"the text needs to be non-technical … I don't know
  what 'skipped by MODE' means here. Or 'New dictionaries'."*
- **Owais** is on CamiPay; the **UI work came to me**, the import logic stays
  with him.

So this ticket is two things and not the third:

| | Problem | Owner |
|---|---|---|
| A | Import logic rejects recoverable rows → data leakage | Owais / BE — **PRD-63, not this spec** |
| B | Rejection reasons are unreadable in the preview UI | **DSG-80** |
| C | Screens are off-system and speak developer language | **DSG-80** |

**A changes B's design.** Once PRD-63 lands, "17 rejected / missing SKU" largely
disappears and is replaced by a state that does not exist yet: *rows imported
with a placeholder SKU the operator must revisit*. This spec designs for the
post-PRD-63 world and keeps a reject path only for causes that genuinely cannot
be auto-repaired.

---

## 2. As-built: what production actually does

Source of truth: `cami-business/src/modules/import-export/` — a shared,
entity-parameterized module (clients · pets · products) driven by
`config.ts › ENTITY_CONFIG`. It is not a throwaway; the platform is sound and
this spec deliberately preserves its information architecture.

### 2.1 Flow

`/business/products/import` → `ImportWizard`, five steps:

| Step | Component | Who acts |
|---|---|---|
| 1 Upload | `UploadStep` | operator |
| 2 Analyze | `ProgressStep` | machine (poll) |
| 3 **Review** | `PreviewStep` + `PreviewRow` | **operator — the screen under review** |
| 4 Import | `ProgressStep` | machine (poll) |
| 5 Done | `DoneStep` | operator |

`?jobId=&phase=` in the URL is the single source of truth, so reopening the tab
resumes at the right step. Two-phase contract: **preview → confirm**, nothing is
written until the operator confirms.

### 2.2 Step 1 — Upload

- Drag-and-drop or click; **.csv / .xlsx only**; products cap **10 MB / 1000 rows**.
- FE validates extension + size only. Headers, row cap and content are the
  backend's call, returned as `PRODUCT_IMPORT_*` codes.
- **Import mode** select (products): `UPSERT` "Update & create" (default) ·
  `STOCK_SYNC` "Stock sync only" · `CREATE_ONLY` · `UPDATE_ONLY`.
- **Price-change threshold (%)**, default 30 — retail-price jumps above this
  flag the row for approval.
- Template downloads: CSV + Excel.

### 2.3 Step 3 — Review (the screenshot)

Six row statuses: `create · update · flag · noop · skip · reject`.

Page anatomy, top to bottom:

1. **Outcome header** — one of three: *actionable* ("N rows analyzed · N
   approved. Nothing has been created yet."), *up-to-date* (green), or
   *all-rejected* (amber).
2. **KPI grid** — six flat cards: To create · To update · Needs review ·
   No change · **Skipped by mode** · Rejected.
3. **"New dictionary entries will be created"** — amber panel listing every
   brand / category / supplier the import will auto-create, as chips.
4. **"Unresolved tax rates"** — amber panel, per-row list.
5. **Status filter** — segmented toggle, `All (100) · Create (83) · … · Rejected (17)`.
6. **Row table** — virtualized, `max-h-[480px]`, columns
   `# · Status · Product · Match · Issues · Changes`. Each row expands via a
   `View changes` chevron into: rejection reasons, errors, warnings, "Will apply
   automatically" diff, "Needs your approval" diff.
7. **Per-row switches** — approve individual flagged changes (name, retail
   price, tax, barcode, SKU); plus a **duplicate rescue** toggle when a row was
   rejected for an in-file barcode clash ("Import without barcode").
8. **Footer** — Back · "N rows will be imported · N rejected" · **Confirm & import**.

### 2.4 Where the copy comes from — important

Two different sources, and only one is ours today:

- **Job-level errors** → `error-codes.ts` maps stable codes
  (`PRODUCT_IMPORT_TOO_MANY_ROWS`, `PRODUCT_IMPORT_HEADER_MISMATCH`, …) to
  operator copy, including detail-aware sentences built from the payload. **This
  is good and should be the model for everything else.**
- **Row-level `errors[]` / `warnings[]`** → *full sentences from the backend,
  rendered verbatim.* From `product-bulk-import.ts`:
  `// Human-readable rejection reasons (full sentences) — rendered verbatim.`

**Consequence: the exact wording Maaz objected to is not currently changeable
from the frontend.** Fixing it properly needs stable per-row error *codes* from
BE (see Q1 in §6). Until then the design assumes a FE translation shim keyed on
the current sentences — which works, but is brittle and must not be the
long-term answer.

---

## 3. Defects

Numbered so review comments can cite them.

### Scan-ability — the core complaint

- **D1.** Rejection reasons are hidden behind a per-row chevron. 17 rejected
  rows = 17 clicks to learn one fact ("all missing SKU"). This *is* Maaz's
  "not readable with the current UI".
- **D2.** The `Issues` column shows **counts** (`1 Error · 2 Warnings`) instead
  of the reason. A count is not actionable.
- **D3.** **No aggregation.** 17 rows share one cause; 100 rows share the same
  two warnings ("Supply Price is blank", "Barcode is blank"). Each is repeated
  per row instead of stated once.
- **D4.** Wrong affordance label: `View changes` on a rejected row, where
  nothing will change. It should ask *why*.
- **D5.** Layout bug visible in Aya's screenshot — expanded error text overlaps
  the rows beneath. The virtualizer estimates 64px per row
  (`estimateSize: () => 64`) with absolutely-positioned items; expansion does not
  re-measure cleanly.
- **D6.** No exit path. There is no "download the 17 rejected rows" so the
  operator can fix just those and re-upload. Today the only recovery is
  hand-editing the original sheet.
- **D7.** No import history — a finished job is unreachable once the tab closes,
  so "what happened last Tuesday" is unanswerable.

### Copy — developer vocabulary reaching operators

- **D8.** `Skipped by mode` — refers to the `mode` query param; meaningless to
  an operator (Maaz called this one out by name).
- **D9.** `New dictionary entries will be created` — "dictionary" is an internal
  term for lookup tables (Maaz called this one out too).
- **D10.** Further leaks: `Unresolved tax rates` · `Intra-file conflicts` ·
  `normalizedCount approved` · `Match: by SKU` / `New` · statuses `flag` / `noop`.
- **D11.** Two panels state a fact but no action ("New dictionary entries will be
  created", "Unresolved tax rates") — the operator cannot tell whether either is
  a problem.

### Look & feel — Maaz's "notable difference"

- **D12.** Raw Tailwind palette (`emerald-50`, `amber-200`, `blue-700`,
  `destructive/10`) instead of cami tokens. Every other module uses `bg-cami-*`.
- **D13.** Notice panels are bordered amber cards. Our convention is tinted,
  borderless: `rounded-xl bg-cami-{color}-2 p-3`.
- **D14.** The wizard renders a bare `<main>` with a "Back to products" text
  link — **no app shell**, so no sidebar or topbar context. In the screenshot the
  sidebar is present because the route sits inside the business layout, but the
  page owns its own scroll and header, unlike every other cami surface.
- **D15.** Flat six-card KPI grid with no hierarchy — "17 Rejected" (bad) is
  styled identically to "83 To create" (good).
- **D16.** Nested scroll: a `max-h-[480px]` inner-scrolling table inside a
  scrolling page.
- **D17.** Five-step stepper for **three operator steps** — steps 2 and 4 are
  machine phases the operator only waits through.
- **D18.** Money is unformatted; retail-price diffs must render as **AED**.

---

## 4. Design direction (Phase 2)

Not built yet — this section is what the review is *for*.

1. **Grouped issue summary above the table.** *"17 rows can't be imported — all
   17 are missing a SKU."* One line per cause, click to filter, plus
   `Download these 17 rows`. Fixes D1–D4, D6.
2. **Reason inline in the row.** First cause as text, not a count. Expansion
   becomes optional detail, never mandatory.
3. **Warnings summarised once** at the top ("Supply price blank on 100 rows —
   margin reports will be unavailable"), removed from per-row noise. Fixes D3.
4. **KPI row with hierarchy** — one headline ("83 products will be added"),
   problems visually separated from successes. Fixes D15.
5. **Copy rewrite** — see §5.
6. **Post-PRD-63 state** — rows import as `create` carrying a chip
   *"Placeholder SKU CAMI-0001 — edit later"*, and the Done step gains
   `Review 17 placeholder SKUs`, deep-linking to a filtered product list. This
   is the state that makes PRD-63 safe to ship: no silent data, no leakage.
7. **Design-system pass** — cami tokens, tinted borderless notices, app shell
   with `min-h-0 flex-1 overflow-y-auto`, one page scroll, AED, reuse
   `KpiCard` / `EmptyState` / existing table idioms. Fixes D12–D16, D18.
8. **Three-step stepper** (Upload → Review → Done) with the machine phases shown
   as progress *within* a step. Fixes D17.

---

## 5. Copy table (proposed)

| Where | As-built | Proposed |
|---|---|---|
| KPI card | Skipped by mode | Left out by your import option |
| KPI card | Rejected | Can't import |
| KPI card | Needs review | Needs your OK |
| KPI card | No change | Already up to date |
| KPI card | To create / To update | Will be added / Will be updated |
| Panel title | New dictionary entries will be created | We'll add 11 new brands and 13 new categories |
| Panel title | Unresolved tax rates | Tax rate not recognised — tax left unchanged on 3 rows |
| Header | 100 rows analyzed · 83 approved | We checked 100 rows. 83 are ready to import. |
| Status filter | Rejected (17) | Can't import (17) |
| Status filter | Skipped (0) | Left out (0) |
| Row expander | View changes | **Why?** (rejected) / See changes (everything else) |
| Match column | by SKU / New | Matched by SKU / New product |
| Upload button | Upload & analyze | Check my file |
| Upload field | Import mode | What should we do with products we already have? |
| Upload field | Price-change threshold (%) | Ask me before raising a price by more than __% |
| Reject banner | Nothing to import — every row was rejected | We couldn't import any of these rows |
| Done | Your products import finished | 83 products added |

Row-level sentences (`SKU is required — every product must have a unique SKU.`)
are backend-owned; the rewrite depends on Q1.

---

## 6. Open questions

- **Q1 — who owns row-level copy?** Per-row rejection sentences arrive from BE
  verbatim. Either (a) BE returns stable per-row error codes and the FE owns all
  operator copy — correct long-term, needs an ask to Owais; or (b) the FE keeps a
  translation dictionary keyed on BE sentences — works now, brittle. Design
  assumes (b) as a shim and (a) as the target.
- **Q2 — inline fixing?** Is *download rejected rows → fix in Excel → re-upload*
  enough for v1, or does a row need to be editable in the preview? Recommend
  out of v1; it is a much larger surface.
- **Q3 — import history.** Should a finished job stay reachable (D7)? Not in the
  as-built at all. Recommend a follow-up ticket, not DSG-80.
- **Q4 — PRD-63 shape.** Confirm the placeholder SKU format (`CAMI-0001`?) and
  whether such rows carry a distinguishable flag in the preview payload, so the
  UI can surface "needs a real SKU later" rather than looking like a clean row.

---

## 7. Scope note — products only

The production wizard is entity-parameterized and serves clients + pets from the
same components, and Aya hit the same class of failure on the **client** import
(80/100). DSG-80 is scoped to **products only** (confirmed 2026-08-27). The
design-repo replication is nonetheless built config-driven, mirroring
`ENTITY_CONFIG`, so adding clients/pets later is a config entry rather than a
rewrite — but only the products surface ships under this ticket.

---

## 8. Delivery phases

| Phase | Output | State |
|---|---|---|
| 0 | This spec | **done** |
| 1 | As-built replication in the design repo — `/products/import`, faithful IA and copy, mock-driven, scenario switcher | **done** |
| 2 | Redesign per §4 + §5 | **done** — see §9 |
| 3 | Playground section, `/screens` entries, Slack review for Michelle | not started |

Phase 1 exists so the improvement can be judged against an honest baseline. Both
flows live behind one compare bar at `/products/import`: pick a case, flip
between **Redesign (DSG-80)** and **As it ships today** with the same data on
screen.

---

## 9. What phase 2 shipped

Route: `/products/import`. The compare bar (design-repo-only) carries the view
toggle, the scenario picker, a *skip the upload step* shortcut, and — when the
active case contains one — a line naming any backend sentence the copy shim does
not own yet, so Q1's gap stays visible while reviewing.

### 9.1 Files

| File | Role |
|---|---|
| `lib/product-import/copy.ts` | **Every operator-facing string, in one file.** The copy rewrite is reviewable as a single diff against `config.ts` (which holds the as-built strings). |
| `lib/product-import/issues.ts` | The Q1 shim + cause grouping. Maps known backend sentences to plain-English definitions; anything unmatched passes through with the backend's own words and is reported by `unmappedSentences()`. |
| `lib/product-import/outcome.ts` | Row → "what happens" sentence, and the preview → counts roll-up used by the outcome strip and the confirm button. |
| `components/blocks/product-import/redesign/` | `import-flow` · `upload-panel` · `progress-panel` · `review-panel` · `review-row` · `issue-summary` · `outcome-strip` · `done-panel` |
| `components/blocks/product-import/import-compare-shell.tsx` | Hosts both flows behind the compare bar. |

### 9.2 Defects closed

| Defect | How |
|---|---|
| D1, D3, D4 | `IssueSummary` groups every row by cause and states it once, with the row numbers, what it means and what to do. No expansion needed to learn why 17 rows failed. |
| D2 | The `Issues` count column is gone. The last column is "What happens", in words — `rowOutcome()` renders a sentence per status. |
| D5 | No virtualization, so no row-overlap. |
| D6 | `Download the 17 rows that failed` on the blocking summary, and again on the Done step. |
| D8–D11 | Copy rewrite. "Skipped by mode" → the actual reason, derived from the option the operator chose (`skipReason()`). "New dictionary entries" → "We'll also add 13 new brands and 14 new categories", tinted sage as information rather than amber as alarm. |
| D12, D13 | Cami tokens throughout; badges use the existing `success` / `primary-soft` / `warning` / `muted` / `destructive` variants; notices are tinted and borderless. |
| D15 | `OutcomeStrip` — one headline number for what the operator gains, secondary counts on one line, and the blocked count deliberately *not* in the strip: it lives in the issue summary where there is something to do about it. |
| D16 | One page scroll. |
| D17 | Three steps (Upload → Review → Done); the file check runs inside step 1 and the write inside step 2. |
| D18 | `RowDiffTable` formats money as AED via `formatAed`. |

Also done beyond the defect list: the status filter drops statuses with no rows
(the as-built toggle offered "Skipped (0)" on every first import), clicking a
cause filters the table to exactly those rows with a clearable chip, and the
confirm button carries the count ("Import 83 products") so the commitment is
explicit.

### 9.3 The PRD-63 hole, closed

`placeholder-skus` is the scenario to look at. Rows that arrive with a generated
SKU now carry a `SKU CAMI-0001 — ours, not yours` chip in the table, the
advisory summary states it once, and the Done step gains a
**"17 products need a real SKU"** block linking to a filtered product list. In
the as-built flow the same import looks completely clean.

Open dependency: Q4 — the real payload needs to mark these rows distinguishably.
The shim currently detects them from the warning sentence, which is exactly the
brittleness Q1 describes.

### 9.4 What this costs to build for real

Asked in review, worth recording: **none of the redesign changes the import
contract.** Same `POST …/import`, same analyse-job poll, same preview JSON, same
confirm-with-overrides, same apply job, same result summary. No new endpoint, no
payload change, nothing for the backend to do.

| Change | Where the work is |
|---|---|
| Copy rewrite | One file (`copy.ts`) plus the label call sites. |
| Grouped issue summary | One new component + the grouping helper. Reads the preview payload that already exists. |
| "What happens" column | Replaces the issues-count cell; derived from fields already in each row. |
| Cami tokens / tinted notices | Class swaps. |
| **5 steps → 3** | The `Stepper` labels, plus rendering the progress view *inside* a step instead of as its own step — roughly 15 lines of conditional in the wizard. |

The three-step change is the cheapest item on this list to drop if the team
prefers the five-dot stepper: revert `Stepper` and everything else stands. D17 is
the lowest-value defect in §3 — steps 2 and 4 are machine phases where the
operator can only wait, so five dots imply five jobs when there are three.

The one thing that *does* need backend work is Q1 (per-row error codes), and that
is a copy-ownership question rather than a redesign dependency — the shim works
without it.

### 9.5 Not built, deliberately

- **Inline row editing** (Q2) — still recommended out of v1.
- **Import history** (Q3) — follow-up ticket.
- **Download actions** are wired as real buttons with no file behind them; the
  design repo has no failed-row sheet to generate.
