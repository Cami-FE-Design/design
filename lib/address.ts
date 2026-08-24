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
