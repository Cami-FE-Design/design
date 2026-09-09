"use client"

import { ArrowUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

/**
 * Floating "Top" button for the long index pages (/screens, /playground).
 *
 * Both run to dozens of sections, and scrolling back by hand to reach the
 * index at the top is the one thing a reader does on every visit. It stays
 * hidden until there is something to scroll back from, so it never covers
 * content on a short viewport for no reason.
 */
export function BackToTop({ showAfter = 600 }: { showAfter?: number }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [showAfter])

  if (!visible) return null

  return (
    <Button
      type="button"
      radius="full"
      // Filled, not outline: on an off-white page an outline pill on a card
      // background was easy to miss entirely — the same treatment the sticky
      // Checkout CTA uses, so it reads as the page's one floating action.
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="Back to top"
      className="fixed right-6 bottom-6 z-50 gap-1.5 px-5 shadow-xl ring-2 ring-background animate-in fade-in slide-in-from-bottom-2"
    >
      <ArrowUpIcon className="size-4" aria-hidden />
      Back to top
    </Button>
  )
}
