"use client"

import { CirclePlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { AddSupplierDialog } from "@/components/blocks/add-supplier-dialog"
import { EmptyState } from "@/components/blocks/empty-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

type Supplier = { id: string; name: string }

const MOCK_SUPPLIERS: Supplier[] = [
  { id: "pet-supplies-plus", name: "Pet Supplies Plus" },
  { id: "chewy-wholesale", name: "Chewy Wholesale" },
]

type SelectSupplierDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (supplier: { id: string; name: string }) => void
  selectedId?: string
}

export function SelectSupplierDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
}: SelectSupplierDialogProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS)
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  const filtered = query.trim()
    ? suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : suppliers

  function handleAddSupplier(name: string) {
    const newSupplier: Supplier = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
    }
    setSuppliers((prev) => [...prev, newSupplier])
    onSelect({ id: newSupplier.id, name: newSupplier.name })
    setAddOpen(false)
    onOpenChange(false)
    setQuery("")
  }

  function handleSelect(supplier: Supplier) {
    onSelect({ id: supplier.id, name: supplier.name })
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
            <DialogTitle>Select a supplier</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogHeader>

          {suppliers.length === 0 ? (
            <div className="px-6 pb-8">
              <EmptyState
                icon={SearchIcon}
                title="No suppliers here yet."
                description="Your suppliers will appear here"
                action={
                  <Button radius="full" onClick={() => setAddOpen(true)}>
                    Add a supplier
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
                Add new supplier
              </button>

              <Separator className="mb-4" />

              {filtered.length === 0 ? (
                <EmptyState icon={SearchIcon} title="No suppliers found" className="py-8" />
              ) : (
                <div className="flex flex-col">
                  {filtered.map((supplier) => (
                    <button
                      key={supplier.id}
                      type="button"
                      className="border-b border-border/60 py-3 text-left last:border-b-0 hover:opacity-70 transition-opacity"
                      onClick={() => handleSelect(supplier)}
                    >
                      <span className="text-sm font-semibold text-foreground">{supplier.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddSupplierDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCancel={() => setAddOpen(false)}
        onSave={handleAddSupplier}
      />
    </>
  )
}
