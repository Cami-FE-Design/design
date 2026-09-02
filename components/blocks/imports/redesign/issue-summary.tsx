"use client"

// The grouped issue summary — the core of the DSG-80 fix (defects D1–D4, D6).
//
// The as-built screen made an operator expand 17 rows one at a time to discover
// they all failed for the same reason. Here every cause is stated once, with its
// row count, the rows it hit, what it means, and what to do. Clicking a cause
// filters the table to exactly those rows.
//
// Tinted, borderless notice per the house style — no accent border.

import { AlertTriangleIcon, DownloadIcon, InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { REVIEW_COPY } from "@/lib/imports/copy"
import { describeRows, type IssueGroup } from "@/lib/imports/issues"
import { cn } from "@/lib/utils"

type Props = {
  groups: IssueGroup[]
  /** Blocking causes get the amber treatment and a download action. */
  severity: "blocking" | "advisory"
  title: string
  /** Row count for the blocking download action. */
  blockedRowCount?: number
  activeCode?: string | null
  onShowRows?: (group: IssueGroup) => void
  onDownloadFailed?: () => void
  /**
   * The Done step reuses this block after the table is gone, so there is nothing
   * left to filter — offering "Show these rows" there would be a dead control.
   */
  showRowAction?: boolean
}

export function IssueSummary({
  groups,
  severity,
  title,
  blockedRowCount = 0,
  activeCode,
  onShowRows,
  onDownloadFailed,
  showRowAction = true,
}: Props) {
  if (groups.length === 0) return null

  const isBlocking = severity === "blocking"
  const Icon = isBlocking ? AlertTriangleIcon : InfoIcon

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl p-4",
        isBlocking ? "bg-cami-yellow-2" : "bg-cami-sage-2",
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "mt-0.5 size-4 shrink-0",
            isBlocking ? "text-cami-yellow-11" : "text-cami-sage-12",
          )}
          strokeWidth={1.5}
        />
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>

      {/* Blocking and advisory causes are weighted differently on purpose. A
          blocked row costs the operator data, so it earns the row numbers, the
          explanation and the fix. An advisory only costs them a feature later,
          so it gets one line and a count — repeating the same row list under
          every advisory read as a bug even though the data was right. */}
      <div className={cn("flex flex-col ps-7", isBlocking ? "gap-3" : "gap-2.5")}>
        {groups.map((group, i) => (
          <div
            key={group.definition.code}
            className={cn(
              "flex flex-col gap-1",
              i > 0 &&
                (isBlocking ? "border-t border-black-a3 pt-3" : "border-t border-black-a3 pt-2.5"),
            )}
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <p className="text-sm font-medium text-foreground">{group.definition.title}</p>
              <span className="text-xs text-muted-foreground">
                {group.rowNumbers.length} {group.rowNumbers.length === 1 ? "row" : "rows"}
                {isBlocking ? ` · ${describeRows(group.rowNumbers)}` : ""}
              </span>
              {showRowAction && onShowRows && (
                <button
                  type="button"
                  onClick={() => onShowRows(group)}
                  className="cursor-pointer text-xs font-medium text-foreground underline decoration-black-a5 underline-offset-2 hover:decoration-current"
                >
                  {activeCode === group.definition.code
                    ? REVIEW_COPY.showAll
                    : REVIEW_COPY.showRows}
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{group.definition.detail}</p>
            {isBlocking && group.definition.fix && (
              <p className="text-sm text-foreground">{group.definition.fix}</p>
            )}
          </div>
        ))}
      </div>

      {isBlocking && blockedRowCount > 0 && onDownloadFailed && (
        <div className="ps-7">
          <Button variant="outline" size="sm" onClick={onDownloadFailed}>
            <DownloadIcon />
            {REVIEW_COPY.downloadFailed(blockedRowCount)}
          </Button>
        </div>
      )}
    </div>
  )
}
