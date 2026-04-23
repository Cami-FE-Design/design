import type * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-none rounded-2xl bg-input px-4 py-3 text-sm font-medium text-foreground outline-none transition-[color,box-shadow,background-color]",
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

export { Textarea }
