"use client"

import { PackageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
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
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wahl Professional Shampoo",
    barcode: "8901234567890",
    brand: "Wahl",
    category: "Shampoos",
    sku: "WHL-001",
    supplier: "Pet Supplies Plus",
    supplyPrice: 450,
    retailPrice: 750,
    status: "active",
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
  },
  {
    id: "p3",
    name: "Burt's Bees Hypoallergenic Shampoo",
    barcode: "7501234567890",
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
  },
]

function formatPrice(amount: number) {
  return `AED ${amount.toLocaleString()}`
}

type ProductsTableProps = {
  products: Product[]
  onRowClick: (productId: string) => void
}

export function ProductsTable({ products, onRowClick }: ProductsTableProps) {
  if (products.length === 0) {
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
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Retail price</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow
            key={product.id}
            className="cursor-pointer"
            onClick={() => onRowClick(product.id)}
          >
            <TableCell>
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <PackageIcon className="size-4 text-muted-foreground" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{product.name}</span>
                  {product.barcode && (
                    <span className="font-mono text-xs text-muted-foreground">
                      {product.barcode}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {product.supplier ?? "–"}
            </TableCell>
            <TableCell className="text-sm text-foreground">
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
