# Design tokens

Source of truth is the Cami Figma file, page `foundation` at node `2001:36541`. All tokens live in `app/globals.css`. Do not define tokens in component files or JS configs.

## How the layers stack

```
@radix-ui/colors           → raw 12-step scales (--sand-1..12, --tomato-1..12, --blue-1..12,
                             --pink-1..12, --black-a1..12, --white-a1..12)
Cami custom scales         → --cami-violet-1..12, --cami-green-1..12, --cami-sage-1..12,
                             --cami-yellow-1..12, --cami-pink-1..12, --cami-gray-1..12
Neutral gray scale         → --neutral-gray-18, -25, -35, -50, -62, -72, -80, -86, -90, -94, -97, -99
                             (OKLCH L% numbering, light and dark modes)
  ↓
:root and .dark            → semantic slots (--primary, --background, --muted, ...)
                             reference Radix scale steps
  ↓
@theme inline              → exposes semantic slots and scales as Tailwind utilities
                             (bg-primary, text-muted-foreground, bg-sand-9, bg-cami-violet-9,
                              bg-neutral-gray-50, ...)
```

## Which palette to use when

Decision tree for choosing a color in code:

1. **Is there a semantic slot for it?** Use `bg-primary`, `text-muted-foreground`, `border-border`, `bg-destructive`, etc. These are the default answer for any "standard" UI surface.
2. **Is it a Cami brand accent?** Use the cami scales: `bg-cami-violet-9`, `text-cami-pink-11`, etc. Reach for these when you want brand identity (buttons with a specific personality, badges, highlights).
3. **Is it a supporting accent that is not brand but needs color?** Use the imported Radix scales: `bg-tomato-9` (warm alert, different from destructive), `bg-blue-9` (informational), `bg-pink-8` (avatar rings and similar decorative details).
4. **Do you need a pure, untinted neutral (no violet cast) that flips with dark mode?** Use the neutral-gray scale: `bg-neutral-gray-99`, `text-neutral-gray-18`, etc. This is distinct from `cami-gray` (which is warm, violet-tinted) and distinct from Radix `sand` (which is warm, beige-tinted).
5. **Ad-hoc utility color with no semantic meaning?** Tailwind v4 defaults are also available: `bg-red-500`, `bg-blue-500`, etc. Use sparingly, ideally never in components that ship to production.

Numbering convention: **1 through 12 is Radix or Cami, 50 through 950 is Tailwind, and OKLCH L% (18, 25, 35, 50, 62, 72, 80, 86, 90, 94, 97, 99) is neutral-gray**. A `bg-blue-9`, a `bg-blue-500`, and a `bg-neutral-gray-50` are three unrelated colors. Keep them straight.

## Color, semantic slots

Light mode resolves to Radix Sand, Tomato, Blue, and Black Alpha. Dark mode resolves to the same Radix scales via their dark variants.

| Token                    | Light mode                 | Dark mode          | Tailwind utility                |
| ------------------------ | -------------------------- | ------------------ | ------------------------------- |
| background               | `sand-1` (#fdfdfc)         | `sand-1` dark      | `bg-background`                 |
| foreground               | `sand-12` (#21201c)        | `sand-12` dark     | `text-foreground`               |
| card                     | `#ffffff`                  | `sand-2` dark      | `bg-card`                       |
| card-foreground          | `sand-12`                  | `sand-12` dark     | `text-card-foreground`          |
| popover                  | `black-a9` (rgba 0,0,0,.7) | `sand-3` dark      | `bg-popover`                    |
| popover-foreground       | `sand-1`                   | `sand-12` dark     | `text-popover-foreground`       |
| primary                  | `sand-12`                  | `sand-12` dark     | `bg-primary`                    |
| primary-foreground       | `sand-1`                   | `sand-1` dark      | `text-primary-foreground`       |
| secondary                | `sand-3` (#f1f0ef)         | `sand-3` dark      | `bg-secondary`                  |
| secondary-foreground     | `sand-12`                  | `sand-12` dark     | `text-secondary-foreground`     |
| muted                    | `sand-4` (#e9e8e6)         | `sand-3` dark      | `bg-muted`                      |
| muted-foreground         | `sand-9` (#8d8d86)         | `sand-9` dark      | `text-muted-foreground`         |
| accent                   | `sand-3`                   | `sand-4` dark      | `bg-accent`                     |
| accent-foreground        | `sand-12`                  | `sand-12` dark     | `text-accent-foreground`        |
| destructive              | `tomato-9` (#e54d2e)       | `tomato-9` dark    | `bg-destructive`                |
| destructive-foreground   | `sand-1`                   | `sand-1` dark      | `text-destructive-foreground`   |
| border                   | `sand-7` (#cfceca)         | `sand-6` dark      | `border-border`                 |
| input                    | `sand-3`                   | `sand-3` dark      | `border-input`                  |
| ring                     | `sand-11` (#63635e)        | `sand-11` dark     | `ring-ring`                     |
| sidebar                  | `sand-3`                   | `sand-2` dark      | `bg-sidebar`                    |
| sidebar-foreground       | `sand-11`                  | `sand-11` dark     | `text-sidebar-foreground`       |
| sidebar-primary          | `sand-12`                  | `sand-12` dark     | `bg-sidebar-primary`            |
| sidebar-primary-foreground | `sand-1`                 | `sand-1` dark      | `text-sidebar-primary-foreground` |
| sidebar-accent           | `#ffffff`                  | `sand-3` dark      | `bg-sidebar-accent`             |
| sidebar-accent-foreground | `sand-12`                 | `sand-12` dark     | `text-sidebar-accent-foreground` |
| sidebar-border           | `sand-3`                   | `sand-6` dark      | `border-sidebar-border`         |
| sidebar-ring             | `sand-11`                  | `sand-8` dark      | `ring-sidebar-ring`             |

## Color, chart scale

All five chart slots map to Radix Blue steps 8 through 12. This is monochromatic by design.

| Token | Value | Tailwind utility |
| ----- | ----- | ---------------- |
| chart-1 | `blue-8` | `bg-chart-1` |
| chart-2 | `blue-9` | `bg-chart-2` |
| chart-3 | `blue-10` | `bg-chart-3` |
| chart-4 | `blue-11` | `bg-chart-4` |
| chart-5 | `blue-12` | `bg-chart-5` |

## Color, Radix scales imported

Each is imported from `@radix-ui/colors` with both light and dark variants. Utilities are `bg-<scale>-<step>` where step is 1 through 12.

- **sand** (neutral, used for all semantic neutrals)
- **tomato** (destructive and warm alert)
- **blue** (charts and informational)
- **pink** (decorative, confirmed used in avatar ring)
- **black-a** (alpha overlay, 12 steps of transparent black, used for popover and overlays)
- **white-a** (alpha overlay, 12 steps of transparent white, available for dark-mode overlays and translucent highlights)

No other Radix scales are imported. If you need amber, green, teal, and so on, add an import to `app/globals.css` and an `@theme inline` entry.

## Color, Cami custom scales

Six bespoke scales, 12 steps each. Light mode only. If you need dark variants, declare them in `.dark`.

| Scale | Tailwind utility | Character |
| ----- | ---------------- | --------- |
| cami-violet | `bg-cami-violet-9` (#362a82) | Deep navy violet. Step 9 is darker than step 10. Not a Radix-standard progression. |
| cami-green | `bg-cami-green-9` (#90df85) | Pastel spring green. Step 9 is brighter than step 8. |
| cami-sage | `bg-cami-sage-9` (#82949e) | Dusty blue-gray. |
| cami-yellow | `bg-cami-yellow-9` (#f3f100) | Neon yellow. High saturation, use sparingly. |
| cami-pink | `bg-cami-pink-9` (#80649b) | Dusty lavender. Not actually pink despite the name. |
| cami-gray | `bg-cami-gray-9` (#8c84c6) | Warm tinted gray with violet undertone. |

**Non-monotonic lightness warning.** Some Cami scales (violet, green, yellow) have step 9 and step 10 that are not strictly ordered by lightness. This is intentional for saturated accents but means you can't rely on "step N+1 is always darker than step N" for these scales. Test pairings before shipping.

## Color, neutral gray scale

Pure, untinted gray. Light and dark modes both defined. Use when you need a neutral that is not warm (`sand`) and not violet-tinted (`cami-gray`).

12 steps, named by OKLCH lightness percentage in light mode:

| Token | Light mode | Dark mode | Tailwind utility |
| ----- | ---------- | --------- | ---------------- |
| neutral-gray-99 | `#fcfcfc` | `#222222` | `bg-neutral-gray-99` |
| neutral-gray-97 | `#f6f6f6` | `#313131` | `bg-neutral-gray-97` |
| neutral-gray-94 | `#ededed` | `#484848` | `bg-neutral-gray-94` |
| neutral-gray-90 | `#e1e1e1` | `#6a6a6a` | `bg-neutral-gray-90` |
| neutral-gray-86 | `#d4d4d4` | `#898989` | `bg-neutral-gray-86` |
| neutral-gray-80 | `#c0c0c0` | `#a6a6a6` | `bg-neutral-gray-80` |
| neutral-gray-72 | `#a6a6a6` | `#c0c0c0` | `bg-neutral-gray-72` |
| neutral-gray-62 | `#898989` | `#d4d4d4` | `bg-neutral-gray-62` |
| neutral-gray-50 | `#6a6a6a` | `#e1e1e1` | `bg-neutral-gray-50` |
| neutral-gray-35 | `#484848` | `#ededed` | `bg-neutral-gray-35` |
| neutral-gray-25 | `#313131` | `#f6f6f6` | `bg-neutral-gray-25` |
| neutral-gray-18 | `#222222` | `#fcfcfc` | `bg-neutral-gray-18` |

**Dark mode behavior.** The scale mirrors in dark mode: `neutral-gray-99` holds the lightest hex in light mode and the darkest hex in dark mode. The step number represents role (99 = background-like, 18 = foreground-like), not an absolute L value in dark mode. This lets a single `var(--neutral-gray-99)` reference resolve correctly in both themes.

**Asymmetric spacing.** Steps cluster denser near the light end (99, 97, 94, 90 ...) than the dark end. This is intentional: UI needs more discriminable surfaces in the bright range (backgrounds, cards, dividers, borders) than in the dark range.

**Relationship to `cami-gray`.** `cami-gray-*` is warm, violet-tinted, brand-adjacent, light-mode only. `neutral-gray-*` is achromatic and dual-mode. They are not interchangeable.

## Radius

Two overrides, rest are Tailwind v4 defaults.

| Token | Value | Tailwind utility | Source |
| ----- | ----- | ---------------- | ------ |
| xs | 2px | `rounded-xs` | TW default |
| **sm** | **6px** | `rounded-sm` | **Override (TW default is 4)** |
| **md** | **8px** | `rounded-md` | **Override (TW default is 6)** |
| lg | 8px | `rounded-lg` | TW default |
| xl | 12px | `rounded-xl` | TW default |
| 2xl | 16px | `rounded-2xl` | TW default |
| 3xl | 24px | `rounded-3xl` | TW default |
| 4xl | 32px | `rounded-4xl` | TW default |
| full | 9999px | `rounded-full` | TW default |

## Typography

Font: **Manrope**, loaded via `next/font/google` in `app/layout.tsx`.

**Weights loaded**: 200, 300, 400, 500, 600, 700, 800. That is the full range Google Fonts serves for Manrope.

**Weight caveat**: `font-thin` (100) and `font-black` (900) do not exist in the Manrope font file. If you use those utilities, the browser falls back to the nearest available weight (200 and 800 respectively). If pixel-perfect weight matching to Figma matters, stay within 200-800.

Type sizes, line heights, tracking: all Tailwind v4 defaults are available. Use `text-xs` through `text-9xl`, `leading-3` through `leading-10`, `tracking-tighter` through `tracking-widest`. No overrides in `@theme`.

## Gradients

One named gradient token. Sourced from Figma `playground` node 328:3612.

| Token | Tailwind utility | Used for |
| ----- | ---------------- | -------- |
| `--gradient-hq-aurora` | `bg-hq-aurora` | HQ auth screen page background ([HqAuthLayout](components/blocks/hq-auth-layout.tsx)) |

`--gradient-hq-aurora` composition (top → bottom of the layer stack):

```
radial-gradient(ellipse at 21% 9%, ...yellow...)            yellow hotspot, top-left
radial-gradient(ellipse at 53% 52%, ...soft green...)       muted green spot, mid-canvas
linear-gradient(168.5deg, ...violet wash → solid violet)    violet wash to opaque, top→bottom-right
linear-gradient(white, white)                                white base
```

The violet wash sits on top of the yellow radial, which is what produces the muddy green-yellow midtones in the upper canvas. Light-mode only.

## Shadows

One custom shadow token, rest are Tailwind v4 defaults.

| Token | Value | Tailwind utility | Used for |
| ----- | ----- | ---------------- | -------- |
| `--shadow-overlay` | 5-layer outer stack + inset bottom | `shadow-overlay` | Floating panels (Sheet, Dialog) |

`--shadow-overlay` composition:

```
0 0 0 1px rgba(19,21,23,0.08)   hairline ring
0 3px 3px 0 rgba(0,0,0,0.03)    close shadow
0 8px 7px 0 rgba(0,0,0,0.04)    mid shadow
0 17px 14px 0 rgba(0,0,0,0.05)  lift shadow
0 35px 29px 0 rgba(0,0,0,0.06)  ambient shadow
inset 0 -4px 4px 0 rgba(0,0,0,0.04)  subtle bottom depth
```

Use this one utility for overlay-style panels. Do not try to recreate the stack inline.

## Spacing, sizing, opacity, stroke-width

All Tailwind v4 defaults. `p-4`, `gap-6`, `max-w-3xl`, `opacity-50`, `border-2`, etc. resolve without any override on our side.

If you reference a Tailwind utility name in Figma (for example `gap-4`), your engineer pastes that exact class into JSX and it resolves. Match your Figma values to the Tailwind v4 default scale and this stays true.

## Updating tokens

1. Change the value in Figma.
2. Update the corresponding custom property in `app/globals.css`.
3. Update this doc.
4. If the change affects more than one component, grep `components/ui/*` and `components/blocks/*` for hardcoded values that should be using the token.

## Not in this file yet

These are intentional omissions. Add them when you need them, not speculatively.

- Additional Radix scales beyond Sand, Tomato, Blue, Pink, Black Alpha, White Alpha.
- Dark mode values for Cami custom scales.
- Custom spacing or sizing tokens beyond Tailwind v4 defaults.
