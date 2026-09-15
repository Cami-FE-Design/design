import type { PublicBusiness } from "@/lib/public-business"

/**
 * The venue's own photograph behind the card, blurred past recognition.
 *
 * Asked for by Maaz (15 Sep 2026) against the check-in page a guest opens from
 * a stay booking, where the property photo sits behind the sheet. PRD-176 put
 * merchant imagery out of the pack, so this widens it — worth naming on the
 * ticket rather than letting the scope drift quietly.
 *
 * Three things keep it from fighting the card, and all three are the point:
 *
 *   - It is blurred and scaled past the frame. A readable photo behind a card
 *     of text is two things asking to be read at once, and the photo wins
 *     because it is bigger. Blurred, it is atmosphere: the guest recognises
 *     their salon without reading anything.
 *   - A scrim in the venue's own `shell` colour sits over it, so the palette
 *     the merchant picked still decides the mood. Without it a warm-gold venue
 *     with a cool photo arrives grey-blue, and the palette — the whole of what
 *     a venue gets to choose — stops showing.
 *   - The card itself is untouched. Every piece of text still sits on
 *     `surface`, so contrast is exactly what it was with a flat ground.
 *
 * A venue with no photo renders nothing and keeps the plain shell, which is
 * what every venue looked like before this.
 */
export function VenueBackdrop({ business }: { business: PublicBusiness }) {
  if (!business.coverUrl) return null
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* A background rather than an <img>: it is decoration with nothing to
          announce, so it wants no alt text and no place in the layout.
          `scale-110` because a blur samples past its own edges — without it the
          corners fade to nothing and the photo reads as a vignette. */}
      <div
        className="size-full scale-105 bg-cover bg-center blur-md"
        style={{ backgroundImage: `url(${business.coverUrl})` }}
      />
      {/* Two thirds, not four fifths. The first pass ran a 40px blur under an
          0.82 scrim, which is a tinted rectangle with a photograph's expenses:
          nobody could tell their own salon was back there. This leaves the
          shapes of the room readable while the venue's colour still carries. */}
      <div className="absolute inset-0 bg-[var(--cc-shell)] opacity-[0.62]" />
    </div>
  )
}
