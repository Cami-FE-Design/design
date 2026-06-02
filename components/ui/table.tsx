import type * as React from "react"
import { cn } from "@/lib/utils"

type TableProps = React.ComponentProps<"table"> & {
  /**
   * Classes applied to the scrollable wrapper around the table. Pages that
   * need a sticky `<thead>` should pass `flex-1 min-h-0` (or similar) so the
   * wrapper becomes a real scroll context with a constrained height — sticky
   * positioning resolves against the nearest scroll ancestor, and the default
   * `overflow-x-auto` here already turns on the sticky context for both axes.
   */
  containerClassName?: string
}

function Table({ className, containerClassName, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-x-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        // Sticky by default — inert when the parent isn't a scroll context, so
        // adding it here doesn't affect tables that don't opt in. Pages enable
        // it by giving the Table a `containerClassName="flex-1 min-h-0"` so
        // the table-container becomes a real scroll ancestor.
        "[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background",
        // Top + bottom borders rendered via inset box-shadow so they stick
        // with the cell. A regular `<tr>` border under border-collapse:collapse
        // is owned by the adjacent body row and scrolls away with it, leaving
        // the sticky thead borderless and the body bleeding into the top edge.
        "[&_th]:shadow-[inset_0_1px_0_var(--color-border),inset_0_-1px_0_var(--color-border)]",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border bg-muted/30 font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border/60 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-4 text-left align-middle text-sm font-normal text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
