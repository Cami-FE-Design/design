"use client"

// The Google review link input — one component, used by Business details and by
// onboarding's About step. PRD-168.
//
// Shared rather than written twice because the interesting part is not the input,
// it's the validation: recognising that a merchant has pasted their Maps listing
// instead of their review link, and saying what that will do to the customer.
// Two copies of that would drift, and the copy that drifted would be the one
// that quietly stopped warning.

import { CircleAlertIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  checkGoogleReviewLink,
  GOOGLE_REVIEW_HELP_PATH,
  GOOGLE_REVIEW_HELP_URL,
} from "@/lib/business-links/links"
import { useBusinessLinks } from "@/lib/business-links/store"

type GoogleReviewLinkFieldProps = {
  id?: string
  inputRef?: (el: HTMLInputElement | null) => void
  /** Onboarding says why it's worth doing; settings can assume you know. */
  help?: "full" | "short"
}

/**
 * Commits on blur, not on every keystroke, so the settings summary row doesn't
 * flicker through half-typed URLs and nobody gets scolded mid-paste. Clicking
 * Save blurs the input first, so typing and saving in one motion still stores
 * the link.
 */
export function GoogleReviewLinkField({
  id = "google-review-link",
  inputRef,
  help = "short",
}: GoogleReviewLinkFieldProps) {
  const { googleReviewLink, setGoogleReviewLink } = useBusinessLinks()
  const [draft, setDraft] = useState(googleReviewLink)

  // Re-seed when the stored value changes underneath — reopening the dialog, or
  // the demo reset. Keyed on the stored value rather than on an open flag.
  useEffect(() => {
    setDraft(googleReviewLink)
  }, [googleReviewLink])

  const check = checkGoogleReviewLink(draft)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={id}>Google review link</Label>
        <Input
          id={id}
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => setGoogleReviewLink(draft)}
          placeholder="g.page/r/your-business/review"
          aria-invalid={check.kind === "invalid"}
          aria-describedby={`${id}-help`}
        />
      </div>

      {/* Two lengths, because the two surfaces have different budgets.
          Onboarding gets one line: this is the only optional field on a page of
          three required ones, and three lines of help under it made the least
          important thing on the step the heaviest — the merchant reads the
          explanation instead of filling in their business name. Settings has
          room, and is where someone has gone *looking* for this field, so it
          carries the path through Google's UI that stops them pasting a Maps
          URL. Either way the link carries the detail neither can fit. */}
      <p id={`${id}-help`} className="text-sm leading-5 text-muted-foreground">
        {help === "full" ? (
          <>Optional. Your thank-you message uses it to ask for a review. </>
        ) : (
          <>
            Sent as the review ask in your Thank You message. Paste the link from{" "}
            {GOOGLE_REVIEW_HELP_PATH}.{" "}
          </>
        )}
        <a
          href={GOOGLE_REVIEW_HELP_URL}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-70"
        >
          Where do I find it?
        </a>
      </p>

      {/* A listing URL saves. It is worse than a review link and much better
          than nothing, and a hard block here sends the merchant off to hunt for
          the right URL — which in practice means the field stays empty forever. */}
      {check.kind === "listing" ? (
        <p className="flex items-start gap-2 rounded-xl bg-cami-yellow-2 p-3 text-sm leading-5 text-cami-yellow-12">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0 text-cami-yellow-11" aria-hidden />
          <span>{check.message}</span>
        </p>
      ) : null}

      {check.kind === "invalid" ? (
        <p role="alert" className="text-sm leading-5 text-destructive">
          {check.message}
        </p>
      ) : null}
    </div>
  )
}
