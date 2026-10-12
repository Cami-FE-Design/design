"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  PRODUCT_SECTIONS,
  ProductForm,
  type ProductFormSectionId,
  type ProductSectionId,
} from "@/components/blocks/products/product-form"
import { ProductPhotosCard } from "@/components/blocks/products/product-photos-card"
import { FullScreenEditDialog } from "@/components/blocks/shared/full-screen-edit-dialog"
import { SectionNav } from "@/components/blocks/shared/section-nav"

export default function NewProductPage() {
  const router = useRouter()
  const [section, setSection] = useState<ProductSectionId>("basics")
  const formSection: ProductFormSectionId = section === "photos" ? "basics" : section

  return (
    <FullScreenEditDialog
      open
      onOpenChange={(o) => {
        if (!o) router.push("/products")
      }}
      title="Add new product"
      subtitle="Only the product name is required. Everything else can be filled later from the product page."
      saveLabel="Add product"
      // The prototype does not create products yet; the button is here for
      // the layout, as it was before this page used the shared takeover.
      onSave={() => {}}
    >
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
    </FullScreenEditDialog>
  )
}
