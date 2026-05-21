import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"
import type * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-0.5 has-data-[icon=inline-start]:pl-1 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-sand-5 text-secondary-foreground [a]:hover:bg-sand-6",
        // Soft brand-accent treatment — for "Active" / brand-tinted status indicators.
        // Uses the cami-violet scale rather than --primary (which is dark sand).
        "primary-soft": "bg-cami-violet-3 text-cami-violet-11",
        // Subtle muted treatment — for "Off" / inactive status indicators.
        muted: "bg-muted text-muted-foreground",
        // Soft amber treatment — for non-blocking warnings (e.g. "Team member
        // doesn't provide this service"). Mirrors primary-soft's tone-on-tone
        // pattern using the cami-yellow scale, with a faint border.
        warning: "border-cami-yellow-5 bg-cami-yellow-3 text-cami-yellow-11",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-5 min-w-5 px-1.5 pt-0 pb-px text-[11px] leading-none [&>svg]:size-3!",
        sm: "h-4 min-w-4 rounded-[4px] px-1 pt-0 pb-px text-[10px] leading-none [&>svg]:size-2.5!",
        md: "h-6 min-w-6 px-2 pt-0 pb-px text-xs leading-none [&>svg]:size-3.5!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

function Badge({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
