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

## Components (19 primitives)

In `components/ui/`, installed via shadcn and editable:

`badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `form`, `input`, `label`, `popover`, `radio-group`, `select`, `separator`, `sheet`, `sonner` (toast), `switch`, `tabs`, `textarea`, `tooltip`.

Each is project-owned code, not a vendored npm dependency. Edit freely.

Live preview of every primitive and its states at `/playground` when the dev server is running.

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

`AppShell` composes a sidebar (or mobile drawer) with a topbar and a content area. Use the `breakpoint` prop to switch between `desktop` and `mobile` layouts. The mobile branch wraps content in a 311px `Sheet` for the drawer.

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
- **Topbar**: 48px strip inside the panel with a `border-b border-black-a2` divider (`dark:border-white-a2`). Close button on the left, icon depends on the side the sheet docks from (chevrons-right for right, chevrons-left for left, etc).

## Folder layout

```
app/                 Next.js App Router entries
components/
  ui/                shadcn primitives (19 files)
  blocks/            composed product patterns
                       app-shell, app-sidebar, app-topbar
                       app-mobile-topbar, app-mobile-drawer
                       workspace-switcher, profile-menu, quick-add-menu
                       notification-sheet, theme-toggle, playground-showcase
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
