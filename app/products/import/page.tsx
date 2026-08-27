import type { Metadata } from "next"
import { Suspense } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ProductImportCompareShell } from "@/components/blocks/product-import/import-compare-shell"

export const metadata: Metadata = {
  title: "Import products",
  description: "Redesigned product import, with the as-built flow alongside it for comparison",
}

export default function ProductImportPage() {
  return (
    <AppShell header={null} contentClassName="pb-0">
      {/* The compare bar reads the query string, so it needs a boundary. */}
      <Suspense fallback={null}>
        <ProductImportCompareShell />
      </Suspense>
    </AppShell>
  )
}
