"use client"

import { XIcon } from "lucide-react"
import Link from "next/link"
import { use, useRef, useState } from "react"
import {
  PRODUCT_SECTIONS,
  ProductForm,
  type ProductFormInitialValues,
  type ProductFormSectionId,
  type ProductSectionId,
} from "@/components/blocks/product-form"
import { ProductPhotosCard } from "@/components/blocks/product-photos-card"
import { MOCK_PRODUCTS } from "@/components/blocks/products-table"
import { SectionNav } from "@/components/blocks/section-nav"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Map a mock Product row into ProductForm initial values
function toInitialValues(product: (typeof MOCK_PRODUCTS)[number]): ProductFormInitialValues {
  return {
    name: product.name,
    brand: { id: product.brand.toLowerCase().replace(/\s+/g, "-"), name: product.brand },
    category: {
      id: product.category.toLowerCase().replace(/\s+/g, "-"),
      name: product.category,
    },
    skus: [product.sku],
    supplyPrice: String(product.supplyPrice),
    retailEnabled: true,
    retailPrice: String(product.retailPrice),
    trackStock: true,
  }
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const product = MOCK_PRODUCTS.find((p) => p.id === id)

  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [showHeaderTitle, setShowHeaderTitle] = useState(false)
  const [section, setSection] = useState<ProductSectionId>("basics")
  const formSection: ProductFormSectionId = section === "photos" ? "basics" : section

  function handleScroll() {
    const el = scrollRef.current
    const heading = titleRef.current
    if (!el || !heading) return
    setShowHeaderTitle(heading.getBoundingClientRect().bottom < el.getBoundingClientRect().top)
  }

  if (!product) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-sm text-muted-foreground">Product not found.</p>
        <Button variant="outline" radius="full" asChild>
          <Link href="/products">Back to products</Link>
        </Button>
      </div>
    )
  }

  const initialValues = toInitialValues(product)

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* ── Sticky header — same as /products/new ─────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background px-6 py-3 lg:px-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <span
            className={cn(
              "min-w-0 truncate font-heading text-base font-semibold leading-6 text-foreground transition-opacity duration-200",
              showHeaderTitle ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={!showHeaderTitle}
          >
            Edit product
          </span>

          <div className="ms-auto flex items-center gap-2">
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
            <Button
              variant="outline"
              size="lg"
              radius="full"
              asChild
              className="hidden lg:inline-flex"
            >
              <Link href="/products">Close</Link>
            </Button>
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
          <h1
            ref={titleRef}
            className="font-heading text-2xl font-semibold leading-tight text-foreground lg:text-4xl"
          >
            Edit product
          </h1>

          <div className="grid min-w-0 grid-cols-1 gap-8 md:grid-cols-[260px_minmax(0,1fr)]">
            <SectionNav sections={PRODUCT_SECTIONS} active={section} onChange={setSection} />

            <div className="min-w-0">
              <div hidden={section === "photos"}>
                <ProductForm initialValues={initialValues} section={formSection} />
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
