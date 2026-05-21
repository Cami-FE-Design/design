"use client"

import { XIcon } from "lucide-react"
import Link from "next/link"
import { useRef, useState } from "react"
import {
  PRODUCT_SECTIONS,
  ProductForm,
  type ProductFormSectionId,
  type ProductSectionId,
} from "@/components/blocks/product-form"
import { ProductPhotosCard } from "@/components/blocks/product-photos-card"
import { SectionNav } from "@/components/blocks/section-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NewProductPage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const [section, setSection] = useState<ProductSectionId>("basics")
  const formSection: ProductFormSectionId = section === "photos" ? "basics" : section

  function handleScroll() {
    const el = scrollRef.current
    const heading = titleRef.current
    if (!el || !heading) return
    const titleRect = heading.getBoundingClientRect()
    const containerRect = el.getBoundingClientRect()
    setShowHeaderTitle(titleRect.bottom < containerRect.top)
  }

  return (
    <div className="flex h-screen flex-col bg-white-a11">
      {/* ── Sticky header — mirrors FullScreenEditDialog ─────────────── */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-white-a11 px-6 py-3 lg:px-10">
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
              Add product
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
          <div className="flex flex-col gap-3">
            <h1
              ref={titleRef}
              className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
            >
              Add new product
            </h1>
            <p className="max-w-2xl text-base leading-6 text-muted-foreground">
              Only the product name is required. Everything else can be filled later from the
              product page.
            </p>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
            <SectionNav sections={PRODUCT_SECTIONS} active={section} onChange={setSection} />

            <div className="min-w-0">
              <div hidden={section === "photos"}>
                <ProductForm section={formSection} />
              </div>
              <div hidden={section !== "photos"}>
                <ProductPhotosCard />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
