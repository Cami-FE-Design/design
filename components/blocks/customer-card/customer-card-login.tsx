"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { VenueBackdrop } from "@/components/blocks/customer-card/venue-backdrop"
import { Avatar } from "@/components/ui/avatar"

import { type CustomerCardTheme, themeVars } from "@/lib/customer-card/theme"
import type { PublicBusiness } from "@/lib/public-business"

/**
 * The door — Task 3 of the Client Card brief. Every confirmation, reminder and
 * membership nudge carries the same link; tapping it lands here, branded to
 * whichever venue sent the message, and continuing lands on that venue's card.
 *
 * **Settled 2026-09-11: the token in the link is the credential.** One tap from
 * WhatsApp, no code, no round trip. The alternative — token identifies you, a
 * code confirms you — is safe and kills the one-tap story, and the one-tap
 * story is the whole reason this door exists rather than a password login.
 *
 * That choice has a cost, and it is worth naming rather than discovering: people
 * forward confirmations. Maaz sends his booking to the family group to say he's
 * in on Thursday, and the link goes with it. Cami already ships this pattern at
 * /pay/[token] and /sign/[token], but those are single-use and short-lived,
 * where this one rides in every message.
 *
 * Two things keep the cost bounded, and both are load-bearing:
 *
 *   - The card is READ-ONLY. Nothing on it spends a balance or edits a detail —
 *     preferences say "Maintained by <venue>" and Book again leaves for the
 *     public booking page. A leaked link exposes information; it cannot be used
 *     to take anything. Any future "edit your details" or "redeem" control on
 *     this surface breaks that and needs its own step-up.
 *   - The screen below names whose card is about to open, and says the link
 *     is personal. On a shared phone, and on a forwarded message, that is the
 *     only moment anyone is told.
 *
 * So this screen confirms an identity rather than verifying one — Continue is
 * not a check, and is not pretending to be.
 */
export function CustomerCardLogin({
  business,
  theme,
  email,
}: {
  business: PublicBusiness
  theme: CustomerCardTheme
  email: string
}) {
  const router = useRouter()
  const [value, setValue] = useState(email)
  const [pending, setPending] = useState(false)

  return (
    <div
      style={themeVars(theme)}
      className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--cc-shell)] px-5 py-12 text-[var(--cc-text)]"
    >
      <VenueBackdrop business={business} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setPending(true)
          router.push(`/${business.slug}/card`)
        }}
        className="relative flex w-full max-w-[380px] flex-col items-center gap-6 rounded-3xl bg-[var(--cc-surface)] px-6 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8"
      >
        <VenueMark business={business} />
        <p className="text-center text-sm text-[var(--cc-muted)]">
          Confirm your email to open your card.
        </p>
        <label className="w-full">
          <span className="sr-only">Email</span>
          <input
            type="email"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="email"
            className="h-12 w-full rounded-xl border border-[var(--cc-border)] bg-[var(--cc-surface-muted)] px-4 text-sm text-[var(--cc-text)] outline-none focus-visible:border-[var(--cc-accent)]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--cc-accent)] text-sm font-semibold tracking-[0.14em] text-[var(--cc-accent-fg)] uppercase transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {pending ? "Opening…" : "Continue"}
        </button>
        <p className="text-center text-xs text-[var(--cc-muted)]">
          No password needed — this link is personal to you, so please don't forward it.
        </p>
      </form>
    </div>
  )
}

function VenueMark({ business }: { business: PublicBusiness }) {
  return (
    <>
      <Avatar
        size="xl"
        fallback="initials"
        name={business.businessName}
        src={business.logoUrl}
        hashSeed={business.slug}
        className="border border-[var(--cc-border)]"
      />
      <span className="font-heading text-2xl font-semibold tracking-[0.32em] text-[var(--cc-accent)] uppercase">
        {business.displayName}
      </span>
    </>
  )
}

/**
 * What a stale link opens.
 *
 * This screen is the reason the token-as-credential choice is defensible at all:
 * expiry is what stops a forwarded confirmation from being a permanent key. It
 * has to be a real branded screen rather than a 404, because the person hitting
 * it is a customer who did nothing wrong — they tapped a link in a message their
 * salon sent them — and a not-found page reads as "your salon's link is broken".
 *
 * It names no balance, no appointment and no preference. Whoever is holding a
 * stale link has not been verified, so the only thing this screen may reveal is
 * that the link is past its date.
 *
 * **PRD-176 D4, settled: 30 days from send, a new token per message, and old
 * tokens live out their own 30 days rather than dying when a newer one goes.**
 * Every part of that is load-bearing for a sentence on this screen. Because
 * each message carries its own link, nobody has a permanent key; because old
 * ones keep working until their own date, a customer scrolling back two weeks
 * is not told their link "was replaced" — a sentence G7 never promised and this
 * screen therefore never has to say. And because reminders and confirmations
 * keep going out, an active customer always holds a live one. The number is a
 * setting on the Tech side, so 30 is the copy's claim rather than a constant
 * this screen owns; change one and change the other.
 */
export function CustomerCardLinkExpired({
  business,
  theme,
}: {
  business: PublicBusiness
  theme: CustomerCardTheme
}) {
  return (
    <div
      style={themeVars(theme)}
      className="relative flex min-h-dvh flex-col items-center justify-center bg-[var(--cc-shell)] px-5 py-12 text-[var(--cc-text)]"
    >
      <VenueBackdrop business={business} />
      <div className="relative flex w-full max-w-[380px] flex-col items-center gap-6 rounded-3xl bg-[var(--cc-surface)] px-6 py-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)] sm:px-8">
        <VenueMark business={business} />
        <p className="text-center text-sm text-[var(--cc-muted)]">
          This link has expired. Every link is personal and lasts 30 days, and a fresh one goes out
          with every booking and reminder — so the newest message always works.
        </p>
        <Link
          href={`/${business.slug}/book`}
          className="flex h-12 w-full items-center justify-center rounded-full bg-[var(--cc-accent)] text-sm font-semibold tracking-[0.14em] text-[var(--cc-accent-fg)] uppercase transition-opacity hover:opacity-90"
        >
          Book again
        </Link>
        <p className="text-center text-xs text-[var(--cc-muted)]">
          Your next confirmation from {business.displayName} will carry a new link.
        </p>
      </div>
    </div>
  )
}
