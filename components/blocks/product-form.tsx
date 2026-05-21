"use client"

import {
  BadgeDollarSignIcon,
  BoxesIcon,
  ImageIcon,
  InfoIcon,
  type LucideIcon,
  Trash2Icon,
} from "lucide-react"
import { useState } from "react"
import { SelectBrandDialog } from "@/components/blocks/select-brand-dialog"
import { SelectCategoryDialog } from "@/components/blocks/select-category-dialog"
import { SelectSupplierDialog } from "@/components/blocks/select-supplier-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

// ─── Local helpers ────────────────────────────────────────────────────────────

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-background">
      <div className="flex flex-col gap-1 px-6 py-5">
        <h2 className="font-heading text-2xl font-semibold leading-9 text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm leading-5 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <Separator />
      <div className="flex flex-col gap-5 px-6 py-5">{children}</div>
    </div>
  )
}

function FieldRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-2", className)}>{children}</div>
}

function PrefixInput({ prefix, ...props }: React.ComponentProps<"input"> & { prefix: string }) {
  return (
    <div className="flex h-12 items-center overflow-hidden rounded-2xl bg-input ring-inset focus-within:ring-2 focus-within:ring-foreground">
      <span className="shrink-0 pl-4 pr-3 text-sm text-muted-foreground">{prefix}</span>
      <span className="h-5 w-px shrink-0 bg-border/60" />
      <input
        className="h-full flex-1 bg-transparent px-3 text-sm font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground outline-none"
        {...props}
      />
    </div>
  )
}

function EntityField({
  label,
  placeholder,
  selected,
  onSelectClick,
  onEditClick,
  onClear,
}: {
  label: string
  placeholder?: string
  selected: { id: string; name: string } | null
  onSelectClick: () => void
  onEditClick: () => void
  onClear: () => void
}) {
  return (
    <FieldRow>
      <Label>{label}</Label>
      {selected ? (
        <div className="flex items-center gap-2">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-2xl bg-input px-4">
            <span className="flex-1 truncate text-sm font-medium text-foreground">
              {selected.name}
            </span>
            <button
              type="button"
              onClick={onEditClick}
              className="shrink-0 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Edit
            </button>
          </div>
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="shrink-0 text-destructive hover:opacity-70 transition-opacity"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onSelectClick}
          className="w-fit text-sm font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          {placeholder ?? `Select a ${label.toLowerCase()}`}
        </button>
      )}
    </FieldRow>
  )
}

function SwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer">
          {label}
        </Label>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  )
}

// ─── Measure options ──────────────────────────────────────────────────────────

const MEASURE_OPTIONS = [
  { value: "ml", label: "Milliliters (ml)" },
  { value: "l", label: "Liters (L)" },
  { value: "g", label: "Grams (g)" },
  { value: "kg", label: "Kilograms (kg)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "oz", label: "Ounces (oz)" },
]

function generateSku() {
  const prefix = "SKU"
  const num = Math.floor(10000 + Math.random() * 90000)
  return `${prefix}-${num}`
}

// ─── Sections ─────────────────────────────────────────────────────────────────

export type ProductSectionId = "basics" | "pricing" | "inventory" | "photos"
export type ProductFormSectionId = Exclude<ProductSectionId, "photos">

export const PRODUCT_SECTIONS: Array<{
  id: ProductSectionId
  label: string
  icon: LucideIcon
  badge?: string
}> = [
  { id: "basics", label: "Basic info", icon: InfoIcon },
  { id: "pricing", label: "Pricing", icon: BadgeDollarSignIcon },
  { id: "inventory", label: "Inventory", icon: BoxesIcon, badge: "WIP" },
  { id: "photos", label: "Photos", icon: ImageIcon },
]

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductFormInitialValues = {
  name?: string
  barcode?: string
  brand?: { id: string; name: string } | null
  measure?: string
  amount?: string
  shortDesc?: string
  longDesc?: string
  category?: { id: string; name: string } | null
  supplyPrice?: string
  retailEnabled?: boolean
  retailPrice?: string
  markup?: string
  tax?: string
  commissionEnabled?: boolean
  skus?: string[]
  supplier?: { id: string; name: string } | null
  trackStock?: boolean
  currentStock?: string
  lowStockLevel?: string
  reorderQty?: string
  lowStockNotif?: boolean
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ProductForm({
  initialValues,
  section,
}: {
  initialValues?: ProductFormInitialValues
  /** When provided, renders only the matching section. Pickers always mount so they remain wired across section switches. */
  section?: ProductFormSectionId
}) {
  const iv = initialValues ?? {}

  // Basic info
  const [name, setName] = useState(iv.name ?? "")
  const [barcode, setBarcode] = useState(iv.barcode ?? "")
  const [brand, setBrand] = useState<{ id: string; name: string } | null>(iv.brand ?? null)
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)
  const [measure, setMeasure] = useState(iv.measure ?? "ml")
  const [amount, setAmount] = useState(iv.amount ?? "")
  const [shortDesc, setShortDesc] = useState(iv.shortDesc ?? "")
  const [longDesc, setLongDesc] = useState(iv.longDesc ?? "")
  const [category, setCategory] = useState<{ id: string; name: string } | null>(iv.category ?? null)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)

  // Pricing
  const [supplyPrice, setSupplyPrice] = useState(iv.supplyPrice ?? "")
  const [retailEnabled, setRetailEnabled] = useState(iv.retailEnabled ?? true)
  const [retailPrice, setRetailPrice] = useState(iv.retailPrice ?? "")
  const [markup, setMarkup] = useState(iv.markup ?? "")
  const [tax, setTax] = useState(iv.tax ?? "no-tax")
  const [commissionEnabled, setCommissionEnabled] = useState(iv.commissionEnabled ?? true)

  // Inventory
  const [skus, setSkus] = useState<string[]>(iv.skus ?? [""])
  const [supplier, setSupplier] = useState<{ id: string; name: string } | null>(iv.supplier ?? null)
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false)
  const [trackStock, setTrackStock] = useState(iv.trackStock ?? true)
  const [currentStock, setCurrentStock] = useState(iv.currentStock ?? "")
  const [lowStockLevel, setLowStockLevel] = useState(iv.lowStockLevel ?? "")
  const [reorderQty, setReorderQty] = useState(iv.reorderQty ?? "")
  const [lowStockNotif, setLowStockNotif] = useState(iv.lowStockNotif ?? false)

  const measureLabel = MEASURE_OPTIONS.find((m) => m.value === measure)?.value ?? "ml"

  function handleGenerateSku() {
    const generated = generateSku()
    setSkus((prev) => {
      const next = [...prev]
      const emptyIdx = next.findIndex((s) => !s.trim())
      if (emptyIdx !== -1) {
        next[emptyIdx] = generated
      } else {
        next[0] = generated
      }
      return next
    })
  }

  function handleAddSku() {
    setSkus((prev) => [...prev, ""])
  }

  function handleSkuChange(index: number, value: string) {
    setSkus((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function handleRemoveSku(index: number) {
    setSkus((prev) => prev.filter((_, i) => i !== index))
  }

  const showSkuTrash = (index: number) => {
    if (skus.length > 1) return true
    return skus[index].trim().length > 0
  }

  const showBasics = !section || section === "basics"
  const showPricing = !section || section === "pricing"
  const showInventory = !section || section === "inventory"

  return (
    <>
      {/* ── Basic info ─────────────────────────────────────────────────── */}
      {showBasics && (
        <FormSection
          title="Basic info"
          description="Product name is required. Everything else is optional."
        >
          <FieldRow>
            <Label htmlFor="product-name">Product name</Label>
            <Input id="product-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FieldRow>

          <FieldRow>
            <div className="flex items-baseline gap-2">
              <Label htmlFor="product-barcode">Product barcode</Label>
              <span className="text-sm text-muted-foreground">(Optional)</span>
            </div>
            <Input
              id="product-barcode"
              placeholder="UPC, EAN, GTIN"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
            />
            {barcode.trim().length > 0 && (
              <p className="text-xs text-muted-foreground">
                This product barcode may be invalid, please make sure you've typed the barcode
                correctly
              </p>
            )}
          </FieldRow>

          <EntityField
            label="Product brand"
            placeholder="Select a brand"
            selected={brand}
            onSelectClick={() => setBrandDialogOpen(true)}
            onEditClick={() => setBrandDialogOpen(true)}
            onClear={() => setBrand(null)}
          />

          <div className="grid grid-cols-2 gap-4">
            <FieldRow>
              <Label htmlFor="product-measure">Measure</Label>
              <Select value={measure} onValueChange={setMeasure}>
                <SelectTrigger
                  id="product-measure"
                  className="data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEASURE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldRow>

            <FieldRow>
              <Label htmlFor="product-amount">Amount</Label>
              <PrefixInput
                id="product-amount"
                prefix={measureLabel}
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FieldRow>
          </div>

          <FieldRow>
            <div className="flex items-center justify-between">
              <Label htmlFor="product-short-desc">Short description</Label>
              <span className="text-xs text-muted-foreground">{shortDesc.length}/100</span>
            </div>
            <Textarea
              id="product-short-desc"
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value.slice(0, 100))}
              className="min-h-18"
            />
          </FieldRow>

          <FieldRow>
            <div className="flex items-center justify-between">
              <Label htmlFor="product-long-desc">Product description</Label>
              <span className="text-xs text-muted-foreground">{longDesc.length}/1000</span>
            </div>
            <Textarea
              id="product-long-desc"
              value={longDesc}
              onChange={(e) => setLongDesc(e.target.value.slice(0, 1000))}
              className="min-h-30"
            />
          </FieldRow>

          <EntityField
            label="Product category"
            placeholder="Select a category"
            selected={category}
            onSelectClick={() => setCategoryDialogOpen(true)}
            onEditClick={() => setCategoryDialogOpen(true)}
            onClear={() => setCategory(null)}
          />
        </FormSection>
      )}

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      {showPricing && (
        <FormSection
          title="Pricing"
          description="Supply price, retail price, and tax for this product."
        >
          <FieldRow>
            <Label htmlFor="supply-price">Supply price</Label>
            <PrefixInput
              id="supply-price"
              prefix="AED"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={supplyPrice}
              onChange={(e) => setSupplyPrice(e.target.value)}
            />
          </FieldRow>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Retail sales</p>
              <p className="text-sm text-muted-foreground">
                Allow sales of this product at checkout.
              </p>
            </div>
            <SwitchRow
              id="retail-enabled"
              label="Enable retail sales"
              checked={retailEnabled}
              onCheckedChange={setRetailEnabled}
            />

            {retailEnabled && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldRow>
                    <Label htmlFor="retail-price">Retail price</Label>
                    <PrefixInput
                      id="retail-price"
                      prefix="AED"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={retailPrice}
                      onChange={(e) => setRetailPrice(e.target.value)}
                    />
                  </FieldRow>
                  <FieldRow>
                    <Label htmlFor="markup">Markup</Label>
                    <PrefixInput
                      id="markup"
                      prefix="%"
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder="0.00"
                      value={markup}
                      onChange={(e) => setMarkup(e.target.value)}
                    />
                  </FieldRow>
                </div>

                <FieldRow>
                  <Label htmlFor="tax">Tax</Label>
                  <Select value={tax} onValueChange={setTax}>
                    <SelectTrigger
                      id="tax"
                      className="data-[size=default]:h-12 w-full rounded-2xl border-0 bg-input px-4 font-medium"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-tax">Default: No tax</SelectItem>
                      <SelectItem value="5">5%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="17">17% GST</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            )}
          </div>

          {retailEnabled && (
            <>
              <Separator />

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">Team member commission</p>
                  <p className="text-sm text-muted-foreground">
                    Calculate team member commission when the product is sold.
                  </p>
                </div>
                <SwitchRow
                  id="commission-enabled"
                  label="Enable team member commission"
                  checked={commissionEnabled}
                  onCheckedChange={setCommissionEnabled}
                />
              </div>
            </>
          )}
        </FormSection>
      )}

      {/* ── Inventory ──────────────────────────────────────────────────── */}
      {showInventory && (
        <FormSection
          title="Inventory"
          description="Manage stock levels of this product through Fresha."
        >
          {/* SKU fields */}
          <div className="flex flex-col gap-3">
            {skus.map((sku, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: ordered string list, no stable ID
              <FieldRow key={index}>
                <Label htmlFor={`sku-${index}`}>SKU (Stock Keeping Unit)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={`sku-${index}`}
                    value={sku}
                    onChange={(e) => handleSkuChange(index, e.target.value)}
                    className="min-w-0 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (skus.length === 1) {
                        handleSkuChange(0, "")
                      } else {
                        handleRemoveSku(index)
                      }
                    }}
                    aria-label="Remove SKU"
                    className={cn(
                      "shrink-0 text-destructive transition-opacity hover:opacity-70",
                      !showSkuTrash(index) && "invisible",
                    )}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              </FieldRow>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleGenerateSku}
              className="w-fit text-sm font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Generate SKU automatically
            </button>
            <button
              type="button"
              onClick={handleAddSku}
              className="w-fit text-sm font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
            >
              Add another SKU code
            </button>
          </div>

          <Separator />

          {/* Supplier */}
          <EntityField
            label="Supplier"
            selected={supplier}
            onSelectClick={() => setSupplierDialogOpen(true)}
            onEditClick={() => setSupplierDialogOpen(true)}
            onClear={() => setSupplier(null)}
          />

          <Separator />

          {/* Stock quantity */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">Stock quantity</p>
            </div>
            <SwitchRow
              id="track-stock"
              label="Track stock quantity"
              checked={trackStock}
              onCheckedChange={setTrackStock}
            />

            {trackStock && (
              <FieldRow>
                <Label htmlFor="current-stock">Current stock quantity</Label>
                <Input
                  id="current-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                />
              </FieldRow>
            )}
          </div>

          {trackStock && (
            <>
              <Separator />

              {/* Low stock */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold text-foreground">Low stock and reordering</p>
                  <p className="text-sm text-muted-foreground">
                    Cami will automatically notify you and pre-fill the reorder quantity set for
                    future stock orders.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FieldRow>
                    <Label htmlFor="low-stock-level">Low stock level</Label>
                    <Input
                      id="low-stock-level"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={lowStockLevel}
                      onChange={(e) => setLowStockLevel(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The level to get notified to reorder
                    </p>
                  </FieldRow>

                  <FieldRow>
                    <Label htmlFor="reorder-qty">Reorder quantity</Label>
                    <Input
                      id="reorder-qty"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={reorderQty}
                      onChange={(e) => setReorderQty(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The default amount to order</p>
                  </FieldRow>
                </div>

                <SwitchRow
                  id="low-stock-notif"
                  label="Receive low stock notifications."
                  checked={lowStockNotif}
                  onCheckedChange={setLowStockNotif}
                />
              </div>
            </>
          )}
        </FormSection>
      )}

      {/* ── Pickers ────────────────────────────────────────────────────── */}
      <SelectBrandDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        onSelect={setBrand}
        selectedId={brand?.id}
      />
      <SelectCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSelect={setCategory}
        selectedId={category?.id}
      />
      <SelectSupplierDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        onSelect={setSupplier}
        selectedId={supplier?.id}
      />
    </>
  )
}
