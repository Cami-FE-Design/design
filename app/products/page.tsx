"use client"

import {
  ArrowDownUpIcon,
  ChevronDownIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ImportIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TagIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useState } from "react"
import { AppShell } from "@/components/blocks/app-shell"
import { ConfirmDialog } from "@/components/blocks/confirm-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { ProductDetailDialog } from "@/components/blocks/product-detail-dialog"
import { MOCK_PRODUCTS, type Product, ProductsTable } from "@/components/blocks/products-table"
import { SelectBrandDialog } from "@/components/blocks/select-brand-dialog"
import { SelectCategoryDialog } from "@/components/blocks/select-category-dialog"
import { TableToolbar } from "@/components/blocks/table-toolbar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchInput } from "@/components/ui/search-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Sort options ─────────────────────────────────────────────────────────────

type SortKey =
  | "name-asc"
  | "name-desc"
  | "updated-desc"
  | "updated-asc"
  | "created-asc"
  | "created-desc"
  | "qty-desc"
  | "qty-asc"
  | "category-asc"
  | "category-desc"
  | "supplier-asc"
  | "supplier-desc"
  | "retail-asc"
  | "retail-desc"

const SORT_LABELS: Record<SortKey, string> = {
  "name-asc": "Product name (A–Z)",
  "name-desc": "Product name (Z–A)",
  "updated-desc": "Updated (newest first)",
  "updated-asc": "Updated (oldest first)",
  "created-desc": "Created (newest first)",
  "created-asc": "Created (oldest first)",
  "qty-desc": "Quantity (highest first)",
  "qty-asc": "Quantity (lowest first)",
  "category-asc": "Category (A–Z)",
  "category-desc": "Category (Z–A)",
  "supplier-asc": "Supplier (A–Z)",
  "supplier-desc": "Supplier (Z–A)",
  "retail-asc": "Retail price (lowest first)",
  "retail-desc": "Retail price (highest first)",
}

function sortProducts(products: Product[], key: SortKey): Product[] {
  return [...products].sort((a, b) => {
    switch (key) {
      case "name-asc":
        return a.name.localeCompare(b.name)
      case "name-desc":
        return b.name.localeCompare(a.name)
      case "category-asc":
        return a.category.localeCompare(b.category)
      case "category-desc":
        return b.category.localeCompare(a.category)
      case "retail-asc":
        return a.retailPrice - b.retailPrice
      case "retail-desc":
        return b.retailPrice - a.retailPrice
      default:
        return 0
    }
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProductsSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60">
      {/* Header row */}
      <div className="flex h-9 items-center gap-4 border-b border-border/60 bg-muted/30 px-4">
        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
        <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3 w-12 animate-pulse rounded bg-muted" />
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
        <div className="h-3 w-14 animate-pulse rounded bg-muted" />
      </div>
      {Array.from({ length: 5 }, (_, i) => `row-${i}`).map((key, i) => (
        <div
          key={key}
          className="flex items-center gap-4 border-b border-border/60 px-4 py-3.5 last:border-b-0"
          style={{ opacity: 1 - i * 0.15 }}
        >
          <div className="size-21.5 animate-pulse rounded-xl bg-muted" />
          <div className="h-3 w-48 animate-pulse rounded bg-muted" />
          <div className="ml-auto h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = "all" | "active" | "archived"

function ProductsIndex() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedProductId = searchParams.get("product")

  const setSelectedProductId = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (id) {
        params.set("product", id)
      } else {
        params.delete("product")
      }
      const qs = params.toString()
      router.replace(qs ? `?${qs}` : "?", { scroll: false })
    },
    [router, searchParams],
  )

  const [tab, setTab] = useState<Tab>("all")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("updated-desc")
  const [isLoading, setIsLoading] = useState(true)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  // Bulk selection — ids of rows ticked via the row/select-all checkboxes.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  // Prototype toggle: switch between empty and populated state
  const [showEmpty, setShowEmpty] = useState(false)

  function toggleSelect(id: string, next: boolean) {
    setSelectedIds((prev) => {
      const out = new Set(prev)
      if (next) out.add(id)
      else out.delete(id)
      return out
    })
  }

  function toggleSelectAll(ids: string[], next: boolean) {
    setSelectedIds((prev) => {
      const out = new Set(prev)
      for (const id of ids) {
        if (next) out.add(id)
        else out.delete(id)
      }
      return out
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  // Simulate a brief load on mount
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1400)
    return () => clearTimeout(t)
  }, [])

  const [mockProducts, setMockProducts] = useState<Product[]>(MOCK_PRODUCTS)
  const products: Product[] = showEmpty ? [] : mockProducts
  const activeProducts = products.filter((p) => p.status === "active")
  const archivedProducts = products.filter((p) => p.status === "archived")
  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? null

  function getVisible(list: Product[]) {
    let result = list
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.supplier ?? "").toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q),
      )
    }
    return sortProducts(result, sort)
  }

  // A tab shows the card empty-state when the search/filter leaves it with no
  // rows — mirrors the sales/clients/pets listings.
  function renderTab(list: Product[]) {
    const visible = getVisible(list)
    if (visible.length === 0) {
      return (
        <EmptyState
          variant="card"
          icon={PackageIcon}
          title="No products match"
          description="Try a different search."
        />
      )
    }
    return (
      <ProductsTable
        products={visible}
        onRowClick={setSelectedProductId}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
      />
    )
  }

  return (
    <AppShell
      header={
        <div className="flex w-full max-w-6xl items-center justify-between gap-3">
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-medium text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Options dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" radius="full" size="sm">
                  Options
                  <ChevronDownIcon className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onSelect={() => setBrandDialogOpen(true)}>
                  <PencilIcon className="size-4" />
                  Manage my brands
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setCategoryDialogOpen(true)}>
                  <TagIcon className="size-4" />
                  Manage my categories
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ImportIcon className="size-4" />
                  Import products
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Export</DropdownMenuLabel>
                <DropdownMenuItem>
                  <FileTextIcon className="size-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileSpreadsheetIcon className="size-4" />
                  Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add product */}
            <Button asChild radius="full">
              <Link href="/products/new">
                <PlusIcon className="size-4" />
                Add product
              </Link>
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        {isLoading ? (
          <>
            {/* Skeleton toolbar */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {[80, 60, 72].map((w) => (
                  <div
                    key={w}
                    className="h-8 animate-pulse rounded-full bg-muted"
                    style={{ width: w }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-56 animate-pulse rounded-full bg-muted" />
                <div className="size-8 animate-pulse rounded-full bg-muted" />
                <div className="h-8 w-32 animate-pulse rounded-full bg-muted" />
              </div>
            </div>
            <ProductsSkeleton />
          </>
        ) : products.length === 0 ? (
          /* Empty state — header already has Add product, no duplicate CTA here */
          <EmptyState
            icon={PackageIcon}
            title="No products yet"
            description="Add your first product to get started"
            className="py-24"
          />
        ) : (
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as Tab)
              clearSelection()
            }}
          >
            <TableToolbar
              tabs={
                <TabsList variant="ghost">
                  <TabsTrigger value="all">
                    All
                    <span className="text-sm font-normal text-muted-foreground">
                      {products.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active
                    <span className="text-sm font-normal text-muted-foreground">
                      {activeProducts.length}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="archived">
                    Archived
                    <span className="text-sm font-normal text-muted-foreground">
                      {archivedProducts.length}
                    </span>
                  </TabsTrigger>
                </TabsList>
              }
              actions={
                <>
                  <SearchInput
                    className="h-9! w-72"
                    placeholder="Search products"
                    aria-label="Search products"
                    onValueChange={(v) => {
                      setQuery(v)
                      clearSelection()
                    }}
                  />
                  <Button variant="outline" size="icon-sm" radius="full" aria-label="Filter">
                    <SlidersHorizontalIcon className="size-4" />
                  </Button>

                  {selectedIds.size > 0 ? (
                    // Selection active — replace the sort control with a count
                    // pill + Delete action, mirroring the bulk-edit toolbar.
                    <>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
                      >
                        {selectedIds.size} product{selectedIds.size > 1 ? "s" : ""} selected
                        <XIcon className="size-3.5 text-muted-foreground" />
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        radius="full"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => setBulkDeleteOpen(true)}
                      >
                        <Trash2Icon className="size-3.5" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    /* Sort by */
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" radius="full" className="gap-1.5">
                          <ArrowDownUpIcon className="size-3.5" />
                          {SORT_LABELS[sort]}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(
                          ([key, label]) => (
                            <DropdownMenuItem
                              key={key}
                              onSelect={() => setSort(key)}
                              data-active={sort === key}
                              className="data-[active=true]:font-semibold"
                            >
                              {label}
                            </DropdownMenuItem>
                          ),
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              }
            />

            <TabsContent value="all">{renderTab(products)}</TabsContent>
            <TabsContent value="active">{renderTab(activeProducts)}</TabsContent>
            <TabsContent value="archived">{renderTab(archivedProducts)}</TabsContent>
          </Tabs>
        )}

        {/* Prototype demo toggle */}
        {!isLoading && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowEmpty((v) => !v)}
              className="text-xs text-muted-foreground/40 transition-colors hover:text-muted-foreground"
            >
              {showEmpty ? "Show populated state" : "Show empty state"}
            </button>
          </div>
        )}
      </div>

      <ProductDetailDialog
        open={selectedProductId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProductId(null)
        }}
        product={selectedProduct}
        onDelete={(id) => {
          setMockProducts((prev) => prev.filter((p) => p.id !== id))
          setSelectedProductId(null)
        }}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title={`Delete ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}?`}
        description={
          selectedIds.size > 1
            ? "All data associated with these products will be permanently deleted."
            : "All data associated with this product will be permanently deleted."
        }
        cancelLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          setMockProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
          clearSelection()
        }}
      />

      <SelectBrandDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        onSelect={() => setBrandDialogOpen(false)}
      />

      <SelectCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSelect={() => setCategoryDialogOpen(false)}
      />
    </AppShell>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsIndex />
    </Suspense>
  )
}
