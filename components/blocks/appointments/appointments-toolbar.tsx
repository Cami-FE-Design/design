"use client"

import {
  CalendarIcon,
  CalendarOffIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  SlidersHorizontalIcon,
  TagIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type ViewMode = "day" | "3-day" | "week" | "month"

type AppointmentsToolbarProps = {
  /** ISO date string for the day being viewed. */
  date: string
  viewMode: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
  onPrev?: () => void
  onNext?: () => void
  onToday?: () => void
  onOpenFilters?: () => void
  /** Add menu — first item, "Appointment". */
  onNewBooking?: () => void
  onAddBlockedTime?: () => void
  onAddSale?: () => void
  onAddQuickPayment?: () => void
  /** Demo toggle: true = pet-business mode, false = generic appointments. Production app sets this per partner. */
  hasPets?: boolean
  onHasPetsChange?: (next: boolean) => void
  className?: string
}

const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  day: "Day",
  "3-day": "3 days",
  week: "Week",
  month: "Month",
}

export function AppointmentsToolbar({
  date,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onOpenFilters,
  onNewBooking,
  onAddBlockedTime,
  onAddSale,
  onAddQuickPayment,
  hasPets,
  onHasPetsChange,
  className,
}: AppointmentsToolbarProps) {
  return (
    <div
      data-slot="appointments-toolbar"
      className={cn("flex w-full items-center justify-between gap-3", className)}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-medium leading-8 text-foreground">{formatHeaderDate(date)}</h1>
        <div className="flex h-9 items-center divide-x divide-border overflow-hidden rounded-full border border-border bg-background">
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous day"
            className="flex h-full w-9 items-center justify-center text-foreground transition-colors hover:bg-muted [&_svg]:size-4"
          >
            <ChevronLeftIcon />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next day"
            className="flex h-full w-9 items-center justify-center text-foreground transition-colors hover:bg-muted [&_svg]:size-4"
          >
            <ChevronRightIcon />
          </button>
        </div>
        <Button variant="outline" size="sm" radius="full" onClick={onToday}>
          Today
        </Button>
      </div>
      <div className="flex items-center gap-1.5">
        {onHasPetsChange ? (
          <div className="mr-1 flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[11px]">
            <span id="pet-mode-label" className="font-medium text-muted-foreground">
              Pets
            </span>
            <Switch
              checked={hasPets ?? true}
              onCheckedChange={(next) => onHasPetsChange(next)}
              aria-labelledby="pet-mode-label"
            />
          </div>
        ) : null}
        <Button
          variant="outline"
          size="icon-sm"
          radius="full"
          onClick={onOpenFilters}
          aria-label="Filters"
        >
          <SlidersHorizontalIcon />
        </Button>
        <Select value={viewMode} onValueChange={(v) => onViewModeChange?.(v as ViewMode)}>
          <SelectTrigger className="h-9 w-auto gap-1.5 rounded-full border-border bg-background pr-2.5 pl-3 font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.entries(VIEW_MODE_LABELS) as Array<[ViewMode, string]>).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" radius="full" className="pr-2.5">
              Add
              <ChevronDownIcon className="opacity-80" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onNewBooking}>
              <CalendarIcon />
              Appointment
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddBlockedTime}>
              <CalendarOffIcon />
              Blocked time
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddSale}>
              <TagIcon />
              Sale
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onAddQuickPayment}>
              <CreditCardIcon />
              Quick payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

function formatHeaderDate(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}
