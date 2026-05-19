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
import { toast } from "sonner"
import { AddStockDialog } from "@/components/blocks/add-stock-dialog"
import { DeleteProductDialog } from "@/components/blocks/delete-product-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
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

// ─── Detail row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value ?? "–"}</span>
    </div>
  )
}

function DetailRows({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-border/60">{children}</div>
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
          className="!max-w-[630px] flex h-[800px] max-h-[calc(100vh-100px)] flex-col gap-0 p-0 sm:!max-w-[630px]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabId)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* ── Header (tinted, mirrors PetDetailDialog) ─────────────── */}
            <div className="flex flex-col gap-0 bg-muted/40">
              <DialogHeader className="flex flex-row items-center gap-3 px-9 pt-[34px] pb-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted">
                  <PackageIcon className="size-6 text-muted-foreground" strokeWidth={1.5} />
                </span>

                <div className="flex min-w-0 flex-1 flex-col gap-1">
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
                        size="sm"
                        radius="full"
                        className="gap-1.5"
                      >
                        Actions
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
                      <DropdownMenuItem onSelect={() => toast.info("Coming soon")}>
                        <ShoppingCartIcon className="size-4" />
                        Order stock
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => toast.info("Coming soon")}>
                        <ShoppingBagIcon className="size-4" />
                        Sell product
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

              {/* Tab strip — underline variant, seam between muted and white */}
              <TabsList variant="underline" className="px-9">
                <TabsTrigger value="details">Product details</TabsTrigger>
                <TabsTrigger value="stock-orders">Stock orders</TabsTrigger>
                <TabsTrigger value="sales">Sales</TabsTrigger>
                <TabsTrigger value="stock-history">Stock history</TabsTrigger>
              </TabsList>
            </div>

            {/* ── Scrollable content ────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto">
              {/* Product details */}
              <TabsContent value="details" className="flex flex-col gap-4 p-6">
                {/* Basic info */}
                <SectionCard
                  title="Basic info"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={handleEdit}
                    >
                      Edit
                    </Button>
                  }
                >
                  <DetailRows>
                    <DetailRow label="Product barcode" value={null} />
                    <DetailRow label="Brand" value={product.brand} />
                    <DetailRow label="Product category" value={product.category} />
                    <DetailRow label="Supplier" value={null} />
                    <DetailRow label="Amount" value={null} />
                  </DetailRows>
                  <div className="mt-1 border-t border-border/60 pt-3">
                    <DetailRows>
                      <DetailRow label="Short description" value={null} />
                      <DetailRow label="Product description" value={null} />
                    </DetailRows>
                  </div>
                </SectionCard>

                {/* Stock info */}
                <SectionCard
                  title="Stock info"
                  action={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary"
                      onClick={handleEdit}
                    >
                      Edit
                    </Button>
                  }
                >
                  <DetailRows>
                    <DetailRow label="Primary SKU" value={product.sku} />
                    <DetailRow label="Stock on hand" value={String(stockOnHand)} />
                    <DetailRow
                      label="Retail price"
                      value={`AED ${product.retailPrice.toLocaleString()}`}
                    />
                    <DetailRow label="Total retail value" value="AED 0" />
                    <DetailRow
                      label="Supply price"
                      value={`AED ${product.supplyPrice.toLocaleString()}`}
                    />
                    <DetailRow label="Total supply value" value="AED 0" />
                    <DetailRow label="Average cost" value="AED 0" />
                    <DetailRow label="Total cost" value="AED 0" />
                  </DetailRows>
                </SectionCard>
              </TabsContent>

              {/* Placeholder tabs */}
              <TabsContent value="stock-orders" className="p-6">
                <EmptyState
                  icon={ShoppingCartIcon}
                  title="No stock orders yet"
                  description="Stock orders will appear here once created."
                  className="py-16"
                />
              </TabsContent>
              <TabsContent value="sales" className="p-6">
                <EmptyState
                  icon={ShoppingBagIcon}
                  title="No sales yet"
                  description="Sales for this product will appear here."
                  className="py-16"
                />
              </TabsContent>
              <TabsContent value="stock-history" className="p-6">
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
