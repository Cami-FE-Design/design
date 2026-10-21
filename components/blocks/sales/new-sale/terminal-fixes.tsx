import { terminalFixes } from "@/lib/terminals/status"
import type { TerminalStatus } from "@/lib/terminals/store"

/**
 * How to bring back a machine that can't take the sale (BUG-65), one line per
 * state on screen. Sits under the machines rather than on them: a tile has room
 * for "Signed out" and nothing more, and the fix is the same for every machine
 * in that state. Renders nothing while every machine is Ready.
 */
export function TerminalFixes({ statuses }: { statuses: readonly TerminalStatus[] }) {
  const fixes = terminalFixes(statuses)
  if (fixes.length === 0) return null
  return (
    <ul className="flex flex-col gap-1">
      {fixes.map((fix) => (
        <li key={fix} className="text-muted-foreground text-sm leading-5">
          {fix}
        </li>
      ))}
    </ul>
  )
}
