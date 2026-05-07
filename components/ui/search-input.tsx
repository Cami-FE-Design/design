"use client"

import { CircleXIcon, SearchIcon } from "lucide-react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputSize = "default" | "lg" | "xl"

type SearchInputProps = Omit<
  React.ComponentProps<"input">,
  "type" | "value" | "onChange" | "size"
> & {
  containerClassName?: string
  onValueChange?: (value: string) => void
  /**
   * Visual scale of the search field.
   *  - `default`: compact (h-8, w-56, rounded-full) — for inline filters in
   *    headers, panes, etc.
   *  - `lg`: roomier (h-12, full-width, rounded-2xl) — settings list filters.
   *  - `xl`: hero (h-16, full-width, rounded-2xl, larger icons + text) — for
   *    full-screen takeovers like the role permissions editor.
   */
  size?: SearchInputSize
}

const SIZE_MAP = {
  default: {
    input: "h-8 w-56 rounded-full pr-9 pl-9 text-sm",
    icon: "size-4",
    iconLeft: "left-3",
    clearIcon: "size-4",
    clearBtn: "right-2 size-5",
  },
  lg: {
    input: "h-12 w-full rounded-2xl pr-12 pl-12 text-base",
    icon: "size-5",
    iconLeft: "left-4",
    clearIcon: "size-5",
    clearBtn: "right-3 size-7",
  },
  xl: {
    input: "h-12 w-full rounded-full pr-12 pl-12 text-base",
    icon: "size-5",
    iconLeft: "left-4",
    clearIcon: "size-5",
    clearBtn: "right-3 size-7",
  },
} as const

export function SearchInput({
  className,
  containerClassName,
  defaultValue = "",
  onValueChange,
  size = "default",
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState(String(defaultValue))
  const sizing = SIZE_MAP[size]

  function update(next: string) {
    setValue(next)
    onValueChange?.(next)
  }

  return (
    <div
      data-slot="search-input"
      data-size={size}
      className={cn("relative", size !== "default" && "w-full", containerClassName)}
    >
      <SearchIcon
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          sizing.iconLeft,
          sizing.icon,
        )}
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => update(e.target.value)}
        className={cn(
          "border border-border bg-transparent font-normal",
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
          sizing.input,
          className,
        )}
        {...props}
      />
      {value.length > 0 ? (
        <button
          type="button"
          onClick={() => update("")}
          aria-label="Clear search"
          className={cn(
            "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
            sizing.clearBtn,
          )}
        >
          <CircleXIcon className={sizing.clearIcon} />
        </button>
      ) : null}
    </div>
  )
}
