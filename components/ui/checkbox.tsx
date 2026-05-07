"use client"

import { CheckIcon } from "lucide-react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import type * as React from "react"
import { cn } from "@/lib/utils"

type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
  /**
   * Box size. `default` = 16px (standard inline checkbox), `lg` = 24px to
   * sit comfortably alongside larger controls (e.g. the segmented On/Off
   * toggle in the role permissions editor).
   */
  size?: "default" | "lg"
}

function Checkbox({ className, size = "default", ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size}
      className={cn(
        "peer relative flex shrink-0 items-center justify-center border border-border bg-transparent transition-shadow outline-none group-has-disabled/field:opacity-20 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-20 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary",
        size === "lg" ? "size-6 rounded-[7px]" : "size-4 rounded-[5px]",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className={cn(
          "grid place-content-center text-current transition-none",
          size === "lg" ? "[&>svg]:size-4" : "[&>svg]:size-3.5",
        )}
      >
        <CheckIcon strokeWidth={size === "lg" ? 2.5 : 2} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
