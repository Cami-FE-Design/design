"use client"

// The driver's half of PRD-144.
//
// Capturing a pet address is only useful if the person travelling to it can act
// on it. Before this, every pickup address in the product rendered as a string
// with no affordance — a mobile groomer read it off the screen and retyped it
// into their phone, which is both the slow path and the one that mistypes
// "Street 4B" as "Street 48".
//
// One link, two renderings, used wherever a pet address is shown read-only:
//
//   - compact → calendar popover, where it shares a row with the address
//   - default → appointment detail sheet, its own tappable row
//
// It opens Google Maps in *directions* mode rather than search mode: on a phone
// that hands off to the native app with the trip loaded, which is one tap fewer
// than a pin the driver then has to press Directions on. Where the address was
// picked from the map search it routes to the stored coordinates; where it was
// typed it falls back to a text query, and says so, because a text query that
// lands on the wrong side of a villa cluster should not look like a promise.

import { NavigationIcon } from "lucide-react"
import { hasPrecisePoint, mapsDirectionsHref, type PlaceRef } from "@/lib/address"
import { cn } from "@/lib/utils"

export function NavigateToAddress({
  address,
  place,
  size = "default",
  className,
}: {
  /** The address as recorded. Blank renders nothing — there is nowhere to go. */
  address?: string
  place?: PlaceRef
  size?: "default" | "compact"
  className?: string
}) {
  const text = address?.trim()
  if (!text) return null

  const pinned = hasPrecisePoint(place)
  const label = pinned ? "Navigate" : "Search in Maps"

  return (
    <a
      href={mapsDirectionsHref(text, place)}
      target="_blank"
      rel="noopener noreferrer"
      // The address is already on screen next to this; the accessible name says
      // what tapping does and to where, since a screen reader user hitting a
      // bare "Navigate" has no idea which of the day's appointments it belongs
      // to when several are open.
      aria-label={`${label} to ${text}`}
      className={cn(
        "inline-flex w-fit items-center gap-1.5 font-medium text-cami-sage-12 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        size === "compact"
          ? "gap-1 text-[10px]"
          : "rounded-xl bg-cami-sage-2 px-3 py-2 text-sm no-underline hover:bg-cami-sage-3 hover:no-underline",
        className,
      )}
    >
      <NavigationIcon
        className={cn("shrink-0", size === "compact" ? "size-2.5" : "size-4")}
        aria-hidden
      />
      {label}
    </a>
  )
}
