"use client"

import Link from "next/link"

import { useResolvedCardTheme } from "@/lib/customer-card/store"
import { CUSTOMER_CARD_THEMES } from "@/lib/customer-card/theme"

/**
 * Prototype control, not product chrome. A customer never sees this.
 *
 * With typography settled as Cami's, the palette is the whole of what a merchant
 * chooses — so what this previews is the actual setting, and the five swatches
 * are the actual menu. It stands in for the picker that belongs in business
 * settings, which is where a merchant will really make this choice.
 *
 * Three goes at placing it, and the reasons are worth keeping:
 *
 *   - After the card it sat a full screen below the fold (the card is
 *     `min-h-dvh`) and nothing on screen suggested it was there.
 *   - As a full-width fixed bar it was findable but permanently covered ~90px
 *     of the card. Padding cannot fix that: a fixed element overlays every
 *     scroll position, not only the last one.
 *   - Pinned bottom-centre it landed on Book again — the card's one real
 *     control, and the last thing a floating box should sit on.
 *
 * Top-right: the card is centred, so on a desktop this is empty gutter, and on
 * a phone it overlaps the blank space beside the masthead rather than anything
 * anyone taps. The label drops below `sm` so the narrow case is swatches only.
 *
 * Colour-only swatches, with the name on the active one. Deliberately in the
 * app's own tokens rather than the venue's, so nobody mistakes it for the card.
 */
export function ThemePreviewStrip({
  slug,
  themeOverride,
}: {
  slug: string
  /** From `?theme=`; otherwise the merchant's saved choice. */
  themeOverride?: string
}) {
  // Resolved the same way the card resolves it, by the same function. Handed a
  // value computed on the server, this pill went on naming the old palette
  // after a merchant saved a new one — the card changed and its own label did
  // not.
  const active = useResolvedCardTheme(slug, themeOverride)
  const activeThemeId = active.id
  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 shadow-sm backdrop-blur">
        <span className="hidden text-[11px] whitespace-nowrap text-muted-foreground sm:inline">
          Theme{active ? ` · ${active.label}` : ""}
        </span>
        <div className="flex items-center gap-1">
          {CUSTOMER_CARD_THEMES.map((theme) => {
            const isActive = theme.id === activeThemeId
            return (
              <Link
                key={theme.id}
                href={`/${slug}/card?theme=${theme.id}`}
                aria-current={isActive ? "true" : undefined}
                aria-label={`Preview the ${theme.label} theme`}
                title={theme.label}
                className={
                  isActive
                    ? "size-5 rounded-full ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    : "size-5 rounded-full border border-black/10 transition-transform hover:scale-110"
                }
                style={{ background: theme.accent }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
