"use client"

import { CircleXIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> & {
  containerClassName?: string
  onValueChange?: (value: string) => void
}

export function SearchInput({
  className,
  containerClassName,
  defaultValue = "",
  onValueChange,
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState(String(defaultValue))

  function update(next: string) {
    setValue(next)
    onValueChange?.(next)
  }

  return (
    <div className={cn("relative", containerClassName)}>
      <SearchIcon
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        className={cn(
          "h-8 w-56 rounded-full border border-border bg-transparent pr-9 pl-9 text-sm font-normal",
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
          className,
        )}
        {...props}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => update("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
        >
          <CircleXIcon className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
