# Cami design system

The design system layer of the Cami engineering repo. One-page summary. For depth, follow the links.

## Stack at a glance

| Piece | What |
| ----- | ---- |
| Framework | Next.js 16 App Router, React 19, TypeScript strict |
| Styling | Tailwind v4 with CSS-first `@theme` |
| Component library | shadcn/ui v4 (radix-luma preset), primitives copied into `components/ui/` |
| Primitive APIs | `radix-ui` meta package |
| Colors | Radix Sand, Tomato, Blue, Pink, Black Alpha, White Alpha + 6 Cami custom palettes |
| Type | Manrope via `next/font/google`, weights 200 to 800 |
| Icons | Lucide |
| Dark mode | `next-themes`, `.dark` class on html |
| Lint and format | Biome |

Full rationale in [ARCHITECTURE.md](./ARCHITECTURE.md).

## Source of truth

Figma file: **Cami**, page **foundation**, node `2001:36541`.

When a design decision disagrees with code, Figma wins. When a code change adds a new token or variant, update the Figma first, then reflect in `app/globals.css`.

## Tokens

Four layers, stacked:

1. **Primitive palettes**: Radix scales (`--sand-1..12`, `--tomato-1..12`, `--blue-1..12`, `--pink-1..12`, `--black-a1..12`, `--white-a1..12`) and Cami scales (`--cami-violet-1..12` and 5 more).
2. **Semantic slots**: `--primary`, `--background`, `--muted`, `--border`, `--destructive`, `--sidebar-*`, `--chart-1..5`. Light mode and dark mode values.
3. **`@theme inline`**: exposes everything as Tailwind utilities (`bg-primary`, `bg-sand-9`, `bg-cami-violet-9`).
4. **Tailwind v4 defaults**: spacing, sizing, radius, opacity, stroke-width, typography scale. Not overridden except for `--radius-sm: 6px` and `--radius-md: 8px`.

Which palette to use when:

- Semantic slot first (`bg-primary`).
- Cami scales for brand accents (`bg-cami-violet-9`).
- Radix scales for supporting accents (`bg-tomato-9`).
- Tailwind numeric colors (`bg-blue-500`) only for ad hoc.

Numbering: **1 to 12 is Radix or Cami. 50 to 950 is Tailwind.**

Full token tables in [DESIGN_TOKENS.md](./DESIGN_TOKENS.md).

## Components (24 primitives)

In `components/ui/`, installed via shadcn and editable:

`badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `hover-card`, `input`, `label`, `otp-input`, `password-input`, `popover`, `radio-group`, `search-input`, `select`, `separator`, `sheet`, `sonner` (toast), `switch`, `table`, `tabs`, `textarea`, `tooltip`.

Each is project-owned code, not a vendored npm dependency. Edit freely.

Live preview of every primitive and its states at `/playground` when the dev server is running.

The primitives that started life on a specific page but are reusable enough to live in `ui/`:

- `password-input` — wraps `input` with an Eye/EyeOff toggle on the right.
- `otp-input` — fixed-length code box (default 6) with auto-advance, paste-fill, arrow-key navigation, and `disabled` / `invalid` states for in-flight verification.
- `search-input` — pill-shaped input with a leading `SearchIcon` and a `CircleX` clear button that appears once the field has a value. Hides the native `[type=search]` clear button.
- `table` — `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`. Header band uses `border-y border-border/60` (top + bottom), rows use `border-b border-border/60` with `hover:bg-muted/50` and `data-[state=selected]:bg-muted`.

## Patterns

### Propagating state to paired components

Some components visually react to sibling state. The canonical example is Label turning muted when its paired Input is disabled, or turning destructive red when the Input has a validation error. A Label does not know its sibling's state without help.

**If you are using shadcn Form** (`Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`): state propagates automatically via react-hook-form context. Nothing to do.

**If you are using raw `Label + Input` pairs**: wrap them in a container with the `group` class and a `data-*` attribute that reflects the state. The Label reads the wrapper's data attribute via `group-data-*` utilities.

```tsx
// Disabled field
<div className="group grid gap-2" data-disabled="true">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" disabled />
</div>

// Error field
<div className="group grid gap-2" data-error="true">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" aria-invalid defaultValue="not-an-email" />
  <p className="text-xs text-destructive">Enter a valid email.</p>
</div>
```

The Label component handles these wrapper signals:

| Wrapper attribute | Label result |
| ----------------- | ------------ |
| `data-disabled="true"` on `.group` parent | `text-muted-foreground`, not-allowed cursor |
| `data-error="true"` on `.group` parent | `text-destructive` |

The Label also responds to its own attributes if you prefer not to use a wrapper:

| Attribute on Label itself | Label result |
| ------------------------- | ------------ |
| `aria-disabled` | `text-muted-foreground` |
| `aria-invalid` | `text-destructive` |
| `data-disabled="true"` | `text-muted-foreground` |
| `data-error="true"` | `text-destructive` |

Prefer the wrapper pattern for field groups. It is declarative and keeps the label's state tied to the field's state without duplicating attributes.

### Form input styling

Inputs and textareas use the same visual language:

- Filled `bg-input` (sand-3) surface, no visible border in default state.
- `rounded-2xl` (16px) corners.
- Focus state is a 2px inset ring in `--foreground`, not an outer ring or border swap. Avoids layout shift on focus.
- Error state is a 2px inset `--destructive` ring, applied via `aria-invalid` on the input. Paired label turns `text-destructive` via the `data-error="true"` wrapper pattern described above.
- Disabled state uses `opacity-50` plus a `data-disabled="true"` wrapper so the label can also go muted.

### Application shell

`AppShell` composes a sidebar (or mobile drawer) with a topbar and a content area. By default it is responsive: below `lg` (1024px) it renders the mobile shell with a 311px `Sheet` drawer triggered by the hamburger; at `lg` and above it renders the desktop shell with the persistent sidebar. iPad portrait (768px) gets the mobile shell; iPad landscape (1024px) gets the desktop shell. The optional `breakpoint` prop (`"mobile" | "desktop"`) is an escape hatch that forces one variant, used for isolated previews.

Stacking inside the shell uses two z-layers so the content's upward shadow does not paint over the topbar:

- Topbar wrapper: `relative z-[2]`.
- Content wrapper: `relative z-[1]`, with `shadow-[-22px_-44px_88px_0_rgba(221,221,221,0.87)]` (the upward "ambient" shadow).

The topbar nav data (`topMenu`, `bottomMenu`) lives in `lib/app-menu.ts`. Edit there, not in the components.

#### Icon button shape rule

Icon buttons in the topbar belong to one of two visual systems:

| Family | Shape | Examples |
| ------ | ----- | -------- |
| Menu / drawer controls | `rounded-xl` | mobile hamburger, sidebar items |
| Quick actions | `rounded-full` | plus, search, bell, avatar |

The hamburger opens the drawer, so it inherits the drawer's language, not the right-side icons'. Pick the family by what the control triggers, not by where it sits on the bar.

#### Menu and control text weight

Menu items, dropdown items, sidebar items, and pill-button labels all use `font-medium` (500). Reserve `font-normal` (400) for muted metadata under a primary line (joined date under workspace name, email under user name, demo placeholder text).

### Floating menus

Three patterns to know:

- `<DropdownMenu>` from `components/ui/dropdown-menu.tsx`. Auto-sizes inline `<svg>` to `size-4` and applies `gap-2.5 px-3 py-2 text-sm font-medium` to items. Use raw `<DropdownMenuItem>` (no className override) to inherit the standard spacing — applies to `WorkspaceSwitcher`, `ProfileMenu`, `QuickAddMenu`.
- `<HoverCard>` is used for collapsed-sidebar submenu popovers. When you put `<Button>` items inside one, match the dropdown weight (`font-medium`).
- `align="center"` is the default for the topbar Quick Add menu so the dropdown stays centered under the trigger and avoids viewport edges on mobile. Override per-instance only when needed.

### Overlays and floating panels

Sheet and Dialog share one overlay aesthetic:

- **Backdrop**: flat `bg-sand-7/60`, no blur. The backdrop color comes from the neutral scale so it works in both light and dark modes.
- **Panel**: floating with 8px margin from the viewport edge (not flush), `rounded-2xl`, frosted glass via `bg-white-a11` in light mode and `dark:bg-sand-2/90` in dark mode, with `backdrop-blur-[8px]`.
- **Shadow**: the `shadow-overlay` token (5 outer layers plus an inset bottom shadow). Do not reinvent the shadow stack per component.
- **Topbar**: 48px strip inside the panel, only rendered when `showCloseButton` is `true`. Close button on the left, icon depends on the side the sheet docks from (chevrons-right for right, chevrons-left for left, etc).

#### Sheet `inline` mode

`SheetContent` accepts `inline` (default `false`). When `true`, it skips the body Portal and uses `absolute` positioning sized in `%` (instead of portaling + `fixed` sized in `vw`/`vh`). The sheet then scopes to the nearest positioned ancestor, useful when the sheet should be contained inside a card or device frame instead of the viewport. The mobile `AppShell` uses this so the drawer is scoped to the shell wrapper; in responsive mode the wrapper IS the viewport, so it still behaves like a full-screen sheet.

### Tables

Use the `Table` primitives plus the `TableToolbar` block.

- **Toolbar above the table**: `<TableToolbar tabs={…} actions={…} />` — flex `justify-between` row with tabs on the left, search + filter + CTA on the right.
- **Tabs**: `TabsList variant="ghost"` for the Notion-style transparent list with each tab as a pill. Active tab gets a `bg-muted` fill, count appended in `text-sm font-normal text-muted-foreground` so it sits on the same baseline as the label.
- **Search field**: `<SearchInput>` is the canonical pattern, sized `h-8 w-56` to match the toolbar height.
- **Filter button**: `<Button variant="outline" className="size-8 rounded-full"><SlidersHorizontalIcon /></Button>` — outlined circle, same height as the search and CTA.
- **Header row**: lowercase + `text-sm font-normal text-muted-foreground`, no uppercase tracking. `h-9` for a tight band. Top + bottom border (`border-y`), softened to `border-border/60`.
- **Bulk select**: when adding row checkboxes, the leftmost column is `w-10 pr-0`; the header gets a `Checkbox` that toggles the visible page's IDs, the row gets one bound to a `Set<string>` in parent state.

### Tabs variants

`TabsList` exposes four variants. Pick the one that matches the surface, not by personal preference.

| Variant | Visual | Use when |
| ------- | ------ | -------- |
| `default` | Filled segmented pill, `bg-muted` panel with white-on-active triggers. | Top-level page tabs sitting alone on a page. |
| `ghost` | Transparent list, each tab is a pill that gains `bg-muted` on active. | Filter tabs above a table (where they sit alongside search + CTAs). |
| `line` | Tab text only; active tab gets a 2px underline floating 5px below the trigger. | Tabs above whitespace where the underline doesn't need to mark a surface boundary. |
| `underline` | Tab text only; active tab gets a 2px underline at the tab's baseline (`bottom: 0`). Defaults to `gap-6` between triggers. | Detail dialogs and similar surfaces where the tab row sits at the seam between a tinted header zone and a white content zone — the underline becomes the seam marker. |

The `underline` variant is the right choice for the `BusinessDetailDialog` pattern below. Don't reach for it elsewhere unless you have the same two-tone surface.

### Detail dialogs (entity settings modal)

The Notion teamspace settings is the reference. `BusinessDetailDialog` in `components/blocks/` is the implementation. Use this pattern when an entity row in a table needs a fast-edit surface that doesn't deserve a full route.

- **Frame**: 630px wide, fixed `h-[640px]` capped by `max-h-[calc(100vh-100px)]`, `rounded-2xl`.
- **Two surfaces**: header + tabs row sit on `bg-muted/40`; content scroller sits on the default white. The `underline` tab variant turns the gray→white seam into the active-tab indicator.
- **Header padding**: `pt-9 px-9 pb-5` (34/36/20 to match Notion). Avatar `size-12`, title `text-[22px] font-semibold`, subtitle is just the entity's stable identifier (URL slug here). Joined date and other metadata move into the Activity tab, not the header.
- **Close button**: `<Button variant="ghost" size="icon-sm" radius="full">` in the header's top-right. Always.
- **Tab order**: General · entity-specific (Team) · Activity · Manage. Manage is always last and contains lifecycle actions.
- **Reason banner**: when the entity is in a destructive state (suspended/archived), render a `bg-tomato-9` strip directly under the tabs. Icon is a small white circle (`size-5 rounded-full bg-white`) containing an `InfoIcon` in tomato-9. Title in white, secondary text in `text-white/80`. Action button stays on the next line, indented to align with the body text. The strip uses the same `px-9` as the rest of the modal content.
- **Manage section**: heading `Manage Business Account` (or the entity equivalent), then rows. Each row has a title, a description below it explaining what the action does, and the action button on the right. State-aware: when suspended, the first row becomes Un-suspend; when archived, both rows collapse into Restore.
- **URL params**: open the dialog by setting `?<entity>=<slug>` on the parent route so the surface is shareable in Slack and existing direct-page URLs can redirect to it.

### Inline state-edit dropdown

`StateDropdown` (in `components/blocks/`) is a ghost-button trigger that opens a list of mutually exclusive states. Trigger reads the current state's label in a state-tinted color, with a chevron. Items have a colored dot on the left and a checkmark on the current value.

Use for any controlled state field that ops needs to edit at a glance (table rows, the AccessSection top row inside a detail dialog). Map the colors via `STATE_OPTIONS`, `STATE_DOT`, `STATE_TRIGGER_TEXT` exports from the data layer so the trigger and dot stay in sync.

### Banners and callouts

Three treatments for in-page messaging, picked by severity:

- **Filled tomato strip**: the destructive-state banner (`ReasonBanner` in the modal). `bg-tomato-9` with white text, white-circle icon containing a tomato-colored InfoIcon, action button on a second line. Reserved for "this entity is in a problem state right now" surfaces.
- **Tinted tomato card** (`bg-tomato-3 p-4 rounded-2xl`): the inline confirmation warning shown inside destructive dialogs (Archive). Use when the body of a Dialog needs to flag irreversibility before the user commits. Icon is wrapped in a `bg-sand-3` neutral chip — the destructive context comes from the surrounding tomato card, not from the icon itself.
- **Neutral sand chip**: the icon at the top of a confirmation dialog (`bg-sand-3 text-sand-11` circle). Use for "stop and read" callouts that aren't destructive — e.g. impersonation, password reset, slug change. Keeps the dialog feeling clinical instead of alarming.

### Destructive Button

`Button variant="destructive"` is **solid tomato** (`bg-destructive` / `text-destructive-foreground`), not the tinted soft treatment. Use it as the primary CTA in confirmation dialogs (Archive, hard-delete) and as the destructive action in lifecycle managers. For lower-severity destructive surfaces (warning indicators, delete badges), keep `Badge variant="destructive"` which still uses the tinted style.

### Animated link

The `.link` utility class in `app/globals.css` produces an underline that draws in from the left on hover and retracts toward the right on un-hover. Width follows the text, color follows `currentColor`. Apply with `className="link"` on any `<a>` or `<Link>` for secondary nav like "Back to sign in" or "Forgot your password?".

```tsx
<Link href="/sign-in" className="link self-center text-sm font-medium text-muted-foreground">
  Back to sign in
</Link>
```

### Auth pages

All `/sign-in/*` routes render through `AuthLayout` + `AuthCard` from `components/blocks/`.

- **Layout**: `<AuthLayout splitPane={true|false}>`. Split-pane shows the form pane on the left (max-w 640px) and `AuthMarketingPanel` on the right. `splitPane={false}` hides the marketing panel and widens the form pane to the combined width (max-w 1292px) — used for verify, where the experience should feel focused.
- **Card**: `<AuthCard title description? icon? backHref? backLabel?>`. When `backHref` is set, an xl ghost icon button with `ArrowLeftIcon` and a tooltip is absolutely positioned at the top-left of the pane. The pane is `relative` already so the corner buttons (back-left, cancel-right) anchor to it.
- **Sign-in flow**: email (`/sign-in`) → password (`/sign-in/password`) → optional 2FA verify (`/sign-in/verify`). Sibling routes for password reset (`/sign-in/forgot-password`, `/sign-in/reset-password`), first-login (`/sign-in/welcome`), and invite acceptance (`/sign-in/accept-invite`) share the same layout and card.
- **OTP verify** (`/sign-in/verify`): auto-submits the moment the code is the configured length. Inputs lock + dim during verifying, shake + clear + return-focus on error, swap to a check on success. Uses `splitPane={false}`.

## Folder layout

```
app/                 Next.js App Router entries
                       (auth)/sign-in/{,password,verify,forgot-password,reset-password,welcome,accept-invite}
                       admin/businesses/new
                       settings/team
components/
  ui/                shadcn primitives (24 files)
  blocks/            composed product patterns
                       app-shell, app-sidebar, app-topbar
                       app-mobile-topbar, app-mobile-drawer
                       auth-layout, auth-card, auth-marketing-panel, social-icons
                       workspace-switcher, profile-menu, quick-add-menu
                       notification-sheet, table-toolbar
                       theme-toggle, playground-showcase
  theme-provider.tsx ThemeProvider wrapper for next-themes
hooks/               empty, add shared hooks here
lib/                 utils.ts (cn helper), app-menu.ts (sidebar nav data)
styles/              empty, add CSS splits here if needed
```

## Scripts

`pnpm dev`, `pnpm build`, `pnpm check` (Biome), `pnpm typecheck`, `pnpm test`. Full list in [README.md](./README.md).

## Where to go

| I want to | File |
| --------- | ---- |
| Know how to run the project | [README.md](./README.md) |
| Understand why each piece of the stack is here | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| Find the exact hex for a semantic slot | [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) |
| See a component in every state | `pnpm dev`, then `/playground` |
| Open a PR | [CONTRIBUTING.md](./CONTRIBUTING.md) |
| Edit a component's visuals | `components/ui/<name>.tsx` |
| Change a token value | `app/globals.css`, then update DESIGN_TOKENS.md |

## What is not in the system yet

Deliberate omissions. Add only when a concrete need arises.

- Storybook (playground covers current needs).
- E2E tests.
- Internationalization.
- Analytics or error tracking.
- Additional Radix color scales beyond the six currently imported.
- Dark variants for the Cami custom palettes.
- A typography component or heading scale wrappers.

## Current status

- 2 commits on `main`, local only.
- 0 open issues, 0 PRs (no remote yet).
- Dark mode scaffolded but not reviewed by design. Uses Radix Sand dark throughout.
