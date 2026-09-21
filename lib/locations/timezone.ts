/**
 * A business timezone default, and a per-branch override (R19, Must).
 *
 * R19's own words: "Time is stored in UTC while a **Business timezone default
 * and per-Location overrides** govern schedules, availability, display, and
 * date bucketing". This repo had the second half — every branch carried a
 * `timezone` string — and none of the first: no default to inherit from, and no
 * way to see whether a branch held its own or simply matched.
 *
 * That gap is not cosmetic. Without a default, changing the business's zone
 * means editing every branch by hand, which is the bulk-edit R06 exists to
 * avoid; and a branch that merely matches the business is indistinguishable
 * from one that deliberately differs, so nobody can tell what a change will
 * disturb.
 *
 * ## Same shape as tax identity
 *
 * `resolveTimezone` mirrors `resolveTaxIdentity`: a default, an optional
 * override, and a resolved value that says where it came from. One idiom for
 * inheritance across the estate, so an owner learns it once.
 *
 * ## Why it matters more than it looks
 *
 * A chain inside one emirate never notices. The moment it crosses one — and the
 * seeded estate already does, Dubai to Abu Dhabi to Sharjah — a day's takings,
 * a rota's Monday and a booking's "tomorrow" all depend on which zone the
 * branch is read in. Those three UAE emirates share a zone today, which is
 * exactly why this is easy to get wrong and never notice until a branch opens
 * somewhere that does not.
 */

/** IANA zone names, the only form that survives a daylight-saving change. */
export type Timezone = string

export type ResolvedTimezone = {
  value: Timezone
  /** Where the value came from, so a screen can say "inherited" honestly. */
  source: "business" | "location"
}

/**
 * The business default.
 *
 * Gulf Standard Time, because the seeded estate is UAE-wide and a default that
 * matched no branch would make every branch an override — which reads as nine
 * deliberate decisions where there are none.
 */
export const BUSINESS_TIMEZONE: Timezone = "Asia/Dubai"

/**
 * This branch's zone, and whether it is its own.
 *
 * An absent override is inheritance, not a blank: a branch with no opinion
 * follows the business and keeps following it when the business moves.
 */
export function resolveTimezone(
  businessDefault: Timezone,
  override: Timezone | undefined,
): ResolvedTimezone {
  if (override === undefined || override === "") {
    return { value: businessDefault, source: "business" }
  }
  return { value: override, source: "location" }
}

/**
 * What an override should become when somebody picks the default's own value.
 *
 * Storing it would freeze the branch at today's default: the business moves and
 * this branch silently does not, for a choice nobody meant to make. Matching
 * the default is the same as having no opinion, so it is stored as none.
 */
export function normaliseOverride(
  businessDefault: Timezone,
  picked: Timezone,
): Timezone | undefined {
  return picked === businessDefault ? undefined : picked
}

/** How many branches hold a zone of their own — what a bulk change would miss. */
export function overriddenCount(
  overrides: ReadonlyArray<Timezone | undefined>,
  businessDefault: Timezone,
): number {
  return overrides.filter((o) => resolveTimezone(businessDefault, o).source === "location").length
}

/**
 * The zones an estate is likely to reach for, with the city an operator would
 * recognise rather than the IANA string they would not.
 *
 * Not the full tz database: a picker with 400 rows is one nobody reads, and the
 * list a Gulf chain actually needs is short. Free text is worse — "GST" and
 * "+4" are not zones and break the first time a rule changes.
 */
export const TIMEZONE_OPTIONS: ReadonlyArray<{ id: Timezone; label: string }> = [
  { id: "Asia/Dubai", label: "Dubai · Abu Dhabi · Sharjah (GST, UTC+4)" },
  { id: "Asia/Riyadh", label: "Riyadh (AST, UTC+3)" },
  { id: "Asia/Qatar", label: "Doha (AST, UTC+3)" },
  { id: "Asia/Kuwait", label: "Kuwait (AST, UTC+3)" },
  { id: "Asia/Bahrain", label: "Manama (AST, UTC+3)" },
  { id: "Asia/Muscat", label: "Muscat (GST, UTC+4)" },
  { id: "Asia/Karachi", label: "Karachi (PKT, UTC+5)" },
  { id: "Europe/London", label: "London (GMT/BST)" },
]

/** The city an operator recognises, falling back to the zone itself. */
export function timezoneLabel(zone: Timezone): string {
  return TIMEZONE_OPTIONS.find((o) => o.id === zone)?.label ?? zone
}
