"use client"

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, CalendarClockIcon } from "lucide-react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Colour palette ─────────────────────────────────────────────────────────────
// The four swatches offered on the membership form's Appearance section. The
// chosen colour tints the calendar-clock tile on the listing + detail. Matches
// the team-member calendar-colour swatch family.

export type MembershipColorId = "violet" | "pink" | "yellow" | "green"

export const MEMBERSHIP_COLORS: Array<{ id: MembershipColorId; className: string }> = [
  { id: "violet", className: "bg-cami-violet-7" },
  { id: "pink", className: "bg-cami-pink-7" },
  { id: "yellow", className: "bg-cami-yellow-7" },
  { id: "green", className: "bg-cami-green-7" },
]

export function membershipColorClass(id: MembershipColorId): string {
  return MEMBERSHIP_COLORS.find((c) => c.id === id)?.className ?? MEMBERSHIP_COLORS[0].className
}

// ─── Types & mock data ──────────────────────────────────────────────────────────

export type Membership = {
  id: string
  name: string
  /** Count of services included in the membership. */
  serviceCount: number
  /** Validity window, e.g. "1 month", "1 year". */
  validFor: string
  /** Sessions allowance — a number (limited) or "Unlimited". */
  sessions: number | "unlimited"
  /** Price in business currency (AED). */
  price: number
  color: MembershipColorId
}

export const MOCK_MEMBERSHIPS: Membership[] = [
  {
    id: "m1",
    name: "Monthly Grooming Club",
    serviceCount: 3,
    validFor: "1 month",
    sessions: 4,
    price: 320,
    color: "green",
  },
  {
    id: "m2",
    name: "Puppy Spa Package",
    serviceCount: 2,
    validFor: "3 months",
    sessions: 6,
    price: 540,
    color: "violet",
  },
  {
    id: "m3",
    name: "Unlimited Bath & Brush",
    serviceCount: 1,
    validFor: "1 month",
    sessions: "unlimited",
    price: 280,
    color: "pink",
  },
  {
    id: "m4",
    name: "Annual Wellness Pass",
    serviceCount: 5,
    validFor: "1 year",
    sessions: 12,
    price: 1800,
    color: "yellow",
  },
  {
    id: "m5",
    name: "Nail Care Bundle",
    serviceCount: 2,
    validFor: "6 months",
    sessions: 8,
    price: 360,
    color: "violet",
  },
]

function formatPrice(amount: number) {
  return `AED ${amount.toLocaleString()}`
}

export function formatSessions(sessions: number | "unlimited"): string {
  if (sessions === "unlimited") return "Unlimited"
  return `${sessions} session${sessions === 1 ? "" : "s"}`
}

// ─── Sorting ────────────────────────────────────────────────────────────────────

type SortField = "name" | "price"
type SortDir = "asc" | "desc"

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField
  sortField: SortField | null
  sortDir: SortDir
}) {
  if (sortField !== field) return <ArrowUpDownIcon className="size-3.5 text-muted-foreground/50" />
  return sortDir === "asc" ? (
    <ArrowUpIcon className="size-3.5 text-foreground" />
  ) : (
    <ArrowDownIcon className="size-3.5 text-foreground" />
  )
}

// ─── Tile ───────────────────────────────────────────────────────────────────────

function MembershipTile({ color }: { color: MembershipColorId }) {
  return (
    <span
      className={cn(
        "flex size-12 shrink-0 items-center justify-center rounded-xl text-white",
        membershipColorClass(color),
      )}
    >
      <CalendarClockIcon className="size-5" strokeWidth={1.75} />
    </span>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

type MembershipsTableProps = {
  memberships: Membership[]
  onRowClick: (membershipId: string) => void
  /**
   * When provided, a checkbox column is rendered (select-all in the header,
   * one per row). Omit to render the table without selection.
   */
  selectedIds?: Set<string>
  onToggleSelect?: (id: string, next: boolean) => void
  /** Toggle every currently-visible row. `ids` are the rows shown in this table. */
  onToggleSelectAll?: (ids: string[], next: boolean) => void
}

export function MembershipsTable({
  memberships,
  onRowClick,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: MembershipsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = sortField
    ? [...memberships].sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1
        if (sortField === "name") return mul * a.name.localeCompare(b.name)
        return mul * (a.price - b.price)
      })
    : memberships

  // Selection is enabled only when the page passes a `selectedIds` set.
  const selectable = selectedIds !== undefined
  const visibleIds = sorted.map((m) => m.id)
  const selectedVisible = visibleIds.filter((id) => selectedIds?.has(id)).length
  const allChecked: boolean | "indeterminate" =
    selectedVisible === 0 ? false : selectedVisible === visibleIds.length ? true : "indeterminate"

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        No memberships match this filter.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 z-20! bg-background shadow-[1px_0_0_0_var(--border)] md:static md:bg-transparent md:shadow-none">
            <div className="flex items-center gap-3">
              {selectable ? (
                <Checkbox
                  checked={allChecked}
                  onCheckedChange={(c) => onToggleSelectAll?.(visibleIds, c === true)}
                  aria-label="Select all memberships"
                />
              ) : null}
              <button
                type="button"
                onClick={() => toggleSort("name")}
                className="flex items-center gap-1.5 font-medium hover:text-foreground"
              >
                Membership name
                <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
              </button>
            </div>
          </TableHead>
          <TableHead className="min-w-32">Valid for</TableHead>
          <TableHead className="min-w-32">Sessions</TableHead>
          <TableHead className="min-w-28 text-right">
            <button
              type="button"
              onClick={() => toggleSort("price")}
              className="ml-auto flex items-center gap-1.5 font-medium hover:text-foreground"
            >
              Price
              <SortIcon field="price" sortField={sortField} sortDir={sortDir} />
            </button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((membership) => (
          <TableRow
            key={membership.id}
            className="group cursor-pointer"
            onClick={() => onRowClick(membership.id)}
          >
            <TableCell className="sticky left-0 z-10 bg-background shadow-[1px_0_0_0_var(--border)] transition-colors group-hover:bg-[color-mix(in_oklch,var(--muted)_40%,var(--background))] md:static md:bg-transparent md:shadow-none md:group-hover:bg-transparent">
              <div className="flex items-center gap-3">
                {selectable ? (
                  <Checkbox
                    checked={selectedIds?.has(membership.id) ?? false}
                    // Stop the click bubbling to the row (which opens edit) so
                    // the checkbox only toggles selection.
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={(c) => onToggleSelect?.(membership.id, c === true)}
                    aria-label={`Select ${membership.name}`}
                  />
                ) : null}
                <MembershipTile color={membership.color} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{membership.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {membership.serviceCount} service{membership.serviceCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{membership.validFor}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatSessions(membership.sessions)}
            </TableCell>
            <TableCell className="text-right text-sm whitespace-nowrap text-foreground">
              {formatPrice(membership.price)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
