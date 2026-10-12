"use client"

import { CheckIcon, ChevronDownIcon, PlusIcon } from "lucide-react"
import { useState } from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

type SearchableComboboxProps = {
  value: string
  onValueChange: (v: string) => void
  /** Built-in options for the dropdown. */
  baseOptions: string[]
  /** Session-added custom options. */
  customOptions: string[]
  /** Called when the user types a new option and confirms. */
  onAddCustom: (v: string) => void
  placeholder?: string
  /** Label shown when the typed query doesn't match anything; "{query}" interpolates. */
  addLabel?: (query: string) => string
  className?: string
  id?: string
}

/**
 * Combobox with search, predefined options, and "+ Create" affordance for
 * adding a new option not in the list. Trigger matches `<Input>` shape
 * (h-12, rounded-2xl, bg-input).
 */
export function SearchableCombobox({
  value,
  onValueChange,
  baseOptions,
  customOptions,
  onAddCustom,
  placeholder = "Select",
  addLabel = (q) => `Add "${q}"`,
  className,
  id,
}: SearchableComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const all = [...baseOptions, ...customOptions]
  const q = query.trim()
  const qLower = q.toLowerCase()
  const filtered = all.filter((opt) => opt.toLowerCase().includes(qLower))
  const exactMatch = all.some((opt) => opt.toLowerCase() === qLower)
  const showAddNew = q !== "" && !exactMatch

  function pick(v: string) {
    onValueChange(v)
    setOpen(false)
    setQuery("")
  }

  function createNew() {
    if (!q) return
    onAddCustom(q)
    pick(q)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "flex h-12 w-full items-center justify-between gap-3 rounded-2xl bg-input px-4 py-3 text-sm font-medium text-foreground outline-none transition-[color,box-shadow,background-color] focus-visible:ring-3 focus-visible:ring-ring/30",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-[--radix-popover-trigger-width] min-w-72 flex-col gap-0 p-0"
      >
        <div className="border-b border-border/60 p-2">
          <SearchInput
            className="!h-9 w-full"
            placeholder="Search or type to add"
            defaultValue={query}
            onValueChange={setQuery}
          />
        </div>
        <ul className="max-h-64 overflow-y-auto py-1">
          {filtered.length === 0 && !showAddNew ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">No matches.</li>
          ) : (
            filtered.map((opt) => {
              const isSelected = opt === value
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => pick(opt)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                  >
                    <span className="truncate">{opt}</span>
                    {isSelected ? <CheckIcon className="size-4 shrink-0 text-foreground" /> : null}
                  </button>
                </li>
              )
            })
          )}
        </ul>
        {showAddNew ? (
          <div className="border-t border-border/60 p-2">
            <button
              type="button"
              onClick={createNew}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium text-cami-violet-11 transition-colors hover:bg-muted/50"
            >
              <PlusIcon className="size-4" />
              <span className="truncate">{addLabel(q)}</span>
            </button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
