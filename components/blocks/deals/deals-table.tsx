"use client"

/**
 * The deals list (DW3.4, R18, R24).
 *
 * ## A table, not the dev repo's card rows
 *
 * `DealsTable` on `promotion-discount-ui` draws one bordered card per deal with
 * the name, type, summary and dates stacked on the left. That was replicated
 * here and it was wrong for this repo twice over: no other list in it looks
 * like that — Packages, Products, Sales and Clients are all `<Table>` — and the
 * stack made every row a different height, so the status badge, the money and
 * the menu landed at a different vertical position on each one. Columns are
 * what make a list scannable; a reader compares Status down a column, not
 * across four cards.
 *
 * ## The column the built list has no source for
 *
 * **Locations.** Every deal the built product creates carries
 * `locationIds: []`, which its own mapper reads as every venue — so a
 * chain-wide offer and one nobody scoped are the same row there. Here "All
 * locations" and "3 locations" read differently because they *are* different:
 * the first survives a tenth branch opening, and "No locations — cannot run" is
 * the state R24 exists to stop being mistaken for the first.
 */

import {
  ArchiveIcon,
  CirclePercentIcon,
  CopyIcon,
  MoreHorizontalIcon,
  PencilIcon,
} from "lucide-react"

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DEAL_STATUS_LABEL,
  DEAL_TYPE_LABEL,
  type Deal,
  type DealStatus,
  dealAction,
  formatDateRange,
  formatDealSummaryShort,
  statusFor,
} from "@/lib/deals/mock"
import { describeScope, isRunnable, reaches } from "@/lib/locations/promotion-scope"
import type { Location } from "@/lib/locations/types"

const STATUS_VARIANT: Record<DealStatus, "primary-soft" | "outline" | "secondary"> = {
  active: "primary-soft",
  scheduled: "outline",
  inactive: "secondary",
  archived: "secondary",
}

function aed(minor: number): string {
  return `AED ${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
}

export function DealsTable({
  deals,
  todayIso,
  locationName,
  inScope,
  estateSize,
  isMultiLocation,
  onSelect,
  onEdit,
  onSetStatus,
  onDuplicate,
}: {
  deals: ReadonlyArray<Deal>
  todayIso: string
  locationName: (id: string) => string
  /** The branches this reader holds, narrowed by the switcher (R18). */
  inScope: ReadonlyArray<Location>
  /** How many branches the business has, for "of yours". */
  estateSize: number
  isMultiLocation: boolean
  onSelect: (id: string) => void
  onEdit: (deal: Deal) => void
  onSetStatus: (id: string, next: DealStatus) => void
  onDuplicate: (deal: Deal) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Six columns in a 1152px container, and the minimums added up to
              more than that — so the wrapper's overflow-x turned on and the
              dates wrapped onto two lines inside their own column. Deal takes
              whatever is left; every other column asks for what it needs and
              no more. */}
          <TableHead>Deal</TableHead>
          <TableHead className="min-w-24">Status</TableHead>
          <TableHead className="min-w-36">Runs</TableHead>
          {isMultiLocation ? <TableHead className="min-w-36">Locations</TableHead> : null}
          <TableHead className="min-w-28 text-right">Total sales</TableHead>
          <TableHead className="w-12">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {deals.map((deal) => {
          const runnable = isRunnable(deal.scope)
          // Never Active while it reaches nobody: "Active" beside "cannot run"
          // is the row contradicting itself, and an owner believes the badge.
          const resolved = runnable
            ? statusFor(deal.status, deal.startDate, deal.endDate, todayIso)
            : "inactive"
          const action = dealAction(resolved, runnable, deal.endDate, todayIso)
          const mine = reaches(deal.scope, inScope)
          return (
            <TableRow key={deal.id} className="cursor-pointer" onClick={() => onSelect(deal.id)}>
              {/* `max-w-0 w-full`, which is the only thing that makes
                  `truncate` work in an auto-layout table. `truncate` sets
                  white-space: nowrap, and a cell's intrinsic width is then the
                  whole unbroken string — so a seventy-character summary pushed
                  the table past its container and turned on a horizontal
                  scrollbar, while the text it was widening for never truncated.
                  Zeroing the max width lets the cell shrink; `w-full` makes it
                  take whatever the fixed columns leave. */}
              <TableCell className="w-full max-w-0">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cami-violet-3 text-cami-violet-11">
                    <CirclePercentIcon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground text-sm">{deal.name}</p>
                    <p className="truncate text-muted-foreground text-sm">
                      {DEAL_TYPE_LABEL[deal.type]} · {formatDealSummaryShort(deal)}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[resolved]} size="sm">
                  {DEAL_STATUS_LABEL[resolved]}
                </Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                {formatDateRange(deal.startDate, deal.endDate)}
              </TableCell>
              {isMultiLocation ? (
                <TableCell>
                  {runnable ? (
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-foreground text-sm">
                        {describeScope(deal.scope, locationName)}
                      </span>
                      {/* What it reaches OF YOURS. A manager holding one branch
                          is not told the chain-wide deal also runs at eight
                          others (R18). */}
                      {deal.scope.kind === "estate" && inScope.length < estateSize ? (
                        <span className="text-muted-foreground text-xs">
                          including {mine.length} of yours
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    // Said out loud, because the alternative reading — an empty
                    // list meaning everywhere — is the defect R24 prevents. Two
                    // lines, matching the column's shape above, rather than one
                    // long string wrapping mid-phrase.
                    <div className="flex min-w-0 flex-col">
                      <span className="text-cami-tomato-11 text-sm">No locations</span>
                      <span className="text-muted-foreground text-xs">cannot run</span>
                    </div>
                  )}
                </TableCell>
              ) : null}
              <TableCell className="whitespace-nowrap text-right text-foreground text-sm tabular-nums">
                {aed(deal.totalSalesMinor)}
              </TableCell>
              {/* Clicking the row opens the deal, so acting on it needs its own
                  way in — and the menu must not open the row underneath it. */}
              <TableCell className="w-12 text-right" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      radius="full"
                      aria-label={`Options for ${deal.name}`}
                    >
                      <MoreHorizontalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onSelect={() => onEdit(deal)}>
                      <PencilIcon className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onDuplicate(deal)}>
                      <CopyIcon className="size-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {action.kind === "restore" ? (
                      <DropdownMenuItem onSelect={() => onSetStatus(deal.id, "inactive")}>
                        Restore
                      </DropdownMenuItem>
                    ) : action.kind === "stop" ? (
                      <DropdownMenuItem onSelect={() => onSetStatus(deal.id, "inactive")}>
                        Deactivate
                      </DropdownMenuItem>
                    ) : action.kind === "activate" ? (
                      <DropdownMenuItem onSelect={() => onSetStatus(deal.id, "active")}>
                        Activate
                      </DropdownMenuItem>
                    ) : (
                      // Disabled WITH the reason. It read "its dates have
                      // passed" on a deal starting in a fortnight, because two
                      // different blockers shared one flag.
                      <DropdownMenuItem disabled>Activate · {action.reason}</DropdownMenuItem>
                    )}
                    {resolved !== "archived" ? (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => onSetStatus(deal.id, "archived")}
                      >
                        <ArchiveIcon className="size-4" />
                        Archive
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
