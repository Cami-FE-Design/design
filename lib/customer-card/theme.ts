// Per-venue theming for the customer card.
//
// The brief left the width of this open: its own Sota mockup is a serif
// wordmark, an italic pull-quote and a gold palette — full per-venue theming.
// **Settled 2026-09-11: typography stays Cami's own for every venue.** Merchant
// fonts were ruled out on the cost of running them at scale rather than on how
// Sota's mockup looks — every additional typeface is a licence, a load, a
// fallback and a rendering difference per venue, and that bill arrives once per
// merchant forever.
//
// So a merchant picks a *theme*, not a stylesheet: each theme is a fixed set of
// colour roles, and nothing else varies. Custom fonts, imagery and layout are
// out, and not pending.
//
// The roles below are deliberately few. Every extra role is another thing a
// merchant can pick wrong and another thing that has to look right in all
// combinations, and the point of a constrained system is that no combination
// can look broken.
//
// One decision worth reading: these are literal colour values applied as inline
// CSS variables, not Tailwind tokens, and the card does not respond to the
// viewer's light/dark preference. A venue's brand is the venue's brand — a
// customer opening Sota's card at night should still see Sota, not an inverted
// approximation of it. The rest of the app stays theme-aware; this one surface
// is intentionally not.

import { findPublicBusinessByName } from "@/lib/public-business"

export type CustomerCardTheme = {
  id: string
  /** What the merchant picks from in settings. */
  label: string
  /** Page ground behind the card. */
  shell: string
  /** The card itself, and anything that sits on the shell. */
  surface: string
  /** Tiles and rows inside the card — one step off `surface`. */
  surfaceMuted: string
  /** The brand colour: wordmark, CTA fill, the loyalty numeral. */
  accent: string
  /** Text on top of `accent`. Never derived — picked per theme so contrast holds. */
  accentForeground: string
  /** The one filled band on the card (upcoming appointment). Darker than accent. */
  band: string
  /** Text on top of `band`. */
  bandForeground: string
  /** Body text. */
  text: string
  /** Secondary text — labels, captions, the "maintained by" line. */
  muted: string
  /** Hairlines, tile borders, dividers. */
  border: string
}

/**
 * The pickable set. Five is the whole menu on purpose: enough that venues don't
 * collide in a pilot, few enough that each one has actually been looked at.
 */
export const CUSTOMER_CARD_THEMES: ReadonlyArray<CustomerCardTheme> = [
  {
    id: "gold",
    label: "Warm gold",
    shell: "#efe9dc",
    surface: "#fbf8f2",
    surfaceMuted: "#f4efe3",
    accent: "#9b7c3f",
    accentForeground: "#fffdf7",
    band: "#5f573a",
    bandForeground: "#f2eee1",
    text: "#2e2921",
    muted: "#8b8170",
    border: "#e3dccc",
  },
  {
    id: "violet",
    label: "Cami violet",
    shell: "#eff1ff",
    surface: "#ffffff",
    surfaceMuted: "#f7f8ff",
    accent: "#362a82",
    accentForeground: "#ffffff",
    band: "#2c1d75",
    bandForeground: "#e4e6ff",
    text: "#20193e",
    muted: "#635d90",
    border: "#e4e6ff",
  },
  {
    id: "sage",
    label: "Cool sage",
    shell: "#e7f4fb",
    surface: "#ffffff",
    surfaceMuted: "#f4fafd",
    accent: "#3d5561",
    accentForeground: "#ffffff",
    band: "#27373f",
    bandForeground: "#e7f4fb",
    text: "#27373f",
    muted: "#657680",
    border: "#d6e8f2",
  },
  {
    id: "blush",
    label: "Soft blush",
    shell: "#f6edff",
    surface: "#ffffff",
    surfaceMuted: "#fbf8ff",
    accent: "#75598f",
    accentForeground: "#ffffff",
    band: "#3f2456",
    bandForeground: "#f6edff",
    text: "#3f2456",
    muted: "#7c6b8a",
    border: "#ecdffa",
  },
  {
    id: "ink",
    label: "Ink",
    shell: "#17181c",
    surface: "#1f2026",
    surfaceMuted: "#26272e",
    accent: "#e9e4d8",
    accentForeground: "#1a1b1f",
    band: "#2f3039",
    bandForeground: "#e9e4d8",
    text: "#f0eee9",
    muted: "#9b9a95",
    border: "#33343c",
  },
]

const DEFAULT_THEME_ID = "violet"

/**
 * What each venue starts on before anyone opens Branding — a seed, not the
 * answer. The merchant's own choice lives in lib/customer-card/store.tsx and
 * wins over this.
 */
export const DEFAULT_THEME_BY_SLUG: Readonly<Record<string, string>> = {
  sota: "gold",
  "shampooch-jvc": "violet",
  "purr-palace": "sage",
}

export function getCustomerCardTheme(slug: string, override?: string | null): CustomerCardTheme {
  const id = override ?? DEFAULT_THEME_BY_SLUG[slug] ?? DEFAULT_THEME_ID
  return (
    CUSTOMER_CARD_THEMES.find((t) => t.id === id) ??
    CUSTOMER_CARD_THEMES.find((t) => t.id === DEFAULT_THEME_ID) ??
    CUSTOMER_CARD_THEMES[0]
  )
}

/**
 * The venue a business name belongs to.
 *
 * Message surfaces know a name and nothing else — the demo business name is
 * renameable, and a renamed one matches nothing, which is the right answer: a
 * venue nobody has set up gets the default palette and no logo, exactly like a
 * real merchant who has picked neither.
 *
 * Branding for those surfaces resolves through `useVenueBranding` in
 * store.tsx rather than here, because the merchant's saved choice lives in the
 * store and a plain function would only ever see the seeded default — which is
 * how the card came back in a new palette while the message kept the old one.
 *
 */
export function venueForBusinessName(businessName: string) {
  return findPublicBusinessByName(businessName)
}

/**
 * The theme as inline CSS variables, for the element that wraps the card.
 * Children then read `var(--cc-accent)` and friends, so a nested component
 * never has to be handed the theme object.
 */
export function themeVars(theme: CustomerCardTheme): React.CSSProperties {
  return {
    "--cc-shell": theme.shell,
    "--cc-surface": theme.surface,
    "--cc-surface-muted": theme.surfaceMuted,
    "--cc-accent": theme.accent,
    "--cc-accent-fg": theme.accentForeground,
    "--cc-band": theme.band,
    "--cc-band-fg": theme.bandForeground,
    "--cc-text": theme.text,
    "--cc-muted": theme.muted,
    "--cc-border": theme.border,
  } as React.CSSProperties
}
