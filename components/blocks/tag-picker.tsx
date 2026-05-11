"use client"

import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { useState } from "react"

import {
  TAG_CATEGORY_ICON,
  TAG_CATEGORY_LABELS,
  TAG_LIBRARY,
  type TagCategory,
  type TagDef,
} from "@/components/blocks/tag-library"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SearchInput } from "@/components/ui/search-input"
import { cn } from "@/lib/utils"

type TagPickerProps = {
  /** Selected tag IDs. */
  value: string[]
  onChange: (next: string[]) => void
  /** Restrict the picker to these categories. Default: all. */
  categories?: TagCategory[]
  /** Business-defined custom tags added at runtime. */
  customTags?: TagDef[]
  triggerLabel?: string
}

export function TagPicker({
  value,
  onChange,
  categories,
  customTags = [],
  triggerLabel = "Select or create a tag",
}: TagPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const allTags = [...TAG_LIBRARY, ...customTags]
  const lookup = new Map(allTags.map((t) => [t.id, t]))
  const selected = value.map((id) => lookup.get(id)).filter((t): t is TagDef => Boolean(t))

  const visibleTags = categories ? allTags.filter((t) => categories.includes(t.category)) : allTags

  const q = query.trim().toLowerCase()
  const filtered = visibleTags.filter(
    (t) => !q || t.label.toLowerCase().includes(q) || t.code.toLowerCase().includes(q),
  )

  // Group filtered tags by category.
  const grouped = filtered.reduce<Record<string, TagDef[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})
  const orderedCategories = (
    categories ?? (Object.keys(TAG_CATEGORY_LABELS) as TagCategory[])
  ).filter((c) => grouped[c]?.length)

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
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
        <div
          role="combobox"
          tabIndex={0}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls="tag-picker-list"
          className={cn(
            "flex min-h-12 w-full cursor-pointer items-center justify-between gap-2 rounded-2xl bg-input px-3 py-2 text-sm outline-none transition-[color,box-shadow,background-color]",
            "focus-visible:ring-3 focus-visible:ring-ring/30 data-[state=open]:ring-3 data-[state=open]:ring-ring/30",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {selected.length === 0 ? (
              <span className="px-1 font-medium text-muted-foreground">{triggerLabel}</span>
            ) : (
              selected.map((tag) => (
                <TagChip key={tag.id} tag={tag} onRemove={() => toggle(tag.id)} />
              ))
            )}
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onWheel={(e) => e.stopPropagation()}
        className="max-h-96 w-[--radix-popper-anchor-width] min-w-72 gap-0 overflow-y-scroll overscroll-contain p-0"
      >
        <div className="sticky top-0 z-10 border-b border-border/60 bg-popover p-2">
          <SearchInput
            className="!h-9 w-full"
            placeholder="Search tags"
            aria-label="Search tags"
            defaultValue={query}
            onValueChange={setQuery}
          />
        </div>
        <div className="py-1">
          {orderedCategories.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">No tags match.</p>
          ) : (
            orderedCategories.map((cat) => (
              <div key={cat}>
                <div className="px-3 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                  {TAG_CATEGORY_LABELS[cat]}
                </div>
                <ul>
                  {grouped[cat].map((tag) => {
                    const isSelected = value.includes(tag.id)
                    return (
                      <li key={tag.id}>
                        <button
                          type="button"
                          onClick={() => toggle(tag.id)}
                          className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-muted/50"
                        >
                          <TagBadge tag={tag} />
                          <span className="flex-1 truncate">{tag.label}</span>
                          {isSelected ? (
                            <CheckIcon className="size-4 shrink-0 text-foreground" />
                          ) : null}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function TagBadge({ tag }: { tag: TagDef }) {
  const Icon = TAG_CATEGORY_ICON[tag.category]
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-md bg-cami-violet-3 text-cami-violet-11">
      <Icon className="size-3.5" strokeWidth={1.75} />
    </span>
  )
}

function TagChip({ tag, onRemove }: { tag: TagDef; onRemove: () => void }) {
  const Icon = TAG_CATEGORY_ICON[tag.category]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-cami-violet-3 py-1 pr-1 pl-2 text-sm font-medium text-cami-violet-11">
      <Icon className="size-3.5" strokeWidth={1.75} />
      <span className="leading-5">{tag.label}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        aria-label={`Remove ${tag.label}`}
        className="inline-flex size-5 items-center justify-center rounded-full transition-opacity hover:bg-cami-violet-5"
      >
        <XIcon className="size-3.5" />
      </button>
    </span>
  )
}
