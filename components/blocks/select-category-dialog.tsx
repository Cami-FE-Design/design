"use client"

import { CirclePlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { AddCategoryDialog } from "@/components/blocks/add-category-dialog"
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

type Category = { id: string; name: string; productCount: number }

const MOCK_CATEGORIES: Category[] = [
  { id: "shampoos", name: "Shampoos", productCount: 3 },
  { id: "tools", name: "Tools & Equipment", productCount: 2 },
  { id: "treatments", name: "Treatments", productCount: 1 },
]

type SelectCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (category: { id: string; name: string }) => void
  selectedId?: string
}

export function SelectCategoryDialog({
  open,
  onOpenChange,
  onSelect,
  selectedId,
}: SelectCategoryDialogProps) {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES)
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  const filtered = query.trim()
    ? categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    : categories

  function handleAddCategory(name: string) {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      productCount: 0,
    }
    setCategories((prev) => [...prev, newCategory])
    onSelect({ id: newCategory.id, name: newCategory.name })
    setAddOpen(false)
    onOpenChange(false)
    setQuery("")
  }

  function handleSelect(category: Category) {
    onSelect({ id: category.id, name: category.name })
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
            <DialogTitle>Select a category</DialogTitle>
            <DialogDescription className="sr-only">
              Pick a category to assign to this product, or create a new one.
            </DialogDescription>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogHeader>

          {categories.length === 0 ? (
            <div className="px-6 pb-8">
              <EmptyState
                icon={SearchIcon}
                title="No categories here yet."
                description="Your categories will appear here"
                action={
                  <Button radius="full" onClick={() => setAddOpen(true)}>
                    Add a category
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
                Add new category
              </button>

              <Separator className="mb-4" />

              {filtered.length === 0 ? (
                <EmptyState icon={SearchIcon} title="No categories found" className="py-8" />
              ) : (
                <div className="flex flex-col">
                  {filtered.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className="flex flex-col gap-0.5 border-b border-border/60 py-3 text-left last:border-b-0 hover:opacity-70 transition-opacity"
                      onClick={() => handleSelect(category)}
                    >
                      <span className="text-sm font-semibold text-foreground">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.productCount} products
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddCategoryDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onGoBack={() => setAddOpen(false)}
        onSave={handleAddCategory}
      />
    </>
  )
}
