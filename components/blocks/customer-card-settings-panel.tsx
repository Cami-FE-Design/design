"use client"

// Where a merchant picks the look of the card their customers open.
//
// Until this existed, a venue's palette was assigned by hand in code. That is
// survivable for one pilot and nothing beyond it — the second merchant has no
// way to be anything but the default, which is the failure the Client Card
// brief's scaling question was about.
//
// The panel is deliberately small, and that is the product decision showing
// through rather than an unfinished screen. Typography is Cami's for every
// venue (a licence, a load and a rendering difference per merchant, forever),
// and custom imagery and layout are out. So a merchant picks one palette, sees
// what it does, and leaves. Anything more here would be promising control that
// does not exist.

import { useState } from "react"
import { toast } from "sonner"

import { CustomerCard } from "@/components/blocks/customer-card/customer-card"
import { SettingsPanel } from "@/components/blocks/settings-panel"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { getCustomerCard } from "@/lib/customer-card/mock"
import { useCustomerCardTheme } from "@/lib/customer-card/store"
import {
  CUSTOMER_CARD_THEMES,
  getCustomerCardTheme,
  venueForBusinessName,
} from "@/lib/customer-card/theme"
import { useDemoBusiness } from "@/lib/demo-business"
import { getPublicBusiness } from "@/lib/public-business"
import { cn } from "@/lib/utils"

/** Where the demo lands when its business has been renamed to something unknown. */
const FALLBACK_SLUG = "shampooch-jvc"

export function CustomerCardSettingsPanel() {
  // The venue whose settings these are — the business you are signed into, not
  // a fixed one. It was hardcoded to Sota, so a merchant inside Shampooch set
  // Sota's palette: Save appeared to work, the card and the messages did not
  // move, and nothing on screen explained why. The settings dialog belongs to
  // one business; this panel has to be that business.
  const { name: businessName } = useDemoBusiness()
  const slug = venueForBusinessName(businessName)?.slug ?? FALLBACK_SLUG
  const business = getPublicBusiness(slug)
  const card = business ? getCustomerCard(slug) : undefined
  const { themeFor, setTheme } = useCustomerCardTheme()
  const savedId = themeFor(slug)
  const saved = getCustomerCardTheme(slug, savedId)
  const [draftId, setDraftId] = useState<string | null>(null)
  const selectedId = draftId ?? saved.id
  const selected = getCustomerCardTheme(slug, selectedId)
  const dirty = draftId !== null && draftId !== saved.id

  return (
    <SettingsPanel
      header={
        <header className="flex flex-col gap-2">
          <h2 className="font-heading text-2xl leading-8 font-semibold text-foreground">
            Branding
          </h2>
          <p className="max-w-146 text-sm leading-5 text-muted-foreground">
            One palette, everywhere a client sees you — the card they open from a booking
            confirmation, and the messages that carry the link.
          </p>
        </header>
      }
    >
      {/* Same 36.5rem footprint as the Business details and Sales cards.
          Two columns, not stacked. Stacked, a five-way colour choice ran past
          the fold and put Save — the only control on this panel — below it: you
          could not set the thing the panel exists to set without scrolling
          first. Side by side, the choice and its consequence are one glance. */}
      <section className="flex w-full flex-col gap-5 rounded-2xl border border-border/60 p-5 sm:w-fit sm:min-w-146">
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-base font-semibold text-foreground">Theme</h3>
          <p className="text-sm text-muted-foreground">
            Type stays the same across Cami, so the colour is what makes a page yours.
          </p>
        </div>

        {/* Both columns are a known height, so neither can push Save past the
            fold — which is what kept happening while the preview's height was
            a guess. Five rows at h-11 with gap-1.5 is 5×44 + 4×6 = 244px, and
            the preview is set to the same. Change one and change the other.
            `items-start`, never stretch: stretch let the grid hand each row a
            fifth of the row height, and a swatch and a word turned into a
            hundred-pixel box. */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-4">
          {/* A list, not a five-across grid. Five named options read as a choice
              to make; five tiles read as a palette to admire, and the names —
              the part a merchant repeats back to you — end up smallest.
              Radix RadioGroup, so arrow keys move between options, the group
              announces itself, and only one can be on.
              The radio itself is not drawn. The chosen row already carries a
              border and a tint, so a dot beside it was a second indicator for
              one state — and whichever a merchant read first, the other was
              noise. The row is the control. The dot stays in the accessibility
              tree and stays focusable; the label takes the focus ring, so a
              keyboard user can still see where they are. */}
          <RadioGroup
            value={selectedId}
            onValueChange={setDraftId}
            aria-label="Theme"
            className="shrink-0 gap-1.5 sm:w-52"
          >
            {CUSTOMER_CARD_THEMES.map((theme) => {
              const active = theme.id === selectedId
              return (
                <label
                  key={theme.id}
                  htmlFor={`theme-${theme.id}`}
                  className={cn(
                    "flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 transition-colors",
                    "has-focus-visible:ring-2 has-focus-visible:ring-ring/40",
                    // Every row carries the border, not only the chosen one.
                    // With four bare rows and one boxed, the list stopped being
                    // a list — it read as a card with four loose lines beside
                    // it, and the eye had no edge to run down. The choice shows
                    // as a darker border and a tint *within* the list rather
                    // than as the only thing in it.
                    active
                      ? "border-foreground bg-muted/50"
                      : "border-border/60 hover:bg-foreground/3",
                  )}
                >
                  <RadioGroupItem id={`theme-${theme.id}`} value={theme.id} className="sr-only" />
                  {/* The two roles a merchant notices: the ground the card sits
                      on, and the colour every control takes. Naming them would
                      be a colour theory lesson; showing them is the decision. */}
                  <span
                    aria-hidden
                    className="flex h-6 w-8 shrink-0 items-end justify-center rounded-md border border-black/10 pb-1"
                    style={{ background: theme.shell }}
                  >
                    <span className="h-2 w-4 rounded-full" style={{ background: theme.accent }} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{theme.label}</span>
                </label>
              )
            })}
          </RadioGroup>

          <div className="flex min-w-0 flex-col gap-2">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Preview
            </span>
            {/* Scaled, with the inner width set to exactly the box divided by
                the zoom — 520 × 0.5 = 260. An arbitrary inner width was the
                earlier mistake: the scaled card no longer matched its container,
                so the venue's shell covered two thirds of the box and bare white
                sat beside it.
                Halving it means every colour role — shell, surface, accent,
                band, border — appears inside the box, so the rest of the card is
                height spent on a decision already made.
                It ends in a fade rather than a hard edge. Picking a height that
                lands between sections cannot work: a venue with no loyalty
                programme or an empty wallet has a shorter card, so any fixed
                number cuts someone through the middle of something. A fade in
                the venue's own shell colour says "this continues" whatever it
                happens to cut, which is the honest thing for a preview to say —
                it is a crop, not the whole card. */}
            {business && card ? (
              <div className="relative h-[244px] w-[260px] overflow-hidden rounded-xl border border-border/60">
                <div className="w-[520px] [zoom:0.5]">
                  <CustomerCard business={business} card={card} theme={selected} />
                </div>
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-14"
                  style={{
                    backgroundImage: `linear-gradient(to bottom, transparent, ${selected.shell})`,
                  }}
                />
              </div>
            ) : null}
          </div>
        </div>

        <hr className="border-border/60" />

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            radius="full"
            disabled={!dirty}
            onClick={() => {
              setTheme(slug, selectedId)
              setDraftId(null)
              toast.success("Theme saved")
            }}
          >
            Save
          </Button>
          {dirty ? (
            <Button variant="ghost" size="sm" radius="full" onClick={() => setDraftId(null)}>
              Cancel
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              Saved — this is what your clients see.
            </span>
          )}
        </div>
      </section>
    </SettingsPanel>
  )
}
