"use client"

import { CirclePlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { AddBrandDialog } from "@/components/blocks/add-brand-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type Brand = { id: string; name: string; productCount: number }

const MOCK_BRANDS: Brand[] = [
  { id: "motorized", name: "Motorized", productCount: 0 },
  { id: "wahl", name: "Wahl", productCount: 3 },
  { id: "furminator", name: "Furminator", productCount: 5 },
]

type SelectBrandDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (brand: { id: string; name: string }) => void
  selectedId?: string
}

export function SelectBrandDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
}: SelectBrandDialogProps) {
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS)
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  const filtered = query.trim()
    ? brands.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()))
    : brands

  function handleAddBrand(name: string) {
    const newBrand: Brand = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      productCount: 0,
    }
    setBrands((prev) => [...prev, newBrand])
    onSelect({ id: newBrand.id, name: newBrand.name })
    setAddOpen(false)
    onOpenChange(false)
    setQuery("")
  }

  function handleSelect(brand: Brand) {
    onSelect({ id: brand.id, name: brand.name })
    onOpenChange(false)
    setQuery("")
  }

  function handleOpenChange(next: boolean) {
    if (!next) setQuery("")
    onOpenChange(next)
  }

  return (
    <>
      <Dialog open={open && !addOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg gap-0 p-0">
          <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-5">
            <DialogTitle>Select a brand</DialogTitle>
            <DialogDescription className="sr-only">
              Pick a brand to assign to this product, or create a new one.
            </DialogDescription>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogHeader>

          {brands.length === 0 ? (
            <div className="px-6 pb-8">
              <EmptyState
                icon={SearchIcon}
                title="No brands here yet."
                description="Your brands will appear here"
                action={
                  <Button radius="full" onClick={() => setAddOpen(true)}>
                    Add a brand
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="flex flex-col gap-0 px-6 pb-6">
              <div className="relative mb-4">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                  className="pl-11"
                />
              </div>

              <button
                type="button"
                className="mb-4 flex w-fit items-center gap-2 text-sm font-medium text-primary hover:underline"
                onClick={() => setAddOpen(true)}
              >
                <CirclePlusIcon className="size-4" />
                Add new brand
              </button>

              <Separator className="mb-4" />

              {filtered.length === 0 ? (
                <EmptyState icon={SearchIcon} title="No brands found" className="py-8" />
              ) : (
                <div className="flex flex-col">
                  {filtered.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      className="flex flex-col gap-0.5 border-b border-border/60 py-3 text-left last:border-b-0 hover:opacity-70 transition-opacity"
                      onClick={() => handleSelect(brand)}
                    >
                      <span className="text-sm font-semibold text-foreground">{brand.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {brand.productCount} products
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddBrandDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onGoBack={() => setAddOpen(false)}
        onSave={handleAddBrand}
      />
    </>
  )
}
