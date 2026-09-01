// Categorical chart palette for the Performance dashboard (DSG-79).
//
// Six fixed slots backed by the --chart-cat-* tokens in app/globals.css. They
// are drawn from the existing Cami/Radix scales (violet, green, blue, pink,
// yellow, sand) — no new hues — and light/dark use *different steps* of those
// scales so both sets sit inside the lightness band for their surface. Both
// were checked with the dataviz skill's validator (ALL CHECKS PASS):
//   node scripts/validate_palette.js "#5c52c2,#37822c,#0090FF,#D6409F,#807e00" --mode light
//   node scripts/validate_palette.js "#6b62d8,#398448,#0090FF,#D6409F,#737a26" --mode dark
//
// Rules that hold everywhere this is used:
//   • Slots are assigned in FIXED order and never cycled. A 6th+ series folds
//     into slot 5 ("Other"), the neutral — we do not generate a 7th hue.
//   • Colour follows the entity, not its rank, so filtering a series out never
//     repaints the survivors.
//   • Identity is never colour-alone: every chart ships a legend or direct
//     labels alongside the swatch.

/** CSS values for recharts `fill` / `stroke` props. */
export const CHART_CAT_VARS = [
  "var(--color-chart-cat-1)",
  "var(--color-chart-cat-2)",
  "var(--color-chart-cat-3)",
  "var(--color-chart-cat-4)",
  "var(--color-chart-cat-5)",
  "var(--color-chart-cat-other)",
] as const

/** Tailwind background classes for HTML swatches (legends, breakdown lists). */
export const CHART_CAT_SWATCH = [
  "bg-chart-cat-1",
  "bg-chart-cat-2",
  "bg-chart-cat-3",
  "bg-chart-cat-4",
  "bg-chart-cat-5",
  "bg-chart-cat-other",
] as const

/** Slots past the palette collapse onto the neutral "Other" slot. */
export function catVar(slot: number): string {
  return CHART_CAT_VARS[Math.min(slot, CHART_CAT_VARS.length - 1)]
}

export function catSwatch(slot: number): string {
  return CHART_CAT_SWATCH[Math.min(slot, CHART_CAT_SWATCH.length - 1)]
}

/**
 * Sequential ramp for the capacity heatmap — one hue, light → dark, on the Cami
 * violet scale so the heatmap sits in the same family as the rest of the
 * dashboard. Verified monotonic in OKLCH lightness (0.961 → 0.510), which is
 * the check a sequential ramp has to pass; the categorical checks do not apply.
 *
 * Note the jump from step 8 to step 11: cami-violet is not a Radix-shaped
 * scale (DESIGN_TOKENS flags steps 9 and 10 as non-monotonic), so the darkest
 * usable step for a ramp is 11, not 9.
 *
 * The trade-off of moving off blue: a sequential ramp now shares its hue with
 * the categorical slot 1. The heatmap is the only sequential surface here and
 * it is a grid of labelled cells rather than a series, so the two are unlikely
 * to be confused — but if another sequential chart appears, revisit this.
 */
export const HEAT_RAMP = [
  "var(--color-cami-violet-3)",
  "var(--color-cami-violet-4)",
  "var(--color-cami-violet-5)",
  "var(--color-cami-violet-6)",
  "var(--color-cami-violet-7)",
  "var(--color-cami-violet-8)",
  "var(--color-cami-violet-11)",
] as const

/** Only the top step is dark enough to need light ink. */
export const HEAT_INK_FLIPS_AT = 6

export function heatStep(value: number): number {
  return Math.min(HEAT_RAMP.length - 1, Math.max(0, Math.floor(value * HEAT_RAMP.length)))
}
