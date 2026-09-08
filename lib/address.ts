// A postal address, and the one thing documents actually want from it: display
// lines.
//
// Two fields on the form — the address, and the postal code — and no more. It
// was briefly a five-part schema (address, line2, city, postcode, country),
// which made the merchant read the word "address" three times to fill in one
// thing they know by heart. Nothing in the BRD or the ticket asks for parts:
// SET-A1 and DSG-74 T1-1 both say "address", once.
//
// The address itself is picked from a map search, so it arrives already
// formatted and consistent — which is also the answer to the drift defect
// logged against the benchmark in DSG-72 §0.4 gap 15, without making the
// merchant type an address into five boxes to get it.
//
// Country is here and is NOT asked for on the billing form. It already lives on
// Business details, and two prompts for one fact is how a document ends up
// contradicting the business record.

export type AddressParts = {
  /**
   * The address itself, as picked from the map search or typed. One line per
   * row — newlines are the document's line breaks.
   */
  line: string
  /**
   * Its own field because the merchant knows it separately from the street, and
   * because a map result often does not carry one in the UAE. Optional: most
   * UAE addresses have no postal code at all.
   */
  postcode: string
  /** From Business details, never from the address form. */
  country: string
  /**
   * Set only when the address was picked from the search, and cleared the
   * moment the line is edited by hand — a reference that outlives the text it
   * described would point a driver at the previous address. See `PlaceRef`.
   */
  placeId?: string
  point?: GeoPoint
}

export const EMPTY_ADDRESS: AddressParts = {
  line: "",
  postcode: "",
  country: "United Arab Emirates",
}

/**
 * Document lines from the record. Blank rows collapse rather than emitting an
 * empty line — a gap in the middle of an invoice's issuer block reads as a
 * rendering fault, not as an address with nothing in that slot.
 */
export function addressToLines(parts: AddressParts): string[] {
  const rows = parts.line
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)

  // The postal code rides with the last address row rather than taking a line of
  // its own — "Dubai, 74200" is how it prints, and a bare code on its own line
  // reads as a stray field.
  const code = parts.postcode.trim()
  if (code && rows.length > 0) rows[rows.length - 1] = `${rows[rows.length - 1]}, ${code}`
  else if (code) rows.push(code)

  return [...rows, parts.country.trim()].filter(Boolean)
}

/** Single line, for a search box or a summary row. */
export function addressToLine(parts: AddressParts): string {
  return addressToLines(parts).join(", ")
}

/**
 * Empty means "no address given". Country carries a default and so cannot be
 * the test — a record with only a country is still an address nobody entered.
 */
export function isAddressEmpty(parts: AddressParts): boolean {
  return !parts.line.trim()
}

// ─── Where the address actually is (PRD-144) ──────────────────────────────────
// A pickup address is the one address in the product that someone has to *drive
// to*. Text is enough to print an invoice and not enough to navigate: "Villa 12,
// Street 4B, Jumeirah 1" resolves to the middle of a villa cluster, and a
// mobile groomer standing outside the wrong gate is the failure this exists to
// prevent.
//
// So a picked address carries what the places index knew about it, and the
// navigate links below prefer that over the string. Typed addresses have no
// reference and fall back to a text query — degraded, never broken, because
// plenty of real addresses are in no index at all.

/** Coordinates as a places index returns them. */
export type GeoPoint = { lat: number; lng: number }

/**
 * What the places index knew about a picked address. Absent on anything typed
 * by hand, which is the common case for new buildings and villa clusters.
 */
export type PlaceRef = {
  /** Places id — the most precise handle, survives the place being renamed. */
  placeId?: string
  point?: GeoPoint
}

/** True when we can drop a pin rather than run a text search. */
export function hasPrecisePoint(place?: PlaceRef): boolean {
  return Boolean(place?.point || place?.placeId)
}

/** The place ref carried by an address record, if it was picked from search. */
export function addressPlaceRef(parts: AddressParts): PlaceRef | undefined {
  if (!parts.placeId && !parts.point) return undefined
  return { placeId: parts.placeId, point: parts.point }
}

// Coordinates beat the string when we have them: Maps takes the pin literally,
// where a text query re-guesses an address we already resolved once.
function destination(address: string, place?: PlaceRef): string {
  const point = place?.point
  return point ? `${point.lat},${point.lng}` : address.trim()
}

/**
 * Maps link that *shows* the address — the read-only rendering on an
 * appointment, where the reader wants to see where it is.
 */
export function mapsSearchHref(address: string, place?: PlaceRef): string {
  const params = new URLSearchParams({ api: "1", query: destination(address, place) })
  // Only meaningful alongside `query`, which is why it is appended and not
  // substituted for it.
  if (place?.placeId) params.set("query_place_id", place.placeId)
  return `https://www.google.com/maps/search/?${params.toString()}`
}

/**
 * Maps link that *routes* to the address, from wherever the device is. This is
 * the one a driver taps: it opens the native app on a phone with the trip
 * already loaded, rather than a pin they then have to press Directions on.
 */
export function mapsDirectionsHref(address: string, place?: PlaceRef): string {
  const params = new URLSearchParams({ api: "1", destination: destination(address, place) })
  if (place?.placeId) params.set("destination_place_id", place.placeId)
  return `https://www.google.com/maps/dir/?${params.toString()}`
}
