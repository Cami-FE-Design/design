"use client"

import { Label as LabelPrimitive } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        "aria-disabled:cursor-not-allowed aria-disabled:text-muted-foreground",
        "data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-muted-foreground",
        "peer-disabled:cursor-not-allowed peer-disabled:text-muted-foreground",
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:text-muted-foreground",
        "aria-invalid:text-destructive",
        "data-[error=true]:text-destructive",
        "peer-aria-[invalid=true]:text-destructive",
        "group-data-[error=true]:text-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Label }
