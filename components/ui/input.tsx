import type * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-2xl bg-input px-4 py-3 text-sm font-medium text-foreground outline-none transition-[color,box-shadow,background-color]",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:font-normal placeholder:text-muted-foreground placeholder:select-none",
        "ring-inset focus-visible:ring-2 focus-visible:ring-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-2 aria-invalid:ring-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
