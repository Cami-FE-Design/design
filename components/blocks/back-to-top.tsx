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
      variant="outline"
      radius="full"
      size="sm"
      // Respects a reduced-motion preference: the browser honours
      // `scroll-behavior: smooth` from CSS, so this stays an instant jump.
      onClick={() => window.scrollTo({ top: 0 })}
      className="fixed right-6 bottom-6 z-50 gap-1.5 bg-card shadow-lg"
    >
      <ArrowUpIcon className="size-4" aria-hidden />
      Top
    </Button>
  )
}
