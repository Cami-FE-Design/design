"use client"

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react"
import { useState } from "react"
import { ProductImagePlaceholder } from "@/components/blocks/product-image-placeholder"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type Product = {
  id: string
  name: string
  barcode?: string
  brand: string
  category: string
  sku: string
  supplier?: string
  supplyPrice: number
  retailPrice: number
  status: "active" | "archived"
  /** Seed strings for placeholder tiles in the detail dialog. Empty/undefined hides the photos card. */
  photos?: string[]
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wahl Professional Shampoo",
    barcode: "WHL-SH-001A",
    brand: "Wahl",
    category: "Shampoos",
    sku: "WHL-001",
    supplier: "Pet Supplies Plus",
    supplyPrice: 450,
    retailPrice: 750,
    status: "active",
    photos: ["a", "b", "c", "d", "e"],
  },
  {
    id: "p2",
    name: "Furminator Deshedding Tool",
    brand: "Furminator",
    category: "Tools & Equipment",
    sku: "FRM-002",
    supplier: "Chewy Wholesale",
    supplyPrice: 1200,
    retailPrice: 1800,
    status: "active",
    photos: ["a", "b"],
  },
  {
    id: "p3",
    name: "Burt's Bees Hypoallergenic Shampoo",
    barcode: "BB-HYPO",
    brand: "Burt's Bees",
    category: "Shampoos",
    sku: "BB-003",
    supplier: "Pet Supplies Plus",
    supplyPrice: 320,
    retailPrice: 550,
    status: "active",
  },
  {
    id: "p4",
    name: "Andis Excel Pro-Animal Clipper",
    brand: "Andis",
    category: "Tools & Equipment",
    sku: "AND-004",
    supplyPrice: 3500,
    retailPrice: 5200,
    status: "archived",
    photos: ["a", "b", "c"],
  },
  {
    id: "p5",
    name: "TropiClean Perfect Fur Shampoo",
    brand: "TropiClean",
    category: "Shampoos",
    sku: "TC-005",
    supplier: "Chewy Wholesale",
    supplyPrice: 280,
    retailPrice: 450,
    status: "archived",
    photos: ["a"],
  },
]

function formatPrice(amount: number) {
  return `AED ${amount.toLocaleString()}`
}

type SortField = "name" | "retailPrice"
type SortDir = "asc" | "desc"

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField
  sortField: SortField | null
  sortDir: SortDir
}) {
  if (sortField !== field) return <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />
  return sortDir === "asc" ? (
    <ArrowUpIcon className="size-3.5 text-foreground" />
  ) : (
    <ArrowDownIcon className="size-3.5 text-foreground" />
  )
}

type ProductsTableProps = {
  products: Product[]
  onRowClick: (productId: string) => void
  /**
   * When provided, a checkbox column is rendered (select-all in the header,
   * one per row). Omit to render the table without selection.
   */
  selectedIds?: Set<string>
  onToggleSelect?: (id: string, next: boolean) => void
  /** Toggle every currently-visible row. `ids` are the rows shown in this table. */
  onToggleSelectAll?: (ids: string[], next: boolean) => void
}

export function ProductsTable({
  products,
  onRowClick,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: ProductsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = sortField
    ? [...products].sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1
        if (sortField === "name") return mul * a.name.localeCompare(b.name)
        return mul * (a.retailPrice - b.retailPrice)
      })
    : products

  // Selection is enabled only when the page passes a `selectedIds` set.
  const selectable = selectedIds !== undefined
  const visibleIds = sorted.map((p) => p.id)
  const selectedVisible = visibleIds.filter((id) => selectedIds?.has(id)).length
  const allChecked: boolean | "indeterminate" =
    selectedVisible === 0 ? false : selectedVisible === visibleIds.length ? true : "indeterminate"

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        No products match this filter.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 z-20! bg-background shadow-[1px_0_0_0_var(--border)] md:static md:bg-transparent md:shadow-none">
            <div className="flex items-center gap-3">
              {selectable ? (
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(c) => onToggleSelectAll?.(visibleIds, c === true)}
                  aria-label="Select all products"
                />
              ) : null}
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="flex items-center gap-1.5 font-medium hover:text-foreground"
              >
                Product
                <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
              </button>
            </div>
          </TableHead>
          <TableHead className="min-w-36">Category</TableHead>
          <TableHead className="min-w-40">Supplier</TableHead>
          <TableHead className="min-w-32">
            <button
              type="button"
              onClick={() => toggleSort("retailPrice")}
              className="flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              Retail price
              <SortIcon field="retailPrice" sortField={sortField} sortDir={sortDir} />
            </button>
          </TableHead>
          <TableHead className="min-w-24">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((product) => (
          <TableRow
            key={product.id}
            className="group cursor-pointer"
            onClick={() => onRowClick(product.id)}
          >
            <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors group-hover:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))] md:static md:bg-transparent md:shadow-none md:group-hover:bg-transparent">
              <div className="flex items-center gap-3">
                {selectable ? (
                  <Checkbox
                    checked={selectedIds?.has(product.id) ?? false}
                    // Stop the click bubbling to the row (which opens the detail
                    // dialog) so the checkbox only toggles selection.
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={(c) => onToggleSelect?.(product.id, c === true)}
                    aria-label={`Select ${product.name}`}
                  />
                ) : null}
                <ProductImagePlaceholder seed={product.id} className="size-21.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                  {product.barcode && (
                    <span className="font-mono text-xs text-muted-foreground">
                      Barcode: {product.barcode}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {product.supplier ?? "–"}
            </TableCell>
            <TableCell className="text-sm whitespace-nowrap text-foreground">
              {formatPrice(product.retailPrice)}
            </TableCell>
            <TableCell>
              <Badge variant={product.status === "active" ? "default" : "secondary"}>
                {product.status === "active" ? "Active" : "Archived"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
