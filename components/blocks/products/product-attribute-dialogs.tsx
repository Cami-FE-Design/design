"use client"

import { CirclePlusIcon, SearchIcon, XIcon } from "lucide-react"
import { useState } from "react"
import { EmptyState } from "@/components/blocks/shared/empty-state"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

// The brand, category and supplier pickers on a product. All three are the
// same dialog: search a list, pick one, or add a new one in a second dialog
// and have it picked. Only the nouns, the seed list and a couple of details
// (product counts, a supplier description) differ, so each is a config.

type Item = { id: string; name: string; productCount?: number }

type Entity = {
  /** "brand" — used in titles, buttons and empty states. */
  noun: string
  plural: string
  pickDescription: string
  addDescription: string
  placeholder: string
  seed: Item[]
  /** Show "N products" under each row. */
  showCount: boolean
  /** Ask for a short description when adding (suppliers). */
  withDescription?: boolean
  backLabel: string
  /** Enter in the name field saves. */
  enterSaves: boolean
}

const BRAND: Entity = {
  noun: "brand",
  plural: "brands",
  pickDescription: "Pick a brand to assign to this product, or create a new one.",
  addDescription: "Create a new brand to assign to your products.",
  placeholder: "e.g. Fresha",
  seed: [
    { id: "motorized", name: "Motorized", productCount: 0 },
    { id: "wahl", name: "Wahl", productCount: 3 },
    { id: "furminator", name: "Furminator", productCount: 5 },
  ],
  showCount: true,
  backLabel: "Go back",
  enterSaves: true,
}

const CATEGORY: Entity = {
  noun: "category",
  plural: "categories",
  pickDescription: "Pick a category to assign to this product, or create a new one.",
  addDescription: "Create a new category to organize your products.",
  placeholder: "e.g. Hair care",
  seed: [
    { id: "shampoos", name: "Shampoos", productCount: 3 },
    { id: "tools", name: "Tools & Equipment", productCount: 2 },
    { id: "treatments", name: "Treatments", productCount: 1 },
  ],
  showCount: true,
  backLabel: "Go back",
  enterSaves: true,
}

const SUPPLIER: Entity = {
  noun: "supplier",
  plural: "suppliers",
  pickDescription: "Pick a supplier to associate with this product, or create a new one.",
  addDescription: "Create a new supplier to associate with your products.",
  placeholder: "e.g. Fresha",
  seed: [
    { id: "pet-supplies-plus", name: "Pet Supplies Plus" },
    { id: "chewy-wholesale", name: "Chewy Wholesale" },
  ],
  showCount: false,
  withDescription: true,
  backLabel: "Cancel",
  enterSaves: false,
}

type SelectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (item: { id: string; name: string }) => void
  selectedId?: string
}

export function SelectBrandDialog(props: SelectDialogProps) {
  return <SelectEntityDialog entity={BRAND} {...props} />
}

export function SelectCategoryDialog(props: SelectDialogProps) {
  return <SelectEntityDialog entity={CATEGORY} {...props} />
}

export function SelectSupplierDialog(props: SelectDialogProps) {
  return <SelectEntityDialog entity={SUPPLIER} {...props} />
}

function SelectEntityDialog({
  entity,
  open,
  onOpenChange,
  onSelect,
}: SelectDialogProps & { entity: Entity }) {
  const [items, setItems] = useState<Item[]>(entity.seed)
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  const filtered = query.trim()
    ? items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))
    : items

  function handleAdd(name: string) {
    const added: Item = {
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      ...(entity.showCount ? { productCount: 0 } : {}),
    }
    setItems((prev) => [...prev, added])
    onSelect({ id: added.id, name: added.name })
    setAddOpen(false)
    onOpenChange(false)
    setQuery("")
  }

  function handleSelect(item: Item) {
    onSelect({ id: item.id, name: item.name })
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
            <DialogTitle>Select a {entity.noun}</DialogTitle>
            <DialogDescription className="sr-only">{entity.pickDescription}</DialogDescription>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
                <XIcon />
              </Button>
            </DialogClose>
          </DialogHeader>

          {items.length === 0 ? (
            <div className="px-6 pb-8">
              <EmptyState
                icon={SearchIcon}
                title={`No ${entity.plural} here yet.`}
                description={`Your ${entity.plural} will appear here`}
                action={
                  <Button radius="full" onClick={() => setAddOpen(true)}>
                    Add a {entity.noun}
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
                Add new {entity.noun}
              </button>

              <Separator className="mb-4" />

              {filtered.length === 0 ? (
                <EmptyState
                  icon={SearchIcon}
                  title={`No ${entity.plural} found`}
                  className="py-8"
                />
              ) : (
                <div className="flex flex-col">
                  {filtered.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="flex flex-col gap-0.5 border-b border-border/60 py-3 text-left last:border-b-0 hover:opacity-70 transition-opacity"
                      onClick={() => handleSelect(item)}
                    >
                      <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      {entity.showCount ? (
                        <span className="text-sm text-muted-foreground">
                          {item.productCount ?? 0} products
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AddEntityDialog
        entity={entity}
        open={addOpen}
        onOpenChange={setAddOpen}
        onBack={() => setAddOpen(false)}
        onSave={handleAdd}
      />
    </>
  )
}

function AddEntityDialog({
  entity,
  open,
  onOpenChange,
  onBack,
  onSave,
}: {
  entity: Entity
  open: boolean
  onOpenChange: (open: boolean) => void
  onBack: () => void
  onSave: (name: string) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const nameId = `add-${entity.noun}-name`
  const label = `${entity.noun[0].toUpperCase()}${entity.noun.slice(1)}`

  function reset() {
    setName("")
    setDescription("")
  }

  function handleSave() {
    if (!name.trim()) return
    onSave(name.trim())
    reset()
  }

  function handleBack() {
    reset()
    onBack()
  }

  const nameField = (
    <div className="grid gap-2">
      <Label htmlFor={nameId}>{label} name</Label>
      <Input
        id={nameId}
        placeholder={entity.placeholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={entity.enterSaves ? (e) => e.key === "Enter" && handleSave() : undefined}
      />
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0">
        <DialogHeader className="flex flex-row items-center justify-between px-6 pt-7 pb-6">
          <DialogTitle>Add a {entity.noun}</DialogTitle>
          <DialogDescription className="sr-only">{entity.addDescription}</DialogDescription>
          <DialogClose asChild>
            <Button variant="ghost" size="icon-sm" radius="full" aria-label="Close">
              <XIcon />
            </Button>
          </DialogClose>
        </DialogHeader>

        {entity.withDescription ? (
          <div className="flex flex-col gap-5 px-6 pb-6">
            {nameField}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`add-${entity.noun}-description`}>{label} description</Label>
                <span className="text-xs text-muted-foreground">{description.length}/100</span>
              </div>
              <Textarea
                id={`add-${entity.noun}-description`}
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 100))}
                className="min-h-24"
              />
            </div>
          </div>
        ) : (
          <div className="px-6 pb-6">{nameField}</div>
        )}

        <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
          <Button variant="outline" radius="full" onClick={handleBack}>
            {entity.backLabel}
          </Button>
          <Button radius="full" onClick={handleSave} disabled={!name.trim()}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
