# PRO-85: Pet Parent + Pet Directory — Design Spec

**Linear**: [PRO-85](https://linear.app/getcami/issue/PRO-85/e2-7-pet-parent-pet-directory)
**Milestone**: E2 — Pet Business Flow · **Project**: v0 Web OS for a single branch
**Branch**: `michelle/pro-85-e2-7-pet-parent-pet-directory`
**Blocks**: PRO-84 (Walk-in + business-created bookings) · **Blocked by**: PRO-73 (Pet parent data model), PRO-74 (Pet data model)

---

## What ships

Operator-facing CRUD on **Pet Parents** (clients) and **Pets** within their branch. Two business modes gated per-partner in **cami hq → partners** by a `hasPets: boolean` feature flag:

| | With pets *(`hasPets: true`)* | Without pets *(`hasPets: false`)* |
|---|---|---|
| Examples | Vet, pet groomer, pet store, boarding | Hair / nail / barber salon, fitness, gym, spa, wellness |
| Entity model | Pet Parent + Pets | Client only |
| Label | "Pet Parent" / "Client" | "Client" |
| Pet section / column / rail | Shown | Hidden |
| Search scope | name, address, number, pet, email | name, email, phone |
| Service prefs label | Preferred groomer | Preferred stylist |

**One shared component set** with conditional Pet sections + a label provider. Not two route trees.

**Naming convention**: code uses `hasPets: boolean`. UI copy and design discussion say "with pets" / "without pets". Avoid "salon" as shorthand for the without-pets mode — it excludes fitness, spa, and other non-pet service categories.

## Acceptance (from PRO-85)

- Reception finds a Pet Parent in under 10s across 500 records
- Editing a Pet updates linked appointments
- Duplicate merge preserves history from both records

## Reference apps

- **Fresha** = UX pattern + baseline data shape (layout, toolbar, drawer, filter pattern, sort dropdown, takeover)
- **Moego** = pet-specific data layer (pets cell, pet rail, pet-specific filters, address+pet search, multi-owner concept)

## Permission tiers

| Role | Capabilities |
|---|---|
| **Reception** | Search, view, add (single-sheet), edit non-sensitive fields |
| **Owner** | All Reception + edit billing/sensitive fields, **merge duplicates**, **delete** clients/pets (soft, with audit) |

---

## Cross-cutting decisions

### Quick-create pattern
Operator create flows minimize required fields. **Client create needs only first name**; the Add sheet shows the full field list but only validates first name. No quick-vs-full split, no split-button. Receptionist can save with just first name; everything else can be filled later. Same rule for Add Pet (only Name required).

### Notification channels
**WhatsApp + Email only**. SMS dropped from v0 (UAE market behavior). Notifications matrix is 2 categories × 2 channels.

### Pet ownership: many-to-many
Pet ⇄ Client is **many-to-many** at the schema level from v0. A pet can have multiple owners (divorced co-owners, siblings, etc.). Pet detail's identity card shows an **Owners list** (multiple chips) with an "Add owner" affordance. Cascade-delete a pet only when this is its **last** owner.

### Avatar treatment
The `<Avatar>` primitive supports two empty-photo variants:
- **Initials** — calm, system-uniform; default for chips, topbars, mentions
- **Character** (Mixpanel-style) — line-art faces, deterministic hash for bg + face variant; default for the **client directory** to aid scanning

For pets: circle, with a **species icon fallback** (paw, cat face, etc.) on hashed pastel bg. Photo overrides when available.

For business / location: square with radius (existing rule).

Palette: cami brand scales (violet, green, sage, yellow, pink, gray). No warm peach.

### Recency thresholds
- **New** = within 14 days of first visit
- **Lapsed** = >90 days since last visit
- Tunable per partner

### Takeover / dialog behavior
- **Add / Edit** → `<FullScreenEditDialog>` takeover with **vertical sectioned sidenav** (`<SectionedSheetShell>`). Long-form mental model.
- **Detail** → **centered `<Dialog>`** modeled on the existing `<BusinessDetailDialog>` (~630px wide) with **horizontal underline tabs**. Quick-scan mental model. *(Revised 2026-05-10 — the original Fresha-style wide drawer plan was reversed in favor of consistency with the existing cami HQ admin detail surface.)*
- **Pet detail** *stacks* over Client detail (Dialog-on-Dialog); back-or-X returns to client.
- Tab overflow: less-used sections (Documents, Settings) under a **"More" dropdown** at the end of the tab strip.
- Filters drawer animation: easeOutCubic
- Filters drawer button radius: `rounded-full` (toolbar pill rhythm), even though general drawer-trigger rule is `rounded-xl` — this is an intentional override for *labeled toolbar buttons*

---

## Information architecture

```
Operator → Pet Parents directory
  ├── + Add  (single takeover, first name required)
  ├── Client row  →  Client detail Dialog (centered, ~630px, horizontal tabs)
  │     ├── Tabs (primary): Overview / Appointments / Sales / Client details / Pets (pet mode)
  │     ├── Tabs (More dropdown): Documents / Settings
  │     ├── Header actions (right-aligned): Book now (primary) · Actions ▾ (Owner: Merge, Delete) · Close
  │     ├── Edit (per-section affordance on each SectionCard opens FullScreenEditDialog deep-linked)
  │     └── Pets tab → Pet card → Pet detail Dialog (stacked over client Dialog)
  │           ├── Tabs: Overview / Family / Visit history / Pet details / Documents
  │           ├── Header actions: Book appointment · Actions ▾ (Owner: Delete pet) · Close
  │           └── Edit (per-section, opens stacked Pet edit takeover)
  └── Banner area (full-width, above title; reserved for system-level alerts)
```

---

## Flows

### 1. Directory

**Header**: title (`Clients` without-pets / `Clients & pets` with-pets) + count chip + subtitle with "Learn more" · Right side: Options dropdown + primary Add button.

**Toolbar (single row)**:
- Left: pill `<SearchInput>` + pill Filters button (`rounded-full`, opens drawer)
- Right: Sort dropdown

**Sort fields**: First name (A-Z / Z-A) · Last name (A-Z / Z-A) · Gender (A-Z / Z-A) · Created at (oldest / newest) · Total paid · Phone number

**Filters drawer** (right-anchored sheet):
- Header: title + X close
- Body: accordion sections
- Sticky footer: Clear filters + Apply (primary)

**Filter dimensions**:
- Both modes: client group, gender, status (Active / Inactive / Lapsed / Block from message / Block from online booking), client type (New / Recurring / Waitlist / Prospects), tags
- Pet mode adds: species, breed, last visit

**Search scope** (placeholder text):
- Without pets: `name, email, phone`
- Pet: `name, address, number, pet, email`

**System banner area**: full-width above page title for system-level alerts. Reserved; not used in v0 (merge has no bulk banner).

**Row format**:
- `[checkbox] [avatar] [name + recency badges] [pets-cell pet-mode] [phone + WhatsApp icon] [sales] [created at]`
- Avatar: circle, character variant (per Avatar treatment above)
- Recency badges inline with name: `New` ≤14d / `4 weeks` / `Lapsed` >90d
- Pets cell (pet mode): pet name **chips**, `+N` overflow
- Phone has a WhatsApp quick-action icon adjacent
- Empty values rendered as `–`

**Bulk select**: row checkbox + header checkbox.

**Add CTA behavior**: single primary button → opens FullScreenEditDialog (Add sheet, see Flow 2).

**Pagination**: page numbers + prev/next + page size at bottom.

**Options dropdown**: Import / Merge / Export → (Excel · CSV).

**Out of v0**: client segments, Reviews column, customize columns modal, inline filter chips alongside the drawer, latest activities feed, directory-level duplicate detection banner.

### 2. Add Client (single-sheet takeover)

**Surface**: `<FullScreenEditDialog>` mirroring `<AddTeamMemberDialog>` structure (left sectioned sidenav + right scrolling content + sticky header with Close + Save).

**Sections**:

| Section | Fields |
|---|---|
| **Profile** | Photo (avatar slot with edit pencil overlay) · First name * · Last name · Email · Phone (country code + national split) · Birthday (day+month + separate optional Year) · Gender |
| **Additional info** | Source · Country · Tags |
| **Addresses** | Multiple addresses, each with Primary tag and 3-dot edit/delete. UAE country → State field switches to "Emirate" with 7-emirate options |
| **Contacts** | Single section with type tag per entry (Emergency / Additional / Pickup-auth pet-only). Repeatable. |
| **Pets** *(pet mode only)* | List of linked pets with name + species + breed. "+ Add pet" opens stacked Pet edit sheet |
| **Settings** | Notifications matrix (WhatsApp + Email × Service-related / Marketing) · Payment policy override · Service preferences > Preferred staff |

**Required**: First name only. All others optional.

**Field treatment**:
- Cami filled inputs (`bg-input rounded-2xl h-12`), not Fresha's outlined style — system consistency over reference fidelity
- `<SelectTrigger>` uses `triggerOverride` to match Input's `h-12`
- No Pronouns field (decided, not in cami v0)

### 3. Client Detail (drawer)

**Surface**: centered `<Dialog>` (~630px wide) modeled on the existing `<BusinessDetailDialog>`. Existing Dialog responsive behavior.

**Layout**: single column with stacked `<SectionCard>` panels for the active tab.

**Header** (sticky-feel, bg-muted/40):
- Avatar (compact, character variant) + Name (22px semibold) + meta line (e.g. phone, recency badge)
- Right-aligned: **Book now** (primary, pill) · **Actions** dropdown (Owner-only items: Merge profiles, Delete client) · Close X

**Section nav** (under header): horizontal `<Tabs variant="underline">` with px-9 padding. **Primary tabs**: Overview · Appointments · Sales · Client details · Pets *(pet mode only)*. **More dropdown** (end of tab strip): Documents · Settings.

**Sections (v0)**:

| Section | Content |
|---|---|
| **Overview** | 4 static KPI cards with info icons: Upcoming · Total appointments · Total sales · No-shows. Below: upcoming appointment widget · **Pets card** *(pet mode only — replaces Moego's right-rail since the centered dialog has no rail)* · notes (top-level, with inline-add) |
| **Appointments** | Status pills + More dropdown (Booked / Confirmed primary; Arrived / Started / Completed / Canceled / No-show in More) · timeline with calendar dots · single chronological list · Checkout button per row |
| **Sales** *(= invoicing)* | All / Paid / Drafts / Unpaid / More (Part paid / Refunded / Voided) · table layout · Sell CTA on header |
| **Client details** | Profile · Additional info · Addresses (multiple, Primary tag, 3-dot edit) · Contacts (single section with type tags) · Notifications display · Payment policy (per-client override) |
| **Pets** *(pet mode)* | Stacked card list. Each card: avatar + name+breed + weight+coat + service code badges. Add Pet button. |
| **Documents** | Single view, stacked: Notes archive (full) + Files (upload / list / download — no preview in v0) |
| **Settings** | Notifications matrix · Block client toggle · Service preferences > Preferred staff |

**Edit pattern**: per-section Edit affordance opens the FullScreenEditDialog (Add sheet) deep-linked to the relevant section.

### 4. Pet Detail (stacked Dialog)

**Surface**: same `<Dialog>` shell, **stacks** over the client Dialog. Back-or-X returns to client.

**Header**:
- Avatar (photo or species icon fallback, circle, compact) + Pet name + meta line
- **Owners**: small chip row (`<LinkedEntityChip>` per owner per multi-owner model) + "Add owner" affordance — sits below the meta line OR alongside it depending on space
- Right-aligned: **Book appointment** (primary, pill) · **Actions** dropdown (Owner: Delete pet) · Close X

**Sections**:

| Section | Content |
|---|---|
| **Overview** | KPIs: Last visit · Total visits · Upcoming visits (3 static cards). Upcoming appointment widget + pet-specific notes (separate from client notes) |
| **Family** | Manage owners (multi-owner model). List of owners with avatar + name + contact preview + primary indicator + remove per row + Add family. Header chip row mirrors a compact view; this tab is the management surface. |
| **Visit history** | Status pills + timeline (same pattern as client Appointments) — pet-scoped |
| **Pet details** | Photo · species · breed · DOB · weight · medical notes · preferred staff |
| **Documents** | Notes (pet-specific) + Files. Photo history deferred to v1 |

**Add Pet entry**: single path — from client detail → Pets section → "Add pet" button. Opens stacked Pet edit sheet (FullScreenEditDialog with pet sections).

### 5. Edit (deep-linked single sheet)

Per-section Edit affordances on Detail (or Pet detail) open the relevant FullScreenEditDialog Add sheet, **pre-populated**, scrolled to the corresponding section. Save returns to the detail drawer.

### 6. Delete (Owner only)

**Surface**: simple confirm dialog (no type-to-confirm, no required reason).

**Cascade behavior** (multi-owner aware):
- Pets soft-deleted only when this is their **last** owner
- Otherwise the relationship is removed; pet stays active under remaining owners
- Confirmation dialog calls out which pets will detach vs archive

**Audit**: who + when captured automatically.

**Visibility of soft-deleted records**: hidden from directory by default. No "show archived" filter in v0; restore via admin tools.

**Pet delete**: same pattern — Owner only, simple confirm, soft delete with audit.

### 7. Merge duplicates (Owner only)

**Single entry point**: Actions dropdown on client detail → "Merge profiles". *(No directory banner; no Options-menu bulk merge in v0.)*

**Surface**: full takeover.

**Body**:
- Header copy explains what merge does + permanent-action language
- "Suggested matches" section: clients with same phone OR same email as the current client; checkboxes unchecked by default; **current client locked-in** (greyed checkbox, can't deselect)
- "+ Add another client to merge" → opens search modal (search by name / phone / email)
- "Manually added" subsection separates auto-suggested from user-picked
- Bottom: Cancel + Merge Selected

**Final confirmation modal**:
- "Client details" picker — dropdown asks which client's name wins post-merge
- Auto-merge logic for everything else: longest non-empty for scalars; **union** of multi-value fields (addresses, contacts, tags, pets, appointments, sales, notes); notes/history preserved with original timestamps + authors
- Copy: "This action is permanent and cannot be undone."
- Cancel + Merge & save (primary)

**Pet handling**: pet associations unioned and deduplicated. A pet shared between merged clients becomes a single linked pet on the result (multi-owner model handles this elegantly).

**Reversibility**: permanent. Source records soft-deleted with audit.

**Result**: toast "Clients merged" → drawer reloads on the merged record.

---

## Component inventory

### Reuse (no changes)

| Component | Use |
|---|---|
| [`<Table>`](../../components/ui/table.tsx), [`<TableToolbar>`](../../components/blocks/table-toolbar.tsx) | Directory list shell |
| [`<SearchInput>`](../../components/ui/search-input.tsx) | Pill search |
| [`<Sheet>`](../../components/ui/sheet.tsx) | Filters drawer + Detail drawer |
| [`<DropdownMenu>`](../../components/ui/dropdown-menu.tsx) | Sort, Options, Actions |
| [`<Checkbox>`](../../components/ui/checkbox.tsx) | Row select |
| [`<Accordion>`](../../components/ui/accordion.tsx) | Filter sections in drawer |
| [`<Dialog>`](../../components/ui/dialog.tsx) | Confirmation modals |
| `<Tabs>`, `<Card>`, `<Badge>`, `<Tooltip>`, `<Separator>`, Sonner toast | As-is |
| [`<FullScreenEditDialog>`](../../components/blocks/full-screen-edit-dialog.tsx) | Add / Edit / Merge takeovers |

### Extend

| Component | Why |
|---|---|
| [`<TableToolbar>`](../../components/blocks/table-toolbar.tsx) | Add a directory variant: search + filters-button left, sort dropdown right |
| [`<DropdownMenu>`](../../components/ui/dropdown-menu.tsx) | Confirm sectioned items support (Export → Excel / CSV) |
| [`<Sheet>`](../../components/ui/sheet.tsx) | Add **stacking** behavior (drawer-on-drawer for Pet detail) |

### New build

| Component | Purpose |
|---|---|
| `<Avatar>` | Photo / character / initials / species fallback. Shape variants (circle, square+radius). Sizes sm/md/lg/xl. |
| `<PhoneInput>` | Country code split + national number |
| `<PartialDateInput>` | Day + month + optional separate year |
| `<DirectoryHeader>` | Title + count chip + subtitle + Options + primary CTA |
| `<DirectoryToolbar>` | Search + Filters button + Sort dropdown |
| `<FiltersDrawer>` | Sheet wrapper with sectioned body + sticky Clear/Apply footer |
| `<ClientDetailDialog>` | Centered Dialog modeled on `<BusinessDetailDialog>` — sticky header (avatar + name + meta + Book now + Actions + Close) + horizontal underline tabs + scrollable section content. ~630px wide. |
| `<PetDetailDialog>` | Same shell as ClientDetailDialog, stacks on top of it; pet-specific tabs |
| `<SectionedSheetShell>` | Shipped — vertical sidenav for Add/Edit takeovers (`<FullScreenEditDialog>`) |
| `<DetailDialogHeader>` | Avatar + name + meta line + Owners chips (pet) + right-aligned actions cluster + close. Reusable between Client and Pet detail. |
| `<TabsMore>` | Dropdown at the end of the tab strip for less-used sections (Documents, Settings) when space is tight |
| `<SectionCard>` | Card with header (title + Edit/action affordance) + body. Already used inline by `<BusinessDetailDialog>`; extract as a shared block. |
| `<KpiCard>`, `<KpiGrid>` | Static metric tiles + info icon |
| `<TimelineRow>` | Calendar dot + connector + appointment card |
| `<NoteRow>` + inline-add-note | Used in Overview + Documents > Notes |
| `<AddressRow>` | Line text + Primary chip + 3-dot menu |
| `<ContactRow>` | Type tag + name + phone + edit/delete |
| `<RecencyBadge>` | New / 4 weeks / Lapsed semantic badge |
| `<LinkedEntityChip>` | Avatar + name + chevron, navigation chip (Owners list, etc.) |
| `<SystemBanner>` | Tone variants for system-level alerts |
| `<Pagination>` | Page numbers + prev/next + page size |
| `<EmptyState>` | Zero-clients + zero-search-results |
| `<TableSkeleton>` | Loading skeleton matching column config |
| `<DeleteClientDialog>` | Simple confirm + cascade preview |
| `<DeletePetDialog>` | Simple confirm |
| `<MergeProfilesDialog>` | Auto-suggestions + manually-added subsection + Cancel/Merge |
| `<ClientSearchModal>` | Search by name/phone/email; reusable |
| `<MergeConfirmationModal>` | Name-winner dropdown + permanent-action language |

---

## Out of v0 (deferred)

- Client segments (Fresha's user-managed groups) → v1
- Reviews column / Reviews section → not shipping in v1
- Vaccine warnings (pet) → v1
- Photo history (pet) → v1
- Consent records (pet, schema-ready) → v0.4
- Items section, Wallet, Loyalty (Fresha sections) → not in v1
- History log section → omitted v0
- Customize columns modal → v1
- Inline filter chips alongside drawer → v1 if drawer feels heavy
- Latest activities feed → omitted v0
- Service preferences: frequency / days / time window → v1
- Auto-tip preference → v1
- File preview (PDF, image) → v1
- "Show archived" filter for soft-deleted records → v1
- Merge undo within 30 days → v1
- Directory-level duplicate detection banner → v1 if data hygiene becomes an issue
- Pronouns field → not in cami v0
- SMS notification channel → not in v0 (revisit non-UAE markets)

---

## Downstream callouts

- **Pet ownership many-to-many** affects PRO-74 (Pet data model). If scaffolded as one-to-many, flag the change before further migrations.
- **WhatsApp Business API** required infra for the Notifications matrix. Out of design scope.
- **Booking client selection on multi-owner pet**: when a pet has multiple owners, the booking flow needs to pick a billing client. Out of PRO-85 scope; flag to PRO-84 (Walk-in + business-created bookings).
- **Notification channel schema**: keep 3-channel forward-compat in the data model; v0 UI just hides SMS.
- **Memory rule for pre-commit (cami-design)**: confirm components → update playground showcase → update screens index → then commit.
