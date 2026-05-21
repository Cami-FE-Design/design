"use client"

import {
  CircleMinusIcon,
  CirclePlusIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AddStockDialog } from "@/components/blocks/add-stock-dialog"
import { DeleteProductDialog } from "@/components/blocks/delete-product-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { ProductImagePlaceholder } from "@/components/blocks/product-image-placeholder"
import type { Product } from "@/components/blocks/products-table"
import { RemoveStockDialog } from "@/components/blocks/remove-stock-dialog"
import { SectionCard } from "@/components/blocks/section-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground">{value ?? "–"}</span>
    </div>
  )
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div>
}

function SectionDivider() {
  return <div className="border-t border-border/60" />
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ProductDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onDelete?: (id: string) => void
}

type TabId = "details" | "stock-orders" | "sales" | "stock-history"

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductDetailDialog({
  open,
  onOpenChange,
  product,
  onDelete,
}: ProductDetailDialogProps) {
  const router = useRouter()
  const [tab, setTab] = useState<TabId>("details")
  const [addStockOpen, setAddStockOpen] = useState(false)
  const [removeStockOpen, setRemoveStockOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!product) return null

  const stockOnHand = 0

  function handleEdit() {
    onOpenChange(false)
    router.push(`/products/${product!.id}/edit`)
  }

  function handleDelete() {
    onDelete?.(product!.id)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="flex h-200 max-h-[calc(100vh-100px)] max-w-157.5! flex-col gap-0 p-0 sm:max-w-157.5!"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabId)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-8.5 pb-5">
                <ProductImagePlaceholder seed={product.id} className="size-12" />

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <DialogTitle className="truncate text-[22px] leading-7 font-semibold">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription asChild>
                    <div>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-tomato-3 text-tomato-11 hover:bg-tomato-3"
                      >
                        {stockOnHand} in stock
                      </Badge>
                    </div>
                  </DialogDescription>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {/* Actions dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        radius="full"
                        aria-label="More actions"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem onSelect={() => setAddStockOpen(true)}>
                        <CirclePlusIcon className="size-4" />
                        Add stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setRemoveStockOpen(true)}>
                        <CircleMinusIcon className="size-4" />
                        Remove stock
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleEdit}>
                        <PencilIcon className="size-4" />
                        Edit product
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive" onSelect={() => setDeleteOpen(true)}>
                        <Trash2Icon className="size-4" />
                        Delete product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Close */}
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      radius="full"
                      aria-label="Close"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </DialogClose>
                </div>
              </DialogHeader>

              {/* Tab strip */}
              <div className="flex items-center gap-6 px-9">
                <TabsList variant="underline">
                  <TabsTrigger value="details">Product details</TabsTrigger>
                  <TabsTrigger value="stock-orders">Stock orders</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="stock-history">Stock history</TabsTrigger>
                </TabsList>
              </div>
            </div>

            {/* ── Scrollable content ────────────────────────────────────── */}
            <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-5 pb-5">
              {/* Product details */}
              <TabsContent value="details" className="flex flex-col gap-3">
                {/* Basic info */}
                <SectionCard
                  title="Basic info"
                  action={
                    <Button variant="secondary" size="sm" radius="full" onClick={handleEdit}>
                      Edit
                    </Button>
                  }
                >
                  <FieldGrid>
                    <Field label="Barcode" value={product.barcode} />
                    <Field label="Brand" value={product.brand} />
                    <Field label="Category" value={product.category} />
                    <Field label="Supplier" value={product.supplier} />
                  </FieldGrid>
                  <SectionDivider />
                  <p className="text-base font-semibold text-foreground">Additional info</p>
                  <FieldGrid>
                    <div className="col-span-2">
                      <Field label="Short description" value={null} />
                    </div>
                    <div className="col-span-2">
                      <Field label="Product description" value={null} />
                    </div>
                  </FieldGrid>
                </SectionCard>

                {/* Photos — only when the product has photos */}
                {product.photos && product.photos.length > 0 ? (
                  <SectionCard
                    title="Photos"
                    action={
                      <Button variant="secondary" size="sm" radius="full" onClick={handleEdit}>
                        Edit
                      </Button>
                    }
                  >
                    <div className="grid grid-cols-5 gap-2">
                      {product.photos.map((s) => (
                        <ProductImagePlaceholder
                          key={s}
                          seed={`${product.id}-${s}`}
                          className="aspect-square w-full"
                        />
                      ))}
                    </div>
                  </SectionCard>
                ) : null}

                {/* Stock info */}
                <SectionCard
                  title="Stock info"
                  action={
                    <Button variant="secondary" size="sm" radius="full" onClick={handleEdit}>
                      Edit
                    </Button>
                  }
                >
                  <FieldGrid>
                    <Field label="Primary SKU" value={product.sku} />
                    <Field label="Stock on hand" value={String(stockOnHand)} />
                    <Field
                      label="Retail price"
                      value={`AED ${product.retailPrice.toLocaleString()}`}
                    />
                    <Field label="Total retail value" value="AED 0" />
                    <Field
                      label="Supply price"
                      value={`AED ${product.supplyPrice.toLocaleString()}`}
                    />
                    <Field label="Total supply value" value="AED 0" />
                    <Field label="Average cost" value="AED 0" />
                    <Field label="Total cost" value="AED 0" />
                  </FieldGrid>
                </SectionCard>
              </TabsContent>

              {/* Placeholder tabs */}
              <TabsContent value="stock-orders">
                <EmptyState
                  icon={ShoppingCartIcon}
                  title="No stock orders yet"
                  description="Stock orders will appear here once created."
                  className="py-16"
                />
              </TabsContent>
              <TabsContent value="sales">
                <EmptyState
                  icon={ShoppingBagIcon}
                  title="No sales yet"
                  description="Sales for this product will appear here."
                  className="py-16"
                />
              </TabsContent>
              <TabsContent value="stock-history">
                <EmptyState
                  icon={PackageIcon}
                  title="No stock history yet"
                  description="Stock adjustments and movements will appear here."
                  className="py-16"
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* ── Action dialogs ───────────────────────────────────────────────── */}
      <AddStockDialog
        open={addStockOpen}
        onOpenChange={setAddStockOpen}
        productName={product.name}
        stockOnHand={stockOnHand}
      />
      <RemoveStockDialog
        open={removeStockOpen}
        onOpenChange={setRemoveStockOpen}
        productName={product.name}
        stockOnHand={stockOnHand}
      />
      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        productName={product.name}
        onDelete={handleDelete}
      />
    </>
  )
}
