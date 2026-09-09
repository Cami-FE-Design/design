# Address search field

The shared address input (`components/blocks/address-search-field.tsx`) used by
the billing address, a client's profile address, and the pet address on both the
staff appointment sheet and the public booking flow.

Live states: `/playground#address-search-field`.

## Search first, structured fields second

The repo's older address blocks put a decorative "Search address" box above a
grid the merchant still filled in by hand. Here picking a place **fills** the
grid — and the grid stays editable, because a places result is a starting point
and the trade licence is what has to match.

- **Manual entry is the first row of the dropdown**, not a fallback reached by
  failing. Plenty of registered addresses — new buildings, free-zone desks, PO
  boxes — are in no index at all, so making manual entry the reward for a failed
  search punishes the addresses most likely to need it.
- Arrow keys and Enter work the dropdown.
- The suggestions stand in for a Places Autocomplete response; production swaps
  the constant for the call.

## The field set

Matches the benchmark's billing form rather than a full postal schema. No
emirate: in the UAE it repeats the city on almost every address. Blank optional
fields collapse rather than leaving a gap in an invoice's issuer block.

## PRD-144 — the pin

A picked place carries its `placeId` and coordinates onto the record, and
**editing the text afterwards drops them**. A reference that outlived the text
it described would route a driver to the previous address — so the line under
the field says whether this one is pinned, because the person doing the booking
is the only one who can still fix it.

That pin is what the read-only `NavigateToAddress` link routes to: a pinned
address opens Maps in directions mode ("Navigate"), a typed one can only offer a
text query ("Search in Maps").
