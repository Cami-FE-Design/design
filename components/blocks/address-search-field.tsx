"use client"

// Address entry: search first, structured fields second.
//
// Every other address in the repo (location-form.tsx) is a "Search address" box
// sitting above a grid of structured fields, with nothing connecting the two —
// the box is decorative and the merchant types every field by hand. This closes
// that gap: the box returns places, picking one fills the grid, and the grid
// stays visible and editable afterwards, because a returned place is a starting
// point rather than an answer. A registered address on a tax invoice has to
// match a trade licence, and no places index knows what the licence says.
//
// Two things the pattern has to keep honest:
//
//   - MANUAL ENTRY IS NEVER A DEAD END. Plenty of registered addresses — new
//     buildings, free-zone desks, PO boxes — are in no index at all. The escape
//     hatch is the first row of the dropdown, not something the merchant has to
//     fail their way into.
//   - THE FIELDS ARE THE RECORD, NOT THE SEARCH STRING. What gets stamped on a
//     document is the grid below, so the grid is what the caller reads. The
//     search box is an input method that happens to fill it.
//
// `PLACES` stands in for the Places Autocomplete response. Production swaps the
// constant for the call; the shape it has to return is `AddressParts`.

import { MapPinIcon, PencilIcon } from "lucide-react"
import { useId, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { type AddressParts, addressToLine, isAddressEmpty } from "@/lib/address"
import { cn } from "@/lib/utils"

type PlaceSuggestion = {
  id: string
  /** The name the merchant recognises. */
  primary: string
  /** Everything after it, as a places index would return it. */
  secondary: string
  parts: AddressParts
}

// UAE-first, because the merchants are. Deliberately a mix of the address kinds
// a grooming business actually registers under — a tower office, a villa cluster,
// a warehouse — so the demo never only shows one shape.
/** Tall enough for the manual row plus five results, at the row heights below. */
const LIST_MAX_HEIGHT = 288

const UAE = "United Arab Emirates"

const PLACES: PlaceSuggestion[] = [
  {
    id: "jvc-ghozlan",
    primary: "Al Ghozlan 4",
    secondary: "Jumeirah Village Circle, Dubai, United Arab Emirates",
    parts: { line: "Al Ghozlan 4, Jumeirah Village Circle\nDubai", postcode: "", country: UAE },
  },
  {
    id: "jlt-indigo",
    primary: "Indigo Tower, Cluster D",
    secondary: "Jumeirah Lakes Towers, Dubai, United Arab Emirates",
    parts: {
      line: "Indigo Tower, Cluster D, Jumeirah Lakes Towers\nOffice 504\nDubai",
      postcode: "",
      country: UAE,
    },
  },
  {
    id: "business-bay",
    primary: "Bay Square Building 3",
    secondary: "Business Bay, Dubai, United Arab Emirates",
    parts: {
      line: "Bay Square Building 3, Business Bay\nUnit 12\nDubai",
      postcode: "",
      country: UAE,
    },
  },
  {
    id: "al-quoz",
    primary: "Warehouse 7, Street 6",
    secondary: "Al Quoz Industrial Area 3, Dubai, United Arab Emirates",
    parts: {
      line: "Warehouse 7, Street 6, Al Quoz Industrial Area 3\nDubai",
      postcode: "",
      country: UAE,
    },
  },
  {
    id: "abu-dhabi-reem",
    primary: "Addax Tower, Al Reem Island",
    secondary: "Al Reem Island, Abu Dhabi, United Arab Emirates",
    parts: {
      line: "Addax Tower, Al Reem Island\nOffice 2201\nAbu Dhabi",
      postcode: "",
      country: UAE,
    },
  },
  {
    id: "sharjah-majaz",
    primary: "Al Majaz Tower 2",
    secondary: "Al Majaz 3, Sharjah, United Arab Emirates",
    parts: { line: "Al Majaz Tower 2, Al Majaz 3\nSharjah", postcode: "", country: UAE },
  },
]

function matches(place: PlaceSuggestion, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return `${place.primary} ${place.secondary}`.toLowerCase().includes(q)
}

export function AddressSearchField({
  value,
  onChange,
  label = "Registered address",
  helper,
  className,
}: {
  value: AddressParts
  onChange: (parts: AddressParts) => void
  label?: string
  helper?: string
  className?: string
}) {
  const listId = useId()
  const [query, setQuery] = useState(() => (isAddressEmpty(value) ? "" : addressToLine(value)))
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  // Measured on open: with no room below, the list opens upward. A dropdown
  // that runs off the bottom of a takeover is a dropdown the merchant cannot
  // reach the last row of.
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [dropUp, setDropUp] = useState(false)

  const results = PLACES.filter((p) => matches(p, query)).slice(0, 5)
  // Row 0 is always "Enter address manually", so the highlight index spans it.
  const rowCount = results.length + 1

  const close = () => {
    setOpen(false)
    setActive(0)
  }

  const show = () => {
    const rect = boxRef.current?.getBoundingClientRect()
    if (rect) setDropUp(window.innerHeight - rect.bottom < LIST_MAX_HEIGHT + 16)
    setOpen(true)
  }

  const pick = (place: PlaceSuggestion) => {
    // The postal code the merchant already entered survives a re-pick — a map
    // result rarely carries one in the UAE, so taking the place's empty value
    // would silently wipe what they typed.
    onChange({ ...place.parts, postcode: value.postcode })
    setQuery(place.parts.line.split("\n").join(", "))
    close()
  }

  // Whatever is in the box is the address. Typing is not a fallback mode to
  // fail your way into — plenty of registered addresses are not in any index.
  const typeIn = (text: string) => {
    setQuery(text)
    onChange({ ...value, line: text })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      close()
      return
    }
    if (!open) {
      if (e.key === "ArrowDown") setOpen(true)
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (i + 1) % rowCount)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (i - 1 + rowCount) % rowCount)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (active === 0) close()
      else pick(results[active - 1])
    }
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-1.5">
        {/* biome-ignore lint/a11y/noLabelWithoutControl: the control is the child */}
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium leading-5 text-foreground">{label}</span>
          <div ref={boxRef} className="relative">
            <MapPinIcon
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              value={query}
              placeholder="Search address"
              autoComplete="off"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              className="pl-10"
              onChange={(e) => {
                typeIn(e.target.value)
                show()
                setActive(0)
              }}
              onFocus={show}
              onKeyDown={onKeyDown}
              onBlur={close}
            />

            {/* Anchored to the input, not to the block below it — the helper
                line sits between the two and would otherwise push the list a
                paragraph away from the box that opened it. Solid rather than
                the translucent popover token, because this list overlaps the
                fields it is about to fill and reading both at once is noise. */}
            {open ? (
              <div
                id={listId}
                role="listbox"
                aria-label="Address suggestions"
                style={{ maxHeight: LIST_MAX_HEIGHT }}
                className={cn(
                  "absolute inset-x-0 z-50 flex flex-col overflow-y-auto rounded-2xl bg-background p-2 shadow-lg ring-1 ring-foreground/10",
                  dropUp ? "bottom-full mb-1" : "top-full mt-1",
                )}
                // Keeps focus in the input, so the row's click actually lands.
                // The previous version let the input blur and raced a timer
                // against the click — which is why picking an address did
                // nothing at all.
                onMouseDown={(e) => e.preventDefault()}
              >
                {/* First row, not last. A registered address no index knows
                    about is common enough that keeping what was typed is a
                    route, not a fallback to fail your way into. */}
                <button
                  type="button"
                  role="option"
                  aria-selected={active === 0}
                  onClick={close}
                  onMouseEnter={() => setActive(0)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foreground",
                    active === 0 && "bg-foreground/10",
                  )}
                >
                  <PencilIcon className="size-4 shrink-0" strokeWidth={1.5} />
                  Use what I typed
                </button>

                {results.map((place, i) => (
                  <button
                    key={place.id}
                    type="button"
                    role="option"
                    aria-selected={active === i + 1}
                    onClick={() => pick(place)}
                    onMouseEnter={() => setActive(i + 1)}
                    className={cn(
                      "flex w-full flex-col gap-0.5 rounded-xl px-3 py-2.5 text-left",
                      active === i + 1 && "bg-foreground/10",
                    )}
                  >
                    <span className="text-sm font-medium leading-5 text-foreground">
                      {place.primary}
                    </span>
                    <span className="truncate text-sm leading-5 text-muted-foreground">
                      {place.secondary}
                    </span>
                  </button>
                ))}

                {results.length === 0 ? (
                  <p className="px-3 py-2.5 text-sm leading-5 text-muted-foreground">
                    No matching address. Enter it manually instead.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </label>
        {helper ? <span className="text-sm leading-5 text-muted-foreground">{helper}</span> : null}
      </div>
    </div>
  )
}
