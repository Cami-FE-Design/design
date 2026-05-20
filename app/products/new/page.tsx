"use client"

import { XIcon } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import { ProductForm } from "@/components/blocks/product-form"
import { ProductPhotosCard } from "@/components/blocks/product-photos-card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NewProductPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)

  function handleScroll() {
    const el = scrollRef.current
    const heading = titleRef.current
    if (!el || !heading) return
    const titleRect = heading.getBoundingClientRect()
    const containerRect = el.getBoundingClientRect()
    setShowHeaderTitle(titleRect.bottom < containerRect.top)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Sticky header — mirrors FullScreenEditDialog ─────────────── */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          {/* Fading title (appears once big h1 scrolls out of view) */}
          <span
            className={cn(
              "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
              showHeaderTitle ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!showHeaderTitle}
          >
            Add new product
          </span>

          <div className="ms-auto flex items-center gap-2">
            {/* Mobile: X icon only */}
            <Button
              variant="ghost"
              size="icon-lg"
              radius="full"
              aria-label="Close"
              asChild
              className="lg:hidden"
            >
              <Link href="/products">
                <XIcon className="size-5" />
              </Link>
            </Button>
            {/* Desktop: outline Close pill */}
            <Button
              variant="outline"
              size="lg"
              radius="full"
              asChild
              className="hidden lg:inline-flex"
            >
              <Link href="/products">Close</Link>
            </Button>
            {/* Save */}
            <Button size="lg" radius="full" className="hidden lg:inline-flex">
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* ── Scrollable content ──────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-6 py-12 lg:px-10"
        onScroll={handleScroll}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
          {/* Big page title (fades out of view on scroll → header title fades in) */}
          <h1
            ref={titleRef}
            className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
          >
            Add new product
          </h1>

          <div className="flex gap-8">
            {/* Left: form sections */}
            <div className="flex min-w-0 flex-1 flex-col gap-6">
              <ProductForm />
            </div>

            {/* Right: product photos (sticky relative to scroll container) */}
            <div className="w-72 shrink-0">
              <div className="sticky top-0">
                <ProductPhotosCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
