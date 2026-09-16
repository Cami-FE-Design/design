import { describe, expect, it } from "vitest"
import { isLineScoped, resolveTemplate, sampleTokens } from "@/lib/comms/tokens"

// The behaviour under test is PRD-168's fallback decision: a missing review link
// takes its whole line with it, rather than leaving "⭐ Rate your experience:"
// with nothing after it — which is what DZ-263 reported shipping to every
// completed appointment.

const THANK_YOU = `Hi {{client}}!

📋 Your invoice: {{invoiceLink}}
⭐ Rate your experience: {{reviewLink}}
📅 Book the next visit: {{bookingLink}}

Team {{business}} x`

describe("resolveTemplate", () => {
  it("drops the line when a line-scoped token has no value", () => {
    const out = resolveTemplate(THANK_YOU, {
      client: "Tom",
      invoiceLink: "getcami.io/i/1",
      bookingLink: "getcami.io/x",
      business: "Shampooch",
    })
    expect(out).not.toContain("Rate your experience")
    // The lines either side survive — only the review line goes.
    expect(out).toContain("📋 Your invoice: getcami.io/i/1")
    expect(out).toContain("📅 Book the next visit: getcami.io/x")
  })

  it("resolves the card link from the venue, not from the typed name", () => {
    // PRD-176 G8 against real venue data: "Sota Hair Studio" is the venue at
    // /sota, so slugifying the name would have pointed the link at a venue that
    // does not exist — and then dropped the line for a business that has a card.
    expect(sampleTokens("Sota Hair Studio").cardLink).toBe("getcami.io/sota/card")
    // A merchant who renamed the demo to a prospect's name has no card to link.
    expect(sampleTokens("Aziz Salon").cardLink).toBeUndefined()
  })

  it("keeps the line once the link is set", () => {
    const out = resolveTemplate(THANK_YOU, {
      client: "Tom",
      invoiceLink: "getcami.io/i/1",
      reviewLink: "g.page/r/x/review",
      bookingLink: "getcami.io/x",
      business: "Shampooch",
    })
    expect(out).toContain("⭐ Rate your experience: g.page/r/x/review")
  })

  it("treats an empty string as unset, not as a value", () => {
    // The store holds "" for "never filled in", so this is the common case
    // rather than an edge one.
    const out = resolveTemplate("⭐ {{reviewLink}}", { reviewLink: "" })
    expect(out).toBe("")
  })

  it("drops the card line for a business that has no customer card", () => {
    // PRD-176 G8, the same shape as the review link above: a venue not on the
    // customer card has no URL to offer, so the line leaves the message.
    const out = resolveTemplate("Your card: {{cardLink}}\nSee you soon.", {
      business: "Shampooch",
    })
    expect(out).toBe("See you soon.")
  })

  it("closes the gap a dropped line leaves between paragraphs", () => {
    // A line sitting alone between two blanks is the email shape, and leaving
    // both blanks behind reads as a hole in the message.
    const out = resolveTemplate("One.\n\nYour card: {{cardLink}}\n\nTwo.", {})
    expect(out).toBe("One.\n\nTwo.")
  })

  it("still falls back readably for ordinary tokens", () => {
    // Prose degrades; "Hi there" beats "Hi ,". Only URLs drop their line.
    expect(resolveTemplate("Hi {{client}},", {})).toBe("Hi there,")
  })

  it("leaves an unrecognised token as written", () => {
    expect(resolveTemplate("Save {{discout}}", {})).toBe("Save {{discout}}")
  })
})

describe("sampleTokens", () => {
  it("omits the review link when the merchant has none, so the preview is honest", () => {
    expect(sampleTokens("Shampooch").reviewLink).toBeUndefined()
  })

  it("uses the merchant's real link rather than an example", () => {
    expect(sampleTokens("Shampooch", "g.page/r/real/review").reviewLink).toBe(
      "g.page/r/real/review",
    )
  })
})

describe("isLineScoped", () => {
  it("is true only for the review link", () => {
    expect(isLineScoped("reviewLink")).toBe(true)
    expect(isLineScoped("cardLink")).toBe(true)
    expect(isLineScoped("bookingLink")).toBe(false)
    expect(isLineScoped("client")).toBe(false)
  })
})
