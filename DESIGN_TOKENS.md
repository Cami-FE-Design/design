# Design tokens

Source of truth for tokens is the Cami Figma file, page `foundation` at node `2001:36541`. This doc maps Figma variables to the CSS custom properties and Tailwind utilities used in code.

All tokens live in `app/globals.css`. Do not define tokens in component files or JS configs.

## How the layers stack

```
@radix-ui/colors          → raw 12-step scales (--sand-1..12, --amber-1..12, ...)
  ↓
:root and .dark           → semantic slots (--primary, --background, --muted, ...)
                             which reference either hex values or Radix scale steps
  ↓
@theme inline             → exposes semantic slots and scales as Tailwind utilities
                             (bg-primary, text-muted-foreground, bg-amber-9, ...)
```

## Color

### Semantic tokens (light mode, from Figma)

| Token                  | Hex        | Tailwind utility                           |
| ---------------------- | ---------- | ------------------------------------------ |
| background             | `#fdfdfc`  | `bg-background`                            |
| foreground             | `#21201c`  | `text-foreground`                          |
| primary                | `#21201c`  | `bg-primary`                               |
| primary-foreground     | `#fdfdfc`  | `text-primary-foreground`                  |
| secondary              | `#f1f0ef`  | `bg-secondary`                             |
| secondary-foreground   | `#21201c`  | `text-secondary-foreground`                |
| muted                  | `#e9e8e6`  | `bg-muted`                                 |
| muted-foreground       | `#8d8d86`  | `text-muted-foreground`                    |
| accent                 | `#f1f0ef`  | `bg-accent`                                |
| accent-foreground      | `#21201c`  | `text-accent-foreground`                   |
| destructive            | `#e54d2e`  | `bg-destructive`, `text-destructive`       |
| border                 | `#cfceca`  | `border-border`                            |
| input                  | `#cfceca`  | `border-input`                             |
| ring                   | `#8d8d86`  | `ring-ring`                                |
| card                   | `#ffffff`  | `bg-card`                                  |
| popover                | `#000000b2`| `bg-popover` (translucent black overlay)   |
| sidebar-foreground     | `#63635e`  | `text-sidebar-foreground`                  |

### Semantic tokens (dark mode)

Dark values are sourced from Radix Sand Dark (`sand-1` through `sand-12`) and Radix Red Dark for `destructive`. The Figma doc did not specify dark values, so this follows Radix conventions. Revisit once dark mode is designed explicitly.

### Accent scales

Each Radix palette is imported so all 12 steps are available as Tailwind utilities:

```
amber, blue, green, teal, red, pink
```

Use `bg-amber-9` for the canonical accent step, `bg-amber-3` for backgrounds, `bg-amber-11` for text on light backgrounds. See the [Radix Colors scale docs](https://www.radix-ui.com/colors/docs/palette-composition/scales) for the meaning of each step.

The `--chart-1` through `--chart-5` tokens default to `amber-9`, `blue-9`, `green-9`, `teal-9`, `pink-9` respectively, and can be overridden per chart.

### Neutral

Sand is the neutral family. `sand-1` is the lightest, `sand-12` the darkest. The semantic tokens above already reference Sand steps where appropriate, so you rarely need `bg-sand-*` directly. Use it for custom work that does not map to a semantic slot.

## Radius

Explicit pixel values from Figma, no calc chain.

| Token      | Value    | Tailwind utility |
| ---------- | -------- | ---------------- |
| sm         | `6px`    | `rounded-sm`     |
| md         | `8px`    | `rounded-md`     |
| lg         | `8px`    | `rounded-lg`     |
| xl         | `12px`   | `rounded-xl`     |
| 2xl        | `16px`   | `rounded-2xl`    |
| 3xl        | `20px`   | `rounded-3xl`    |
| 4xl        | `24px`   | `rounded-4xl`    |
| 5xl        | `28px`   | `rounded-5xl`    |
| full       | `9999px` | `rounded-full`   |

Note: `md` and `lg` are intentionally the same value per Figma spec. The radix-luma preset's button uses `rounded-4xl`, which we have kept at 24px. If Figma specifies a different button radius, override in `components/ui/button.tsx`.

## Typography

Font: **Manrope**, loaded via `next/font/google` with weights 400 and 500 only (enforced in `app/layout.tsx`).

Figma-specified type scale:

| Size  | Weight    | Line height |
| ----- | --------- | ----------- |
| 12px  | 400 / 500 | 16px        |
| 14px  | 400 / 500 | 20px        |
| 16px  | 400 / 500 | 24px        |

Use Tailwind's `text-xs` (12), `text-sm` (14), `text-base` (16). Line heights are the Tailwind defaults for these sizes.

Font family is bound to `--font-manrope`, exposed as `font-sans` via `@theme`. Use `font-sans` for everything. There is no separate heading font.

## Updating tokens

1. Change the value in Figma.
2. Update the corresponding custom property in `app/globals.css`.
3. Update this doc.
4. If the change affects more than one component, also check `components/ui/*` for hardcoded values that should be using the token.
