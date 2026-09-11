// Template token model — the {{placeholder}} vocabulary every merchant-authored
// message is written against, and the one function that resolves them.
//
// Moved here from app/appointments/mock.ts (which re-exports for its existing
// callers) because the settings-side template editor needs the same vocabulary,
// and a settings panel importing from an `app/appointments` mock is backwards.
// Spec: docs/specs/DSG-83-communication-templates.md
//
// The single decision worth reading: TOKENS is the source of truth, and both
// TemplateTokens and TEMPLATE_FALLBACK are derived from it by key. The editor's
// insertable chips, the preview's sample values, and the runtime fallbacks all
// read one list, so a token can't exist in the editor and be unresolvable at
// send time — which is exactly the bug a second hand-maintained list produces.

/**
 * Every token a merchant may write into a template.
 *
 * `fallback` is what sends when the booking has no value for it — deliberately
 * a readable phrase rather than a blank, because a message reading "Hi ," is
 * worse than one reading "Hi there". `example` is what the editor preview
 * substitutes, and it has to look like real data or the preview stops being a
 * useful proofreading surface.
 */
export const TOKENS = [
  {
    key: "client",
    label: "Client name",
    fallback: "there",
    example: "Tom",
    description: "The pet parent's first name.",
  },
  {
    key: "service",
    label: "Service",
    fallback: "your appointment",
    example: "Full groom",
    description: "The booked service. Multiple services read as a list.",
  },
  {
    key: "staff",
    label: "Staff member",
    fallback: "our team",
    example: "Aisha",
    description: "Who the appointment is with.",
  },
  {
    key: "date",
    label: "Date",
    fallback: "the scheduled date",
    example: "Tue 2 Sep",
    description: "Appointment date, in the business's locale.",
  },
  {
    key: "time",
    label: "Time",
    fallback: "the scheduled time",
    example: "2:30 PM",
    description: "Appointment start time.",
  },
  {
    key: "business",
    label: "Business name",
    fallback: "our salon",
    // Placeholder only. The real value is the merchant's own name, which is
    // configurable (lib/demo-business) — sampleTokens() substitutes it, so no
    // preview ever shows a business name that isn't theirs.
    example: "your business",
    description: "Your business name, as customers know it.",
  },
  {
    key: "pet",
    label: "Pet name",
    fallback: "your pet",
    example: "Luna",
    description: "The pet on the booking.",
  },
  {
    key: "location",
    label: "Location",
    fallback: "our salon",
    example: "Jumeirah Village Circle",
    description: "Branch name and address line.",
  },
  {
    key: "paymentLink",
    label: "Payment link",
    fallback: "the payment link",
    example: "pay.getcami.io/4821",
    description: "CamiPay checkout link for a deposit or balance.",
  },
  {
    key: "bookingLink",
    label: "Booking link",
    fallback: "our booking page",
    // Slug is derived from the live business name in sampleTokens(), not fixed.
    example: "getcami.io/your-business",
    description: "Your public booking page, for rebooking.",
  },
  {
    key: "invoiceLink",
    label: "Invoice link",
    fallback: "your invoice",
    example: "getcami.io/i/4821",
    description: "The invoice for this visit, on the pet parent's own page.",
  },
  {
    key: "reviewLink",
    label: "Google review link",
    // Empty, and the only token with no readable stand-in. See `lineScoped`.
    fallback: "",
    example: "g.page/r/CaMi0Ex4mPl3/review",
    description: "Your Google review link. Set under Business details.",
    /**
     * When this resolves to nothing, the whole line goes — not just the value.
     *
     * Every other token has a readable fallback because prose degrades: "Hi
     * there" beats "Hi ,". A URL has no such stand-in. The sentence around it
     * ("⭐ Rate your pet's experience:") is an instruction to click something,
     * so with the link missing it isn't degraded copy, it's a dangling label —
     * which is exactly what DZ-263 reported shipping to every completed
     * appointment. Dropping the line sends a clean message that is simply one
     * bullet shorter, and gives the customer nothing to wonder about.
     */
    lineScoped: true,
  },
] as const

export type TemplateTokenKey = (typeof TOKENS)[number]["key"]

/** Values a caller supplies for one send. Every token is optional; missing ones fall back. */
export type TemplateTokens = Partial<Record<TemplateTokenKey, string>>

const TEMPLATE_FALLBACK = Object.fromEntries(TOKENS.map((t) => [t.key, t.fallback])) as Record<
  TemplateTokenKey,
  string
>

/**
 * Raw examples by key, for preview chrome that needs one value without building
 * a whole token set — the recipient on a From/To line, say. Anything derived
 * from the business name must go through `sampleTokens()` instead.
 */
export const TOKEN_EXAMPLE = Object.fromEntries(TOKENS.map((t) => [t.key, t.example])) as Record<
  TemplateTokenKey,
  string
>

/**
 * Tokens whose absence removes the line they sit on. Derived from TOKENS so the
 * behaviour is declared next to the token it belongs to rather than in a second
 * list that can disagree with it.
 */
const LINE_SCOPED: ReadonlySet<TemplateTokenKey> = new Set(
  TOKENS.filter((t) => "lineScoped" in t && t.lineScoped).map((t) => t.key),
)

/** Whether a token drops its line when it has no value. Powers the editor hint. */
export function isLineScoped(key: TemplateTokenKey): boolean {
  return LINE_SCOPED.has(key)
}

/**
 * Sample values for the editor preview. Reads TOKENS so it can't drift from the
 * chip list.
 *
 * The business name is passed in, never baked in: it's configurable
 * (lib/demo-business, and the demo rename control), so a fixed one would show a
 * merchant a preview of somebody else's messages. The three tokens derived from
 * it — business, location, bookingLink — are all substituted here rather than at
 * each call site, so none of them can be missed.
 */
export function sampleTokens(
  businessName: string,
  googleReviewLink?: string | null,
): TemplateTokens {
  const base: TemplateTokens = { ...TOKEN_EXAMPLE }
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const sample: TemplateTokens = {
    ...base,
    business: businessName,
    location: `${businessName}, ${base.location}`,
    bookingLink: `getcami.io/${slug || "your-business"}`,
  }
  // The review link is the merchant's real setting, not an example, so the
  // preview shows the message that actually sends. With nothing set, the token
  // is left absent and its line drops — which is the point of previewing it.
  if (googleReviewLink) sample.reviewLink = googleReviewLink
  else delete sample.reviewLink
  return sample
}

/**
 * Replace {{token}} placeholders with booking values; missing values fall back.
 *
 * An unrecognised token is left as literal `{{whatever}}` rather than blanked.
 * A merchant who typos a token name needs to see it in the preview — silently
 * deleting it means the message ships with a hole nobody noticed.
 *
 * Resolution is line by line rather than one pass over the whole body, because
 * a line-scoped token with no value takes its line with it (see `lineScoped` on
 * TOKENS). Doing that here rather than at each call site means no caller can
 * forget, and means the editor preview shows the merchant exactly the message
 * that sends — including the line that won't be in it.
 */
export function resolveTemplate(body: string, tokens: TemplateTokens): string {
  const kept: string[] = []
  for (const line of body.split("\n")) {
    if (dropsLine(line, tokens)) continue
    kept.push(
      line.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
        const k = key as TemplateTokenKey
        return tokens[k] ?? TEMPLATE_FALLBACK[k] ?? `{{${key}}}`
      }),
    )
  }
  return kept.join("\n")
}

/** True when a line carries a line-scoped token that has no value to render. */
function dropsLine(line: string, tokens: TemplateTokens): boolean {
  for (const match of line.matchAll(/\{\{(\w+)\}\}/g)) {
    const k = match[1] as TemplateTokenKey
    if (LINE_SCOPED.has(k) && !tokens[k]) return true
  }
  return false
}

/** Tokens a body actually uses, in first-appearance order. Powers "used here" hints. */
export function tokensUsed(body: string): TemplateTokenKey[] {
  const seen: TemplateTokenKey[] = []
  for (const match of body.matchAll(/\{\{(\w+)\}\}/g)) {
    const k = match[1] as TemplateTokenKey
    if (TOKENS.some((t) => t.key === k) && !seen.includes(k)) seen.push(k)
  }
  return seen
}

/** Token names in a body that aren't in TOKENS — surfaced in the editor as a warning. */
export function unknownTokens(body: string): string[] {
  const seen: string[] = []
  for (const match of body.matchAll(/\{\{(\w+)\}\}/g)) {
    const k = match[1]
    if (!TOKENS.some((t) => t.key === k) && !seen.includes(k)) seen.push(k)
  }
  return seen
}
