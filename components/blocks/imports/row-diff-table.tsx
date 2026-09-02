// Before → after table for one row's changes, inside the expanded preview row.
// Mirrors cami-business `RowDiffTable`. Money is rendered as AED, which the
// production component does not do (spec defect D18).

import { formatAed } from "@/lib/format"
import { fieldLabel } from "@/lib/imports/config"
import type { FieldChanges } from "@/lib/imports/types"

/** Money-valued fields get AED formatting; everything else prints as-is. */
const MONEY_FIELDS = new Set(["retailPrice", "supplyPrice"])

function renderValue(field: string, value: string | number | null): string {
  if (value === null || value === "") return "—"
  if (MONEY_FIELDS.has(field) && typeof value === "number") return formatAed(value)
  return String(value)
}

export function RowDiffTable({ changes }: { changes: FieldChanges }) {
  const entries = Object.entries(changes).filter(([, change]) => change != null)
  if (entries.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg border border-border/60">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="px-2.5 py-1.5 text-start font-medium">Field</th>
            <th className="px-2.5 py-1.5 text-start font-medium">Current</th>
            <th className="px-2.5 py-1.5 text-start font-medium">In your file</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([field, change]) => (
            <tr key={field} className="border-t border-border/40">
              <td className="px-2.5 py-1.5 font-medium text-foreground">{fieldLabel(field)}</td>
              <td className="px-2.5 py-1.5 text-muted-foreground line-through">
                {renderValue(field, change?.from ?? null)}
              </td>
              <td className="px-2.5 py-1.5 text-foreground">
                {renderValue(field, change?.to ?? null)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
