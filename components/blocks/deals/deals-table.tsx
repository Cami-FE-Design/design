"use client"

/**
 * Deals list — `DealsTable` on the dev repo's `promotion-discount-ui`.
 *
 * One bordered card per deal with a trailing Options menu, mirroring the
 * Locations settings list. Clicking the row body drills into the detail view.
 *
 * The one addition is on the date line: where the deal runs. A row that reads
 * "No locations" is a deal nobody can use, and it resolves to Inactive rather
 * than passing as chain-wide (R24).
 */

import { ArchiveIcon, ChevronDownIcon, CirclePercentIcon, CopyIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DEAL_TYPE_LABEL,
  type Deal,
  type DealStatus,
  formatDateRange,
  formatDealSummary,
  formatLocations,
  resolvedStatus,
} from "@/lib/deals/mock"
import { isRunnable } from "@/lib/locations/promotion-scope"
import { cn } from "@/lib/utils"

export const STATUS_BADGE: Record<
  DealStatus,
  { label: string; variant: "primary-soft" | "muted" | "destructive" }
> = {
  active: { label: "Active", variant: "primary-soft" },
  scheduled: { label: "Scheduled", variant: "muted" },
  inactive: { label: "Inactive", variant: "muted" },
  archived: { label: "Archived", variant: "destructive" },
}

export function formatMinor(minor: number): string {
  return `AED ${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function DealsTable({
  deals,
  todayIso,
  locationName,
  onSelect,
  onEdit,
  onSetStatus,
  onDuplicate,
}: {
  deals: Deal[]
  todayIso: string
  locationName: (id: string) => string
  onSelect: (id: string) => void
  /** Opens the wizard for this deal — distinct from `onSelect`, which drills in. */
  onEdit: (deal: Deal) => void
  onSetStatus: (id: string, status: DealStatus) => void
  onDuplicate: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-col gap-3 overflow-y-auto overscroll-contain">
      {deals.map((deal) => {
        const status = resolvedStatus(deal, todayIso)
        const badge = STATUS_BADGE[status]
        const runnable = isRunnable(deal.scope)
        return (
          <div
            key={deal.id}
            className="group flex shrink-0 items-center justify-between gap-4 rounded-2xl border border-border/60 p-4 transition-colors hover:bg-foreground/3"
          >
            <button
              type="button"
              onClick={() => onSelect(deal.id)}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-start"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground">
                <CirclePercentIcon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-semibold text-foreground text-sm">{deal.name}</span>
                <span className="truncate text-muted-foreground text-sm">
                  {DEAL_TYPE_LABEL[deal.type]}: {formatDealSummary(deal)}
                </span>
                <span className="truncate text-muted-foreground text-xs">
                  {formatDateRange(deal.startDate, deal.endDate)} ·{" "}
                  <span className={cn(!runnable && "font-medium text-cami-tomato-11")}>
                    {formatLocations(deal.scope, locationName)}
                  </span>
                </span>
              </div>
            </button>

            {/* Fixed widths, so the badge and the figure sit in one column down
                the list rather than shifting with each amount's length. */}
            <div className="flex w-24 shrink-0 justify-start">
              <Badge variant={badge.variant} className="h-6 rounded-full px-2.5">
                {badge.label}
              </Badge>
            </div>

            <div className="flex w-28 shrink-0 flex-col items-end leading-tight">
              <span className="text-muted-foreground text-xs">Total sales</span>
              <span className="font-semibold text-foreground text-sm tabular-nums">
                {formatMinor(deal.totalSalesMinor)}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  radius="full"
                  className="shrink-0"
                >
                  Options
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onSelect={() => onEdit(deal)}>
                  <PencilIcon className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDuplicate(deal.id)}>
                  <CopyIcon className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={() => onSetStatus(deal.id, "archived")}
                >
                  <ArchiveIcon className="size-4" />
                  Archive
                </DropdownMenuItem>
                {deal.status !== "archived" ? (
                  <>
                    <DropdownMenuSeparator />
                    {status === "active" ? (
                      <DropdownMenuItem onSelect={() => onSetStatus(deal.id, "inactive")}>
                        Deactivate
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onSelect={() => {
                          // Activating a deal that reaches nobody would store a
                          // row reading Active that no till will ever offer.
                          if (!runnable) {
                            toast.error("Select at least one location before activating this deal.")
                            return
                          }
                          onSetStatus(deal.id, "active")
                        }}
                      >
                        Activate
                      </DropdownMenuItem>
                    )}
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      })}
    </div>
  )
}
