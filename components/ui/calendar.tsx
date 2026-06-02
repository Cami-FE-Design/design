"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * Themed wrapper around `react-day-picker`. Default to `mode="single"` from
 * the caller. Use inside a `<Popover>` (see `<DatePicker>`) or inline.
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("relative p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-3",
        month_caption: "flex justify-center items-center h-9 px-9",
        caption_label:
          "inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md hover:bg-muted/50 cursor-pointer",
        dropdowns: "flex items-center gap-1",
        dropdown_root: "relative inline-flex items-center",
        dropdown:
          "absolute inset-0 opacity-0 cursor-pointer w-full appearance-none border-0 bg-transparent",
        nav: "flex items-center gap-1 absolute inset-x-3 top-1 justify-between pointer-events-none [&>button]:pointer-events-auto",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon-xs" }),
          "size-7 bg-transparent p-0 opacity-60 hover:opacity-100",
        ),
        chevron: "size-3.5 text-muted-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-xs flex-1 text-center",
        week: "flex w-full mt-1",
        day: "h-9 w-9 text-center text-sm p-0 relative flex-1 focus-within:relative focus-within:z-20",
        day_button: cn(
          "size-9 mx-auto p-0 font-normal inline-flex items-center justify-center rounded-md transition-colors hover:bg-muted aria-selected:bg-foreground aria-selected:text-background aria-selected:hover:bg-foreground/90",
        ),
        today: "[&_button]:bg-accent [&_button]:text-accent-foreground",
        outside: "day-outside text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-30 pointer-events-none",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...rest }) =>
          orientation === "left" ? (
            <ChevronLeftIcon className="size-4" {...rest} />
          ) : (
            <ChevronRightIcon className="size-4" {...rest} />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
